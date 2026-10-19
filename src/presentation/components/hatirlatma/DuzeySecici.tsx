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
import { AccessibilityInfo, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import type { PresetSeviyeleri } from '../../../core/muhafiz/matrisIslemleri';
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

/**
 * Eski düzey (varsayılanlar değişmeden önceki kayıt). Kart ve cümle kullanıcının GERÇEK
 * planını sayar (`eskiSeviyeler` ölçülür) — yeni düzeyin sayısı SÖYLENMEZ; açıklama cümlesi
 * yok, yalnız küçük bir "Yeni öneriyi uygulayın" düğmesi (görsel inceleme 2026-10: "Önceki
 * Normal ayarınız sürüyor. Güncel Normal için karta dokunun." anlaşılmıyordu).
 * Gerçek plan ölçülemezse yedek altyazı.
 */
export const ESKI_DUZEY_ACIKLAMASI = 'Önceki ayarınız';
export const ESKI_DUZEY_GUNCELLE = 'Yeni öneriyi uygulayın';

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
    /**
     * Seçili düzey eski tablolarla kurulu (varsayılanlar değişti, mevcut kayıt korunur).
     * Seçili kart ve cümle yeni sayıyı SÖYLEMEZ — kullanıcının gerçek planı o değildir.
     */
    eskiDuzey?: boolean;
    /** Eski düzeyde kullanıcının GERÇEK adımları (öğle satırı) — kart ve cümle bunu sayar. */
    eskiSeviyeler?: PresetSeviyeleri;
    style?: StyleProp<ViewStyle>;
    testID?: string;
}

export const DuzeySecici: React.FC<DuzeySeciciProps> = React.memo(function DuzeySecici({
    secili,
    onSec,
    ozelGoster = false,
    sesliBilgiGoster = true,
    sesliIzinVar = true,
    eskiDuzey = false,
    eskiSeviyeler,
    style,
    testID,
}) {
    const renkler = useRenkler();
    const o = duzeyOlculeri();
    const ozelVar = ozelGoster || secili === 'ozel';
    const eskiGoster = eskiDuzey && secili !== 'kapali' && secili !== 'ozel';
    const eskiOlcu = React.useMemo(
        () => (eskiGoster && eskiSeviyeler ? duzeyiOlc(eskiSeviyeler) : null),
        [eskiGoster, eskiSeviyeler],
    );
    const secenekler = React.useMemo<Secenek<DuzeySecimi>[]>(
        () => [
            ...HATIRLATMA_DUZEYLERI.map((d) => ({
                deger: d as DuzeySecimi,
                etiket: DUZEY_ADLARI[d],
                aciklama:
                    eskiGoster && d === secili
                        ? eskiOlcu
                            ? duzeyKisaAciklamasi(d, eskiOlcu, sesliIzinVar)
                            : ESKI_DUZEY_ACIKLAMASI
                        : duzeyKisaAciklamasi(d, o[d], sesliIzinVar),
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
        [o, ozelVar, secili, sesliIzinVar, eskiGoster, eskiOlcu],
    );
    const cumle =
        secili === 'ozel'
            ? OZEL_DUZEY_CUMLESI
            : eskiGoster
              ? eskiOlcu
                  ? duzeyCumlesi(secili, eskiOlcu, sesliIzinVar)
                  : `Önceki ${DUZEY_ADLARI[secili]} ayarınız kullanılıyor.`
              : duzeyCumlesi(secili, o[secili], sesliIzinVar);
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
            {eskiGoster ? (
                <TouchableOpacity
                    testID="duzey-guncelle"
                    onPress={() => onSec(secili)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`${ESKI_DUZEY_GUNCELLE}: güncel ${DUZEY_ADLARI[secili as HatirlatmaDuzeyi]} düzey`}
                    style={{
                        alignSelf: 'flex-start',
                        flexDirection: 'row',
                        alignItems: 'center',
                        minHeight: 44,
                        marginTop: 8,
                        marginLeft: 26,
                        paddingHorizontal: 14,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: renkler.birincil,
                        backgroundColor: renkler.kartArkaplan,
                    }}
                >
                    <FontAwesome5 name="sync-alt" size={12} color={renkler.birincil} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: renkler.birincil }}>{ESKI_DUZEY_GUNCELLE}</Text>
                </TouchableOpacity>
            ) : null}
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
