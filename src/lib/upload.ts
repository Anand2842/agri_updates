
import { supabase } from './supabase';

export async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (uploadError) {
        throw new Error('Image upload failed: ' + uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return publicUrl;
}
