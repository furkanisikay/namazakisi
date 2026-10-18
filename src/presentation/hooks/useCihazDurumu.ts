/**
 * Cihaz/sistem durumu — ekranın İHTİYAÇ DUYDUĞU alanlar okunur, uygulamaya dönüşte
 * (`AppState` 'active': kullanıcı izin ekranından döndü) tazelenir.
 *
 * Kullanım:
 *   const { durum } = useCihazDurumu(['canliGuncelleme', 'samsung']);
 *   const not = durumNotu('canliGuncelleme', durum); // null → hiçbir şey çizme
 *
 * Alan okunana kadar `null` (bilinmiyor) → ekran susar; yanlış bir an bile uyarı
 * çizmez. Okuyucular tembel yüklenir (`CihazDurumOkuyucu`) — bu kancayı kullanan
 * ekranın testi native köprüleri ayrıca mock'lamak zorunda kalmaz.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { BOS_CIHAZ_DURUMU, type CihazDurumu } from '../../core/cihaz/durumNotlari';
import { cihazDurumunuOku, surumuOku, type CihazAlani } from '../../domain/services/CihazDurumOkuyucu';

export interface CihazDurumuSonucu {
    durum: CihazDurumu;
    /** Elle tazele (ör. izin isteğinden hemen sonra). */
    yenile: () => Promise<CihazDurumu>;
}

/**
 * @param alanlar Ekranın İHTİYAÇ DUYDUĞU alanlar — ZORUNLU ve modül düzeyinde sabit bir
 *   dizi olmalı (`const ALANLAR = ['samsung'] as const`). Hepsini okumak (`TUM_CIHAZ_ALANLARI`)
 *   konum/takvim/bildirim/alarm köprülerinin tamamını uyandırır; yalnız tanı ekranı gibi
 *   gerçekten hepsine bakan yer kullanmalı.
 * @param etkin false iken hiç okunmaz (ör. iOS'ta Android'e özgü alan).
 */
export function useCihazDurumu(alanlar: readonly CihazAlani[], etkin = true): CihazDurumuSonucu {
    // Sürüm senkron: ilk çizimde bilinir (sürüme bağlı metin titremesin).
    const [durum, setDurum] = useState<CihazDurumu>(() => ({ ...BOS_CIHAZ_DURUMU, surum: surumuOku() }));
    const anahtar = alanlar.join(',');
    const bagli = useRef(true);
    const sonDurum = useRef(durum);

    const yenile = useCallback(async () => {
        const istenen = anahtar ? (anahtar.split(',') as CihazAlani[]) : [];
        const yeni = await cihazDurumunuOku(istenen);
        // Değer değişmediyse setState HİÇ çağrılmaz → gereksiz çizim (ve testte act gürültüsü) yok.
        if (!bagli.current) return yeni;
        const ek = secilenler(yeni, istenen);
        const onceki = sonDurum.current;
        if (istenen.some((a) => JSON.stringify(onceki[a]) !== JSON.stringify(ek[a]))) {
            sonDurum.current = { ...onceki, ...ek };
            setDurum(sonDurum.current);
        }
        return yeni;
    }, [anahtar]);

    useEffect(() => {
        bagli.current = true;
        if (!etkin) return () => { bagli.current = false; };
        void yenile();
        let abonelik: { remove(): void } | undefined;
        try {
            abonelik = AppState.addEventListener('change', (d) => {
                if (d === 'active') void yenile();
            });
        } catch {
            // AppState'siz ortam (dar test mock'u): yalnız ilk okuma.
        }
        return () => {
            bagli.current = false;
            abonelik?.remove();
        };
    }, [yenile, etkin]);

    return useMemo(() => ({ durum, yenile }), [durum, yenile]);
}

function secilenler(d: CihazDurumu, alanlar: readonly CihazAlani[]): Partial<CihazDurumu> {
    const sonuc: Partial<CihazDurumu> = {};
    for (const a of alanlar) (sonuc as Record<string, unknown>)[a] = d[a];
    return sonuc;
}
