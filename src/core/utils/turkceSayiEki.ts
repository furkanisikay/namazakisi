/**
 * Türkçe üçüncü tekil şahıs iyelik eki ("-I" grubu: ı/i/u/ü, gerekirse "s"
 * tamponu) sayının YAZILI rakamına değil OKUNUŞUNA göre seçilir.
 *
 * `Tesbih` erişim etiketi `"${n}'i tamamlandı"` sabit ekini kullanıyordu; bu
 * yalnız "on beş" (15) gibi ünsüzle biten ve son ünlüsü ince-düz olan
 * okunuşlarda doğrudur. "üç" (3) -> "'ü", "kırk" (40) -> "'ı", "yirmi" (20)
 * -> "'si" (okunuş ÜNLÜYLE bitiyor, "s" tamponu gerekir) olmalı.
 *
 * Yazılı rakamın kendisi ünsüz yumuşamasını YANSITMAZ (TDK kuralı): "4'ü"
 * yazılır, "dördü" gibi tabana sızan bir yazım yapılmaz. Bu yüzden fonksiyon
 * yalnız EKİ (ı/i/u/ü veya "s" tamponlu hali) döndürür, tabanı değil — bu da
 * ünsüz yumuşaması sorununu baştan ortadan kaldırır.
 *
 * Ek seçimi Türkçe harflerin çalışma-zamanı `toLowerCase`/`toLocaleLowerCase`
 * dönüşümüne DEĞİL, her sayı sözcüğü için elle doğrulanmış sabit bir haritaya
 * dayanır (bkz. `muhafizMetinYardimcisi.ts`'deki `toUpperCase` tuzağıyla aynı
 * gerekçe: motor/Intl'e bağımlı çalışma-zamanı dönüşümü yerine sabit harita).
 *
 * Kapsam: yalnız son basamağın (birler; birler sıfırsa onlar) Türkçe
 * okunuşuna bakar. Tam yüzün katları (100, 200…) basitleştirilmiş "yüz"
 * ekini kullanır — uygulamadaki en büyük değer 90 (bkz. `SERI_HEDEFLERI`)
 * olduğu için bu sınır pratikte hiç tetiklenmez.
 */

/** Birler basamağı (1-9) -> iyelik eki. */
const BIRLER_EKLERI: Record<number, string> = {
  1: 'i', // bir -> biri
  2: 'si', // iki -> ikisi (ünlüyle biter, "s" tamponu)
  3: 'ü', // üç -> üçü
  4: 'ü', // dört -> dördü (yazımda "4'ü")
  5: 'i', // beş -> beşi
  6: 'sı', // altı -> altısı (ünlüyle biter)
  7: 'si', // yedi -> yedisi (ünlüyle biter)
  8: 'i', // sekiz -> sekizi
  9: 'u', // dokuz -> dokuzu
};

/** Onlar basamağı (1-9, x10) -> iyelik eki. */
const ONLAR_EKLERI: Record<number, string> = {
  1: 'u', // on -> onu
  2: 'si', // yirmi -> yirmisi (ünlüyle biter)
  3: 'u', // otuz -> otuzu
  4: 'ı', // kırk -> kırkı
  5: 'si', // elli -> ellisi (ünlüyle biter)
  6: 'ı', // altmış -> altmışı
  7: 'i', // yetmiş -> yetmişi
  8: 'i', // seksen -> sekseni
  9: 'ı', // doksan -> doksanı
};

const SIFIR_EKI = 'ı'; // sıfır -> sıfırı
const YUZ_EKI = 'ü'; // yüz -> yüzü (tam yüz/bin katları için basitleştirilmiş varsayım, bkz. dosya başı)
const VARSAYILAN_EK = 'i'; // NaN/negatif gibi beklenmeyen girdide güvenli düşüş

/**
 * Verilen tamsayı için Türkçe iyelik ekini döndürür.
 *
 * Kullanım: `` `${n}'${turkceIyelikEki(n)}` `` -> "15'i", "3'ü", "40'ı", "20'si".
 */
export function turkceIyelikEki(n: number): string {
  if (!Number.isFinite(n)) {
    return VARSAYILAN_EK;
  }

  const mutlak = Math.trunc(Math.abs(n));
  if (mutlak === 0) {
    return SIFIR_EKI;
  }

  const birler = mutlak % 10;
  if (birler !== 0) {
    return BIRLER_EKLERI[birler];
  }

  const onlarBasamagi = Math.floor(mutlak / 10) % 10;
  if (onlarBasamagi !== 0) {
    return ONLAR_EKLERI[onlarBasamagi];
  }

  return YUZ_EKI;
}
