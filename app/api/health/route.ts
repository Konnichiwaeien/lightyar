import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
    // Identify the running build, not an independently replaceable PM2 env label.
    const release = (await readFile(join(process.cwd(), '.next', 'BUILD_ID'), 'utf8')).trim();
    return NextResponse.json({ status: 'ok', release }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
