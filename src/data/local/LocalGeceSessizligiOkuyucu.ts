/**
 * Gece sessizliği ayarının HAM depolamadan, store'suz okunması.
 *
 * Ayar muhafız kaydının (`MUHAFIZ_AYARLARI`) içindeki opsiyonel `geceSessizligi`
 * alanıdır — yedekleme bu anahtarı zaten taşır, yeni anahtar açılmadı. Yazıcı
 * `muhafizSlice`'tır. Arka plan görevinde Redux yoktur; muhafız servisleri ve saat
 * senkronu bu okuyucudan geçer (ekran store'dan okur — iki taraf aynı alanı görür).
 *
 * ASLA fırlatmaz: okunamazsa `undefined` (= kapalı; hatırlatmalar eskisi gibi gelir —
 * bozuk kayıt kullanıcıyı sessizce susturmamalı).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { geceSessizliginiNormalize, type GeceSessizligi } from '../../core/muhafiz/geceSessizligi';

export async function geceSessizliginiOku(): Promise<GeceSessizligi | undefined> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI);
        if (!ham) return undefined;
        return geceSessizliginiNormalize((JSON.parse(ham) as { geceSessizligi?: unknown } | null)?.geceSessizligi);
    } catch (error) {
        Logger.warn('GeceSessizligiOkuyucu', 'Gece sessizliği okunamadı, kapalı sayılıyor', error);
        return undefined;
    }
}
