/**
 * Kullanıcının KENDİ yazdığı sesli okuma metinleri — SAF.
 *
 * Hazır şablonlar dil değişince çözüm anında yeni dile çevrilir (`sablonuYerellestir`); elle
 * yazılmış metin ise yazıldığı dilde kalır ve yeni dilin ses motoru onu yanlış telaffuzla okur.
 * Sahip kararı: dil değişince BİR KEZ sorulur; kullanıcı isterse bu metinler yeni dilin ilk
 * hazır şablonuyla değiştirilir, istemezse dokunulmaz.
 *
 * Kayıtlar yüzeye göre farklı şekildedir (muhafız matrisi, nafile grupları, tek adım dizileri);
 * hepsinde metin `anonsMetni` alanındadır → ham JSON özyinelemeli dolaşılır. Muhafızın şablonu
 * yöne bağlıdır: en yakın üst nesnenin `yon` alanı okunur.
 */
import { hazirSablonMu, sablonlar, type SablonListesi } from './anonsSablonlari';
import type { DilKodu } from '../dil/diller';
import { aktifDil } from '../dil/aktifDil';

/** Sesli okuma metni taşıyan yüzeyler (depolama kaydı başına bir). */
export type AnonsYuzeyi = 'muhafiz' | 'nafile' | 'cuma' | 'camiyeGit' | 'yatis' | 'takvim';

/** Elle yazılmış (boş olmayan, hiçbir dilin hazır şablonu olmayan) metin mi? */
export const ozelAnonsMetniMi = (x: unknown): x is string =>
  typeof x === 'string' && x.trim() !== '' && !hazirSablonMu(x);

const nesneMi = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

/** Kayıttaki elle yazılmış metinlerin sayısı (bozuk/boş kayıt = 0). */
export function ozelAnonsSay(kayit: unknown): number {
  if (Array.isArray(kayit)) return kayit.reduce((t: number, x) => t + ozelAnonsSay(x), 0);
  if (!nesneMi(kayit)) return 0;
  let toplam = 0;
  for (const [anahtar, deger] of Object.entries(kayit)) {
    toplam += anahtar === 'anonsMetni' ? (ozelAnonsMetniMi(deger) ? 1 : 0) : ozelAnonsSay(deger);
  }
  return toplam;
}

function listeSec(yuzey: AnonsYuzeyi, yon: unknown): SablonListesi {
  if (yuzey === 'muhafiz') return yon === 'girisindenItibaren' ? 'muhafizGiris' : 'muhafizCikis';
  return yuzey;
}

/**
 * Elle yazılmış metinleri `dil`in o yüzeye (ve yöne) ait İLK hazır şablonuyla değiştirir.
 * Değişen bir şey yoksa AYNI referansı döndürür (gereksiz disk yazımı olmasın).
 */
export function ozelAnonslariSablonlaDegistir<T>(kayit: T, yuzey: AnonsYuzeyi, dil: DilKodu = aktifDil()): T {
  const dolas = (x: unknown, yon: unknown): unknown => {
    if (Array.isArray(x)) {
      let degisti = false;
      const yeni = x.map((o) => {
        const d = dolas(o, yon);
        if (d !== o) degisti = true;
        return d;
      });
      return degisti ? yeni : x;
    }
    if (!nesneMi(x)) return x;
    const altYon = 'yon' in x ? x.yon : yon;
    let yeni: Record<string, unknown> | null = null;
    for (const [anahtar, deger] of Object.entries(x)) {
      const d =
        anahtar === 'anonsMetni'
          ? ozelAnonsMetniMi(deger)
            ? (sablonlar(listeSec(yuzey, altYon), dil)[0] ?? deger)
            : deger
          : dolas(deger, altYon);
      if (d !== deger) {
        yeni ??= { ...x };
        yeni[anahtar] = d;
      }
    }
    return yeni ?? x;
  };
  return dolas(kayit, undefined) as T;
}
