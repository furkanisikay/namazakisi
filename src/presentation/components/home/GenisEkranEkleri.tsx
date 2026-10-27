/**
 * "Bu hafta" paneli — tablet / iPad geniş düzenin ana sayfa eki.
 *
 * Yatayda üçüncü sütundur, dikeyde vakit kartının altına iner (`GunSayfasiDuzeni`).
 * Tek kart, içinde dört bölüm (dolgu kart yığını değil): seri + haftanın günleri,
 * kılma oranı, kaza özeti, yarının vakitleri. Telefonda HİÇ çizilmez.
 *
 * PERFORMANS: ana ekran saniyede bir çizilir; panel `React.memo`'dur ve yalnız dize/sayı
 * prop alır. Haftanın kayıtları yalnız `okumaAnahtari` (gün + bugün kılınan sayısı)
 * değişince diskten yeniden okunur.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { YonluIkon } from '../common/YonluIkon';
import { useNavigation } from '@react-navigation/native';
import { useRenkler } from '../../../core/theme';
import { yarinVakitleriniHesapla } from '../../../core/anaEkran/genisEkranEkleri';
import { GUNLUK_FARZ, haftaBasi, haftaOzetiHesapla } from '../../../core/anaEkran/haftaOzeti';
import { localTarihAraligindakiNamazlariGetir } from '../../../data/local/LocalNamazServisi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { bicim, sayili, sayiYaz } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { kazaVerileriniYukle } from '../../store/kazaSlice';

interface Props {
    lat: number | undefined;
    lng: number | undefined;
    /** Gösterilen (aktif) gün, ISO. */
    gunTarihiIso: string;
    /** Değişince hafta kayıtları yeniden okunur (ör. `${gün}_${bugün kılınan}`). */
    okumaAnahtari: string;
    /**
     * Üç sütunlu yatay düzende sütunun tüm yüksekliğini doldur (bölümler artan alanı
     * eşit paylaşır, içerik ortalanır). Dikey iki sütunda kartın altında doğal boyda kalır.
     */
    uzat?: boolean;
}

/** Ek hesap ana ekranı ASLA düşürmez: patlarsa bölüm çizilmez. */
function guvenli<T>(hesap: () => T | null): T | null {
    try {
        return hesap();
    } catch {
        return null;
    }
}

const Bolum: React.FC<{ ikon: string; baslik: string; children: React.ReactNode; ilk?: boolean; uzat?: boolean }> = ({
    ikon,
    baslik,
    children,
    ilk,
    uzat,
}) => {
    const renkler = useRenkler();
    return (
        <View style={[stil.bolum, uzat && stil.uzanan, !ilk && { borderTopWidth: 1, borderTopColor: renkler.sinir }]}>
            <View className="flex-row items-center gap-2 mb-3">
                <FontAwesome5 name={ikon} size={13} color={renkler.birincil} solid />
                <Text className="text-sm font-semibold" style={{ color: renkler.metinIkincil }}>
                    {baslik}
                </Text>
            </View>
            {children}
        </View>
    );
};

export const BuHaftaPaneli: React.FC<Props> = React.memo(({ lat, lng, gunTarihiIso, okumaAnahtari, uzat = false }) => {
    const renkler = useRenkler();
    const m = useMetin().anaEkran.genis;
    const dispatch = useAppDispatch();
    const navigation = useNavigation<{ navigate: (ad: string) => void }>();
    const mevcutSeri = useAppSelector((s) => s.seri?.seriDurumu?.mevcutSeri ?? 0);
    const kaza = useAppSelector((s) => s.kaza?.kazaDurumu ?? null);
    const [kilinanlar, setKilinanlar] = React.useState<Record<string, number>>({});

    // Kaza slice'ı ana ekranda hidrate değildir (AGENTS.md "her slice açılışta yüklenmez").
    React.useEffect(() => {
        if (!kaza) dispatch(kazaVerileriniYukle());
        // Yalnız ilk görünüşte; sonraki güncellemeleri kaza ekranı yazar.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    React.useEffect(() => {
        let iptal = false;
        localTarihAraligindakiNamazlariGetir(haftaBasi(gunTarihiIso), gunTarihiIso)
            .then((yanit) => {
                if (iptal || !yanit?.basarili || !Array.isArray(yanit.veri)) return;
                const harita: Record<string, number> = {};
                for (const g of yanit.veri) harita[g.tarih] = g.namazlar.filter((n) => n.tamamlandi).length;
                setKilinanlar(harita);
            })
            .catch(() => undefined);
        return () => {
            iptal = true;
        };
    }, [gunTarihiIso, okumaAnahtari]);

    // `m` bağımlılık: gün harfleri ve yarının vakit adları etkin dilde üretilir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const hafta = React.useMemo(() => haftaOzetiHesapla(gunTarihiIso, kilinanlar), [gunTarihiIso, kilinanlar, m]);
    const yarin = React.useMemo(
        () => guvenli(() => (lat === undefined || lng === undefined ? null : yarinVakitleriniHesapla({ lat, lng }, gunTarihiIso))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lat, lng, gunTarihiIso, m]
    );

    return (
        <View
            testID="bu-hafta-paneli"
            className="border mb-6"
            style={[
                { backgroundColor: renkler.kartArkaplan, borderColor: renkler.sinir, borderRadius: 24 },
                uzat && stil.uzananKart,
            ]}
        >
            <Bolum ikon="fire" baslik={m.buHafta} ilk uzat={uzat}>
                <View className="flex-row items-baseline gap-2 mb-4" accessible accessibilityLabel={sayili(m.seriErisim, mevcutSeri)}>
                    <Text style={[stil.buyukSayi, { color: renkler.metin }]}>{mevcutSeri}</Text>
                    <Text className="text-base" style={{ color: renkler.metinIkincil }}>
                        {sayili(m.seriEtiketi, mevcutSeri)}
                    </Text>
                </View>
                {/* Haftanın günleri: her gün beş kutucuk (beş vakit), aşağıdan yukarı dolar. */}
                <View className="flex-row justify-between">
                    {hafta.gunler.map((g) => (
                        <View
                            key={g.tarih}
                            className="items-center"
                            accessible
                            accessibilityLabel={g.gelecekMi ? bicim(m.gunGelmedi, { gun: g.harf }) : sayili(m.gunKilinan, g.kilinan, { gun: g.harf })}
                        >
                            <View style={stil.kutuSutunu}>
                                {Array.from({ length: GUNLUK_FARZ }, (_, i) => GUNLUK_FARZ - 1 - i).map((i) => (
                                    <View
                                        key={i}
                                        style={[
                                            stil.kutu,
                                            {
                                                backgroundColor: i < g.kilinan ? renkler.birincil : renkler.sinir,
                                                opacity: g.gelecekMi ? 0.4 : 1,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                            <Text
                                className="text-xs mt-2"
                                style={{ color: g.bugunMu ? renkler.metin : renkler.metinIkincil, fontWeight: g.bugunMu ? '700' : '400' }}
                            >
                                {g.harf}
                            </Text>
                        </View>
                    ))}
                </View>
                <Text className="text-sm mt-4" style={{ color: renkler.metin }}>
                    {bicim(m.haftaOzeti, { yuzde: hafta.yuzde, kilinan: hafta.kilinan, toplam: hafta.toplam })}
                </Text>
            </Bolum>

            {kaza ? (
                <Bolum ikon="book" baslik={m.kaza} uzat={uzat}>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base" style={{ color: renkler.metin }}>
                            <Text className="text-2xl font-bold">
                                {kaza.toplamGizleMi ? '••••' : sayiYaz(kaza.toplamKalan)}
                            </Text>
                            {sayili(m.kazaKaldi, kaza.toplamKalan)}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('KazaDefteri')}
                            accessibilityRole="button"
                            accessibilityLabel={m.kazaDefteriniAcin}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            className="flex-row items-center gap-2 px-4 py-2 rounded-full"
                            style={{ backgroundColor: renkler.birincil + '20' }}
                        >
                            <Text className="text-sm font-semibold" style={{ color: renkler.metin }}>
                                {m.acin}
                            </Text>
                            <YonluIkon name="chevron-right" size={11} color={renkler.metin} />
                        </TouchableOpacity>
                    </View>
                </Bolum>
            ) : null}

            {yarin ? (
                <Bolum ikon="calendar-day" baslik={bicim(m.yarin, { tarih: yarin.tarihMetni })} uzat={uzat}>
                    <View className="flex-row flex-wrap" testID="genis-yarin-vakitleri">
                        {yarin.satirlar.map((s) => (
                            <View key={s.ad} className="w-1/3 py-2" accessible accessibilityLabel={bicim(m.yarinVakitErisim, { ad: s.ad, saat: s.saat })}>
                                <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                                    {s.ad}
                                </Text>
                                <Text className="text-xl font-bold" style={{ color: renkler.metin, fontVariant: ['tabular-nums'] }}>
                                    {s.saat}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Bolum>
            ) : null}
        </View>
    );
});
BuHaftaPaneli.displayName = 'BuHaftaPaneli';

const stil = StyleSheet.create({
    bolum: { paddingHorizontal: 24, paddingVertical: 20 },
    uzanan: { flexGrow: 1, justifyContent: 'center' },
    uzananKart: { flexGrow: 1 },
    buyukSayi: { fontSize: 44, lineHeight: 50, fontWeight: '800' },
    kutuSutunu: { gap: 3 },
    kutu: { width: 22, height: 8, borderRadius: 3 },
});
