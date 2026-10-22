/**
 * Tek beyin: cihaz rolü ya da ev ekranı ayarı değişince TÜM hatırlatmalar yeniden
 * kurulur (ikinci cihaza geçiş → kurulu plan temizlenir; ana cihaza dönüş → kurulur).
 *
 * Yayma TEK listeden geçer (`konumDegistiUygula`, özel gün değişimiyle aynı yol):
 * her planlayıcı kapıyı (`hatirlatmaKurulabilirMi`) kendi İÇİNDE sorar. Konum yoksa
 * planlanacak bir şey de yoktur → atlanır.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { konumDegistiUygula } from './KonumDegisikligiServisi';

export async function hatirlatmaKapisiDegistiUygula(): Promise<boolean> {
    try {
        const ham = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.KONUM_AYARLARI);
        const k = ham ? JSON.parse(ham)?.koordinatlar : null;
        if (!k || typeof k.lat !== 'number' || typeof k.lng !== 'number') {
            Logger.info('CihazRolu', 'Konum yok, yeniden planlama atlandı');
            return false;
        }
        await konumDegistiUygula({ lat: k.lat, lng: k.lng });
        Logger.info('CihazRolu', 'Hatırlatma kapısı değişti, hatırlatmalar yeniden planlandı');
        return true;
    } catch (error) {
        Logger.error('CihazRolu', 'Hatırlatmalar yeniden planlanamadı', error);
        return false;
    }
}
