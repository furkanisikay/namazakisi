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
