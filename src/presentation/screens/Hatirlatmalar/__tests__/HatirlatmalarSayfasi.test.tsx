/**
 * Hatırlatmalar — tek sayfa (sade tasarım, Dalga 3).
 *
 * Ölçülenler: her hatırlatma tek satırda canlı özetiyle; satır ayrıntıya gider;
 * anahtarlar yüzeyin KENDİ yazma yolunu kullanır (thunk); yapısal artan açma
 * bildirim sınırı simülasyonundan geçer ve sığmazsa YAZILMAZ; takvim çakışması
 * rızasız açılamaz → anahtar ayrıntıya `ac: true` ile gider; hidrasyon odakta.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { varsayilanCumaAyarlari } from '../../../../core/cuma/cumaAyarlari';
import { VARSAYILAN_CAMIYE_GIT_AYARLARI } from '../../../../core/camiyeGit/camiyeGitAyarlari';
import { varsayilanYatisAyarlari } from '../../../../core/yatis/yatisAyarlari';
import { VARSAYILAN_TAKVIM_CAKISMA_AYARLARI } from '../../../../core/takvimCakisma/takvimCakismaAyarlari';
import { VARSAYILAN_NAFILE_AYARLARI } from '../../../../core/nafile/nafileTipleri';
import { VARSAYILAN_SERI_AYARLARI } from '../../../../core/types/SeriTipleri';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useRoute: () => ({ params: undefined }),
    useFocusEffect: (cb: () => void | (() => void)) => {
        const R = require('react');
        R.useEffect(cb, [cb]);
    },
}));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        arkaplan: '#FAFAFA',
        kartArkaplan: '#FFFFFF',
        metin: '#212121',
        metinIkincil: '#757575',
        sinir: '#E0E0E0',
        bilgi: '#2196F3',
        dikkat: '#FF9800',
        durum: { basarili: '#4CAF50', bilgi: '#2196F3', hata: '#F44336', uyari: '#FFC107', dikkat: '#FF9800' },
    }),
}));
jest.mock('../../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn() }) }));
const mockMatrisCoz = jest.fn((_k: unknown): unknown => ({}));
jest.mock('../../../../core/muhafiz/motorAdaptoru', () => ({
    ...jest.requireActual('../../../../core/muhafiz/motorAdaptoru'),
    muhafizMatrisiniCoz: (k: unknown) => mockMatrisCoz(k),
}));

// Ağır kancalar: sayfanın sözleşmesini ölçüyoruz, kancaların kendisini değil (kendi testleri var).
const mockDegisikligiDene = jest.fn(() => true);
jest.mock('../../../hooks/useBildirimButcesi', () => ({ useBildirimButcesi: () => ({ ozet: null }) }));
jest.mock('../../../hooks/useButceRehberi', () => ({
    useButceRehberi: () => ({ degisikligiDene: mockDegisikligiDene, karttanAc: jest.fn(), ogeler: null }),
}));
jest.mock('../../../hooks/useMuhafizPlanlama', () => ({ useMuhafizPlanlama: () => ({ planlamayiKuyrugaAl: jest.fn() }) }));
const mockAktifiDegistir = jest.fn();
jest.mock('../../../hooks/useMuhafizDuzeyi', () => ({
    useMuhafizDuzeyi: () => ({ secili: 'normal', ozelVar: false, sec: jest.fn(), aktifiDegistir: mockAktifiDegistir, modal: null }),
}));
const mockIftar = jest.fn();
const mockSahur = jest.fn();
jest.mock('../../../hooks/useRamazanSayaclari', () => ({
    useRamazanSayaclari: () => ({ iftar: false, sahur: false, iftarDegistir: mockIftar, sahurDegistir: mockSahur }),
}));
jest.mock('../../../hooks/useCihazDurumu', () => ({ useCihazDurumu: () => ({ durum: {}, yenile: jest.fn() }) }));
jest.mock('../../../components/bildirim/BildirimButceKarti', () => ({ BildirimButceKarti: () => null }));
const mockGeriAl = jest.fn();
jest.mock('../../../components/ortak/GeriAlBandi', () => ({ geriAlBandiGoster: (...a: unknown[]) => mockGeriAl(...a) }));

// Thunk'lar: yalnız hangi yazma yolunun hangi argümanla çağrıldığı ölçülür.
jest.mock('../../../store/vakitBildirimSlice', () => ({
    vakitBildirimAyarlariniYukle: jest.fn(() => ({ type: 'vb/yukle' })),
    tumVakitBildirimAyarlariniGuncelle: jest.fn((a) => ({ type: 'vb/tum', payload: a })),
}));
jest.mock('../../../store/cumaHatirlatmaSlice', () => ({
    cumaHatirlatmaAyariniGuncelle: jest.fn((a) => ({ type: 'cuma/guncelle', payload: a })),
}));
jest.mock('../../../store/camiyeGitSlice', () => ({
    camiyeGitAyariniGuncelle: jest.fn((a) => ({ type: 'camiye/guncelle', payload: a })),
}));
jest.mock('../../../store/yatisHatirlatmaSlice', () => ({
    yatisHatirlatmaAyariniGuncelle: jest.fn((a) => ({ type: 'yatis/guncelle', payload: a })),
}));
jest.mock('../../../store/takvimCakismaSlice', () => ({
    takvimCakismaAyarlariniYukle: jest.fn(() => ({ type: 'tc/yukle' })),
    takvimCakismaAyariniGuncelle: jest.fn((a) => ({ type: 'tc/guncelle', payload: a })),
}));
jest.mock('../../../store/seriSlice', () => ({
    seriAyarlariniGuncelle: jest.fn((a) => ({ type: 'seri/ayar', payload: a })),
}));

const mockDispatch = jest.fn();
let mockState: Record<string, unknown>;
jest.mock('../../../store/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (sec: (s: unknown) => unknown) => sec(mockState),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HatirlatmalarSayfasi } from '../HatirlatmalarSayfasi';

const durumKur = (ust: Record<string, unknown> = {}) => {
    mockState = {
        muhafiz: { aktif: true, yogunluk: 'normal' },
        konum: { koordinatlar: { lat: 41, lng: 29 } },
        vakitSayac: { ayarlar: {} },
        vakitBildirim: { ayarlar: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false } },
        cumaHatirlatma: { ayarlar: varsayilanCumaAyarlari() },
        camiyeGit: { ayarlar: VARSAYILAN_CAMIYE_GIT_AYARLARI },
        yatisHatirlatma: { ayarlar: varsayilanYatisAyarlari() },
        takvimCakisma: { ayarlar: VARSAYILAN_TAKVIM_CAKISMA_AYARLARI },
        nafile: { ayarlar: VARSAYILAN_NAFILE_AYARLARI },
        seri: {
            ayarlar: { ...VARSAYILAN_SERI_AYARLARI, gunSonuBildirimAktif: true },
            ozelGunAyarlari: { ozelGunModuAktif: false, aktifOzelGun: null },
        },
        ...ust,
    };
};

beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockDegisikligiDene.mockReturnValue(true);
    durumKur();
});

const tipler = () => mockDispatch.mock.calls.map((c) => (c[0] as { type: string }).type);

describe('HatirlatmalarSayfasi', () => {
    it('düzey seçici + on hatırlatma satırı, her biri canlı tek cümleyle', () => {
        const e = render(<HatirlatmalarSayfasi />);
        expect(e.getByTestId('hatirlatma-duzeyi')).toBeTruthy();
        expect(e.getByLabelText('Vakit girince. Sabah, akşam')).toBeTruthy();
        expect(e.getByLabelText('Vakit çıkmadan. Normal düzey')).toBeTruthy();
        expect(e.getByLabelText('Cuma namazı. Kapalı')).toBeTruthy();
        expect(e.getByLabelText('Camiye gitme vakti. Kapalı')).toBeTruthy();
        expect(e.getByLabelText('Yatmadan önce. Kapalı')).toBeTruthy();
        expect(e.getByLabelText('Toplantı çakışırsa. Kapalı')).toBeTruthy();
        expect(e.getByTestId('satir-nafile')).toBeTruthy();
        expect(e.getByTestId('satir-ramazan')).toBeTruthy();
        expect(e.getByLabelText(/^Günü tamamlamadıysam\. İmsaktan \d+ dk önce$/)).toBeTruthy();
        expect(e.getByLabelText('Özel gün. Kapalı')).toBeTruthy();
    });

    it('odakta yalnız açılışta yüklenmeyen iki dilimi okur (hidrasyon kuralı)', () => {
        render(<HatirlatmalarSayfasi />);
        expect(tipler()).toEqual(expect.arrayContaining(['vb/yukle', 'tc/yukle']));
    });

    it.each([
        ['Cuma namazı', 'CumaHatirlatmaAyarlari'],
        ['Camiye gitme vakti', 'CamiyeGitAyarlari'],
        ['Yatmadan önce', 'YatisHatirlatmaAyarlari'],
        ['Vakit çıkmadan', 'MuhafizAyarlari'],
        ['Vakit girince', 'VakitGirinceAyarlari'],
        ['Günü tamamlamadıysam', 'GunSonuAyarlari'],
    ])('"%s" satırı ayrıntısına gider', (baslik, ekran) => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent.press(e.getByLabelText(new RegExp(`^${baslik}\\.`)));
        expect(mockNavigate).toHaveBeenCalledWith(ekran, undefined);
    });

    it('"Vakit girince" kapatılınca beş vakit kapanır ve "Geri al" bandı önceki seçimi geri yazar', async () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Vakit girince'), 'valueChange', false);
        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'vb/tum',
                payload: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false },
            })
        );
        expect(mockGeriAl).toHaveBeenCalledWith(expect.objectContaining({ mesaj: expect.any(String) }));
        mockDispatch.mockClear();
        mockGeriAl.mock.calls[0][0].geriAl();
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'vb/tum',
            payload: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false },
        });
    });

    it('NÖBETÇİ: kapatıp açınca kullanıcının VAKİT SEÇİMİ geri gelir (beşi değil)', async () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Vakit girince'), 'valueChange', false);
        await waitFor(() => expect(tipler()).toContain('vb/tum'));

        durumKur({ vakitBildirim: { ayarlar: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false } } });
        mockDispatch.mockClear();
        e.rerender(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Vakit girince'), 'valueChange', true);
        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'vb/tum',
                payload: { imsak: true, ogle: false, ikindi: false, aksam: true, yatsi: false },
            })
        );
    });

    it('önceki seçim yoksa açmak beş vakti açar', async () => {
        durumKur({ vakitBildirim: { ayarlar: { imsak: false, ogle: false, ikindi: false, aksam: false, yatsi: false } } });
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Vakit girince'), 'valueChange', true);
        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'vb/tum',
                payload: { imsak: true, ogle: true, ikindi: true, aksam: true, yatsi: true },
            })
        );
    });

    it('"Vakit çıkmadan" anahtarı düzey kancasının ana anahtarını kullanır', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Vakit çıkmadan'), 'valueChange', false);
        expect(mockAktifiDegistir).toHaveBeenCalledWith(false);
    });

    it('cuma açmak sınırdan geçerse kendi yazma yoluyla yazılır', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Cuma namazı'), 'valueChange', true);
        expect(mockDegisikligiDene).toHaveBeenCalled();
        expect(tipler()).toContain('cuma/guncelle');
    });

    it('NÖBETÇİ: sınıra sığmayan açma YAZILMAZ (rehber açılır)', () => {
        mockDegisikligiDene.mockReturnValue(false);
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Yatmadan önce'), 'valueChange', true);
        expect(tipler()).not.toContain('yatis/guncelle');
    });

    it('NÖBETÇİ: takvim çakışması rızasız açılamaz → ayrıntıya açma isteğiyle gider, yazmaz', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Toplantı çakışırsa'), 'valueChange', true);
        expect(mockNavigate).toHaveBeenCalledWith('TakvimCakismaAyarlari', { ac: true });
        expect(tipler()).not.toContain('tc/guncelle');
    });

    it('takvim çakışmasını kapatmak doğrudan yazılır', () => {
        durumKur({ takvimCakisma: { ayarlar: { ...VARSAYILAN_TAKVIM_CAKISMA_AYARLARI, aktif: true } } });
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Toplantı çakışırsa'), 'valueChange', false);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'tc/guncelle', payload: { aktif: false } });
    });

    it('Ramazan anahtarı iftar ve sahuru birlikte değiştirir', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Ramazan'), 'valueChange', true);
        expect(mockIftar).toHaveBeenCalledWith(true);
        expect(mockSahur).toHaveBeenCalledWith(true);
    });

    it('"Günü tamamlamadıysam" seri gün sonu ayarını yazar', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Günü tamamlamadıysam'), 'valueChange', false);
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'seri/ayar', payload: { ayarlar: { gunSonuBildirimAktif: false } } });
    });

    it('özel gün sürüyorsa satır bunu söyler', async () => {
        durumKur({
            seri: {
                ayarlar: VARSAYILAN_SERI_AYARLARI,
                ozelGunAyarlari: { ozelGunModuAktif: true, aktifOzelGun: { baslangic: '2026-10-17' } },
            },
        });
        const e = render(<HatirlatmalarSayfasi />);
        await waitFor(() => expect(e.getByLabelText('Özel gün. Şu an sürüyor')).toBeTruthy());
    });
});

describe('HatirlatmalarSayfasi — gece sessizliği', () => {
    it('alanı olmayan (mevcut) kayıtta KAPALI görünür ve özet ne kazanacağını söyler', () => {
        const e = render(<HatirlatmalarSayfasi />);
        expect(e.getByLabelText('Gece sessiz saatler. Kapalı. Açarsanız gece uyarı gelmez')).toBeTruthy();
    });

    it('anahtar muhafız kaydına yazar (23:00 varsayılan)', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent(e.getByLabelText('Gece sessiz saatler'), 'valueChange', true);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { geceSessizligi: { aktif: true, baslangicSaat: 23, baslangicDakika: 0 } },
            })
        );
    });

    it('başlangıç saati seçilip kaydedilir', () => {
        durumKur({ muhafiz: { aktif: true, yogunluk: 'normal', geceSessizligi: { aktif: true, baslangicSaat: 23, baslangicDakika: 0 } } });
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent.press(e.getByLabelText(/^Gece sessiz saatler\. 23:00/));
        fireEvent.press(e.getByTestId('gece-baslangic-22:30'));
        fireEvent.press(e.getByLabelText('Kaydedin'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { geceSessizligi: { aktif: true, baslangicSaat: 22, baslangicDakika: 30 } },
            })
        );
    });
});

describe('HatirlatmalarSayfasi — "Daha az bildirim" önerisi (mevcut kullanıcı, bir kez)', () => {
    const { presetMatrisiOlustur } = jest.requireActual('../../../../core/muhafiz/matrisIslemleri');
    const { HATIRLATMA_PRESETLERI: P, ESKI_PRESET_SEVIYELERI: ESKI } = jest.requireActual('../../../store/muhafizSlice');
    const eylemler = () => mockDispatch.mock.calls.map((c) => c[0] as { type?: string; payload?: Record<string, unknown> });

    afterEach(() => mockMatrisCoz.mockImplementation(() => ({})));

    it('eski Normal kaydında görünür; uygulayınca Normal + gece sessiz yazılır, "Geri al" önceki hâli BİREBİR yazar', () => {
        const eski = presetMatrisiOlustur(ESKI.normal, false);
        mockMatrisCoz.mockImplementation(() => eski);
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent.press(e.getByTestId('varsayilan-oneri-uygula'));
        const matrisEylemi = eylemler().find((a) => a.type === 'muhafiz/matrisiGuncelle') as unknown as { payload: { ogle: { seviyeler: unknown[] } } };
        expect(matrisEylemi.payload.ogle.seviyeler).toHaveLength(3);
        expect(eylemler()).toContainEqual(
            expect.objectContaining({
                payload: {
                    yogunluk: 'normal',
                    geceSessizligi: { aktif: true, baslangicSaat: 23, baslangicDakika: 0 },
                    varsayilanOnerisiGoruldu: true,
                },
            })
        );
        mockDispatch.mockClear();
        mockGeriAl.mock.calls[0][0].geriAl();
        expect(eylemler()).toContainEqual(expect.objectContaining({ type: 'muhafiz/matrisiGuncelle', payload: eski }));
        expect(eylemler()).toContainEqual(expect.objectContaining({ payload: { yogunluk: 'normal', geceSessizligi: undefined } }));
    });

    it('"Kapatın" kartı kalıcı gizler', () => {
        const e = render(<HatirlatmalarSayfasi />);
        fireEvent.press(e.getByTestId('varsayilan-oneri-kapat'));
        expect(eylemler()).toContainEqual(expect.objectContaining({ payload: { varsayilanOnerisiGoruldu: true } }));
    });

    it('görülmüşse ya da zaten önerilen ayardaysa görünmez', () => {
        durumKur({ muhafiz: { aktif: true, yogunluk: 'normal', varsayilanOnerisiGoruldu: true } });
        expect(render(<HatirlatmalarSayfasi />).queryByTestId('varsayilan-oneri-karti')).toBeNull();
        mockMatrisCoz.mockImplementation(() => presetMatrisiOlustur(P.normal.seviyeler, false));
        durumKur({ muhafiz: { aktif: true, yogunluk: 'normal', geceSessizligi: { aktif: true, baslangicSaat: 23, baslangicDakika: 0 } } });
        expect(render(<HatirlatmalarSayfasi />).queryByTestId('varsayilan-oneri-karti')).toBeNull();
    });
});
