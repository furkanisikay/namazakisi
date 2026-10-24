/**
 * Namazda sessiz (sade tasarım, Dalga 3) — Camideyim (#297) + Namaz modu (#277)
 * TEK sayfa, köprü (native) mock'lu. İki tetik satırı ("Camiye girince", "Namaz
 * vakitlerinde"), ayrıntılar katlı (`sessiz-ayrintilar`), harita "Camilerim" alt
 * sayfasında. Native/veri davranışı eski iki sayfayla AYNI — testler eski sayfaların
 * testlerinden taşındı.
 *
 * Ölçülenler: köprü yoksa açıklayıcı boş durum; açmak "Her zaman" konum izni
 * yoksa ÖNCE açıklama (Prominent Disclosure) gösterir; yer satırında "cami değil"
 * native'e doğru kaydı yazar; Namaz modu erişimi yoksa rehber çıkar.
 */
import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import * as kopru from '../../../../modules/expo-cami-geofence/src';

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn(), useTema: () => ({ koyuMu: false }) }));
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
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
jest.mock('../../components/common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../../domain/services/CamideyimServisi', () => ({
    CamideyimServisi: { getInstance: () => ({ planlariGonder: jest.fn(() => Promise.resolve()) }) },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NamazdaSessizSayfasi } from '../NamazdaSessizSayfasi';
import { CamilerimSayfasi } from '../CamilerimSayfasi';
import { ingilizceyeGec, turkceKalanlar } from '../../../__tests__/yardimci/ingilizceDenetimi';

const RENKLER = {
    birincil: '#4CAF50',
    birincilMetin: '#FFFFFF',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    bilgi: '#2196F3',
    dikkat: '#FF9800',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3' },
};

const k = kopru as jest.Mocked<typeof kopru>;
const L = Location as jest.Mocked<typeof Location>;

const MOD_DURUMU = {
    destek: 'kural' as const,
    erisim: true,
    kuralVar: true,
    aktif: false,
    ayarlar: { etkin: true, cuma: true, vakit: false, vakitSureDk: 20, kildimKapat: true },
};

const NATIVE_DURUM = {
    veriVar: true,
    kayitSayisi: 3,
    veriZamani: 0,
    izin: 'tamam' as const,
    izlenenSayisi: 3,
    camide: null,
    sessizBitisMs: 0,
    namazModu: MOD_DURUMU,
};

beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
        sec({ konum: { koordinatlar: { lat: 41.01, lng: 28.97 } } })
    );
    k.camiModuluVarMi.mockReturnValue(true);
    k.ayarlariAl.mockResolvedValue({ aktif: false });
    k.durumAl.mockResolvedValue(NATIVE_DURUM);
    k.gunlukAl.mockResolvedValue([]);
    k.yakinCamiler.mockResolvedValue([]);
    k.ayarlariYaz.mockResolvedValue('kuruldu');
    k.namazModuDurumu.mockResolvedValue(MOD_DURUMU);
    k.namazModuAyarlariniYaz.mockResolvedValue('tamam');
});

const bosalt = () => act(async () => {
    await Promise.resolve();
    await Promise.resolve();
});

/** Ayrıntılar katı kapalı başlar; ayar/liste/nasıl çalışır orada. */
const ayrintilariAc = async (e: ReturnType<typeof render>) => {
    await waitFor(() => expect(e.getByTestId('sessiz-ayrintilar')).toBeTruthy());
    fireEvent.press(e.getByTestId('sessiz-ayrintilar'));
};

describe('NamazdaSessizSayfasi — Camiye girince', () => {
    it('köprü yoksa (iOS) açıklayıcı boş durum, ayar yok', async () => {
        k.camiModuluVarMi.mockReturnValue(false);
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        expect(e.getByText('Namazda sessiz bu telefonda yok. Android telefonlarda kullanılabilir.')).toBeTruthy();
        expect(e.queryByTestId('camideyim-ana')).toBeNull();
    });

    it('"Her zaman" izni yoksa açmak ÖNCE açıklamayı gösterir; native henüz yazılmaz', async () => {
        L.getBackgroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Camiye girince'), 'valueChange', true);
        await waitFor(() => expect(e.getByText('Camideyim için Konum')).toBeTruthy());
        expect(k.ayarlariYaz).not.toHaveBeenCalled();
    });

    it('izin varsa doğrudan açılır ve izleme merkezi konumdur', async () => {
        L.getBackgroundPermissionsAsync.mockResolvedValue({ status: 'granted' } as never);
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Camiye girince'), 'valueChange', true);
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect(k.ayarlariYaz.mock.calls[0][0]).toMatchObject({ aktif: true });
        expect(k.ayarlariYaz.mock.calls[0][1]).toEqual({ lat: 41.01, lng: 28.97 });
    });

    it('"Hatırlatmalar sessiz gelsin" açıklaması muhafız KAPALIYKEN de görünür ve ek hatırlatmaları da söyler', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
            sec({ konum: { koordinatlar: { lat: 41.01, lng: 28.97 } }, muhafiz: { aktif: false } })
        );
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText('Hatırlatmalar sessiz gelsin')).toBeTruthy());
        const aciklama = e.getByText(/gelmeye devam eder; sesli okuma ve gerçek alarm susar/);
        expect(aciklama.props.children).toMatch(/cuma/);
        expect(aciklama.props.children).toMatch(/nafile/);
    });

    it('yakın cami listesi: "Cami değil" hariç kaydı yazar', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Kare Camii', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137 },
        ]);
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText('Kare Camii')).toBeTruthy());
        fireEvent.press(e.getByTestId('cami-osm:w1'));
        expect(e.getByText(/bina sınırı kullanılıyor/)).toBeTruthy();
        fireEvent.press(e.getByLabelText('Kare Camii: cami değil'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect((k.ayarlariYaz.mock.calls[0][0] as { yerler: unknown }).yerler).toEqual({ 'osm:w1': { durum: 'haric', ad: 'Kare Camii' } });
    });

    it('REGRESYON (liste): eski metre stepper\'ı yerine ortak sınır ayarı; daireden özgün sınıra dönülür', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, yerler: { 'osm:w1': { durum: 'normal', alanM: 50 } } });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Kare Camii', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137 },
        ]);
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText('Kare Camii')).toBeTruthy());
        fireEvent.press(e.getByTestId('cami-osm:w1'));
        expect(e.getByTestId('liste-sinir-osm:w1-ayari')).toBeTruthy();
        fireEvent.press(e.getByTestId('liste-sinir-osm:w1-ozgun'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect((k.ayarlariYaz.mock.calls.at(-1)![0] as { yerler: unknown }).yerler).toEqual({});
    });

    it('son algılamalar (ayrıntılar katında): neden algılanmadığını yazar', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.gunlukAl.mockResolvedValue([{ zamanMs: Date.now(), tur: 'olcum', sonuc: 'supheli', dogrulukM: 48 }]);
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText('Ölçüm yeterince hassas değildi')).toBeTruthy());
        // Güven örnekleri JS ikiziyle canlı: varsayılan "akıllı"da önünden geçmek hiçbir şey yapmaz.
        expect(e.getByLabelText('Önünden yürüyerek geçmek: Hiçbir şey olmaz')).toBeTruthy();
        expect(e.getByLabelText('Trafikte caminin önünde beklemek: Size sorulur')).toBeTruthy();
    });

    it('açılış biçimi ve izleme kapsamı native\'e yazılır', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByTestId('acilis-sorarak')).toBeTruthy());
        fireEvent.press(e.getByTestId('acilis-sorarak'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalledWith(expect.objectContaining({ acilisBicimi: 'sorarak' }), expect.anything()));
        fireEvent.press(e.getByTestId('kapsam-secilenler'));
        await waitFor(() =>
            expect(k.ayarlariYaz).toHaveBeenLastCalledWith(expect.objectContaining({ izlemeKapsami: 'secilenler' }), expect.anything())
        );
    });

    it('yalnız seçtiklerim + hiç seçili yer yoksa uyarır', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, izlemeKapsami: 'secilenler' });
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText(/şu an hiçbir yer izlenmiyor/)).toBeTruthy());
    });

    it('bekleyen "Camide misiniz?" sorusu sayfada cevaplanabilir', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.durumAl.mockResolvedValue({
            ...NATIVE_DURUM,
            soru: { yer: { id: 'osm:w1', ad: 'Kare Camii', lat: 41, lng: 29 }, vakit: 'ogle', tarih: '2026-10-13', cuma: false, tur: 't', zamanMs: 0, bitisMs: 1 },
        });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByText('Camide misiniz? · Kare Camii')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Namaz modunu açın'));
        await waitFor(() => expect(k.soruyuCevapla).toHaveBeenCalledWith(true));
    });

    it('NÖBETÇİ (veri kaybı): yazım native\'deki EN SON kaydın üstüne yapılır — başka örnekte (Camilerim) yazılan "cami değil" EZİLMEZ', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByTestId('acilis-sorarak')).toBeTruthy());
        // Camilerim alt sayfası (kancanın AYRI örneği) bu arada native'e yazdı:
        k.ayarlariAl.mockResolvedValue({ aktif: true, yerler: { 'osm:w1': { durum: 'haric', ad: 'Kare Camii' } } });
        fireEvent.press(e.getByTestId('acilis-sorarak'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        const yazilan = k.ayarlariYaz.mock.calls[0][0] as { acilisBicimi: string; yerler: Record<string, unknown> };
        expect(yazilan.acilisBicimi).toBe('sorarak');
        expect(yazilan.yerler).toEqual({ 'osm:w1': { durum: 'haric', ad: 'Kare Camii' } });
    });

    it('"Camiye girince" kapanınca zamanlı tetiği olmayan Namaz modu "etkin" kalmaz', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, namazModu: true });
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, ayarlar: { ...MOD_DURUMU.ayarlar, etkin: true, cuma: false, vakit: false } });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('camilerim')).toBeTruthy());
        fireEvent(e.getByLabelText('Camiye girince'), 'valueChange', false);
        await waitFor(() => expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: false })));
    });

    it('"Camiye girince" kapanınca zamanlı tetikli mod AÇIK kalır', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, namazModu: true });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('camilerim')).toBeTruthy());
        fireEvent(e.getByLabelText('Camiye girince'), 'valueChange', false);
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect(k.namazModuAyarlariniYaz).not.toHaveBeenCalled();
    });

    it('"Camilerim" satırı Camideyim KAPALIYKEN de görünür (keşif) ve izin istemeden haritaya gider', async () => {
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('camilerim')).toBeTruthy());
        fireEvent.press(e.getByTestId('camilerim'));
        expect(mockNavigate).toHaveBeenCalledWith('Camilerim');
        expect(L.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
        expect(L.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
        expect(k.ayarlariYaz).not.toHaveBeenCalled();
    });

    it('mini önizleme: "Yakınınızda N cami" (2 km içi) sayar, dokununca harita açılır', async () => {
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'A', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137 },
            { id: 'osm:n2', ad: 'B', lat: 41.02, lng: 28.98, yaricapM: 0, poligonVar: false, mesafeM: 1400 },
            { id: 'osm:n3', ad: 'C', lat: 41.05, lng: 28.99, yaricapM: 0, poligonVar: false, mesafeM: 4700 },
        ]);
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('yakin-camiler-onizleme')).toBeTruthy());
        expect(e.getByText('Yakınınızda 2 cami')).toBeTruthy();
        fireEvent.press(e.getByTestId('yakin-camiler-onizleme'));
        expect(mockNavigate).toHaveBeenCalledWith('Camilerim');
    });

    it('mini önizleme: yakında hiç cami yoksa (veri yok) kart çizilmez', async () => {
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        expect(e.queryByTestId('yakin-camiler-onizleme')).toBeNull();
    });

    it('iç sekme çubuğu YOK (harita ayrı sayfa, ayrıntılar katlı)', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        expect(e.queryByTestId('sekme-harita')).toBeNull();
        expect(e.queryByTestId('sekme-nasil')).toBeNull();
        expect(e.queryByTestId('cami-haritasi')).toBeNull();
    });

    it('Camilerim (harita): camiye dokununca panel açılır, "Cami değil" yazılır', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Kare Camii', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137, poligon: null },
        ]);
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-haritasi')).toBeTruthy());
        expect(e.getByText(/© OpenStreetMap katkıcıları/)).toBeTruthy();
        // Ayarsız cami KÜME kaynağındadır (uzakta kümelenir, yakında ikonla tek tek görünür).
        const kaynak = e.UNSAFE_root.findAll((n) => (n.type as unknown) === 'GeoJSONSource' && n.props.id === 'cami-kumeleri')[0];
        expect(kaynak.props.cluster).toBe(true);
        await waitFor(() => expect(kaynak.props.data.features).toHaveLength(1));
        expect(k.yakinCamiler).toHaveBeenCalledWith(41.01, 28.97, 150);
        expect(e.getByText('Camiye dokunun')).toBeTruthy();
        // Lejant varsayılan KAPALI; '?' ile açılır.
        expect(e.queryByTestId('harita-lejant')).toBeNull();
        fireEvent.press(e.getByTestId('harita-lejant-dugmesi'));
        expect(e.getByTestId('harita-lejant')).toBeTruthy();
        await act(async () => {
            await kaynak.props.onPress({ nativeEvent: { features: [{ properties: { id: 'osm:w1' } }] } });
        });
        await waitFor(() => expect(e.getByTestId('harita-yer-paneli')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Kare Camii: cami değil'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        expect((k.ayarlariYaz.mock.calls[0][0] as { yerler: unknown }).yerler).toEqual({ 'osm:w1': { durum: 'haric', ad: 'Kare Camii' } });
    });

    const KARE: [number, number][] = [
        [41.01082, 28.971762],
        [41.01082, 28.972238],
        [41.01118, 28.972238],
        [41.01118, 28.971762],
    ];

    const kareyiSec = async (ayarlar: Record<string, unknown>) => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, yerler: ayarlar });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Kare Camii', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137, poligon: KARE },
        ]);
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-haritasi')).toBeTruthy());
        await waitFor(() =>
            expect(e.UNSAFE_root.findAll((n) => (n.type as unknown) === 'GeoJSONSource' && n.props.data?.features?.length > 0).length).toBeGreaterThan(0)
        );
        const kaynak = e.UNSAFE_root.findAll(
            (n) => (n.type as unknown) === 'GeoJSONSource' && (n.props.id === 'cami-noktalari' || n.props.id === 'cami-kumeleri') && n.props.data.features.length > 0
        )[0];
        await act(async () => {
            await kaynak.props.onPress({ nativeEvent: { features: [{ properties: { id: 'osm:w1' } }] } });
        });
        await waitFor(() => expect(e.getByTestId('harita-sinir-ayari')).toBeTruthy());
        return e;
    };

    it('SINIR: poligonlu camide varsayılan "Bina sınırı" kipi; büyütme ölçek yazar, poligonu daireye ÇEVİRMEZ', async () => {
        const e = await kareyiSec({});
        expect(e.getByTestId('harita-sinir-aciklama').props.children.join('')).toMatch('Caminin kendi bina sınırı kullanılıyor.');
        expect(e.queryByTestId('harita-sinir-ozgun')).toBeNull();
        fireEvent.press(e.getByLabelText('Kare Camii bina sınırı büyütme artır'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled(), { timeout: 3000 });
        const yer = (k.ayarlariYaz.mock.calls.at(-1)![0] as { yerler: Record<string, unknown> }).yerler['osm:w1'];
        expect(yer).toEqual({ durum: 'normal', olcek: 1.1 });
    });

    it('REGRESYON: daireye çevrilmiş bina sınırı "Özgün bina sınırına dönün" ile geri gelir', async () => {
        const e = await kareyiSec({ 'osm:w1': { durum: 'favori', alanM: 60 } });
        expect(e.getByTestId('harita-sinir-kip-daire').props.accessibilityState.selected).toBe(true);
        fireEvent.press(e.getByTestId('harita-sinir-ozgun'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        const yer = (k.ayarlariYaz.mock.calls.at(-1)![0] as { yerler: Record<string, unknown> }).yerler['osm:w1'];
        expect(yer).toEqual({ durum: 'favori' });
    });

    it('SINIR: "Daire" kipi mevcut alandan başlar ve ölçeği siler', async () => {
        const e = await kareyiSec({ 'osm:w1': { durum: 'normal', olcek: 2 } });
        fireEvent.press(e.getByTestId('harita-sinir-kip-daire'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        const yer = (k.ayarlariYaz.mock.calls.at(-1)![0] as { yerler: Record<string, unknown> }).yerler['osm:w1'];
        expect(yer).toEqual({ durum: 'normal', alanM: 60 });
    });

    it('Camilerim (harita): "Yer ekleyin" haritanın ortasındaki noktayı adıyla ekler', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-haritasi')).toBeTruthy());
        act(() => e.getByTestId('cami-haritasi').props.onRegionDidChange({ nativeEvent: { center: [29.5, 40.5] } }));
        fireEvent.press(e.getByTestId('harita-yer-ekle'));
        fireEvent.changeText(e.getByLabelText('Yerin adı'), 'İş yeri mescidi');
        fireEvent.press(e.getByTestId('harita-yeri-ekle-onay'));
        await waitFor(() => expect(k.ayarlariYaz).toHaveBeenCalled());
        const yerler = (k.ayarlariYaz.mock.calls[0][0] as { yerler: Record<string, unknown> }).yerler;
        expect(Object.values(yerler)).toEqual([
            { durum: 'normal', kendi: true, ad: 'İş yeri mescidi', lat: 40.5, lng: 29.5, alanM: 20 },
        ]);
    });

    it('cami verisi yokken kendi yerlerin yine çalıştığı söylenir (ayrıntılar listesi)', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.durumAl.mockResolvedValue({ ...NATIVE_DURUM, veriVar: false });
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText(/Bu sürümde cami verisi yok/)).toBeTruthy());
    });

    it('Camilerim: cami verisi yokken harita panelinde de söylenir (boş harita sessiz kalmaz)', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.durumAl.mockResolvedValue({ ...NATIVE_DURUM, veriVar: false });
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('harita-veri-yok')).toBeTruthy());
    });

    it('Camilerim: cami verisi varken "veri yok" satırı çizilmez', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-haritasi')).toBeTruthy());
        expect(e.queryByTestId('harita-veri-yok')).toBeNull();
    });
});

describe('NamazdaSessizSayfasi — Namaz vakitlerinde', () => {
    it('etkinken tetikler (ayrıntılar katında) görünür; cuma kapatılınca native\'e yazılır', async () => {
        const e = render(<NamazdaSessizSayfasi />);
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByLabelText('Cuma hutbesi')).toBeTruthy());
        fireEvent(e.getByLabelText('Cuma hutbesi'), 'valueChange', false);
        await waitFor(() => expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ cuma: false })));
    });

    it('erişim yoksa uyarı ve rehber; rehberden ayar ekranı açılır', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, erisim: false });
        k.erisimAyariniAc.mockResolvedValue('acildi');
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('namaz-modu-erisim-uyarisi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Erişim verin'));
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Erişim ayarını açın'));
        await waitFor(() => expect(k.erisimAyariniAc).toHaveBeenCalled());
    });

    it('"Namaz vakitlerinde" açılınca hiçbir tetik yoksa cuma hutbesiyle başlar', async () => {
        k.namazModuDurumu.mockResolvedValue({
            ...MOD_DURUMU,
            ayarlar: { ...MOD_DURUMU.ayarlar, etkin: false, cuma: false, vakit: false },
        });
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', true);
        await waitFor(() =>
            expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: true, cuma: true }))
        );
    });

    it('NÖBETÇİ: "Namaz vakitlerinde" kapatıp açınca önceki tetik seçimi geri gelir', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, ayarlar: { ...MOD_DURUMU.ayarlar, etkin: true, cuma: false, vakit: true } });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByLabelText('Namaz vakitlerinde').props.value).toBe(true));
        // Kapatma sonrası native artık tetiksiz, etkin değil:
        const kapali = { ...MOD_DURUMU, ayarlar: { ...MOD_DURUMU.ayarlar, etkin: false, cuma: false, vakit: false } };
        k.namazModuDurumu.mockResolvedValue(kapali);
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', false);
        await waitFor(() =>
            expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: false, cuma: false, vakit: false }))
        );
        await waitFor(() => expect(e.getByLabelText('Namaz vakitlerinde').props.value).toBe(false));
        k.namazModuAyarlariniYaz.mockClear();
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', true);
        await waitFor(() =>
            expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: true, cuma: false, vakit: true }))
        );
    });

    it('"Namaz vakitlerinde" kapatılınca: camide mod kullanılmıyorsa mod tümden kapanır', async () => {
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', false);
        await waitFor(() => expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: false })));
    });

    it('"Namaz vakitlerinde" kapatılınca: camide mod kullanılıyorsa yalnız zamanlı tetikler kapanır', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, namazModu: true });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('camilerim')).toBeTruthy());
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', false);
        await waitFor(() =>
            expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ cuma: false, vakit: false }))
        );
        expect(k.namazModuAyarlariniYaz).not.toHaveBeenCalledWith(expect.objectContaining({ etkin: false }));
    });

    it('etkinleştirme erişim yüzünden kurulamazsa rehber kendiliğinden açılır', async () => {
        k.namazModuDurumu.mockResolvedValue({
            ...MOD_DURUMU,
            erisim: false,
            ayarlar: { ...MOD_DURUMU.ayarlar, etkin: false },
        });
        k.namazModuAyarlariniYaz.mockResolvedValue('erisimYok');
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', true);
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
    });

    it('REGRESYON (iç test): erişim VARKEN kural kurulamazsa rehber AÇILMAZ, bilgi verilir', async () => {
        const { kisaBildirimGoster } = jest.requireMock('../../components/common/KisaBildirim');
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, ayarlar: { ...MOD_DURUMU.ayarlar, etkin: false } });
        k.namazModuAyarlariniYaz.mockResolvedValue('erisimYok');
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        fireEvent(e.getByLabelText('Namaz vakitlerinde'), 'valueChange', true);
        await waitFor(() => expect(kisaBildirimGoster).toHaveBeenCalledWith(expect.stringContaining('kurulamadı'), true));
        expect(e.queryByTestId('namaz-modu-rehberi')).toBeNull();
        expect(k.erisimAyariniAc).not.toHaveBeenCalled();
    });

    it('erişim ekranı "zatenVar" derse Ayarlar açılmaz, etkin mod yeniden kurulur', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, erisim: false });
        k.erisimAyariniAc.mockResolvedValue('zatenVar');
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('namaz-modu-erisim-uyarisi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Erişim verin'));
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Erişim ayarını açın'));
        await waitFor(() =>
            expect(k.namazModuAyarlariniYaz).toHaveBeenCalledWith(expect.objectContaining({ etkin: true }))
        );
        expect(e.queryByTestId('namaz-modu-rehberi')).toBeNull();
    });
});

describe('NamazdaSessizSayfasi — İngilizce', () => {
    // Türkçe harfsiz ama Türkçe sözcükler (bu ekranlarda geçebilecek).
    const YASAKLI = ['Cami', 'cami\\b', 'Namaz\\b', 'Kapal', 'Sil\\b', 'Favori\\b', 'Sorarak', 'Otomatik', 'Daire', 'dk\\b', 'uzakta', 'Yer ekle', 'Vazge', 'Ayar'];
    // Marka adı ("Namaz Akışı") cümle içinde her dilde aynı kalır.
    const kalan = (agac: unknown) =>
        turkceKalanlar(agac as never, YASAKLI).filter((m) => turkceKalanlar(m.replace(/Namaz Akışı/g, ''), YASAKLI).length > 0);
    const OLAYLAR = [
        { tur: 'izlemeKuruldu', sayi: 4 },
        { tur: 'izinYok', izin: 'arkaPlanYok' },
        { tur: 'izlemeHatasi' },
        { tur: 'dwell', yer: 'Square Mosque', dk: 3 },
        { tur: 'vakitDisi' },
        { tur: 'olcum', sonuc: 'camide', yer: 'Square Mosque', dogrulukM: 12 },
        { tur: 'olcum', sonuc: 'supheli', dogrulukM: 48 },
        { tur: 'olcum', sonuc: 'disarida', yer: 'Square Mosque', mesafeM: 30 },
        { tur: 'olcum', sonuc: 'konumYok' },
        { tur: 'guven', eylem: 'sor', yer: 'Square Mosque', zaman: 'ezanYakin', yerSinifi: 'tampon', hareket: 'durgun', tavan: 'kenar' },
        { tur: 'guven', eylem: 'otomatik', bicim: 'otomatik', guvenKarari: 'sor', yer: 'Square Mosque', zaman: 'cuma', yerSinifi: 'poligonIci' },
        { tur: 'soruldu' },
        { tur: 'soruRet', yer: 'Square Mosque' },
        { tur: 'camide', mod: 'erisimYok', yer: 'Square Mosque' },
        { tur: 'cikis', yer: 'Square Mosque', dk: 25 },
        { tur: 'haricTutuldu', yer: 'Square Mosque' },
        { tur: 'kildim', vakit: 'ogle' },
        { tur: 'yenileme', sonuc: 'kabaKonum' },
    ].map((o, i) => ({ zamanMs: Date.now() - i * 60000, ...o }));

    let geriAl: () => void;
    beforeEach(() => {
        geriAl = ingilizceyeGec();
    });
    afterEach(() => act(() => geriAl()));

    it('iki tetik, durum satırları, soru ve ayrıntılar (zaman çizelgesi dahil) İngilizce', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true, namazModu: true, yerler: { 'osm:w2': { durum: 'favori', ad: 'Old Mosque' } } });
        k.durumAl.mockResolvedValue({
            ...NATIVE_DURUM,
            izin: 'arkaPlanYok',
            soru: { yer: { id: 'osm:w1', ad: 'Square Mosque', lat: 41, lng: 29 }, vakit: 'ogle', tarih: '2026-10-13', cuma: false, tur: 't', zamanMs: 0, bitisMs: 1 },
        });
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, erisim: false, ayarlar: { ...MOD_DURUMU.ayarlar, vakit: true } });
        k.gunlukAl.mockResolvedValue(OLAYLAR as never);
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Square Mosque', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 1370 },
        ]);
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByText('Are you at the mosque? · Square Mosque')).toBeTruthy());
        await ayrintilariAc(e);
        await waitFor(() => expect(e.getByText('RECENT DETECTIONS')).toBeTruthy());
        fireEvent.press(await e.findByTestId('cami-osm:w1'));
        expect(e.getByText('1.4 km')).toBeTruthy();
        expect(kalan(e.toJSON())).toEqual([]);
        expect(e.getByText('Watching 4 places near you')).toBeTruthy();
    });

    it('köprü yoksa boş durum İngilizce', async () => {
        k.camiModuluVarMi.mockReturnValue(false);
        const e = render(<NamazdaSessizSayfasi />);
        await bosalt();
        expect(kalan(e.toJSON())).toEqual([]);
        const c = render(<CamilerimSayfasi />);
        await bosalt();
        expect(kalan(c.toJSON())).toEqual([]);
    });

    it('Namaz modu erişim rehberi İngilizce', async () => {
        k.namazModuDurumu.mockResolvedValue({ ...MOD_DURUMU, erisim: false });
        const e = render(<NamazdaSessizSayfasi />);
        await waitFor(() => expect(e.getByTestId('namaz-modu-erisim-uyarisi')).toBeTruthy());
        fireEvent.press(e.getByLabelText('Grant access'));
        await waitFor(() => expect(e.getByTestId('namaz-modu-rehberi')).toBeTruthy());
        expect(kalan(e.toJSON())).toEqual([]);
    });

    it('Camilerim haritası: ipucu, lejant, yer paneli ve ekleme paneli İngilizce', async () => {
        k.ayarlariAl.mockResolvedValue({ aktif: true });
        k.yakinCamiler.mockResolvedValue([
            { id: 'osm:w1', ad: 'Square Mosque', lat: 41.011, lng: 28.972, yaricapM: 29, poligonVar: true, mesafeM: 137, poligon: null },
        ]);
        L.getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' } as never);
        const e = render(<CamilerimSayfasi />);
        await waitFor(() => expect(e.getByTestId('cami-haritasi')).toBeTruthy());
        fireEvent.press(e.getByTestId('harita-lejant-dugmesi'));
        expect(kalan(e.toJSON())).toEqual([]);
        const kaynak = e.UNSAFE_root.findAll((n) => (n.type as unknown) === 'GeoJSONSource' && n.props.id === 'cami-kumeleri')[0];
        await waitFor(() => expect(kaynak.props.data.features).toHaveLength(1));
        await act(async () => {
            await kaynak.props.onPress({ nativeEvent: { features: [{ properties: { id: 'osm:w1' } }] } });
        });
        await waitFor(() => expect(e.getByTestId('harita-yer-paneli')).toBeTruthy());
        expect(kalan(e.toJSON())).toEqual([]);
        fireEvent.press(e.getByLabelText('Close the panel'));
        fireEvent.press(e.getByTestId('harita-yer-ekle'));
        expect(e.getByTestId('harita-ekleme-paneli')).toBeTruthy();
        expect(kalan(e.toJSON())).toEqual([]);
    });
});
