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
import { adimPencereyeSigarMi, pencereSuresiMetni } from '../../../core/muhafiz/pencereUzunlugu';
import {
    cikisSegmentiHesapla,
    girisSegmentiHesapla,
    etkinSiklikHesapla,
} from '../../../core/muhafiz/planButcesi';

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

    const siklik = seviye.siklik;
    const segment =
        yon === 'girisindenItibaren'
            ? girisSegmentiHesapla(seviyeler, seviye, pencereUzunluguDk)
            : cikisSegmentiHesapla(seviyeler, seviye);
    const etkin = etkinSiklikHesapla(segment, siklik);
    if (etkin !== siklik && etkin !== 'birkez') {
        return [
            {
                tip: 'bilgi',
                metin: `Çok sık uyarmamak için ${etkin.herDk} dakikada bir hatırlatılır`,
            },
        ];
    }

    return [];
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
