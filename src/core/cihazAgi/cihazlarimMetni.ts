/**
 * Cihazlarım ekranının görünen metinleri (SAF; zaman enjekte edilir). Ekran ve testler aynı
 * kaynaktan beslenir; vaat cümlesi platforma göre değişir çünkü iOS'ta 15 dakikalık arka
 * plan kontrolü güvenilir DEĞİLDİR (background fetch'i sistem keyfince çalıştırır).
 */
import type { EsliSaatDurumu } from '../cihaz/durumNotlari';
import { bicim, metin, sayili } from '../dil/aktifDil';

export type UyelikDurumu = 'tamam' | 'ulasilamadi' | 'reddedildi';

/** "az önce", "12 dk önce", "3 sa önce", "dün", "4 gün önce". Gelecek/0 → null. */
export function gorecelZaman(ms: number, simdiMs: number): string | null {
    if (!(ms > 0)) return null;
    const fark = Math.max(0, simdiMs - ms);
    const m = metin().cihaz.zaman;
    const dk = Math.floor(fark / 60000);
    if (dk < 1) return m.azOnce;
    if (dk < 60) return sayili(m.dkOnce, dk);
    const sa = Math.floor(dk / 60);
    if (sa < 24) return sayili(m.saOnce, sa);
    const gun = Math.floor(sa / 24);
    return gun === 1 ? m.dun : sayili(m.gunOnce, gun);
}

export interface DurumMetni {
    /** Kısa çip metni. */
    cip: string;
    /** Kartın altında yön gösteren açıklama (yalnız sorun varken). */
    aciklama: string | null;
    ton: 'iyi' | 'bekliyor' | 'sorun';
}

export function uyelikDurumMetni(durum: UyelikDurumu, sonEsitlemeMs: number, simdiMs: number): DurumMetni {
    const m = metin().cihaz.uyelik;
    if (durum === 'reddedildi') {
        return {
            cip: m.yenidenEkleyin,
            aciklama: m.reddedildiAciklama,
            ton: 'sorun',
        };
    }
    const ne = gorecelZaman(sonEsitlemeMs, simdiMs);
    if (durum === 'ulasilamadi') {
        return {
            cip: ne ? bicim(m.sonEsitleme, { ne }) : m.ulasilamiyor,
            aciklama: m.ulasilamadiAciklama,
            ton: 'bekliyor',
        };
    }
    return ne ? { cip: bicim(m.sonEsitleme, { ne }), aciklama: null, ton: 'iyi' } : { cip: m.baglandi, aciklama: null, ton: 'iyi' };
}

/** Ne zaman güncellenir? Dürüst vaat (tasarım belgesi; abartma yok). */
export function esitlemeVaadi(platform: string): string {
    const m = metin().cihaz.uyelik;
    return platform === 'android' ? m.vaatAndroid : m.vaatIos;
}

/** Bağ haritası kart rozeti: "bağlı · 2 dk önce", "ulaşılamıyor", "yeniden ekleyin". */
export function haritaRozeti(durum: UyelikDurumu, sonEsitlemeMs: number, simdiMs: number): string {
    const m = metin().cihaz.uyelik;
    if (durum === 'reddedildi') return m.rozetYenidenEkleyin;
    if (durum === 'ulasilamadi') return m.rozetUlasilamiyor;
    const ne = gorecelZaman(sonEsitlemeMs, simdiMs);
    return ne ? bicim(m.rozetBagliZaman, { ne }) : m.rozetBagli;
}

/** Wear Data Layer okuması ("esli" = şu an bağlı düğüm var; "esliDegil" = bağlı düğüm yok). */
export type SaatDurumu = EsliSaatDurumu;

export function saatDurumMetni(d: SaatDurumu | null): { baslik: string; aciklama: string } {
    const m = metin().cihaz.saat;
    if (d === 'esli') return { baslik: m.esliBaslik, aciklama: m.esliAciklama };
    // "esliDegil" iki durumu ayıramaz: saat hiç yok ya da şu an uzakta/kapalı.
    if (d === 'esliDegil') return { baslik: m.esliDegilBaslik, aciklama: m.esliDegilAciklama };
    return { baslik: m.baslik, aciklama: m.aciklama };
}
