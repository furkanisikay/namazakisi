/**
 * Hatırlatma DÜZEYİ seçicisi — Kapalı · Hafif · Normal · Yoğun (sade tasarım, Dalga 2).
 *
 * Kurulum sihirbazı ve Dalga 3'ün Hatırlatmalar sayfası AYNI bileşeni kullanır:
 * dört radyo kartı (`SecenekListesi`) + altında seçimle canlı değişen tek cümle
 * ("Çıkmadan 45 dk önce başlar, 6 uyarı. Son dakikada sesli okur."). Sayılar
 * motorun planından ölçülür (`core/hatirlatma/duzeyOzeti`), elle yazılmaz.
 *
 * SESLİ OKUMA RIZASI: sesli içeren bir düzey seçiliyken seçicinin HEMEN ALTINDA tek
 * bir bilgilendirme maddesi görünür (`testID="duzey-sesli-bilgi"`). Çağıran rıza
 * kaydını (`sesliOnayi`) ancak bu madde ekranda gösterildiyse yazar. Madde platforma
 * göre doğru cümleyi söyler (`sesliBilgiMetni`) ve göründüğü an ekran okuyucuya da
 * DUYURULUR (rıza yazılmadan önce gerçekten bildirilmiş olsun) — bunu
 * `sesliBilgiGosterildiMi(secili, sesliBilgiGoster)` ile sorar. Madde kapatılırsa
 * (`sesliBilgiGoster={false}`, ör. rızası zaten olan kullanıcı) rıza buradan
 * TÜRETİLMEZ.
 */
import * as React from 'react';
import { AccessibilityInfo, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { SecenekListesi, type Secenek } from '../ortak/SecenekListesi';
import {
    DUZEY_ADLARI,
    DUZEY_IKONLARI,
    HATIRLATMA_DUZEYLERI,
    OZEL_DUZEY_ACIKLAMASI,
    OZEL_DUZEY_ADI,
    OZEL_DUZEY_CUMLESI,
    OZEL_DUZEY_IKONU,
    duzeyCumlesi,
    duzeyiOlc,
    duzeyKisaAciklamasi,
    sesliBilgiMetni,
    type DuzeyOlcusu,
    type HatirlatmaDuzeyi,
} from '../../../core/hatirlatma/duzeyOzeti';
import { HATIRLATMA_PRESETLERI } from '../../store/muhafizSlice';
import { usePlatformYetenekleri } from '../../hooks/usePlatformYetenekleri';

export type { HatirlatmaDuzeyi };

/** Seçicinin değeri: dört düzey + (yalnız Hatırlatmalar/muhafız ekranında) kendi ayarı. */
export type DuzeySecimi = HatirlatmaDuzeyi | 'ozel';

/** Preset'ler sabit → ölçü bir kez (modül yüklenirken değil, ilk kullanımda). */
let olculer: Record<HatirlatmaDuzeyi, DuzeyOlcusu | null> | null = null;
export function duzeyOlculeri(): Record<HatirlatmaDuzeyi, DuzeyOlcusu | null> {
    if (!olculer) {
        olculer = {
            kapali: null,
            hafif: duzeyiOlc(HATIRLATMA_PRESETLERI.hafif.seviyeler),
            normal: duzeyiOlc(HATIRLATMA_PRESETLERI.normal.seviyeler),
            yogun: duzeyiOlc(HATIRLATMA_PRESETLERI.yogun.seviyeler),
        };
    }
    return olculer;
}

/** Düzey sesli okuma içeriyor mu? */
export function duzeySesliMi(duzey: HatirlatmaDuzeyi): boolean {
    return duzeyOlculeri()[duzey]?.sesli === true;
}

/** Sesli bilgi maddesi bu seçimde ekranda görünüyor mu? (Rıza kaydı yalnız o zaman yazılır.) */
export function sesliBilgiGosterildiMi(duzey: HatirlatmaDuzeyi, sesliBilgiGoster = true): boolean {
    return sesliBilgiGoster && duzeySesliMi(duzey);
}

export { sesliBilgiMetni };

export interface DuzeySeciciProps {
    secili: DuzeySecimi;
    onSec: (duzey: DuzeySecimi) => void;
    /**
     * Beşinci kart "Kendi ayarınız" görünsün mü (kaydedilmiş özel ayar varken).
     * Sihirbaz vermez; `secili === 'ozel'` iken verilmese de çizilir.
     */
    ozelGoster?: boolean;
    /** Sesli düzeyde bilgilendirme maddesi gösterilsin mi (varsayılan evet). */
    sesliBilgiGoster?: boolean;
    /**
     * Sesli okuma rızası var mı? `false` iken kartlar ve cümle "sesli" DEMEZ (rıza yoksa
     * düzey sesli adımları bildirimle kurar). Sihirbaz vermez: rıza maddesini kendisi gösterir.
     */
    sesliIzinVar?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const DuzeySecici: React.FC<DuzeySeciciProps> = React.memo(function DuzeySecici({
    secili,
    onSec,
    ozelGoster = false,
    sesliBilgiGoster = true,
    sesliIzinVar = true,
    style,
    testID,
}) {
    const renkler = useRenkler();
    const o = duzeyOlculeri();
    const ozelVar = ozelGoster || secili === 'ozel';
    const secenekler = React.useMemo<Secenek<DuzeySecimi>[]>(
        () => [
            ...HATIRLATMA_DUZEYLERI.map((d) => ({
                deger: d as DuzeySecimi,
                etiket: DUZEY_ADLARI[d],
                aciklama: duzeyKisaAciklamasi(d, o[d], sesliIzinVar),
                ikon: DUZEY_IKONLARI[d],
            })),
            ...(ozelVar
                ? [
                      {
                          deger: 'ozel' as DuzeySecimi,
                          etiket: OZEL_DUZEY_ADI,
                          aciklama: secili === 'ozel' ? OZEL_DUZEY_ACIKLAMASI.secili : OZEL_DUZEY_ACIKLAMASI.geri,
                          ikon: OZEL_DUZEY_IKONU,
                      },
                  ]
                : []),
        ],
        [o, ozelVar, secili, sesliIzinVar],
    );
    const cumle = secili === 'ozel' ? OZEL_DUZEY_CUMLESI : duzeyCumlesi(secili, o[secili], sesliIzinVar);
    const sesliBilgi = secili !== 'ozel' && sesliBilgiGosterildiMi(secili, sesliBilgiGoster);
    const bilgiMetni = sesliBilgiMetni(usePlatformYetenekleri().sessizligiDelebilir);
    // Madde göründüğü/değiştiği an ekran okuyucuya söylenir (yalnız görsel kalmasın).
    React.useEffect(() => {
        if (sesliBilgi) AccessibilityInfo.announceForAccessibility?.(bilgiMetni);
    }, [sesliBilgi, secili, bilgiMetni]);

    return (
        <View style={style} testID={testID}>
            <SecenekListesi secenekler={secenekler} secili={secili} onSec={onSec} erisimEtiketi="Hatırlatma düzeyi" />
            {/* Canlı önizleme: seçim değişince yerinde güncellenir (ekran okuyucu duyurur). */}
            <View
                accessibilityLiveRegion="polite"
                testID="duzey-ozeti"
                style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 12, paddingHorizontal: 4 }}
            >
                <FontAwesome5 name="clock" size={13} color={renkler.birincil} solid style={{ width: 22, marginTop: 3 }} />
                <Text style={{ flex: 1, fontSize: 15, lineHeight: 21, color: renkler.metin }}>{cumle}</Text>
            </View>
            {sesliBilgi ? (
                <View
                    testID="duzey-sesli-bilgi"
                    accessibilityLiveRegion="polite"
                    style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, paddingHorizontal: 4 }}
                >
                    <FontAwesome5 name="volume-up" size={13} color={renkler.birincil} solid style={{ width: 22, marginTop: 3 }} />
                    <Text style={{ flex: 1, fontSize: 15, lineHeight: 21, color: renkler.metin }}>{bilgiMetni}</Text>
                </View>
            ) : null}
        </View>
    );
});
