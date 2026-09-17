export const MAX_GIFT_FILE_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_GIFT_FILE_BYTES + 64 * 1024;

export async function readGiftForm(request: Request): Promise<FormData> {
  if (Number(request.headers.get('content-length')) > MAX_REQUEST_BYTES) throw new Error('TOO_LARGE');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('EMPTY_BODY');
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) { await reader.cancel(); throw new Error('TOO_LARGE'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData();
}

export async function validGiftFile(file: File): Promise<boolean> {
  if (!file.size || file.size > MAX_GIFT_FILE_BYTES) return false;
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...b.slice(start, end));
  switch (file.type) {
    case 'image/jpeg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/png': return b.slice(0,8).join(',') === '137,80,78,71,13,10,26,10';
    case 'image/webp': return ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP';
    case 'application/pdf': return ascii(0,5) === '%PDF-';
    default: return false;
  }
}
