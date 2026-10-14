/**
 * "Vakit girdi" bildirimlerinin PLANI — SAF (issue #298'de servisten çıkarıldı).
 *
 * `VakitBildirimYoneticiServisi` ve bildirim defteri AYNI listeyi kullanır.
 * Pencere bugün + yarın; özel gün (issue #272) GÜN bazında atlanır. Metin
 * (rastgele içerik) serviste kalır.
 */
import { Coordinates, PrayerTimes } from 'adhan';
import { turkiyeHesapParametreleri } from '../vakit/hesapParametreleri';
import { tarihiISOFormatinaCevir } from '../utils/TarihYardimcisi';

export type VakitBildirimVakti = 'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';

export type VakitBildirimPlanAyarlari = Record<VakitBildirimVakti, boolean>;

export const VAKIT_BILDIRIM_ID_ONEKI = 'vakit_bildirim_';

export interface VakitBildirimPlanKaydi {
    id: string;
    vakit: VakitBildirimVakti;
    zaman: Date;
}

const yerelGun = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Bugün ve yarının gelecekteki "vakit girdi" bildirimleri (kronolojik). */
export function vakitBildirimPlaniOlustur(
    koordinat: { lat: number; lng: number },
    ayarlar: VakitBildirimPlanAyarlari,
    simdi: Date,
    gunAtlanirMi: (iso: string) => boolean = () => false
): VakitBildirimPlanKaydi[] {
    const coordinates = new Coordinates(koordinat.lat, koordinat.lng);
    const params = turkiyeHesapParametreleri();
    const bugun = new Date(simdi);
    const yarin = new Date(simdi);
    yarin.setDate(yarin.getDate() + 1);

    const plan: VakitBildirimPlanKaydi[] = [];
    for (const gun of [bugun, yarin]) {
        if (gunAtlanirMi(tarihiISOFormatinaCevir(gun))) continue;
        const pt = new PrayerTimes(coordinates, gun, params);
        const zamanlar: [VakitBildirimVakti, Date][] = [
            ['imsak', pt.fajr],
            ['ogle', pt.dhuhr],
            ['ikindi', pt.asr],
            ['aksam', pt.maghrib],
            ['yatsi', pt.isha],
        ];
        for (const [vakit, zaman] of zamanlar) {
            if (!ayarlar[vakit]) continue;
            if (zaman.getTime() <= simdi.getTime()) continue;
            plan.push({ id: `${VAKIT_BILDIRIM_ID_ONEKI}${vakit}_${yerelGun(gun)}`, vakit, zaman });
        }
    }
    return plan;
}
