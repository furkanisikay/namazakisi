/**
 * Bir ses kimliğinin kayıtlardaki TÜM referanslarını varsayılana döndürmek — SAF.
 *
 * iPhone'da eklenen dosya (`dosya:<ad>`) listeden silinince onu kullanan HER adım (muhafız
 * matrisi + özel yoğunluk yedeği, nafile grupları, cuma/camiye/yatış/takvim adımları) ve
 * vakit sesi varsayılana döner: yoksa ekran silinmiş dosyanın adını göstermeye, planlı
 * bildirim de olmayan dosyayı istemeye devam eder (iOS onun yerine SİSTEMİN sesini çalar —
 * sessiz sapma). Kayıtların şekli yüzeye göre farklıdır; hepsinde ses `bildirimSesi`
 * alanındadır → ham JSON özyinelemeli dolaşılır (`ozelAnonsMetinleri` deseni).
 */
import { VARSAYILAN_SES } from '../muhafiz/matrisTipleri';
import type { AnonsYuzeyi } from './ozelAnonsMetinleri';

/** Ses kimliği taşıyan kayıtlar: adım dizili yüzeyler + vakit girince sesleri. */
export type SesYuzeyi = AnonsYuzeyi | 'vakitSesi';

const nesneMi = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null;

/**
 * `bildirimSesi === kimlik` olan her nesne varsayılan sese döner (görünen `sesAdi` düşer).
 * Değişen bir şey yoksa AYNI referansı döndürür (gereksiz disk yazımı olmasın).
 */
export function sesReferansiniKaldir<T>(kayit: T, kimlik: string): T {
    const dolas = (x: unknown): unknown => {
        if (Array.isArray(x)) {
            let degisti = false;
            const yeni = x.map((o) => {
                const d = dolas(o);
                if (d !== o) degisti = true;
                return d;
            });
            return degisti ? yeni : x;
        }
        if (!nesneMi(x)) return x;
        let yeni: Record<string, unknown> | null = null;
        if (x.bildirimSesi === kimlik) {
            yeni = { ...x, bildirimSesi: VARSAYILAN_SES };
            delete yeni.sesAdi;
        }
        for (const [anahtar, deger] of Object.entries(x)) {
            if (anahtar === 'bildirimSesi' || anahtar === 'sesAdi') continue;
            const d = dolas(deger);
            if (d !== deger) {
                yeni ??= { ...x };
                yeni[anahtar] = d;
            }
        }
        return yeni ?? x;
    };
    return dolas(kayit) as T;
}
