/**
 * NÖBETÇİ — birleşik hatırlatma modülü, adım detayı (plan §3.3, §5).
 *
 * - İki ana anahtar (Bildirim / Sesli okuma) her kombinasyonda ESKİ dört çipin ürettiği
 *   kümeyi üretir; üretilen her küme `kanallarNormalize` çıktısıyla aynıdır (tablo testi).
 * - Son açık kanal kapatılamaz (anahtar devre dışı + nedeni yazılı).
 * - Titreşim satırı yalnız bildirim açıkken.
 * - "Gelişmiş" kapalı başlar; değiştirilmiş adımda açık başlar, başlık özetler.
 * - Sesli okuma editörü HER yüzey tanımında çizilir; metin düzenlenip kaydedilir.
 * - Sesli rıza modal ağacının içinde; red / geri tuşu hiçbir şey yazmaz.
 *
 * Jest `Platform.OS` varsayılanı 'ios' — tanımlar yetenekleri AÇIKÇA alır (Android).
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

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
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        metin: '#212121',
        metinIkincil: '#757575',
        uyari: '#FFC107',
        durum: { bilgi: '#2196F3', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', hata: '#F44336' },
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({ sesSec: jest.fn() }));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { temizle: jest.fn(), bildirimSesiniCal: jest.fn() },
}));
jest.mock('../../../../domain/services/AnonsOnizlemeServisi', () => ({ adimiOnizle: jest.fn() }));

import { AdimDetayModal } from '../AdimDetayModal';
import { imlecteEkle } from '../AnonsMetniEditoru';
import { SayisalSecici } from '../../common/SayisalSecici';
import { ANONS_METIN_UST_SINIRI } from '../../../../core/muhafiz/ios/anonsKlibi';
import {
    kanalAnahtariniUygula,
    vakitPencereTanimi,
    ekHatirlatmaPencereTanimi,
    nafilePencereTanimi,
    type AnaKanal,
    type PencereTanimi,
} from '../pencereTanimi';
import type { SeviyeAyari, UyariKanallari } from '../../../../core/muhafiz/matrisTipleri';
import { VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';
import { kanallarNormalize } from '../../../../core/hatirlatma/adimDizisi';
import { ANDROID_YETENEKLERI } from '../../../../core/muhafiz/ios/platformYetenekleri';
import { varsayilanAnonsMetni } from '../../../../core/muhafiz/anonsMetni';

const adim = (kanallar: UyariKanallari, ek: Partial<SeviyeAyari> = {}): SeviyeAyari => ({
    kademe: 'nazik',
    kanallar,
    esikDk: 30,
    siklik: 'birkez',
    bildirimSesi: VARSAYILAN_SES,
    anonsMetni: '',
    ...ek,
});

const MUHAFIZ = vakitPencereTanimi('ikindi', 'cikisaDogru', 180, ANDROID_YETENEKLERI);
const CUMA = ekHatirlatmaPencereTanimi({
    kaynak: 'cuma',
    yuzey: 'cuma',
    anonsVakitAdi: 'Cuma',
    baslik: 'Cuma namazı',
    baslikKucuk: 'cuma namazı',
    ikon: 'mosque',
    vakit: 'ogle',
    yonSabitGerekcesi: 'Öğleden önce.',
    adimSayisi: 1,
    maksAdim: 3,
    esikSinirlari: { min: 15, max: 180 },
    esikAdimDk: 15,
    tekrarMinDk: 5,
    tekrarMaxDk: 60,
    varsayilanTekrarDk: 15,
    yetenekler: ANDROID_YETENEKLERI,
    otomatikAnons: (s) => `Cuma için öğle vaktine ${s.esikDk} dakika kaldı.`,
});
const NAFILE = nafilePencereTanimi({
    kaynak: 'nafile:kusluk',
    baslik: 'Kuşluk',
    baslikKucuk: 'kuşluk',
    ikon: 'sun',
    yon: 'girisindenItibaren',
    adimSayisi: 1,
    yetenekler: ANDROID_YETENEKLERI,
    otomatikAnons: () => 'Kuşluk vakti girdi.',
});

function kur(tanim: PencereTanimi, seviye: SeviyeAyari, ek: Partial<React.ComponentProps<typeof AdimDetayModal>> = {}) {
    const onDegistir = jest.fn();
    const ekran = render(
        <AdimDetayModal
            gorunur
            tanim={tanim}
            seviyeler={[seviye]}
            indeks={0}
            ttsDestekli={null}
            sesliOnayiVar
            onDegistir={onDegistir}
            onKapat={jest.fn()}
            {...ek}
        />
    );
    return { ekran, onDegistir };
}

describe('kanalAnahtariniUygula — TABLO: anahtarlar eski çip kümelerini üretir', () => {
    const DURUMLAR: UyariKanallari[] = [
        { bildirim: true },
        { sesli: true },
        { bildirim: true, sesli: true },
        { bildirim: true, titresim: true },
        { bildirim: true, sesli: true, titresim: true, alarm: true },
        { sesli: true, alarm: true },
    ];
    const KANALLAR: AnaKanal[] = ['bildirim', 'sesli'];

    test.each(DURUMLAR)('%j: her geçiş geçerli küme üretir (kanallarNormalize ile aynı)', (durum) => {
        for (const kanal of KANALLAR) {
            for (const acik of [true, false]) {
                const sonuc = kanalAnahtariniUygula(durum, kanal, acik);
                expect(kanallarNormalize(sonuc)).toEqual(sonuc);
                // Hiçbir geçiş adımı KAPATMAZ (kapatmanın yeri liste anahtarı).
                expect(sonuc.bildirim === true || sonuc.sesli === true).toBe(true);
            }
        }
    });

    test('eski dört çipin kümeleri birebir', () => {
        // Bildirim → İkisi de
        expect(kanalAnahtariniUygula({ bildirim: true }, 'sesli', true)).toEqual({ bildirim: true, sesli: true });
        // İkisi de → Sesli anons
        expect(kanalAnahtariniUygula({ bildirim: true, sesli: true }, 'bildirim', false)).toEqual({ sesli: true });
        // İkisi de → Bildirim
        expect(kanalAnahtariniUygula({ bildirim: true, sesli: true }, 'sesli', false)).toEqual({ bildirim: true });
    });

    test('son açık kanal kapatılamaz → AYNI referans; bildirim kapanınca titreşim de düşer', () => {
        const k = { bildirim: true, titresim: true };
        expect(kanalAnahtariniUygula(k, 'bildirim', false)).toBe(k);
        expect(kanalAnahtariniUygula({ bildirim: true, sesli: true, titresim: true }, 'bildirim', false)).toEqual({
            sesli: true,
        });
    });
});

describe('AdimDetayModal — NASIL (iki anahtar)', () => {
    test('Bildirim açıkken Sesli okumayı açmak {bildirim, sesli} yazar', () => {
        const { ekran, onDegistir } = kur(CUMA, adim({ bildirim: true }));
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(onDegistir).toHaveBeenCalledWith(
            expect.objectContaining({ kanallar: { bildirim: true, sesli: true }, anonsMetni: '' })
        );
    });

    test('son açık kanal da kapatılabilir: onay sonrası adım kapanır (hafıza korunur); "Vazgeç" bir şey yazmaz', () => {
        const { ekran, onDegistir } = kur(CUMA, adim({ bildirim: true, titresim: true }));
        expect(ekran.getByTestId('adim-bildirim-anahtari').props.disabled).toBeFalsy();
        expect(ekran.queryByText(/listedeki anahtarı/)).toBeNull();

        fireEvent(ekran.getByTestId('adim-bildirim-anahtari'), 'valueChange', false);
        expect(ekran.getByText('Bu hatırlatma kapansın mı?')).toBeTruthy();
        fireEvent.press(ekran.getByLabelText('Vazgeç'));
        expect(onDegistir).not.toHaveBeenCalled();

        fireEvent(ekran.getByTestId('adim-bildirim-anahtari'), 'valueChange', false);
        fireEvent.press(ekran.getByLabelText('Kapatın'));
        expect(onDegistir).toHaveBeenCalledWith(
            expect.objectContaining({ kanallar: {}, oncekiKanallar: { bildirim: true, titresim: true } })
        );
    });

    test('ızgara tutarlı: titreşim karosu her zaman görünür, bildirim kapalıyken seçilemez', () => {
        expect(kur(CUMA, adim({ bildirim: true })).ekran.getByTestId('adim-titresim-anahtari').props.disabled).toBeFalsy();
        expect(kur(CUMA, adim({ sesli: true })).ekran.getByTestId('adim-titresim-anahtari').props.disabled).toBe(true);
    });

    test('MUHAFIZ: sesli açılırken boş kutu yön-uygun şablonla dolar (boş = sessiz)', () => {
        const { ekran, onDegistir } = kur(MUHAFIZ, adim({ bildirim: true }));
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(onDegistir).toHaveBeenCalledWith(
            expect.objectContaining({ anonsMetni: varsayilanAnonsMetni('cikisaDogru') })
        );
    });

    test('kapalı adım: "Açın" düğmesi hafızadaki kanalları geri getirir; ek yüzeyde metin BOŞ kalır', () => {
        const { ekran, onDegistir } = kur(CUMA, adim({}, { oncekiKanallar: { sesli: true } }));
        fireEvent.press(ekran.getByTestId('adim-ac-dugmesi'));
        expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ kanallar: { sesli: true }, anonsMetni: '' }));
    });
});

describe('AdimDetayModal — sesli rıza (modal ağacının içinde)', () => {
    test('rıza yoksa önce onay; "Sesli olmadan" hiçbir şey yazmaz; onay rızayla BİRLİKTE yazar', () => {
        const { ekran, onDegistir } = kur(NAFILE, adim({ bildirim: true }), { sesliOnayiVar: false });
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(onDegistir).not.toHaveBeenCalled();
        fireEvent.press(ekran.getByLabelText(/sesli olmadan/i));
        expect(onDegistir).not.toHaveBeenCalled();

        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        fireEvent.press(ekran.getByLabelText(/^Sesli okumayı açın|^Sesli okumayı açın|Onayla/i));
        expect(onDegistir).toHaveBeenCalledWith(
            expect.objectContaining({ kanallar: { bildirim: true, sesli: true } }),
            { sesliOnayi: true }
        );
    });
});

describe('AdimDetayModal — GELİŞMİŞ', () => {
    test('varsayılan adımda KAPALI başlar', () => {
        const { ekran } = kur(CUMA, adim({ bildirim: true }));
        expect(ekran.queryByTestId('adim-gelismis-icerik')).toBeNull();
        fireEvent.press(ekran.getByTestId('adim-gelismis'));
        expect(ekran.getByTestId('adim-tekrar-anahtari')).toBeTruthy();
    });

    test('tekrarlı / alarmlı adımda AÇIK başlar ve başlık özetler', () => {
        const { ekran } = kur(CUMA, adim({ bildirim: true, alarm: true }, { siklik: { herDk: 15 } }), {
            alarmOnayiVar: true,
        });
        expect(ekran.getByTestId('adim-gelismis-icerik')).toBeTruthy();
        // Özet ikon çipidir (orta noktalı metin yok); tam cümle başlığın etiketinde.
        expect(ekran.getByLabelText('Gelişmiş ayarlar: her 15 dk tekrar')).toBeTruthy();
        // Çipler ekran okuyucudan gizlidir (etiket zaten tam cümle) → gizlileri de ara.
        const gizli = { includeHiddenElements: true };
        expect(ekran.getByTestId('adim-gelismis-ozet', gizli)).toBeTruthy();
        expect(ekran.getByText('15 dk', gizli)).toBeTruthy();
        // Gerçek alarm Gelişmiş'te değil, Nasıl ızgarasında; açıkken ayrıntısı görünür.
        expect(ekran.getByTestId('adim-alarm-anahtari').props.value).toBe(true);
        expect(ekran.getByTestId('adim-alarm-ayrinti')).toBeTruthy();
        // (Önizlemedeki bildirim BAŞLIĞI "Cuma · 30 dk kaldı …" gerçek bildirim metnidir, özet değil.)
        expect(ekran.queryByText(/her \d+ dk ·|· Gerçek alarm/)).toBeNull();
    });

    test('canlı önizleme gerçek bildirim başlığını gösterir ve dokununca adımı çalar', () => {
        const { adimiOnizle } = jest.requireMock('../../../../domain/services/AnonsOnizlemeServisi');
        const { ekran } = kur(MUHAFIZ, adim({ bildirim: true }, { esikDk: 45 }));
        expect(ekran.getByText('Telefonunuz böyle uyaracak')).toBeTruthy();
        expect(ekran.getByText('İkindi · 45 dk kaldı ⏰')).toBeTruthy();
        fireEvent.press(ekran.getByTestId('adim-onizleme-dinle'));
        expect(adimiOnizle).toHaveBeenCalledWith(expect.objectContaining({ kanallar: { bildirim: true } }));
    });

    test('başlık ZAMANDIR ve eşik değişince canlı güncellenir', () => {
        const { ekran } = kur(CUMA, adim({ bildirim: true }, { esikDk: 30 }));
        expect(ekran.getByText('30 dk kala')).toBeTruthy();
        ekran.rerender(
            <AdimDetayModal
                gorunur
                tanim={CUMA}
                seviyeler={[adim({ bildirim: true }, { esikDk: 45 })]}
                indeks={0}
                ttsDestekli={null}
                sesliOnayiVar
                onDegistir={jest.fn()}
                onKapat={jest.fn()}
            />
        );
        expect(ekran.getByText('45 dk kala')).toBeTruthy();
    });

    test('muhafızda nazik olmayan ton Gelişmiş\'i açar ve özetlenir; sertlik yalnız muhafızda', () => {
        const { ekran } = kur(MUHAFIZ, adim({ bildirim: true }, { kademe: 'uyari', esikDk: 25 }));
        expect(ekran.getByLabelText('Gelişmiş ayarlar: Uyarı sertliği')).toBeTruthy();
        expect(ekran.getByLabelText('Sertlik: Uyarı')).toBeTruthy();
        const cuma = kur(CUMA, adim({ bildirim: true }, { siklik: { herDk: 15 } }));
        expect(cuma.ekran.queryByLabelText('Sertlik: Uyarı')).toBeNull();
    });

    test('Tekrarla anahtarı tek atış ↔ tekrar yazar', () => {
        const { ekran, onDegistir } = kur(CUMA, adim({ bildirim: true }));
        fireEvent.press(ekran.getByTestId('adim-gelismis'));
        fireEvent(ekran.getByTestId('adim-tekrar-anahtari'), 'valueChange', true);
        expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ siklik: { herDk: 15 } }));
    });
});

describe('AdimDetayModal — SESLİ OKUMA METNİ her yüzeyde', () => {
    test.each([
        ['muhafız', MUHAFIZ],
        ['nafile', NAFILE],
        ['cuma', CUMA],
    ] as const)('%s: sesli adımda editör çizilir, yer tutucu çipi var', (_ad, tanim) => {
        const editorlu = { ...tanim, anonsMetniDuzenlenebilir: true };
        const { ekran } = kur(editorlu, adim({ bildirim: true, sesli: true }));
        expect(ekran.getByTestId('anons-metni-editoru')).toBeTruthy();
        // İlk görünüm: ham şablon kutusu ve çipler "Metni değiştir" arkasında.
        expect(ekran.queryByTestId('anons-metni-kutusu')).toBeNull();
        fireEvent.press(ekran.getByLabelText('Metni değiştirin'));
        expect(ekran.getByLabelText('Ekleyin: Dakika')).toBeTruthy();
    });

    test('İLK GÖRÜNÜM: ham {vakit}/{süre} şablonu ekranda görünmez, çözülmüş cümle görünür', () => {
        const { ekran } = kur(MUHAFIZ, adim({ bildirim: true, sesli: true }, { anonsMetni: varsayilanAnonsMetni('cikisaDogru') }));
        const okunus = String(ekran.getByTestId('anons-okunus').props.children);
        expect(okunus).not.toMatch(/[{}]/);
        expect(ekran.queryByTestId('anons-metni-kutusu')).toBeNull();
        const gorunenler = ekran.UNSAFE_root.findAll((n) => typeof n.props?.children === 'string')
            .map((n) => n.props.children as string);
        for (const metin of gorunenler) expect(metin).not.toMatch(/\{(vakit|süre|yön)\}/);
    });

    test('kullanıcının KENDİ metni varsa düzenleyici açık başlar', () => {
        const { ekran } = kur({ ...MUHAFIZ, anonsMetniDuzenlenebilir: true }, adim({ bildirim: true, sesli: true }, { anonsMetni: 'Kalk {vakit}' }));
        expect(ekran.getByTestId('anons-metni-kutusu')).toBeTruthy();
    });

    test('metin yazılıp düzenleme bitince kaydedilir; okunuş yüzeyin bağlamıyla çözülür', () => {
        const { ekran, onDegistir } = kur({ ...CUMA, anonsMetniDuzenlenebilir: true }, adim({ bildirim: true, sesli: true }));
        fireEvent.press(ekran.getByLabelText('Metni değiştirin'));
        const kutu = ekran.getByTestId('anons-metni-kutusu');
        fireEvent.changeText(kutu, '{vakit} için {süre} dakika.');
        expect(ekran.getByTestId('anons-okunus').props.children).toBe('Cuma için 30 dakika.');
        fireEvent(kutu, 'endEditing');
        expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ anonsMetni: '{vakit} için {süre} dakika.' }));
    });

    test('ek yüzeyde boş metin = otomatik cümle (okunuşta görünür), "Otomatik" kutuyu boşaltır', () => {
        const { ekran, onDegistir } = kur(
            { ...CUMA, anonsMetniDuzenlenebilir: true },
            adim({ bildirim: true, sesli: true }, { anonsMetni: 'Benim cümlem' })
        );
        fireEvent.press(ekran.getByLabelText(/^Otomatik cümle/));
        expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ anonsMetni: '' }));
        const bos = kur({ ...CUMA, anonsMetniDuzenlenebilir: true }, adim({ bildirim: true, sesli: true }));
        expect(bos.ekran.getByTestId('anons-okunus').props.children).toBe('Cuma için öğle vaktine 30 dakika kaldı.');
    });

    test('muhafızda boş metin = SESSİZ; "Otomatik" şablonu kutuya YAZAR', () => {
        const { ekran, onDegistir } = kur(MUHAFIZ, adim({ bildirim: true, sesli: true }));
        expect(ekran.getByTestId('anons-okunus').props.children).toMatch(/bu hatırlatma sesli okumaz/);
        fireEvent.press(ekran.getByLabelText('Metni değiştirin'));
        fireEvent.press(ekran.getByLabelText(/^Otomatik cümle/));
        expect(onDegistir).toHaveBeenCalledWith(expect.objectContaining({ anonsMetni: varsayilanAnonsMetni('cikisaDogru') }));
    });
});

describe('Opus incelemesi — ekran nöbetçileri', () => {
    test('#9 rıza bilgisi VERİLMEMİŞSE (undefined) sesli açmak önce onay ister', () => {
        const { ekran, onDegistir } = kur(NAFILE, adim({ bildirim: true }), { sesliOnayiVar: undefined });
        fireEvent(ekran.getByTestId('adim-sesli-anahtari'), 'valueChange', true);
        expect(onDegistir).not.toHaveBeenCalled();
        expect(ekran.getByLabelText(/sesli olmadan/i)).toBeTruthy();
    });

    test('#8 imlecteEkle: sığmayan çip HİÇ eklenmez (yarım `{sü` kalmaz), sığan eklenir', () => {
        const dolu = 'a'.repeat(ANONS_METIN_UST_SINIRI - 3);
        expect(imlecteEkle(dolu, '{süre}', null)).toBe(dolu);
        expect(imlecteEkle('Kalk', '{vakit}', null)).toBe('Kalk {vakit}');
    });

    test('#6 ek yüzeyde yer tutucular boşa çözülürse ÖRNEK OKUNUŞ otomatik cümledir', () => {
        const { ekran } = kur(CUMA, adim({ sesli: true }, { anonsMetni: '{etkinlik}' }));
        expect(ekran.getByTestId('anons-okunus').props.children).toBe('Cuma için öğle vaktine 30 dakika kaldı.');
    });

    test('#10 sabit sınırlı yüzeyde eşik seçicisi KOMŞU adımlara kilitlenir', () => {
        const onDegistir = jest.fn();
        const ekran = render(
            <AdimDetayModal
                gorunur
                tanim={CUMA}
                seviyeler={[adim({ bildirim: true }, { esikDk: 120 }), adim({ bildirim: true }, { esikDk: 60 })]}
                indeks={1}
                ttsDestekli={null}
                sesliOnayiVar
                onDegistir={onDegistir}
                onKapat={jest.fn()}
            />
        );
        const secici = ekran.UNSAFE_getAllByType(SayisalSecici).find((x) => x.props.deger === 60)!;
        expect(secici.props.min).toBe(15);
        expect(secici.props.max).toBe(105);
    });
});
