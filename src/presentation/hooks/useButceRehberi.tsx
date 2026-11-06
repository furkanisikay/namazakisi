/**
 * Bildirim sınırı REHBERİ akışı (issue #298) — sayfa + uygula + geri al.
 *
 * Ekranlar yalnız iki şey verir: değişikliği NASIL yazacakları (`yaz`) ve
 * uygulamadan önceki durumu nasıl geri yükleyecekleri (`yedekAl`/`geriYukle`
 * = Fable'ın `butceYedegi`'si). Akış:
 *
 *   - `karttanAc()` → ayrıntı sayfası (sayı, kaynak dökümü, öneriler).
 *   - `degisikligiDene(sonra, { once })` → EKLEME ANINDA SİMÜLASYON. Sığarsa
 *     `true` döner (çağıran yazar); sığmazsa değişiklik YAZILMAZ, "Bu
 *     hatırlatma sığmıyor" sayfası açılır ve `false` döner. Sayfadaki öneriler
 *     BEKLEYEN değişiklik dahil ölçülür; bir öneri değişikliği sığdırınca
 *     ikisi birlikte yazılır, sığdırmazsa sayfa güncellenip açık kalır.
 *   - Her uygulamadan sonra "GERİ AL" şeridi çıkar.
 */
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import {
    defterOzetiHesapla,
    type DefterGirdisi,
} from '../../core/bildirim/bildirimDefteri';
import { degisiklikSimuleEt, type ButceOnerisi } from '../../core/bildirim/butceOnerileri';
import type { BildirimButcesi, DefterDegisikligi } from './useBildirimButcesi';
import { BildirimSiniriSayfasi } from '../components/bildirim/BildirimSiniriSayfasi';
import { GeriAlBildirimi } from '../components/bildirim/GeriAlBildirimi';
import { metin, sayili } from '../../core/dil/aktifDil';

export interface RehberYazicilari<Y> {
    /** Hedef girdideki değişikliği kaydet (yalnız değişen alanlar). */
    yaz: (hedef: DefterGirdisi) => void;
    /** Uygulamadan önceki durum (`butceYedegi`). */
    yedekAl: () => Y;
    geriYukle: (yedek: Y) => void;
}

export interface RehberSecenekleri {
    /** Bu ekranda uygulanabilen öneriler (ör. nafile ekranında yalnız nafile önerisi). */
    oneriFiltresi?: (o: ButceOnerisi) => boolean;
    /** Filtrelenen öneriler varken gösterilecek yönlendirme (ör. muhafız ayarları). */
    ekYol?: { etiket: string; onPress: () => void };
}

type Sayfa =
    | null
    | { tur: 'ayrinti' }
    | { tur: 'ekleme'; baslik: string; once: DefterGirdisi; sonra: DefterGirdisi };

export interface ButceRehberi {
    karttanAc: () => void;
    degisikligiDene: (sonra: DefterDegisikligi, secenek?: { once?: DefterDegisikligi; baslik?: string }) => boolean;
    /** Ekrana konacak sayfa + geri al şeridi. */
    ogeler: React.ReactNode;
}

export function useButceRehberi<Y>(
    butce: BildirimButcesi,
    yazicilar: RehberYazicilari<Y>,
    secenekler: RehberSecenekleri = {}
): ButceRehberi {
    const [sayfa, setSayfa] = useState<Sayfa>(null);
    const [geriAl, setGeriAl] = useState<{ yedek: Y; metin: string } | null>(null);
    const { oneriFiltresi, ekYol } = secenekler;

    const karttanAc = useCallback(() => setSayfa({ tur: 'ayrinti' }), []);
    const kapat = useCallback(() => setSayfa(null), []);
    const geriAlKapat = useCallback(() => setGeriAl(null), []);

    const degisikligiDene = useCallback(
        (sonra: DefterDegisikligi, secenek?: { once?: DefterDegisikligi; baslik?: string }) => {
            const onceGirdi = secenek?.once ? butce.girdiyiKur(secenek.once) : butce.girdi;
            const sonraGirdi = butce.girdiyiKur(sonra);
            // Defter hazır değilse (ilk okuma sürüyor) ENGELLEMEYİZ: yanlış alarm,
            // hiç uyarmamaktan kötüdür; teslimciler zaten kendi bütçelerini uygular.
            if (!onceGirdi || !sonraGirdi) return true;
            if (degisiklikSimuleEt(onceGirdi, sonraGirdi).sigar) return true;
            setSayfa({
                tur: 'ekleme',
                baslik: secenek?.baslik ?? metin().muhafizAyar.kanca.sigmiyor,
                once: onceGirdi,
                sonra: sonraGirdi,
            });
            return false;
        },
        [butce]
    );

    const tumOneriler = useMemo(() => {
        if (!sayfa) return [];
        return butce.onerileriHesapla(sayfa.tur === 'ekleme' ? sayfa.sonra : null);
    }, [sayfa, butce]);
    const oneriler = useMemo(
        () => (oneriFiltresi ? tumOneriler.filter(oneriFiltresi) : tumOneriler),
        [tumOneriler, oneriFiltresi]
    );
    const ekYolGerekli = !!ekYol && oneriler.length < tumOneriler.length;

    const uygula = useCallback(
        (o: ButceOnerisi) => {
            if (!sayfa) return;
            if (sayfa.tur === 'ekleme') {
                if (!degisiklikSimuleEt(sayfa.once, o.girdi).sigar) {
                    // Henüz sığmıyor: hiçbir şey YAZILMAZ, sayfa yeni durumla açık kalır.
                    setSayfa({ ...sayfa, sonra: o.girdi });
                    return;
                }
                const yedek = yazicilar.yedekAl();
                yazicilar.yaz(o.girdi);
                setSayfa(null);
                setGeriAl({
                    yedek,
                    metin: sayili(metin().muhafizAyar.kanca.yerAcildi, defterOzetiHesapla(o.girdi).toplam),
                });
                return;
            }
            const yedek = yazicilar.yedekAl();
            yazicilar.yaz(o.girdi);
            setSayfa(null);
            setGeriAl({ yedek, metin: sayili(metin().muhafizAyar.kanca.oneriUygulandi, o.sonrakiToplam, { baslik: o.baslik }) });
        },
        [sayfa, yazicilar]
    );

    const geriAlUygula = useCallback(() => {
        if (geriAl) yazicilar.geriYukle(geriAl.yedek);
        setGeriAl(null);
    }, [geriAl, yazicilar]);

    const ogeler = (
        <>
            {sayfa && butce.ozet && (
                <BildirimSiniriSayfasi
                    gorunur
                    mod={
                        sayfa.tur === 'ekleme'
                            ? { tur: 'ekleme', baslik: sayfa.baslik, sonraki: defterOzetiHesapla(sayfa.sonra) }
                            : { tur: 'ayrinti' }
                    }
                    ozet={sayfa.tur === 'ekleme' ? defterOzetiHesapla(sayfa.once) : butce.ozet}
                    oneriler={oneriler}
                    ekYol={ekYolGerekli ? ekYol : undefined}
                    onUygula={uygula}
                    onKapat={kapat}
                />
            )}
            <GeriAlBildirimi metin={geriAl?.metin ?? null} onGeriAl={geriAlUygula} onKapat={geriAlKapat} />
        </>
    );

    return { karttanAc, degisikligiDene, ogeler };
}
