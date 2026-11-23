/**
 * APK imza denetimi (güvenlik denetimi 2026-11): sertifika APK'nın KENDİ imza bloğundan okunur
 * ve depodaki debug anahtarıyla karşılaştırılır. Debug imzalı ya da okunamayan APK yayınlanmaz.
 */
import * as crypto from 'crypto';

const { apkSertifikaParmakIzleri, pemParmakIzi, imzaKarari } = require('../../scripts/apk-imza-denetimi.js') as {
  apkSertifikaParmakIzleri: (apk: Buffer) => string[];
  pemParmakIzi: (pem: string) => string | null;
  imzaKarari: (apkIzleri: string[], debugIzi: string | null) => 0 | 3 | 4;
};

const u32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
};
const u64 = (n: number) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n));
  return b;
};
/** Uzunluk önekli alan. */
const lp = (...parcalar: Buffer[]) => {
  const govde = Buffer.concat(parcalar);
  return Buffer.concat([u32(govde.length), govde]);
};
const sha = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');

/** Tek imzacılı şema bloğu değeri: imzacılar → imzacı → imzalı veri → (özetler, sertifikalar). */
const semaDegeri = (sertifikalar: Buffer[]) =>
  lp(lp(lp(lp(/* özetler */), lp(...sertifikalar.map((s) => lp(s)))), lp(/* imzalar */), lp(/* açık anahtar */)));

/** Asgari APK iskeleti: [içerik][imza bloğu][merkez dizin][EOCD]. */
function sahteApk(ciftler: { kimlik: number; deger: Buffer }[], secenek: { sihir?: string } = {}): Buffer {
  const icerik = Buffer.from('PK\x03\x04sahte-girdi');
  const govde = Buffer.concat(ciftler.map((c) => Buffer.concat([u64(4 + c.deger.length), u32(c.kimlik), c.deger])));
  const boyut = govde.length + 8 + 16;
  const blok = Buffer.concat([u64(boyut), govde, u64(boyut), Buffer.from(secenek.sihir ?? 'APK Sig Block 42', 'latin1')]);
  const merkezDizin = Buffer.from('PK\x01\x02merkez');
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt32LE(merkezDizin.length, 12);
  eocd.writeUInt32LE(icerik.length + blok.length, 16);
  return Buffer.concat([icerik, blok, merkezDizin, eocd]);
}

const V2 = 0x7109871a;
const V3 = 0xf05368c0;
const DOLGU = 0x42726577;

describe('apkSertifikaParmakIzleri', () => {
  const sertifika = Buffer.from('sertifika-A-der-baytlari');
  const baska = Buffer.from('sertifika-B-der-baytlari');

  it('v2 bloğundaki sertifikanın SHA-256 parmak izini verir', () => {
    expect(apkSertifikaParmakIzleri(sahteApk([{ kimlik: V2, deger: semaDegeri([sertifika]) }]))).toEqual([sha(sertifika)]);
  });

  it('bilinmeyen çiftleri (dolgu) atlar, v2 + v3 aynı sertifikayı bir kez sayar', () => {
    const apk = sahteApk([
      { kimlik: DOLGU, deger: Buffer.alloc(40) },
      { kimlik: V2, deger: semaDegeri([sertifika]) },
      { kimlik: V3, deger: semaDegeri([sertifika, baska]) },
    ]);
    expect(apkSertifikaParmakIzleri(apk).sort()).toEqual([sha(sertifika), sha(baska)].sort());
  });

  it('imza bloğu yoksa, sihir tutmuyorsa ya da dosya APK değilse boş döner (doğrulanamadı)', () => {
    expect(apkSertifikaParmakIzleri(sahteApk([{ kimlik: V2, deger: semaDegeri([sertifika]) }], { sihir: 'APK Sig Block 41' }))).toEqual([]);
    expect(apkSertifikaParmakIzleri(Buffer.from('{"name":"paket"}'))).toEqual([]);
    expect(apkSertifikaParmakIzleri(Buffer.alloc(0))).toEqual([]);
  });

  it('bozuk (taşan uzunluklu) şema değeri fırlatmaz, boş döner', () => {
    const bozuk = Buffer.concat([u32(0xffffff), Buffer.from('kisa')]);
    expect(apkSertifikaParmakIzleri(sahteApk([{ kimlik: V2, deger: bozuk }]))).toEqual([]);
  });
});

describe('pemParmakIzi', () => {
  it('PEM gövdesinin (DER) SHA-256 parmak izini verir', () => {
    const der = Buffer.from('der-icerik-ornegi');
    const pem = `-----BEGIN CERTIFICATE-----\n${der.toString('base64')}\n-----END CERTIFICATE-----\n`;
    expect(pemParmakIzi(pem)).toBe(sha(der));
  });

  it('sertifika yoksa null', () => {
    expect(pemParmakIzi('keytool error: java.lang.Exception')).toBeNull();
    expect(pemParmakIzi('')).toBeNull();
  });
});

describe('imzaKarari', () => {
  const debug = 'aa'.repeat(32);
  const yayin = 'bb'.repeat(32);

  it('debug anahtarıyla imzalı APK yayınlanmaz (3)', () => {
    expect(imzaKarari([debug], debug)).toBe(3);
    // Soy kaydında debug anahtarı geçen APK da debug sayılır.
    expect(imzaKarari([yayin, debug], debug)).toBe(3);
  });

  it('yalnız başka sertifikayla imzalıysa yayınlanabilir (0)', () => {
    expect(imzaKarari([yayin], debug)).toBe(0);
  });

  it('herhangi bir taraf okunamadıysa doğrulanamadı (4) — güvenli yön yayınlamamaktır', () => {
    expect(imzaKarari([], debug)).toBe(4);
    expect(imzaKarari([yayin], null)).toBe(4);
    expect(imzaKarari([], null)).toBe(4);
  });
});
