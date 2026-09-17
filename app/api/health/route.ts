import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const base = process.env.STRAPI_API_URL;
  const token = process.env.STRAPI_READ_TOKEN || process.env.REST_API_KEY;
  if (!base || !token) return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}/news?fields[0]=documentId&pagination[pageSize]=1&status=published`, {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error('CMS unavailable');
    const body = await response.json();
    if (!Array.isArray(body.data)) throw new Error('Invalid CMS response');
    return NextResponse.json({ status: 'ok', release: process.env.LIGHTYAR_RELEASE || 'local' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
