/**
 * Converte ficheiros de imagem em data URLs adequadas ao localStorage (evita strings gigantes).
 */

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error ?? new Error('Leitura do ficheiro falhou'));
    reader.readAsDataURL(file);
  });
}

async function compressRasterToJpeg(file, maxW = 1280, maxH = 1920, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    if (w > maxW || h > maxH) {
      const r = Math.min(maxW / w, maxH / h);
      w = Math.round(w * r);
      h = Math.round(h * r);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    bitmap.close();
  }
}

/**
 * SVG e GIF mantêm-se como estão; restantes raster são redimensionados e JPEG para caber no storage.
 */
export async function fileToStorableDataUrl(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('O ficheiro não é uma imagem.');
  }
  if (file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }
  if (file.type === 'image/gif') {
    return readFileAsDataUrl(file);
  }
  try {
    return await compressRasterToJpeg(file);
  } catch {
    return readFileAsDataUrl(file);
  }
}
