import {
  basligiOlustur,
  bildirimGovdesiOlustur,
  VAKIT_ADLARI_BUYUK,
  GIRIS_ICERIK_HAVUZU,
  SON_DAKIKA_ESIGI_DK,
  BANT_GORUNUR_KARAKTER,
} from '../muhafizMetinYardimcisi';
import { muhafizGovdesiSec } from '../../muhafiz/muhafizGovdesi';
import { SEYTANLA_MUCADELE_ICERIGI } from '../../data/SeytanlaMucadeleIcerigi';

describe('basligiOlustur', () => {
  test('seviye 1: süre + vakit adı', () => {
    expect(basligiOlustur('imsak', 1, 30)).toBe('Sabah · 30 dk kaldı ⏰');
  });

  test('seviye 2: daralıyor', () => {
    expect(basligiOlustur('ogle', 2, 15)).toBe('Öğle · 15 dk · vakit daralıyor ⚠️');
  });

  test('seviye 3: kaçıyor', () => {
    expect(basligiOlustur('aksam', 3, 8)).toBe('Akşam · 8 dk · vakit kaçıyor 🔥');
  });

  test('seviye 4: büyük harf + ÇIKIYOR', () => {
    expect(basligiOlustur('yatsi', 4, 3)).toBe('YATSI · 3 dk · VAKİT ÇIKIYOR 🚨');
  });

  // NÖBETÇİ TEST — bu testin sebebi:
  // 'İkindi'.toUpperCase() => 'İKINDI' (noktalı İ kaybolur, i -> I).
  // Sabit harita kullanılmazsa kullanıcıya yanlış yazılmış namaz adı gider.
  // Diğer dört vakitte harf tuzağı YOK, o yüzden yalnız bu test koruyor.
  test('İkindi seviye 4 başlığı noktalı İKİNDİ üretir (toUpperCase tuzağı)', () => {
    expect(basligiOlustur('ikindi', 4, 5)).toBe('İKİNDİ · 5 dk · VAKİT ÇIKIYOR 🚨');
    expect(basligiOlustur('ikindi', 4, 5)).not.toContain('İKINDI');
  });

  test('VAKIT_ADLARI_BUYUK ham toUpperCase ile aynı DEĞİL (regresyon nöbetçisi)', () => {
    expect(VAKIT_ADLARI_BUYUK.ikindi).toBe('İKİNDİ');
    expect('İkindi'.toUpperCase()).toBe('İKINDI'); // tuzağın kanıtı
  });

  test('başlık "<Vakit> · <N> dk" ile başlar (önden okunur, issue #287)', () => {
    const seviyeler: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];
    for (const s of seviyeler) {
      expect(basligiOlustur('aksam', s, 7)).toMatch(/^(Akşam|AKŞAM) · 7 dk/u);
    }
  });

  test('beş vaktin beşi de doğru ada çözülür', () => {
    expect(basligiOlustur('imsak', 1, 1)).toContain('Sabah');
    expect(basligiOlustur('ogle', 1, 1)).toContain('Öğle');
    expect(basligiOlustur('ikindi', 1, 1)).toContain('İkindi');
    expect(basligiOlustur('aksam', 1, 1)).toContain('Akşam');
    expect(basligiOlustur('yatsi', 1, 1)).toContain('Yatsı');
  });
});

describe('bildirimGovdesiOlustur', () => {
  test('gövde sondaki kalan süreyi TAŞIMAZ (süre başlıkta)', () => {
    for (const s of [1, 2, 3, 4] as const) {
      expect(bildirimGovdesiOlustur(s)).not.toMatch(/dk kaldı|dakika kaldı/u);
    }
  });

  test('gövde başlığın durum ifadesini birebir tekrarlamaz', () => {
    // Seviye 4 başlığı "... VAKİT ÇIKIYOR" diyor; gövde bunu tekrar etmemeli.
    expect(bildirimGovdesiOlustur(4)).not.toContain('ÇIKIYOR');
    expect(bildirimGovdesiOlustur(4)).not.toContain('çıkmak üzere');
    // Seviye 2 başlığı "daralıyor" diyor.
    expect(bildirimGovdesiOlustur(2)).not.toContain('daralıyor');
  });

  // NÖBETÇİ: "secdeye kapan" mantık hatasıydı — secde namazın İÇİNDEKİ bir rükün,
  // başlangıcı değil. Vakit daralınca kişi namaza durur, secdeye kapanmaz.
  test('seviye 4: "namaza dur" der, "secde" demez', () => {
    const govde = bildirimGovdesiOlustur(4);
    expect(govde).toContain('namaza dur');
    expect(govde).not.toMatch(/secde/i);
  });
});

// ── Faz 1 / B11: GİRİŞ yönü metinleri ────────────────────────────────────────
//
// Motor iki yönlü olunca çıkış dili giriş yönünde yalnız garip değil YANLIŞ olur:
// yatsı 700 dk sürerken "acil" adım girişten 45 dk sonra tetiklenir ve çıkışa
// hâlâ 655 dk vardır → çıkış başlığı "🚨 655 dk · YATSI VAKTİ ÇIKIYOR" derdi.
describe('giriş yönü metinleri', () => {
  test('yön verilmezse çıkış dili BİREBİR korunur (sıfır göç)', () => {
    expect(basligiOlustur('yatsi', 4, 3)).toBe(basligiOlustur('yatsi', 4, 3, 'cikisaDogru'));
    expect(bildirimGovdesiOlustur(2)).toBe(bildirimGovdesiOlustur(2, 'cikisaDogru'));
  });

  test('giriş başlığı "geçen süre" der, "çıkıyor/kaldı" DEMEZ', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const baslik = basligiOlustur('yatsi', s, 45, 'girisindenItibaren');
      expect(baslik).toContain('45');
      expect(baslik).not.toMatch(/ÇIKIYOR|kaçıyor|daralıyor|kaldı/u);
    }
  });

  test('giriş başlığı da "<Vakit> · <N> dk" ile başlar (Android/bant kırpması)', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const baslik = basligiOlustur('ogle', s, 12, 'girisindenItibaren');
      expect(baslik).toMatch(/^(Öğle|ÖĞLE) · 12 dk oldu/u);
    }
  });

  test('giriş başlığı seviye 4: noktalı İKİNDİ (toUpperCase tuzağı burada da)', () => {
    const baslik = basligiOlustur('ikindi', 4, 20, 'girisindenItibaren');
    expect(baslik).toContain('İKİNDİ');
    expect(baslik).not.toContain('İKINDI');
  });

  test('giriş gövdesi çıkış diline sızmaz ve "secde" demez', () => {
    for (const s of [1, 2, 3, 4] as const) {
      const govde = bildirimGovdesiOlustur(s, 'girisindenItibaren');
      // Çıkış yönünün gövdesi ASLA aynen dönmemeli (yön parametresi yutulursa
      // seviye 1 "Vakit daralmaya başladı" der — vakit yeni girmişken yanlış).
      expect(govde).not.toBe(bildirimGovdesiOlustur(s, 'cikisaDogru'));
      expect(govde).not.toMatch(/daralmaya|son dakika|çıkıyor|kaldı/iu);
      expect(govde).not.toMatch(/secde/i);
    }
    expect(bildirimGovdesiOlustur(4, 'girisindenItibaren')).toContain('namaza dur');
  });

  test('GİRİŞ içerik havuzu doludur ve terk-etme suçlaması taşımaz', () => {
    // Fıkıh kuralı (AGENTS.md): terk etme ≠ geciktirme. Bildirimi alan kişi
    // namazı terk etmiş değil, geciktirmiştir; "terk edenin küfrü" türü nasslar
    // bu kişiye YANLIŞ hedeftir. Havuz vakte özgü nass da taşımaz.
    for (const s of [1, 2, 3, 4] as const) {
      expect(GIRIS_ICERIK_HAVUZU[s].length).toBeGreaterThan(0);
      for (const metin of GIRIS_ICERIK_HAVUZU[s]) {
        expect(metin).not.toMatch(/terk|küfr|kâfir|secde/iu);
        expect(metin).not.toMatch(/çıkıyor|son dakika/iu);
      }
    }
  });
});

describe('METİN = (TON, ÖLÇÜ) — issue #274', () => {
  test('NÖBETÇİ: ton 4 + olcuDk 90 → başlık "ÇIKIYOR" İÇERMEZ', () => {
    for (const vakit of ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const) {
      const baslik = basligiOlustur(vakit, 4, 90);
      expect(baslik).not.toMatch(/ÇIKIYOR/);
      expect(baslik).toContain('90 dk');
    }
  });

  test('erken sert ton "kaçıyor" demez; son dakikalar BİREBİR eski dil', () => {
    expect(basligiOlustur('ikindi', 3, 60)).not.toMatch(/kaçıyor/);
    expect(basligiOlustur('ikindi', 3, SON_DAKIKA_ESIGI_DK)).toBe('İkindi · 30 dk · vakit kaçıyor 🔥');
    expect(basligiOlustur('aksam', 4, 10)).toBe('AKŞAM · 10 dk · VAKİT ÇIKIYOR 🚨');
    // Nazik/uyarı tonu ölçüden bağımsız (zaten nötr).
    expect(basligiOlustur('ogle', 2, 120)).toBe('Öğle · 120 dk · vakit daralıyor ⚠️');
  });

  test('erken sert/acil gövde nötr havuzdan, son dakika gövdesi değişmez', () => {
    expect(GIRIS_ICERIK_HAVUZU[4]).toContain(bildirimGovdesiOlustur(4, 'cikisaDogru', 90));
    // 2026-10-19: kılınmış olabilme ihtimaline saygılı (persona çalışması) — "kaza etmek
    // zorunda kalırsın" kaldırıldı; "sen" + emir kaydı korunur.
    expect(bildirimGovdesiOlustur(4, 'cikisaDogru', 5)).toBe(
      "Kıldıysan 'Kıldım'a bas; kılmadıysan hemen namaza dur."
    );
    expect(bildirimGovdesiOlustur(4)).toBe("Kıldıysan 'Kıldım'a bas; kılmadıysan hemen namaza dur.");
  });

  test('erken sert/acil gövdesi VAKTE ÖZGÜ NASS taşımaz ve tek rastgele çağrı yapar', () => {
    const nasslar = SEYTANLA_MUCADELE_ICERIGI.filter((i) => i.vakitler !== undefined).map(
      (i) => i.metin
    );
    for (const oranDegeri of [0, 0.5, 0.99]) {
      const oran = jest.fn(() => oranDegeri);
      const govde = muhafizGovdesiSec('yatsi', 3, 'cikisaDogru', oran, 120);
      expect(oran).toHaveBeenCalledTimes(1);
      expect(GIRIS_ICERIK_HAVUZU[3]).toContain(govde);
      expect(nasslar.some((n) => govde.includes(n))).toBe(false);
    }
  });
});

// ── Issue #287: bileklik (Galaxy Fit / Mi Band / Huawei Band) önden okuma ────
//
// Bantlar telefon bildirimini aynalar ve başlığın yalnız ilk ~12–16 karakterini
// gösterir. NÖBETÇİ: tüm ton × yön × ölçü kombinasyonlarında vakit adı ve dakika
// sayısı ilk BANT_GORUNUR_KARAKTER karakterin içinde kalır.
describe('bileklik önden okuma (issue #287)', () => {
  const VAKITLER = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const;
  const YONLER = ['cikisaDogru', 'girisindenItibaren'] as const;
  const OLCULER = [1, 3, 9, 10, 25, 30, 31, 45, 90, 120, 655, 720];
  // Beklenen adlar ELLE yazıldı (haritadan okunmadı) — harita bozulursa test yakalar.
  const BUYUK = { imsak: 'SABAH', ogle: 'ÖĞLE', ikindi: 'İKİNDİ', aksam: 'AKŞAM', yatsi: 'YATSI' };
  const KUCUK = { imsak: 'Sabah', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' };

  test('ilk 16 karakterde vakit adı ve dakika sayısı geçer', () => {
    expect(BANT_GORUNUR_KARAKTER).toBe(16);
    for (const vakit of VAKITLER) {
      for (const yon of YONLER) {
        for (const s of [1, 2, 3, 4] as const) {
          for (const olcu of OLCULER) {
            const bas = basligiOlustur(vakit, s, olcu, yon).slice(0, BANT_GORUNUR_KARAKTER);
            const ad = s === 4 ? BUYUK[vakit] : KUCUK[vakit];
            expect(bas.startsWith(`${ad} · ${olcu} dk`)).toBe(true);
          }
        }
      }
    }
  });

  test('acil ton büyük harfi sabit haritadan (noktalı İ korunur)', () => {
    for (const yon of YONLER) {
      for (const olcu of [3, 90]) {
        const baslik = basligiOlustur('ikindi', 4, olcu, yon);
        expect(baslik.startsWith('İKİNDİ · ')).toBe(true);
        expect(baslik).not.toContain('İKINDI');
      }
    }
  });

  test('sıra değişti, ton kuralı değişmedi: ÇIKIYOR/kaçıyor yalnız çıkışta ve son dakikalarda', () => {
    for (const vakit of VAKITLER) {
      for (const olcu of OLCULER) {
        for (const s of [3, 4] as const) {
          const cikis = basligiOlustur(vakit, s, olcu);
          const giris = basligiOlustur(vakit, s, olcu, 'girisindenItibaren');
          expect(giris).not.toMatch(/ÇIKIYOR|kaçıyor/u);
          if (olcu > SON_DAKIKA_ESIGI_DK) {
            expect(cikis).not.toMatch(/ÇIKIYOR|kaçıyor/u);
          } else {
            expect(cikis).toMatch(s === 4 ? /ÇIKIYOR/u : /kaçıyor/u);
          }
        }
      }
    }
  });
});
