/**
 * NÖBETÇİ (issue #278): Samsung Rutinler'in "Bildirim alındığında" koşulu bildirim
 * metnindeki anahtar kelimeyle eşleşir. Bu dizeler değişirse kullanıcıların kurduğu
 * rutinler SESSİZCE çalışmaz → değişiklik bilinçli olmalı (sürüm notunda duyurulmalı).
 *
 * Kotlin ikizleri (Camideyim başlığı, eklenti değişkenleri) dosyadan okunur: native
 * modül testleri CI'da koşmuyor, bu test her `npm test`'te koşar.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    CAMIDESINIZ_ANAHTAR_KELIMESI,
    CIKIYOR_ESIK_DK,
    EKLENTI_DEGISKENLERI,
    RUTIN_ANAHTAR_KELIMELERI,
    VAKIT_GIRDI_EKI,
    vakitGirdiBasligi,
} from '../anahtarKelimeler';

const KOK = path.resolve(__dirname, '../../../..');
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8');

describe('otomasyon anahtar kelimeleri', () => {
    it('vakit girdi başlıkları SABİT', () => {
        expect(vakitGirdiBasligi('imsak')).toBe('İmsak vakti girdi');
        expect(vakitGirdiBasligi('ogle')).toBe('Öğle vakti girdi');
        expect(vakitGirdiBasligi('ikindi')).toBe('İkindi vakti girdi');
        expect(vakitGirdiBasligi('aksam')).toBe('Akşam vakti girdi');
        expect(vakitGirdiBasligi('yatsi')).toBe('Yatsı vakti girdi');
        expect(VAKIT_GIRDI_EKI).toBe('vakti girdi');
        // Ortak ek her başlıkta geçer: tek rutin her vakti yakalayabilsin.
        (['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'] as const).forEach((v) =>
            expect(vakitGirdiBasligi(v).endsWith(VAKIT_GIRDI_EKI)).toBe(true)
        );
    });

    it('servis başlığı yardımcıdan alır (elle yazılmış başlık yok)', () => {
        const kaynak = oku('src/domain/services/VakitBildirimYoneticiServisi.ts');
        expect(kaynak).toContain('vakitGirdiBasligi(vakit)');
        expect(kaynak).not.toMatch(/Vakti Girdi/);
    });

    it('Camidesiniz öneki Kotlin ile AYNI ve bildirim başlığında kullanılıyor', () => {
        expect(CAMIDESINIZ_ANAHTAR_KELIMESI).toBe('Camidesiniz');
        const sabitler = oku('modules/expo-cami-geofence/android/src/main/java/expo/modules/camigeofence/cekirdek/CamiSabitleri.kt');
        const m = sabitler.match(/CAMIDESINIZ_BASLIK_ONEKI\s*=\s*"([^"]+)"/);
        expect(m?.[1]).toBe(CAMIDESINIZ_ANAHTAR_KELIMESI);
        expect(sabitler).toMatch(/fun camidesinizBasligi\(ad: String\): String = "\$CAMIDESINIZ_BASLIK_ONEKI · /);
        const bildirim = oku('modules/expo-cami-geofence/android/src/main/java/expo/modules/camigeofence/CamiBildirimleri.kt');
        expect(bildirim).toContain('.setContentTitle(CamiSabitleri.camidesinizBasligi(c.ad))');
    });

    it('rehber listesi başlıklarla tutarlı', () => {
        const kelimeler = RUTIN_ANAHTAR_KELIMELERI.map((k) => k.kelime);
        expect(kelimeler).toEqual([
            'vakti girdi',
            'İmsak vakti girdi',
            'Öğle vakti girdi',
            'İkindi vakti girdi',
            'Akşam vakti girdi',
            'Yatsı vakti girdi',
            'Camidesiniz',
        ]);
    });

    it('eklenti değişkenleri ve eşik Kotlin ile AYNI', () => {
        const kt = oku('android/app/src/main/java/com/furkanisikay/namazakisi/cekirdek/OtomasyonKurallari.kt');
        const ktDegiskenler = [...kt.matchAll(/const val D_[A-Z_]+ = "(%[a-z]+)"/g)].map((m) => m[1]);
        expect(EKLENTI_DEGISKENLERI.map((d) => d.ad)).toEqual(ktDegiskenler);
        expect(kt).toContain(`const val CIKIYOR_ESIK_DK = ${CIKIYOR_ESIK_DK}`);
    });
});
