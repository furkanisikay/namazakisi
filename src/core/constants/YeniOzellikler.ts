/**
 * Yeni Özellik Kataloğu
 *
 * Uygulamaya eklenen yeni özelliklerin tek kaynağı. Rozet, "Neler Yeni" kartı
 * ve "Neler Yeni" sayfası bu listeden beslenir.
 *
 * Yeni bir özellik duyurmak için: diziye en üste bir nesne ekle. Tüm yüzeyler
 * (rozet + kart + sayfa) otomatik güncellenir; ek kod gerekmez.
 *
 * BİR ÖZELLİK = BİR ÖĞE. Özellik değiştiyse (iç testte ya da sonradan) YENİ öğe
 * ekleme: mevcut öğenin metnini bugünkü hâle getir, `surum`/`tarih`'i son değişikliğin
 * değeriyle güncelle. Görülme `<id>@<surum>` anahtarıyla tutulduğu için yükseltilen
 * `surum` duyuruyu kullanıcıya yeniden "yeni" gösterir (`core/utils/yeniOzellikGorulme.ts`).
 * İki öğeyi birleştirirken en eski `id`'yi koru, diğerlerini `oncekiIdler`'e yaz.
 * `id`'yi asla değiştirme.
 *
 * KOPYA YAZIM KURALLARI (önemli):
 *   - Her zaman kibar "siz" dili kullanın ("ekleyebilirsiniz", "görürsünüz").
 *   - Metin özelliğin BUGÜNKÜ hâlini anlatır; "artık", "eskiden" diye tarihçe yazmayın.
 *   - Teknik terim yok (kanal, TTS, API…): "sesli okuma", "bildirim", "alarm" deyin.
 *   - Cihaz/işletim sistemi sürümü ve izin şartı yazmayın.
 *   - `baslik` dikkat çekici ve net olsun.
 *   - `aciklama` tek bakışta özelliğin ~%70'ini anlatan özet olsun (kapalı görünüm).
 *   - `detayAciklama` + `detaylar` ile tıklayınca açılan detayda tam resmi verin.
 */

/**
 * Duyurunun yalnız özelliği taşıyan cihazda görünmesi için yetenek anahtarı.
 * Çözümü sunum katmanındadır (`presentation/hooks/yeniOzellikYetenegi.ts`).
 */
export type YeniOzellikYetenegi = 'iosWidget' | 'appleWatch' | 'gercekAlarm' | 'googleDrive' | 'ipad' | 'kontrolMerkezi' | 'sesDosyasi';

/** Duyurunun görüneceği platformlar. */
export type YeniOzellikPlatformu = 'android' | 'ios';

export interface YeniOzellik {
    /** Benzersiz kimlik (kalıcı; değiştirme) */
    id: string;
    /**
     * Bu öğeye birleştirilmiş eski duyuruların kimlikleri. Eski (yalın kimlikli) görülme
     * kaydında kullanıcı ancak `id` ile birlikte bunların HEPSİNİ görmüşse öğe görülmüş sayılır.
     */
    oncekiIdler?: string[];
    /**
     * Özelliğin GERÇEKTEN bulunduğu platformlar — ZORUNLU: yalnız Android'e gelen bir
     * özellik iPhone kullanıcısına (ya da tersi) duyurulmaz. İkisine birden geldiyse
     * `['android', 'ios']`. Platform içinde ayrıca bir build/cihaz koşulu varsa
     * (widget uzantısı, saat hedefi) `yetenek` de verilir.
     */
    platformlar: YeniOzellikPlatformu[];
    /** Duyurulan içeriğin son değiştiği sürüm (örn. '0.22.0'); yükseltmek yeniden gösterir */
    surum: string;
    /** Son değişiklik tarihi — 'YYYY-MM-DD' (Neler Yeni sıralaması için) */
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
    /** Verilirse duyuru yalnız bu yetenek varken görünür (ör. iPhone widget'ı). */
    yetenek?: YeniOzellikYetenegi;
}

export const YENI_OZELLIKLER: YeniOzellik[] = [
    // Samimiyet: "Kılındı" yerine dua, günün selamı, saat ailesiyle aynı vakit simgeleri.
    {
        id: 'samimiyet-kabul-olsun',
        platformlar: ['android', 'ios'],
        surum: '0.70.0',
        tarih: '2026-10-22',
        baslik: 'Allah kabul etsin',
        aciklama:
            'Namazı işaretlediğinizde artık "Kılındı" değil, "Allah kabul etsin" yazar. Cuma, kandil, bayram ve Ramazan günlerinde başlıkta kısa bir selam görürsünüz.',
        detayAciklama:
            'Kıldım düğmesi, saat ve sesli asistan aynı duayı söyler; beş vakti tamamladığınız gün kısa bir kart çıkar. Kandil ve bayram günleri Diyanet takviminden alınır. Vakit simgeleri de yenilendi: her vakit saatinizdeki simgeyle aynı.',
        detaylar: [
            'Kıldım sonrası "Allah kabul etsin" — sabah ve yatsıda kısa selam',
            'Beş vakit tamam olunca kısa bir dua kartı',
            'Cuma, kandil, bayram ve Ramazan selamı (Diyanet takvimi)',
            'Her vakte ayrı, saatinizle aynı simge',
        ],
        ikon: 'pray',
    },
    // Cihazlar arası eşitleme (#288). Yalnız Android: Drive yetkisi yerleşik Google
    // hesabı onayıyla alınır. iOS'ta iCloud yolu ayrı bayrağa bağlı ve henüz açık değil.
    {
        id: 'cihazlar-arasi-esitleme-drive',
        platformlar: ['android'],
        surum: '0.69.0',
        tarih: '2026-10-22',
        baslik: 'Verileriniz Tüm Cihazlarınızda',
        aciklama:
            'Kıldığınız namazları, seri ve kaza defterinizi kendi Google Drive alanınızda saklayıp diğer telefonunuz ya da tabletinizle eşitleyebilirsiniz. Veriler sizin belirlediğiniz parolayla şifrelenir.',
        detayAciklama:
            'Google hesabınızı bir dokunuşla bağlarsınız; uygulama yalnız Drive\'daki kendi gizli klasörünü görür, dosyalarınıza erişemez. Verileriniz telefondan çıkmadan önce sizin parolanızla şifrelenir; parolayı biz de bilmeyiz, bu yüzden unutmamanız önemlidir. Bir namazı işaretlediğinizde hemen eşitlenir; isterseniz saatte ya da günde bir, yalnız Wi-Fi’de veya yalnız şarjdayken eşitlenmesini seçebilirsiniz. Güç tasarrufu açıkken eşitleme şarjı bekler. İki cihazda işaretlediğiniz namazlar birleştirilir, hiçbiri silinmez.',
        detaylar: [
            'Google hesabıyla tek dokunuşta bağlanma',
            'Uçtan uca şifreleme: parola yalnız sizde',
            'Drive\'da görünmeyen, yalnız uygulamaya ait klasör',
            'Kılınan namazlar, seri ve kaza defteri birleştirilir',
            'Sıklığı, Wi-Fi ve şarj koşulunu siz seçersiniz',
            'İstediğiniz an bağlantıyı kesebilirsiniz',
        ],
        ikon: 'sync-alt',
        hedefSayfa: 'EsitlemeAyarlari',
        ctaEtiketi: 'Eşitlemeyi açın',
        kartGoster: true,
        // Google Play hizmetleri olmayan cihazda (Huawei vb.) Drive kartı görünmez → duyuru da yok.
        yetenek: 'googleDrive',
    },
    // Cihaz ağı: telefon ↔ tablet "Kıldım" eşitlemesi (olay günlüğü, yerel ağ).
    {
        id: 'cihaz-agi-tablet',
        platformlar: ['android', 'ios'],
        surum: '0.60.0',
        tarih: '2026-10-21',
        baslik: 'Telefon ve tablet birlikte',
        aciklama:
            'Tabletinizi telefonunuza ekleyin: birinde işaretlediğiniz namaz öbürüne de geçer. Hesap yok, sunucu yok; yalnız evinizin Wi-Fi ağı.',
        detayAciklama:
            'Cihazlarım › Tablet ya da telefon ekleyin: bir cihazda kod gösterin, öbüründe okutun; iki ekranda da onay istenir. Aynı Wi-Fi’de ve iki cihazda da uygulama açıkken namaz hemen geçer; değilse ikisi bir sonraki kez birlikte açık olduğunda.',
        detaylar: [
            'İki ekranda onaylı, şifreli eşleştirme',
            'Kıldım her iki cihazda da işaretlenir',
            'İstediğiniz an iki taraftan da kaldırın',
        ],
        ikon: 'tablet-alt',
        hedefSayfa: 'CihazEkle',
        ctaEtiketi: 'Cihaz ekleyin',
    },
    // Cihaz ağı v2: şifreli TV eşitlemesi + Cihazlarım (tasarım 2026-10-21).
    {
        id: 'cihaz-agi-tv-esitleme',
        platformlar: ['android', 'ios'],
        surum: '0.65.0',
        tarih: '2026-10-21',
        baslik: 'TV kıldığınız namazları da bilir',
        aciklama:
            'Cihazlarım sayfasından evdeki TV’leri yönetin. İsterseniz TV, kıldığınız namazları bilir; vakit daralırken kılmadıysanız ekranın altında sessiz bir bant gösterir.',
        detayAciklama:
            'Telefon ile TV, ilk eşleştirmede birbirini onaylar: telefonunuzda TV’nin adını görür, TV’de kumandayla “Ekleyin”e basarsınız. Sonrası şifrelidir ve yalnız evinizin Wi-Fi ağında gider. TV’de durumunuzun sayılması varsayılan olarak kapalıdır; açmazsanız TV yalnız vakitleri gösterir. Ramazan’da iftar ve sahur sayacı, cuma günü cuma kartı da büyük ekranda görünür.',
        detaylar: [
            'Telefonda ve TV’de çift onaylı eşleştirme',
            'Bilgiler şifreli, yalnız ev ağınızda',
            'Vakit daralınca TV’de sessiz hatırlatma bandı',
            'Ramazan’da iftar ve sahur sayacı, cuma günü cuma kartı',
            'TV’yi istediğiniz an iki taraftan da kaldırın',
        ],
        ikon: 'tv',
        hedefSayfa: 'Cihazlarim',
        ctaEtiketi: 'Cihazlarımı açın',
    },
    // Vakit girdi bildirimine vakit başına ses + kendi ses dosyanız (ezan kaydı dahil).
    {
        id: 'vakit-girdi-sesi-ve-kendi-dosyaniz',
        platformlar: ['android'],
        surum: '0.64.0',
        tarih: '2026-10-21',
        baslik: 'Vakit girince kendi sesiniz çalsın',
        aciklama:
            'Her vakit için bildirim sesini ayrı seçin; telefonunuzdaki bir ses dosyasını, örneğin sevdiğiniz bir ezan kaydını da ekleyebilirsiniz.',
        detayAciklama:
            'Hatırlatmalar > Vakit girince sayfasında açık her vaktin altında ses satırı var. Telefonun seslerinden seçebilir ya da kendi dosyanızı ekleyebilirsiniz. Eklediğiniz dosya telefonunuzun Bildirimler klasörüne kopyalanır; asıl dosyayı silseniz de ses çalmaya devam eder. Aynı yol Namaz Muhafızı adımlarında da var.',
        detaylar: [
            'Sabah, öğle, ikindi, akşam ve yatsı için ayrı ses',
            'Kendi ses dosyanız: MP3, M4A, OGG ya da WAV',
            'Seçtiğiniz ses bildirim gelince çalar, bildirimi kapatınca susar',
            'Namaz Muhafızı adımlarında da kendi dosyanızı seçebilirsiniz',
        ],
        ikon: 'music',
        hedefSayfa: 'VakitGirinceAyarlari',
        ctaEtiketi: 'Ses seçin',
        kartGoster: true,
        yetenek: 'sesDosyasi',
    },
    // iPhone "Namazda sessiz" — Odak + Kısayollar rehberi (Android'de Camideyim + Namaz modu var).
    {
        id: 'ios-namazda-sessiz-odak',
        platformlar: ['ios'],
        surum: '0.55.0',
        tarih: '2026-10-20',
        baslik: 'Camide telefonunuz sessize geçsin',
        aciklama:
            'Namaz odağını bir kez kurun: camiye ya da kendi belirlediğiniz bir yere varınca iPhone sessize geçer, ayrılınca eski hâline döner.',
        detayAciklama:
            'iPhone sessize almayı yalnız Odak ile yapar; uygulama bunu kendisi açamaz. Ayarlar > Namazda sessiz sayfası üç kısa adımda yol gösterir: Namaz odağını oluşturun, yakınınızdaki caminin adıyla konum ekleyin, isterseniz Kısayollar ile vakit girdikten sonraki dakikalarda da açılsın. Namaz odağı açıkken hatırlatmalarımız ses çıkarmadan ve ekranı yakmadan gelir.',
        detaylar: [
            'Camiye varınca açılan, çıkınca kapanan Namaz odağı',
            'Yakınınızdaki camiler listede, adına dokunup Haritalar’da görün',
            'Ev, iş ya da başka bir yer için de aynı yol',
            'Kısayollar ile vakit girdikten sonraki dakikalarda sessiz',
            'Odak açıkken hatırlatmalar sessiz gelir, hiçbiri kaybolmaz',
        ],
        ikon: 'volume-mute',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Kurulumu açın',
        kartGoster: true,
    },
    // Android TV panosuna telefondan konum aktarma (QR / 7 haneli kod) + ana ekranda izin onarımı.
    {
        id: 'televizyona-konum-aktarma',
        platformlar: ['android', 'ios'],
        surum: '0.55.0',
        tarih: '2026-10-20',
        baslik: 'Vakitler Televizyonda',
        aciklama:
            'Evdeki Android TV’de Namaz Akışı’nı açın, ekrandaki kare kodu telefonunuzla okutun: konumunuz TV’ye gelir, vakitler büyük ekranda sizin şehrinize göre görünür.',
        detayAciklama:
            'Konum, evinizin Wi-Fi ağında doğrudan TV’ye gider; hesap açılmaz, sunucuya gönderilmez. Wi-Fi ya da kamera yoksa telefonunuzdaki 7 haneli kodu TV’ye kumandayla girebilirsiniz. Bildirim izni ya da tam zamanlı hatırlatma izni sonradan kapanırsa ana ekran bunu söyler ve tek dokunuşla açmanızı sağlar.',
        detaylar: [
            'TV’deki kare kodu okutun, konum TV’ye gelsin',
            'Wi-Fi yoksa 7 haneli kodla aktarın',
            'Hesap yok, sunucu yok; veri evinizden çıkmaz',
            'Kapanan izinler ana ekranda tek dokunuşla onarılır',
        ],
        ikon: 'tv',
        hedefSayfa: 'TelevizyonAyarlari',
        ctaEtiketi: 'TV’ye aktarın',
        kartGoster: true,
    },
    // Kıble ekranı: kendi kamera görünümümüz + 3B pusula (Google kıble bulucu kaldırıldı).
    {
        id: 'kible-kamera-ve-3b-pusula',
        platformlar: ['android', 'ios'],
        surum: '0.52.0',
        tarih: '2026-10-19',
        baslik: 'Kıbleyi Kamerayla Bulun',
        aciklama:
            'Kıble sekmesinde telefonunuzu dik tutup kamerayla çevrenize bakın: Kâbe işareti kıble yönünde belirir, yanında Kâbe’ye uzaklığınız yazar. Pusula açılır açılmaz döner ve titremeden akar.',
        detayAciklama:
            'Kamera görünümünde Kâbe işareti ekranın dışındaysa kenardaki ok hangi yöne döneceğinizi gösterir; işaret ortadaki halkaya oturunca halka yeşile döner ve telefon bir kez titrer. İnternet gerekmez, görüntü kaydedilmez. Kamerasız Pusula görünümünde telefonu düz tuttuğunuzda klasik pusula görürsünüz; dikleştirdikçe pusula ufka yatar ve Kâbe küpü kıble yönünde ayağa kalkar. Yön kayıyorsa telefonunuzu havada 8 çizer gibi birkaç kez hareket ettirin. Ekran okuyucu açıksa yön "Kıble 30° sağınızda" diye okunur.',
        detaylar: [
            'Kamerada Kâbe işareti ve Kâbe’ye uzaklık',
            'Ekran dışındaysa "sağa/sola dönün" okları',
            'Hizalanınca yeşil halka ve tek titreşim',
            'Telefonu dikleştirince ufka yatan 3B pusula',
            'Açılır açılmaz çalışan, titremeyen pusula',
            'İnternetsiz; görüntü kaydedilmez',
        ],
        ikon: 'kaaba',
    },
    // Sade tasarım (Dalga 2 + 3 + 4). Bugünkü kullanıcıya anlamlı olanı söyler.
    {
        id: 'sade-kurulum-ve-ana-ekran',
        platformlar: ['android', 'ios'],
        surum: '0.50.0',
        tarih: '2026-10-19',
        baslik: 'Daha sade uygulama',
        aciklama:
            'Daha az bildirim, gece sessiz saatler ve tüm hatırlatmalar tek sayfada. Yeni sekmeler: Bugün, Kıble, Kaza, İlerleme, Ayarlar.',
        detayAciklama:
            'Ayarlar artık ne yapmak istediğinize göre sıralı: Hatırlatmalar, Namaz vakitleri, Görünüm, Saat ve widget, Yedek, Yardım. Hatırlatmalar sayfasında en üstte "Ne kadar hatırlatalım?" sorusu var; altında her hatırlatma tek satır ve bir anahtar: vakit girince, vakit çıkmadan, gece sessiz saatler, cuma, camiye gitme vakti, yatmadan önce, toplantı çakışırsa, nafile, Ramazan, günü tamamlamadıysam ve özel gün. Normal düzey artık vakit başına üç hatırlatma gönderir ve telefonu titretir; sesli okuma yalnız siz açarsanız konuşur. Gece sessiz saatlerde (varsayılan 23:00 ile imsak arası) vakit çıkmadan hatırlatması gelmez; yatsı hatırlatmaları sessizlik başlamadan önce gelir, kurduğunuz sabah alarmı yine çalar. "Vakit çıkmadan" sayfasında her vakit için ayrı düzey seçebilirsiniz, örneğin akşam için Hafif. Mevcut ayarlarınız değişmedi: Hatırlatmalar sayfasındaki "Daha az bildirim" önerisiyle tek dokunuşta geçebilir, isterseniz geri alabilirsiniz. Ayrıntılı ayar "Kendim ayarlayayım" altında durur. Sesli okuma ve alarm izni bir kez sorulur, tüm hatırlatmalarda geçerlidir. Ana ekranda uyarılar üst üste yığılmaz; vakit kartı bildiğiniz görünümünde; "Kılındı olarak işaretle" düğmesi dokununca yumuşakça "Kılındı"ya dönüşür, yanlışlıkla işaretlediyseniz aynı düğmeye bir kez daha dokunarak geri alabilirsiniz. Alttaki sekmeler de sadeleşti: Kıble artık kendi sekmesinde; seri, kılma oranı ve rozetler tek "İlerleme" sekmesinde. Kaza defterinde kalan sayı ve vakit satırları öne çıktı; hedef, tempo, yeniden hesaplama ve geçmiş "Diğer" menüsünde. Vakitleri takvime ekledikten sonra ayar değiştirirseniz "Şimdi aktarın" bandı çıkar (bir sonraki aktarımınızdan itibaren).',
        detaylar: [
            'Normal düzey: vakit başına üç hatırlatma, titreşimli; sesli okuma yalnız siz açarsanız',
            'Gece sessiz saatler: 23:00 ile imsak arası hatırlatma gelmez, yatsı hatırlatması yatmadan önce gelir',
            'Her vakit için ayrı düzey: örneğin akşam Hafif, diğerleri Normal',
            'Kurulumda kısa sorular: Kıldım\'ı işaretleyecek misiniz, sabah alarmı, cuma',
            'Tüm hatırlatmalar tek sayfada, her biri tek satır',
            'Sesli okuma ve alarm izni bir kez, her hatırlatmada geçerli',
            'Mezhep "Namaz vakitleri"nde, özel gün "Hatırlatmalar"da, kurulum "Yardım"da',
            "Android'de camide ve namaz vakitlerinde sessize alma tek sayfada: Namazda sessiz",
            'Ana ekranda tek uyarı alanı; vakit kartı eski görünümünde, işaretleme ve geri alma aynı düğmede',
            'Durum adları her yerde aynı: Kılındı, Kılınmadı, Vakti geldi, Henüz girmedi',
            'Gün batarken bugünün ikindisini henüz kılmadıysanız bunu hatırlatır',
            'Kıble kendi sekmesinde; seri, kılma oranı ve rozetler "İlerleme"de',
            'Kaza Defteri sade: kalan, vakit satırları ve "Kıldım"; gerisi "Diğer"de',
            'Bir sonraki takvime aktarımdan sonra, bekleyen değişiklik varsa ekranda söylenir',
            'Ayarlarınız ve kayıtlarınız aynen korundu',
        ],
        ikon: 'leaf',
        hedefSayfa: 'Hatirlatmalar',
        ctaEtiketi: 'Hatırlatmalara bakın',
        kartGoster: true,
    },
    // Wear OS saati (#281, #293, saat iş bölümü). Yalnız Android: Wear OS saati yalnız
    // Android telefonla eşleşir; Apple Watch ayrı duyurudur (yetenekli).
    {
        id: 'wear-kadran-yuzeyleri',
        oncekiIdler: ['wear-tesbihat', 'saat-is-bolumu'],
        platformlar: ['android'],
        surum: '0.47.0',
        tarih: '2026-10-18',
        baslik: 'Wear OS Saatinizde Namaz Akışı',
        aciklama:
            'Galaxy Watch gibi Wear OS saatinizde vakti ve kalan süreyi kadranda görür, bilekten "Kıldım" der, tesbihat sayarsınız. Uyandırmanın ve sesli okumanın saatte mi telefonda mı olacağını siz seçersiniz.',
        detayAciklama:
            `Kadranı özelleştirirken bir yuvaya Namaz Akışı'nı seçebilirsiniz: vaktin çıkmasına kalan süre, bugün kılınan vakit sayısı, günün beş vaktinin dağılımı ya da kerahat vakti. "Kalan süre" yuvası yalnız süreyi gösterir ("Öğle 1:23"); çıkış saati ve sıradaki namaz için ayrı "Vakit çıkış saati" ve "Sıradaki namaz" yuvaları var; kadranınızda bu yuva boş kaldıysa "Kalan süre"yi yeniden seçin. Güneş bir namaz vakti olmadığı için listede ve sıradaki vakitte artık görünmez; sabah vaktinde sıradaki namaz öğledir. "Bugün" kutucuğunda beş vakti tek bakışta görür, kıldığınız vakte iki kez dokunarak işaretlersiniz; kılmadığınız bir vaktin son dakikalarında kadranda bir sayaç belirir. Tesbihat sayacında ekrana dokunarak ya da tacı çevirerek sayarsınız; her 33'te saat belirgin şekilde titrer, ekran kapansa da kaldığınız yerden sürdürürsünüz. Ayarlar > Saat'ten uyandırmanın ve sesli okumanın nerede duyulacağını seçersiniz: uyandırmayı saate verirseniz yanınızda uyuyan uyanmaz, saatte kapatmazsanız telefonunuz 3 dakika sonra yedek olarak çalar. Saatteki düğmeyle Namaz modunu açabilir, Camideyim sorusunu bilekten cevaplayabilirsiniz.`,
        detaylar: [
            'Kadranda çubuksuz kalan süre, günlük ilerleme, gün dağılımı ve kerahat yuvaları',
            '"Bugün" kutucuğunda iki dokunuşla işaretleme',
            'Tesbihat: 33 · 33 · 33 + 1, dokunarak ya da tacı çevirerek',
            'Sessiz uyandırma bileğinizde; kapatmazsanız telefon yedek olarak çalar',
            'Saat şarjdayken hatırlatmaları telefon üstlenir',
            'Saatten Namaz modu, "Camide misiniz?" yanıtı ve "Telefonda açın"',
            'Kıble pusulasında yaklaştıkça sıklaşan titreşim',
        ],
        ikon: 'clock',
        hedefSayfa: 'SaatAyarlari',
        ctaEtiketi: 'Saat ayarlarını açın',
        kartGoster: true,
    },
    // Ortak hatırlatma modülü (plan 2026-10-17 + 2026-10-18): her hatırlatma yüzeyi aynı
    // ekranı ve aynı seçenekleri kullanır. Ses ve titreşim seçimi yalnız Android'de olduğu
    // için metin onlardan söz etmez (Android'e özgü duyuru: 'muhafiz-bildirim-sesi-secimi').
    {
        id: 'ek-hatirlatmalar-ortak-takvim',
        oncekiIdler: ['birlesik-hatirlatma-modulu'],
        platformlar: ['android', 'ios'],
        surum: '0.40.0',
        tarih: '2026-10-18',
        baslik: 'Tüm Hatırlatmalar Aynı Ekranda',
        aciklama:
            'Namaz muhafızı, nafile, cuma, camiye gitme, yatış ve takvim hatırlatmaları aynı ekranı ve aynı seçenekleri kullanır: birden çok hatırlatma, tekrar ve sesli okuma.',
        detayAciklama:
            'Bir hatırlatmanın ayarı üç bölümden oluşur: ne zaman gelsin, nasıl uyarsın ve isteğe bağlı gelişmiş ayarlar (tekrar, ton). "Bildirim" ve "Sesli okuma" birbirinden bağımsız açılıp kapanır. Sesli okunan cümleyi her hatırlatmada kendiniz yazabilirsiniz: vakit adı ve dakika gibi parçaları dokunarak eklersiniz, "Dinle" ile nasıl okunacağını duyarsınız. Namaz muhafızı dışındaki hatırlatmalarda cümleyi boş bırakırsanız hatırlatmanın kendi cümlesi okunur; muhafızda boş bırakılan adım sesli okumaz. Cuma, camiye gitme, yatış ve takvim uyarısında en fazla üç hatırlatma kurabilirsiniz; "Akışı önizle" hangi saatlerde hatırlatılacağınızı gösterir.',
        ikon: 'sliders-h',
        hedefSayfa: 'Hatirlatmalar',
        ctaEtiketi: 'İnceleyin',
        kartGoster: true,
        detaylar: [
            'Her hatırlatmada aynı düzen: ne zaman, nasıl, gelişmiş',
            'Bildirim ve sesli okuma iki ayrı anahtar',
            'Sesli okuma cümlesini her hatırlatmada kendiniz yazın',
            'Cuma, camiye gitme, yatış ve takvim uyarısında en fazla üç hatırlatma',
            'Akış önizlemesi saatleri gösterir',
            'Mevcut ayarlarınız aynen korundu',
        ],
    },
    // Cuma namazı hatırlatması (#173) + tekrar + ortak model (PR-A).
    {
        id: 'cuma-namazi-hatirlatmasi',
        oncekiIdler: ['cuma-periyodik-hatirlatma'],
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Cuma Namazı Hatırlatması',
        aciklama:
            'Her cuma, öğle vaktinden istediğiniz kadar önce hatırlatalım — camiye rahatça yetişin.',
        detayAciklama:
            `Cuma hatırlatması vakit çıkarken değil, öğle vakti girmeden önce gelir: camiye gitmek için yola çıkacak zamana ihtiyacınız var. En fazla üç hatırlatma kurabilir, her birinin öğleden ne kadar önce geleceğini (15 dakika ile 3 saat arası) ve camiye çıkana kadar tekrarlanıp tekrarlanmayacağını seçersiniz. Hatırlatma açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür. Cuma öğlenin yerine geçtiği için ayrı bir kayıt tutulmaz; kıldığınızda öğle namazını işaretlersiniz. Özellik varsayılan olarak kapalıdır, Ayarlar › Hatırlatmalar'dan açabilirsiniz.`,
        ikon: 'mosque',
        hedefSayfa: 'CumaHatirlatmaAyarlari',
        ctaEtiketi: 'Hatırlatmayı açın',
        kartGoster: true,
        detaylar: [
            'Öğle vaktinden 15 dakika ile 3 saat önce, en fazla üç hatırlatma',
            'İsterseniz camiye çıkana kadar 5–60 dakikada bir tekrar',
            'Açıkken ana ekranda cuma günü öğle namazı "Cuma" olarak görünür',
            'Namaz kaydınız değişmez; işaretlemeyi öğle namazından yaparsınız',
            'Varsayılan olarak kapalıdır',
        ],
    },
    // "Camide kılacağım" — yürüme süresine göre erken hatırlatma (#292) + ortak model (PR-B).
    {
        id: 'camide-kilacagim',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Camiye Zamanında Yetişin',
        aciklama:
            'Camide kılmak istediğiniz vakitleri seçin; ezandan, camiye yürüme süreniz kadar önce hatırlatalım.',
        detayAciklama:
            `Ayarlar › Hatırlatmalar › "Camiye gitme vakti" bölümünden vakitleri tek tek seçebilir, yürüme süresini ve abdest için hazırlık payını belirleyebilirsiniz. En fazla üç hatırlatma kurabilirsiniz; yürüme ya da hazırlık sürenizi değiştirdiğinizde hepsi aynı farkla kayar. Cuma hatırlatmanız açıksa cuma günü öğle için ayrıca hatırlatılmazsınız.`,
        ikon: 'walking',
        hedefSayfa: 'CamiyeGitAyarlari',
        ctaEtiketi: 'Vakitlerinizi seçin',
        kartGoster: false,
        detaylar: [
            'Beş vakit için ayrı ayrı açılır',
            'İlk hatırlatma ezandan yürüme süresi + hazırlık payı kadar önce gelir',
            'Süreleri değiştirince bütün hatırlatmalar birlikte kayar',
            'Özel gün modunda hatırlatma gönderilmez',
        ],
    },
    // Yatış saatine göre yatsı hatırlatması + gün sonu muhasebesi (#290) + ortak model (PR-B).
    {
        id: 'yatis-hatirlatmasi',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Yatmadan Önce Hatırlatma',
        aciklama:
            'Her zamanki yatış saatinizi girin; yatsıyı işaretlemediyseniz uyumadan önce hatırlatalım, gün sonunda eksik vakitlerinizi tek bildirimde görün.',
        detayAciklama:
            'Yatsı vakti saatlerce sürer ve muhafızın "vakit çıkıyor" uyarısı sabaha kalır; asıl kayıp çoğu zaman uykuya dalmaktır. Yatış saatinizden belirlediğiniz süre önce hatırlatma gelir: yatsıyı işaretlemediyseniz yatsı hatırlatması, işaretlediyseniz günün muhasebesi ("Bugün 4/5 · öğle işaretlenmemiş"). En fazla üç hatırlatma kurabilirsiniz; tekrarlar aynı içeriği taşır. Tek eksik varsa bildirimden "Kıldım" diyebilir ya da kaza defterinize ekleyebilirsiniz. Özel gün aralığında gönderilmez.',
        ikon: 'bed',
        hedefSayfa: 'YatisHatirlatmaAyarlari',
        ctaEtiketi: 'Yatış saatinizi girin',
        kartGoster: true,
        detaylar: [
            'Gece yarısından sonra yatıyorsanız hatırlatma yine o günün namazlarını sayar',
            'Yatış saatiniz yatsı girmeden önceyse yatsı hatırlatması yatsı girdikten sonraya kayar',
            'Birden fazla eksik varsa bildirim uygulamayı açıp incelemenizi önerir',
        ],
    },
    // Takvim çakışması uyarısı (#291) + ortak model (PR-C) — varsayılan kapalı, açık rıza ile açılır.
    {
        id: 'takvim-cakismasi-uyarisi',
        platformlar: ['android', 'ios'],
        surum: '0.37.0',
        tarih: '2026-10-17',
        baslik: 'Toplantı Vakte Denk Gelirse Haber Verelim',
        aciklama:
            'Takviminizdeki bir etkinlik bir namaz vaktinin sonunu kaplıyorsa, etkinlik başlamadan önce "toplantıdan önce kılın" diye uyaralım.',
        detayAciklama:
            'Ayarlar › Hatırlatmalar › "Toplantı çakışırsa"yı açtığınızda, bir etkinlik bittiğinde vaktin çıkmasına 10 dakikadan az kalıyorsa etkinlikten önce uyarılırsınız; vakti baştan sona kaplayan etkinliklerde ara verip kılmayı planlamanız için haber verilir. En fazla üç hatırlatma kurabilir, etkinlik başlayana kadar tekrarlatabilirsiniz; namazı kıldığınızda kalanlar iptal edilir. Özellik varsayılan olarak kapalıdır ve açarken nelerin okunduğunu açıkça gösteririz: takviminiz yalnızca bu cihazda okunur, hiçbir yere gönderilmez ve saklanmaz.',
        ikon: 'calendar-times',
        hedefSayfa: 'TakvimCakismaAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: false,
        detaylar: [
            'Etkinlik adı varsayılan olarak bildirimde görünmez; isterseniz açabilirsiniz',
            'Etkinlik adı sesli okumada ve alarm ekranında hiçbir zaman yer almaz',
            'Tüm gün etkinlikleri ve "meşgul değil" işaretli etkinlikler sayılmaz',
            'İkindide güneşin sararmasından (kerahat) önceki an esas alınır',
        ],
    },
    // Nafile namaz vakitleri (#77) + çok adımlı hatırlatma (#273) + gerçek alarm ve gösterge (Faz 2).
    {
        id: 'nafile-namaz-vakitleri',
        oncekiIdler: ['nafile-kanal-ve-adimlar', 'ortak-hatirlatma-yetenekleri'],
        platformlar: ['android', 'ios'],
        surum: '0.34.0',
        tarih: '2026-10-17',
        baslik: 'Nafile Namaz Vakitleri',
        aciklama:
            'Kuşluk, evvâbîn ve teheccüd vakitlerini ana ekranda görebilir, namaz hatırlatmasındaki gibi birden çok hatırlatma kurabilirsiniz.',
        detayAciklama:
            `Ana ekrandaki günlük akışta kuşluk sabahın, evvâbîn akşamın, teheccüd yatsının ardında yer alır; vakti girince satır yeşile döner. Satıra dokununca vaktin ne zaman başlayıp bittiğini ve en faziletli zamanını okursunuz. Bir nafilenin ana ekranda görünüp görünmeyeceğini kendi kartındaki "Ana ekranda göster" satırından seçersiniz; hatırlatması kapalıyken de görünür. Her nafileye en fazla üç hatırlatma kurabilir, vakit girince mi yoksa vakit çıkmadan mı geleceğini seçersiniz; zaman şeridi bugünkü planı gösterir. Hatırlatma bildirim ya da sesli okuma olarak gelebilir. Teheccüd için gecenin son üçte birini ya da yatsıdan itibaren bir zamanı seçebilirsiniz. Bildirimdeki "Kıldım" o günün kalan hatırlatmalarını durdurur; puana ve seriye karışmaz. Vakitler Diyanet'in açıklamalarına göre hesaplanır.`,
        ikon: 'star-and-crescent',
        hedefSayfa: 'NafileAyarlari',
        ctaEtiketi: 'Nafile ayarlarını açın',
        kartGoster: true,
        detaylar: [
            'Kuşluk: güneş doğduktan yaklaşık 45 dk sonra başlar, öğleye 10 dk kalana kadar sürer',
            'Evvâbîn: akşam namazından sonra, yatsıya kadar',
            'Teheccüd: gecenin son üçte biri ya da yatsıdan itibaren seçtiğiniz zaman',
            'Nafile başına en fazla üç hatırlatma; bildirim ya da sesli okuma',
            '"Ana ekranda göster" her nafilenin kendi kartında',
            'Hepsi varsayılan olarak kapalıdır; istediğinizi açarsınız',
        ],
    },
    // Gerçek alarm (#74): Android'de telefonun alarmı, iPhone'da sistem alarmı (yalnız alarmı
    // destekleyen iOS'ta görünür → `gercekAlarm` yeteneği). Alarm kapsamı (ilk / her uyarı) Faz 2.
    {
        id: 'gercek-alarm',
        oncekiIdler: ['gercek-alarm-iphone'],
        platformlar: ['android', 'ios'],
        surum: '0.34.0',
        tarih: '2026-10-17',
        baslik: 'Hatırlatmalarda Gerçek Alarm',
        aciklama:
            'İstediğiniz hatırlatma adımında "Gerçek alarm"ı açın: o adımda telefonunuzun alarmı çalar, sessiz moddayken de duyulur.',
        detayAciklama:
            'Bir hatırlatma adımına dokunup "Gerçek alarm" anahtarını açabilirsiniz; örneğin sabah için vakit girer girmez, öğle için vaktin çıkmasına 20 dakika kala. Alarmın yalnız adımın ilk uyarısında mı yoksa her tekrarında mı çalacağını seçersiniz; diğer tekrarlar normal bildirimle gelir. Alarm ekranında "Kıldım" düğmesini görürsünüz. "Akışı önizle" alarmın çalacağı saatleri ayrıca gösterir.',
        ikon: 'clock',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Alarmı kurun',
        kartGoster: true,
        yetenek: 'gercekAlarm',
        detaylar: [
            'Namaz muhafızında ve nafile hatırlatmalarında kullanılabilir',
            'Alarm yalnız ilk uyarıda ya da her uyarıda çalabilir',
            'Alarmı durdurmak namazı kılındı saymaz; "Kıldım" düğmesi ya da uygulama işaretler',
            'Alarmın çalamadığı durumlarda aynı hatırlatma bildirim olarak gelir',
        ],
    },
    // Kaza Defteri 2.0 — hareket defteri, otomatik ekleme, yeniden hesaplama önizlemesi.
    {
        id: 'kaza-defteri-2',
        platformlar: ['android', 'ios'],
        surum: '0.33.0',
        tarih: '2026-10-16',
        baslik: 'Kaza Defteri Her Hareketi Hatırlıyor',
        aciklama:
            'Eklediğiniz, kıldığınız ve bildirimden gelen her kaza ayrı bir satır olarak saklanır; yeniden hesapladığınızda emeğiniz kaybolmaz. İsterseniz kılınmayan farzlar namaz günü bitince kendiliğinden eklenir.',
        detayAciklama:
            'Kaza Defteri\'nin "Hareket geçmişi" ekranında her kaydın ne zaman, hangi kaynaktan ve hangi cihazdan geldiğini görebilirsiniz. Sihirbazla yeniden hesapladığınızda yalnız hesaplanan borç değişir; elle eklediğiniz, bildirimden eklenen ve kıldığınız kazalar yeni hesaba kendiliğinden uygulanır ve uygulamadan önce önizlenir. Otomatik ekleme varsayılan olarak kapalıdır: açarsanız işaretlemediğiniz farzlar ertesi imsakta deftere eklenir, sonradan "kıldım" derseniz geri alınır. Hiç işaret olmayan günler önce size sorulur.',
        ikon: 'book',
        kartGoster: true,
        detaylar: [
            'Hiçbir kayıt silinmez: temizlik kayıtları gizler ve her temizlik geri alınabilir',
            'Vitir namazının otomatik eklenmesi ortak mezhep ayarınıza bağlıdır (Hanefî: vacip)',
            'Hesaplanan borçtan fazla kıldığınız kazalar ayrıca gösterilir',
            'İki cihazınızdaki defterler birbirini ezmeden birleşir',
        ],
    },
    // Apple Watch uygulaması (#285) — yalnız saat hedefini taşıyan iOS build'inde
    // görünür (saat bayrağı kapalıyken duyuru da yok).
    {
        id: 'apple-watch-uygulamasi',
        platformlar: ['ios'],
        surum: '0.31.0',
        tarih: '2026-10-14',
        baslik: 'Namaz Akışı Apple Watch\'ta',
        aciklama:
            'İçinde bulunulan vakti ve çıkışına kalan süreyi bileğinizden görebilir, namazınızı saatten "Kıldım" diyerek işaretleyebilirsiniz.',
        detayAciklama:
            'Saat uygulaması vakitleri iPhone\'unuzdan alır; günün beş vakti, kalan süre ve kılınmışlık bilgisi bileğinizde görünür. "Kıldım" dediğiniz vakit iPhone\'daki kaydınıza işlenir. Saat kadranına komplikasyon ekleyerek vakti ve geri sayımı uygulamayı açmadan görebilirsiniz. Saatte ayrıca bir tesbihat sayacı vardır; Digital Crown\'u çevirerek ya da ekrana dokunarak sayabilirsiniz.',
        ikon: 'clock',
        kartGoster: true,
        yetenek: 'appleWatch',
        detaylar: [
            'Saat uygulamasını iPhone\'unuzdaki Watch uygulamasından yükleyebilirsiniz',
            'Hatırlatmalar iPhone bildirimleriyle bileğinize gelir; saat ikinci bir bildirim kurmaz',
            'Telefonunuz yanınızda değilken dediğiniz "Kıldım", bağlantı kurulunca işlenir',
            'Tesbihat sayacı yalnız saatte tutulur ve 90 dakika sonra sıfırlanır',
        ],
    },
    // iOS widget'ları + canlı etkinlik (#295, #282 iOS ikizi) — yalnız uzantıyı
    // taşıyan iOS build'inde görünür (widget bayrağı kapalıyken duyuru da yok).
    {
        id: 'ios-widget-canli-etkinlik',
        platformlar: ['ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'iPhone\'da Kilit Ekranı ve Dinamik Ada',
        aciklama:
            'Vakti ve çıkışına kalan süreyi kilit ekranına, StandBy\'a ve ana ekrana widget olarak ekleyebilirsiniz; vakit çıkarken geri sayım Dinamik Ada\'da görünür.',
        detayAciklama:
            'Kilit ekranını düzenleyip "Namaz Akışı"nı seçerek içinde bulunulan vakti, kalan süreyi ve çıkış saatini görebilirsiniz. Ana ekrandaki widget günün beş vaktini gösterir ve "Kıldım" düğmesiyle vakti uygulamayı açmadan işaretlemenizi sağlar. Canlı etkinlik için hangi geri sayımın ne zaman başlayacağını Ayarlar\'dan seçebilirsiniz.',
        ikon: 'mobile-alt',
        hedefSayfa: 'NowBarAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: true,
        yetenek: 'iosWidget',
        detaylar: [
            'Kilit ekranı ve StandBy yalnız gösterir; işaretleme ana ekranda ve canlı etkinlikte yapılır',
            'Canlı etkinlik uygulama açıkken başlar, sonra uygulamayı kapatsanız da sürer',
            'Geri sayımı telefonunuz çizer; widget pil tüketmek için sürekli yenilenmez',
        ],
    },
    // Seferîlik bilgi kartı (#296) — kart kapalı; özellik ana ekranda kendiliğinden çıkar.
    {
        id: 'seferilik-bilgi-karti',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Yolculukta Bilgi Kartı',
        aciklama:
            'İkamet yerinizden yaklaşık 90 km uzaklaştığınızda ana ekranda, Diyanet\'in yolculuk (seferîlik) fetvalarını mezhebinize göre özetleyen kısa bir bilgi kartı görürsünüz.',
        detayAciklama:
            'Kart bir hüküm vermez; ölçüyü (yaklaşık 90 km), kalış süresini, dört rekâtlı farzların kısaltılmasını (kasr) ve namazları birleştirmeyi (cem) Diyanet Din İşleri Yüksek Kurulu fetvalarına dayanarak özetler ve kaynağa yönlendirir. Yolculuk başına bir kez çıkar, bildirim göndermez. Ayarlar\'dan mezhebinizi (Hanefî veya Şâfiî) ve ikamet yerinizi seçebilir, kartı kapatabilirsiniz.',
        ikon: 'route',
        hedefSayfa: 'SeferilikAyarlari',
        ctaEtiketi: 'İnceleyin',
        kartGoster: false,
        detaylar: [
            'Mezhep seçimi yalnız kartın içeriğini değiştirir; namaz vakitleri aynı kalır',
            'Mesafe kuş uçuşu ölçülür; yolcu sayılıp sayılmadığınız yolculuğunuzun amacına, süresine ve niyetinize bağlıdır',
            '"Burası evim" ile ikamet yerinizi tek dokunuşla güncelleyebilirsiniz',
        ],
    },
    // Bileklik dostu başlıklar (#287) — kart kapalı; rehber yalnız Android'de.
    {
        id: 'bileklik-dostu-basliklar',
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Bilekliğinizde Tek Bakışta Okunur',
        aciklama:
            'Hatırlatma başlıkları vakit adı ve kalan süreyle başlar: "Yatsı · 25 dk kaldı". Galaxy Fit, Mi Band gibi küçük ekranlarda bile önemli kısım görünür.',
        detayAciklama:
            'Bileklikler telefon bildiriminin başlığından yalnız ilk birkaç kelimeyi gösterir. Namaz muhafızı, cuma, camiye gidiş ve yatmadan önce hatırlatmalarının başlıkları bu yüzden vakit adı ve süreyle başlar. "Öğle vakti girdi" gibi vakit bildirimleri aynı kalır; otomasyonlarınız çalışmaya devam eder. Saat ve widget sayfasındaki rehber, bilekliğinize yalnız namaz hatırlatmalarının gitmesi için neler yapabileceğinizi anlatır.',
        ikon: 'clock',
        hedefSayfa: 'SaatVeWidgetAyarlari',
        ctaEtiketi: 'Rehberi inceleyin',
        kartGoster: false,
        detaylar: [
            'Acil hatırlatmalarda vakit adı büyük harfle yazılır: "İKİNDİ · 3 dk · VAKİT ÇIKIYOR"',
            'Bileklik uygulamaları bildirimleri uygulama bazında seçer; rehber dürüstçe neyin mümkün olduğunu anlatır',
            '"Kıldım" düğmesinin bileklikte görünmesi modele göre değişir',
        ],
    },
    // Sade görünüm (#295) — yaşlı kullanıcılar için tek ekran.
    {
        id: 'sade-gorunum',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Sade Görünüm',
        aciklama:
            'Ana ekranda yalnız şu anki vakit, kalan süre ve büyük bir "Kıldım" düğmesi: büyüklerimiz için tek bakışta anlaşılan, dokununca sesli okunan bir ekran.',
        detayAciklama:
            'Ayarlar > Görünüm\'den açtığınızda ana ekran sadeleşir: vaktin adı ve kalan süre büyük yazıyla görünür, altında sıradaki vakit yer alır. Vakte dokunduğunuzda "Şimdi ikindi vakti. Çıkmasına 42 dakika var." gibi sesli okunur. Diğer bölümlere ekranın altındaki "Tüm uygulamayı açın" bağlantısıyla geçebilirsiniz; uygulamayı kapatıp açtığınızda sade görünüme dönülür.',
        ikon: 'eye',
        hedefSayfa: 'GorünumAyarlari',
        ctaEtiketi: 'Görünümü açın',
        kartGoster: true,
        detaylar: [
            'Telefonunuzun yazı boyutu ayarına uyar',
            'Kalan süre dakikada bir güncellenir',
            'Kerahat vaktinde işaretlemeden önce yine size sorulur',
        ],
    },
    // Samsung Rutinler + Tasker/MacroDroid/Automate eklentisi (#278) + "Kıldım" güven
    // listesi ve anında susturma (#299) — yalnız Android; kart kapalı.
    {
        id: 'otomasyonlarla-kullanin',
        oncekiIdler: ['kildim-guven-listesi'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Otomasyonlarla Kullanın',
        aciklama:
            'Vakit girince telefonunuz sessize alınsın, camiye girince bir şey kapansın: Samsung Rutinler, Tasker ve MacroDroid ile Namaz Akışı\'nı birlikte kullanabilirsiniz.',
        detayAciklama:
            'Samsung Rutinler\'in "Bildirim alındığında" koşuluna "Öğle vakti girdi" ya da "Camidesiniz" gibi sabit bir anahtar kelime yazarak rutininizi başlatabilir, "Şu anki vakti kıldım" kısayolunu rutinin eylemi yapabilirsiniz. Tasker, MacroDroid ve Automate\'te Namaz Akışı eklentisi vakit girdi, vakit çıkıyor ve camidesiniz olaylarını verir; "Kıldım" eylemiyle namazınızı işaretler. Bir uygulama namazınızı ilk kez işaretlemek istediğinde size bir kez sorulur: her zaman izin verebilir, yalnız o seferlik onaylayabilir ya da engelleyebilirsiniz. Bildirimdeki "Kıldım" uygulamayı açmadan o vaktin kalan uyarılarını ve sesli okumalarını hemen susturur.',
        ikon: 'magic',
        hedefSayfa: 'OtomasyonRehberi',
        ctaEtiketi: 'Rehberi açın',
        kartGoster: false,
        detaylar: [
            'Vakit bildirimleri sabit bir başlıkla gelir: "Öğle vakti girdi"',
            'Tasker değişkenleri: %vakit, %vakitkodu, %tarih, %kalandk, %cami',
            'İzin verdiğiniz otomasyon bir daha onay sormadan çalışır; engellediğinizin istekleri yok sayılır',
            'Kararlarınızı "Kıldım işaretleyebilen uygulamalar" bölümünden değiştirebilirsiniz',
            'Ana ekran kısayolları, widget ve hızlı ayarlar kutusu her zaman çalışır',
        ],
    },
    // "Her farzla bir kaza" önerisi (#294).
    {
        id: 'her-farzla-bir-kaza',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Her Farzla Bir Kaza',
        aciklama:
            'Kaza borcunuz varsa, ana ekranda bir farzı kıldım olarak işaretlediğinizde bir kaza kılmanızı öneririz; tek dokunuşla defterinizden düşebilirsiniz.',
        detayAciklama:
            'Yeni bir hatırlatma yerine zaten kıldığınız farza bağlanan küçük bir öneridir: öğleyi işaretlediğinizde bir öğle kazası, o vaktin borcu yoksa en çok borcunuz olan kaza önerilir. "Şimdi değil" derseniz o gün bir daha sorulmaz. Kaza Defteri\'ndeki "Her farzla bir kaza" anahtarıyla kapatabilirsiniz.',
        ikon: 'book',
        kartGoster: false,
        detaylar: [
            'Yalnız o anki vaktin farzını işaretlediğinizde sorulur',
            'Kerahat vaktinde sorulmaz',
            'Kaza defteriniz boşsa hiç sorulmaz',
            'Aynı vakit için günde en fazla bir kez sorulur',
        ],
    },
    // Siri, Kısayollar ve Odak filtresi (#279) — yalnız iPhone; kart kapalı.
    {
        id: 'ios-siri-kisayollar-odak',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "iPhone'da Siri, Kısayollar ve Odak",
        aciklama:
            "Siri'ye sıradaki namazı sorabilir, kıldığınız vakti sesinizle işaretleyebilir ve \"Namaz\" Odağınızda hatırlatmaları sessize alabilirsiniz.",
        detayAciklama:
            "Kurulum gerekmez: \"Namaz Akışı sıradaki namaz ne zaman\", \"Namaz Akışı şu anki vakti kıldım\" ya da \"Namaz Akışı kıbleyi aç\" demeniz yeterli. Aynı eylemler Kısayollar uygulamasında, Spotlight aramasında ve Eylem düğmesinde de görünür. Kıldım işaretlemesi siz onayladıktan sonra yapılır ve uygulamayı açtığınızda takviminize işlenir. Ayarlar > Odak bölümünden kendi Odağınıza Namaz Akışı filtresini ekleyip \"Hatırlatmaları sessiz ver\"i açarsanız, o Odak açıkken namaz hatırlatmaları ekranı yakmadan ve ses çıkarmadan gelir.",
        ikon: 'microphone',
        kartGoster: false,
        detaylar: [
            'Siri sıradaki namazı ve giriş saatini söyler',
            '"Şu anki vakti kıldım" onayınızla işaretler',
            'Odak filtresi açıkken hatırlatmalar en fazla 3 saat sessiz gelir',
            'Kısayollar için yeni eylemler: sıradaki vaktin adı, sıradaki vakte kalan dakika, şu anki vakit kılındı mı',
            'Bu eylemlerle "Eğer" bloğu kurup kendi otomasyonunuzu yazabilirsiniz',
        ],
    },
    // Android canlı sayaç: durum çubuğu + Samsung Now Bar (#282) ve öğe seçimi (ikinci aşama).
    // Yalnız Android; kart kapalı.
    {
        id: 'sayac-canli-guncelleme',
        oncekiIdler: ['now-bar-secimi'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Geri Sayım Durum Çubuğunda ve Now Bar\'da',
        aciklama:
            'Vaktin son dakikaları, iftar ve sahur sayacı durum çubuğunda kalan süreyle görünür; Samsung cihazlarda Now Bar\'a da taşınır. Neyin ne zaman görüneceğini siz seçersiniz.',
        detayAciklama:
            `Kalan süreyi bildirim panelini açmadan görebilirsiniz; bildirimde vaktin ne kadarının geçtiği bir çubukla gösterilir, vakit sayacındaki "Kıldım" düğmesiyle tek dokunuşta işaretlersiniz. Ayarlar'daki "Now Bar ve canlı sayaçlar" sayfasında her vakti, iftarı, sahuru, cumayı, nafileleri ve seriyi tek tek açabilir, geri sayımın "vakit girince" mi yoksa "son dakikalarda" mı başlayacağını seçebilirsiniz. Aynı anda yalnız bir sayaç öne çıkar; Wear OS saatiniz de aynı seçimi kullanır. Bu gösterimi telefonunuzun bildirim ayarlarındaki "Canlı güncellemeler" seçeneğiyle kapatabilirsiniz.`,
        ikon: 'stopwatch',
        hedefSayfa: 'NowBarAyarlari',
        ctaEtiketi: 'Seçimlerinizi yapın',
        kartGoster: false,
        detaylar: [
            'Durum çubuğunda kalan süre: "12 dk", "1 sa 5 dk"',
            'Vakit sayacında tek dokunuşla "Kıldım"',
            'Beş vakit ayrı ayrı; cuma, nafileler ve seri için de sayaç',
            'Sayaç tam zamanında başlar; uygulamanın açık olması gerekmez',
        ],
    },
    // Bildirim sınırı rehberi (#298).
    {
        id: 'bildirim-siniri-rehberi',
        platformlar: ['android', 'ios'],
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
    // Namaz Muhafızı: vakte özel adımlar + sesli okuma (0.24), adım aç/kapa (0.24), giriş
    // yönü ve vakit uzunluğuna kadar eşik (0.25), 1–6 hatırlatma + ton (#274, 0.31).
    {
        id: 'muhafiz-vakit-seviye-sesli-anons',
        oncekiIdler: [
            'muhafiz-adim-ac-kapa',
            'muhafiz-giris-yonu',
            'muhafiz-dinamik-esik',
            'muhafiz-hatirlatma-sayisi',
        ],
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Her Vakte Kendi Hatırlatma Akışı',
        aciklama:
            'Namaz Muhafızı\'nda her vakit için 1 ile 6 arasında hatırlatma kurar; ne zaman başlayacağını, tonunu ve sesli okunup okunmayacağını vakit vakit seçersiniz.',
        detayAciklama:
            `Her vakit için "1. hatırlatma, 2. hatırlatma…" diye kendi akışınızı kurarsınız; numaralar zamana göre kendiliğinden sıralanır. Hatırlatmaların vaktin çıkışına doğru mu yoksa vakit girer girmez başlayıp çıkana kadar mı süreceğini seçersiniz; zaman şeridi bugünkü planı gösterir. Bir hatırlatmayı vaktin o günkü uzunluğu kadar erkene alabilirsiniz; çok uzun aralıklarda bildirim yağmuru olmasın diye tekrar sıklığı gerektiğinde seyreltilir ve bu adımın altında söylenir. Her hatırlatmada Nazik, Uyarı, Sert ya da Acil tonu ayrı seçersiniz; Acil ton yalnız vaktin son 15 dakikasında Rahatsız Etmeyin'i deler. İstemediğiniz adımı tek dokunuşla kapatırsınız; kapattığınız adım ayarlarını unutmaz. Hazır yoğunluklar (Hafif, Normal, Yoğun) gereksiz tekrarlar yerine son dakikalarda sesli okumayı kullanır; sesli okuma siz onaylamadan açılmaz. "Akışı önizle" ile o vakitte alacağınız tüm hatırlatmaları önceden görür ve dinlersiniz.`,
        ikon: 'shield-alt',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Hatırlatmalarınızı düzenleyin',
        kartGoster: true,
        detaylar: [
            'Vakit başına en fazla 6 hatırlatma; istemediğinizi silin ya da kapatın',
            'Vaktin çıkışına doğru ya da vakit girer girmez başlayan hatırlatma',
            'Ton (Nazik, Uyarı, Sert, Acil) her hatırlatmada ayrı seçilir',
            'Vaktin bitmesine çok varken sert ton bile "vakit çıkıyor" demez',
            'Bir vaktin ayarını tek dokunuşla diğer vakitlere kopyalayın',
            '"Akışı önizle" ile tüm hatırlatmaları önceden görün ve dinleyin',
        ],
    },
    // Camideyim (#297) + harita ve güven puanı (Faz 2) — yalnız Android; kart iOS'ta da
    // görüneceği için kapalı.
    {
        id: 'camideyim',
        oncekiIdler: ['camideyim-harita'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Camideyim: Camiye Girince Telefonunuz Anlar',
        aciklama:
            'Hangi camiye giderseniz gidin, vakit yakınında birkaç dakika kaldığınızda Namaz modu kendiliğinden açılır; emin olunamayan durumlarda önce size sorulur.',
        detayAciklama:
            `Tek bir konum seçmeniz gerekmez: telefonunuz yakınınızdaki camileri izler ve ezan vaktine yakınlığı, cuma namazını, caminin binası içinde olup olmadığınızı ve hızınızı birlikte değerlendirir. Güven yüksekse Namaz modu kendiliğinden açılır; trafikte caminin önünde beklemek gibi sınırda durumlarda sessiz bir bildirimle "Camide misiniz?" diye sorulur, önünden geçerken ya da vakit dışında uğradığınızda hiçbir şey olmaz. Camideyken hatırlatmalarınız iptal edilmez, sessiz gelir; çıkınca "Kıldınız mı?" diye sorulur. Haritada camileri ve algılama alanlarını görür, bir camiye dokunarak alanı daraltabilir, favorilere ekleyebilir ya da "Cami değil" diye işaretleyebilirsiniz; iş yerinizdeki mescidi kendiniz ekleyebilirsiniz. Konumunuz telefonunuzdan çıkmaz.`,
        ikon: 'mosque',
        hedefSayfa: 'CamideyimAyarlari',
        ctaEtiketi: 'Camideyim ayarını açın',
        kartGoster: false,
        detaylar: [
            'Türkiye\'deki camiler uygulamanın içinde (OpenStreetMap verisi)',
            'Akıllı, otomatik ya da sorarak açılış; yakındaki tüm camiler ya da yalnız seçtikleriniz',
            'Haritada alanı 10–150 m arasında ayarlama, iğne koyarak yer ekleme',
            'Camideyken hatırlatmalar sessiz gelir, sesli okuma konuşmaz',
            '"Son algılamalar" ile neden algılandığını görebilirsiniz',
            'Harita: © OpenStreetMap katkıcıları, OpenFreeMap',
        ],
    },
    {
        id: 'namaz-modu',
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Telefonunuza "Namaz" Modu',
        aciklama:
            'Telefonunuzun Rahatsız Etmeyin/mod ayarlarına "Namaz" eklenir; cuma hutbesinde, vakit girince ya da camideyken kendiliğinden açılır.',
        detayAciklama:
            'Aramaların, bildirimlerin ve ekranın namazda ne yapacağını telefonunuzun kendi ayarlarında siz seçersiniz; Namaz Akışı yalnız ne zaman açılacağını söyler. "Kıldım" dediğinizde mod kapanır. Modu elle kapatırsanız o vakit için yeniden açılmaz.',
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
    // Bilinçli olarak NÖTR ve kartsız (#272): özel gün etiketi açıklanmaz,
    // yalnız "Neler Yeni" listesinde görünür.
    {
        id: 'ozel-gun-hatirlatma-sessizligi',
        platformlar: ['android', 'ios'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Özel Günlerde Hatırlatmalar Durur',
        aciklama:
            'Özel gün modu açıkken seçtiğiniz tarihler boyunca namaz hatırlatmaları da durur; tarihler bitince kendiliğinden geri gelir.',
        detayAciklama:
            'Özel gün modu serinizi dondurmakla kalmaz: seçtiğiniz tarihler boyunca vakit bildirimleri, namaz muhafızı ve sesli okumaları, vakit sayacı ve nafile hatırlatmaları da gönderilmez. Tarihler bittiğinde hatırlatmalar sizin bir şey yapmanıza gerek kalmadan geri gelir.',
        ikon: 'bell-slash',
        hedefSayfa: 'OzelGunAyarlari',
        ctaEtiketi: 'Özel gün ayarını açın',
        kartGoster: false,
        detaylar: [
            'Serinizin dondurulması aynen sürer',
            'Bu tarihlerde vakit, muhafız, sayaç ve nafile hatırlatmaları gelmez',
            'Tarihler bitince hatırlatmalar kendiliğinden geri gelir',
        ],
    },
    // Kontrol Merkezi "Kıldım" kontrolü (Android hızlı ayar kutusu ikizi). Yalnız kontrolü
    // taşıyan build'de ve kontrolleri destekleyen iPhone'larda görünür.
    {
        id: 'ios-kontrol-merkezi-kildim',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "Kontrol Merkezi'nden Kıldım",
        aciklama:
            "Kontrol Merkezi'ne, kilit ekranına ya da Eylem düğmesine \"Vakti kıldım\" kontrolünü ekleyerek içinde bulunduğunuz vakti tek dokunuşla işaretleyebilirsiniz.",
        detayAciklama:
            "Kontrol Merkezi'ni açıp düzenleyin, \"Namaz Akışı\" altından \"Vakti kıldım\"ı seçin. Kontrolde o anki vaktin adı yazar; dokununca vakit kılındı olarak işaretlenir. Kilit ekranından dokunduğunuzda önce telefonunuzun kilidini açmanız istenir. Kılınacak vakit yoksa kontrol bunu söyler ve hiçbir şey işaretlemez.",
        ikon: 'check-circle',
        kartGoster: false,
        yetenek: 'kontrolMerkezi',
        detaylar: [
            'Kontrol Merkezi, kilit ekranı ve Eylem düğmesi',
            'O anki vaktin adı kontrolün üstünde yazar',
            'Kilit ekranında işaretlemeden önce kilit açılır',
        ],
    },
    // iPad desteği (Apple eşitliği): Android tablet düzeninin (#283) iPad ikizi. Postür ve
    // kapak ekranı cümleleri yok; iPad'de uygulama yalnız dikey ve tam ekran açılır.
    {
        id: 'ipad-duzeni',
        platformlar: ['ios'],
        surum: '0.57.0',
        tarih: '2026-10-20',
        baslik: "iPad'de Geniş Düzen",
        aciklama:
            "Namaz Akışı artık iPad'de ekranın tamamını kullanır: solda vakit kartı ve geri sayım, sağda günlük akış.",
        detayAciklama:
            "iPad'de ana ekran iki sütunda açılır; şu anki vakti ve günün tüm vakitlerini aynı anda görürsünüz. Ayar ekranları ortada okunaklı bir genişlikte durur. Kayıtlarınız ve ayarlarınız iPhone'dakiyle aynı şekilde çalışır.",
        ikon: 'tablet-alt',
        detaylar: [
            'Solda vakit kartı ve geri sayım, sağda günlük akış',
            'Ayar ekranları ortada okunaklı genişlikte',
            'Uygulama dikey ve tam ekran açılır',
        ],
        yetenek: 'ipad',
    },
    // Katlanabilir ve tablet düzeni (#283) + masaüstü postürü ve Flex Window widget'ı
    // (ikinci aşama). Yalnız Android: postür ve kapak ekranı cümleleri iPad'de geçersiz olurdu.
    {
        id: 'katlanabilir-tablet-duzeni',
        oncekiIdler: ['katlanabilir-masaustu-posturu'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Katlanabilir ve Tablet Ekranlara Uygun Düzen',
        aciklama:
            'Tabletlerde ve katlanabilir telefonların iç ekranında ana ekran iki sütunda açılır; yarı açık katlanabilir telefonda üst yarıda büyük bir geri sayım görürsünüz.',
        detayAciklama:
            'Geniş ekranlarda solda şu anki vakit kartını ve geri sayımı, sağda günlük akışı aynı anda görürsünüz; ayar ekranları ortada okunaklı bir genişlikte durur. Tablette ve katlanabilir telefonun iç ekranında uygulamayı yatay da kullanabilirsiniz; katlayıp açtığınızda geri sayım ve baktığınız gün olduğu gibi kalır. Galaxy Z Fold ya da Z Flip\'i dizüstü bilgisayar gibi yarı açık bıraktığınızda dik duran üst yarıda kalan süreyi uzaktan okunacak büyüklükte görür, işaretlemeyi masadaki alt yarıdan yaparsınız. Galaxy Z Flip kapak ekranına da bir widget ekleyebilirsiniz. Telefon ekranında düzen aynı kalır.',
        ikon: 'tablet-alt',
        detaylar: [
            'Geniş ekranda solda vakit kartı, sağda günlük akış',
            'Tablette ve katlanabilir iç ekranda yatay kullanım',
            'Yarı açık katlanabilirde üstte büyük geri sayım, altta günlük akış',
            'Galaxy Z Flip kapak ekranı için widget',
            'Telefon ekranında düzen aynı kalır',
        ],
    },
    // Ana ekran widget'ları (0.21) + Widget 2.0, hızlı ayarlar kutusu, kısayollar (#275/#276).
    {
        id: 'ana-ekran-widgetlari',
        oncekiIdler: ['widget-2-hizli-ayarlar'],
        platformlar: ['android'],
        surum: '0.31.0',
        tarih: '2026-10-13',
        baslik: 'Widget ve Tek Dokunuşla "Kıldım"',
        aciklama:
            'Ana ekran widget\'ından, hızlı ayarlar kutusundan ya da uygulama kısayolundan, uygulamayı açmadan vakti görüp "Kıldım" diyebilirsiniz.',
        detayAciklama:
            'Widget küçük başlar, büyüttükçe daha çok şey gösterir: 1×1 boyutta içinde bulunduğunuz vakti ve çıkış saatini, 2×2 boyutta kalan süreyi ve "Kıldım" düğmesini, 4×2 boyutta günün beş vaktini görürsünüz. Kalan süre hiçbir zaman eskimez; çıkış saati her boyutta yazılıdır. Widget\'a uzun basıp "Düzenle" ile zemini, opaklığı ve büyük yazılacak bilgiyi seçebilirsiniz. Eski yeşil görünümü sevenler için "Namaz Akışı — Klasik" widget\'ları da listede: küçük olan sıradaki vakte kalan süreyi, geniş olan geri sayımla birlikte günün vakitlerini gösterir. Bildirim panelinin hızlı ayarlarına "Kıldım" kutusunu ekleyebilir, uygulama simgesine uzun basarak Kıble, Kaza defteri ve "Şu anki vakti kıldım" kısayollarını kullanabilirsiniz. Eklemek için ana ekranınıza uzun basın, "Widget\'lar" bölümünden Namaz Akışı\'nı seçin.',
        ikon: 'th-large',
        kartGoster: true,
        detaylar: [
            'Widget\'tan, kutudan ya da kısayoldan yaptığınız işaretleme uygulamaya, bildirimlere ve saatinize anında yansır',
            'Güneş doğduktan öğleye kadar işaretleme kapalıdır; sıradaki vakit gösterilir',
            'Bu yollar yalnızca işaretler; geri almak için uygulamayı kullanabilirsiniz',
            'Widget dakikada bir uyanmaz, pilinizi korur',
            'Yeşil klasik widget\'lar da seçilebilir',
        ],
    },
    {
        id: 'konum-degisim-bildirimi',
        platformlar: ['android'],
        surum: '0.30.0',
        tarih: '2026-09-29',
        baslik: 'Konumunuz Değişince Haber Veriyoruz',
        aciklama:
            'Başka bir ilçeye ya da şehre geçtiğinizde uygulama vakitleri kendiliğinden günceller ve bunu sessiz bir bildirimle size söyler.',
        detayAciklama:
            'Seyahatte otomatik güncelleme açıksa uygulama yer değiştirdiğinizi arka planda fark eder ve namaz vakitlerini yeni konumunuza göre ayarlar. İlçeniz ya da şehriniz değiştiğinde "Konumunuz güncellendi" bildirimini görürsünüz. Bildirim ses ve titreşim çıkarmaz, yalnızca bildirim listesinde durur. Aynı ilçe içinde dolaşırken bildirim gelmez. İsterseniz Konum Ayarları\'ndan kapatabilirsiniz.',
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
        platformlar: ['android', 'ios'],
        surum: '0.29.0',
        tarih: '2026-09-29',
        baslik: 'Vakit Saatleri Ana Ekranda',
        aciklama:
            'Günlük Akış her vaktin giriş saatini gösterir ve kıldığınız namazları yeşil bir zincirle birbirine bağlar.',
        detayAciklama:
            'Ana ekrandaki Günlük Akış listesinde her vaktin solunda o vaktin giriş saati yazar; günün planını tek bakışta görebilirsiniz. Vakitler bir zincirle birbirine bağlıdır: kıldığınız namazlardan şu anki vakte kadar olan bağlantılar yeşile döner, arada kılınmamış bir vakit varsa zincir orada kopar. Şu anki vakit ayrıca çerçeveyle öne çıkar.',
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
        id: 'seri-gun-sonu-sayaci',
        platformlar: ['android'],
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
    // Hatırlatma sesi seçimi (0.24) + titreşim (0.25) — yalnız Android (iOS'ta ses ve titreşim
    // seçimi yok; platform yeteneği kuralı).
    {
        id: 'muhafiz-bildirim-sesi-secimi',
        oncekiIdler: ['muhafiz-titresim-kanali'],
        platformlar: ['android'],
        surum: '0.25.0',
        tarih: '2026-08-28',
        baslik: 'Hatırlatma Sesini ve Titreşimi Siz Seçin',
        aciklama:
            'Her hatırlatma adımı için telefonunuzdaki seslerden birini ya da kendi müziğinizi seçebilir, titreşimi ayrıca açabilirsiniz.',
        detayAciklama:
            'Bir adımın ayarlarında bildirim sesi satırına dokunduğunuzda telefonunuzun ses seçicisi açılır; sistem seslerinden birini ya da cihazınıza eklediğiniz bir müziği seçersiniz. Sesi kaydetmeden önce dinleyebilir, dilediğinizde tek dokunuşla uygulama sesine dönebilirsiniz. Seçim adım adım yapılır: nazik hatırlatma için sakin bir ses, son dakikalar için dikkat çekici bir ses kullanabilirsiniz. Titreşim bildirimden ve sesli okumadan bağımsızdır; açtığınız adım belirgin bir desenle, uygulama açıkken de titrer. Hazır yoğunluklardan birine geçseniz bile seçtiğiniz sesler korunur.',
        ikon: 'music',
        hedefSayfa: 'MuhafizAyarlari',
        ctaEtiketi: 'Sesinizi seçin',
        kartGoster: true,
        detaylar: [
            'Telefonunuzun seslerinden seçin ya da kendi müziğinizi kullanın',
            'Her hatırlatma adımı için ayrı ses ve titreşim',
            'Seçmeden önce dinleyin; dilediğinizde uygulama sesine geri dönün',
            'Hazır yoğunluğa geçseniz de seçtiğiniz sesler korunur',
            'Yeni bir izin istenmez',
        ],
    },
    {
        id: 'konumu-tek-dokunusla-yenile',
        platformlar: ['android', 'ios'],
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Konumunuzu Tek Dokunuşla Yenileyin',
        aciklama:
            'Otomatik konum kullanıyorsanız ana ekrandaki konum rozetine dokunarak vakitleri anında güncel konumunuza göre hesaplatabilirsiniz.',
        detayAciklama:
            'Otomatik konum modunda uygulama şehir değiştirdiğinizi kendiliğinden fark eder; ancak bazı cihazlarda bu algılama gecikebilir. Beklemek yerine ana ekranda vaktin üstündeki konum rozetine dokunmanız yeterli: güncel konumunuz alınır; namaz vakitleri, hatırlatmalar, iftar/sahur sayaçları ve widget aynı anda yeni konumunuza göre tazelenir. Aynı düğme Ayarlar\'daki "Konum" satırında da bulunur. Manuel konum seçtiyseniz düğme görünmez — o zaman konum sizin seçiminizdir.',
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
        platformlar: ['android', 'ios'],
        surum: '0.25.0',
        tarih: '2026-08-27',
        baslik: 'Serinizi 2 Günde Kurtarın',
        aciklama:
            'Uzun bir seriyi bir gün kaçırdığınızda serinizi geri almak için 2 gün tam kılmanız yeterli.',
        detayAciklama:
            'Uzun bir seriyi bir gün kaçırdığınızda toparlanma modu devreye girer ve tam kıldığınız 2 günle eski serinizi geri kazanırsınız. Toparlanmada kıldığınız günler de serinize eklenir: 22 günlük seriniz varsa toparlanma bittiğinde 24 günle devam edersiniz. Aynı gün içinde bir namazın işaretini geri alıp yeniden koymak toparlanma ilerlemenizi bozmaz.',
        ikon: 'heartbeat',
        kartGoster: false,
        detaylar: [
            'Toparlanma için 2 tam gün yeterli',
            'Toparlanmada kıldığınız günler serinize eklenir',
            'İşareti geri alıp tekrar koyunca ilerleme sıfırlanmaz',
        ],
    },
    {
        id: 'yerel-yedekleme',
        platformlar: ['android', 'ios'],
        surum: '0.24.0',
        tarih: '2026-06-14',
        baslik: 'Yedekleme & Aktarım',
        aciklama:
            'Verilerinizi tek bir dosyaya yedekleyin ve dilediğiniz zaman geri yükleyin.',
        detayAciklama:
            'Tüm namaz kayıtlarınızı ve ayarlarınızı tek dokunuşla bir yedek dosyasına alabilirsiniz. Dosya bozulmaya karşı korunur ama parola içermez; güvendiğiniz bir yerde saklayın. Yeni bir cihaza geçtiğinizde akıllı sihirbaz, dosyanızı güvenle geri yükler ve mevcut kayıtlarınızla çakışan veriler korunur.',
        ikon: 'cloud-download-alt',
        hedefSayfa: 'YedeklemeAktarim',
        ctaEtiketi: 'Hemen yedekleyin',
        kartGoster: true,
        detaylar: [
            'Tek dokunuşla yedek oluşturun',
            'Akıllı sihirbazla güvenle geri yükleyin',
            'Çakışan kayıtlarınız korunur — veri kaybı olmaz',
        ],
    },
    {
        id: 'takvim-entegrasyonu',
        platformlar: ['android', 'ios'],
        surum: '0.22.0',
        tarih: '2026-06-05',
        baslik: 'Namaz Vakitleri Takviminizde',
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
];
