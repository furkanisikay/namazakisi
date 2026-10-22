/**
 * Cihaz ağı taşıması — yerel ağda tek bir HTTP POST (telefon → alıcı).
 *
 * Android: ham soket (native `yerelIstek`); uygulamanın ağ güvenliği yapılandırması düz HTTP'ye
 * izin vermez (doğru olan bu) ve OkHttp ona uyar. iOS: `fetch` + ATS `NSAllowsLocalNetworking`.
 * Hedef YALNIZ özel IPv4 (katı ayrıştırma, denetim D-06) — iki uçta denetlenir.
 * Rastgele baytlar expo-crypto CSPRNG'sinden (tembel yükleme: jest/arka plan güvenli).
 */
import { Platform } from 'react-native';
import { ozelIpv4Mu } from '../../core/tv/eslemeBaglantisi';
import { yerelIstek, type IstekYaniti } from '../../../modules/expo-tv-esleme/src';

export type Yol = '/esle' | '/esle-durum' | '/esitle';

export function rastgeleBaytlar(n: number): Uint8Array {
    const Crypto = require('expo-crypto') as typeof import('expo-crypto');
    return Crypto.getRandomBytes(n);
}

/** @throws Bağlanamazsa ya da adres yerel değilse. */
export async function yereleGonder(adres: string, port: number, yol: Yol, govde: string, zamanAsimiMs = 6000): Promise<IstekYaniti> {
    if (!ozelIpv4Mu(adres) || !Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Yerel ağ adresi değil');
    if (Platform.OS === 'android') return yerelIstek(adres, port, yol, govde, zamanAsimiMs);
    const kontrol = new AbortController();
    const zamanlayici = setTimeout(() => kontrol.abort(), zamanAsimiMs);
    try {
        const y = await fetch(`http://${adres}:${port}${yol}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: govde,
            signal: kontrol.signal,
        });
        return { kod: y.status, govde: await y.text() };
    } finally {
        clearTimeout(zamanlayici);
    }
}
