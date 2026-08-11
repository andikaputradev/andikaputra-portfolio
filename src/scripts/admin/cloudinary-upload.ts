interface CloudinaryUploadFieldConfig {
  fileInputId: string;
  hiddenInputId: string;
  statusId: string;
  folder: string;
  resourceType: 'image' | 'raw';
  maxSizeBytes: number;
  allowedMimeTypes?: string[];
  formatHiddenInputId?: string;
}

interface SignatureResponse {
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: string;
  apiKey: string;
  cloudName: string;
}

export function initCloudinaryUploadField(config: CloudinaryUploadFieldConfig): void {
  const fileInput = document.getElementById(config.fileInputId) as HTMLInputElement | null;
  const hiddenInput = document.getElementById(config.hiddenInputId) as HTMLInputElement | null;
  const status = document.getElementById(config.statusId);
  if (!fileInput || !hiddenInput || !status) return;

  const formatInput = config.formatHiddenInputId
    ? (document.getElementById(config.formatHiddenInputId) as HTMLInputElement | null)
    : null;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    if (config.allowedMimeTypes && !config.allowedMimeTypes.includes(file.type)) {
      status.textContent = `Tipe file tidak didukung (${file.type || 'tidak dikenali'})`;
      fileInput.value = '';
      return;
    }

    if (file.size > config.maxSizeBytes) {
      status.textContent = `File terlalu besar (maks ${Math.round(config.maxSizeBytes / 1_048_576)}MB)`;
      fileInput.value = '';
      return;
    }

    void uploadFile(file, config, hiddenInput, status, formatInput);
  });
}

async function uploadFile(
  file: File,
  config: CloudinaryUploadFieldConfig,
  hiddenInput: HTMLInputElement,
  status: Element,
  formatInput: HTMLInputElement | null,
): Promise<void> {
  status.textContent = 'Mengunggah…';

  try {
    const sigRes = await fetch(
      `/api/admin/cloudinary-signature?folder=${encodeURIComponent(config.folder)}&resource_type=${config.resourceType}`,
    );
    if (!sigRes.ok) throw new Error('Gagal mengambil signature upload');
    const sig: SignatureResponse = await sigRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/${config.resourceType}/upload`,
      { method: 'POST', body: formData },
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.json().catch(() => null);
      throw new Error(errBody?.error?.message ?? 'Upload ke Cloudinary gagal');
    }

    const result = await uploadRes.json();
    hiddenInput.value = result.public_id;
    if (formatInput) formatInput.value = result.format ?? '';
    status.textContent = `Berhasil: ${result.public_id}`;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Upload gagal';
    hiddenInput.value = '';
    if (formatInput) formatInput.value = '';
  }
}
