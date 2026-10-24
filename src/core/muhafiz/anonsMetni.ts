import type { MuhafizVakti } from './matrisTipleri';
import type { PencereYonu } from './pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from './pencereTipleri';
import { canli, metin } from '../dil/aktifDil';
import { tr } from '../dil/sozluk/tr';
import { sablonlar, sablonuYerellestir } from '../hatirlatma/anonsSablonlari';

/** `{vakit}` yerine okunan ad, etkin dilde (sesli okuma motoru da etkin dilde konuşur). */
export const VAKIT_ADLARI_ANONS: Readonly<Record<MuhafizVakti, string>> = canli((s) => ({
  imsak: s.vakit.adlar.imsak,
  ogle: s.vakit.adlar.ogle,
  ikindi: s.vakit.adlar.ikindi,
  aksam: s.vakit.adlar.aksam,
  yatsi: s.vakit.adlar.yatsi,
}));

// Şablonlar vakit-agnostik ve "sen" dili (AGENTS.md muhafız istisnası).
//
// ÇIKIŞ havuzu — ölçü "vaktin çıkmasına kalan dakika". Bu diziler mevcut
// kullanıcıların hücrelerinde YAZILI duruyor (boş kutu bunlarla dolduruluyordu)
// → metinleri değiştirmek diskteki veriyi öksüz bırakır, BİREBİR korunur.
// TÜRKÇE kayıt (sözlük `anons.sablon.muhafizCikis`): diskteki eski veriyle eşleşme ve testler.
export const ANONS_SABLONLARI: readonly string[] = tr.anons.sablon.muhafizCikis;

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
export const ANONS_SABLONLARI_GIRIS: readonly string[] = tr.anons.sablon.muhafizGiris;

/** Yönün hazır metin havuzu, ETKİN dilde. Verilmezse çıkış (tarihsel davranış). */
export function anonsSablonlari(yon: PencereYonu = VARSAYILAN_PENCERE_YONU): string[] {
  return [...sablonlar(yon === 'girisindenItibaren' ? 'muhafizGiris' : 'muhafizCikis')];
}

/** BOŞ anons kutusunu dolduran şablon (tek kaynak — üç çağıran da buradan alır). */
export function varsayilanAnonsMetni(yon: PencereYonu = VARSAYILAN_PENCERE_YONU): string {
  return anonsSablonlari(yon)[0];
}

/** `{yön}` yer tutucusunun karşılığı — metnin tek yöne-bağımlı sözcüğü (etkin dilde). */
const metinYon = (yon: PencereYonu): string => metin().anons.yon[yon];

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
  // Hazır şablon (herhangi bir dilde) etkin dile çevrilir; kullanıcının yazdığı metin aynen.
  const yerel = sablonuYerellestir(sablon);
  const cumle = yerel
    .split('{vakit}').join(VAKIT_ADLARI_ANONS[vakit])
    .split('{süre}').join(String(olcuDk)) // dil-haric: yer tutucu jetonu
    .split('{yön}').join(metinYon(yon)); // dil-haric: yer tutucu jetonu
  // Bilinmeyen `{…}` (yazım hatası, başka yüzeyden taşınan metin) BOŞA indirgenir — TTS
  // "süslü parantez" okumasın; ek yüzeylerin `anonsCoz`'uyla aynı kural. Temizlik YALNIZ
  // bilinmeyen yer tutucu varken yapılır: bilinenleri taşıyan metinler birebir aynı kalır
  // (kayıt-oynat). Sonuç boşsa muhafız SESSİZ kalır (bilinçli).
  if (!/\{[^{}]*\}/.test(cumle)) return cumle;
  return cumle
    .replace(/\{[^{}]*\}/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([.,;:!?])/g, '$1')
    .trim();
}
