// n8n Code node: "Clean & normalize" (mode: Run Once for All Items)
//
// Input : 1 item from the HTML node, holding parallel arrays { name[], price[], url[], image[] }
// Output: 1 item per product, { name, imageUrl, externalLink }, ready for POST /api/v1/products
//
// Notes:
// - The n8n sandbox has no global URL class, so links are fixed with plain string handling.
// - Only the first name.length entries are used: extra links and images come from other carousels.

const data = $input.all()[0].json;
const BASE = 'https://www.amazon.com.br';

// Turn "/x/dp/ABC", "//host/x" or "http://..." into a full https URL
const toHttps = (u) => {
  u = String(u ?? '').trim();
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  if (u.startsWith('/')) return BASE + u;
  return u.replace(/^http:\/\//i, 'https://');
};

// Clean Amazon link: https://www.amazon.com.br/dp/8535947183
const productLink = (u) => {
  const m = String(u ?? '').match(/\/dp\/([A-Z0-9]{10})/i);
  return m ? `${BASE}/dp/${m[1]}` : toHttps(u);
};

return data.name
  .map((name, i) => ({
    name: String(name).trim(),
    imageUrl: toHttps(data.image[i]),
    externalLink: productLink(data.url[i]),
  }))
  .filter(p => p.name && p.imageUrl.startsWith('https://') && p.externalLink.startsWith('https://'))
  .map(p => ({ json: p }));
