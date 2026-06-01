/**
 * Takvim Entegrasyonu Servisi
 * Namaz vakitleri icin cihaz takvim etkinlikleri olusturma
 */

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Logger } from '../../core/utils/Logger';
import type { TakvimAyarlari, TakvimVakitAdi } from '../../presentation/store/takvimSlice';

const OLUSTURULDU_NOTU = 'Namaz Akışı tarafından oluşturuldu';

const VAKIT_ISIMLERI: Record<TakvimVakitAdi, string> = {
    imsak:  'Sabah',
    ogle:   'Öğle',
    ikindi: 'İkindi',
    aksam:  'Akşam',
    yatsi:  'Yatsı',
};

export class TakvimServisi {
    private static instance: TakvimServisi;

    private constructor() {}

    public static getInstance(): TakvimServisi {
        if (!TakvimServisi.instance) {
            TakvimServisi.instance = new TakvimServisi();
        }
        return TakvimServisi.instance;
    }

    public async izinIste(): Promise<boolean> {
        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            return status === 'granted';
        } catch (hata) {
            Logger.error('TakvimServisi', 'Takvim izni istenemedi', hata);
            return false;
        }
    }

    public async cihazTakvimleriniGetir(): Promise<Array<{ id: string; title: string; color: string }>> {
        try {
            const izin = await this.izinIste();
            if (!izin) return [];

            const takvimler = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            return takvimler
                .filter(t => t.allowsModifications)
                .map(t => ({
                    id: t.id,
                    title: t.title,
                    color: t.color || '#007AFF',
                }));
        } catch (hata) {
            Logger.error('TakvimServisi', 'Takvimler getirilemedi', hata);
            return [];
        }
    }

    public async eskiOlaylariTemizle(takvimId: string, gunSayisi: number): Promise<void> {
        try {
            const bugun = new Date();
            bugun.setHours(0, 0, 0, 0);
            const bitis = new Date(bugun);
            bitis.setDate(bitis.getDate() + gunSayisi + 1);

            const etkinlikler = await Calendar.getEventsAsync([takvimId], bugun, bitis);
            const silinecekler = etkinlikler.filter(e => e.notes?.includes(OLUSTURULDU_NOTU));

            await Promise.all(
                silinecekler.map(e => Calendar.deleteEventAsync(e.id).catch(() => {}))
            );
        } catch (hata) {
            Logger.error('TakvimServisi', 'Eski olaylar temizlenemedi', hata);
        }
    }

    private hesaplaBaslangic(
        girisSaati: Date,
        cikisSaati: Date,
        baslangicTipi: TakvimAyarlari['vakitAyarlari'][TakvimVakitAdi]['baslangicTipi'],
        dakika: number
    ): Date {
        const ms = dakika * 60 * 1000;
        switch (baslangicTipi) {
            case 'vakit_girisi':
                return new Date(girisSaati);
            case 'vakit_sonrasi':
                return new Date(girisSaati.getTime() + ms);
            case 'vakit_oncesi':
                return new Date(cikisSaati.getTime() - ms);
        }
    }

    public async takvimOlaylariOlustur(
        ayarlar: TakvimAyarlari,
        koordinatlar: { lat: number; lng: number }
    ): Promise<number> {
        const izin = await this.izinIste();
        if (!izin) {
            throw new Error('Takvim izni reddedildi');
        }

        if (!ayarlar.takvimId) {
            throw new Error('Takvim seçilmedi');
        }

        await this.eskiOlaylariTemizle(ayarlar.takvimId, ayarlar.kaciGunIlerisi);

        const coordinates = new Coordinates(koordinatlar.lat, koordinatlar.lng);
        const params = CalculationMethod.Turkey();
        let toplamOlusturulan = 0;

        const gunIslemleri: Array<Promise<number>> = [];

        for (let g = 0; g < ayarlar.kaciGunIlerisi; g++) {
            const tarih = new Date();
            tarih.setDate(tarih.getDate() + g);
            tarih.setHours(0, 0, 0, 0);

            gunIslemleri.push(
                (async () => {
                    let gunSayisi = 0;
                    const pt = new PrayerTimes(coordinates, tarih, params);

                    const yarinTarih = new Date(tarih);
                    yarinTarih.setDate(yarinTarih.getDate() + 1);
                    const ptYarin = new PrayerTimes(coordinates, yarinTarih, params);

                    const girisSaatleri: Record<TakvimVakitAdi, Date> = {
                        imsak:  pt.fajr,
                        ogle:   pt.dhuhr,
                        ikindi: pt.asr,
                        aksam:  pt.maghrib,
                        yatsi:  pt.isha,
                    };

                    const cikisSaatleri: Record<TakvimVakitAdi, Date> = {
                        imsak:  pt.sunrise,
                        ogle:   pt.asr,
                        ikindi: pt.maghrib,
                        aksam:  pt.isha,
                        yatsi:  ptYarin.fajr,
                    };

                    const vakitSiralari: TakvimVakitAdi[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

                    for (const vakit of vakitSiralari) {
                        const vakitAyari = ayarlar.vakitAyarlari[vakit];
                        if (!vakitAyari.aktif) continue;

                        const startDate = this.hesaplaBaslangic(
                            girisSaatleri[vakit],
                            cikisSaatleri[vakit],
                            vakitAyari.baslangicTipi,
                            vakitAyari.dakika
                        );
                        const endDate = new Date(startDate.getTime() + vakitAyari.sureDakika * 60 * 1000);

                        try {
                            await Calendar.createEventAsync(ayarlar.takvimId!, {
                                title: `${VAKIT_ISIMLERI[vakit]} Namazı`,
                                startDate,
                                endDate,
                                notes: OLUSTURULDU_NOTU,
                                timeZone: Platform.OS === 'android' ? 'local' : undefined,
                            });
                            gunSayisi++;
                        } catch (hata) {
                            Logger.error('TakvimServisi', `${vakit} etkinliği oluşturulamadı`, hata);
                        }
                    }
                    return gunSayisi;
                })()
            );
        }

        const sonuclar = await Promise.all(gunIslemleri);
        toplamOlusturulan = sonuclar.reduce((a, b) => a + b, 0);

        Logger.info('TakvimServisi', `${toplamOlusturulan} takvim etkinliği oluşturuldu`);
        return toplamOlusturulan;
    }
}
