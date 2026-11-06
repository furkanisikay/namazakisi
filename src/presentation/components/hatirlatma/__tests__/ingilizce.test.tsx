/**
 * Ortak hatırlatma bileşenleri İngilizce çizildiğinde Türkçe metin kalmaz (dil çıkarımı
 * nöbetçisi). Pencere tanımları dil değiştikten SONRA kurulur (başlıklar etkin dilde
 * okunur). Sesli okuma (TTS) cümleleri bilerek Türkçedir → sesli kanal bu testlerde kapalı.
 * Cırcırın göremediği Türkçe harfsiz sözcükler `YASAKLI` ile yakalanır.
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

jest.mock('@expo/vector-icons/FontAwesome5', () => {
    const { Text } = require('react-native');
    return (props: { name: string }) => <Text>{`[${props.name}]`}</Text>;
});
jest.mock('@expo/vector-icons', () => {
    const { Text } = require('react-native');
    return { FontAwesome5: (props: { name: string }) => <Text>{`[${props.name}]`}</Text> };
});
jest.mock('../../../../core/theme', () => ({
    useRenkler: () => ({
        kartArkaplan: '#FFFFFF',
        arkaplan: '#FAFAFA',
        sinir: '#E0E0E0',
        birincil: '#4CAF50',
        birincilMetin: '#FFFFFF',
        bilgi: '#2196F3',
        metin: '#212121',
        metinIkincil: '#757575',
        uyari: '#FFC107',
        durum: { bilgi: '#2196F3', dikkat: '#E65100', uyari: '#FFC107', basarili: '#4CAF50', hata: '#F44336' },
    }),
}));
jest.mock('../../../hooks/useDonanimGeriTusu', () => ({ useDonanimGeriTusu: jest.fn() }));
jest.mock('../../../hooks/useHareketAzalt', () => ({ useHareketAzalt: () => true }));
jest.mock('../../../../../modules/expo-countdown-notification/src', () => ({ sesSec: jest.fn() }));
jest.mock('../../../../domain/services/OnizlemeSesServisi', () => ({
    OnizlemeSesServisi: { temizle: jest.fn(), bildirimSesiniCal: jest.fn() },
}));
jest.mock('../../../../domain/services/AnonsOnizlemeServisi', () => ({ adimiOnizle: jest.fn() }));

import { PencereKarti } from '../PencereKarti';
import { AkisOnizlemeModal } from '../AkisOnizlemeModal';
import { AlarmOnayModal } from '../AlarmOnayModal';
import { AlarmBilgiSatirlari, alarmNotlariniOlustur } from '../AlarmBilgiSatirlari';
import { VarsayilanOneriKarti } from '../VarsayilanOneriKarti';
import { GeceSessizligiSatiri } from '../GeceSessizligiSatiri';
import { VakitDuzeyListesi } from '../VakitDuzeyListesi';
import { SesSecimSatiri } from '../SesSecimSatiri';
import { DuzeySecici } from '../DuzeySecici';
import { vakitPencereTanimi } from '../pencereTanimi';
import { ANDROID_YETENEKLERI } from '../../../../core/muhafiz/ios/platformYetenekleri';
import { SEVIYE_KADEMELERI, VARSAYILAN_SES } from '../../../../core/muhafiz/matrisTipleri';
import type { MuhafizMatrisi, SeviyeAyari, VakitMuhafizAyari } from '../../../../core/muhafiz/matrisTipleri';
import { presetMatrisiOlustur } from '../../../../core/muhafiz/matrisIslemleri';
import { HATIRLATMA_PRESETLERI } from '../../../store/muhafizSlice';
import { ingilizceyeGec, turkceKalanlar } from '../../../../__tests__/yardimci/ingilizceDenetimi';

/** Türkçe harfsiz ama Türkçe sözcükler (bu bileşenlerde geçebilecek). */
const YASAKLI = [
    'Kapat',
    'Tekrar',
    'Her\\b',
    'dk\\b',
    'kala',
    'sonra',
    'Nazik',
    'Sert\\b',
    'Acil',
    'Bildirim',
    'Vakit',
    'vakit',
    'Hafif',
    'Yoğun',
    'Tamam',
    'Uygula',
    'Dinle\\b',
    'Sabah',
    'Akşam',
    'Ezan',
    'Telefonun',
    'Uygulama sesi',
];

const BASLANGIC = new Date(2026, 9, 15, 12, 0, 0);
const BITIS = new Date(2026, 9, 15, 15, 0, 0);

const seviyeler = (esikler: number[]): SeviyeAyari[] =>
    esikler.map((esikDk, i) => ({
        kademe: SEVIYE_KADEMELERI[i],
        kanallar: i === 2 ? { bildirim: true, titresim: true } : { bildirim: true },
        esikDk,
        siklik: i === 1 ? { herDk: 5 } : 'birkez',
        bildirimSesi: VARSAYILAN_SES,
        anonsMetni: '',
    }));
const ayar = (yon: VakitMuhafizAyari['yon'] = 'cikisaDogru'): VakitMuhafizAyari => ({ yon, seviyeler: seviyeler([45, 25, 10, 3]) });
const matris = (): MuhafizMatrisi => presetMatrisiOlustur(HATIRLATMA_PRESETLERI.normal.seviyeler, false);
const kalan = (el: React.ReactElement) => turkceKalanlar(render(el).toJSON() as never, YASAKLI);
const bos = () => undefined;

let geriAl: () => void;
beforeEach(() => {
    geriAl = ingilizceyeGec();
});
afterEach(() => act(() => geriAl()));

describe('Ortak hatırlatma bileşenleri — İngilizce', () => {
    test('pencere kartı: başlık satırı, yön seçici, şerit cümlesi, eylem düğmeleri ve bilgi modalı', () => {
        const tanim = vakitPencereTanimi('ikindi', 'cikisaDogru', 180, ANDROID_YETENEKLERI, { baslangic: BASLANGIC, bitis: BITIS });
        const ekran = render(
            <PencereKarti
                tanim={tanim}
                ayar={ayar()}
                acikMi
                onAcKapa={bos}
                onAdimSec={bos}
                onAdimAcKapa={bos}
                onAdimEkle={bos}
                onAkisiOnizle={bos}
                onTumPencerelereUygula={bos}
                onYonDegistir={bos}
                karsiYonAyari={ayar('girisindenItibaren')}
            />
        );
        expect(turkceKalanlar(ekran.toJSON() as never, YASAKLI)).toEqual([]);
        expect(ekran.getByText('WHEN TO REMIND')).toBeTruthy();
        expect(ekran.getByText('Preview flow')).toBeTruthy();
        // "?" bilgi modalı: iki yönün uzun anlatımı.
        fireEvent.press(ekran.getByLabelText('What does this option mean?'));
        expect(turkceKalanlar(ekran.toJSON() as never, YASAKLI)).toEqual([]);
        expect(ekran.getByText('When should reminders arrive?')).toBeTruthy();
    });

    test('pencere kartı: giriş yönü ve tamamen kapalı vakit', () => {
        const tanim = vakitPencereTanimi('yatsi', 'girisindenItibaren', 300, ANDROID_YETENEKLERI);
        const kapali: VakitMuhafizAyari = {
            yon: 'girisindenItibaren',
            seviyeler: seviyeler([5, 20]).map((s) => ({ ...s, kanallar: {} })),
        };
        expect(kalan(<PencereKarti tanim={tanim} ayar={kapali} acikMi onAcKapa={bos} onAdimSec={bos} onAdimAcKapa={bos} />)).toEqual([]);
        expect(kalan(<PencereKarti tanim={tanim} ayar={ayar('girisindenItibaren')} acikMi onAdimSec={bos} onYonDegistir={bos} />)).toEqual([]);
    });

    test('akış önizlemesi (bildirim adımları, alarm) ve boş akış', () => {
        const tanim = vakitPencereTanimi('ogle', 'cikisaDogru', 180, ANDROID_YETENEKLERI, { baslangic: BASLANGIC, bitis: BITIS });
        const a = ayar();
        a.seviyeler[3] = { ...a.seviyeler[3], kanallar: { bildirim: true, alarm: true } };
        const ekran = render(<AkisOnizlemeModal gorunur tanim={tanim} ayar={a} ttsDestekli={null} onKapat={bos} />);
        expect(turkceKalanlar(ekran.toJSON() as never, YASAKLI)).toEqual([]);
        expect(ekran.getByText('Dhuhr flow')).toBeTruthy();
        const kapali: VakitMuhafizAyari = { yon: 'cikisaDogru', seviyeler: a.seviyeler.map((s) => ({ ...s, kanallar: {} })) };
        expect(kalan(<AkisOnizlemeModal gorunur tanim={tanim} ayar={kapali} ttsDestekli={null} onKapat={bos} />)).toEqual([]);
    });

    test('gerçek alarm onayı ve alarm bilgi satırları (Android, iPhone)', () => {
        expect(kalan(<AlarmOnayModal gorunur platform="android" tamEkran={false} onOnayla={bos} onIptal={bos} />)).toEqual([]);
        for (const alarmKit of [null, 'belirsiz', 'izinli', 'reddedildi', 'desteklenmiyor'] as const) {
            expect(kalan(<AlarmOnayModal gorunur platform="ios" alarmKit={alarmKit} iosSurum={18} onOnayla={bos} onIptal={bos} />)).toEqual([]);
        }
        const android = alarmNotlariniOlustur({ platform: 'android', tamEkran: false, tamAlarm: false });
        expect(kalan(<AlarmBilgiSatirlari notlar={android} onIzinAyari={bos} onTamAlarm={bos} />)).toEqual([]);
        for (const alarmKit of ['izinli', 'belirsiz', 'reddedildi', 'desteklenmiyor'] as const) {
            const notlar = alarmNotlariniOlustur({ platform: 'ios', tamEkran: null, tamAlarm: null, alarmKit, iosSurum: 18 });
            expect(kalan(<AlarmBilgiSatirlari notlar={notlar} onIzinAyari={bos} onAlarmIzni={bos} />)).toEqual([]);
        }
    });

    test('öneri kartı, gece sessizliği satırı (modal dahil) ve vakit düzey listesi', () => {
        expect(kalan(<VarsayilanOneriKarti onUygula={bos} onKapat={bos} kendiAyari />)).toEqual([]);
        const gece = render(<GeceSessizligiSatiri ayar={{ aktif: true, baslangicSaat: 23, baslangicDakika: 0 }} onDegistir={bos} />);
        fireEvent.press(gece.getByText('Quiet hours at night'));
        expect(turkceKalanlar(gece.toJSON() as never, YASAKLI)).toEqual([]);
        expect(kalan(<GeceSessizligiSatiri ayar={undefined} onDegistir={bos} />)).toEqual([]);
        expect(
            kalan(<VakitDuzeyListesi matris={matris()} onSec={bos} onOzel={bos} geceSessiz yatsiDustu aksamKesiliyor />)
        ).toEqual([]);
        expect(kalan(<VakitDuzeyListesi matris={matris()} onSec={bos} geceSessiz />)).toEqual([]);
    });

    test('bildirim sesi satırı: tam ve kompakt (eylem listesi açık)', () => {
        const ortak = { onSec: bos, onDinle: bos, onDosyadanSec: bos, onVarsayilanaDon: bos };
        expect(kalan(<SesSecimSatiri bildirimSesi="content://ses/1" sesAdi="Melody" {...ortak} />)).toEqual([]);
        expect(kalan(<SesSecimSatiri bildirimSesi={VARSAYILAN_SES} seciliyor {...ortak} />)).toEqual([]);
        const kompakt = render(<SesSecimSatiri kompakt testID="ses" bildirimSesi="content://ses/1" sesAdi="Melody" {...ortak} />);
        fireEvent.press(kompakt.getByLabelText('Notification sound: Melody. Tap to change.'));
        expect(turkceKalanlar(kompakt.toJSON() as never, YASAKLI)).toEqual([]);
        expect(kompakt.getByText('Back to the app sound')).toBeTruthy();
    });

    test('düzey seçici (hazır düzeyler, kendi ayarınız)', () => {
        expect(kalan(<DuzeySecici secili="normal" onSec={bos} ozelGoster />)).toEqual([]);
        expect(kalan(<DuzeySecici secili="kapali" onSec={bos} sesliIzinVar={false} />)).toEqual([]);
    });
});
