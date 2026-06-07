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
});
