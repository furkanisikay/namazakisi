/**
 * NafileAyarlariSayfasi (issue #77) — anahtarlar doğru kısmi güncellemeyi
 * gönderir; kapalı kartın ayrıntısı gizlidir; teheccüd seçicileri benzersiz etiketlidir.
 */
import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useRenkler } from '../../../core/theme';
import { VARSAYILAN_NAFILE_AYARLARI, type NafileAyarlari } from '../../../core/nafile/nafileTipleri';
import { nafileAyariniGuncelle } from '../../store/nafileSlice';
import { nafileAyarlariniNormalize } from '../../../data/local/LocalNafileServisi';
import { nafileAdimi } from '../../../core/nafile/nafileAdimlari';

/** Eski (#273 öncesi) biçimde kayıt → göçmüş ayar. */
const eski = (k: Record<string, unknown>): NafileAyarlari =>
    nafileAyarlariniNormalize({ ...VARSAYILAN_NAFILE_AYARLARI, ...k });

jest.mock('../../store/hooks');
jest.mock('../../../core/theme', () => ({ useRenkler: jest.fn() }));
jest.mock('../../store/nafileSlice', () => ({
    nafileAyariniGuncelle: jest.fn((d: unknown) => ({ type: 'nafile/guncelle', payload: d })),
    nafileAyarlariniBirlestir: jest.requireActual('../../store/nafileSlice').nafileAyarlariniBirlestir,
}));
// TEK RIZA (Dalga 3): onay ORTAK kayda yazılır.
jest.mock('../../store/hatirlatmaRizaSlice', () => ({
    hatirlatmaRizalariniYukle: jest.fn(() => ({ type: 'riza/yukle' })),
    hatirlatmaRizasiVer: jest.fn((d: unknown) => ({ type: 'riza/ver', payload: d })),
}));
const { hatirlatmaRizasiVer: rizaVerMock } = jest.requireMock('../../store/hatirlatmaRizaSlice');
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
// Bildirim sınırı rehberi (issue #298) ayrı testlerde; burada defter "hazır değil"
// → kart çizilmez, simülasyon hiçbir değişikliği engellemez.
const mockButceKutusu: { deger: unknown } = { deger: null };
jest.mock('../../hooks/useBildirimButcesi', () => {
    const gercek = jest.requireActual('../../hooks/useBildirimButcesi');
    return {
        ...gercek,
        useBildirimButcesi: () => mockButceKutusu.deger ?? gercek.butceNesnesiOlustur('ios', null, null),
    };
});
jest.mock('../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{props.name}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{props.name}</Text> };
});
jest.mock('../../../../modules/expo-countdown-notification/src', () => ({
    planlaAnons: jest.fn(),
    sesSec: jest.fn(),
    sesiOnizle: jest.fn(),
    onizlemeyiDurdur: jest.fn(),
    trDestekleniyorMu: () => Promise.resolve(true),
}));
jest.mock('../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { bildirimSesiniCal: jest.fn(), bitisiniBekle: jest.fn(), temizle: jest.fn() },
}));

import { NafileAyarlariSayfasi } from '../NafileAyarlariSayfasi';

const RENKLER = {
    birincil: '#4CAF50',
    arkaplan: '#FAFAFA',
    kartArkaplan: '#FFFFFF',
    metin: '#15161A',
    metinIkincil: '#757575',
    sinir: '#E0E0E0',
    birincilMetin: '#FFFFFF',
    durum: { hata: '#F44336', uyari: '#FFC107', basarili: '#4CAF50', bilgi: '#2196F3', dikkat: '#E65100' },
};

const dispatch = jest.fn();
const kur = (ayarlar: NafileAyarlari) => {
    (useAppDispatch as jest.Mock).mockReturnValue(dispatch);
    (useAppSelector as jest.Mock).mockImplementation((sec: (s: unknown) => unknown) =>
        sec({ nafile: { ayarlar }, konum: { koordinatlar: { lat: 41.0082, lng: 28.9784 } } })
    );
    (useRenkler as jest.Mock).mockReturnValue(RENKLER);
    return render(<NafileAyarlariSayfasi />);
};

describe('NafileAyarlariSayfasi', () => {
    beforeEach(() => jest.clearAllMocks());

    it('başlık gövdede tekrarlanmaz; hepsi kapalıyken ayrıntılar gizli', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        expect(ekran.queryByText('Nafile Namazlar')).toBeNull();
        expect(ekran.queryByText('NE ZAMAN HATIRLATILSIN')).toBeNull();
        expect(ekran.queryByText('PENCERE')).toBeNull();
    });

    it('kuşluk anahtarı yalnız kendi alanını günceller', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        fireEvent(ekran.getByLabelText('Kuşluk hatırlatması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ hatirlatmalar: { kusluk: { aktif: true } } });
        expect(dispatch).toHaveBeenCalled();
    });

    it('gösterge nafile BAŞINA: her anahtar yalnız kendi nafilesini yazar', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        fireEvent(ekran.getByLabelText('Evvâbîn ana ekranda gösterilsin'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ gosterge: { evvabin: true } });
        fireEvent(ekran.getByLabelText('Teheccüd ana ekranda gösterilsin'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ gosterge: { teheccud: true } });
    });

    it('gösterge anahtarı her nafilenin KENDİ kartında; hatırlatma kapalıyken de görünür', () => {
        const ekran = kur(VARSAYILAN_NAFILE_AYARLARI);
        // Ayrı "Ana ekranda göster" kartı kalktı: başlık metni yalnız kart içlerinde (3 kez).
        expect(ekran.getAllByText('Ana ekranda göster')).toHaveLength(3);
        for (const tur of ['kusluk', 'evvabin', 'teheccud'] as const) {
            const kart = within(ekran.getByTestId(`nafile-kart-${tur}`));
            const anahtar = kart.getByTestId(`nafile-gosterge-${tur}`);
            expect(anahtar).toBeTruthy();
            // Hatırlatma kapalı → ayrıntılar gizli ama gösterge satırı duruyor.
            expect(kart.queryByText('NE ZAMAN HATIRLATILSIN')).toBeNull();
        }
        const kusluk = within(ekran.getByTestId('nafile-kart-kusluk'));
        expect(kusluk.getByLabelText('Kuşluk ana ekranda gösterilsin')).toBeTruthy();
        // Başka nafilenin anahtarı bu kartta yok (yanlış karta düşmedi).
        expect(kusluk.queryByTestId('nafile-gosterge-evvabin')).toBeNull();
    });

    it('hatırlatma açıkken de gösterge satırı kartta kalır ve kendi alanını yazar', () => {
        const ekran = kur(eski({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: false, ofsetDk: 15 } } }));
        const kart = within(ekran.getByTestId('nafile-kart-kusluk'));
        fireEvent(kart.getByTestId('nafile-gosterge-kusluk'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ gosterge: { kusluk: true } });
    });

    it('teheccüd açıkken pencere seçimi (saatleriyle) ve uyandırma görünür', () => {
        const ekran = kur(eski({ teheccud: { aktif: true, hedef: 'imsaktanOnce', imsaktanOnceDk: 60, uyandirma: false } }));
        expect(ekran.getByText('PENCERE')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText(/^Teheccüd penceresi: Son üçte bir · \d\d:\d\d$/));
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ teheccud: { pencere: 'sonUcteBir' } });
        fireEvent(ekran.getByLabelText('Teheccüd uyandırması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ teheccud: { uyandirma: true } });
    });

    it('kuşluk açıkken ortak pencere kartı: yön seçici, adım ve "Hatırlatma ekleyin"', () => {
        const ekran = kur(eski({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: false, ofsetDk: 15 } } }));
        expect(ekran.getAllByText(/girişten 5 dk sonra/).length).toBeGreaterThan(0);
        expect(ekran.getByText('NE ZAMAN HATIRLATILSIN')).toBeTruthy();
        expect(ekran.getByLabelText('Kuşluk vaktine hatırlatma ekleyin')).toBeTruthy();
    });

    it('"Akışı önizle" nafilenin GERÇEK metnini gösterir (muhafız vakit dili DEĞİL)', () => {
        const ekran = kur(eski({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: false, ofsetDk: 15 } } }));
        fireEvent.press(ekran.getByLabelText('Kuşluk akışını önizleyin'));
        expect(ekran.getByText('Kuşluk akışı')).toBeTruthy();
        expect(ekran.getByText(/kuşluk için \d+ hatırlatma alırsınız/)).toBeTruthy();
        // Muhafız başlığı ("Öğle · 25 dk kaldı") nafile önizlemesine sızmaz.
        expect(ekran.queryByText(/^Öğle ·/)).toBeNull();
    });

    it('adım ekleme yeni adımı yazar ve en fazla 3 adıma izin verir', () => {
        const kusluk = { aktif: true, yon: 'girisindenItibaren' as const, adimlar: [nafileAdimi(20), nafileAdimi(40), nafileAdimi(60)] };
        const ekran = kur({ ...VARSAYILAN_NAFILE_AYARLARI, hatirlatmalar: { ...VARSAYILAN_NAFILE_AYARLARI.hatirlatmalar, kusluk } });
        expect(ekran.queryByLabelText('Kuşluk vaktine hatırlatma ekleyin')).toBeNull();
        expect(ekran.getByText('Bir vakit için en fazla 3 hatırlatma kurabilirsiniz.')).toBeTruthy();
        expect(ekran.getAllByText('2. hatırlatma').length).toBeGreaterThan(0);
    });

    describe('adım detayı + sesli anons rızası', () => {
        const KUSLUK = eski({ hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: false, ofsetDk: 15 } } });
        const ac = (ayarlar: NafileAyarlari) => {
            const ekran = kur(ayarlar);
            fireEvent.press(ekran.getByLabelText(/^Hatırlatma — düzenleyin/));
            return ekran;
        };

        it('BİRLEŞİK MODÜL: birden çok adımda her adımın aç/kapa anahtarı var (kanal hafızasıyla kapatır)', () => {
            const ikiAdim: NafileAyarlari = {
                ...KUSLUK,
                hatirlatmalar: {
                    ...KUSLUK.hatirlatmalar,
                    kusluk: {
                        ...KUSLUK.hatirlatmalar.kusluk,
                        adimlar: [
                            { ...KUSLUK.hatirlatmalar.kusluk.adimlar[0], esikDk: 5 },
                            { ...KUSLUK.hatirlatmalar.kusluk.adimlar[0], esikDk: 30 },
                        ],
                    },
                },
            };
            const ekran = kur(ikiAdim);
            fireEvent(ekran.getByLabelText('1. hatırlatma — açın veya kapatın'), 'valueChange', false);
            const d = (nafileAyariniGuncelle as unknown as jest.Mock).mock.calls[0][0];
            expect(d.hatirlatmalar.kusluk.adimlar[0].kanallar).toEqual({});
            expect(d.hatirlatmalar.kusluk.adimlar[0].oncekiKanallar).toEqual({ bildirim: true });
        });

        it('STANDART yetenekler: Bildirim + Sesli okuma anahtarları; Gelişmiş bölümünde tekrar ve GERÇEK ALARM', () => {
            const ekran = ac(KUSLUK);
            expect(ekran.getByTestId('adim-bildirim-anahtari')).toBeTruthy();
            expect(ekran.getByTestId('adim-sesli-anahtari')).toBeTruthy();
            fireEvent.press(ekran.getByTestId('adim-gelismis'));
            expect(ekran.getByTestId('adim-tekrar-anahtari')).toBeTruthy();
            expect(ekran.getByTestId('adim-alarm-anahtari')).toBeTruthy();
        });

        it('gerçek alarm ilk kez açılırken rıza sorulur; onay ORTAK kayda, anahtar nafileye yazılır', async () => {
            const ekran = ac(KUSLUK);
            fireEvent.press(ekran.getByTestId('adim-gelismis'));
            fireEvent(ekran.getByTestId('adim-alarm-anahtari'), 'valueChange', true);
            // Rıza yokken anahtar doğrudan yazılmaz.
            expect(nafileAyariniGuncelle).not.toHaveBeenCalled();
            fireEvent.press(ekran.getByLabelText('Alarmı açın'));
            await waitFor(() => expect(nafileAyariniGuncelle).toHaveBeenCalledTimes(1));
            // TEK yazım: iki eşzamanlı thunk aynı eski durumu birleştirip birbirini ezerdi.
            const d = (nafileAyariniGuncelle as unknown as jest.Mock).mock.calls[0][0];
            expect(d.alarmOnayi).toBeUndefined();
            expect(rizaVerMock).toHaveBeenCalledWith({ alarmOnayi: true });
            expect(d.hatirlatmalar.kusluk.adimlar[0].kanallar).toEqual({ bildirim: true, alarm: true });
        });

        it('sesli İLK kez seçilince onay sorulur, ayar YAZILMAZ; "Sesli olmadan" HİÇBİR ŞEY yazmaz', () => {
            const ekran = ac(KUSLUK);
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            expect(nafileAyariniGuncelle).not.toHaveBeenCalled();
            expect(ekran.getByText('Sesli anons açılsın mı?')).toBeTruthy();
            fireEvent.press(ekran.getByLabelText('Sesli olmadan uygula'));
            // Adım kurulu kanallarıyla kalır (yalnız bildirim) — yazılacak bir değişiklik yok.
            expect(nafileAyariniGuncelle).not.toHaveBeenCalled();
            expect(ekran.getByTestId('adim-sesli-anahtari').props.value).toBe(false);
        });

        it('onaylanınca adım sesli olur ve rıza ORTAK kayda (tek rıza) yazılır', () => {
            const ekran = ac(KUSLUK);
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            fireEvent.press(ekran.getByLabelText('Sesli anonsu açın'));
            const d = (nafileAyariniGuncelle as unknown as jest.Mock).mock.calls[0][0];
            expect(d.sesliOnayi).toBeUndefined();
            expect(rizaVerMock).toHaveBeenCalledWith({ sesliOnayi: true });
            expect(d.hatirlatmalar.kusluk.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true });
        });

        it('rıza zaten varsa doğrudan yazılır', () => {
            const ekran = ac({ ...KUSLUK, sesliOnayi: true });
            fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
            expect(ekran.queryByText('Sesli anons açılsın mı?')).toBeNull();
            const d = (nafileAyariniGuncelle as unknown as jest.Mock).mock.calls[0][0];
            expect(d.hatirlatmalar.kusluk.adimlar[0].kanallar).toEqual({ bildirim: true, sesli: true });
        });
    });
});

describe('NafileAyarlariSayfasi — bildirim sınırı rehberi (issue #298)', () => {
    const { butceNesnesiOlustur } = jest.requireActual('../../hooks/useBildirimButcesi');
    const { matrisKur, ISTANBUL } = jest.requireActual('../../../core/bildirim/__tests__/defterFikstur');
    const SABAH = new Date(2026, 9, 13, 9, 0, 0);
    const GUNDUZ: NafileAyarlari = eski({
        hatirlatmalar: { kusluk: { aktif: true, ofsetDk: 5 }, evvabin: { aktif: true, ofsetDk: 15 } },
    });

    const butceKur = (nafile: NafileAyarlari) => {
        mockButceKutusu.deger = butceNesnesiOlustur('ios', {
            platform: 'ios',
            simdi: SABAH,
            koordinat: ISTANBUL,
            muhafiz: { aktif: true, matris: matrisKur() },
            nafile,
        });
    };

    beforeEach(() => jest.clearAllMocks());
    afterEach(() => {
        mockButceKutusu.deger = null;
    });

    it('iPhone sınırı aşıldığında kart görünür; sayfada YALNIZ nafile önerisi + muhafız yönlendirmesi', () => {
        butceKur(GUNDUZ);
        const ekran = kur(GUNDUZ);
        expect(ekran.getByText('Bazı hatırlatmalar gelmeyecek')).toBeTruthy();
        fireEvent.press(ekran.getByTestId('bildirim-butce-karti'));
        expect(ekran.getByTestId('oneri-nafileGunuGunune')).toBeTruthy();
        expect(ekran.queryByTestId('oneri-seyreklestir')).toBeNull();
        fireEvent.press(ekran.getByLabelText('Namaz Muhafızı ayarlarında yer açın'));
        expect(mockNavigate).toHaveBeenCalledWith('MuhafizAyarlari');
    });

    it('sığmayan hatırlatma AÇILMAZ (teheccüd) — rehber açılır, ayar yazılmaz', () => {
        butceKur(GUNDUZ);
        const ekran = kur(GUNDUZ);
        fireEvent(ekran.getByLabelText('Teheccüd hatırlatması'), 'valueChange', true);
        expect(nafileAyariniGuncelle).not.toHaveBeenCalled();
        expect(ekran.getByText('Bu hatırlatma sığmıyor')).toBeTruthy();
    });

    it('"günü gününe" tek dokunuşla uygulanır ve GERİ AL ile geri gelir', () => {
        butceKur(GUNDUZ);
        const ekran = kur(GUNDUZ);
        fireEvent.press(ekran.getByTestId('bildirim-butce-karti'));
        fireEvent.press(ekran.getByLabelText('Nafile hatırlatmalarını günü gününe kurun: uygulayın'));
        expect(nafileAyariniGuncelle).toHaveBeenLastCalledWith(expect.objectContaining({ gunuGununeKur: true }));
        fireEvent.press(ekran.getByText('GERİ AL'));
        expect(nafileAyariniGuncelle).toHaveBeenLastCalledWith(expect.objectContaining({ gunuGununeKur: false }));
    });

    // Fable incelemesi M4: aşımdaki kullanıcı VAR OLAN hatırlatmasının zamanını
    // değiştirebilmeli — salt zaman değişimi simülasyon kapısından GEÇMEZ.
    it('aşımdayken yön (zaman) değişikliği ENGELLENMEZ', () => {
        butceKur(GUNDUZ);
        const ekran = kur(GUNDUZ);
        fireEvent.press(ekran.getAllByLabelText(/^Vakit çıkarken — /)[0]);
        expect(nafileAyariniGuncelle).toHaveBeenCalledTimes(1);
        expect(ekran.queryByText('Bu hatırlatma sığmıyor')).toBeNull();
    });

    it('aşımdayken teheccüd penceresi (tekrarsız) değişikliği ENGELLENMEZ', () => {
        const ayar = { ...GUNDUZ, teheccud: { ...GUNDUZ.teheccud, aktif: true } };
        butceKur(ayar);
        const ekran = kur(ayar);
        fireEvent.press(ekran.getByLabelText(/^Teheccüd penceresi: Yatsıdan/));
        expect(nafileAyariniGuncelle).toHaveBeenCalledWith({ teheccud: { pencere: 'yatsi' } });
    });

    it('aşımdayken adım EKLEME sığmıyorsa yazılmaz, rehber açılır', () => {
        butceKur(GUNDUZ);
        const ekran = kur(GUNDUZ);
        fireEvent.press(ekran.getByLabelText('Kuşluk vaktine hatırlatma ekleyin'));
        expect(nafileAyariniGuncelle).not.toHaveBeenCalled();
        expect(ekran.getByText('Bu hatırlatma sığmıyor')).toBeTruthy();
    });
});
