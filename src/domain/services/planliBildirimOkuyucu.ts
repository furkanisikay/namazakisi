/**
 * Bekleyen (zamanlanmış) bildirim listesinin okunması + toplu iptal (denetim D-15).
 *
 * `getAllScheduledNotificationsAsync` Android'de expo deposundaki 480'e kadar kaydı
 * (Java-serialized) çözer; 15 dk turunda her planlayıcı kendi temizliği için bunu AYRI
 * okuyordu (cuma, camiye gitme, nafile, gün sonu, yatış, takvim, muhafız ≈ 7 okuma).
 *
 * TUR İÇİ OKUYUCU NEDEN DOĞRU: `ArkaplanGorevServisi` planlayıcıları SIRALI koşturur ve
 * her planlayıcı listeyi YALNIZ kendi önekini silmek için okur; bir planlayıcı ötekinin
 * önekiyle kimlik üretmez. Turun başındaki liste bu yüzden her önek için o planlayıcı
 * çalışana kadar doğrudur — aradaki tek fark, başka bir yolun (ör. "Kıldım") zaten
 * iptal ettiği kimliklerin listede kalmasıdır ve onları ikinci kez iptal etmek zararsızdır.
 * Paylaşım YALNIZ açıkça geçirilen okuyucuyla olur: paralel yollar (`konumDegistiUygula`,
 * ekranlar) ve listeyi SAYAN tüketiciler (iOS bütçesi, bildirim defteri) daima taze okur.
 */
import * as Notifications from 'expo-notifications';

import { Logger } from '../../core/utils/Logger';

export interface PlanliBildirimOkuyucu {
    oku(): Promise<Notifications.NotificationRequest[]>;
}

/** Her çağrıda taze okuma (varsayılan; eski davranış). */
export const tazePlanliBildirimOkuyucu: PlanliBildirimOkuyucu = {
    oku: () => Notifications.getAllScheduledNotificationsAsync(),
};

/**
 * Tur içi paylaşılan okuyucu: İLK `oku()` bir kez okur, sonrakiler aynı listeyi alır.
 * Okuma hata verirse önbelleğe girmez (sonraki çağrı yeniden dener).
 */
export function turIciPlanliBildirimOkuyucu(): PlanliBildirimOkuyucu {
    let liste: Promise<Notifications.NotificationRequest[]> | null = null;
    return {
        oku: () => {
            if (!liste) {
                liste = Notifications.getAllScheduledNotificationsAsync().catch((e: unknown) => {
                    liste = null;
                    throw e;
                });
            }
            return liste;
        },
    };
}

/**
 * Kimlikleri PARALEL iptal eder (tek tek `await` köprü gidiş-dönüşünü N kez bekletiyordu).
 * Bir kimliğin hatası ötekileri durdurmaz; hata yalnız loglanır. Çağrılar kimlik
 * sırasıyla BAŞLATILIR (kayıt-oynat sırası değişmez).
 */
export async function bildirimleriTopluIptalEt(kimlikler: readonly string[], etiket: string): Promise<void> {
    const uyar = (kimlik: string, e: unknown) => Logger.warn(etiket, `Bildirim iptal edilemedi: ${kimlik}`, e);
    await Promise.all(
        kimlikler.map((kimlik) => {
            try {
                // `Promise.resolve`: mock'lar (ve eski köprüler) Promise döndürmeyebilir.
                return Promise.resolve(Notifications.cancelScheduledNotificationAsync(kimlik)).catch((e: unknown) =>
                    uyar(kimlik, e)
                );
            } catch (e) {
                uyar(kimlik, e);
                return Promise.resolve();
            }
        })
    );
}
