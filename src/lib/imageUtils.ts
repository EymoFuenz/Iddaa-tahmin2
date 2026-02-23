/** 2MB = 2 * 1024 * 1024 */
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

/**
 * Resmi 2MB altına düşürür: gerekirse boyut ve kalite azaltılır, base64 data URL döner.
 */
export function resizeImageToMaxSize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size <= MAX_SIZE_BYTES) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Dosya okunamadı'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      let quality = 0.9;

      const tryEncode = (): string | null => {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        const sizeBytes = base64 ? Math.ceil((base64.length * 3) / 4) : 0;
        return sizeBytes <= MAX_SIZE_BYTES ? dataUrl : null;
      };

      let result = tryEncode();
      while (!result && (width > 100 || height > 100 || quality > 0.2)) {
        if (quality > 0.3) {
          quality -= 0.1;
        } else {
          width = Math.max(100, Math.floor(width * 0.85));
          height = Math.max(100, Math.floor(height * 0.85));
          quality = 0.85;
        }
        result = tryEncode();
      }

      if (result) resolve(result);
      else reject(new Error('Resim 2MB altına düşürülemedi.'));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Resim yüklenemedi'));
    };

    img.src = url;
  });
}
