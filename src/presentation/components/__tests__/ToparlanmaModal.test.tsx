import React from 'react';
import { act } from 'react-test-renderer';
import renderer from 'react-test-renderer';
import { BackHandler, TouchableOpacity } from 'react-native';
import { ToparlanmaModal } from '../ToparlanmaModal';

jest.mock('@expo/vector-icons', () => ({ FontAwesome5: 'FontAwesome5' }));
jest.mock('../../../core/theme', () => ({
  useRenkler: () => ({
    arkaplan: '#FFFFFF',
    sinir: '#E0E0E0',
    birincil: '#4CAF50',
    kartArkaplan: '#FFF',
    metin: '#212121',
    metinIkincil: '#757575',
    durum: { basarili: '#4CAF50' },
  }),
  useTema: () => ({ koyuMu: false }),
}));
jest.mock('../ToparlanmaKarti', () => ({ ToparlanmaKarti: 'ToparlanmaKarti' }));

jest.useFakeTimers();

const ornekToparlanmaDurumu = {
  tamamlananGun: 2,
  hedefGunSayisi: 3,
  baslangicTarihi: '2026-03-20',
  oncekiSeri: 10,
};

// Üretimdeki gerçek kapatma butonu etiketi (ToparlanmaModal.tsx:58).
// Stabil seçici: metin/stil değişse bile bu etiket sözleşmedir.
const KAPAT_ETIKETI = 'Toparlanma modalını kapat';

const modalOlustur = (
  props: Partial<React.ComponentProps<typeof ToparlanmaModal>> = {}
): renderer.ReactTestRenderer => {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <ToparlanmaModal
        gorunur
        onKapat={jest.fn()}
        toparlanmaDurumu={ornekToparlanmaDurumu}
        oncekiSeri={10}
        {...props}
      />
    );
  });
  return tree;
};

describe('ToparlanmaModal', () => {
  it('görünür modda render olur ve Modal görünür (visible=true)', () => {
    const tree = modalOlustur({ gorunur: true });

    expect(tree.toJSON()).not.toBeNull();
    // gorunur=true → alttaki RN Modal visible=true ile mount edilir.
    const modal = tree.root.findByProps({ visible: true });
    expect(modal.props.visible).toBe(true);
  });

  it('gorunur=false iken Modal gizlidir (visible=false)', () => {
    const tree = modalOlustur({ gorunur: false });

    // gorunur=false → Modal visible=false; props yanlış geçirilirse kırılır.
    const modal = tree.root.findByProps({ visible: false });
    expect(modal.props.visible).toBe(false);
  });

  it('Anladım butonu kararlı etikette ve tam "Anladım" metniyle render olur', () => {
    const tree = modalOlustur();

    // Butonu stabil seçiciyle (accessibilityLabel) bul — metin/stil değişimine dayanıklı.
    const buton = tree.root.findByProps({ accessibilityLabel: KAPAT_ETIKETI });
    expect(buton.props.accessibilityRole).toBe('button');

    // Görünen metin kısaltma değil, tam olarak "Anladım" olmalı (kibar/doğru kopya).
    const metin = buton.findByType('Text' as never);
    expect(metin.props.children).toBe('Anladım');
  });

  it('Anladım butonuna basınca onKapat tam 1 kez çağrılır', () => {
    const onKapat = jest.fn();
    const tree = modalOlustur({ onKapat });

    const buton = tree.root.findByProps({ accessibilityLabel: KAPAT_ETIKETI });
    act(() => {
      buton.props.onPress();
    });

    // Asıl sözleşme: kapatma butonu modalı kapatma callback'ini tetikler.
    expect(onKapat).toHaveBeenCalledTimes(1);
  });

  it('overlay (arka plan) tıklaması da onKapat çağırır', () => {
    const onKapat = jest.fn();
    const tree = modalOlustur({ onKapat });

    // En dış overlay TouchableOpacity'si onPress={onKapat} taşır (ToparlanmaModal.tsx:36-40).
    // activeOpacity=1 olan iki TouchableOpacity var; en dıştaki (ilk bulunan) overlay'dir.
    const dokunulabilirler = tree.root.findAll(
      (node) => node.props?.activeOpacity === 1 && typeof node.props?.onPress === 'function'
    );
    const overlay = dokunulabilirler[0];
    act(() => {
      overlay.props.onPress();
    });

    expect(onKapat).toHaveBeenCalledTimes(1);
  });

  it('iç bottom-sheet tıklaması olayı durdurur ve onKapat çağırmaz (yanlışlıkla kapanma yok)', () => {
    const onKapat = jest.fn();
    const tree = modalOlustur({ onKapat });

    // İç sheet, overlay'in onPress'inin balonlamasını durdurur; aksi halde sheet'e
    // her dokunuş modalı kapatır (ToparlanmaModal.tsx:42-44). Bileşen-tipiyle (host
    // çoğullaması olmadan) bul; iç sheet'i STİLİYLE seç (bottom-sheet'in kavisli üst
    // köşesi = borderTopLeftRadius). onPress ile yoklamak overlay'in onKapat'ını tetikler,
    // bu yüzden seçim yan-etkisiz olmalı.
    const touchablelar = tree.root.findAllByType(TouchableOpacity);
    const stiliDuzlestir = (stil: unknown): Record<string, unknown> =>
      Object.assign({}, ...(Array.isArray(stil) ? stil : [stil]));
    const icSheet = touchablelar.find(
      (node) => stiliDuzlestir(node.props.style).borderTopLeftRadius === 20
    );
    expect(icSheet).toBeDefined();

    const olay = { stopPropagation: jest.fn() };
    act(() => {
      icSheet!.props.onPress(olay);
    });

    // Sözleşme: sheet içine dokunmak olayı tüketir (stopPropagation) ve modalı KAPATMAZ.
    expect(olay.stopPropagation).toHaveBeenCalledTimes(1);
    expect(onKapat).not.toHaveBeenCalled();
  });

  it('toparlanmaDurumu ve oncekiSeri prop’ları ToparlanmaKarti’ya birebir aktarılır', () => {
    const ozelDurum = {
      tamamlananGun: 1,
      hedefGunSayisi: 3,
      baslangicTarihi: '2026-03-21',
      oncekiSeri: 7,
    };
    const tree = modalOlustur({ toparlanmaDurumu: ozelDurum, oncekiSeri: 7 });

    // ToparlanmaKarti mock'lu (string bileşen) → props doğrudan denetlenebilir.
    // Yanlış prop adı/değeri ile geçirilirse (regresyon) kart yanlış veri gösterir.
    const kart = tree.root.findByType('ToparlanmaKarti' as never);
    expect(kart.props.toparlanmaDurumu).toBe(ozelDurum);
    expect(kart.props.oncekiSeri).toBe(7);
  });

  it('Android donanım geri tuşu: modal görünürken onKapat çağrılır ve olay tüketilir', () => {
    // New Architecture (Fabric) altında <Modal>.onRequestClose donanım geri tuşunda
    // güvenilmez; bileşen bunu useDonanimGeriTusu(gorunur, onKapat) ile garanti eder
    // (ToparlanmaModal.tsx:26, AGENTS.md "Kritik desenler"). Bu sözleşme regresyona açık.
    let yakalananHandler: (() => boolean | void) | undefined;
    const kaldir = jest.fn();
    const ekleSpy = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_olay, h) => {
        yakalananHandler = h as () => boolean | void;
        return { remove: kaldir } as never;
      });

    try {
      const onKapat = jest.fn();
      modalOlustur({ gorunur: true, onKapat });

      // Modal görünürken hardwareBackPress dinleyicisi kaydedilmeli.
      expect(ekleSpy).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
      expect(yakalananHandler).toBeDefined();

      // Geri tuşuna basılması → onKapat tetiklenir, olay tüketilir (true döner →
      // uygulamadan çıkmaz / navigasyon olmaz).
      let donus: boolean | void = undefined;
      act(() => {
        donus = yakalananHandler?.();
      });
      expect(onKapat).toHaveBeenCalledTimes(1);
      expect(donus).toBe(true);
    } finally {
      ekleSpy.mockRestore();
    }
  });

  it('Android donanım geri tuşu: modal gizliyken (gorunur=false) dinleyici kaydedilmez', () => {
    // Hook aktif=false iken erken döner (useDonanimGeriTusu.ts:22). Gizli modalın
    // geri tuşunu yutmaması gerekir; aksi halde başka ekranların geri davranışı bozulur.
    const ekleSpy = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation(() => ({ remove: jest.fn() }) as never);

    try {
      modalOlustur({ gorunur: false });
      expect(ekleSpy).not.toHaveBeenCalled();
    } finally {
      ekleSpy.mockRestore();
    }
  });
});
