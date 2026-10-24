/** Canlı sayaç (Now Bar / Live Update) ayar metinleri — arayüz: kibar "siz". */
export const nowBar = {
  adlar: { iftar: 'İftar', sahur: 'Sahur', seri: 'Seri' },
  aciklama: {
    imsak: 'Güneşin doğuşuna kalan süre',
    cikis: 'Vaktin çıkışına kalan süre',
    imsaka: 'İmsaka kalan süre',
    iftar: 'Akşam ezanına kalan süre',
    cuma: 'Hutbeye kalan süre',
    kusluk: 'Vaktin bitişine kalan süre',
    evvabin: 'Yatsıya kalan süre',
    seri: 'Gün sonuna kalan süre',
  },
  etiket: {
    sayacla: 'Sayaçla',
    girince: 'Vakit girince',
    sonDk: 'Son dakikalar',
    imsaktan: 'İmsaktan itibaren',
    yatsidan: 'Yatsıdan itibaren',
    gunesDogunca: 'Güneş doğunca',
    sonUcteGirince: 'Son üçte bir girince',
    son2Saat: 'Son 2 saatte',
  },
  gereksinim: {
    vakit: '"Sayaçla" vakit sayacına bağlıdır (Bildirimler > Vakit sayacı); muhafızın uyardığı vakitte sayaç çıkmaz. Her zaman görmek için "Vakit girince" ya da "Son dakikalar"ı seçin.',
    iftar: 'İftar sayacı açıkken çalışır (Ramazan özel).',
    sahur: 'Sahur sayacı açıkken çalışır (Ramazan özel).',
    seri: 'Gün sonu hatırlatması açıkken ve gün eksikken çalışır.',
  },
  muhafizNotu:
    'Namaz Muhafızı bu vakti uyardığı için ayrı bir sayaç bildirimi çıkmaz; geri sayım, sayacın başlayacağı anda yalnız öne çıkan sayaç olarak görünür.',
  kapaliNotu: 'Vakit sayacı kapalı; "Sayaçla" seçili vakitler vakit girince başlar.',
  politika: 'Google sürekli açık kartları önermez; telefonunuz öne çıkarmayı geri çekebilir.',
} as const;
