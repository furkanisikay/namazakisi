/**
 * Üretilmiş içerik paketini açar (SAF): base64 → zlib → JSON. Paketler `npm run dil:paketle`
 * ile üretilir (`scripts/dil/paketle.js`): sözlükler (`core/dil/paket/`) ve ayet havuzu
 * (`core/data/ayetPaketi/`).
 */
import { strFromU8, unzlibSync } from 'fflate';
import { base64Coz } from './base64';

export function paketiAc<T>(paket: string): T {
  return JSON.parse(strFromU8(unzlibSync(base64Coz(paket)))) as T;
}
