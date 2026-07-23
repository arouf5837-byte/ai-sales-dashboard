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

    // Server-side client_id retrieval
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
      name, name_bn, description, category, price, sale_price,
      sizes, colors, stock_qty, is_active, image_url, image, video, meta_ad_ids
    } = body;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
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
        meta_ad_ids: meta_ad_ids || [],
        client_id: clientUser.client_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting product:', error);
      return NextResponse.json({ error: 'Could not create product' }, { status: 500 });
    }

    // Generate merged text for embedding
    const mergedText = `Product ID: ${product.id} | Name: ${name || ''} | Bangla Name: ${name_bn || ''} | Description: ${description || ''} | Category: ${category || ''} | Price: ${price || ''} | Sale Price: ${sale_price || ''} | Sizes: ${(sizes || []).join(', ')} | Colors: ${(colors || []).join(', ')} | Ad IDs: ${(meta_ad_ids || []).join(', ')}`;

    // Trigger n8n webhook asynchronously
    regenerateEmbedding({
      table: 'products',
      recordId: product.id,
      clientId: clientUser.client_id,
      mergedText
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
