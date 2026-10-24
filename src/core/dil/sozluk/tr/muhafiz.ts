/**
 * Namaz Muhafızı bildirim metinleri. KAYIT: ibadete çağrı → "sen" + emir kipi (AGENTS.md
 * istisnası). "Secdeye kapan" YAZILMAZ (namaza dur); terk/küfür nassı gecikene yanlış hedef.
 * Başlık ÖNDEN OKUNUR: vakit adı + süre ilk 16 karakterde (bileklik, issue #287).
 */
export const muhafiz = {
  baslik: {
    giris1: '{ad} · {dk} dk oldu · vakit girdi ⏰',
    giris2: '{ad} · {dk} dk oldu · namazını geciktirme ⚠️',
    giris3: '{ad} · {dk} dk oldu · namazı seni bekliyor 🔥',
    giris4: '{ad} · {dk} dk oldu · NAMAZINA DUR 🚨',
    erken3: '{ad} · {dk} dk kaldı · namazı seni bekliyor 🔥',
    erken4: '{ad} · {dk} dk kaldı · NAMAZINA DUR 🚨',
    cikis1: '{ad} · {dk} dk kaldı ⏰',
    cikis2: '{ad} · {dk} dk · vakit daralıyor ⚠️',
    cikis3: '{ad} · {dk} dk · vakit kaçıyor 🔥',
    cikis4: '{ad} · {dk} dk · VAKİT ÇIKIYOR 🚨',
  },
  /** Giriş yönü ve erken sert/acil için nötr havuz (seviye başına). */
  girisHavuzu: {
    s1: ['Namaz vakti girdi; fırsat varken kıl.', 'Vakit senin lehine işlerken kıl, sonraya kalmasın.'],
    s2: ['Erteledikçe ağırlaşır; namazı sona bırakma.', 'Vakit ilerliyor — namazını şimdi kıl.'],
    s3: [
      'Namazı geciktirdikçe kaçırmaya yaklaşırsın; hemen kıl.',
      '"Sonra kılarım" deme; şimdi kılabilirsin.',
      'Birkaç dakika sonra "keşke" demek yerine şimdi kalk.',
    ],
    s4: ['Namazı daha fazla geciktirme — hemen namaza dur.', 'Bırak elindekini, namaza dur.'],
  },
  govde: {
    s1: 'Vakit daralmaya başladı, fırsat varken kıl.',
    s2: 'Namazı sona bırakma; şimdi kılmak için vakit uygun.',
    s3: 'Vakit bitmek üzere; şimdi kılabilirsin.',
    s4: "Kıldıysan 'Kıldım'a bas; kılmadıysan hemen namaza dur.",
  },
  geceCapasi: {
    baslik: '{ad} · uyumadan önce kıl ⏰',
    govde: 'Gece sessizliğine {dk} dk var; yatmadan yatsını kıl.',
  },
  /** Muhafız içerik havuzundaki KENDİ SÖZÜMÜZ (nass değil), `SeytanlaMucadeleIcerigi` kimliğiyle. */
  icerik: {
    firsat: 'Vakit daralmaya başladı, fırsat varken kıl.',
    sonaBirakma: 'Namazı sona bırakma; şimdi kılmak için vakit uygun.',
    fisilti: '"Sonra kılarım" deme; vakit bitmek üzere, şimdi kılabilirsin.',
    omur: 'Vakit geçiyor; bu namazı vaktinde kılmak için hâlâ fırsatın var.',
    keske: 'Birkaç dakika sonra "keşke" demek yerine şimdi kalk.',
    namazaDur: "Kıldıysan 'Kıldım'a bas; kılmadıysan hemen namaza dur.",
    sonDakika: 'Son dakikalar. Bırak elindekini, namaza dur.',
  },
} as const;
