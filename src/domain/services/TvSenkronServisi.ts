/**
 * Cihaz ağı — telefon → TV durum gönderimi (tasarım §4.4–4.5). `WearSenkronServisi` deseni:
 * tek örnek, SIRALI gönderim zinciri, düz metin üzerinden tekilleştirme (`sonGonderilen`),
 * olay başına kısa bekleme (debounce). Store'a BAĞIMLI DEĞİL (arka plan görevinde Redux yok):
 * konum ham AsyncStorage'dan, kılınmışlık `LocalNamazServisi`'nden okunur.
 *
 * Ne zaman: kılınmışlık değişince (adlı yuva `tv`), konum yayması (`konumDegistiUygula` listesi),
 * App açılışı, Android 15 dk görevi (muhafız erken dönüşlerinden ÖNCE) ve Cihazlarım'daki anahtar
 * değişimi. iOS'ta keşif yoktur: önbellekteki adrese tek deneme.
 *
 * Teslim: önbellekteki adrese tek deneme; Android'de olmazsa süre sınırlı mDNS keşfi → bulunan
 * adrese bir deneme daha, adres YALNIZ başarılı şifreli yanıttan sonra kaydedilir (§4.2).
 * 403 = TV bu telefonu kaldırmış / anahtar tutmuyor → üyelik 'reddedildi' (Cihazlarım "yeniden
 * ekleyin" der). Ağ yoksa (Wi-Fi/Ethernet değil) hiç denenmez.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { DEPOLAMA_ANAHTARLARI, NamazAdi } from '../../core/constants/UygulamaSabitleri';
import { bugunuAl, gunEkle } from '../../core/utils/TarihYardimcisi';
import { koordinatGecerliMi } from '../../core/nafile/gunVakitleri';
import { konumMetniHesapla, type KonumMetniGirdisi } from '../../core/ayarlar/konumMetni';
import { base64Coz, zarfla } from '../../core/cihazAgi/kanal';
import { yukuYaz, type DurumAnlikGoruntusu } from '../../core/cihazAgi/yuk';
import { camiyeGitOncedenDk } from '../../core/camiyeGit/camiyeGitAyarlari';
import { tvHesapOzeti } from '../../core/vakit/tvHesapOzeti';
import { HesapAyariServisi } from './HesapAyariServisi';
import { fnv1aHex } from '../../core/kaza/kazaHareketi';
import type { VakitAdi } from '../../core/types';
import { Logger } from '../../core/utils/Logger';
import {
    kayitDegistiDinleyicisiEkle,
    kilinanVakitleriAl,
    localTarihAraligindakiNamazlariGetir,
} from '../../data/local/LocalNamazServisi';
import { ozelGunSuzgeciniOku } from '../../data/local/LocalOzelGunOkuyucu';
import { LocalCumaHatirlatmaServisi } from '../../data/local/LocalCumaHatirlatmaServisi';
import { LocalCamiyeGitServisi } from '../../data/local/LocalCamiyeGitServisi';
import { CihazAgiDeposu, type CihazUyeligi } from '../../data/local/CihazAgiDeposu';
import { alicilariBul } from '../../../modules/expo-tv-esleme/src';
import { rastgeleBaytlar, yereleGonder } from './CihazAgiTasima';

export const TV_DINLEYICI_ADI = 'tv';
const BEKLEME_MS = 1500;
const KESIF_MS = 4000;
/** Ulaşılamayan TV için bekleme: 30 sn × 2^(hata−1), en çok 60 dk (tasarım §4.5). `zorla` atlar. */
const GERI_CEKILME_TABAN_MS = 30_000;
const GERI_CEKILME_TAVAN_MS = 60 * 60_000;
export const geriCekilmeMs = (hataSayisi: number): number =>
    hataSayisi <= 0 ? 0 : Math.min(GERI_CEKILME_TAVAN_MS, GERI_CEKILME_TABAN_MS * 2 ** Math.min(hataSayisi - 1, 12));
/** Alıcı başına son gönderilen yükün ÖZETİ (içerik değil): 15 dk görevi ayrı süreçte koşar,
 * bellek-içi tekilleştirme orada boştur → özet diskte tutulur, aynıysa hiç gönderilmez. */
const OZET_ANAHTARI = 'cihazAgi_son_ozet';

const NAMAZ_VAKIT: Partial<Record<string, VakitAdi>> = {
    [NamazAdi.Sabah]: 'imsak',
    [NamazAdi.Ogle]: 'ogle',
    [NamazAdi.Ikindi]: 'ikindi',
    [NamazAdi.Aksam]: 'aksam',
    [NamazAdi.Yatsi]: 'yatsi',
};

type GonderimSonucu = 'tamam' | 'ayni' | 'ulasilamadi' | 'reddedildi' | 'atlandi';

export class TvSenkronServisi {
    private static ornek: TvSenkronServisi;
    private zincir: Promise<unknown> = Promise.resolve();
    /** Alıcı başına son BAŞARIYLA gönderilen düz yükün özeti (aynıysa gönderilmez). */
    private sonGonderilen: Map<string, string> | null = null;
    private zamanlayici: ReturnType<typeof setTimeout> | null = null;
    private baslatildi = false;

    static getInstance(): TvSenkronServisi {
        if (!TvSenkronServisi.ornek) TvSenkronServisi.ornek = new TvSenkronServisi();
        return TvSenkronServisi.ornek;
    }

    /** Kılınmışlık değişince (adlı yuva `tv`) kısa beklemeyle gönderir. İdempotent. */
    baslat(): void {
        if (this.baslatildi) return;
        this.baslatildi = true;
        kayitDegistiDinleyicisiEkle(TV_DINLEYICI_ADI, () => this.yakinda());
    }

    /** Art arda değişiklikler tek gönderime insin. */
    yakinda(): void {
        if (this.zamanlayici) clearTimeout(this.zamanlayici);
        this.zamanlayici = setTimeout(() => {
            this.zamanlayici = null;
            void this.gonder();
        }, BEKLEME_MS);
    }

    /** Tüm TV'lere gönderir (sıralı zincir). `zorla`: tekilleştirmeyi atla (TV yeniden göründü). */
    gonder(zorla = false): Promise<Record<string, GonderimSonucu>> {
        const tur = this.zincir.then(() => this.gonderTuru(zorla));
        this.zincir = tur.catch(() => undefined);
        return tur;
    }

    /** Eşleşmeyi kaldır: önce TV'ye `sil` (anahtar orada da silinsin), sonra yerelde. */
    async kaldir(aliciKimlik: string): Promise<void> {
        const u = (await CihazAgiDeposu.liste()).find((x) => x.aliciKimlik === aliciKimlik);
        if (u) {
            try {
                await this.zarfGonder(u, yukuYaz({ v: 2, sil: true }));
            } catch {
                // TV kapalıysa: anahtar TV'de kalır ama bir daha hiç kullanılmaz; TV ayarlarından da silinebilir.
            }
        }
        await this.ozetYaz(aliciKimlik, null);
        await CihazAgiDeposu.sil(aliciKimlik);
    }

    private async gonderTuru(zorla: boolean): Promise<Record<string, GonderimSonucu>> {
        const sonuc: Record<string, GonderimSonucu> = {};
        let uyeler: CihazUyeligi[];
        try {
            uyeler = (await CihazAgiDeposu.liste()).filter((u) => u.tur === 'tv' && u.durum !== 'reddedildi');
        } catch {
            return sonuc;
        }
        if (uyeler.length === 0) return sonuc;
        if (!(await yerelAgVarMi())) {
            for (const u of uyeler) sonuc[u.aliciKimlik] = 'atlandi';
            return sonuc;
        }
        const ortak = await this.ortakDurumuOku();
        const ozetler = await this.ozetleriOku();
        for (const u of uyeler) {
            if (!zorla && u.sonHataMs && Date.now() < u.sonHataMs + geriCekilmeMs(u.hataSayisi ?? 0)) {
                sonuc[u.aliciKimlik] = 'atlandi';
                continue;
            }
            const duz = yukuYaz({
                v: 2,
                durum: { ...ortak, durumumSayilsin: u.durumumSayilsin, tvHatirlat: u.tvHatirlat },
            });
            const ozet = fnv1aHex(duz);
            if (!zorla && ozetler.get(u.aliciKimlik) === ozet) {
                sonuc[u.aliciKimlik] = 'ayni';
                continue;
            }
            try {
                sonuc[u.aliciKimlik] = await this.zarfGonder(u, duz);
                if (sonuc[u.aliciKimlik] === 'tamam') await this.ozetYaz(u.aliciKimlik, ozet);
            } catch (e) {
                Logger.warn('TvSenkron', 'TV durumu gönderilemedi', { hata: String(e) });
                sonuc[u.aliciKimlik] = 'ulasilamadi';
            }
        }
        return sonuc;
    }

    private async ozetleriOku(): Promise<Map<string, string>> {
        if (this.sonGonderilen) return this.sonGonderilen;
        try {
            const ham = await AsyncStorage.getItem(OZET_ANAHTARI);
            const o = ham ? (JSON.parse(ham) as Record<string, string>) : {};
            this.sonGonderilen = new Map(Object.entries(o).filter(([, v]) => typeof v === 'string'));
        } catch {
            this.sonGonderilen = new Map();
        }
        return this.sonGonderilen;
    }

    private async ozetYaz(alici: string, ozet: string | null): Promise<void> {
        const m = await this.ozetleriOku();
        if (ozet) m.set(alici, ozet);
        else m.delete(alici);
        await AsyncStorage.setItem(OZET_ANAHTARI, JSON.stringify(Object.fromEntries(m))).catch(() => undefined);
    }

    private async zarfGonder(u: CihazUyeligi, duz: string): Promise<GonderimSonucu> {
        const dene = async (adres: string, port: number): Promise<GonderimSonucu> => {
            const n = await CihazAgiDeposu.sonrakiN(u.aliciKimlik);
            if (n == null) return 'reddedildi';
            const zarf = zarfla(base64Coz(u.anahtar), rastgeleBaytlar(12), u.aliciKimlik, u.uye, n, duz);
            const y = await yereleGonder(adres, port, '/esitle', JSON.stringify(zarf));
            if (y.kod === 200) return 'tamam';
            if (y.kod === 403) return 'reddedildi';
            return 'ulasilamadi';
        };
        let sonuc: GonderimSonucu;
        try {
            sonuc = await dene(u.adres, u.port);
        } catch {
            sonuc = 'ulasilamadi';
        }
        // Adres düşmüş olabilir (DHCP, TV yeniden başladı): Android'de süre sınırlı mDNS keşfi.
        if (sonuc === 'ulasilamadi' && Platform.OS === 'android') {
            const bulunan = (await alicilariBul(KESIF_MS).catch(() => [])).find((b) => b.i === u.aliciKimlik);
            if (bulunan && (bulunan.adres !== u.adres || bulunan.port !== u.port)) {
                try {
                    sonuc = await dene(bulunan.adres, bulunan.port);
                } catch {
                    sonuc = 'ulasilamadi';
                }
                // Adres YALNIZ anahtarlı yanıt başarılıysa güncellenir (sahte mDNS yanıtı adres çalamaz).
                if (sonuc === 'tamam') await CihazAgiDeposu.guncelle(u.aliciKimlik, { adres: bulunan.adres, port: bulunan.port });
            }
        }
        const simdi = Date.now();
        await CihazAgiDeposu.guncelle(u.aliciKimlik, {
            durum: sonuc === 'reddedildi' ? 'reddedildi' : sonuc === 'tamam' ? 'tamam' : 'ulasilamadi',
            ...(sonuc === 'tamam' ? { sonEsitlemeMs: simdi, sonHataMs: 0, hataSayisi: 0 } : {}),
            ...(sonuc === 'ulasilamadi' ? { sonHataMs: simdi, hataSayisi: (u.hataSayisi ?? 0) + 1 } : {}),
        });
        return sonuc;
    }

    /** Tüm TV'lere ortak kısım (üyeye özel iki anahtar sonra eklenir). */
    private async ortakDurumuOku(): Promise<Omit<DurumAnlikGoruntusu, 'durumumSayilsin' | 'tvHatirlat'>> {
        const bugun = bugunuAl();
        const kilinan = await dunBugunKilinanlar(bugun);
        const konum = await konumuOku();
        const ozelGun = await ozelGunSuzgeciniOku().then((s) => s(bugun)).catch(() => false);
        const cuma = await LocalCumaHatirlatmaServisi.getAyarlar().catch(() => null);
        const camiye = await LocalCamiyeGitServisi.getAyarlar().catch(() => null);
        const ramazan = await ramazanMi();
        // TV vakitleri kendisi hesaplar: telefonun yöntemi de gitmeli (yoksa TV Diyanet'le hesaplar).
        const hesap = konum
            ? await HesapAyariServisi.yukle()
                  .then((a) => tvHesapOzeti(a, konum.koordinat.lat, new Date()))
                  .catch(() => null)
            : null;
        return {
            ...(konum ? { ad: konum.ad, konum: konum.koordinat } : {}),
            ...(hesap ? { hesap } : {}),
            kilinan,
            ozelGun,
            cuma: { aktif: cuma?.aktif === true, cikisDk: camiye ? camiyeGitOncedenDk(camiye) : null },
            ramazan,
        };
    }
}

/** Dün + bugün kılınan farzlar (namaz kaydı ∪ muhafız diski). TV yükü ve cihaz olay günlüğü ortak kaynak. */
export async function dunBugunKilinanlar(bugun: string = bugunuAl()): Promise<Record<string, VakitAdi[]>> {
    const dun = gunEkle(bugun, -1);
    const kilinan: Record<string, VakitAdi[]> = {};
    try {
        const kayit = await localTarihAraligindakiNamazlariGetir(dun, bugun);
        if (kayit.basarili && kayit.veri) {
            for (const gun of kayit.veri) {
                kilinan[gun.tarih] = gun.namazlar
                    .filter((n) => n.tamamlandi)
                    .map((n) => NAMAZ_VAKIT[n.namazAdi])
                    .filter((v): v is VakitAdi => !!v);
            }
        }
    } catch {
        // kayıt okunamadı: boş gider
    }
    // Kılınmışlığın tek doğru kaynağı disk (AGENTS.md): muhafız kaydıyla birleşim.
    for (const tarih of [dun, bugun]) {
        const m = await kilinanVakitleriAl(tarih).catch(() => [] as VakitAdi[]);
        kilinan[tarih] = [...new Set([...(kilinan[tarih] ?? []), ...m])];
    }
    return kilinan;
}

export async function yerelAgVarMi(): Promise<boolean> {
    try {
        // Tembel: netinfo native köprüdür; modül yükünde çekilseydi bu servisi dolaylı yükleyen her test düşerdi.
        const NetInfo = (require('@react-native-community/netinfo') as typeof import('@react-native-community/netinfo')).default;
        const d = await NetInfo.fetch();
        return d.isConnected !== false && (d.type === 'wifi' || d.type === 'ethernet');
    } catch {
        return true;
    }
}

async function konumuOku(): Promise<{ koordinat: { lat: number; lng: number }; ad: string } | null> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
        if (!ham) return null;
        const k = JSON.parse(ham) as Partial<KonumMetniGirdisi> & { koordinatlar?: { lat: number; lng: number } };
        if (!koordinatGecerliMi(k.koordinatlar)) return null;
        return {
            koordinat: k.koordinatlar,
            ad: konumMetniHesapla({
                konumModu: k.konumModu === 'oto' ? 'oto' : 'manuel',
                gpsAdres: k.gpsAdres ?? null,
                seciliIlceAdi: k.seciliIlceAdi ?? '',
                seciliIlAdi: k.seciliIlAdi ?? '',
            }),
        };
    } catch {
        return null;
    }
}

/** Ramazan = kullanıcı iftar ya da sahur sayacını açmış (uygulamada Ramazan'ın tek sinyali). */
async function ramazanMi(): Promise<boolean> {
    for (const anahtar of [DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI, DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI]) {
        try {
            const ham = await AsyncStorage.getItem(anahtar);
            if (ham && (JSON.parse(ham) as { aktif?: boolean })?.aktif === true) return true;
        } catch {
            // yok sayılır
        }
    }
    return false;
}
