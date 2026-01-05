
import { supabase } from './supabase';

export async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('blog-assets')
        .upload(filePath, file);

    if (error) {
        throw new Error('Image upload failed: ' + error.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('blog-assets')
        .getPublicUrl(filePath);

    return publicUrl;
}
