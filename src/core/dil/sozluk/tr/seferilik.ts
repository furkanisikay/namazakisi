/**
 * Seferîlik bilgi kartı ve mezhep adları. KAYIT: arayüz metni → "siz"; hüküm kipi YOK
 * ("kılmalısınız", "caizdir", "seferîsiniz" yazılmaz). Her madde birincil DİYK metnine
 * dayanır (`docs/superpowers/specs/2026-10-13-seferilik-bilgi-karti-kaynaklar.md`).
 */
export const seferilik = {
  mezhepler: { hanefi: 'Hanefî', safii: 'Şâfiî' },
  kaynaklar: {
    vatan: 'Seferî sayılma bakımından vatan-ı aslî, vatan-ı ikamet ve vatan-ı süknâ',
    cem: 'Namazlar cem edilmek (birleştirilmek) suretiyle kılınabilir mi?',
    baslangic: 'Seferîliğin başlangıcı nasıl belirlenir?',
    ziyaret: 'Anne babasının yaşadığı beldeye giden kişi seferî olur mu?',
  },
  bilgiNotu:
    'Bu bir hüküm değil, bilgilendirmedir. Yolcu sayılıp sayılmadığınız; yolculuğunuzun amacına, süresine ve niyetinize göre değişir.',
  baslik: 'Yolculuktasınız gibi görünüyor',
  mesafeSatiri: "İkamet yerinize kuş uçuşu yaklaşık {km} km uzaktasınız. {mezhep} mezhebine göre Diyanet'in aktardığı bilgiler:",
  maddeler: {
    hanefi: [
      "Hanefî mezhebinde yolculuk (seferîlik) ölçüsü yaklaşık 90 km'dir. Gidilen yerde 15 günden az kalmaya niyet eden kişi yolcu sayılır.",
      'Yolcu sayılan kişi dört rekâtlı farz namazları iki rekât kılar (kasr).',
      "Hanefî mezhebinde iki namazı birleştirme (cem) yalnız hacda, Arafat ve Müzdelife'dedir. Diyanet, yolculuk gibi önemli mazeretlerde diğer mezheplerin görüşüyle amel edilebileceğini de belirtir.",
    ],
    safii: [
      "Şâfiî mezhebinde de yolculuk ölçüsü yaklaşık 90 km'dir. Gidilen yerde giriş ve çıkış günleri hariç 4 günden az kalınırsa yolculuk hükümleri sürer.",
      'Yolcu sayılan kişi dört rekâtlı farz namazları iki rekât kılar (kasr).',
      'Şâfiî mezhebinde yolculuk; öğle ile ikindiyi, akşam ile yatsıyı birleştirmek (cem) için geçerli mazeretlerden sayılır.',
    ],
  },
  ozetAcik: 'Açık · {mezhep}',
  ozetKapali: 'Kapalı',
  baglantiAcilamadi: 'Bağlantı açılamadı. İnternet bağlantınızı kontrol edin.',
  ikametGuncellendi: 'İkamet yeriniz güncellendi',
  ikametKaydedilemedi: 'İkamet yeriniz kaydedilemedi',
  kartiKapatin: 'Yolculuk bilgi kartını kapatın',
  burasiEvimErisim: 'Burası evim, ikamet yerim olarak kaydedin',
  burasiEvim: 'Burası evim',
  diyanetteOkuyunErisim: 'Diyanet fetvasını tarayıcıda okuyun',
  diyanetteOkuyun: "Diyanet'te okuyun",
} as const;
