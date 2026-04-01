const MAX_SIZE_MB = 5;
const MAX_DIMENSION = 400; // mantém base64 menor para caber no Firestore (1MB)
const JPEG_QUALITY = 0.8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validatePhoto(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WebP.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Arquivo muito grande. Máximo ${MAX_SIZE_MB} MB.`;
  }
  return null;
}

function resizeImage(
  file: File,
  maxDim: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = (h * maxDim) / w;
          w = maxDim;
        } else {
          w = (w * maxDim) / h;
          h = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas não disponível"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Conversão falhou"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Erro ao carregar imagem"));
    };
  });
}

export async function fileToBase64(file: File): Promise<string> {
  const resized = await resizeImage(file, MAX_DIMENSION, JPEG_QUALITY);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erro ao converter para base64"));
    reader.readAsDataURL(resized);
  });
}
