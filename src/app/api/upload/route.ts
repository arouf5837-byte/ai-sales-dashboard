import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const userReq = await supabase.auth.getUser();
    
    if (!userReq.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}. Only images and videos are allowed.` }, { status: 400 });
      }

      // Validate size (10MB for images, 50MB for videos)
      const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File too large: ${file.name}. Max size is ${isImage ? '10MB' : '50MB'}.` }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      urls.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
