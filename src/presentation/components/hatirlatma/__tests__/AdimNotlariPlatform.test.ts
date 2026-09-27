/**
 * Platform notlari — kullanicinin kurdugu sey ile cihazda olacak sey
 * AYRISIYORSA ekranda soylenir (sessiz sapma yok).
 */
jest.mock('../../../../core/theme', () => ({ useRenkler: () => ({}) }));
// Ikon paketi native kopru cekiyor (expo-modules-core); saf not fonksiyonu icin gereksiz.
jest.mock('@expo/vector-icons/FontAwesome5', () => 'FontAwesome5');

import { adimNotlariniOlustur } from '../AdimNotlari';
import {
    ANDROID_YETENEKLERI,
    iosYetenekleri,
} from '../../../../core/muhafiz/ios/platformYetenekleri';
import type { SeviyeAyari } from '../../../../core/muhafiz/matrisTipleri';

const sesli: SeviyeAyari = {
    kademe: 'sert',
    kanallar: { bildirim: true, sesli: true },
    esikDk: 10,
    siklik: 'birkez',
    bildirimSesi: 'varsayilan',
    anonsMetni: 'Vakit çıkıyor.',
};

const notlar = (yetenekler = ANDROID_YETENEKLERI, seviye = sesli) =>
    adimNotlariniOlustur(seviye, [seviye], {
        pencereAdi: 'yatsı',
        pencereUzunluguDk: 300,
        yetenekler,
    }).map((n) => n.metin);

describe('AdimNotlari — platform notlari', () => {
    /**
     * iPhone'da anons BILDIRIM SESIDIR (Android'deki gibi alarm sesi degil):
     * sessiz anahtari acikken duyulmaz. Kullanici bunu kurarken bilmeli.
     */
    it('iOS + sesli adim: sessiz modda duyulmayacagi soylenir', () => {
        expect(notlar(iosYetenekleri(false))).toContain(
            'iPhone’da sesli anons bildirim sesi olarak çalar; sessiz moddayken duyulmaz'
        );
    });

    it('iOS + AlarmKit (sessizligi delebilir): not CIKMAZ', () => {
        expect(notlar(iosYetenekleri(true)).join(' ')).not.toContain('sessiz moddayken');
    });

    it('Android: not CIKMAZ (anons alarm sesiyle calar, sessiz modu deler)', () => {
        expect(notlar(ANDROID_YETENEKLERI).join(' ')).not.toContain('iPhone');
    });

    it('iOS + sesli OLMAYAN adim: not CIKMAZ', () => {
        const yalnizBildirim = { ...sesli, kanallar: { bildirim: true } };
        expect(notlar(iosYetenekleri(false), yalnizBildirim).join(' ')).not.toContain('sesli anons');
    });
});
