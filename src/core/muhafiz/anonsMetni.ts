import type { MuhafizVakti } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';

export const VAKIT_ADLARI_ANONS: Record<MuhafizVakti, string> = {
  imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı',
};

// Şablonlar vakit-agnostik ve "sen" dili (AGENTS.md muhafız istisnası).
//
// ÇIKIŞ havuzu — ölçü "vaktin çıkmasına kalan dakika". Bu diziler mevcut
// kullanıcıların hücrelerinde YAZILI duruyor (boş kutu bunlarla dolduruluyordu)
// → metinleri değiştirmek diskteki veriyi öksüz bırakır, BİREBİR korunur.
export const ANONS_SABLONLARI: string[] = [
  '{vakit} vakti çıkıyor, son {süre} dakika.',
  '{vakit} namazını kaçırma, {süre} dakika kaldı.',
  'Vakit daralıyor, {vakit} namazına {süre} dakika.',
];

/**
 * GİRİŞ havuzu — ölçü "vaktin girişinden geçen dakika".
 *
 * NEDEN AYRI HAVUZ: çıkış dili giriş yönünde yalnız garip değil YANLIŞ olur —
 * vakit yeni girmişken "vakti çıkıyor, son 42 dakika" denir. Fıkhen de dikkatli:
 * kişi namazı terk etmiş değil geciktirmiştir, bu yüzden dil "geciktirme /
 * namaza dur" ekseninde kalır (AGENTS.md: terk etme ≠ geciktirme).
 *
 * ÇIKIŞ HAVUZUYLA İNDEKS İNDEKS EŞLENİR — `yonDegisimindeMetniCevir` çeviriyi
 * bu eşlemeden okur. Bir havuza şablon eklerken DİĞERİNE de aynı indekste ekle.
 */
export const ANONS_SABLONLARI_GIRIS: string[] = [
  '{vakit} vakti girdi, {süre} dakika geçti.',
  '{vakit} namazını geciktirme, üzerinden {süre} dakika geçti.',
  'Vakit ilerliyor, {vakit} namazına dur, {süre} dakika oldu.',
];

/** Yönün hazır metin havuzu. Verilmezse çıkış (tarihsel davranış). */
export function anonsSablonlari(yon: PencereYonu = VARSAYILAN_PENCERE_YONU): string[] {
  return yon === 'girisindenItibaren' ? ANONS_SABLONLARI_GIRIS : ANONS_SABLONLARI;
}

/** BOŞ anons kutusunu dolduran şablon (tek kaynak — üç çağıran da buradan alır). */
export function varsayilanAnonsMetni(yon: PencereYonu = VARSAYILAN_PENCERE_YONU): string {
  return anonsSablonlari(yon)[0];
}

/** `{yön}` yer tutucusunun karşılığı — metnin tek yöne-bağımlı sözcüğü. */
const YON_IFADESI: Record<PencereYonu, string> = {
  cikisaDogru: 'kaldı',
  girisindenItibaren: 'geçti',
};

/**
 * Şablonu okunabilir metne çevirir.
 *
 * `olcuDk` seviyeyi KAZANDIRAN ölçüdür (`UyariPlani.olcuDk`), zamanlama için
 * kullanılan `kalanDk` DEĞİL: giriş yönünde ikisi farklıdır ve `kalanDk`
 * verilirse "son 42 dakika" gibi ters bir cümle okunur.
 *
 * `{yön}` yön-nötr metin yazmayı mümkün kılar: "…{süre} dakika {yön}." hem
 * çıkışta ("kaldı") hem girişte ("geçti") doğru okunur, yön değiştiğinde
 * çevrilmesi de gerekmez.
 */
export function anonsMetniniCoz(
  sablon: string,
  vakit: MuhafizVakti,
  olcuDk: number,
  yon: PencereYonu = VARSAYILAN_PENCERE_YONU
): string {
  return sablon
    .split('{vakit}').join(VAKIT_ADLARI_ANONS[vakit])
    .split('{süre}').join(String(olcuDk))
    .split('{yön}').join(YON_IFADESI[yon]);
}
