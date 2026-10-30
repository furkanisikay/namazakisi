/**
 * Android kısayol ve otomasyon eklentisi etiketleri: başlatıcı ve Tasker/MacroDroid bunları
 * TELEFONUN diliyle (uygulama dili değil) `android/app/src/main/res/values[-xx]`'ten çözer.
 * Otomasyon rehberi kullanıcının o ekranlarda gördüğü adı aynen yazar. Kaynak dizini olmayan
 * cihaz dili Android'de varsayılan `values/`'e (Türkçe) düşer; burada da öyle.
 * Nöbetçi: `__tests__/nativeEtiketler.test.ts` (her `values-*` dizini bu tabloyla birebir).
 */
import type { DilKodu } from '../dil/diller';

export type NativeEtiket = { kisayol: string; olay: string; kosul: string; eylem: string };

export const NATIVE_ETIKETLER: { tr: NativeEtiket } & Partial<Record<DilKodu, NativeEtiket>> = {
  tr: {
    kisayol: 'Şu anki vakti kıldım', // dil-haric: kimlik (native etiket, values/)
    olay: 'Namaz Akışı: Vakit olayı', // dil-haric: kimlik (native etiket, values/)
    kosul: 'Namaz Akışı: Vakit durumu', // dil-haric: kimlik (native etiket, values/)
    eylem: 'Namaz Akışı: Kıldım', // dil-haric: kimlik (native etiket, values/)
  },
  en: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  id: {
    kisayol: 'Sudah salat untuk waktu saat ini',
    olay: 'Namaz Akışı: Peristiwa waktu salat', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status waktu salat', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Sudah salat', // dil-haric: marka adı (native etiket)
  },
  de: {
    kisayol: 'Ich habe gebetet',
    olay: 'Namaz Akışı: Ereignis zur Gebetszeit', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status der Gebetszeit', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Ich habe gebetet', // dil-haric: marka adı (native etiket)
  },
  fr: {
    kisayol: 'J’ai prié la prière en cours',
    olay: 'Namaz Akışı : événement de l’heure de prière', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı : état de l’heure de prière', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı : J’ai prié', // dil-haric: marka adı (native etiket)
  },
  bs: {
    kisayol: 'Klanjano: trenutni vakat',
    olay: 'Namaz Akışı: Događaj vakta', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Stanje vakta', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Klanjano', // dil-haric: marka adı (native etiket)
  },
  ru: {
    kisayol: 'Текущий намаз совершён',
    olay: 'Namaz Akışı: Событие времени намаза', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Состояние времени намаза', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Намаз совершён', // dil-haric: marka adı (native etiket)
  },
  ms: {
    kisayol: 'Sudah solat waktu semasa',
    olay: 'Namaz Akışı: Peristiwa waktu solat', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status waktu solat', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Sudah solat', // dil-haric: marka adı (native etiket)
  },
  ar: {
    kisayol: 'صلّيتُ الصلاة الحالية',
    olay: 'Namaz Akışı: حدث وقت الصلاة', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: حالة وقت الصلاة', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: صلّيتُ', // dil-haric: marka adı (native etiket)
  },
  ur: {
    kisayol: 'موجودہ نماز پڑھ لی',
    olay: 'Namaz Akışı: نماز کے وقت کا واقعہ', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: نماز کے وقت کی حالت', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: نماز پڑھ لی', // dil-haric: marka adı (native etiket)
  },
  es: {
    kisayol: 'Ya recé el rezo actual',
    olay: 'Namaz Akışı: Evento de la hora del rezo', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Estado de la hora del rezo', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Ya recé', // dil-haric: marka adı (native etiket)
  },
  nl: {
    kisayol: 'Het huidige gebed is gebeden',
    olay: 'Namaz Akışı: Gebeurtenis bij gebedstijd', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status van de gebedstijd', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Gebeden', // dil-haric: marka adı (native etiket)
  },
  sq: {
    kisayol: 'E fala vaktin aktual',
    olay: 'Namaz Akışı: Ngjarje e vaktit', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Gjendja e vaktit', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: E fala', // dil-haric: marka adı (native etiket)
  },
  hi: {
    kisayol: 'मौजूदा नमाज़ पढ़ ली',
    olay: 'Namaz Akışı: नमाज़ के वक़्त की घटना', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: नमाज़ के वक़्त की हालत', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: नमाज़ पढ़ ली', // dil-haric: marka adı (native etiket)
  },
  bn: {
    kisayol: 'বর্তমান নামাজ পড়েছি',
    olay: 'Namaz Akışı: নামাজের ওয়াক্তের ঘটনা', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: নামাজের ওয়াক্তের অবস্থা', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: নামাজ পড়েছি', // dil-haric: marka adı (native etiket)
  },
  fa: {
    kisayol: 'نماز کنونی را خواندم',
    olay: 'Namaz Akışı: رویداد وقت نماز', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: وضعیت وقت نماز', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: خواندم', // dil-haric: marka adı (native etiket)
  },
  ps: {
    kisayol: 'اوسنی لمونځ مې وکړ',
    olay: 'Namaz Akışı: د وخت پېښه', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: د وخت حالت', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: لمونځ مې وکړ', // dil-haric: marka adı (native etiket)
  },
  ckb: {
    kisayol: 'نوێژی ئێستام کرد',
    olay: 'Namaz Akışı: ڕووداوی کاتی نوێژ', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: دۆخی کاتی نوێژ', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: نوێژم کرد', // dil-haric: marka adı (native etiket)
  },
  ug: {
    kisayol: 'ھازىرقى ۋاقىتنى ئوقۇدۇم',
    olay: 'Namaz Akışı: ناماز ۋاقتى ھادىسىسى', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: ناماز ۋاقتى ھالىتى', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ناماز ئوقۇدۇم', // dil-haric: marka adı (native etiket)
  },
  az: {
    kisayol: 'Hazırkı vaxtı qıldım', // dil-haric: Azerice native etiket (values-az)
    olay: 'Namaz Akışı: Vaxt hadisəsi', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Vaxt vəziyyəti', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Qıldım', // dil-haric: marka adı (native etiket)
  },
  // uz — values-uz LATİN (Android kaynakları Latin; docs/ajan/coklu-dil.md > Alfabe)
  uz: {
    kisayol: 'Joriy namozni oʻqidim',
    olay: 'Namaz Akışı: Namoz vaqti hodisasi', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Namoz vaqti holati', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Oʻqidim', // dil-haric: marka adı (native etiket)
  },
  kk: {
    kisayol: 'Қазіргі намазды оқыдым',
    olay: 'Namaz Akışı: Намаз уақыты оқиғасы', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Намаз уақытының күйі', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Оқыдым', // dil-haric: marka adı (native etiket)
  },
  ky: {
    kisayol: 'Азыркы намазды окудум',
    olay: 'Namaz Akışı: Намаз убактысынын окуясы', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Намаз убактысынын абалы', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Окудум', // dil-haric: marka adı (native etiket)
  },
  tg: {
    kisayol: 'Намози ҷориро хондам',
    olay: 'Namaz Akışı: Ҳодисаи вақти намоз', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Ҳолати вақти намоз', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Хондам', // dil-haric: marka adı (native etiket)
  },
  sw: {
    kisayol: 'Nimeswali Swala ya sasa',
    olay: 'Namaz Akışı: Tukio la wakati wa Swala', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Hali ya wakati wa Swala', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nimeswali', // dil-haric: marka adı (native etiket)
  },
  ha: {
    kisayol: 'Na yi sallar yanzu',
    olay: 'Namaz Akışı: Abin lokacin salla', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Halin lokacin salla', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Na yi salla', // dil-haric: marka adı (native etiket)
  },
  am: {
    kisayol: 'የአሁኑን ሶላት ሰገድኩ',
    olay: 'Namaz Akışı፦ የሶላት ሰዓት ክስተት', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı፦ የሶላት ሰዓት ሁኔታ', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı፦ ሰገድኩ', // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: om — values-om İngilizce iskelet; çevrilince bu blok da güncellenir
  om: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  so: {
    kisayol: 'Waan tukaday salaadda hadda', // dil-haric: Somalice native etiket (values-so)
    olay: 'Namaz Akışı: Dhacdada waqtiga salaadda', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Xaaladda waqtiga salaadda', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Waan tukaday', // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: ff — values-ff İngilizce iskelet; çevrilince bu blok da güncellenir
  ff: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: yo — values-yo İngilizce iskelet; çevrilince bu blok da güncellenir
  yo: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
};

/** Cihaz yerel ayarından ('ckb_IQ', 'in_ID', 'fa-IR') etiket kümesi; tabloda yoksa Türkçe. */
export function nativeEtiketleri(yerel: string | null | undefined): NativeEtiket {
  const ham = yerel?.split(/[-_]/)[0];
  // Java `Locale` Endonezceyi eski kod 'in' ile verir; kaynak dizini de `values-in`.
  const kod = ham === 'in' ? 'id' : ham;
  return (kod ? (NATIVE_ETIKETLER as Partial<Record<string, NativeEtiket>>)[kod] : undefined) ?? NATIVE_ETIKETLER.tr;
}
