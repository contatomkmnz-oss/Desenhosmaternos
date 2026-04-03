# Bunny.net — hospedar vídeos no GospelFlix

Este app **não precisa de API key no navegador** para reproduzir. Basta guardar no episódio uma **URL pública** que o Bunny já expõe após o upload.

## O que o player aceita

| Tipo | Exemplo de URL | Como reproduz |
|------|----------------|---------------|
| **Bunny Stream — iframe** | `https://iframe.mediadelivery.net/embed/...` ou `...mediadelivery.net/...` | `<iframe>` (player oficial Bunny) |
| **CDN — MP4/WebM direto** | `https://vz-xxxxx.b-cdn.net/.../video.mp4` | `<video>` nativo |
| **CDN — HLS** | `.../playlist.m3u8` | `<video>` — **Safari ok**; Chrome/Firefox podem precisar de player HLS (use iframe ou MP4) |

Recomendação: para máxima compatibilidade em todos os browsers, use **URL do embed (iframe)** copiada do painel **Stream**, ou **MP4** no Pull Zone.

---

## Passo a passo (Bunny Stream)

1. Aceda a [bunny.net](https://bunny.net) e crie conta.
2. No menu, abra **Stream** (vídeo) e crie uma **Video Library** se ainda não existir.
3. Faça **upload** do ficheiro de vídeo (ou use FTP/API no servidor; isso é configurado no painel Bunny, não neste repositório).
4. Depois do processamento, abra o vídeo e procure:
   - **Embed URL** / **Player URL** — copie o link que começa por `https://iframe.mediadelivery.net/...` ou `https://...mediadelivery.net/...`
5. No GospelFlix: **Admin → Episódios** (ou equivalente) → campo **URL do vídeo** → cole essa URL.

Não cole a **API Key** nem **Library API Key** no front-end: essas chaves são para servidor e não devem ir para o `VITE_*` nem para o código público.

---

## Passo a passo (CDN / Pull Zone — ficheiro MP4 ou HLS)

1. No Bunny, crie um **Storage** (ou use Stream com saída CDN, conforme o teu plano).
2. Configure um **Pull Zone** (CDN) associado ao hostname tipo `https://vz-xxxxxx.b-cdn.net`.
3. O URL final do ficheiro será algo como:
   - `https://vz-xxxxxx.b-cdn.net/nome-do-ficheiro.mp4`
   - ou `.../playlist.m3u8` para HLS.
4. Cole esse URL no campo **URL do vídeo** do episódio.

O player deteta `b-cdn.net` / `bunnycdn.com` e usa o elemento `<video>`.

---

## CORS e domínio

Se o vídeo estiver num **Pull Zone** próprio e o browser bloquear, no painel Bunny verifique:

- **CORS** / **Allowed Origins** para incluir o teu domínio (ex.: `http://localhost:3000` em dev e o domínio de produção).

O **Stream iframe** costuma funcionar sem ajustes extra porque o conteúdo é servido no domínio do Bunny.

---

## Segurança (opcional, avançado)

- **Signed URLs / token authentication**: exige gerar links no **backend** com expiração. Este projeto em modo demo **não** inclui backend; para produção, implemente um endpoint que devolva URL assinada e guarde no episódio só o ID do vídeo ou um token curto.
- **DRM / geo block**: configurável no painel Stream; não é obrigatório para integração básica.

---

## Onde editar no projeto

- **Episódios (UI admin):** `src/pages/admin/AdminEpisodes.jsx` — campo `video_url`.
- **Lógica de reprodução:** `src/lib/videoEmbed.js` — função `getVideoEmbedUrl`.
- **Player:** `src/pages/Player.jsx` — iframe vs `<video>`.

---

## Teste rápido

1. Cola uma **Embed URL** do Stream num episódio.
2. Abre o player nesse episódio: deves ver o iframe do Bunny a carregar.

Se algo não reproduzir, abre as **DevTools → Console / Network** e confirma que o URL devolve **200** (não 403 por CORS ou token).
