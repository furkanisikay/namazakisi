/**
 * TEK RIZA'nın ekran kapısı (sade tasarım, Dalga 3).
 *
 * `genel` = ortak kayıt (`hatirlatmaRiza`) VEYA herhangi bir yüzeyin eski kaydı
 * (muhafız, nafile, cuma, camiye gitme, yatış, takvim). Birinde verilen onay hepsinde
 * geçerlidir → kullanıcı aynı açıklamayı ikinci kez görmez.
 *
 * `ver(riza)` YALNIZ onay modalı/bilgi maddesi ekranda gösterildikten sonra çağrılır
 * (rıza uydurulamaz). Yeni onay ortak kayda yazılır; yüzeyin kendi alanına yazılmaz.
 *
 * Dilim yoksa (eski ekran test mağazası) yalnız yüzey kayıtlarından türetir.
 * `genel` her çizimde yeni nesne olsa da alanları değişmedikçe `useMemo` aynı kalır.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hatirlatmaRizalariniYukle, hatirlatmaRizasiVer } from '../store/hatirlatmaRizaSlice';
import { genelRizayiTuret, type GenelRiza, type HatirlatmaRizalari, type YuzeyRizaKaydi } from '../../core/hatirlatma/rizalar';

type Kaynak = {
    hatirlatmaRiza?: { kayit?: HatirlatmaRizalari; yuklendi?: boolean };
    muhafiz?: YuzeyRizaKaydi;
    nafile?: { ayarlar?: YuzeyRizaKaydi };
    cumaHatirlatma?: { ayarlar?: YuzeyRizaKaydi };
    camiyeGit?: { ayarlar?: YuzeyRizaKaydi };
    yatisHatirlatma?: { ayarlar?: YuzeyRizaKaydi };
    takvimCakisma?: { ayarlar?: YuzeyRizaKaydi };
};

/** Saf seçici (testler ve ekran dışı okuma için). */
export function genelRizaSec(s: Kaynak): GenelRiza {
    return genelRizayiTuret(s.hatirlatmaRiza?.kayit, [
        s.muhafiz,
        s.nafile?.ayarlar,
        s.cumaHatirlatma?.ayarlar,
        s.camiyeGit?.ayarlar,
        s.yatisHatirlatma?.ayarlar,
        s.takvimCakisma?.ayarlar,
    ]);
}

export interface GenelRizaKapisi extends GenelRiza {
    /** Onay modalında verilen rızayı ortak kayda yazar (yalnız `true` alanlar). */
    ver: (riza: { sesliOnayi?: boolean; alarmOnayi?: boolean } | undefined) => void;
}

export function useGenelRiza(): GenelRizaKapisi {
    const dispatch = useAppDispatch();
    // `useAppSelector` (doğrudan react-redux değil): ekran testleri store/hooks'u mock'lar.
    const genel = useAppSelector((s) => genelRizaSec(s as unknown as Kaynak), shallowEqual);
    const dilimVar = useAppSelector((s) => (s as unknown as Kaynak).hatirlatmaRiza !== undefined);

    useEffect(() => {
        if (dilimVar) void dispatch(hatirlatmaRizalariniYukle());
    }, [dilimVar, dispatch]);

    const ver = useCallback(
        (riza: { sesliOnayi?: boolean; alarmOnayi?: boolean } | undefined) => {
            if (!riza || (riza.sesliOnayi !== true && riza.alarmOnayi !== true)) return;
            void dispatch(hatirlatmaRizasiVer(riza));
        },
        [dispatch]
    );

    return useMemo(() => ({ sesli: genel.sesli, alarm: genel.alarm, ver }), [genel.sesli, genel.alarm, ver]);
}
