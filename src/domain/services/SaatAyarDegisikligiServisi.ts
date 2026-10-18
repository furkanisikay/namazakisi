/**
 * Saat iş bölümü ayarı değişince (saat W3) KURULU planların yeniden kurulması.
 *
 * Ayar üç yere dokunur: muhafızın sesli anonsu (telefon "saatte" seçilince TTS
 * planlamaz), sabah/teheccüd uyandırmasının telefon tarafı (saat seçilince yedek
 * gecikir) ve saat yükü (uyandırma listesi + anons yeri). Üçü de konuma bağlı
 * tüketicilerin TEK yayma noktasından (`konumDegistiUygula`) geçer — liste ikinci kez
 * yazılmaz (AGENTS "ikiz liste" dersi; `OzelGunDegisikligiServisi` deseni).
 *
 * STORE'A BAĞLI DEĞİLDİR, asla fırlatmaz.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { konumDegistiUygula } from './KonumDegisikligiServisi';
import { NamazMuhafiziServisi } from './NamazMuhafiziServisi';

async function koordinatiOku(): Promise<{ lat: number; lng: number } | null> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
        if (!ham) return null;
        const k = JSON.parse(ham)?.koordinatlar;
        return k && typeof k.lat === 'number' && typeof k.lng === 'number' ? { lat: k.lat, lng: k.lng } : null;
    } catch (error) {
        Logger.warn('SaatAyarDegisikligi', 'Koordinat okunamadi', error);
        return null;
    }
}

export async function saatAyarlariDegistiUygula(): Promise<void> {
    try {
        // Ön plan muhafızının bellek-içi kapısı (uygulama açıkken anons konuşmasın).
        await NamazMuhafiziServisi.getInstance().saatAyarlariniYukle();
    } catch (error) {
        Logger.error('SaatAyarDegisikligi', 'On plan muhafiz saat ayari tazelenemedi', error);
    }
    const koordinatlar = await koordinatiOku();
    if (!koordinatlar) {
        Logger.info('SaatAyarDegisikligi', 'Konum yok, yeniden planlama atlandi');
        return;
    }
    try {
        await konumDegistiUygula(koordinatlar);
    } catch (error) {
        Logger.error('SaatAyarDegisikligi', 'Hatirlatmalar yeniden planlanamadi', error);
    }
}
