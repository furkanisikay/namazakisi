/**
 * Telefondan Android TV'ye konum aktarma (QR yolu) — orkestrasyon.
 *
 * Akış: TV ekranda QR gösterir → `qrOku()` okur (Android: kendi tarayıcımız — CameraX + ZXing,
 * cihaz içi, ML Kit YOK; iOS: sistemin VisionKit tarayıcısı; ikisi de Kıble için zaten
 * bildirili kamera iznini kullanır) →
 * `tvQrCoz` güvenlik süzgecinden geçer (yalnız özel IPv4) → `konumuGonder` aynı Wi-Fi'deki
 * TV'ye tek bir istek yollar. Sunucu/bulut YOK; veri evin yerel ağından çıkmaz.
 *
 * Taşıma: Android'de ham soket (native; uygulamanın ağ güvenliği kuralı düz HTTP'ye izin
 * vermez — doğru olan bu), iOS'ta `fetch` (ATS `NSAllowsLocalNetworking`, app.json). iOS ilk
 * bağlantıda "yerel ağ" iznini sorar; soru açıkken istek düşer → birkaç kez yeniden denenir.
 */
import { Platform } from 'react-native';
import * as TvKopru from '../../../modules/expo-tv-esleme/src';
import {
    eslemeGovdesiOlustur,
    eslemeYanitiniCoz,
    ESLEME_YOLU,
    type EslemeYuku,
    type TvBaglantisi,
} from '../../core/tv/eslemeBaglantisi';
import { Logger } from '../../core/utils/Logger';

export type GonderimSonucu = 'tamam' | 'ulasilamadi' | 'suresiDoldu' | 'reddedildi';
export type OkumaSonucu =
    | { tur: 'okundu'; metin: string }
    | { tur: 'iptal' }
    | { tur: 'tarayiciYok' }
    | { tur: 'kameraIzniYok' };

const ZAMAN_ASIMI_MS = 6000;
// iOS ilk bağlantıda 'yerel ağ' izni sorar; soru açıkken istekler düşer. Kullanıcının
// soruyu okuyup yanıtlaması için iOS'ta deneme penceresi uzun (≈ 16 sn) tutulur.
const DENEME_SAYISI = Platform.OS === 'ios' ? 8 : 3;
const DENEME_ARASI_MS = Platform.OS === 'ios' ? 2000 : 1500;

const bekle = (ms: number) => new Promise<void>((cozul) => setTimeout(cozul, ms));

/** Kamera izni (Kıble ile ortak). Tembel yükleme: expo-camera yalnız tarama anında gerekir. */
async function kameraIzniVarMi(): Promise<boolean> {
    try {
        const { Camera } = require('expo-camera') as typeof import('expo-camera');
        const izin = await Camera.requestCameraPermissionsAsync();
        return izin.granted === true;
    } catch {
        return false;
    }
}

async function iosQrOku(): Promise<OkumaSonucu> {
    const { CameraView } = require('expo-camera') as typeof import('expo-camera');
    return new Promise<OkumaSonucu>((cozul) => {
        let bitti = false;
        const abonelik = CameraView.onModernBarcodeScanned((olay) => {
            if (bitti) return;
            bitti = true;
            abonelik.remove();
            CameraView.dismissScanner().catch(() => undefined);
            cozul({ tur: 'okundu', metin: olay.data });
        });
        CameraView.launchScanner({ barcodeTypes: ['qr'], isGuidanceEnabled: true, isHighlightingEnabled: true })
            .then(() => {
                // iOS'ta söz, tarayıcı AÇILINCA çözülür; kapanış olayla bilinir (aşağıdaki ekran
                // dönüşü). Kullanıcı tarayıcıyı kapatırsa okuma gelmez: ekran "iptal"i ayrıca sunar.
            })
            .catch(() => {
                if (bitti) return;
                bitti = true;
                abonelik.remove();
                cozul({ tur: 'tarayiciYok' });
            });
    });
}

export const TvEslemeServisi = {
    /** Bu cihazda QR okunabilir mi (Android: köprü var; iOS: her zaman denenir). */
    qrOkunabilirMi(): boolean {
        if (Platform.OS === 'android') return TvKopru.tvEslemeModuluVarMi();
        return Platform.OS === 'ios';
    },

    async qrOku(): Promise<OkumaSonucu> {
        if (!(await kameraIzniVarMi())) return { tur: 'kameraIzniYok' };
        if (Platform.OS === 'ios') return iosQrOku();
        try {
            const metin = await TvKopru.qrOku();
            return metin ? { tur: 'okundu', metin } : { tur: 'iptal' };
        } catch (e) {
            Logger.warn('TvEsleme', 'QR okunamadı', { hata: String(e) });
            return { tur: 'tarayiciYok' };
        }
    },

    /** iOS'ta tarayıcı ekranını kapatır (iptal düğmesi için). */
    async taramayiKapat(): Promise<void> {
        if (Platform.OS !== 'ios') return;
        try {
            const { CameraView } = require('expo-camera') as typeof import('expo-camera');
            await CameraView.dismissScanner();
        } catch {
            // zaten kapalı
        }
    },

    async konumuGonder(baglanti: TvBaglantisi, yuk: EslemeYuku): Promise<GonderimSonucu> {
        const govde = eslemeGovdesiOlustur(baglanti, yuk);
        for (let deneme = 1; deneme <= DENEME_SAYISI; deneme++) {
            try {
                const yanit = await tekGonderim(baglanti, govde);
                const sonuc = eslemeYanitiniCoz(yanit);
                if (sonuc.ok) return 'tamam';
                // Anahtar tutmadı: TV ekranı yenilenmiş ya da eski bir QR okundu.
                if (sonuc.hata === 'anahtar') return 'suresiDoldu';
                return 'reddedildi';
            } catch (e) {
                Logger.info('TvEsleme', `Gönderim denemesi ${deneme} başarısız`, { hata: String(e) });
                if (deneme < DENEME_SAYISI) await bekle(DENEME_ARASI_MS);
            }
        }
        return 'ulasilamadi';
    },
};

async function tekGonderim(b: TvBaglantisi, govde: string): Promise<string> {
    if (Platform.OS === 'android') return TvKopru.tvyeGonder(b.adres, b.port, govde, ZAMAN_ASIMI_MS);
    const kontrol = new AbortController();
    const zamanlayici = setTimeout(() => kontrol.abort(), ZAMAN_ASIMI_MS);
    try {
        const yanit = await fetch(`http://${b.adres}:${b.port}${ESLEME_YOLU}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: govde,
            signal: kontrol.signal,
        });
        return await yanit.text();
    } finally {
        clearTimeout(zamanlayici);
    }
}
