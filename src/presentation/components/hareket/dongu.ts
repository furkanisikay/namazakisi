/**
 * Görsel anlatı döngüleri — sahip kararı (2026-10-19): tanıtım, sihirbaz ve boş durum
 * ekranlarında sahne EKRAN GÖRÜNÜRKEN yumuşak bir döngüyle oynar; ayar listelerinde
 * yalnız girişte BİR KEZ oynar. Döngünün tek kapısı burada:
 *
 *  - ekran odakta (gezinme `focus`/`blur`; gezinme bağlamı yoksa odakta sayılır),
 *  - uygulama ön planda (`AppState`; arka planda/kilitliyken durur),
 *  - "Animasyonları azalt" kapalı.
 *
 * Biri düşünce döngü `.stop()` edilir ve sahne DİNLENME POZUNA (son kare) döner —
 * sahneler dinlenme pozu anlamlı olacak biçimde kurulur (ölçek 1, açı 0°), böylece
 * azaltılmış harekette de resim eksiksiz görünür. Yalnız transform/opaklık, native driver.
 */
import * as React from 'react';
import { Animated, AppState, type AppStateStatus } from 'react-native';
import * as Gezinme from '@react-navigation/native';
import { useHareketAzalt } from '../../hooks/useHareketAzalt';

type OdakKaynagi = { isFocused?: () => boolean; addListener?: (olay: 'focus' | 'blur', cb: () => void) => () => void };

/** Gezinme bağlamı yoksa (test, gezinme dışı ağaç) boş bağlam — `useContext` fırlatmasın. */
const BOS_BAGLAM = React.createContext<OdakKaynagi | undefined>(undefined);

function onPlandaMi(durum: AppStateStatus | null | undefined): boolean {
    return durum !== 'background' && durum !== 'inactive';
}

/** Döngü şu an oynayabilir mi? (odak + ön plan + hareket azaltılmamış) */
export function useDonguAcik(): boolean {
    const azalt = useHareketAzalt();
    const baglam = (Gezinme as { NavigationContext?: React.Context<OdakKaynagi | undefined> }).NavigationContext ?? BOS_BAGLAM;
    const gezinme = React.useContext(baglam);
    const [odak, setOdak] = React.useState<boolean>(() => gezinme?.isFocused?.() ?? true);
    const [onPlan, setOnPlan] = React.useState<boolean>(() => onPlandaMi(AppState.currentState));

    React.useEffect(() => {
        if (!gezinme?.addListener) return;
        setOdak(gezinme.isFocused?.() ?? true);
        const odaklandi = gezinme.addListener('focus', () => setOdak(true));
        const ayrildi = gezinme.addListener('blur', () => setOdak(false));
        return () => {
            odaklandi?.();
            ayrildi?.();
        };
    }, [gezinme]);

    React.useEffect(() => {
        const abonelik = AppState.addEventListener?.('change', (d) => setOnPlan(onPlandaMi(d)));
        return () => abonelik?.remove?.();
    }, []);

    return !azalt && odak && onPlan;
}

/**
 * `acik` iken `kur()`'un döndürdüğü sahneyi sonsuz döngüde oynatır; kapanınca ya da
 * unmount'ta durdurur ve `dinlen()` ile dinlenme pozuna döndürür. `anahtar` değişince
 * (ör. seçilen düzey, ölçülen genişlik) sahne baştan kurulur.
 */
export function useDonguAnimasyonu(
    acik: boolean,
    kur: () => Animated.CompositeAnimation | null,
    dinlen: () => void,
    anahtar?: unknown,
): void {
    const kurRef = React.useRef(kur);
    const dinlenRef = React.useRef(dinlen);
    kurRef.current = kur;
    dinlenRef.current = dinlen;
    React.useEffect(() => {
        if (!acik) {
            dinlenRef.current();
            return;
        }
        const sahne = kurRef.current();
        if (!sahne) return;
        const dongu = Animated.loop(sahne);
        dongu.start();
        return () => {
            dongu.stop();
            dinlenRef.current();
        };
    }, [acik, anahtar]);
}
