/**
 * Cihaz ağı eşleştirmesi (v2) — telefon tarafı. Tasarım §4.1, protokol `core/cihazAgi/eslesme.ts`.
 *
 * 1. `POST /esle` — geçici sırla şifreli `{cihaz, ist}`; alıcı 202 döner, kumandayla onay ister.
 * 2. `POST /esle-durum {ist}` 1,5 sn'de bir; yanıt sırla şifreli. Onayda üyeye özel anahtar
 *    gelir → `CihazAgiDeposu`'na (secure-store) yazılır ve hemen ilk eşitleme yapılır (konum).
 * Telefon ÖNCEDEN kendi ekranında "Şu TV'ye bağlanıyorsunuz: <ad>" onayını almış olmalı
 * (çağıran ekran sorar; derin bağlantı dahil — denetim D-01: onaysız HİÇBİR ŞEY gönderilmez).
 */
import { Platform } from 'react-native';
import { base64Yaz, coz, esleIstekAad, esleYanitAad, sifrele } from '../../core/cihazAgi/kanal';
import { eslesmeYanitiniCoz, type EslesmeQr } from '../../core/cihazAgi/eslesme';
import { CihazAgiDeposu } from '../../data/local/CihazAgiDeposu';
import { Logger } from '../../core/utils/Logger';
import { rastgeleBaytlar, yereleGonder } from './CihazAgiTasima';

export type EslesmeSonucu = 'onay' | 'red' | 'zamanAsimi' | 'ulasilamadi' | 'gecersiz' | 'iptal';

const YOKLAMA_MS = 1500;
const AZAMI_BEKLEME_MS = 150_000;

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

/** Kullanıcıya görünen telefon adı (TV'nin onay diyaloğunda okunur). */
export function telefonAdi(): string {
    const c = (Platform.constants ?? {}) as { Brand?: string; Model?: string };
    if (Platform.OS === 'ios') return 'iPhone';
    const marka = (c.Brand ?? '').trim();
    if (!marka) return 'Android telefon';
    return `${marka.charAt(0).toLocaleUpperCase('tr-TR')}${marka.slice(1)} telefon`.slice(0, 40);
}

export async function esles(
    qr: EslesmeQr,
    secenek: { iptalMi?: () => boolean; bekle?: (ms: number) => Promise<void>; simdi?: () => number } = {},
): Promise<EslesmeSonucu> {
    const bekle = secenek.bekle ?? ((ms: number) => new Promise<void>((c) => setTimeout(c, ms)));
    const simdi = secenek.simdi ?? Date.now;
    const ist = hex(rastgeleBaytlar(8));
    const iv = rastgeleBaytlar(12);
    const govde = JSON.stringify({
        v: 2,
        iv: base64Yaz(iv),
        ct: sifrele(qr.sir, iv, esleIstekAad(qr.aliciKimlik), JSON.stringify({ cihaz: telefonAdi(), ist })),
    });
    try {
        const y = await yereleGonder(qr.adres, qr.port, '/esle', govde);
        if (y.kod === 403) return 'gecersiz';
        if (y.kod !== 202) return 'ulasilamadi';
    } catch (e) {
        Logger.info('CihazEslesme', 'Eşleştirme isteği gönderilemedi', { hata: String(e) });
        return 'ulasilamadi';
    }

    const bitis = simdi() + AZAMI_BEKLEME_MS;
    while (simdi() < bitis) {
        if (secenek.iptalMi?.()) return 'iptal';
        await bekle(YOKLAMA_MS);
        let yanit;
        try {
            yanit = await yereleGonder(qr.adres, qr.port, '/esle-durum', JSON.stringify({ ist }));
        } catch {
            continue;
        }
        if (yanit.kod !== 200) return yanit.kod === 403 ? 'zamanAsimi' : 'ulasilamadi';
        let zarf: { iv?: string; ct?: string };
        try {
            zarf = JSON.parse(yanit.govde) as { iv?: string; ct?: string };
        } catch {
            return 'gecersiz';
        }
        const durum = eslesmeYanitiniCoz(coz(qr.sir, zarf.iv ?? '', esleYanitAad(qr.aliciKimlik, ist), zarf.ct ?? ''));
        if (!durum) return 'gecersiz';
        if (durum.durum === 'bekliyor') continue;
        if (durum.durum === 'red') return 'red';
        await CihazAgiDeposu.kaydet({
            tur: 'tv',
            aliciKimlik: qr.aliciKimlik,
            aliciAdi: durum.aliciAdi || qr.aliciAdi,
            uye: durum.uye,
            anahtar: durum.anahtar,
            adres: qr.adres,
            port: qr.port,
            n: 0,
            durumumSayilsin: false,
            tvHatirlat: true,
            eklenmeMs: Date.now(),
            sonEsitlemeMs: 0,
            durum: 'tamam',
        });
        return 'onay';
    }
    return 'zamanAsimi';
}
