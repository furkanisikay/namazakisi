/**
 * Hatirlatma penceresi olculeri (Faz 0).
 *
 * Bir vaktin "penceresi" girisi ile cikisi arasindaki suredir ve MEVSIME GORE
 * degisir: yatsi kisin ~11 saat, yaz aylarinda ~6 saat surer; imsak penceresi
 * ise cogu gun 1,5 saati bulmaz. Esik tavanini sabit 120 dk tutmak bu gercegi
 * yok sayiyordu — tavan artik buradan turetilir (bkz. `esikSinirlari.ts`).
 *
 * SAF: store'a, native'e ve `new Date()`'e bagimli DEGIL (tarihler disaridan verilir).
 */

const DAKIKA_MS = 60 * 1000;
const GUN_DK = 24 * 60;

/**
 * Pencere uzunlugu (dakika, asagi yuvarlanir).
 *
 * GECE YARISINI ASAN PENCERE: yatsi -> imsak gecisinde cikis tarihi girisin
 * ERTESI gunune duser. Cagiran mutlak tarihler verirse fark zaten dogrudur;
 * ekranin o gunku vakit tablosu gibi TEK GUNE ait degerler verilirse (yatsi
 * 21:15, imsak 05:15 ayni gun) fark negatif cikar ve sarma uygulanir — aksi
 * halde pencere 0 gorunur ve her adim "sigmiyor" diye isaretlenirdi.
 */
export function pencereUzunluguDkHesapla(giris: Date, cikis: Date): number {
  const girisMs = giris?.getTime?.();
  const cikisMs = cikis?.getTime?.();
  if (!Number.isFinite(girisMs) || !Number.isFinite(cikisMs)) return 0;

  const farkDk = Math.floor((cikisMs - girisMs) / DAKIKA_MS);
  if (farkDk > 0) return farkDk;

  const sarilmis = farkDk + GUN_DK;
  return sarilmis > 0 ? sarilmis : 0;
}

/**
 * Bu esik bugunku pencerede GERCEKTEN calisir mi?
 *
 * Esik pencereye esitse de sigmaz: uyari "vaktin cikmasina N dk kala" demektir,
 * N = pencere ise uyari vaktin GIRIS anina duser ve `seviyeTetiklenirMi`nin
 * `kalanDk >= 1` alt siniri yuzunden zaten hicbir sey planlanmaz.
 *
 * Pencere BILINMIYORSA (konum/vakit hesabi yok) `true` doner: yanlis alarm
 * vermektense sessiz kalmak dogrudur.
 */
export function adimPencereyeSigarMi(esikDk: number, pencereUzunluguDk?: number): boolean {
  if (!Number.isFinite(pencereUzunluguDk) || (pencereUzunluguDk as number) <= 0) return true;
  return esikDk < (pencereUzunluguDk as number);
}

/** Kullaniciya gosterilen sure metni: "6 sa 40 dk" / "2 sa" / "45 dk". */
export function pencereSuresiMetni(dk: number): string {
  const toplam = Number.isFinite(dk) && dk > 0 ? Math.floor(dk) : 0;
  const saat = Math.floor(toplam / 60);
  const dakika = toplam % 60;
  if (saat === 0) return `${dakika} dk`;
  if (dakika === 0) return `${saat} sa`;
  return `${saat} sa ${dakika} dk`;
}
