/**
 * Takvim Entegrasyonu Servisi
 * Namaz vakitleri icin cihaz takvim etkinlikleri olusturma
 */

import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { Logger } from '../../core/utils/Logger';

// Domain-local tipler — presentation/store'a bağımlılık olmadan yapısal uyum sağlar
type TakvimVakitAdi = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
type BaslangicTipi = 'vakit_oncesi' | 'vakit_girisi' | 'vakit_sonrasi';

interface VakitTakvimAyari {
    aktif: boolean;
    sureDakika: number;
    baslangicTipi: BaslangicTipi;
    dakika: number;
}

interface TakvimAyarlari {
    takvimId: string | null;
    kaciGunIlerisi: number;
    vakitAyarlari: Record<TakvimVakitAdi, VakitTakvimAyari>;
}

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
            // Kullanici gun sayisini dusurse (ornegin 30->7) eski etkinliklerin yetim kalmamasi icin
            // her zaman en az 31 gunluk (maksimum sinir) bir araligi temizle
            const temizlemeGunSayisi = Math.max(gunSayisi, 31);
            bitis.setDate(bitis.getDate() + temizlemeGunSayisi);

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

    public async etkinlikleriGetir(
        takvimIds: string[],
        baslangicTarih: Date,
        bitisTarih: Date,
        vakitBasliklari?: string[]
    ): Promise<Array<{ id: string; title: string; startDate: Date; takvimId: string }>> {
        const izin = await this.izinIste();
        if (!izin) return [];

        const sonuclar: Array<{ id: string; title: string; startDate: Date; takvimId: string }> = [];

        for (const takvimId of takvimIds) {
            try {
                const etkinlikler = await Calendar.getEventsAsync([takvimId], baslangicTarih, bitisTarih);
                for (const e of etkinlikler) {
                    if (!e.notes?.includes(OLUSTURULDU_NOTU)) continue;
                    if (vakitBasliklari && vakitBasliklari.length > 0 && !vakitBasliklari.includes(e.title)) continue;
                    sonuclar.push({
                        id: e.id,
                        title: e.title,
                        startDate: new Date(e.startDate as string),
                        takvimId,
                    });
                }
            } catch (hata) {
                Logger.error('TakvimServisi', `Takvim ${takvimId} sorgulanamadı`, hata);
            }
        }

        return sonuclar.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    public async etkinlikleriSil(eventIds: string[]): Promise<number> {
        let silinen = 0;
        for (const id of eventIds) {
            try {
                await Calendar.deleteEventAsync(id);
                silinen++;
            } catch (hata) {
                Logger.error('TakvimServisi', `Etkinlik ${id} silinemedi`, hata);
            }
        }
        return silinen;
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

        // IANA timezone: 'local' gecersiz, cihazin gercek timezone'unu al
        const deviceTimeZone = Platform.OS === 'android'
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : undefined;

        // Sequential loop: 150 eşzamanlı IPC yerine sırayla yazarak takvim DB'yi aşırı yüklemiyoruz
        for (let g = 0; g < ayarlar.kaciGunIlerisi; g++) {
            const tarih = new Date();
            tarih.setDate(tarih.getDate() + g);
            tarih.setHours(0, 0, 0, 0);

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
                        timeZone: deviceTimeZone,
                    });
                    toplamOlusturulan++;
                } catch (hata) {
                    Logger.error('TakvimServisi', `${vakit} etkinliği oluşturulamadı`, hata);
                }
            }
        }

        Logger.info('TakvimServisi', `${toplamOlusturulan} takvim etkinliği oluşturuldu`);
        return toplamOlusturulan;
    }
}
