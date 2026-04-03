function isDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('/')) return true;
  if (/^https?:\/\/i\.ibb\.co\//i.test(u) || /^https?:\/\/i\.postimg\.cc\//i.test(u)) {
    return true;
  }
  return /^https?:\/\/.+\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(u);
}

function isSupportedHostedPage(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  return (
    /^https?:\/\/(www\.)?ibb\.co\//i.test(u) ||
    /^https?:\/\/(www\.)?postimg\.cc\//i.test(u) ||
    /^https?:\/\/(www\.)?imgur\.com\//i.test(u)
  );
}

export async function resolveHostedImageUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed || isDirectImageUrl(trimmed) || !isSupportedHostedPage(trimmed)) {
    return trimmed;
  }

  const res = await fetch(`/__dev/image/resolve?url=${encodeURIComponent(trimmed)}`, {
    method: 'GET',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.imageUrl) {
    const hint =
      res.status === 404
        ? ' O resolver só existe em `npm run dev` / `preview` local. Cole o link direto (ex.: https://i.ibb.co/…/ficheiro.png) em produção.'
        : '';
    throw new Error((data?.error || 'Não foi possível converter o link da página em link direto.') + hint);
  }
  return data.imageUrl;
}
