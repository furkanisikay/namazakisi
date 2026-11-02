import type { Sozluk } from '../tr';

/**
 * Sindhçede QuranEnc meali yok (sahip kararı 2026-11-02): ekranda yalnız Arapça metin (Tanzil)
 * ve künye görünür; `sayfa.mealYok` gerçekten çizilir. Meal künyesi alanları (`mealKaynagi`,
 * `sayfaKunye`) bu dilde kullanılmaz; yer tutucu kümesi için doğal biçimde yazıldı. Meal = ترجمو.
 */
export const gununAyeti: Sozluk['gununAyeti'] = {
  baslik: 'ڏينهن جي آيت',
  etiket: 'ڏينهن جي آيت',
  kisaKunye: '{sure} {ref}',
  kuran: 'قرآن',
  mealKaynagi: '{yayimci}، QuranEnc {surum}',
  sayfaKunye: 'قرآن {ref} · ترجمو: {yayimci}، QuranEnc {surum} · عربي متن: Tanzil منصوبو',
  arapcaKaynagi: 'عربي: Tanzil',
  sigmiyor: 'اڄ جي آيت هن ماپ ۾ نٿي سمائجي. پڙهڻ لاءِ ٽيپ ڪريو.',
  acin: 'کوليو',
  sayfa: {
    tarih: '{gunAdi}، {gun} {ay}',
    kisaTarih: '{gun} {ay}',
    metniPaylasin: 'عبارت شيئر ڪريو',
    paylasilamadi: 'هن ڊوائيس تي شيئر ڪرڻ دستياب ناهي.',
    gorselPaylasin: 'تصوير طور شيئر ڪريو',
    widgetVeDuvar: 'ويجيٽ ۽ وال پيپر',
    widgetVeDuvarAciklama: 'ان کي مکيه اسڪرين تي شامل ڪريو، لاڪ اسڪرين تي ڏسو',
    oncekiGunler: 'پويان ڏينهن',
    dun: 'ڪالهه',
    kaynakNotu: 'قرآني متن Tanzil منصوبي مان بنا ڪنهن تبديليءَ جي ورتو ويو آهي.',
    mealYok: 'هن ٻوليءَ ۾ اڃا ترجمو ناهي؛ عربي متن ڏيکاريو پيو وڃي.',
    tanzilBaglanti: 'عربي متن: Tanzil منصوبو (tanzil.net)',
  },
  ayar: {
    widgetBolum: 'ويجيٽ',
    widgetEkleyin: 'مکيه اسڪرين تي ويجيٽ شامل ڪريو',
    widgetEkleyinAciklama: 'مکيه اسڪرين جي خالي جاءِ کي دٻائي رکو، ويجيٽ، Namaz Akışı، ڏينهن جي آيت',
    widgetEkleyinAciklamaIos: 'مکيه اسڪرين جي خالي جاءِ کي دٻائي رکو، Edit، Add Widget، Namaz Akışı',
    widgetEkleDugme: 'مکيه اسڪرين تي شامل ڪريو',
    duvarBolum: 'وال پيپر',
    duvarAnahtar: 'هر روز بدلايو',
    duvarAcikOzet: 'چالو · هر روز فجر تي نئون',
    duvarKapaliOzet: 'بند',
    yer: 'ڪٿي',
    yerler: { kilit: 'لاڪ اسڪرين', ana: 'مکيه اسڪرين', ikisi: 'ٻئي' },
    zemin: 'پس منظر',
    zeminler: { gece: 'رات', kagit: 'ڪاغذ', palet: 'رنگ' },
    arapca: 'عربي متن به ڏيکاريو',
    arapcaNot: 'ڪجهه عالم اسڪرين تي آيت ڏيکاريندڙ فون کي غسل خاني ۾ نه کڻي وڃڻ جي صلاح ڏين ٿا.',
    onizleyin: 'اڄ جي تصوير ڏسو',
    kapatNotu: 'جيڪڏهن بند ڪندا ته آخري تصوير اسڪرين تي رهندي؛ پنهنجو پويون وال پيپر گيلري مان ٻيهر چونڊيو.',
    kullanilamiyor: 'دستياب ناهي',
    engelli: 'هن ڊوائيس تي وال پيپر بدلائڻ بند ٿيل آهي (ڪم يا اسڪول جو انتظام)، ان ڪري هي سيٽنگ چالو نٿي ٿي سگهي.',
    yazilamadi: 'اڄ جي تصوير لڳائي نه سگهي. ايپ کولڻ تي ٻيهر ڪوشش ڪئي ويندي.',
    yerlestirildi: 'وال پيپر لڳايو ويو',
    onizlemeErisim: 'اڄ جي وال پيپر جو جائزو',
  },
  onay: {
    baslik: 'اوهان جو وال پيپر بدلجي ويندو',
    metin:
      'هر روز فجر تي ڏينهن جي آيت اوهان جي لاڪ اسڪرين تي ايندي. ايپ اوهان جو موجوده وال پيپر محفوظ نٿي رکي سگهي: جيڪڏهن هي بند ڪندا ته ان کي گيلري مان ٻيهر چونڊيو.',
    acin: 'چالو ڪريو',
  },
  ios: {
    aciklama:
      'iPhone تي ايپون پاڻ وال پيپر نٿيون بدلائي سگهن. Shortcuts ايپ اهو ڪم اوهان لاءِ هر صبح ڪري سگهي ٿي؛ ان کي هڪ ڀيرو سيٽ ڪرڻو پوندو.',
    ucAdim: 'ٽي قدم',
    adim1:
      'Shortcuts ايپ ۾ نئون شارٽ ڪٽ ٺاهيو. پهرين “ڏينهن جي آيت جي تصوير” وارو عمل شامل ڪريو، پوءِ وال پيپر جو فوٽو لڳائيندڙ عمل (“Wallpaper” ڳوليو).',
    kisayollariAcin: 'Shortcuts کوليو',
    adim2: 'Shortcuts ۾، Automation ٽيب تي، نئين Time of Day آٽوميشن ٺاهيو ۽ فجر کان پوءِ جو وقت چونڊيو (مثال طور 07:30).',
    adim3: 'Run Immediately چونڊيو ۽ شامل ڪيل شارٽ ڪٽ ڳنڍيو.',
    elle: 'يا هٿ سان',
    gorseliKaydedin: 'اڄ جي تصوير محفوظ ڪريو',
    kaydetIpucu: 'کلندڙ شيئر مينيو ۾ تصوير Photos ۾ محفوظ ڪري سگهو ٿا.',
    not: 'آٽوميشن اوهان جي چونڊيل مقرر وقت تي هلي ٿي ۽ فجر جي وقت سان نٿي هلي سگهي؛ جيڪڏهن فجر کان اڳ هلي ته ڪالهه جي آيت لڳائيندي.',
  },
};
