import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { tarihiGorunumFormatinaCevir, gunAdiniAl, ISOTarihiDateNesnesiNeCevir } from '../../../core/utils/TarihYardimcisi';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { SERI_RENKLERI } from '../../../core/constants/UygulamaSabitleri';

/**
 * Home page header component props.
 */
interface HomeHeaderProps {
    tarih: string;
    streakGun: number;
    bugunMu: boolean;
    aktifGunMu?: boolean;
    onTarihTikla: () => void;
    onSeriTikla?: () => void;
    toparlanmaModu?: boolean;
    toparlanmaIlerleme?: { tamamlanan: number; hedef: number } | null;
    /**
     * Günün selamı ("Hayırlı cumalar", "Kandiliniz mübarek olsun" — `core/samimiyet/selam`).
     * Yalnız bugün/aktif gün gösterilirken "Bugün" etiketinin yerine geçer; geçmiş günde yok.
     */
    selam?: string | null;
}

/**
 * Home page header component.
 * Displays current date and streak counter (Kıble Dalga 4'ten beri kendi sekmesinde;
 * header'daki kısayol kaldırıldı).
 * @param {HomeHeaderProps} props - Component props.
 * @returns {React.JSX.Element} Header with date info and streak button.
 */
export const HomeHeader = React.memo<HomeHeaderProps>(({
    tarih,
    streakGun,
    bugunMu,
    aktifGunMu,
    onTarihTikla,
    onSeriTikla,
    toparlanmaModu,
    toparlanmaIlerleme,
    selam,
}) => {
    const renkler = useRenkler();
    const metinler = useMetin();
    const m = metinler.anaEkran.baslik;
    const gosterilenSelam = (aktifGunMu || bugunMu) && selam ? selam : null;

    // Takvim yaprağı parçaları doğrudan tarihten (dile göre değişen biçimi bölmeden).
    const formatliTarih = tarihiGorunumFormatinaCevir(tarih);
    const tarihNesnesi = ISOTarihiDateNesnesiNeCevir(tarih);
    const gun = tarihNesnesi.getDate();
    const ay = metinler.tarih.aylarKisa[tarihNesnesi.getMonth()]; // "Oca"
    const yil = tarihNesnesi.getFullYear();
    const gunAdi = gunAdiniAl(tarih); // "Pazar"
    const toparlanmaEtiketi = toparlanmaIlerleme
        ? bicim(m.toparlanmaErisim, { tamamlanan: toparlanmaIlerleme.tamamlanan, hedef: toparlanmaIlerleme.hedef })
        : '';

    // Kademeli ateş rengi — toparlanma moduna göre değişir, useMemo ile hesaplanır
    const { atesRenk, atesOpacity } = useMemo(() => {
        if (!toparlanmaModu || !toparlanmaIlerleme) {
            return { atesRenk: SERI_RENKLERI.ATES, atesOpacity: 1 };
        }
        const { tamamlanan, hedef } = toparlanmaIlerleme;
        const ilerleme = hedef > 0 ? tamamlanan / hedef : 0;
        if (ilerleme === 0) return { atesRenk: '#9ca3af', atesOpacity: 0.5 };
        if (ilerleme < 0.5) return { atesRenk: '#f59e0b', atesOpacity: 0.7 };
        if (ilerleme < 1) return { atesRenk: '#f97316', atesOpacity: 0.85 };
        return { atesRenk: SERI_RENKLERI.ATES, atesOpacity: 1 }; // tamamlandı → tam alev
    }, [toparlanmaModu, toparlanmaIlerleme]);

    return (
        <View
            className="flex-row justify-between items-center px-6 py-4 border-b w-full z-50 backdrop-blur-md"
            style={{
                backgroundColor: renkler.kartArkaplan + 'E6', // %90 opacity
                borderColor: renkler.sinir
            }}
        >
            <TouchableOpacity
                className="flex-row items-center gap-3"
                onPress={onTarihTikla}
                activeOpacity={0.7}
                accessibilityRole="button"
                // Kısaltılmış ay ("Oca") yerine tam tarih okunur.
                accessibilityLabel={`${gosterilenSelam ? `${gosterilenSelam}. ` : ''}${bicim(m.tarihErisim, {
                    etiket: aktifGunMu ? m.aktifGunErisim : bugunMu ? m.bugun : m.seciliTarihErisim,
                    tarih: formatliTarih,
                    gun: gunAdi,
                })}`}
                accessibilityHint={m.tarihIpucu}
            >
                <View
                    className="p-2 rounded-lg items-center min-w-[3.5rem] border"
                    style={{
                        backgroundColor: renkler.arkaplan,
                        borderColor: renkler.sinir
                    }}
                >
                    <Text className="text-xs font-bold uppercase" style={{ color: renkler.durum.hata }}>
                        {ay}
                    </Text>
                    <Text className="text-lg font-bold leading-none" style={{ color: renkler.metin }}>
                        {gun}
                    </Text>
                </View>

                <View>
                    {gosterilenSelam ? (
                        <Text className="text-xs font-semibold" style={{ color: renkler.metin }} numberOfLines={1} testID="baslik-gun-selami">
                            {gosterilenSelam}
                        </Text>
                    ) : (
                        <Text className="text-xs font-medium" style={{ color: renkler.metinIkincil }}>
                            {aktifGunMu ? m.aktifGun : (bugunMu ? m.bugun : m.seciliTarih)}
                        </Text>
                    )}
                    {/* Sıra ve ayraç dile göre sözlükten ("Cumartesi, 2026" · "2026년 토요일"). */}
                    <Text testID="baslik-gun-yil" className="text-sm font-bold" style={{ color: renkler.metin }}>
                        {bicim(metinler.tarih.gunAdiYil, { gunAdi, yil })}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
                {/* Seri Butonu */}
                <TouchableOpacity
                    className="items-center px-3 py-1.5 rounded-full border"
                    style={{
                        backgroundColor: SERI_RENKLERI.ATES + '20',
                        borderColor: atesRenk + '80',
                        opacity: atesOpacity,
                    }}
                    onPress={onSeriTikla}
                    activeOpacity={0.7}
                    accessibilityLabel={
                        toparlanmaModu && toparlanmaIlerleme
                            ? toparlanmaEtiketi
                            : sayili(m.seriErisim, streakGun)
                    }
                    accessibilityRole="button"
                >
                    <View className="flex-row items-center gap-2">
                        <FontAwesome5
                            name="fire"
                            size={14}
                            color={atesRenk}
                            accessibilityRole="text"
                            accessibilityLabel={
                                toparlanmaModu && toparlanmaIlerleme
                                    ? toparlanmaEtiketi
                                    : undefined
                            }
                        />
                        <Text className="font-bold text-sm" style={{ color: atesRenk }}>
                            {sayili(m.seriGun, streakGun)}
                        </Text>
                    </View>
                    {toparlanmaModu && toparlanmaIlerleme && (
                        <Text
                            style={{ color: '#f59e0b', fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 1 }}
                            accessibilityElementsHidden
                        >
                            🔄 {toparlanmaIlerleme.tamamlanan}/{toparlanmaIlerleme.hedef}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
});
HomeHeader.displayName = 'HomeHeader';
