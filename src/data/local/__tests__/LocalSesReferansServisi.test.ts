import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalSesReferansServisi } from '../LocalSesReferansServisi';
import { DEPOLAMA_ANAHTARLARI } from '../../../core/constants/UygulamaSabitleri';

const DOSYA = 'dosya:kullanici_ses_0123abcd.caf';
const oku = async (anahtar: string) => JSON.parse((await AsyncStorage.getItem(anahtar)) ?? 'null');

describe('LocalSesReferansServisi.varsayilanaDondur', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('silinen dosyayı kullanan HER kayıt (muhafız + yedek, nafile, ek yüzeyler, vakit sesi) varsayılana döner', async () => {
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI,
            JSON.stringify({
                matris: { imsak: { seviyeler: [{ bildirimSesi: DOSYA, sesAdi: 'Ezan' }] } },
                ozelMatrisYedegi: { ogle: { seviyeler: [{ bildirimSesi: DOSYA }] } },
            })
        );
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI,
            JSON.stringify({ teheccud: { adimlar: [{ bildirimSesi: DOSYA }] } })
        );
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI,
            JSON.stringify({ aktif: true, adimlar: [{ bildirimSesi: DOSYA, sesAdi: 'Ezan' }] })
        );
        // Başka ses kullanan yüzey DEĞİŞMEZ.
        const takvim = JSON.stringify({ aktif: true, adimlar: [{ bildirimSesi: 'paket:zil' }] });
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI, takvim);
        await AsyncStorage.setItem(
            DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_SESLERI,
            JSON.stringify({ imsak: { bildirimSesi: DOSYA, sesAdi: 'Ezan' }, ogle: { bildirimSesi: 'paket:sabah' } })
        );

        const degisen = await LocalSesReferansServisi.varsayilanaDondur(DOSYA);

        expect([...degisen].sort()).toEqual(['cuma', 'muhafiz', 'nafile', 'vakitSesi']);
        expect(await oku(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI)).toEqual({
            matris: { imsak: { seviyeler: [{ bildirimSesi: 'varsayilan' }] } },
            ozelMatrisYedegi: { ogle: { seviyeler: [{ bildirimSesi: 'varsayilan' }] } },
        });
        expect((await oku(DEPOLAMA_ANAHTARLARI.NAFILE_AYARLARI)).teheccud.adimlar[0].bildirimSesi).toBe('varsayilan');
        expect((await oku(DEPOLAMA_ANAHTARLARI.CUMA_HATIRLATMA_AYARLARI)).adimlar[0]).toEqual({ bildirimSesi: 'varsayilan' });
        expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.TAKVIM_CAKISMA_AYARLARI)).toBe(takvim);
        // Vakit sesi: varsayılan = kayıt YOK.
        expect(await oku(DEPOLAMA_ANAHTARLARI.VAKIT_BILDIRIM_SESLERI)).toEqual({ ogle: { bildirimSesi: 'paket:sabah' } });
    });

    it('bozuk ya da boş kayda DOKUNMAZ; referans yoksa hiçbir şey yazılmaz', async () => {
        await AsyncStorage.setItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI, '{bozuk');
        await expect(LocalSesReferansServisi.varsayilanaDondur(DOSYA)).resolves.toEqual([]);
        expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.YATIS_HATIRLATMA_AYARLARI)).toBe('{bozuk');
        expect(await AsyncStorage.getItem(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI)).toBeNull();
    });
});
