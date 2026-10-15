/**
 * Cihazlar arası eşitleme (issue #288) — parola ve türetilmiş anahtarın cihazdaki yeri.
 *
 * Parola güvenli depoda saklanır (kullanıcı her açılışta girmesin) ve türetilmiş anahtar
 * KDF parametreleriyle birlikte ÖNBELLEKLENİR: scrypt telefonda saniyeler sürer
 * (`anahtarTuretme.ts` gerekçesi), 15 dk'lık arka plan görevinin ~30 sn'lik bütçesinde
 * çalıştırılamaz. Önbellek yalnız AYNI tuz + parametrelerle eşleşir; başka bir cihaz
 * eşitlemeyi sıfırlayıp yeni tuzla yazdıysa türetme gerekir ve arka planda ERTELENİR
 * (`ertelendi`) — uygulama açıldığında ön planda yapılır.
 *
 * Parola unutulursa kurtarma YOKTUR: geliştirici anahtarı bilmez, bulutta yalnız şifreli
 * veri durur. Ekran bunu açıkça söyler.
 */

import naclUtil from 'tweetnacl-util';
import { GuvenliDepo } from '../../data/local/GuvenliDepo';
import {
  KdfParametreleri,
  anahtarTuret,
  kdfAyniMi,
  kdfGecerliMi,
} from '../../core/esitleme/anahtarTuretme';

const PAROLA_ANAHTARI = 'namaz_esitleme_parola';
const ANAHTAR_ONBELLEGI = 'namaz_esitleme_anahtar';

interface AnahtarKaydi {
  kdf: KdfParametreleri;
  /** base64 */
  anahtar: string;
}

/** `anahtarAl` sonucu. */
export type AnahtarSonucu =
  | { tur: 'hazir'; anahtar: Uint8Array; kdf: KdfParametreleri }
  | { tur: 'parolaYok' }
  /** Türetme gerekiyordu ama çağıran izin vermedi (arka plan). */
  | { tur: 'ertelendi' };

const kaydiOku = async (): Promise<AnahtarKaydi | null> => {
  const ham = await GuvenliDepo.oku(ANAHTAR_ONBELLEGI);
  if (!ham) return null;
  try {
    const kayit = JSON.parse(ham) as Partial<AnahtarKaydi>;
    if (!kdfGecerliMi(kayit?.kdf) || typeof kayit.anahtar !== 'string') return null;
    const anahtar = naclUtil.decodeBase64(kayit.anahtar);
    return anahtar.length === 32 ? { kdf: kayit.kdf, anahtar: kayit.anahtar } : null;
  } catch {
    return null;
  }
};

export const EsitlemeAnahtarDeposu = {
  /** Parolayı ve o parametrelerle türetilmiş anahtarı birlikte kaydeder. */
  async kaydet(parola: string, kdf: KdfParametreleri, anahtar: Uint8Array): Promise<void> {
    await GuvenliDepo.yaz(PAROLA_ANAHTARI, parola);
    const kayit: AnahtarKaydi = { kdf, anahtar: naclUtil.encodeBase64(anahtar) };
    await GuvenliDepo.yaz(ANAHTAR_ONBELLEGI, JSON.stringify(kayit));
  },

  async parolaVarMi(): Promise<boolean> {
    return (await GuvenliDepo.oku(PAROLA_ANAHTARI)) !== null;
  },

  /**
   * Anahtarı verir. `kdf` verilmezse önbellekteki (son kullanılan) parametreler.
   * Önbellek uyuşmazsa paroladan türetir — yalnız `turetebilir` ise.
   */
  async anahtarAl(kdf: KdfParametreleri | null, turetebilir: boolean): Promise<AnahtarSonucu> {
    const kayit = await kaydiOku();
    if (kayit && (kdf === null || kdfAyniMi(kayit.kdf, kdf))) {
      return { tur: 'hazir', anahtar: naclUtil.decodeBase64(kayit.anahtar), kdf: kayit.kdf };
    }
    const parola = await GuvenliDepo.oku(PAROLA_ANAHTARI);
    const hedef = kdf ?? kayit?.kdf ?? null;
    if (!parola || !hedef) return { tur: 'parolaYok' };
    if (!turetebilir) return { tur: 'ertelendi' };
    const anahtar = await anahtarTuret(parola, hedef);
    await EsitlemeAnahtarDeposu.kaydet(parola, hedef, anahtar);
    return { tur: 'hazir', anahtar, kdf: hedef };
  },

  async temizle(): Promise<void> {
    await GuvenliDepo.sil(PAROLA_ANAHTARI);
    await GuvenliDepo.sil(ANAHTAR_ONBELLEGI);
  },
};
