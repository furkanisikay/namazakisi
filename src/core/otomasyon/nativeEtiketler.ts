/**
 * Android kısayol ve otomasyon eklentisi etiketleri: başlatıcı ve Tasker/MacroDroid bunları
 * TELEFONUN diliyle (uygulama dili değil) `android/app/src/main/res/values[-xx]`'ten çözer.
 * Otomasyon rehberi kullanıcının o ekranlarda gördüğü adı aynen yazar. Kaynak dizini olmayan
 * cihaz dili Android'de varsayılan `values/`'e (Türkçe) düşer; burada da öyle.
 * Nöbetçi: `__tests__/nativeEtiketler.test.ts` (her `values-*` dizini bu tabloyla birebir).
 */
import { yerelAyarDili, type DilKodu } from '../dil/diller';

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
  om: {
    kisayol: 'Salaata ammaa salaateera',
    olay: 'Namaz Akışı: Taatee yeroo salaataa', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Haala yeroo salaataa', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Ani salaateera', // dil-haric: marka adı (native etiket)
  },
  so: {
    kisayol: 'Waan tukaday salaadda hadda', // dil-haric: Somalice native etiket (values-so)
    olay: 'Namaz Akışı: Dhacdada waqtiga salaadda', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Xaaladda waqtiga salaadda', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Waan tukaday', // dil-haric: marka adı (native etiket)
  },
  ff: {
    kisayol: 'Mi juulii juulde jooni ndee',
    olay: 'Namaz Akışı: Huunde waqutu juulde', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Ngonka waqutu juulde', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Mi juulii', // dil-haric: marka adı (native etiket)
  },
  yo: {
    kisayol: 'Mo ti kí ìrun lọ́wọ́lọ́wọ́',
    olay: 'Namaz Akışı: Ìṣẹ̀lẹ̀ àkókò ìrun', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Ipò àkókò ìrun', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Mo ti kírun', // dil-haric: marka adı (native etiket)
  },
  zh: {
    kisayol: '我礼了当前的礼拜',
    olay: 'Namaz Akışı: 礼拜时间事件', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: 礼拜时间状态', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: 我礼了', // dil-haric: marka adı (native etiket)
  },
  // ta (values-ta kopyası)
  ta: {
    kisayol: 'தற்போதைய தொழுகையைத் தொழுதேன்',
    olay: 'Namaz Akışı: தொழுகை நேர நிகழ்வு', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: தொழுகை நேர நிலை', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: தொழுதேன்', // dil-haric: marka adı (native etiket)
  },
  ml: {
    kisayol: 'ഇപ്പോഴത്തെ നമസ്കാരം നിർവഹിച്ചു',
    olay: 'Namaz Akışı: നമസ്കാര സമയ സംഭവം', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: നമസ്കാര സമയ നില', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ഞാൻ നമസ്കരിച്ചു', // dil-haric: marka adı (native etiket)
  },
  th: {
    kisayol: 'ฉันละหมาดเวลาปัจจุบันแล้ว',
    olay: 'Namaz Akışı: เหตุการณ์เวลาละหมาด', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: สถานะเวลาละหมาด', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ละหมาดแล้ว', // dil-haric: marka adı (native etiket)
  },
  ko: {
    kisayol: '현재 예배를 드렸어요',
    olay: 'Namaz Akışı: 예배 시간 이벤트', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: 예배 시간 상태', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: 예배 드렸어요', // dil-haric: marka adı (native etiket)
  },
  vi: {
    kisayol: 'Tôi đã hành lễ Salah hiện tại',
    olay: 'Namaz Akışı: Sự kiện giờ Salah', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Trạng thái giờ Salah', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Tôi đã hành lễ', // dil-haric: marka adı (native etiket)
  },
  pt: {
    kisayol: 'Rezei a oração atual', // dil-haric: Portekizce native etiket (values-pt; "ç" Türkçe sayılır)
    olay: 'Namaz Akışı: Evento da hora da oração', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Estado da hora da oração', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Rezei', // dil-haric: marka adı (native etiket)
  },
  it: {
    kisayol: 'Ho compiuto la preghiera attuale',
    olay: 'Namaz Akışı: Evento dell’orario', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Stato dell’orario', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Ho pregato', // dil-haric: marka adı (native etiket)
  },
  sv: {
    kisayol: 'Jag har bett den aktuella bönen', // dil-haric: İsveççe native etiket (values-sv)
    olay: 'Namaz Akışı: Händelse för bönetid', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status för bönetid', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Jag har bett', // dil-haric: marka adı (native etiket)
  },
  uk: {
    kisayol: 'Поточну молитву здійснено',
    olay: 'Namaz Akışı: Подія часу молитви', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Стан часу молитви', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Молитву здійснено', // dil-haric: marka adı (native etiket)
  },
  ro: {
    kisayol: 'Am efectuat rugăciunea curentă',
    olay: 'Namaz Akışı: Eveniment al timpului de rugăciune', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Starea timpului de rugăciune', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: M-am rugat', // dil-haric: marka adı (native etiket)
  },
  hr: {
    kisayol: 'Klanjano: trenutačni namaz',
    olay: 'Namaz Akışı: Događaj vremena namaza', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Stanje vremena namaza', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Klanjano', // dil-haric: marka adı (native etiket)
  },
  // sr (values-sr kopyası; KİRİL)
  sr: {
    kisayol: 'Клањано: тренутни намаз',
    olay: 'Namaz Akışı: Догађај времена намаза', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Стање времена намаза', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Клањано', // dil-haric: marka adı (native etiket)
  },
  // el
  el: {
    kisayol: 'Τέλεσα την τρέχουσα προσευχή',
    olay: 'Namaz Akışı: Συμβάν ώρας προσευχής', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Κατάσταση ώρας προσευχής', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Προσευχήθηκα', // dil-haric: marka adı (native etiket)
  },
  // ku
  ku: {
    kisayol: 'Min nimêja niha kir',
    olay: 'Namaz Akışı: Bûyera dema nimêjê', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Rewşa dema nimêjê', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Min nimêj kir', // dil-haric: marka adı (native etiket)
  },
  // tk
  tk: {
    kisayol: 'Häzirki namazy okadym',
    olay: 'Namaz Akışı: Namaz wagty wakasy', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Namaz wagty ýagdaýy', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Okadym', // dil-haric: marka adı (native etiket)
  },
  // tt
  tt: {
    kisayol: 'Хәзерге намазны укыдым',
    olay: 'Namaz Akışı: Намаз вакыты вакыйгасы', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Намаз вакыты халәте', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Укыдым', // dil-haric: marka adı (native etiket)
  },
  sd: {
    kisayol: 'موجوده نماز پڙهي ورتي',
    olay: 'Namaz Akışı: نماز جي وقت جو واقعو', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: نماز جي وقت جي حالت', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: نماز پڙهي ورتي', // dil-haric: marka adı (native etiket)
  },
  pl: {
    kisayol: 'Bieżąca modlitwa odprawiona',
    olay: 'Namaz Akışı: Zdarzenie czasu modlitwy', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Stan czasu modlitwy', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Odprawiono', // dil-haric: marka adı (native etiket)
  },
  // ja
  ja: {
    kisayol: '現在の礼拝をしました',
    olay: 'Namaz Akışı：礼拝時間のイベント', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı：礼拝時間の状態', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı：礼拝しました', // dil-haric: marka adı (native etiket)
  },
  gu: {
    kisayol: 'હાલની નમાઝ પઢી લીધી',
    olay: 'Namaz Akışı: નમાઝના સમયની ઘટના', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: નમાઝના સમયની સ્થિતિ', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: નમાઝ પઢી લીધી', // dil-haric: marka adı (native etiket)
  },
  bg: {
    kisayol: 'Изпълних текущия намаз',
    olay: 'Namaz Akışı: Събитие за времето за намаз', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Състояние на времето за намаз', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Изпълних', // dil-haric: marka adı (native etiket)
  },
  // mk
  mk: {
    kisayol: 'Го клањав тековниот намаз',
    olay: 'Namaz Akışı: Настан за времето на намаз', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Состојба на времето за намаз', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Клањав', // dil-haric: marka adı (native etiket)
  },
  // fil
  fil: {
    kisayol: 'Naidasal ko ang kasalukuyang dasal',
    olay: 'Namaz Akışı: Event ng oras ng dasal', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Status ng oras ng dasal', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nagdasal ako', // dil-haric: marka adı (native etiket)
  },
  te: {
    kisayol: 'ప్రస్తుత నమాజ్ ఆచరించాను',
    olay: 'Namaz Akışı: నమాజ్ సమయ ఈవెంట్', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: నమాజ్ సమయ స్థితి', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ఆచరించాను', // dil-haric: marka adı (native etiket)
  },
  // kn (values-kn)
  kn: {
    kisayol: 'ಪ್ರಸ್ತುತ ನಮಾಝ್ ಮಾಡಿದೆ',
    olay: 'Namaz Akışı: ನಮಾಝ್ ಸಮಯದ ಘಟನೆ', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: ನಮಾಝ್ ಸಮಯದ ಸ್ಥಿತಿ', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ನಮಾಝ್ ಮಾಡಿದೆ', // dil-haric: marka adı (native etiket)
  },
  mr: {
    kisayol: 'सध्याची नमाज पढली',
    olay: 'Namaz Akışı: नमाजच्या वेळेची घटना', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: नमाजच्या वेळेची स्थिती', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: नमाज पढली', // dil-haric: marka adı (native etiket)
  },
  // pa (values-b+pa+Arab, Şahmuki)
  pa: {
    kisayol: 'موجودہ نماز پڑھ لئی',
    olay: 'Namaz Akışı: نماز دے وقت دا واقعہ', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: نماز دے وقت دی حالت', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: نماز پڑھ لئی', // dil-haric: marka adı (native etiket)
  },
  as: {
    kisayol: 'বৰ্তমানৰ নামাজ পঢ়িছোঁ',
    olay: 'Namaz Akışı: নামাজৰ সময়ৰ ঘটনা', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: নামাজৰ সময়ৰ অৱস্থা', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: নামাজ পঢ়িছোঁ', // dil-haric: marka adı (native etiket)
  },
  // ne (values-ne)
  ne: {
    kisayol: 'हालको नमाज पढें',
    olay: 'Namaz Akışı: नमाजको समयको घटना', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: नमाजको समयको अवस्था', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: नमाज पढें', // dil-haric: marka adı (native etiket)
  },
  si: {
    kisayol: 'වත්මන් සලාතය ඉටු කළෙමි',
    olay: 'Namaz Akışı: සලාත් වේලා සිදුවීම', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: සලාත් වේලා තත්ත්වය', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ඉටු කළෙමි', // dil-haric: marka adı (native etiket)
  },
  // km
  km: {
    kisayol: 'បានសឡាតពេលបច្ចុប្បន្នហើយ',
    olay: 'Namaz Akışı៖ ព្រឹត្តិការណ៍ពេលសឡាត', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı៖ ស្ថានភាពពេលសឡាត', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı៖ បានសឡាតហើយ', // dil-haric: marka adı (native etiket)
  },
  // he (values-iw)
  he: {
    kisayol: 'התפללתי את התפילה הנוכחית',
    olay: 'Namaz Akışı: אירוע זמן תפילה', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: מצב זמן התפילה', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: התפללתי', // dil-haric: marka adı (native etiket)
  },
  // ka
  ka: {
    kisayol: 'მიმდინარე ლოცვა შევასრულე',
    olay: 'Namaz Akışı: ლოცვის დროის მოვლენა', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: ლოცვის დროის მდგომარეობა', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: ვილოცე', // dil-haric: marka adı (native etiket)
  },
  // lt
  lt: {
    kisayol: 'Atlikau dabartinę maldą',
    olay: 'Namaz Akışı: Maldos laiko įvykis', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Maldos laiko būsena', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Atlikau maldą', // dil-haric: marka adı (native etiket)
  },
  // mg (values-mg)
  mg: {
    kisayol: 'Nanao ny soalat ankehitriny aho',
    olay: "Namaz Akışı: Zava-mitranga amin'ny fotoanan'ny soalat", // dil-haric: marka adı (native etiket)
    kosul: "Namaz Akışı: Toetry ny fotoanan'ny soalat", // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nivavaka aho', // dil-haric: marka adı (native etiket)
  },
  lg: {
    kisayol: 'Nsaaze esswala eriwo',
    olay: 'Namaz Akışı: Ekibaddewo mu kiseera ky’esswala', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Embeera y’ekiseera ky’esswala', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nsaaze', // dil-haric: marka adı (native etiket)
  },
  // rw (values-rw)
  rw: {
    kisayol: 'Nasali iswala y’iki gihe',
    olay: 'Namaz Akışı: Ikibaye ku gihe cy’iswala', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Uko igihe cy’iswala gihagaze', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nasali', // dil-haric: marka adı (native etiket)
  },
  // rn (values-rn)
  rn: {
    kisayol: 'Nasenze isengesho ry’ubu',
    olay: 'Namaz Akışı: Ivyabaye ku gihe c’isengesho', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Uko igihe c’isengesho kimeze', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nasenze', // dil-haric: marka adı (native etiket)
  },
  // ln (values-ln)
  ln: {
    kisayol: 'Nasambeli losambo ya sikoyo',
    olay: 'Namaz Akışı: Likambo ya ntango ya losambo', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Ezalela ya ntango ya losambo', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Nasambeli', // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: dag (values-b+dag; İngilizce iskelet)
  dag: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  // mos (values-b+mos)
  mos: {
    kisayol: 'M pʋʋsa pʋʋsg ning sẽn be masã',
    olay: 'Namaz Akışı: Pʋʋsg wakat yell', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Pʋʋsg wakat yɛla', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: M pʋʋsa', // dil-haric: marka adı (native etiket)
  },
  // aa (values-aa)
  aa: {
    kisayol: 'Asaakuh salat abe',
    olay: 'Namaz Akışı: Salat waktih taama', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Salat waktih caala', // dil-haric: marka adı (native etiket)
    eylem: 'Namaz Akışı: Salat abe', // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: mdh (values-b+mdh; İngilizce iskelet)
  mdh: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: ak (values-ak; İngilizce iskelet)
  ak: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: ceb (values-b+ceb; İngilizce iskelet)
  ceb: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
  // ÇEVİRİ: nqo (values-b+nqo; İngilizce iskelet)
  nqo: {
    kisayol: "I've prayed the current prayer",
    olay: 'Namaz Akışı: Prayer time event', // dil-haric: marka adı (native etiket)
    kosul: 'Namaz Akışı: Prayer time status', // dil-haric: marka adı (native etiket)
    eylem: "Namaz Akışı: I've prayed", // dil-haric: marka adı (native etiket)
  },
};

/** Cihaz yerel ayarından ('ckb_IQ', 'in_ID', 'fa-IR') etiket kümesi; tabloda yoksa Türkçe. */
export function nativeEtiketleri(yerel: string | null | undefined): NativeEtiket {
  const ham = yerel?.split(/[-_]/)[0];
  // Java `Locale` Endonezceyi eski kod 'in' ile verir; kaynak dizini de `values-in`. Filipince kaynak dizini
  // `values-tl` (Tagalog); kaynak sistemi `fil` ve `tl`'yi eşdeğer sayar. İbranice kaynak dizini `values-iw`
  // (`ResourcesImpl.adjustLanguageTag` cihazın `he`sini `iw`ye çevirir); Java `Locale` de 'iw' verebilir.
  // Pencapça kaynağı `values-b+pa+Arab`: yalnız Şahmuki cihaz (Arap betiği / Pakistan) onu seçer, Gurmuki cihaz Türkçeye düşer.
  if (ham === 'pa') return yerelAyarDili(yerel) === 'pa' ? NATIVE_ETIKETLER.pa ?? NATIVE_ETIKETLER.tr : NATIVE_ETIKETLER.tr;
  const kod = ham === 'in' ? 'id' : ham === 'tl' ? 'fil' : ham === 'iw' ? 'he' : ham;
  return (kod ? (NATIVE_ETIKETLER as Partial<Record<string, NativeEtiket>>)[kod] : undefined) ?? NATIVE_ETIKETLER.tr;
}
