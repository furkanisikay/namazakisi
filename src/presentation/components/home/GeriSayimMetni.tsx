/**
 * Ana ekran geri sayımı (denetim D-03).
 *
 * Eskiden kalan süre `AnaSayfa`'nın durumuydu ve her saniye BÜTÜN ana ekranı (92 günlük
 * pager, akış, modallar) yeniden çiziyordu; kullanıcı Kıble/Ayarlar sekmesindeyken de
 * (sekmeler mount kalır). Artık saniyelik iş yalnız bu küçük metinde yaşar:
 *
 *  - hedef ANI prop olarak alır (ISO dize — değerce karşılaştırılır, `React.memo` kırılmaz),
 *  - kendi zamanlayıcısını kurar; tetik gösterilen saniyenin değişeceği ana hizalıdır,
 *  - ekran görünmezken (gezinme odağı yok ya da uygulama arka planda — `useEkranCanli`)
 *    DURUR; görünür olunca hemen doğru değere atlar,
 *  - sıfıra inince bir kez `onBitti` çağırır (ana ekran vakit bilgisini tazeler).
 *
 * Biçim eskisiyle birebir: `SS:DD:ss`, geçmiş hedefte `00:00:00`.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useEkranCanli } from '../hareket/dongu';
import { BirimliSure } from '../common/BirimliSure';

const iki = (n: number) => n.toString().padStart(2, '0');

/** Kalan süre metni (`SS:DD:ss`). Hedef yoksa ya da geçtiyse `00:00:00`. Saf. */
export function kalanSureMetni(hedefMs: number | null, simdiMs: number): string {
    if (hedefMs === null || !Number.isFinite(hedefMs)) return '00:00:00';
    const fark = Math.max(0, hedefMs - simdiMs);
    const saat = Math.floor(fark / 3_600_000);
    const dakika = Math.floor((fark % 3_600_000) / 60_000);
    const saniye = Math.floor((fark % 60_000) / 1000);
    return `${iki(saat)}:${iki(dakika)}:${iki(saniye)}`;
}

/** ISO dizesini ms'ye çevirir; boş/bozuk dize `null`. */
export function hedefMsCoz(iso: string | null | undefined): number | null {
    if (!iso) return null;
    const ms = Date.parse(iso);
    return Number.isFinite(ms) ? ms : null;
}

/**
 * Saniyede bir tazelenen kalan süre metni. Yalnız BU hook'u kullanan bileşen çizilir.
 * Ekran görünmezken zamanlayıcı kurulmaz; `onBitti` hedef başına en fazla bir kez.
 */
export function useKalanSure(hedefMs: number | null, onBitti?: () => void): string {
    const canli = useEkranCanli();
    const [metin, setMetin] = useState(() => kalanSureMetni(hedefMs, Date.now()));
    const onBittiRef = useRef(onBitti);
    onBittiRef.current = onBitti;

    useEffect(() => {
        const guncelle = () => {
            const yeni = kalanSureMetni(hedefMs, Date.now());
            setMetin((eski) => (eski === yeni ? eski : yeni));
        };
        guncelle();
        if (!canli || hedefMs === null) return;

        let zamanlayici: ReturnType<typeof setTimeout> | null = null;
        const planla = () => {
            const kalan = hedefMs - Date.now();
            if (kalan <= 0) {
                onBittiRef.current?.();
                return;
            }
            // Gösterilen saniye `floor(kalan / 1000)`; bir sonraki değişim `kalan % 1000` ms sonra.
            zamanlayici = setTimeout(() => {
                guncelle();
                planla();
            }, (kalan % 1000) + 5);
        };
        planla();
        return () => {
            if (zamanlayici) clearTimeout(zamanlayici);
        };
    }, [hedefMs, canli]);

    return metin;
}

interface GeriSayimMetniProps extends Omit<TextProps, 'children'> {
    /** Sayılan an (ISO). Boş/bozuksa `00:00:00`. */
    hedefIso: string | null | undefined;
    /** Sayaç sıfıra inince bir kez (ekran görünürken). */
    onBitti?: () => void;
}

/** Sabit genişlikli rakam: saniye değişince metin titremesin (Doğu Arap rakamları dahil). */
const SABIT_RAKAM: TextStyle = { fontVariant: ['tabular-nums'] };

const GeriSayimMetniBileseni: React.FC<GeriSayimMetniProps> = ({ hedefIso, onBitti, style, ...metinProplari }) => {
    const hedefMs = useMemo(() => hedefMsCoz(hedefIso), [hedefIso]);
    const metin = useKalanSure(hedefMs, onBitti);
    return (
        <Text {...metinProplari} style={[SABIT_RAKAM, style]}>
            {metin}
        </Text>
    );
};

export const GeriSayimMetni = React.memo(GeriSayimMetniBileseni);

type BirimliSureProplari = React.ComponentProps<typeof BirimliSure>;

interface GeriSayimBirimliProps extends Omit<BirimliSureProplari, 'sure'> {
    /** Sayılan an (ISO). Boş/bozuksa `00:00:00`. */
    hedefIso: string | null | undefined;
    /** Sayaç sıfıra inince bir kez (ekran görünürken). */
    onBitti?: () => void;
}

/**
 * Birimli görünüm ("1 sa 09 dk 09 sn") + kendi saniyelik sayacı. Saniyede bir YALNIZ bu
 * bileşen çizilir; çağıran kart (VakitKarti) yeniden çizilmez (denetim D-03).
 */
const GeriSayimBirimliBileseni: React.FC<GeriSayimBirimliProps> = ({ hedefIso, onBitti, ...birimliProplar }) => {
    const hedefMs = useMemo(() => hedefMsCoz(hedefIso), [hedefIso]);
    const sure = useKalanSure(hedefMs, onBitti);
    return <BirimliSure sure={sure} {...birimliProplar} />;
};

export const GeriSayimBirimli = React.memo(GeriSayimBirimliBileseni);
