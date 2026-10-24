/**
 * Hatırlatmalar ayrıntı bölümleri (vakit girince, vakit sayacı, günü tamamlamadıysam,
 * özel gün) ve özel gün takvimi İngilizce çizildiğinde Türkçe metin kalmaz.
 * Kimlik değerleri (`NamazAdi.Sabah`) Türkçedir; ekranda görünen ad sözlükten çözülmelidir.
 */
import React from 'react';
import { Platform } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
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
        vurgu: '#FF9800',
        durum: { bilgi: '#2196F3', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', hata: '#F44336' },
    }),
}));
jest.mock('../../../../core/feedback', () => ({ useFeedback: () => ({ butonTiklandiFeedback: jest.fn(() => Promise.resolve()) }) }));
jest.mock('../../common/KisaBildirim', () => ({ kisaBildirimGoster: jest.fn() }));
jest.mock('../../common/CanliGuncellemeBilgisi', () => ({ CanliGuncellemeBilgisi: () => null }));
jest.mock('@react-native-community/datetimepicker', () => () => null);
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../store/vakitBildirimSlice', () => ({
    vakitBildirimAyarlariniYukle: jest.fn(() => ({ type: 'vb/yukle' })),
    vakitBildirimAyariniGuncelle: jest.fn((a) => ({ type: 'vb/guncelle', payload: a })),
    vakitBildirimSesleriniYukle: jest.fn(() => ({ type: 'vb/sesleriYukle' })),
    vakitBildirimSesiniGuncelle: jest.fn((a) => ({ type: 'vb/sesGuncelle', payload: a })),
}));
jest.mock('../../../store/vakitSayacSlice', () => ({
    vakitSayacAyarlariniYukle: jest.fn(() => ({ type: 'vs/yukle' })),
    vakitSayacAyariniGuncelle: jest.fn((a) => ({ type: 'vs/guncelle', payload: a })),
}));
jest.mock('../../../store/store', () => ({ store: { getState: () => ({}) } }));
jest.mock('../../../../domain/services/VakitSayacBildirimServisi', () => ({
    VakitSayacBildirimServisi: { getInstance: () => ({ yapilandirVePlanla: jest.fn() }) },
}));
jest.mock('../../../../domain/services/NamazVaktiHesaplayiciServisi', () => ({
    NamazVaktiHesaplayiciServisi: {
        getInstance: () => ({
            getKonfig: () => ({ latitude: 41, longitude: 29 }),
            getGunlukVakitler: () => ({ yatsi: new Date(2026, 5, 15, 21, 30), imsak: new Date(2026, 5, 16, 3, 40) }),
        }),
    },
}));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({
    sesSec: jest.fn(),
    sesAdiAl: jest.fn(() => Promise.resolve('Melody')),
    sesDosyasiSec: jest.fn(),
    sesDosyasiDestekleniyor: () => true,
}));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { bildirimSesiniCal: jest.fn(), temizle: jest.fn() },
}));
jest.mock('../../../hooks/usePlatformYetenekleri', () => ({ usePlatformYetenekleri: () => ({ sesSecici: true }) }));
jest.mock('../../../store/seriSlice', () => ({
    ozelGunBaslat: Object.assign(jest.fn(), { fulfilled: { match: () => true } }),
    ozelGunModuDurumunuGuncelle: jest.fn(),
    seriAyarlariniGuncelle: jest.fn(),
}));
let mockState: Record<string, unknown>;
jest.mock('../../../store/hooks', () => ({
    useAppDispatch: () => jest.fn(),
    useAppSelector: (sec: (s: unknown) => unknown) => sec(mockState),
}));

import { VakitGirinceBolumu } from '../VakitGirinceBolumu';
import { VakitSayaciBolumu } from '../VakitSayaciBolumu';
import { GunSonuBolumu } from '../GunSonuBolumu';
import { OzelGunBolumu } from '../OzelGunBolumu';
import { OzelGunTakvimi } from '../../OzelGunTakvimi';
import { presetMatrisiOlustur } from '../../../../core/muhafiz/matrisIslemleri';
import { HATIRLATMA_PRESETLERI } from '../../../store/muhafizSlice';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

/** Türkçe harfsiz ama Türkçe sözcükler (bu bölümlerde geçebilecek). */
const YASAKLI = ['Sabah', 'Vakit', 'vakit', 'dk\\b', 'Saat\\b', 'Dakika', 'Kapat', 'Tamam', 'Sabit', 'Ne zaman', 'Seri\\b', 'Telefonun', 'Modu', 'Ana ekran'];

const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);

let geriAl: () => void;
beforeEach(() => {
    geriAl = ingilizceyeGec();
    mockState = {
        vakitBildirim: {
            ayarlar: { imsak: true, ogle: true, ikindi: false, aksam: false, yatsi: true },
            sesler: { ogle: { bildirimSesi: 'content://ses/1', sesAdi: 'Melody' } },
        },
        vakitSayac: { ayarlar: { aktif: true, sayacBaslangicSeviyesi: 1 } },
        muhafiz: { aktif: true, matris: presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, false) },
        seri: {
            ayarlar: {
                gunSonuBildirimAktif: true,
                gunSonuBildirimModu: 'otomatik',
                bildirimImsakOncesiDk: 30,
                bildirimGunSecimi: 'ayniGun',
                bildirimSaati: 22,
                bildirimDakikasi: 0,
            },
            ozelGunAyarlari: { ozelGunModuAktif: true, aktifOzelGun: null },
        },
    };
});
afterEach(() => act(() => geriAl()));

describe('Hatırlatmalar ayrıntı bölümleri — İngilizce', () => {
    it('vakit girince: vakit adları, sesler ve notlar', async () => {
        const e = render(<VakitGirinceBolumu />);
        await waitFor(() => expect(e.getByLabelText('Fajr')).toBeTruthy());
        expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
    });

    it('vakit sayacı: Android (seçenekler) ve iPhone (yok satırı)', () => {
        jest.replaceProperty(Platform, 'OS', 'android');
        const e = render(<VakitSayaciBolumu />);
        expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
        expect(e.getByText('Prayer countdown')).toBeTruthy();
        jest.replaceProperty(Platform, 'OS', 'ios');
        expect(kalan(<VakitSayaciBolumu />)).toEqual([]);
    });

    it('günü tamamlamadıysam: otomatik ve sabit saat', () => {
        expect(kalan(<GunSonuBolumu />)).toEqual([]);
        (mockState.seri as { ayarlar: Record<string, unknown> }).ayarlar.gunSonuBildirimModu = 'sabit';
        expect(kalan(<GunSonuBolumu />)).toEqual([]);
        (mockState.seri as { ayarlar: Record<string, unknown> }).ayarlar.bildirimGunSecimi = 'ertesiGun';
        expect(kalan(<GunSonuBolumu />)).toEqual([]);
    });

    it('özel gün: başlatma düğmesi, sürerken tarih aralığı ve takvim', () => {
        expect(kalan(<OzelGunBolumu />)).toEqual([]);
        (mockState.seri as { ozelGunAyarlari: unknown }).ozelGunAyarlari = {
            ozelGunModuAktif: true,
            aktifOzelGun: { baslangicTarihi: '2026-10-20', bitisTarihi: '2026-10-27' },
        };
        const e = render(<OzelGunBolumu />);
        expect(turkceKalanlar(e.toJSON() as never, YASAKLI)).toEqual([]);
        expect(e.getByText('20/10/2026 – 27/10/2026')).toBeTruthy();
        expect(kalan(<OzelGunTakvimi gorunur onKapat={() => undefined} onBaslat={() => undefined} />)).toEqual([]);
    });
});
