/**
 * Base64 → bayt dizisi (SAF). Sözlük paketlerini açmak için: `atob` + ikili dize ara adımı
 * büyük pakette iki kopya üretir, burada doğrudan `Uint8Array`'e yazılır.
 */
const ALFABE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const DEGER = new Uint8Array(128);
for (let i = 0; i < ALFABE.length; i++) DEGER[ALFABE.charCodeAt(i)] = i;

export function base64Coz(metin: string): Uint8Array {
  let son = metin.length;
  while (son > 0 && metin.charCodeAt(son - 1) === 61 /* = */) son--;
  const cikti = new Uint8Array(Math.floor((son * 3) / 4));
  let j = 0;
  for (let i = 0; i < son; i += 4) {
    const a = DEGER[metin.charCodeAt(i)];
    const b = DEGER[metin.charCodeAt(i + 1)];
    const c = i + 2 < son ? DEGER[metin.charCodeAt(i + 2)] : 0;
    const d = i + 3 < son ? DEGER[metin.charCodeAt(i + 3)] : 0;
    cikti[j++] = (a << 2) | (b >> 4);
    if (i + 2 < son) cikti[j++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < son) cikti[j++] = ((c & 3) << 6) | d;
  }
  return cikti;
}
