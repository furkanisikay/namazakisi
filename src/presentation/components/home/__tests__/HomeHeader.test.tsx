import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { HomeHeader } from '../HomeHeader';
import { SERI_RENKLERI } from '../../../../core/constants/UygulamaSabitleri';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../../core/theme', () => ({
  useRenkler: () => ({
    kartArkaplan: '#FFF',
    arkaplan: '#F5F5F5',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { uyari: '#FF6B35', hata: '#F44336', basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../../../../core/utils/TarihYardimcisi', () => ({
  tarihiGorunumFormatinaCevir: () => '21 Mart 2026',
  gunAdiniAl: () => 'Cumartesi',
}));

jest.useFakeTimers();

const temelProps = {
  tarih: '2026-03-21',
  streakGun: 10,
  bugunMu: true,
  onTarihTikla: jest.fn(),
  onSeriTikla: jest.fn(),
};

/**
 * Ağaçtan "fire" (alev) ikonu node'unu bulup gerçek `color` prop'unu döndürür.
 * Arka plan (SERI_RENKLERI.ATES + '20') veya alttaki etiket (satır 153'te
 * hardcoded '#f59e0b') gibi sızıntı kaynaklarını DEVRE DIŞI bırakır:
 * yalnızca ikona uygulanan `atesRenk` hesaplaması test edilir.
 */
function atesIkonRenginiAl(tree: renderer.ReactTestRenderer): string {
  // name === 'fire' yalnızca tek FontAwesome5 alev ikonuna uyar (kıble ikonu name="compass").
  const ikonlar = tree.root.findAll((node) => node.props?.name === 'fire');
  expect(ikonlar).toHaveLength(1);
  return ikonlar[0].props.color;
}

/**
 * Seri (ateş) butonunun (TouchableOpacity) style'ından opacity değerini döndürür.
 * Aynı accessibilityLabel hem butonda hem ikonda olduğundan, style != null
 * filtresiyle butonu seçeriz (ikonun style prop'u yoktur).
 */
function seriButonOpacityAl(
  tree: renderer.ReactTestRenderer,
  etiket: string
): number | undefined {
  const dugumler = tree.root.findAll(
    (n) => n.props?.accessibilityLabel === etiket && n.props?.style != null
  );
  const stiller = dugumler.map((n) => n.props.style).flat();
  const opacityStili = stiller.find(
    (s: { opacity?: number } | undefined) => s && typeof s.opacity === 'number'
  );
  return opacityStili?.opacity;
}

describe('HomeHeader — Kademeli Ateş İkonu', () => {
  it('normal modda ateş ikonu SERI_RENKLERI.ATES renginde (#FF6B35)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeHeader {...temelProps} />); });
    // İkonun gerçek color prop'u üretim sabitiyle (string literal değil) doğrulanır.
    expect(atesIkonRenginiAl(tree!)).toBe(SERI_RENKLERI.ATES);
    expect(SERI_RENKLERI.ATES).toBe('#FF6B35');
    // Normal modda donukluk olmamalı: opacity tam (1).
    expect(seriButonOpacityAl(tree!, 'Seri: 10 gün')).toBe(1);
  });

  it('toparlanma gün 0/3 → gri/donuk', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 0, hedef: 3 }} />
      );
    });
    // ilerleme === 0 → gri renk
    expect(atesIkonRenginiAl(tree!)).toBe('#9ca3af');
    // 'donuk' davranışı: buton opacity'si 0.5 olmalı (sönük görünüm)
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 0/3 gün tamamlandı')).toBe(0.5);
  });

  it('toparlanma gün 1/3 → amber', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    // ilerleme 1/3 (<0.5) → amber. Etiketten (hardcoded '#f59e0b') değil,
    // ikonun gerçek atesRenk'i doğrulanır.
    expect(atesIkonRenginiAl(tree!)).toBe('#f59e0b');
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 1/3 gün tamamlandı')).toBe(0.7);
  });

  it('toparlanma gün 2/3 → turuncu', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 2, hedef: 3 }} />
      );
    });
    // ilerleme 2/3 (<1) → turuncu
    expect(atesIkonRenginiAl(tree!)).toBe('#f97316');
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 2/3 gün tamamlandı')).toBe(0.85);
  });

  it('toparlanma tamamlandı 3/3 → tam alev (SERI_RENKLERI.ATES, opak)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 3, hedef: 3 }} />
      );
    });
    // ilerleme === 1 → tam alev rengine geri döner, opacity 1
    expect(atesIkonRenginiAl(tree!)).toBe(SERI_RENKLERI.ATES);
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 3/3 gün tamamlandı')).toBe(1);
  });

  it('recovery label X/Y gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('1/3');
  });

  // ilerleme === 0.5 SINIRI (1/2): kod `ilerleme < 0.5` ile amber, `< 1` ile
  // turuncu ayırıyor. 0.5 TAM olarak `< 0.5` değildir → turuncu (#f97316) + 0.85.
  // Eşik `<` yerine `<=` olarak kayarsa (regresyon) bu test FAIL eder; mevcut
  // 1/3 ve 2/3 testleri 0.5 sınırına denk gelmediğinden bu kaymayı yakalayamaz.
  it('toparlanma 1/2 (ilerleme === 0.5) → turuncu (amber DEĞİL), opacity 0.85', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 2 }} />
      );
    });
    expect(atesIkonRenginiAl(tree!)).toBe('#f97316');
    expect(atesIkonRenginiAl(tree!)).not.toBe('#f59e0b'); // amber sınırın içinde DEĞİL
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 1/2 gün tamamlandı')).toBe(0.85);
  });

  // hedef === 0 SAVUNMA: kod `hedef > 0 ? tamamlanan/hedef : 0` ile sıfıra
  // bölmeyi koruyor (NaN üretmemeli). ilerleme=0 → gri (#9ca3af) + 0.5.
  // Guard kaldırılırsa 0/0 = NaN olur; NaN hiçbir karşılaştırmayı geçmez,
  // son dala (tam alev #FF6B35) düşer ve bu test FAIL eder.
  it('hedef === 0 (0/0) → sıfıra bölme korunur, gri + opacity 0.5', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 0, hedef: 0 }} />
      );
    });
    expect(atesIkonRenginiAl(tree!)).toBe('#9ca3af');
    expect(atesIkonRenginiAl(tree!)).not.toBe(SERI_RENKLERI.ATES); // NaN→tam alev sızıntısı yok
    expect(seriButonOpacityAl(tree!, 'Toparlanma modu: 0/0 gün tamamlandı')).toBe(0.5);
  });
});

describe('HomeHeader — Erişilebilirlik ve metin', () => {
  /**
   * Ağaçta verilen accessibilityLabel'a sahip en az bir node bulunduğunu doğrular.
   * Hem seri butonu hem ateş ikonu aynı etiketi taşıdığından >=1 beklenir.
   */
  function etiketliDugumSayisi(tree: renderer.ReactTestRenderer, etiket: string): number {
    return tree.root.findAll((n) => n.props?.accessibilityLabel === etiket).length;
  }

  // Görme engelli kullanıcı için kritik: normal seride buton 'Seri: N gün'
  // etiketini taşımalı (toparlanma etiketi DEĞİL). Etiket metni üretim
  // şablonundan (`Seri: ${streakGun} gün`) bozulursa bu test FAIL eder.
  it('normal modda accessibilityLabel "Seri: 10 gün"', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeHeader {...temelProps} streakGun={10} />); });
    expect(etiketliDugumSayisi(tree!, 'Seri: 10 gün')).toBeGreaterThan(0);
    // Normal modda toparlanma etiketi SIZMAMALI.
    expect(etiketliDugumSayisi(tree!, 'Toparlanma modu: 0/3 gün tamamlandı')).toBe(0);
  });

  // Toparlanma modunda etiket ilerleme metnini taşımalı; normal seri etiketi
  // (örn. 'Seri: 10 gün') artık görünmemeli — ekran okuyucu yanlış bağlam vermez.
  it('toparlanma modunda accessibilityLabel "Toparlanma modu: 1/3 gün tamamlandı"', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <HomeHeader {...temelProps} streakGun={10} toparlanmaModu={true} toparlanmaIlerleme={{ tamamlanan: 1, hedef: 3 }} />
      );
    });
    expect(etiketliDugumSayisi(tree!, 'Toparlanma modu: 1/3 gün tamamlandı')).toBeGreaterThan(0);
    expect(etiketliDugumSayisi(tree!, 'Seri: 10 gün')).toBe(0);
  });

  // streakGun ekrana '<N> Gün' olarak yansımalı (satır 148). Sayı yanlış
  // prop'tan okunursa veya metin formatı bozulursa bu test FAIL eder.
  it('streakGun ekrana "<N> Gün" olarak yazılır', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeHeader {...temelProps} streakGun={42} />); });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('42');
    expect(json).toContain('Gün');
  });

  // Tarih bağlam metni mantığı (satır 93): aktifGunMu en yüksek öncelik.
  it('aktifGunMu=true → "Aktif Gün" gösterir (bugünden bağımsız)', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<HomeHeader {...temelProps} aktifGunMu={true} bugunMu={false} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Aktif Gün');
    expect(json).not.toContain('Seçili Tarih');
  });

  it('aktifGunMu yok + bugunMu=true → "Bugün" gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<HomeHeader {...temelProps} bugunMu={true} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Bugün');
    expect(json).not.toContain('Aktif Gün');
    expect(json).not.toContain('Seçili Tarih');
  });

  it('aktifGunMu yok + bugunMu=false → "Seçili Tarih" gösterir', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<HomeHeader {...temelProps} bugunMu={false} />);
    });
    const json = JSON.stringify(tree!.toJSON());
    expect(json).toContain('Seçili Tarih');
    expect(json).not.toContain('Aktif Gün');
  });
});
