import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';

/**
 * Vakit Bildirim Ayarları
 * Hangi vakitlerde bildirim istendiğini tutar
 */
export interface VakitBildirimAyarlari {
    imsak: boolean;
    ogle: boolean;
    ikindi: boolean;
    aksam: boolean;
    yatsi: boolean;
}

const VARSAYILAN_AYARLAR: VakitBildirimAyarlari = {
    imsak: false,
    ogle: false,
    ikindi: false,
    aksam: false,
    yatsi: false,
};

export const LocalVakitBildirimServisi = {
    /**
     * Kayıtlı ayarları getirir
     */
    getAyarlar: async (): Promise<VakitBildirimAyarlari> => {
        try {
            const jsonValue = await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI);
            if (jsonValue != null) {
                const kayitliAyarlar = JSON.parse(jsonValue);
                // Eksik alan varsa varsayılanla birleştir (Migration gibi)
                return { ...VARSAYILAN_AYARLAR, ...kayitliAyarlar };
            }
            return VARSAYILAN_AYARLAR;
        } catch (e) {
            Logger.error('LocalVakitBildirimServisi', 'Vakit bildirim ayarları okunamadı:', e);
            return VARSAYILAN_AYARLAR;
        }
    },

    /**
     * Ayarları kaydeder
     */
    saveAyarlar: async (ayarlar: VakitBildirimAyarlari): Promise<boolean> => {
        try {
            const jsonValue = JSON.stringify(ayarlar);
            await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_AYARLARI, jsonValue);
            return true;
        } catch (e) {
            Logger.error('LocalVakitBildirimServisi', 'Vakit bildirim ayarları kaydedilemedi:', e);
            return false;
        }
    },

    /**
     * Tek bir vakit ayarını günceller
     */
    updateVakitAyar: async (vakit: keyof VakitBildirimAyarlari, aktif: boolean): Promise<VakitBildirimAyarlari | null> => {
        try {
            const mevcutAyarlar = await LocalVakitBildirimServisi.getAyarlar();
            const yeniAyarlar = { ...mevcutAyarlar, [vakit]: aktif };
            await LocalVakitBildirimServisi.saveAyarlar(yeniAyarlar);
            return yeniAyarlar;
        } catch (e) {
            Logger.error('LocalVakitBildirimServisi', 'Vakit ayarı güncellenemedi:', e);
            return null;
        }
    }
};
