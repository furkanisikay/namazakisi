/**
 * Diyanet (Türkiye) hesap parametreleri — varsayılan profil.
 *
 * Uygulamanın her yeri vakitleri `aktifPrayerTimes(koordinat, gün)` ile hesaplar
 * (`core/vakit/aktifHesap.ts`): etkin ayar dokunulmamış Diyanet ise parametre
 * BURADAN gelir, değilse ülke profilinden (`hesapProfilleri.ts`). Parametreyi
 * yerinde `CalculationMethod.Turkey()` ile kurma; Diyanet profili de bu fonksiyonu
 * kullanır, ikiz kopyalar ayrışmasın.
 *
 * İKİNDİ = ASR-I EVVEL (gölge 1×). Diyanet takvimi ikindiyi asr-ı evvelle verir
 * (DİYK: "Diyanet İşleri Başkanlığı takviminde asr-ı evvel uygulaması esas
 * alınmaktadır." — kaynak notu:
 * `docs/superpowers/specs/2026-10-14-ikindi-vakti-asr-i-evvel-kaynak.md`).
 * adhan'da bunun karşılığı `Madhab.Shafi`'dir ve `CalculationMethod.Turkey()`'nin
 * VARSAYILANIDIR. Diyanet profilinde Hanefî asr-ı sânî (`Madhab.Hanafi`, gölge 2×) KULLANILMAZ:
 * "Hanefî kullanıcı için Hanefî mezhebi" sezgisiyle değiştirmek ikindiyi ~40-45 dk
 * sonraya kaydırır, uygulama Diyanet takviminden ve camideki ezandan ayrışır.
 * Nöbetçiler: `hesapParametreleri.test.ts`, `GunesVaktiHesaplama.test.ts` ve
 * TV paritesi (`TvVakitParitesi.test.ts` ↔ `tv/.../VakitHesabi.kt`, fikstür
 * asr-ı evvelle üretildi — madhab değişirse kırılır).
 *
 * SAF: React/expo import ETMEZ. Her çağrı YENİ bir nesne döndürür (adhan
 * parametre nesnesi değiştirilebilir; paylaşılan tek örnek bir çağıranın
 * değişikliğini ötekilere sızdırırdı).
 */
import { CalculationMethod, type CalculationParameters } from 'adhan';

export function turkiyeHesapParametreleri(): CalculationParameters {
    // Madhab bilinçli olarak YAZILMAZ: Turkey() varsayılanı zaten Shafi (asr-ı evvel).
    // Açıkça yazmak, adhan'ı Madhab'sız mock'layan testleri kırardı; doğruluk
    // nöbetçi testte gerçek adhan ile ölçülür.
    return CalculationMethod.Turkey();
}
