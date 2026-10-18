/**
 * Tek anahtarla kapatılan bir hatırlatmanın kapatılmadan ÖNCEKİ seçimi (sade tasarım,
 * Dalga 3, Opus incelemesi). Hatırlatmalar sayfasındaki "Vakit girince" anahtarı beş
 * vakti birlikte kapatır; Namazda sessiz'deki "Namaz vakitlerinde" cuma/vakit
 * tetiklerini kapatır. Kapatmak kullanıcının vakit seçimini kalıcı silmesin: önceki
 * seçim burada saklanır, anahtar açılınca geri yüklenir.
 *
 * Ekran hafızasıdır, cihaza özgü → yedeklemeye GİRMEZ. Asla fırlatmaz.
 */
import { Depolama } from './Depolama';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';

export interface KapatmaOncesiSecimler {
    vakitGirince?: Record<'imsak' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi', boolean>;
    namazVakitlerinde?: { cuma: boolean; vakit: boolean };
}

type Alan = keyof KapatmaOncesiSecimler;

export const LocalKapatmaOncesiSecim = {
    async oku<A extends Alan>(alan: A): Promise<KapatmaOncesiSecimler[A] | null> {
        try {
            const kayit = await Depolama.oku<KapatmaOncesiSecimler>(DEPOLAMA_ANAHTARLARI.KAPATMA_ONCESI_SECIM);
            const deger = kayit && typeof kayit === 'object' ? kayit[alan] : undefined;
            return deger && typeof deger === 'object' ? (deger as KapatmaOncesiSecimler[A]) : null;
        } catch {
            return null;
        }
    },

    async yaz<A extends Alan>(alan: A, deger: KapatmaOncesiSecimler[A]): Promise<void> {
        try {
            await Depolama.guncelle<KapatmaOncesiSecimler>(DEPOLAMA_ANAHTARLARI.KAPATMA_ONCESI_SECIM, (mevcut) => ({
                ...(mevcut && typeof mevcut === 'object' ? mevcut : {}),
                [alan]: deger,
            }));
        } catch {
            // ekran hafızası: yazılamazsa açınca varsayılana düşülür
        }
    },
};
