import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const DATA_FILE = path.join(PROJECT_ROOT, 'data', 'catalog-backup.json');

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function looksLikeHostedImageUrl(u) {
  if (!u || typeof u !== 'string') return false;
  const t = u.trim();
  if (!/^https?:\/\//i.test(t)) return false;
  if (/\.(png|jpe?g|webp|gif|svg|bmp)(\?[^#]*)?(#.*)?$/i.test(t)) return true;
  return /\/\/i\.ibb\.co\//i.test(t) || /\/\/i\.postimg\.cc\//i.test(t);
}

/** Primeira URL plausível num texto (evita apanhar lixo no fim). */
function firstCdnMatch(text, re) {
  const m = text.match(re);
  if (!m?.[0]) return null;
  return m[0].replace(/[)\].,;]+$/, '');
}

function extractHostedImageUrl(html) {
  if (!html || typeof html !== 'string') return null;

  // ImgBB / Postimages: o CDN directo aparece várias vezes — mais fiável que <meta> com ordem variável.
  const directCandidates = [
    firstCdnMatch(html, /https:\/\/i\.ibb\.co\/[^\s"'<>]+/i),
    firstCdnMatch(html, /https:\/\/i\.postimg\.cc\/[^\s"'<>]+/i),
  ].filter(Boolean);
  for (const c of directCandidates) {
    if (looksLikeHostedImageUrl(c)) return c;
  }

  const metaPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const pattern of metaPatterns) {
    const match = html.match(pattern);
    const candidate = match?.[1];
    if (candidate && /^https?:\/\//i.test(candidate) && looksLikeHostedImageUrl(candidate)) {
      return candidate;
    }
  }

  // JSON-LD (alguns hosts embutem a imagem aqui)
  const ldMatch = html.match(/"image"\s*:\s*"([^"]+)"/i);
  if (ldMatch?.[1] && looksLikeHostedImageUrl(ldMatch[1])) return ldMatch[1];

  // Imgur directo em página de album
  const imgur = firstCdnMatch(html, /https:\/\/i\.imgur\.com\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)/i);
  if (imgur) return imgur;

  return null;
}

async function handleResolveImageRequest(req, res) {
  try {
    const requestUrl = new URL(req.url || '', 'http://localhost');
    const pageUrl = requestUrl.searchParams.get('url')?.trim();
    if (!pageUrl) {
      return json(res, 400, { error: 'Parâmetro "url" em falta.' });
    }
    if (!/^https?:\/\//i.test(pageUrl)) {
      return json(res, 400, { error: 'Só URLs http/https são suportadas.' });
    }

    const upstream = await fetch(pageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,pt-BR,pt;q=0.8',
      },
      redirect: 'follow',
    });
    if (!upstream.ok) {
      return json(res, 502, { error: `Falha ao abrir a página (${upstream.status}).` });
    }

    const html = await upstream.text();
    const imageUrl = extractHostedImageUrl(html);
    if (!imageUrl) {
      return json(res, 422, { error: 'Não foi possível encontrar um link direto da imagem nesta página.' });
    }

    return json(res, 200, { ok: true, imageUrl });
  } catch (e) {
    return json(res, 500, { error: String(e.message || e) });
  }
}

function attachCatalogBackupMiddleware(server) {
  server.middlewares.use((req, res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url === '/__dev/image/resolve' || url === '/__dev/image/resolve/') {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
      }
      handleResolveImageRequest(req, res);
      return;
    }

    if (url !== '/__dev/catalog/backup' && url !== '/__dev/catalog/backup/') {
      return next();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method === 'GET') {
      try {
        if (!fs.existsSync(DATA_FILE)) {
          res.statusCode = 204;
          res.end();
          return;
        }
        const buf = fs.readFileSync(DATA_FILE, 'utf8');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(buf);
      } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (c) => {
        body += c;
      });
      req.on('end', () => {
        try {
          fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
          fs.writeFileSync(DATA_FILE, body, 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(e.message || e) }));
        }
      });
      return;
    }

    res.statusCode = 405;
    res.end();
  });
}

/**
 * GET/POST em `/__dev/catalog/backup` → `data/catalog-backup.json`
 * Disponível em `npm run dev` e `npm run preview` (mesma origem localhost:4173).
 */
export function catalogFilePersistPlugin() {
  return {
    name: 'catalog-file-persist',
    configureServer(server) {
      attachCatalogBackupMiddleware(server);
    },
    configurePreviewServer(server) {
      attachCatalogBackupMiddleware(server);
    },
  };
}
