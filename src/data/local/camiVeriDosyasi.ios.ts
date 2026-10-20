/**
 * Paketlenmiş cami verisinin (`assets/camiler/tr.bin`, ODbL) ham baytları — iOS.
 *
 * iPhone'da Camideyim'in native modülü yoktur; "Namazda sessiz" rehberi yakındaki
 * camileri saf JS çözücüsüyle (`core/cami/camiVerisi.ts`, Kotlin ikizi) listeler.
 * Metro `bin` uzantısını varlık sayar (`metro.config.js`). Okuma hatası `null` döner
 * ("cami verisi yok" — ekran yine çalışır), asla fırlatmaz.
 */
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

export async function camiVeriBaytlariniOku(): Promise<Uint8Array | null> {
    try {
        const varlik = Asset.fromModule(require('../../../assets/camiler/tr.bin'));
        await varlik.downloadAsync();
        const uri = varlik.localUri ?? varlik.uri;
        if (!uri) return null;
        return new Uint8Array(await new File(uri).arrayBuffer());
    } catch {
        return null;
    }
}
