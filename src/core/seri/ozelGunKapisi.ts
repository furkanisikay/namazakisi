/**
 * Ozel gun KAPISI — "bu tarih ozel gun mu?" sorusunun TEK cevabi (issue #272).
 *
 * Iki tuketici ailesi ayni kapidan gecer:
 *   - seri motoru (`SeriHesaplayiciServisi.ozelGunAktifMi` buraya delege eder):
 *     ozel gunde seri DONDURULUR;
 *   - namaz hatirlatmalari (muhafiz on plan + arka plan + TTS anons, vakit girdi
 *     bildirimi, vakit sayaci, nafile, seri sayaci): ozel gunde PLANLANMAZ.
 * Ikisi ayrisirsa kullanici "seri dondu ama hatirlatma geliyor" (ya da tersini)
 * yasar — bu yuzden kural burada, saf ve tek yerde.
 *
 * KAPSAM: yalniz `aktifOzelGun` ve yalniz `ozelGunModuAktif === true` iken.
 * `gecmisKayitlar` BILINCLI olarak sayilmaz: `ozelGunBitir` aktif kaydi bitis
 * tarihi KISALTILMADAN gecmise tasir; gecmis kayitlar sayilsaydi ozel gunu erken
 * bitiren kullanicinin hatirlatmalari, kendi elleriyle bitirdigi araligin sonuna
 * kadar SUSMAYA DEVAM ederdi. (Takvim haritasi gecmisi gosterir: o ayri bir soru,
 * bkz. `ozelGunKumesi`.)
 *
 * Tarih karsilastirmasi DIZE uzerindendir (`YYYY-MM-DD` sozluk sirasi = takvim
 * sirasi) — `new Date('YYYY-MM-DD')` UTC olarak ayrisir ve negatif saat
 * diliminde bir gun kayar (AGENTS.md).
 */

/** `ozelGunKumesi.OzelGunAraligi` ile yapisal olarak ayni (store'a bagli degil). */
export interface OzelGunKapisiAraligi {
  baslangicTarihi: string;
  bitisTarihi: string;
}

/** `OzelGunAyarlari`nin kapinin okudugu alt kumesi (yapisal uyum yeter). */
export interface OzelGunKapisiGirdisi {
  ozelGunModuAktif: boolean;
  aktifOzelGun: OzelGunKapisiAraligi | null;
}

const ISO_GUN = /^(\d{4}-\d{2}-\d{2})/;

/** Dizenin bastaki `YYYY-MM-DD` kismini dondurur; yoksa null. */
function isoGunAl(deger: unknown): string | null {
  if (typeof deger !== 'string') return null;
  const eslesme = ISO_GUN.exec(deger);
  return eslesme ? eslesme[1] : null;
}

/**
 * `tarih` (YYYY-MM-DD) ozel gun araliginda mi?
 *
 * Bozuk/eksik girdi, ters aralik veya gecersiz tarih → `false` (hatirlatmalar
 * CALISMAYA DEVAM eder): bir depolama bozuklugu yuzunden kullaniciyi sessizce
 * susturmaktansa eski davranisi korumak yeglenir.
 */
export function ozelGunAktifMi(
  tarih: string,
  ayarlar: OzelGunKapisiGirdisi | null | undefined
): boolean {
  if (!ayarlar || ayarlar.ozelGunModuAktif !== true || !ayarlar.aktifOzelGun) {
    return false;
  }

  const gun = isoGunAl(tarih);
  const baslangic = isoGunAl(ayarlar.aktifOzelGun.baslangicTarihi);
  const bitis = isoGunAl(ayarlar.aktifOzelGun.bitisTarihi);
  if (!gun || !baslangic || !bitis) return false;

  return gun >= baslangic && gun <= bitis;
}

/**
 * Diskten gelen HAM degeri (JSON.parse sonucu) kapi girdisine cevirir.
 * Nesne-disi (`null`, sayi, dize) ya da alanlari bozuk deger → `null`
 * (kapi kapali = hatirlatmalar calisir). ASLA firlatmaz.
 */
export function ozelGunKapisiGirdisiniCoz(ham: unknown): OzelGunKapisiGirdisi | null {
  if (!ham || typeof ham !== 'object') return null;
  const kayit = ham as Record<string, unknown>;
  if (kayit.ozelGunModuAktif !== true) {
    return { ozelGunModuAktif: false, aktifOzelGun: null };
  }

  const aktif = kayit.aktifOzelGun as Record<string, unknown> | null | undefined;
  if (
    !aktif ||
    typeof aktif !== 'object' ||
    typeof aktif.baslangicTarihi !== 'string' ||
    typeof aktif.bitisTarihi !== 'string'
  ) {
    return { ozelGunModuAktif: true, aktifOzelGun: null };
  }

  return {
    ozelGunModuAktif: true,
    aktifOzelGun: {
      baslangicTarihi: aktif.baslangicTarihi,
      bitisTarihi: aktif.bitisTarihi,
    },
  };
}
