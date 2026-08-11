import type { Editor } from '@tiptap/core';

const MAX_IMAGE_BYTES = 5_242_880;

export async function insertImage(editor: Editor, file: File): Promise<void> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Gambar terlalu besar (maks 5MB)');
  }

  const sigRes = await fetch(
    '/api/admin/cloudinary-signature?folder=portfolio/projects/body&resource_type=image',
  );
  if (!sigRes.ok) {
    throw new Error('Gagal mengambil signature upload');
  }
  const sig = await sigRes.json();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!uploadRes.ok) {
    const errBody = await uploadRes.json().catch(() => null);
    throw new Error(errBody?.error?.message ?? 'Upload gambar ke Cloudinary gagal');
  }

  const uploaded = await uploadRes.json();
  editor.chain().focus().setImage({ src: uploaded.secure_url, alt: file.name }).run();
}
