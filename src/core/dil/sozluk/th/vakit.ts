// Tay yazısında büyük/küçük harf yok: `buyuk` ve `kucuk` `adlar` ile aynı yazılır.
import type { Sozluk } from '../tr';

/**
 * Tayca terim kararları (kaynak: `scratchpad/w4/dalga9-terimler.md` > Tayca; QuranEnc `thai_rwwad`;
 * Tayland Şeyhülislamlık Ofisi 2569 vakit tablosu; IslamHouse Tayca kategori adları):
 * - Namaz ละหมาด / การละหมาด (meal, Şeyhülislamlık, IslamHouse); ซอลาฮ์ KULLANILMAZ.
 * - Vakitler resmî tablodan: ซุบฮ์ · ซูรูก · ดุฮ์ริ · อัสร์ · มักริบ · อีซา. Çizelge satırı
 *   (`imsakVakti`) de fecir adı ซุบฮ์. ซูรูก namaz vakti değil, güneş doğuşu işaretidir.
 * - Cuma ญุมอัต (IslamHouse "คุฏบะฮฺญุมอัต"); cümlede "ละหมาดวันศุกร์" (Vikipedi, meal 62:9).
 * - Arapça transkripsiyonda TEK işaret sistemi: thanthakhat ( ์ ), resmî tablo ve meal gibi
 *   (อัลลอฮ์, ร็อกอะฮ์, อิกอมะฮ์); IslamHouse'un phinthu ( ฺ ) yazımı ( ฮฺ → ฮ์ ) çevrildi.
 * - Kıble กิบลัต (Vikipedi), cami มัสยิด (meal), ezan อะซาน, abdest อาบน้ำละหมาด, Allah อัลลอฮ์,
 *   Kur'an อัลกุรอาน (meal), rekât ร็อกอะฮ์ (IslamHouse ร็อกอะฮฺ).
 * - Nafile ละหมาดสุนัต (IslamHouse); kuşluk ละหมาดฎุฮา, teheccüd ละหมาดตะฮัจญุด, vitir วิติร,
 *   evvâbîn เอาวาบีน (IslamHouse "อัลเอาวาบีน"), teravih ตะรอวีห์, Ramazan เราะมะฎอน.
 * - Kaza "ละหมาดชดใช้" (betimleyici; kaynakta kaza namazı adı bulunamadı, DOĞRULANMADI; IslamHouse
 *   "เกาะฎออ์" kader konusudur, kullanılmaz). Kaza Defteri "สมุดละหมาดชดใช้".
 * - "Kıldım" ฉันละหมาดแล้ว (bildirim düğmesi kısa: ละหมาดแล้ว), "Kılındı" ละหมาดแล้ว — türetildi.
 *   "Allah kabul etsin" ขออัลลอฮ์ทรงตอบรับ (IslamHouse "ขออัลลอฮฺทรงตอบรับ" kalıbı).
 * - Kerahat vakti เวลาที่ห้ามละหมาด (IslamHouse "การละหมาดที่ต้องห้าม"). Seferîlik การเดินทาง,
 *   kasr ย่อละหมาด (meal 4:101), cem รวมละหมาด. Hanefî หะนะฟีย์, Şâfiî ชาฟิอีย์ (IslamHouse).
 * - Seri ความต่อเนื่อง, Namaz Muhafızı ผู้พิทักษ์ละหมาด, hesap yöntemi วิธีคำนวณ.
 * Hitap: arayüz คุณ yalnız gerektiğinde (çoğu zaman zamirsiz), kibar istek โปรด…, ครับ/ค่ะ YOK,
 * kullanıcı ağzından ฉัน. İbadete çağrı kısa emir: "จงดำรงการละหมาด" (17:78, zamirsiz) / "ไปละหมาด";
 * mealin เจ้า zamiri taşınmaz. Sözcükler arası boşluk yok, boşluk ifade ayırıcısıdır; cümle sonu nokta yok.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'ซุบฮ์', gunes: 'ซูรูก', ogle: 'ดุฮ์ริ', ikindi: 'อัสร์', aksam: 'มักริบ', yatsi: 'อีซา' },
  buyuk: { imsak: 'ซุบฮ์', gunes: 'ซูรูก', ogle: 'ดุฮ์ริ', ikindi: 'อัสร์', aksam: 'มักริบ', yatsi: 'อีซา' },
  kucuk: { imsak: 'ซุบฮ์', gunes: 'ซูรูก', ogle: 'ดุฮ์ริ', ikindi: 'อัสร์', aksam: 'มักริบ', yatsi: 'อีซา' },
  imsakVakti: 'ซุบฮ์',
  cuma: 'ญุมอัต',
  cumaKucuk: 'ญุมอัต',
  gunesDogusu: 'ซูรูก',
  gunesDogusuKucuk: 'ซูรูก',
  durum: { kilindi: 'ละหมาดแล้ว', vaktiGeldi: 'ถึงเวลาละหมาด', girmedi: 'ยังไม่ถึงเวลา', gecti: 'ไม่ได้ละหมาด' },
  durumKucuk: { kilindi: 'ละหมาดแล้ว', vaktiGeldi: 'ถึงเวลาละหมาด', girmedi: 'ยังไม่ถึงเวลา', gecti: 'ไม่ได้ละหมาด' },
  eylem: { kildim: 'ฉันละหมาดแล้ว', kilindi: 'ละหมาดแล้ว' },
  kerahatVakti: 'เวลาที่ห้ามละหมาด',
  isaretle: 'ทำเครื่องหมายว่าละหมาดแล้ว',
  geriAlEtiketi: '{durum} แตะเพื่อยกเลิก',
  geriAlindi: 'ยกเลิกเครื่องหมายแล้ว',
};
