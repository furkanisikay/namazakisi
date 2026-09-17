/**
 * Adim notlari — Faz 0 (Faz 3'te ortak bilesen katmanina tasindi).
 *
 * Iki sessiz sapmayi gorunur kilar:
 *   1. Adimin esigi pencerenin BUGUNKU uzunluguna sigmiyor -> o adim bugun hic
 *      calismaz (yazin yatsi ~6 saat, kisin ~11 saat; sabit tavan bunu gizliyordu).
 *   2. Plan butcesi sikligi seyreltti -> kullanicinin sectigi "her 1 dk" yerine
 *      daha genis araliklarla uyarilir.
 *
 * Faz 0'in kendi ilkesi: sessiz sapma birakilmaz.
 */
import * as React from 'react';
import { View, Text } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { SeviyeAyari } from '../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import { VARSAYILAN_PENCERE_YONU } from '../../../core/muhafiz/pencereTipleri';
import { seviyeAcikMi } from '../../../core/muhafiz/seviyeAcKapa';
import { sesliAnonsGerekliMi } from '../../../core/muhafiz/motorAdaptoru';
import { adimPencereyeSigarMi, pencereSuresiMetni } from '../../../core/muhafiz/pencereUzunlugu';
import {
    cikisSegmentiHesapla,
    girisSegmentiHesapla,
    etkinSiklikHesapla,
} from '../../../core/muhafiz/planButcesi';
import {
    ANDROID_YETENEKLERI,
    type PlatformYetenekleri,
} from '../../../core/muhafiz/ios/platformYetenekleri';

export interface AdimNotu {
    tip: 'uyari' | 'bilgi';
    metin: string;
}

export interface AdimNotlariProps {
    /** `adimNotlariniOlustur` ciktisi — cagiran ayni listeyi erisim etiketinde de kullanir. */
    notlar: AdimNotu[];
}

export interface AdimNotuSecenekleri {
    /** Cumle icinde gecen kucuk harfli pencere adi ("yatsı"). */
    pencereAdi: string;
    pencereUzunluguDk?: number;
    yon?: PencereYonu;
    /**
     * Platform yetenekleri — SESSIZ SAPMA BIRAKMA kurali.
     *
     * iOS'ta bazi hucreler kullanicinin kurdugu gibi calismaz (sesli anons
     * on-kayitli klibe duser, acil adim cihazin sessizligini DELEMEZ). Bu
     * ekranda SOYLENMEZSE kullanici "kurdum ama calismiyor" yasar. Verilmezse
     * Android varsayilir → mevcut ciktilar birebir korunur.
     */
    yetenekler?: PlatformYetenekleri;
}

/**
 * Gosterilecek notlari uretir (SAF — test edilebilir).
 *
 * Kapali adimda not YOK: kapali adim zaten hic calismaz, "bugun calismayacak"
 * demek gurultu olurdu.
 *
 * SEGMENT HESABI YONE GORE: butce, seviyenin GERCEKTEN kazandigi araliktan
 * turer ve bu aralik iki yonde farkli hesaplanir (`planButcesi`). Yon
 * gecilmezse cikis segmenti kullanilir — motorla ayni varsayilan.
 */
export function adimNotlariniOlustur(
    seviye: SeviyeAyari,
    seviyeler: SeviyeAyari[],
    secenekler: AdimNotuSecenekleri
): AdimNotu[] {
    if (!seviyeAcikMi(seviye)) return [];

    const { pencereAdi, pencereUzunluguDk } = secenekler;
    const yon = secenekler.yon ?? VARSAYILAN_PENCERE_YONU;

    if (!adimPencereyeSigarMi(seviye.esikDk, pencereUzunluguDk)) {
        return [
            {
                tip: 'uyari',
                metin: `Bu adım bugün çalışmayacak — ${pencereAdi} bugün ${pencereSuresiMetni(
                    pencereUzunluguDk as number
                )}`,
            },
        ];
    }

    const notlar: AdimNotu[] = [];
    const yetenekler = secenekler.yetenekler ?? ANDROID_YETENEKLERI;

    // PLATFORM NOTLARI — kullanicinin kurdugu sey ile cihazda olacak sey
    // ayrisiyorsa BURADA soylenir (sessiz sapma birakma).
    // iPhone'da anons BILDIRIM SESIDIR (Android'deki gibi alarm sesi degil) →
    // sessiz anahtari acikken duyulmaz. Kullanici bunu kurarken bilmeli.
    if (
        yetenekler.platform === 'ios' &&
        !yetenekler.sessizligiDelebilir &&
        sesliAnonsGerekliMi(seviye.kanallar)
    ) {
        notlar.push({
            tip: 'bilgi',
            metin: 'iPhone’da sesli anons bildirim sesi olarak çalar; sessiz moddayken duyulmaz',
        });
    }
    if (!yetenekler.sessizligiDelebilir && seviye.acilKanal === true) {
        notlar.push({
            tip: 'uyari',
            metin: 'Bu adım iPhone’da sessiz moddayken duyulmaz; bildirim olarak gelir',
        });
    }

    const siklik = seviye.siklik;
    const segment =
        yon === 'girisindenItibaren'
            ? girisSegmentiHesapla(seviyeler, seviye, pencereUzunluguDk)
            : cikisSegmentiHesapla(seviyeler, seviye);
    const etkin = etkinSiklikHesapla(segment, siklik);
    if (etkin !== siklik && etkin !== 'birkez') {
        notlar.push({
            tip: 'bilgi',
            metin: `Çok sık uyarmamak için ${etkin.herDk} dakikada bir hatırlatılır`,
        });
    }

    return notlar;
}

/**
 * Not satirlari. Ikon DEKORATIF; govde metni daima tema token'i ile cizilir
 * (AGENTS.md kontrast tuzagi: `durum.uyari` = #FFC107 sari-amber, metin rengi
 * olarak kullanilmaz).
 */
export const AdimNotlari: React.FC<AdimNotlariProps> = ({ notlar }) => {
    const renkler = useRenkler();
    if (notlar.length === 0) return null;

    return (
        <>
            {notlar.map((not) => (
                <View key={not.metin} className="flex-row items-start mt-1.5">
                    <FontAwesome5
                        name={not.tip === 'uyari' ? 'exclamation-triangle' : 'info-circle'}
                        size={11}
                        color={not.tip === 'uyari' ? renkler.uyari : renkler.metinIkincil}
                        style={{ marginTop: 2, marginRight: 6 }}
                        solid
                    />
                    <Text className="text-xs flex-1 leading-4" style={{ color: renkler.metinIkincil }}>
                        {not.metin}
                    </Text>
                </View>
            ))}
        </>
    );
};
