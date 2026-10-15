/**
 * Namaz modu (issue #277) ekran durumu + Rahatsız Etmeyin erişim rehberi akışı.
 *
 * Erişim deseni pil rehberinin aynısı (`usePilRehberi`): izin İSTENMEZ, sistem
 * ekranı açılır; dönüşte (`AppState` 'active') durum yeniden okunur ve erişim
 * verildiyse kısa bir onay gösterilir — verilmediyse sessiz kalınır.
 * Kaynak native'dir (`NamazModu` SharedPreferences); Redux'a yazılmaz.
 *
 * v0.31.0 iç testi (Samsung): erişim ZATEN verilmişken kullanıcı erişim ekranına
 * gönderildi ve Ayarlar çöktü. Rehber artık yalnız taze okunan durum erişimin
 * gerçekten YOK olduğunu söylerse açılır; erişim varken kural kurulamazsa kısa
 * bir bilgi verilir, Ayarlar'a yönlendirilmez. Native de erişim varken
 * yönlendirmez (`zatenVar`).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import {
    namazModuAyarlariniNormalize,
    VARSAYILAN_NAMAZ_MODU_AYARLARI,
    type NamazModuAyarlari,
} from '../../core/namazModu/namazModuPlani';
import { CamideyimServisi } from '../../domain/services/CamideyimServisi';
import * as kopru from '../../../modules/expo-cami-geofence/src';

export interface NamazModuEkranDurumu {
    kullanilabilir: boolean;
    yuklendi: boolean;
    ayarlar: NamazModuAyarlari;
    durum: kopru.NamazModuDurumu | null;
    rehberGorunur: boolean;
    rehberiAc: () => void;
    rehberiKapat: () => void;
    erisimAyariniAc: () => Promise<void>;
    modAyarlariniAc: () => Promise<void>;
    guncelle: (d: Partial<NamazModuAyarlari>) => Promise<void>;
}

export function useNamazModu(): NamazModuEkranDurumu {
    const kullanilabilir = kopru.camiModuluVarMi();
    const koordinat = useAppSelector((s) => s.konum.koordinatlar);
    // Yalnız değer değişince yeniden kur: koordinat nesnesinin kimliği her
    // render'da değişebilir (seçici yeni nesne döndürürse) → effect döngüsü olmasın.
    const koordinatRef = useRef(koordinat);
    koordinatRef.current = koordinat;
    const [durum, setDurum] = useState<kopru.NamazModuDurumu | null>(null);
    const [ayarlar, setAyarlar] = useState<NamazModuAyarlari>(VARSAYILAN_NAMAZ_MODU_AYARLARI);
    const [yuklendi, setYuklendi] = useState(false);
    const [rehberGorunur, setRehberGorunur] = useState(false);
    const donusBekleniyor = useRef(false);
    const ayarlarRef = useRef(ayarlar);
    ayarlarRef.current = ayarlar;

    const yenile = useCallback(async (): Promise<kopru.NamazModuDurumu | null> => {
        if (!kullanilabilir) {
            setYuklendi(true);
            return null;
        }
        const d = await kopru.namazModuDurumu();
        setDurum(d);
        setAyarlar(namazModuAyarlariniNormalize(d?.ayarlar));
        setYuklendi(true);
        return d;
    }, [kullanilabilir]);

    const yaz = useCallback(
        async (yeni: NamazModuAyarlari) => {
            setAyarlar(yeni);
            const sonuc = await kopru.namazModuAyarlariniYaz(yeni);
            await CamideyimServisi.getInstance().planlariGonder(koordinatRef.current);
            const d = await yenile();
            if (sonuc === 'erisimYok' && d?.erisim !== true) {
                setRehberGorunur(true);
            } else if (yeni.etkin && (sonuc === 'erisimYok' || sonuc === 'hata')) {
                // Erişim var ama telefon modu kurmadı: Ayarlar'a göndermek çözmez.
                kisaBildirimGoster(
                    'Namaz modu bu telefonda şu an kurulamadı. Biraz sonra tekrar deneyin; sürerse Sorun bildir ile bize iletin.',
                    true
                );
            }
        },
        [yenile]
    );

    useEffect(() => {
        yenile().catch(() => setYuklendi(true));
        const abonelik = AppState.addEventListener('change', async (s) => {
            if (s !== 'active') return;
            const beklenen = donusBekleniyor.current;
            donusBekleniyor.current = false;
            const d = await yenile().catch(() => null);
            if (beklenen && d?.erisim) {
                // Erişim verildi: etkin ayar kuralı şimdi kurabilsin.
                if (ayarlarRef.current.etkin) await yaz(ayarlarRef.current).catch(() => undefined);
                kisaBildirimGoster('Namaz modu hazır');
            }
        });
        return () => abonelik.remove();
    }, [yenile, yaz]);

    const erisimAyariniAc = useCallback(async () => {
        setRehberGorunur(false);
        donusBekleniyor.current = true;
        const sonuc = await kopru.erisimAyariniAc();
        if (sonuc === 'zatenVar') {
            // Yönlendirme yapılmadı: erişim zaten var, kuralı şimdi kurmayı dene.
            donusBekleniyor.current = false;
            await yenile().catch(() => null);
            if (ayarlarRef.current.etkin) await yaz(ayarlarRef.current).catch(() => undefined);
            kisaBildirimGoster('Rahatsız Etmeyin erişimi zaten açık.');
            return;
        }
        if (sonuc !== 'acildi') {
            donusBekleniyor.current = false;
            kisaBildirimGoster(
                'Ayar ekranı açılamadı; telefonunuzun Ayarlar > Bildirimler > Rahatsız Etmeyin erişimi bölümünden açabilirsiniz.',
                true
            );
        }
    }, [yenile, yaz]);

    const modAyarlariniAc = useCallback(async () => {
        const acildi = await kopru.modAyarlariniAc();
        if (!acildi) kisaBildirimGoster('Modlar ekranı açılamadı; telefonunuzun Ayarlar > Modlar bölümünden açabilirsiniz.', true);
    }, []);

    return {
        kullanilabilir,
        yuklendi,
        ayarlar,
        durum,
        rehberGorunur,
        rehberiAc: useCallback(() => setRehberGorunur(true), []),
        rehberiKapat: useCallback(() => setRehberGorunur(false), []),
        erisimAyariniAc,
        modAyarlariniAc,
        guncelle: useCallback((d: Partial<NamazModuAyarlari>) => yaz({ ...ayarlarRef.current, ...d }), [yaz]),
    };
}
