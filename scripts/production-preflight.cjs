const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd(), false);
const required = ['STRAPI_API_URL', 'NEXT_PUBLIC_SITE_URL'];
for (const key of required) {
  if (!process.env[key] || process.env[key] === 'tobemodified') throw new Error(`Configure ${key}`);
}
if (!(process.env.STRAPI_READ_TOKEN || process.env.REST_API_KEY)) throw new Error('Configure STRAPI_READ_TOKEN');
const site = new URL(process.env.NEXT_PUBLIC_SITE_URL);
if (site.protocol !== 'https:' || /localhost|127\.0\.0\.1|example\./.test(site.hostname)) throw new Error('Configure a real HTTPS site URL');
if (process.env.GIFT_ORDERS_ENABLED === 'true' && !process.env.STRAPI_GIFT_WRITE_TOKEN) throw new Error('Configure dedicated gift token before enabling gifts');
console.log('Production environment preflight passed');
