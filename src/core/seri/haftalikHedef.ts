/**
 * İlerleme sekmesinin haftalık hedefi — SAF (sade tasarım Dalga 4, madde 7).
 *
 * Eskiden İstatistik ekranında üç SABİT hedef vardı ("35 Namaz Hedefi", "80% Başarı
 * Oranı", "Haftanın 7 Günü"). Bunlar kullanıcının Seri hedefi > tam gün eşiği (3/4/5)
 * ayarından bağımsızdı ve onunla çelişebiliyordu (eşiği 3 olan kullanıcıya "35 namaz"
 * hedefi). Artık hedef EŞİKTEN türer:
 *   - haftalık namaz hedefi = eşik × 7,
 *   - eşiği geçen gün sayısı / 7.
 * "%80" hedefi kaldırıldı (hiçbir ayara dayanmıyordu).
 *
 * DİKKAT: haftalık istatistik TAKVİM gününü sayar; seri günü ise imsakta biter
 * (`namazGunuHesapla`). Bu yüzden ekranda "tam gün" DENMEZ, "eşiği geçen gün" denir —
 * seri motoruyla birebir parite iddia edilmez.
 */

export interface HaftalikHedefGunu {
    tamamlananNamaz: number;
}

export interface HaftalikHedef {
    /** Bu hafta kılınan farz sayısı. */
    kilinan: number;
    /** eşik × 7. */
    namazHedefi: number;
    /** Kılınan sayısı eşiğe ulaşan gün sayısı. */
    esigiGecenGun: number;
    /** Kullanılan eşik (1..5'e kenetli). */
    esik: number;
}

const GUN_SAYISI = 7;

export function haftalikHedefHesapla(gunler: readonly HaftalikHedefGunu[] | undefined | null, tamGunEsigi: number): HaftalikHedef {
    const esik = Number.isFinite(tamGunEsigi) ? Math.min(5, Math.max(1, Math.round(tamGunEsigi))) : 5;
    const liste = Array.isArray(gunler) ? gunler : [];
    let kilinan = 0;
    let esigiGecenGun = 0;
    for (const g of liste) {
        const n = Number.isFinite(g?.tamamlananNamaz) ? g.tamamlananNamaz : 0;
        kilinan += n;
        if (n >= esik) esigiGecenGun += 1;
    }
    return { kilinan, namazHedefi: esik * GUN_SAYISI, esigiGecenGun: Math.min(GUN_SAYISI, esigiGecenGun), esik };
}
