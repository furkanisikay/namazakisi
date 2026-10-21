/**
 * Cihazlarım ekranının görünen metinleri (SAF; zaman enjekte edilir). Ekran ve testler aynı
 * kaynaktan beslenir; vaat cümlesi platforma göre değişir çünkü iOS'ta 15 dakikalık arka
 * plan kontrolü güvenilir DEĞİLDİR (background fetch'i sistem keyfince çalıştırır).
 */

export type UyelikDurumu = 'tamam' | 'ulasilamadi' | 'reddedildi';

/** "az önce", "12 dk önce", "3 sa önce", "dün", "4 gün önce". Gelecek/0 → null. */
export function gorecelZaman(ms: number, simdiMs: number): string | null {
    if (!(ms > 0)) return null;
    const fark = Math.max(0, simdiMs - ms);
    const dk = Math.floor(fark / 60000);
    if (dk < 1) return 'az önce';
    if (dk < 60) return `${dk} dk önce`;
    const sa = Math.floor(dk / 60);
    if (sa < 24) return `${sa} sa önce`;
    const gun = Math.floor(sa / 24);
    return gun === 1 ? 'dün' : `${gun} gün önce`;
}

export interface DurumMetni {
    /** Kısa çip metni. */
    cip: string;
    /** Kartın altında yön gösteren açıklama (yalnız sorun varken). */
    aciklama: string | null;
    ton: 'iyi' | 'bekliyor' | 'sorun';
}

export function uyelikDurumMetni(durum: UyelikDurumu, sonEsitlemeMs: number, simdiMs: number): DurumMetni {
    if (durum === 'reddedildi') {
        return {
            cip: 'Yeniden ekleyin',
            aciklama: "Bu TV telefonunuzu artık tanımıyor (TV'den kaldırılmış olabilir). TV'deki kodu yeniden okutun.",
            ton: 'sorun',
        };
    }
    const ne = gorecelZaman(sonEsitlemeMs, simdiMs);
    if (durum === 'ulasilamadi') {
        return {
            cip: ne ? `Son eşitleme ${ne}` : 'Ulaşılamıyor',
            aciklama: 'Şu an TV’ye ulaşılamıyor. TV açık ve telefonunuzla aynı Wi-Fi’de olduğunda kendiliğinden güncellenir.',
            ton: 'bekliyor',
        };
    }
    return ne ? { cip: `Son eşitleme ${ne}`, aciklama: null, ton: 'iyi' } : { cip: 'Bağlandı', aciklama: null, ton: 'iyi' };
}

/** Ne zaman güncellenir? Dürüst vaat (tasarım belgesi; abartma yok). */
export function esitlemeVaadi(platform: string): string {
    return platform === 'android'
        ? 'Aynı Wi-Fi’de ve uygulama açıkken anında; değilse telefon uyandığında, en geç bir sonraki açılışta ya da 15 dakikalık kontrolde.'
        : 'Aynı Wi-Fi’de ve uygulama açıkken anında; değilse en geç uygulamayı bir sonraki açışınızda.';
}
