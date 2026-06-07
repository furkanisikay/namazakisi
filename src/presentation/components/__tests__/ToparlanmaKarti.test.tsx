import React from 'react';
import { Text, View } from 'react-native';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { ToparlanmaKarti } from '../ToparlanmaKarti';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));

jest.useFakeTimers();

const ornekToparlanmaDurumu = {
  tamamlananGun: 1,
  hedefGunSayisi: 3,
  baslangicTarihi: '2026-03-20',
  oncekiSeri: 10,
};

// Tamamlanan dairelerin içine yerleştirilen onay işareti (üretim: ToparlanmaKarti.tsx).
// Yalnızca `i < tamamlananGun` olan dairelerde render edilir; bu yüzden sayısı
// doğrudan tamamlananGun'a eşit olmalıdır.
const ONAY_ISARETI = '✓';

/**
 * Render ağacındaki onay işareti (✓) sayısını döndürür.
 * Onay işareti yalnızca tamamlanmış dairelerin içinde göründüğü için
 * bu sayı = ekranda işaretli görünen tamamlanmış gün sayısıdır.
 */
function onayIsaretiSayisi(tree: renderer.ReactTestRenderer): number {
  return tree.root
    .findAllByType(Text)
    .filter((dugum) => {
      const cocuklar = Array.isArray(dugum.props.children)
        ? dugum.props.children.join('')
        : dugum.props.children;
      return cocuklar === ONAY_ISARETI;
    }).length;
}

/**
 * Render ağacındaki "progress daire" View'larını döndürür.
 * Daireler 44x44 + borderRadius:22 stiliyle ayırt edilir (üretimdeki `progressDaire`).
 */
function daireleriBul(tree: renderer.ReactTestRenderer) {
  return tree.root.findAllByType(View).filter((d) => {
    const stil = Array.isArray(d.props.style) ? d.props.style : [d.props.style];
    return stil.some(
      (s: { width?: number; borderRadius?: number }) => s?.width === 44 && s?.borderRadius === 22
    );
  });
}

/**
 * Bir progress dairesinin "boş" (tamamlanmamış) olup olmadığını söyler.
 * Üretimde boş daireler `progressDaireBos` stiliyle (transparent arkaplan, '#E0E0E0' kenar)
 * işaretlenir; tamamlanmış olanlar TOPARLANMA rengi alır. Burada içinde ✓ olmamasıyla
 * (boş daire onay işareti render ETMEZ) güvenilir şekilde ayırt ederiz.
 */
function bosDaireSayisi(tree: renderer.ReactTestRenderer): number {
  return daireleriBul(tree).filter((d) => {
    const cocuklar = d.props.children;
    // Tamamlanmış dairede children = <Text>✓</Text>; boşta children = false (kısa devre).
    return !cocuklar;
  }).length;
}

/**
 * Render ağacındaki birleşik metin parçalarından, verilen alt-dizgiyi içeren ilkini döndürür.
 * Bitişik Text düğümleri ayrı serileştiği için her düğümün children'ını birleştiririz.
 */
function metniBul(tree: renderer.ReactTestRenderer, parca: string): string | undefined {
  return tree.root
    .findAllByType(Text)
    .map((d) => (Array.isArray(d.props.children) ? d.props.children.join('') : d.props.children))
    .find((metin) => typeof metin === 'string' && metin.includes(parca));
}

describe('ToparlanmaKarti', () => {
  it('tamamlanan gün kadar onay işareti ve "x/y gün tamamlandı" metnini gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });

    // 1) tamamlananGun=1 -> tam olarak 1 onay işareti render edilmeli.
    //    Üretimde `i < tamamlananGun` koşulu bozulursa (ör. <= veya kapalı) sayı değişir ve test düşer.
    expect(onayIsaretiSayisi(tree!)).toBe(ornekToparlanmaDurumu.tamamlananGun);

    // 2) Toplam daire sayısı hedefGunSayisi kadar olmalı (boş + tamamlanmış).
    const daireSayisi = tree!.root
      .findAllByType(View)
      .filter((d) => {
        const stil = Array.isArray(d.props.style) ? d.props.style : [d.props.style];
        return stil.some((s: { width?: number; borderRadius?: number }) => s?.width === 44 && s?.borderRadius === 22);
      }).length;
    expect(daireSayisi).toBe(ornekToparlanmaDurumu.hedefGunSayisi);

    // 3) İlerleme metni üretimle aynı biçimde (tamamlanan/hedef) olmalı.
    //    Bitişik Text düğümleri ayrı serileştiği için parçaları birleştirip asterler kontrol et.
    const ilerlemeMetni = tree!.root
      .findAllByType(Text)
      .map((d) => (Array.isArray(d.props.children) ? d.props.children.join('') : d.props.children))
      .find((metin) => typeof metin === 'string' && metin.includes('gün tamamlandı'));
    expect(ilerlemeMetni).toBe(
      `${ornekToparlanmaDurumu.tamamlananGun}/${ornekToparlanmaDurumu.hedefGunSayisi} gün tamamlandı`
    );

    // 4) Progress bar KALDIRILDI — eski stil anahtarı çıktıda olmamalı (orijinal kapsam korunuyor).
    const json = JSON.stringify(tree!.toJSON());
    expect(json).not.toContain('progressBarContainer');
  });

  it('tamamlananGun arttıkça onay işareti sayısı ve ilerleme metni birlikte değişir', () => {
    // İki tamamlanmış gün senaryosu: daire döngüsünün gerçek girdiye duyarlılığını kanıtlar.
    const ikiTamamlanan = { ...ornekToparlanmaDurumu, tamamlananGun: 2 };
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ikiTamamlanan} oncekiSeri={10} />
      );
    });

    // 2 tamamlanan -> 2 onay işareti (ilk testteki 1 ile birlikte sayının girdiyle birebir orantılı olduğunu sabitler).
    expect(onayIsaretiSayisi(tree!)).toBe(2);

    const ilerlemeMetni = tree!.root
      .findAllByType(Text)
      .map((d) => (Array.isArray(d.props.children) ? d.props.children.join('') : d.props.children))
      .find((metin) => typeof metin === 'string' && metin.includes('gün tamamlandı'));
    expect(ilerlemeMetni).toBe('2/3 gün tamamlandı');
  });

  it('yumuşatılmış uyarı metnini gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('aradaki bo');
    expect(json).not.toContain('Dikkat:');
  });

  it('daire sayısı hedefGunSayisi ile veri-güdümlüdür (3 değil, 5 hedefte 5 daire)', () => {
    // Mevcut testler yalnızca hedefGunSayisi=3 ile daire sayısını doğruluyor.
    // Bu test, döngü sınırının (satır 44: i < hedefGunSayisi) sabit 3'e kodlanmadığını,
    // gerçekten girdiye bağlı olduğunu kanıtlar. Üretim varsayılanı (TOPARLANMA_GUN_SAYISI=5)
    // ile uyumlu farklı bir değer seçildi.
    const besGunHedef = { ...ornekToparlanmaDurumu, hedefGunSayisi: 5, tamamlananGun: 2 };
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={besGunHedef} oncekiSeri={10} />
      );
    });

    expect(daireleriBul(tree!).length).toBe(5);
    // 2 tamamlanmış -> 2 onay işareti; geri kalan 3 daire boş kalmalı.
    expect(onayIsaretiSayisi(tree!)).toBe(2);
    expect(bosDaireSayisi(tree!)).toBe(3);
    expect(metniBul(tree!, 'gün tamamlandı')).toBe('2/5 gün tamamlandı');
  });

  it('tamamlanmamış daireler boş (onay işaretsiz) kalır — ilerlemeyi yanlış göstermez', () => {
    // tamamlananGun=1, hedefGunSayisi=3 -> tam 1 dolu (✓), tam 2 boş daire.
    // Üretimde `i < tamamlananGun` koşulu (satır 45) yanlışlıkla genişlerse (<=, dahil etme)
    // boş daire sayısı düşer ve bu test düşer.
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });

    expect(daireleriBul(tree!).length).toBe(3);
    expect(onayIsaretiSayisi(tree!)).toBe(1);
    expect(bosDaireSayisi(tree!)).toBe(2);
    // İçsel tutarlılık: dolu + boş = toplam daire.
    expect(onayIsaretiSayisi(tree!) + bosDaireSayisi(tree!)).toBe(
      ornekToparlanmaDurumu.hedefGunSayisi
    );
  });

  it('kalanGun > 0 iken "X gün daha tam kıl" alt mesajını doğru sayıyla gösterir', () => {
    // tamamlananGun=1, hedefGunSayisi=3 -> kalanGun = 2 (satır 59).
    // Üretim kodu kalanGun>0 dalında (satır 103-105) "2 gün daha tam kıl ve seriyi kurtar"
    // metnini üretir. kalanGun aritmetiği (hedef - tamamlanan) ters çevrilirse ya da
    // yanlış sayı yazılırsa bu test düşer.
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={ornekToparlanmaDurumu} oncekiSeri={10} />
      );
    });

    const altMesaj = metniBul(tree!, 'gün daha tam kıl');
    expect(altMesaj).toBe('2 gün daha tam kıl ve seriyi kurtar! 💪');
    // "Son gün" mesajı bu dalda görünmemeli (yanlış dal seçimi yakalanır).
    expect(metniBul(tree!, 'Bugün tam kılarak')).toBeUndefined();
  });

  it('kalanGun === 0 (tamamlananGun===hedefGunSayisi) iken "son gün" mesajına geçer', () => {
    // Son gün senaryosu: tamamlananGun=hedefGunSayisi=3 -> kalanGun=0.
    // Üretim `kalanGun > 0` koşulu (satır 103) false olur ve else dalı (satır 108-110)
    // "Bugün tam kılarak serini kurtar!" gösterir. Koşul yanlışlıkla `>= 0` olursa
    // yanlış dal seçilir ve bu test düşer.
    const sonGun = { ...ornekToparlanmaDurumu, tamamlananGun: 3, hedefGunSayisi: 3 };
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={sonGun} oncekiSeri={10} />
      );
    });

    expect(metniBul(tree!, 'Bugün tam kılarak')).toBe('Bugün tam kılarak serini kurtar! 🎉');
    // kalanGun=0 olduğundan "X gün daha" mesajı HİÇ görünmemeli.
    expect(metniBul(tree!, 'gün daha tam kıl')).toBeUndefined();
    // 3/3 tüm daireler dolu olmalı, boş daire kalmamalı.
    expect(onayIsaretiSayisi(tree!)).toBe(3);
    expect(bosDaireSayisi(tree!)).toBe(0);
  });

  it('motivasyon metni "oncekiSeri" PROP\'unu kullanır (toparlanmaDurumu.oncekiSeri değil)', () => {
    // Üretim satır 87: <Text>{oncekiSeri} günlük</Text> serini kurtarabilirsin!
    // Burada `oncekiSeri` AYRI prop'tan gelir, toparlanmaDurumu.oncekiSeri'den DEĞİL.
    // İkisini bilerek FARKLI veriyoruz; prop=7, durum içindeki=10. Üretim prop'u (7)
    // kullandığı için '7 günlük' görünmeli. Yanlışlıkla durum alanına bağlanırsa
    // '10 günlük' çıkar ve bu test düşer.
    const durum = { ...ornekToparlanmaDurumu, oncekiSeri: 10 };
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <ToparlanmaKarti toparlanmaDurumu={durum} oncekiSeri={7} />
      );
    });

    // Üretimde sayı + " günlük" iç içe bir <Text> içinde (vurgulu), gerisi dış <Text>'te
    // olduğundan render ağacında ayrı serileşir; vurgulu parça tam olarak "7 günlük" olur.
    expect(metniBul(tree!, 'günlük')).toBe('7 günlük');
    // Bağlam: cümlenin devamı ('serini kurtarabilirsin') ayrı düğümde yine de mevcut.
    expect(metniBul(tree!, 'serini kurtarabilirsin')).toBeDefined();
    // Durum alanındaki değer (10) ekrana sızmamalı.
    expect(metniBul(tree!, '10 günlük')).toBeUndefined();
  });
});
