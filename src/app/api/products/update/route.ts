import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { regenerateEmbedding } from '@/lib/regenerateEmbedding';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userReq = await supabase.auth.getUser();
    
    if (!userReq.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: clientUser, error: clientError } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', userReq.data.user.id)
      .single();

    if (clientError || !clientUser?.client_id) {
      return NextResponse.json({ error: 'User does not belong to any client.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      id, name, name_bn, description, category, price, sale_price,
      sizes, colors, stock_qty, is_active, image_url, image, video, meta_ad_ids
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    // Verify ownership/client_id before update, and get old media to detect deletions
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('client_id, image, video')
      .eq('id', id)
      .single();

    if (fetchError || existingProduct.client_id !== clientUser.client_id) {
      return NextResponse.json({ error: 'Unauthorized to update this product' }, { status: 403 });
    }

    // Detect deleted media
    const deletedImages = (existingProduct.image || []).filter((oldUrl: string) => !(image || []).includes(oldUrl));
    const deletedVideos = (existingProduct.video || []).filter((oldUrl: string) => !(video || []).includes(oldUrl));
    const deletedUrls = [...deletedImages, ...deletedVideos];

    if (deletedUrls.length > 0) {
      const filenames = deletedUrls.map(url => url.split('/').pop()).filter(Boolean) as string[];
      if (filenames.length > 0) {
        // Fire and forget delete, we don't want to block the update if this fails
        supabase.storage.from('products').remove(filenames).then(({ error }) => {
          if (error) console.error('Error removing files from storage:', error);
        });
      }
    }

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name, name_bn, description, category, 
        price: parseFloat(price) || null, 
        sale_price: parseFloat(sale_price) || null,
        sizes: sizes || [], 
        colors: colors || [], 
        stock_qty: parseInt(stock_qty) || 0,
        is_active, 
        image_url,
        image: image || [],
        video: video || [],
        meta_ad_ids: meta_ad_ids || []
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Could not update product' }, { status: 500 });
    }

    // Generate merged text for embedding
    const mergedText = `Product ID: ${product.id} | Name: ${product.name || ''} | Bangla Name: ${product.name_bn || ''} | Description: ${product.description || ''} | Category: ${product.category || ''} | Price: ${product.price || ''} | Sale Price: ${product.sale_price || ''} | Sizes: ${(product.sizes || []).join(', ')} | Colors: ${(product.colors || []).join(', ')} | Ad IDs: ${(product.meta_ad_ids || []).join(', ')}`;

    regenerateEmbedding({
      table: 'products',
      recordId: product.id,
      clientId: clientUser.client_id,
      mergedText
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
