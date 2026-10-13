/**
 * Yeni Özellik Kataloğu
 *
 * Uygulamaya eklenen yeni özelliklerin tek kaynağı. Rozet, "Neler Yeni" kartı
 * ve "Neler Yeni" sayfası bu listeden beslenir.
 *
 * Yeni bir özellik duyurmak için: diziye en üste bir nesne ekle. Tüm yüzeyler
 * (rozet + kart + sayfa) otomatik güncellenir; ek kod gerekmez.
 *
 * KOPYA YAZIM KURALLARI (önemli):
 *   - Her zaman kibar "siz" dili kullanın ("ekleyebilirsiniz", "görürsünüz").
 *   - `baslik` dikkat çekici ve net olsun.
 *   - `aciklama` tek bakışta özelliğin ~%70'ini anlatan özet olsun (kapalı görünüm).
 *   - `detayAciklama` + `detaylar` ile tıklayınca açılan detayda tam resmi verin.
 */

export interface YeniOzellik {
    /** Benzersiz kimlik (kalıcı; değiştirme) */
    id: string;
    /** Hangi sürümde eklendi (örn. '0.22.0') */
    surum: string;
    /** Tanıtım tarihi — 'YYYY-MM-DD' (Neler Yeni sıralaması için) */
    tarih: string;
    /** Dikkat çekici başlık */
    baslik: string;
    /** Tek bakışta özelliği anlatan özet (kapalı görünümde gösterilir) */
    aciklama: string;
    /** Açılınca gösterilen detaylı paragraf */
    detayAciklama?: string;
    /** FontAwesome5 ikon adı */
    ikon: string;
    /** Ayarlar yığınındaki hedef sayfa (CTA + menü rozeti eşlemesi) */
    hedefSayfa?: string;
    /** CTA buton etiketi (örn. 'Hemen kurun') */
    ctaEtiketi?: string;
    /** Ayarlar üstünde kapatılabilir tanıtım kartı gösterilsin mi */
    kartGoster?: boolean;
    /** Açılınca gösterilen madde madde detaylar */
    detaylar?: string[];
}

export const YENI_OZELLIKLER: YeniOzellik[] = [
    // "Camide kılacağım" — yürüme süresine göre erken hatırlatma (issue #292).
    {
        id: 'camide-kilacagim',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Camiye Zamanında Yetişin',
        aciklama:
            'Camide kılmak istediğiniz vakitleri seçin; ezandan, camiye yürüme süreniz kadar önce hatırlatalım.',
        detayAciklama:
            'Bildirim ayarlarındaki "Camide kılacağım" bölümünden vakitleri tek tek seçebilir, yürüme süresini ve abdest için hazırlık payını belirleyebilirsiniz. Android\'de Camideyim\'de favori bir caminiz varsa yürüme süresi oradan tahmin edilir; dilediğiniz gibi düzeltebilirsiniz, düzelttiğiniz değer korunur. Cuma hatırlatmanız açıksa cuma günü öğle için ayrıca hatırlatılmazsınız.',
        ikon: 'walking',
        hedefSayfa: 'BildirimAyarlari',
        ctaEtiketi: 'Vakitlerinizi seçin',
        kartGoster: false,
        detaylar: [
            'Beş vakit için ayrı ayrı açılır',
            'Hatırlatma ezandan yürüme süresi + hazırlık payı kadar önce gelir',
            'Favori caminiz varsa yürüme süresi kendiliğinden hesaplanır',
            'Özel gün modunda hatırlatma gönderilmez',
        ],
    },
    // Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (issue #290).
    {
        id: 'yatis-hatirlatmasi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Yatmadan Önce Hatırlatma',
        aciklama:
            'Her zamanki yatış saatinizi girin; yatsıyı işaretlemediyseniz uyumadan önce hatırlatalım, gün sonunda eksik vakitlerinizi tek bildirimde görün.',
        detayAciklama:
            'Yatsı vakti saatlerce sürer ve muhafızın "vakit çıkıyor" uyarısı sabaha kalır; asıl kayıp çoğu zaman uykuya dalmaktır. Yatış saatinizden belirlediğiniz süre önce tek bir bildirim gelir: yatsıyı işaretlemediyseniz yatsı hatırlatması, işaretlediyseniz günün muhasebesi ("Bugün 4/5 · öğle işaretlenmemiş"). Tek eksik varsa bildirimden "Kıldım" diyebilir ya da kaza defterinize ekleyebilirsiniz. Özel gün aralığında gönderilmez.',
        ikon: 'bed',
        hedefSayfa: 'BildirimAyarlari',
        ctaEtiketi: 'Yatış saatinizi girin',
        kartGoster: true,
        detaylar: [
            'Gece yarısından sonra yatıyorsanız hatırlatma yine o günün namazlarını sayar',
            'Birden fazla eksik varsa bildirim uygulamayı açıp incelemenizi önerir',
        ],
    },
    // Muhafız bildiriminde "Ertele" (issue #289) — kart kapalı (yalnız "Neler Yeni").
    {
        id: 'muhafiz-ertele',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Hatırlatmayı Erteleyin',
        aciklama:
            'Muhafız bildiriminden "10 dk ertele" ya da "20 dk ertele" diyerek hatırlatmayı kapatıp unutmak yerine somut bir zamana taşıyabilirsiniz.',
        detayAciklama:
            'Ertelediğinizde o vaktin arada kalan uyarıları susar ve hatırlatma seçtiğiniz anda aynı ses ve tonla geri gelir. Erteleme vaktin çıkmasına 3 dakika kalanı asla geçmez; ikindide sınır, güneşin sararmaya başladığı kerahat vaktidir. Vaktin sonuna çok az kaldıysa erteleme düğmesi gösterilmez. Bildirimden "Kıldım" dediğinizde ertelenen hatırlatma da iptal olur.',
        ikon: 'clock',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Muhafızı inceleyin',
        kartGoster: false,
    },
    // Siri, Kısayollar ve Odak filtresi (issue #279) — yalnız iPhone; kart kapalı.
    {
        id: 'ios-siri-kisayollar-odak',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: "iPhone'da Siri, Kısayollar ve Odak",
        aciklama:
            "iPhone'da Siri'ye sıradaki namazı sorabilir, kıldığınız vakti sesinizle işaretleyebilir ve \"Namaz\" Odağınızda hatırlatmaları sessize alabilirsiniz.",
        detayAciklama:
            "Bu özellik yalnız iPhone içindir. Kurulum gerekmez: \"Namaz Akışı sıradaki namaz ne zaman\", \"Namaz Akışı şu anki vakti kıldım\" ya da \"Namaz Akışı kıbleyi aç\" demeniz yeterli. Aynı eylemler Kısayollar uygulamasında, Spotlight aramasında ve Eylem düğmesinde de görünür. Kıldım işaretlemesi siz onayladıktan sonra yapılır ve uygulamayı açtığınızda takviminize işlenir. Ayarlar > Odak bölümünden kendi Odağınıza Namaz Akışı filtresini ekleyip \"Hatırlatmaları sessiz ver\"i açarsanız, o Odak açıkken namaz hatırlatmaları ekranı yakmadan ve ses çıkarmadan gelir.",
        ikon: 'microphone',
        kartGoster: false,
        detaylar: [
            'Yalnız iPhone (iOS 16 ve üstü)',
            'Siri sıradaki namazı ve giriş saatini söyler',
            '"Şu anki vakti kıldım" onayınızla işaretler',
            'Odak filtresi açıkken hatırlatmalar en fazla 3 saat sessiz gelir',
        ],
    },
    // Nafile hatırlatmalarında kanal seçimi ve çok adımlı plan (issue #273).
    {
        id: 'nafile-kanal-ve-adimlar',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Nafile Hatırlatmaları Yenilendi',
        aciklama:
            'Kuşluk, evvâbîn ve teheccüd için artık namaz hatırlatmasındaki gibi birden çok hatırlatma kurabilir, nasıl uyarılacağınızı seçebilirsiniz.',
        detayAciklama:
            'Her nafileye en fazla üç hatırlatma kurabilirsiniz. Hatırlatmanın vakit girince mi yoksa vakit çıkmadan mı geleceğini seçersiniz; zaman şeridi bugünkü planı gösterir. Her hatırlatma bir kez ya da 10–60 dakikada bir tekrarlı olabilir ve bildirim, sesli anons ya da ikisiyle gelir; titreşimi ayrıca açabilirsiniz. Sesli anonsu ilk seçtiğinizde ne yaptığı anlatılır. Bildirimdeki Kıldım düğmesi o günün kalan hatırlatmalarını durdurur; puana ve seriye karışmaz. Mevcut ayarlarınız aynen taşındı.',
        ikon: 'star-and-crescent',
        hedefSayfa: 'NafileAyarlari',
        ctaEtiketi: 'Nafile ayarlarını açın',
        kartGoster: false,
        detaylar: [
            'Nafile başına en fazla üç hatırlatma, her biri bir kez ya da tekrarlı',
            'Bildirim, sesli anons ya da ikisi; titreşim ayrı bir anahtar',
            'Teheccüdde pencere: gecenin son üçte biri ya da yatsıdan itibaren',
            'Kıldım dediğinizde o günün kalan hatırlatmaları durur',
        ],
    },
    // Now Bar öğe seçimi + saat (issue #282 ikinci aşama) — yalnız Android; kart kapalı.
    {
        id: 'now-bar-secimi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: "Now Bar'da Ne Görüneceğini Siz Seçin",
        aciklama:
            "Her vakti, iftarı, sahuru, cumayı, nafileleri ve seriyi tek tek açabilir; geri sayımın ne zaman başlayacağını belirleyebilirsiniz.",
        detayAciklama:
            "Android 16 ve üstünde geri sayım durum çubuğunda ve Samsung Now Bar'da görünür. Ayarlar'daki \"Now Bar ve canlı sayaçlar\" sayfasında her öğe için \"vakit girince\" ya da \"son dakikalar\" seçebilirsiniz. Aynı anda yalnız bir sayaç öne çıkar; Wear OS saatiniz de aynı seçimi kullanır. Google sürekli açık kartları önermediği için telefonunuz öne çıkarmayı geri çekebilir.",
        ikon: 'stopwatch',
        hedefSayfa: 'NowBarAyarlari',
        ctaEtiketi: 'Seçimlerinizi yapın',
        kartGoster: false,
        detaylar: [
            'Beş vakit ayrı ayrı açılır; varsayılan önceki davranıştır',
            'Cuma, kuşluk, evvâbîn ve teheccüd için de sayaç açabilirsiniz',
            'Seri sayacı yalnız siz açarsanız öne çıkar',
            'Sayaç tam zamanında başlar; uygulamanın açık olması gerekmez',
        ],
    },
    // Bildirim sınırı rehberi (issue #298).
    {
        id: 'bildirim-siniri-rehberi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Bildirim Sınırı Rehberi',
        aciklama:
            'Telefonunuzun bekletebildiği bildirim sayısı sınırlıdır; uygulama sınıra yaklaştığınızda sizi önceden uyarır ve yer açmanın en kolay yollarını önerir.',
        detayAciklama:
            'iPhone aynı anda en fazla 64 bildirim bekletir, Android de uygulama başına sınırlı sayıda alarm tutar; fazlası hata vermeden sessizce düşer. Namaz Muhafızı ve Nafile Namazlar ekranlarının üstündeki kart, kurulu bütün hatırlatmalarınızı sayar. Sığmayacak bir hatırlatma eklemeye çalıştığınızda ekleme yapılmaz; nedenini ve yer açma yollarını görürsünüz. Her öneri gerçekten hesaplanır, tek dokunuşla uygulanır ve geri alınabilir.',
        ikon: 'layer-group',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Bildirimlerinizi görün',
        kartGoster: false,
        detaylar: [
            'Kart sınıra yaklaşınca turuncu, aşınca kırmızı olur ve kaç bildirimin gelmeyeceğini söyler',
            'Öneriler anlam kaybı en az olandan başlar: tekrarları seyrekleştirmek, nazik hatırlatmayı tek seferlik yapmak, iPhone’da nafileyi günü gününe kurmak',
            'Sert ve acil tonlu hatırlatmalara hiç dokunulmaz',
            'Android’de kart yalnız sınıra çok yaklaştığınızda görünür',
        ],
    },
    // Bildirimdeki "Kıldım" native + otomasyon güven listesi (issue #299) — yalnız
    // Android; kart kapalı (yalnız "Neler Yeni" listesi).
    {
        id: 'kildim-guven-listesi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: '"Kıldım" Artık Anında Susturur',
        aciklama:
            'Bildirimdeki "Kıldım"a dokunduğunuzda o vaktin kalan hatırlatmaları ve sesli anonsları hemen susar; otomasyonlarınız için kalıcı izin verebilirsiniz.',
        detayAciklama:
            'Bildirimden "Kıldım" dediğinizde uygulama açılmaz ve telefonunuz uyku kısıtındayken bile o vaktin kalan uyarıları beklemeden iptal edilir. Samsung Rutinler, Tasker gibi bir uygulama namazınızı ilk kez işaretlemek istediğinde size bir kez sorulur: her zaman izin verebilir, yalnız o seferlik onaylayabilir ya da engelleyebilirsiniz. Kararlarınızı Ayarlar\'daki "Kıldım işaretleyebilen uygulamalar" bölümünden değiştirebilirsiniz.',
        ikon: 'user-shield',
        hedefSayfa: 'KildimUygulamalari',
        ctaEtiketi: 'İzinleri inceleyin',
        kartGoster: false,
        detaylar: [
            '"Kıldım" o vaktin kalan uyarılarını ve sesli anonslarını anında susturur',
            'Bir kez izin verdiğiniz otomasyon bir daha onay sormadan çalışır',
            'Engellediğiniz uygulamanın istekleri yok sayılır',
            'Ana ekran kısayolları, widget ve hızlı ayarlar kutusu her zaman çalışır',
        ],
    },
    // Android 16 Live Update / Now Bar (issue #282) — yalnız Android 16+ cihazları
    // ilgilendirdiği için kart kapalı (yalnız "Neler Yeni" listesi).
    {
        id: 'sayac-canli-guncelleme',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Sayaçlarınız Durum Çubuğunda ve Now Bar\'da',
        aciklama:
            'Android 16 ve üzeri cihazlarda vakit, iftar ve sahur sayacınız durum çubuğunda kalan süreyle görünür; Samsung cihazlarda Now Bar\'a da taşınır.',
        detayAciklama:
            'Vaktin kılınmamış son dakikalarında, iftara ve sahura kadar kalan süreyi bildirim panelini açmadan görebilirsiniz. Bildirimde vaktin ne kadarının geçtiği bir çubukla gösterilir; vakit sayacında "Kıldım" düğmesiyle tek dokunuşta işaretleyebilirsiniz. Seri sayacı ve sıradaki vakit bu alana taşınmaz. Bu gösterimi telefonunuzun bildirim ayarlarındaki "Canlı güncellemeler" seçeneğiyle kapatabilirsiniz; kapattığınızda sayaç bildiriminiz eskisi gibi görünür.',
        ikon: 'mobile-alt',
        hedefSayfa: 'BildirimAyarlari',
        ctaEtiketi: 'Sayaç ayarlarını inceleyin',
        kartGoster: false,
        detaylar: [
            'Durum çubuğunda kalan süre: "12 dk", "1 sa 5 dk"',
            'Vaktin, orucun ve sahurun ilerleyişi çubukla',
            'Vakit sayacında tek dokunuşla "Kıldım"',
            'Saat geri sayımı kendi yüzeyinde gösterir, telefondaki sayaç saate düşmez',
        ],
    },
    // Namaz muhafızı: vakit başına 1–6 hatırlatma + ayrı ton (issue #274).
    {
        id: 'muhafiz-hatirlatma-sayisi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Muhafızda İstediğiniz Kadar Hatırlatma',
        aciklama:
            'Her vakit için 1 ile 6 arasında hatırlatma kurabilir, her birinin tonunu ayrı seçebilirsiniz.',
        detayAciklama:
            'Dört sabit kademe yerine artık "1. hatırlatma, 2. hatırlatma…" diye kendi akışınızı kurarsınız. Numaralar zamana göre kendiliğinden sıralanır; Nazik, Uyarı, Sert ya da Acil tonu her hatırlatmada ayrı seçersiniz. Acil ton yalnız vaktin son 15 dakikasında seçilebilir. Bugünkü ayarlarınız korunur; yalnız bu aralığın dışında kalan acil hatırlatmalarınız artık sert tonda çalışır ve Rahatsız Etmeyin\'i delmez.',
        ikon: 'shield-alt',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Hatırlatmalarınızı düzenleyin',
        kartGoster: false,
        detaylar: [
            'Vakit başına en fazla 6 hatırlatma ekleyebilir, istemediğinizi silebilirsiniz',
            'Ton (Nazik, Uyarı, Sert, Acil) sıradan bağımsız seçilir',
            'Vaktin bitmesine çok varken sert ton bile "vakit çıkıyor" demez',
            'Ton geri giderse ekranda kısa bir not görürsünüz',
            'Vaktin son 15 dakikası dışındaki acil hatırlatmalar sert tonda çalışır, Rahatsız Etmeyin\'i delmez; ekranda bu adımların altında not görürsünüz',
        ],
    },
    // Saatte tesbihat sayacı (issue #293) — yalnız saat sahipleri; kart kapalı.
    {
        id: 'wear-tesbihat',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Saatinizde Tesbihat Sayacı',
        aciklama:
            'Namazdan sonra tesbihatı Wear OS saatinizde sayabilirsiniz: ekrana dokunun ya da tacı çevirin, her 33\'te saat belirgin şekilde titrer.',
        detayAciklama:
            'Sübhânallah, Elhamdülillâh ve Allâhü ekber otuz üçer kez sayılır, yüzüncüsü "Lâ ilâhe illallâhü vahdehû…" ile tamamlanır (Müslim, Mesâcid 146). Ekranın tamamı dokunma alanıdır; saatin tacı ya da çerçevesiyle de sayabilirsiniz. Her sayımda kısa bir tık, her 33\'te belirgin bir titreşim, sonunda ayrı bir bitiş titreşimi hissedersiniz; ekrana bakmanız gerekmez. Yanlış dokunuşu "Geri al" ile silebilir, uzun basarak baştan başlayabilirsiniz. Ekran kapanırsa sayım kaybolmaz: kadrandaki tesbihat simgesine dokunarak kaldığınız yerden sürdürürsünüz. Saat uygulamasının ana ekranından ve "Bugün" kutucuğundan açılır.',
        ikon: 'circle-notch',
        kartGoster: false,
        detaylar: [
            '33 · 33 · 33 + 1, her 33\'te belirgin titreşim',
            'Dokunarak ya da tacı çevirerek sayım',
            'Son sayımı geri alma, uzun basarak baştan başlama',
            'Ekran kapansa da kaldığınız yerden devam',
        ],
    },
    // Wear OS yüzeyleri (issue #281) — yalnız saat sahiplerini ilgilendirdiği için
    // kart kapalı (yalnız "Neler Yeni" listesi).
    {
        id: 'wear-kadran-yuzeyleri',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Saat Kadranınızda Namaz Akışı',
        aciklama:
            'Wear OS saatinizde kadranı özelleştirirken takvim ya da hava durumu gibi bir yuvaya Namaz Akışı\'nı seçebilirsiniz.',
        detayAciklama:
            'Kadran yuvaları için dört seçenek var: sıradaki vakit ve kalan süre, bugün kılınan vakit sayısı, günün beş vaktinin dağılımı ve kerahat vakti. Yalnız simge kabul eden yuvalarda sıradaki vaktin simgesi görünür. "Bugün" kutucuğunda beş vakti tek bakışta görür, kıldığınız vakte iki kez dokunarak işaretlersiniz. Bir vaktin son dakikalarında henüz kılmadıysanız kadranda dokunulabilir bir sayaç belirir; kıldığınızda ya da vakit çıktığında kendiliğinden kalkar.',
        ikon: 'clock',
        kartGoster: false,
        detaylar: [
            'Sıradaki vakit, günlük ilerleme, gün dağılımı ve kerahat yuvaları',
            '"Bugün" kutucuğunda iki dokunuşla işaretleme',
            'Kılınmamış vaktin son dakikalarında kadranda sayaç',
            'Saat, uygulamayı her dakika uyandırmadan günceller',
        ],
    },
    // Camideyim Faz 2 (issue #297) — harita, açılış biçimi, izleme kapsamı. Yalnız
    // Android; kart iOS'ta da görüneceği için kapalı.
    {
        id: 'camideyim-harita',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Camideyim: Harita ve "Camide misiniz?"',
        aciklama:
            'Camileri ve algılama alanlarını haritada görün; emin olunamayan durumlarda Namaz modu açılmadan önce size sorulur.',
        detayAciklama:
            'Camideyim artık ezan vaktine yakınlığı, cuma namazını, caminin binası içinde olup olmadığınızı ve hızınızı birlikte değerlendirir. Güven yüksekse Namaz modu kendiliğinden açılır; trafikte caminin önünde beklemek gibi sınırda durumlarda sessiz bir bildirimle "Camide misiniz?" diye sorulur, önünden geçerken hiçbir şey olmaz. İsterseniz her seferinde sorulmasını ya da hep kendiliğinden açılmasını seçebilir, yalnız favori camilerinizin ve eklediğiniz yerlerin izlenmesini isteyebilirsiniz. Haritada bir camiye dokunarak algılama alanını daraltabilir, favorilere ekleyebilir ya da "Cami değil" diye işaretleyebilirsiniz.',
        ikon: 'map-marked-alt',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Haritayı açın',
        kartGoster: false,
        detaylar: [
            'Akıllı, otomatik ya da sorarak açılış',
            'Yakındaki tüm camiler ya da yalnız seçtikleriniz',
            'Haritada alanı 10–150 m arasında ayarlama',
            'Haritanın ortasına iğne koyarak yer ekleme',
            'Harita: © OpenStreetMap katkıcıları, OpenFreeMap',
        ],
    },
    // Camideyim + Namaz modu (issue #297 / #277) — yalnız Android; kart iOS'ta da
    // görüneceği için kapalı (yalnız "Neler Yeni" listesi).
    {
        id: 'camideyim',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Camideyim: Camiye Girince Telefonunuz Anlar',
        aciklama:
            'Android telefonunuzda hangi camiye giderseniz gidin, vakit yakınında birkaç dakika kaldığınızda Namaz modu kendiliğinden açılır.',
        detayAciklama:
            'Tek bir konum seçmeniz gerekmez: telefonunuz yakınınızdaki camileri izler. Önünden geçmek, yandaki kafede oturmak ya da vakit dışında uğramak "camidesiniz" sayılmaz. Camideyken hatırlatmalarınız iptal edilmez, sessiz gelir; çıkınca "Kıldınız mı?" diye sorulur. Yanlış algılanan yeri "Cami değil" diye işaretleyebilir, iş yerinizdeki mescidi kendiniz ekleyebilirsiniz. Konumunuz telefonunuzdan çıkmaz.',
        ikon: 'mosque',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Camideyim ayarını açın',
        kartGoster: false,
        detaylar: [
            'Türkiye\'deki camiler uygulamanın içinde (OpenStreetMap verisi)',
            'Geçip gitmek ve vakit dışında uğramak sayılmaz',
            'Camideyken hatırlatmalar sessiz gelir, sesli anons konuşmaz',
            'Çıkınca tek dokunuşla "Kıldım" diyebilirsiniz',
            '"Son algılamalar" ile neden algılandığını görebilirsiniz',
        ],
    },
    {
        id: 'namaz-modu',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Telefonunuza "Namaz" Modu',
        aciklama:
            'Android telefonunuzun Modlar listesine "Namaz" eklenir; cuma hutbesinde, vakit girince ya da camideyken kendiliğinden açılır.',
        detayAciklama:
            'Aramaların, bildirimlerin ve ekranın namazda ne yapacağını telefonunuzun kendi Modlar ekranında siz seçersiniz; Namaz Akışı yalnız ne zaman açılacağını söyler. "Kıldım" dediğinizde mod kapanır. Modu elle kapatırsanız o vakit için yeniden açılmaz.',
        ikon: 'moon',
        hedefSayfa: 'NamazModuAyarlari',
        ctaEtiketi: 'Namaz modunu açın',
        kartGoster: false,
        detaylar: [
            'Cuma hutbesinde kendiliğinden açılır',
            'İsterseniz her vakit girince birkaç dakika',
            '"Kıldım" deyince kapanır',
            'Hatırlatmalarınız iptal edilmez',
        ],
    },
    // Bilinçli olarak NÖTR ve kartsız (issue #272): özel gün etiketi açıklanmaz,
    // yalnız "Neler Yeni" listesinde görünür.
    {
        id: 'ozel-gun-hatirlatma-sessizligi',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Özel Günlerde Hatırlatmalar Durur',
        aciklama:
            'Özel gün modu açıkken seçtiğiniz tarihler boyunca namaz hatırlatmaları da durur; tarihler bitince kendiliğinden geri gelir.',
        detayAciklama:
            'Özel gün modu artık yalnızca serinizi dondurmaz. Seçtiğiniz tarihler boyunca vakit bildirimleri, namaz muhafızı ve sesli anonsları, vakit sayacı ve nafile hatırlatmaları da gönderilmez. Tarihler bittiğinde hatırlatmalar sizin bir şey yapmanıza gerek kalmadan geri gelir.',
        ikon: 'bell-slash',
        hedefSayfa: 'SeriHedefAyarlari',
        ctaEtiketi: 'Özel gün ayarını açın',
        kartGoster: false,
        detaylar: [
            'Serinizin dondurulması aynen sürer',
            'Bu tarihlerde vakit, muhafız, sayaç ve nafile hatırlatmaları gelmez',
            'Tarihler bitince hatırlatmalar kendiliğinden geri gelir',
        ],
    },
    {
        id: 'katlanabilir-tablet-duzeni',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Katlanabilir ve Tablet Ekranlara Uygun Düzen',
        aciklama:
            'Galaxy Z Fold gibi katlanabilir telefonların iç ekranında ve tabletlerde ana ekran iki sütunda açılır.',
        detayAciklama:
            'Geniş ekranlarda ana ekran artık boşluklu tek bir sütun değil: solda şu anki vakit kartını ve geri sayımı, sağda günlük akışı aynı anda görürsünüz. Ayar ekranları ortada okunaklı bir genişlikte durur. Tablette ve katlanabilir telefonun iç ekranında uygulamayı yatay da kullanabilirsiniz; telefonu katlayıp açtığınızda geri sayım ve baktığınız gün olduğu gibi kalır. Telefon ekranında hiçbir şey değişmez.',
        ikon: 'tablet-alt',
        detaylar: [
            'Geniş ekranda solda vakit kartı, sağda günlük akış',
            'Ayar ekranları ortada okunaklı genişlikte',
            'Tablette ve katlanabilir iç ekranda yatay kullanım',
            'Katlayıp açınca baktığınız gün ve geri sayım korunur',
            'Telefon ekranında düzen aynı kalır',
        ],
    },
    {
        id: 'widget-2-hizli-ayarlar',
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Yeni Widget ve Tek Dokunuşla "Kıldım"',
        aciklama:
            'Android\'de ana ekran widget\'ından, hızlı ayarlar kutusundan ya da uygulama kısayolundan, uygulamayı açmadan "Kıldım" diyebilirsiniz.',
        detayAciklama:
            'Widget yenilendi: küçük başlar, büyüttükçe daha çok şey gösterir. 1×1 boyutta içinde bulunduğunuz vakti ve çıkış saatini, 2×2 boyutta kalan süreyi ve "Kıldım" düğmesini, 4×2 boyutta günün beş vaktini görürsünüz. Kalan süre artık hiçbir zaman eskimez: vakit çıktığında widget bunu hemen gösterir, çıkış saati her boyutta yazılıdır. Widget\'a uzun basıp "Düzenle" ile zemini, opaklığı ve büyük yazılacak bilgiyi seçebilirsiniz. Bildirim panelinin hızlı ayarlarına "Kıldım" kutusunu ekleyebilir, uygulama simgesine uzun basarak Kıble, Kaza defteri ve "Şu anki vakti kıldım" kısayollarını kullanabilirsiniz. Bu kısayollar Samsung Rutinler gibi otomasyon uygulamalarında da eylem olarak görünür.',
        ikon: 'th-large',
        kartGoster: true,
        detaylar: [
            'Widget\'tan, kutudan ya da kısayoldan yaptığınız işaretleme uygulamaya, bildirimlere ve saatinize anında yansır',
            'Güneş doğduktan öğleye kadar işaretleme kapalıdır; sıradaki vakit gösterilir',
            'Bu yollar yalnızca işaretler; geri almak için uygulamayı kullanabilirsiniz',
            'Widget dakikada bir uyanmaz, pilinizi korur',
        ],
    },
    {
        id: 'nafile-namaz-vakitleri',
        surum: '0.31.0',
        tarih: '2026-10-12',
        baslik: 'Nafile Namaz Vakitleri',
        aciklama:
            'Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, girdiklerinde hatırlatılabilirsiniz.',
        detayAciklama:
            'Nafile namazların vakitleri artık uygulamada. Ana ekrandaki günlük akışta kuşluk sabahın, evvâbîn akşamın, teheccüd yatsının ardında yer alır; vakti girince satır yeşile döner. Satıra dokununca vaktin ne zaman başlayıp bittiğini ve en faziletli zamanını okursunuz. Kuşluk ve evvâbîn için vakit girdikten kaç dakika sonra hatırlatılacağınızı seçebilirsiniz. Teheccüd için gecenin son üçte birini ya da yatsıdan itibaren bir zamanı seçebilir, isterseniz sessiz modda da çalan uyandırmayı açabilirsiniz. Vakitler Diyanet\'in açıklamalarına göre hesaplanır.',
        ikon: 'star-and-crescent',
        hedefSayfa: 'NafileAyarlari',
        ctaEtiketi: 'Nafile ayarlarını açın',
        kartGoster: true,
        detaylar: [
            'Kuşluk: güneş doğduktan yaklaşık 45 dk sonra başlar, öğleye 10 dk kalana kadar sürer',
            'Evvâbîn: akşam namazından sonra, yatsıya kadar',
            'Teheccüd: gecenin son üçte biri ya da yatsıdan itibaren seçtiğiniz zaman',
            'Teheccüd uyandırması sessiz modda da çalar',
            'Hepsi varsayılan olarak kapalıdır; istediğinizi açarsınız',
        ],
    },
    {
        id: 'konum-degisim-bildirimi',
        surum: '0.30.0',
        tarih: '2026-09-29',
        baslik: 'Konumunuz Değişince Haber Veriyoruz',
        aciklama:
            'Başka bir ilçeye ya da şehre geçtiğinizde uygulama vakitleri kendiliğinden günceller ve bunu sessiz bir bildirimle size söyler.',
        detayAciklama:
            'Seyahatte otomatik güncelleme açıksa uygulama yer değiştirdiğinizi arka planda fark eder ve namaz vakitlerini yeni konumunuza göre ayarlar. Artık bunu sessizce yapmıyor: ilçeniz ya da şehriniz değiştiğinde "Konumunuz güncellendi" bildirimini görürsünüz. Bildirim ses ve titreşim çıkarmaz, yalnızca bildirim listesinde durur. Aynı ilçe içinde dolaşırken bildirim gelmez. İsterseniz Konum Ayarları\'ndan kapatabilirsiniz.',
        ikon: 'map-marker-alt',
        hedefSayfa: 'KonumAyarlari',
        ctaEtiketi: 'Konum ayarlarını açın',
        kartGoster: true,
        detaylar: [
            'Yalnızca ilçe ya da şehir değişince bildirim gelir',
            'Ses ve titreşim çıkarmaz',
            'Konumu elle yenilediğinizde ekranda kısa bir mesaj görürsünüz',
            'Konum Ayarları\'ndan kapatabilirsiniz',
        ],
    },
    {
        id: 'gunluk-akis-zinciri',
        surum: '0.29.0',
        tarih: '2026-09-29',
        baslik: 'Vakit Saatleri Ana Ekranda',
        aciklama:
            'Günlük Akış artık her vaktin giriş saatini gösteriyor ve kıldığınız namazları yeşil bir zincirle birbirine bağlıyor.',
        detayAciklama:
            'Ana ekrandaki Günlük Akış listesinde her vaktin solunda o vaktin giriş saati yazıyor; günün planını tek bakışta görebilirsiniz. Vakitler bir zincirle birbirine bağlı: kıldığınız namazlardan şu anki vakte kadar olan bağlantılar yeşile döner, arada kılınmamış bir vakit varsa zincir orada kopar. Şu anki vakit ayrıca çerçeveyle öne çıkar.',
        ikon: 'link',
        kartGoster: false,
        detaylar: [
            'Her vaktin giriş saati listede',
            'Kılınan vakitler yeşil zincirle bağlanır',
            'Şu anki vakit çerçeveyle öne çıkar',
            'Ekran okuyucu saati de okur',
        ],
    },
    {
        id: 'muhafiz-giris-yonu',
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Vakit Girer Girmez Hatırlatma',
        aciklama:
            'Artık her vakit için "vakit çıkmadan önce" yerine "vakit girer girmez başla, çıkana kadar sürdür" diyebilirsiniz.',
        detayAciklama:
            'Namaz Muhafızı bugüne kadar yalnızca vaktin çıkışına doğru hatırlatıyordu; yatsı gibi altı-yedi saat süren vakitlerde bu, gecenin çok geç bir saatine kadar hiç ses çıkmaması demekti. Artık her vakit için yön seçebilirsiniz. "Girişinden itibaren" seçtiğinizde hatırlatmalar vakit girer girmez başlar, adım adım sertleşerek vakit çıkana kadar sürer. Yön değiştirdiğinizde hazır anons metinleriniz de otomatik olarak yeni yöne uygun hâle getirilir; kendi yazdığınız metinlere dokunulmaz. Yön seçmediğiniz vakitler tam olarak eskisi gibi çalışmaya devam eder.',
        ikon: 'exchange-alt',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Vakitlerinizi ayarlayın',
        kartGoster: true,
        detaylar: [
            'Her vakit için ayrı yön seçimi',
            'Girişten itibaren başlayıp çıkana kadar süren hatırlatma',
            'Anons metinleri yeni yöne göre kendiliğinden uyarlanır',
            'Yön seçmediğiniz vakitler aynen kalır',
        ],
    },
    {
        id: 'muhafiz-dinamik-esik',
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Uzun Vakitlerde Daha Geniş Aralık',
        aciklama:
            'Hatırlatma adımlarını artık vaktin gerçek uzunluğu kadar erkene alabilirsiniz; 120 dakikalık sabit sınır kalktı.',
        detayAciklama:
            'Önceden bir adımı en fazla "120 dakika kala" olarak ayarlayabiliyordunuz. Bu sınır, öğle gibi kısa vakitler düşünülerek konmuştu ve yatsı gibi uzun vakitlerde gereksiz yere kısıtlıyordu. Artık üst sınır, o vaktin bugünkü gerçek uzunluğundan hesaplanır — yatsıda saatler öncesinden hatırlatma kurabilirsiniz. Çok uzun aralıklarda bildirim yağmuru olmaması için tekrar sıklığı gerektiğinde otomatik seyreltilir ve bu durum ilgili adımın altında size gösterilir. Mevcut ayarlarınız hiç değişmez.',
        ikon: 'arrows-alt-h',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Adımlarınızı ayarlayın',
        kartGoster: false,
        detaylar: [
            'Üst sınır vaktin gerçek uzunluğundan hesaplanır',
            'Yatsı gibi uzun vakitlerde saatler öncesinden hatırlatma',
            'Aşırı sıklıkta bildirim olmaması için otomatik seyreltme',
            'Mevcut ayarlarınız aynen korunur',
        ],
    },
    {
        id: 'cuma-periyodik-hatirlatma',
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Cuma Hatırlatması Tekrarlayabilir',
        aciklama:
            'Cuma hatırlatmasını tek seferlik bırakabilir ya da camiye çıkana kadar belirli aralıklarla tekrarlatabilirsiniz.',
        detayAciklama:
            'Cuma hatırlatması bugüne kadar tek bir bildirim gönderiyordu; yoğun bir işin ortasındaysanız kaçırmanız kolaydı. Artık Bildirim Ayarları\'ndaki cuma bölümünde hatırlatmaya dokunarak tekrar aralığı belirleyebilirsiniz. Ayarı değiştirmediyseniz hatırlatma tam olarak eskisi gibi tek seferlik kalır. Bu bölüm artık Namaz Muhafızı ile aynı arayüzü kullanıyor, böylece iki yerde de aynı şekilde ayar yaparsınız.',
        ikon: 'mosque',
        hedefSayfa: 'BildirimAyarlari',
        ctaEtiketi: 'Cuma ayarlarınıza bakın',
        kartGoster: false,
        detaylar: [
            'İsteğe bağlı tekrar aralığı (5–60 dakika)',
            'Dokunmazsanız eskisi gibi tek seferlik kalır',
            'Namaz Muhafızı ile aynı ayar arayüzü',
            'Cuma yine öğle namazı olarak işaretlenir',
        ],
    },
    {
        id: 'seri-gun-sonu-sayaci',
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Serinizi Kurtaracak Geri Sayım',
        aciklama:
            'Gün bitmeden namazlarınız eksikse, kalan süreyi bildirim gölgeliğinde büyük bir geri sayımla görürsünüz.',
        detayAciklama:
            'Seri gününüz ertesi imsakta biter. O ana iki saat kala bugünkü namazlarınız hâlâ eksikse, iftar ve sahur sayaçlarındaki gibi büyük bir geri sayım bildirimi çıkar ve serinizi kurtarmak için ne kadar vaktiniz kaldığını gösterir. Gününüzü zaten tamamladıysanız bu bildirim hiç görünmez. Gün sonu hatırlatmasını kapattıysanız geri sayım da çıkmaz.',
        ikon: 'hourglass-half',
        hedefSayfa: 'SeriHedefAyarlari',
        ctaEtiketi: 'Seri ayarlarınıza bakın',
        kartGoster: false,
        detaylar: [
            'Seri gününün bitimine iki saat kala görünür',
            'Gününüz tamsa hiç çıkmaz',
            'Kalan süre bildirimde canlı olarak akar',
            'Gün sonu hatırlatması kapalıysa çıkmaz',
        ],
    },
    {
        id: 'muhafiz-titresim-kanali',
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Hatırlatmalar Artık Titreşebilir',
        aciklama:
            'Her hatırlatma adımı için titreşimi ayrı ayrı açabilirsiniz; sessize aldığınız ortamlarda bile uyarıyı fark edersiniz.',
        detayAciklama:
            'Namaz Muhafızı ayarlarında bir adıma dokunduğunuzda "Nasıl uyarsın" bölümünün altında yeni bir "Titreşim" anahtarı görürsünüz. Bu anahtar bildirim ve sesli anonstan bağımsızdır: dilerseniz yalnızca bildirimle, dilerseniz bildirim + titreşimle uyarılabilirsiniz. Titreşimi açtığınız adım için belirgin bir titreşim deseni kullanılır ve uygulama açıkken de aynı desenle titrer. Titreşimi açmadığınız adımların davranışı hiç değişmez.',
        ikon: 'mobile-alt',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Adımlarınızı gözden geçirin',
        kartGoster: false,
        detaylar: [
            'Her adım için ayrı titreşim anahtarı',
            'Bildirim ve sesli anonstan bağımsız çalışır',
            'Uygulama açıkken de aynı desenle titrer',
            'Titreşimi açmadığınız adımlar aynen kalır',
        ],
    },
    {
        id: 'konumu-tek-dokunusla-yenile',
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Konumunuzu Tek Dokunuşla Yenileyin',
        aciklama:
            'Otomatik konum kullanıyorsanız ana ekrandaki konum rozetine dokunarak vakitleri anında güncel konumunuza göre hesaplatabilirsiniz.',
        detayAciklama:
            'Otomatik konum modunda uygulama, şehir değiştirdiğinizi kendiliğinden fark eder; ancak bazı cihazlarda bu algılama gecikebilir ve vakitler bir süre eski konumunuza göre hesaplanmaya devam edebilir. Artık beklemek ya da konum modunu değiştirip geri almak zorunda değilsiniz: ana ekranda vaktin üstündeki konum rozetine dokunmanız yeterli. Yenileme simgesine dokunduğunuzda güncel konumunuz alınır; namaz vakitleri, hatırlatmalar, iftar/sahur sayaçları ve widget aynı anda yeni konumunuza göre tazelenir. Aynı düğme Ayarlar\'daki "Konum" satırında da bulunur. Manuel konum seçtiyseniz düğme görünmez — o zaman konum sizin seçiminizdir.',
        ikon: 'sync-alt',
        hedefSayfa: 'KonumAyarlari',
        ctaEtiketi: 'Konumunuzu kontrol edin',
        kartGoster: true,
        detaylar: [
            'Ana ekrandaki konum rozetine dokunun, konum anında yenilensin',
            'Aynı düğme Ayarlar > Konum satırında da var',
            'Vakitler, hatırlatmalar, sayaçlar ve widget birlikte güncellenir',
            'Yalnızca otomatik konum modunda görünür',
        ],
    },
    {
        id: 'toparlanma-iki-gun',
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Serinizi Artık 2 Günde Kurtarabilirsiniz',
        aciklama:
            'Toparlanma modu kısaldı: bir gün kaçırdığınızda serinizi geri almak için 2 gün tam kılmanız yeterli.',
        detayAciklama:
            'Uzun bir seriyi bir gün kaçırdığınızda toparlanma modu devreye girer ve tam kıldığınız günlerle eski serinizi geri kazanırsınız. Bu süreyi kısalttık: artık 2 gün yeterli. Üstelik toparlanmada kıldığınız günler de serinize eklenir — 22 günlük seriniz varsa toparlanma bittiğinde 24 günle devam edersiniz. Toparlanması hâlihazırda devam edenlerin ilerlemesi korunur, hedefleri de yeni kurala çekilir. Ayrıca aynı gün içinde bir namazı yanlışlıkla geri alıp tekrar işaretlediğinizde toparlanma ilerlemenizin başa dönmesine yol açan hatayı giderdik; ilerlemeniz olduğu gibi kalır.',
        ikon: 'heartbeat',
        kartGoster: false,
        detaylar: [
            'Toparlanma için gereken tam gün sayısı 2 oldu',
            'Toparlanmada kıldığınız günler serinize eklenir',
            'Devam eden toparlanmalarda tamamladığınız günler korunur',
            'İşareti geri alıp tekrar koyunca ilerleme sıfırlanmıyor',
        ],
    },
    {
        id: 'cuma-namazi-hatirlatmasi',
        surum: '0.24.0',
        tarih: '2026-07-28',
        baslik: 'Cuma Namazı Hatırlatması',
        aciklama:
            'Her cuma, öğle vaktinden istediğiniz kadar önce hatırlatalım — camiye rahatça yetişin.',
        detayAciklama:
            'Cuma namazı için ayrı bir hatırlatma ekledik. Diğer vakit hatırlatmalarından farklı olarak bu hatırlatma vakit çıkarken değil, vakit girmeden önce gelir: çünkü cuma günü camiye gitmek için yola çıkacak zamana ihtiyacınız var. Ne kadar önce hatırlatılmak istediğinizi 15 dakika ile 3 saat arasında kendiniz belirlersiniz. Hatırlatma açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür. Cuma öğle namazının yerine geçtiği için ayrı bir kayıt tutulmaz; namazı kıldığınızda öğle namazından işaretlersiniz. Özellik varsayılan olarak kapalıdır, Bildirim Ayarları\'ndan açabilirsiniz.',
        ikon: 'mosque',
        hedefSayfa: 'BildirimAyarlari',
        ctaEtiketi: 'Hatırlatmayı açın',
        kartGoster: true,
        detaylar: [
            'Her cuma, öğle vaktinden önce tek bir hatırlatma',
            'Ne kadar önce hatırlatılacağını siz seçersiniz (15 dk – 3 saat)',
            'Açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür',
            'Namaz kaydınız değişmez; işaretlemeyi öğle namazından yaparsınız',
            'Varsayılan olarak kapalıdır',
        ],
    },
    {
        id: 'muhafiz-adim-ac-kapa',
        surum: '0.24.0',
        tarih: '2026-07-28',
        baslik: 'Hatırlatma Adımlarını Tek Dokunuşla Kapatın',
        aciklama:
            'Her vaktin dört hatırlatma adımını ayrı ayrı açıp kapatabilirsiniz — kapattığınız adım ayarlarını unutmaz.',
        detayAciklama:
            'Muhafız ayarlarında bir vakti açtığınızda, dört hatırlatma adımının her birinin yanında artık bir anahtar var. İstemediğiniz adımı tek dokunuşla kapatabilir, dilediğinizde geri açabilirsiniz. En güzeli: kapattığınız adım ayarlarını hatırlar. Sesli anons seçtiğiniz, kendi müziğinizi ve anons metninizi kurduğunuz bir adımı kapatıp açtığınızda her şey aynen geri gelir — baştan kurmanız gerekmez. Örneğin yatsı vaktinde yalnızca ilk nazik hatırlatmayı bırakıp sert uyarıları kapatabilir, sabah için hepsini açık tutabilirsiniz.',
        ikon: 'toggle-on',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Adımlarınızı ayarlayın',
        kartGoster: false,
        detaylar: [
            'Her vakit için dört adımı ayrı ayrı açıp kapatın',
            'Kapatılan adım sesini, anons metnini ve zamanlamasını korur',
            'Geri açtığınızda kurduğunuz ayarlar aynen döner',
            'Vakit satırındaki rozet kaç adımın açık olduğunu gösterir',
        ],
    },
    {
        id: 'muhafiz-bildirim-sesi-secimi',
        surum: '0.24.0',
        tarih: '2026-07-18',
        baslik: 'Hatırlatma Sesini Kendiniz Seçin',
        aciklama:
            'Her hatırlatma adımı için telefonunuzdaki bildirim seslerinden birini ya da kendi müziğinizi seçebilirsiniz.',
        detayAciklama:
            'Muhafız hatırlatmalarının sesi artık gerçekten sizin seçiminiz. Bir adımın ayarlarını açıp bildirim sesi satırına dokunduğunuzda telefonunuzun ses seçicisi açılır; buradan sistem bildirim seslerinden birini seçebilir ya da cihazınıza kendi eklediğiniz bir müziği kullanabilirsiniz. Seçtiğiniz sesi kaydetmeden önce dinleyebilir, dilediğinizde tek dokunuşla uygulama sesine geri dönebilirsiniz. Seçim adım adım yapılır: örneğin nazik hatırlatma için sakin bir ses, son dakikalardaki acil uyarı için daha dikkat çekici bir ses kullanabilirsiniz. Hazır yoğunluklardan birine geçseniz bile seçtiğiniz sesler korunur. Bu özellik hiçbir yeni izin gerektirmez.',
        ikon: 'music',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Sesinizi seçin',
        kartGoster: true,
        detaylar: [
            'Telefonunuzun bildirim seslerinden seçin ya da kendi müziğinizi kullanın',
            'Her hatırlatma adımı için ayrı ses seçebilirsiniz',
            'Seçmeden önce dinleyin; dilediğinizde uygulama sesine geri dönün',
            'Hazır yoğunluğa geçseniz de seçtiğiniz sesler korunur',
            'Yeni bir izin istenmez',
        ],
    },
    {
        id: 'muhafiz-vakit-seviye-sesli-anons',
        surum: '0.24.0',
        tarih: '2026-07-18',
        baslik: 'Vakte Özel Hatırlatma ve Sesli Anons',
        aciklama:
            'Her namaz vaktini ayrı ayrı ayarlayabilir, dilerseniz hatırlatmayı sesli anonsla duyabilirsiniz.',
        detayAciklama:
            'Muhafız ayarları yenilendi. Sabah, Öğle, İkindi, Akşam ve Yatsı için dört hatırlatma adımını (nazik hatırlatma, uyarı, sert uyarı, acil) vakit vakit ayarlayabilirsiniz. Her adımda kaç dakika kala uyarılacağınızı, ne sıklıkla tekrarlanacağını ve nasıl uyarılacağınızı seçersiniz: sessiz, bildirim, sesli anons ya da ikisi birden. Sesli anons metnini kendiniz yazabilir, {vakit} ve {süre} yer tutucularıyla vakit adının ve kalan sürenin otomatik okunmasını sağlayabilirsiniz. Hazır yoğunluklar da elden geçirildi: art arda gelen ve bir süre sonra fark edilmez hâle gelen tekrarlar azaltıldı, bunun yerine vaktin son dakikalarında sesli anons devreye giriyor. Bu sayede daha az bildirim alırsınız ama aldıklarınızı daha zor kaçırırsınız. Yeni zamanlama hesabınıza kendiliğinden uygulandı; sesli anons ise siz onaylamadan açılmaz. Vakitlere özel ayar yaptıysanız ayarlarınıza dokunulmadı.',
        ikon: 'bullhorn',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Hemen ayarlayın',
        kartGoster: true,
        detaylar: [
            'Her vakit için dört hatırlatma adımını ayrı ayrı ayarlayın',
            'Hatırlatma sayısı azaldı, etkisi arttı: gereksiz tekrarlar yerine son dakikalarda sesli anons (Hafif seçeneği sessiz kalır)',
            'Yeni zamanlama hesabınıza kendiliğinden uygulandı; sesli anons siz onaylamadan açılmaz',
            'Sesli anons metnini kendiniz yazın; vakit adı ve kalan süre otomatik okunur',
            'Bir vaktin ayarını tek dokunuşla diğer tüm vakitlere kopyalayın',
            '“Akışı önizle” ile o vakitte alacağınız tüm hatırlatmaları önceden görün ve dinleyin',
        ],
    },
    {
        id: 'yerel-yedekleme',
        surum: '0.24.0',
        tarih: '2026-06-14',
        baslik: 'Yedekleme & Aktarım',
        aciklama:
            'Verilerinizi şifreli bir dosyaya yedekleyin ve dilediğiniz zaman geri yükleyin.',
        detayAciklama:
            'Tüm namaz kayıtlarınızı ve ayarlarınızı tek dokunuşla şifreli bir yedek dosyasına alabilirsiniz. Yeni bir cihaza geçtiğinizde akıllı sihirbaz, dosyanızı güvenle geri yükler ve mevcut kayıtlarınızla çakışan veriler korunur.',
        ikon: 'cloud-download-alt',
        hedefSayfa: 'YedeklemeAktarim',
        ctaEtiketi: 'Hemen yedekleyin',
        kartGoster: true,
        detaylar: [
            'Tek dokunuşla şifreli yedek oluşturun',
            'Akıllı sihirbazla güvenle geri yükleyin',
            'Çakışan kayıtlarınız korunur — veri kaybı olmaz',
        ],
    },
    {
        id: 'takvim-entegrasyonu',
        surum: '0.22.0',
        tarih: '2026-06-05',
        baslik: 'Namaz Vakitleri Artık Takviminizde',
        aciklama:
            'Seçtiğiniz namaz vakitlerini telefonunuzun takvimine otomatik etkinlik olarak ekleyebilirsiniz. Böylece günlük planınızı vakitlere göre rahatça yaparsınız.',
        detayAciklama:
            'Her vakit için etkinliğin ne zaman başlayacağını ve kaç dakika süreceğini ayrı ayrı belirleyebilirsiniz. Etkinlikler, eklediğiniz her gün için o günün gerçek namaz vakitlerine göre hesaplanır.',
        ikon: 'calendar-alt',
        hedefSayfa: 'TakvimAyarlari',
        ctaEtiketi: 'Hemen kurun',
        kartGoster: true,
        detaylar: [
            'Her vakit için süreyi ve başlangıcı (vakitte / çıkmadan önce / sonra) ayrı ayarlayın',
            'Dilediğiniz kadar gün ileriye, o günün gerçek vakitleriyle etkinlik oluşturun',
            'Takvim, tarih aralığı ve vakit seçerek istediğiniz etkinlikleri kolayca temizleyin',
        ],
    },
    {
        id: 'ana-ekran-widgetlari',
        surum: '0.21.0',
        tarih: '2026-05-20',
        baslik: 'Ana Ekran Widget’ları',
        aciklama:
            'Namaz vakitlerini telefonunuzun ana ekranına ekleyebilir, uygulamayı açmadan bir sonraki vakti ve kalan süreyi görebilirsiniz.',
        detayAciklama:
            'İki farklı boyutta widget sunuyoruz: kompakt ve geniş. Widget’lar gün içinde otomatik güncellenir; ana ekranınızdan ayrılmadan vaktinde haberdar olursunuz. Eklemek için ana ekranınıza uzun basın, “Widget’lar” bölümünden Namaz Akışı’nı seçin.',
        ikon: 'th-large',
        kartGoster: false,
        detaylar: [
            'Kompakt ve geniş olmak üzere iki boyut',
            'Bir sonraki vakit ve kalan süre tek bakışta',
            'Gün içinde otomatik güncellenir',
        ],
    },
];
