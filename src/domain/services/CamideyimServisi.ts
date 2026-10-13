/**
 * Camideyim (#297) + Namaz modu (#277) — JS tarafının orkestrasyonu.
 *
 * KARAR NATIVE'DE (`modules/expo-cami-geofence`): uygulama süreci ölüyken de
 * geofence olayı gelir ve `goAsync()` içinde karar verilir. Bu servis yalnız
 * native'in ihtiyaç duyduğu ve JS'te hesaplanan şeyleri gönderir:
 *  - vakit kapısı pencereleri (giriş −20/+60, cuma −90/+90; 8 gün),
 *  - Namaz modunun zamana bağlı pencereleri (cuma hutbesi, vakit girişi),
 *  - izleme merkezi (konum değişince),
 * ve native'in biriktirdiklerini işler ("Kıldım" kuyruğu).
 *
 * Store'a BAĞIMLI DEĞİLDİR (arka plan görevinde Redux yok): koordinat PARAMETREDİR
 * (cuma servisi dersi). Köprü yoksa (iOS, köprüsüz build) her şey no-op.
 */
import { Logger } from '../../core/utils/Logger';
import { bugunuAl } from '../../core/utils/TarihYardimcisi';
import { NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { koordinatGecerliMi, type NafileKoordinat } from '../../core/nafile/gunVakitleri';
import { kapiPencereleriniHesapla } from '../../core/cami/camiKarar';
import { gunGirisleriniHesapla } from '../../core/cami/vakitGirisleri';
import type { FarzVakit } from '../../core/cami/camiTipleri';
import {
    namazModuAyarlariniNormalize,
    namazModuPlaniOlustur,
    turdanNamaz,
} from '../../core/namazModu/namazModuPlani';
import {
    kayitDegistiDinleyicisiEkle,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import * as kopru from '../../../modules/expo-cami-geofence/src';

const VAKIT_NAMAZ: Record<FarzVakit, NamazAdi> = {
    imsak: NamazAdi.Sabah,
    ogle: NamazAdi.Ogle,
    ikindi: NamazAdi.Ikindi,
    aksam: NamazAdi.Aksam,
    yatsi: NamazAdi.Yatsi,
};

export class CamideyimServisi {
    private static instance: CamideyimServisi;
    private surenKildim: Promise<void> | null = null;
    private baslatildi = false;

    private constructor() { }

    public static getInstance(): CamideyimServisi {
        if (!CamideyimServisi.instance) {
            CamideyimServisi.instance = new CamideyimServisi();
        }
        return CamideyimServisi.instance;
    }

    /** Bu cihazda özellik var mı? (Android + köprülü build) */
    public kullanilabilirMi(): boolean {
        return kopru.camiModuluVarMi();
    }

    /**
     * Konuma bağlı her şeyi tazeler: vakit kapısı, Namaz modu planı, izleme merkezi.
     * `KonumDegisikligiServisi`, `App.tsx` açılışı ve 15 dk'lık arka plan görevi çağırır.
     * Asla fırlatmaz.
     */
    public async konumaBagliTazele(koordinat: NafileKoordinat | null | undefined): Promise<void> {
        if (!this.kullanilabilirMi() || !koordinatGecerliMi(koordinat)) return;
        await this.planlariGonder(koordinat);
        try {
            const ayarlar = await kopru.ayarlariAl();
            if (ayarlar?.aktif === true) await kopru.izlemeyiTazele(koordinat.lat, koordinat.lng);
        } catch (e) {
            Logger.warn('Camideyim', 'Izleme tazelenemedi', e);
        }
    }

    /** Vakit kapısı + Namaz modu pencerelerini native'e yazar. */
    public async planlariGonder(koordinat: NafileKoordinat | null | undefined): Promise<void> {
        if (!this.kullanilabilirMi() || !koordinatGecerliMi(koordinat)) return;
        try {
            const gunler = gunGirisleriniHesapla(koordinat, bugunuAl());
            await kopru.pencereleriYaz(kapiPencereleriniHesapla(gunler));
            const durum = await kopru.namazModuDurumu();
            const ayarlar = namazModuAyarlariniNormalize(durum?.ayarlar);
            await kopru.namazModuPlaniniYaz(namazModuPlaniOlustur(gunler, ayarlar, Date.now()));
        } catch (e) {
            Logger.warn('Camideyim', 'Planlar gonderilemedi', e);
        }
    }

    /**
     * Uygulama açılışında bir kez: kılınmışlık değişince ("Kıldım" uygulamadan,
     * bildirimden ya da saatten) etkin Namaz modu turu kılındıysa modu kapat.
     */
    public baslat(): void {
        if (this.baslatildi || !this.kullanilabilirMi()) return;
        this.baslatildi = true;
        kayitDegistiDinleyicisiEkle(() => {
            this.kildimSonrasiModuKapat().catch(() => undefined);
        });
    }

    /** Etkin tur(lar)ın namazı kılındıysa Namaz modunu kapatır (ayar açıksa — native denetler). */
    public async kildimSonrasiModuKapat(): Promise<void> {
        const turlar = await kopru.namazModuAktifTurlari();
        for (const tur of turlar) {
            const namaz = turdanNamaz(tur);
            if (!namaz) continue;
            const kayit = await localTarihAraligindakiNamazlariGetir(namaz.tarih, namaz.tarih);
            const kilindi = kayit.basarili && kayit.veri?.[0]?.namazlar.some(
                (n) => n.namazAdi === VAKIT_NAMAZ[namaz.vakit] && n.tamamlandi
            );
            if (kilindi) {
                await kopru.namazModuKildim();
                return;
            }
        }
    }

    /**
     * Camiden çıkış sorusundaki "Kıldım" kuyruğunu boşaltır — bildirimdeki
     * "Kıldım" ile AYNI gövde (`BildirimServisi.saattenKildimIsle`; adı Wear'den
     * kalma ama genel "dış kaynaktan kıldım" yoludur). Eşzamanlı çağrılar tek turu
     * paylaşır (headless + ön plan olayı aynı anda gelebilir).
     */
    public bekleyenKildimleriIsle(): Promise<void> {
        if (!this.kullanilabilirMi()) return Promise.resolve();
        if (!this.surenKildim) {
            this.surenKildim = this.kildimleriIsle().finally(() => {
                this.surenKildim = null;
            });
        }
        return this.surenKildim;
    }

    private async kildimleriIsle(): Promise<void> {
        const ogeler = await kopru.kildimBekleyenleriAl();
        if (ogeler.length === 0) return;
        // Tembel: BildirimServisi native köprü grafiğini çeker (Wear deseni).
        const { BildirimServisi } = require('./BildirimServisi') as typeof import('./BildirimServisi');
        for (const oge of ogeler) {
            try {
                await BildirimServisi.getInstance().saattenKildimIsle(oge.vakit, oge.tarih);
                await kopru.kildimTamamlandi(oge.id);
            } catch (e) {
                Logger.warn('Camideyim', `Kildim islenemedi: ${oge.id}`, e);
                await kopru.kildimBasarisiz(oge.id);
            }
        }
    }

    /** Test yardımcısı — singleton durumunu sıfırlar. */
    public __testSifirla(): void {
        this.surenKildim = null;
        this.baslatildi = false;
    }
}
