/**
 * Redimensiona e recomprime uma imagem no proprio navegador, sem dependencia nova.
 * Usa createImageBitmap mais canvas, que ja existem no browser.
 *
 * Serve para o logo da empresa e, mais adiante, para a foto de anormalidade do
 * operador: foto de celular sai com 3 a 8 MB e precisa cair para algo tratavel
 * antes de subir por uma conexao de terminal portuario.
 */
export interface CompressedImage {
  blob: Blob;
  /** Sem o prefixo "data:image/jpeg;base64,". */
  base64: string;
  mime: string;
  bytes: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  { maxSide = 1280, quality = 0.7 }: { maxSide?: number; quality?: number } = {},
): Promise<CompressedImage> {
  // SVG e vetor: redesenhar em canvas rasteriza e piora. Passa direto.
  if (file.type === "image/svg+xml") {
    const base64 = await blobToBase64(file);
    return { blob: file, base64, mime: file.type, bytes: file.size, width: 0, height: 0 };
  }

  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * escala);
  const height = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Nao foi possivel processar a imagem neste navegador");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  // PNG preserva transparencia, que logo costuma ter. O resto vira JPEG.
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, mime === "image/jpeg" ? quality : undefined),
  );
  if (!blob) throw new Error("Nao foi possivel comprimir a imagem");

  return { blob, base64: await blobToBase64(blob), mime, bytes: blob.size, width, height };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(blob);
  });
}
