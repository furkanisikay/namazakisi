import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRenkler } from '../../../core/theme';
import { VakitBilgisi } from '../../../domain/services/NamazVaktiHesaplayiciServisi';
import { NamazAdi } from '../../../core/constants/UygulamaSabitleri';
import { PUAN_DEGERLERI } from '../../../core/types/SeriTipleri';
import { NAMAZ_DURUMLARI } from '../../../core/vakit/durumSozlugu';
import { KildimDugmesi, KILDIM_DUGMESI_YUKSEKLIK } from '../hareket/KildimDugmesi';

interface VakitKartiProps {
    vakitBilgisi: VakitBilgisi | null;
    kalanSureStr: string; // "02:45:12" formatında
    suankiVakitAdi: string; // "İkindi"
    vakitAraligi: string; // "15:15 - 17:42"
    tamamlandi: boolean;
    /**
     * Namaz kaydı GÖSTERİLEN güne ait mi? Değilse (gün değişirken bayat kayıt) Kıldım
     * düğmesi HİÇ doğmaz: bayat "kılınmadı" ile doğup kayıt gelince "Kılındı"ya geçseydi
     * dönüşüm animasyonu ve "Kılındı" duyurusu yanlış yere oynardı (sade görünümdeki
     * `kayitHazir` deseni). Varsayılan `true`.
     */
    kayitHazir?: boolean;
    onTamamla: () => void;
    /**
     * Kılınmışken düğmeye dokununca (geri alma — kartın kendisinden, listeye inmeden).
     * Verilmezse kılınmış düğme dokunulmaz.
     */
    onGeriAl?: () => void;
    /** Gösterilen kaydın kimliği ("<gün>_<vakit>"); değişince düğme animasyonsuz güncellenir. */
    kayitKimligi?: string;
    kilitli?: boolean;
    konumModu?: 'oto' | 'manuel';
    konumMetni?: string; // "Nilüfer, Bursa"
    /**
     * Verilirse (ve mod 'oto' ise) konum çipi basılabilir olur ve sonuna yenileme
     * simgesi eklenir. Manuel modda konum kullanıcının seçimidir — yenilenecek bir
     * şey yoktur, çip düz metin kalır.
     */
    onKonumYenile?: () => void;
    /** Yenileme sürerken çip beklemeye geçer (metin "Güncelleniyor…", tekrar basılamaz) */
    konumYenileniyor?: boolean;
    /**
     * Basligta gosterilecek ad. Verilmezse `suankiVakitAdi` kullanilir.
     * Cuma gunu ogle icin "Cuma" olur — SALT GORUNUM; ikon ve tum kimlik
     * karsilastirmalari `suankiVakitAdi` uzerinden surer.
     */
    gorunenVakitAdi?: string;
}

const getVakitIkonu = (vakit: string): string => {
    switch (vakit) {
        case 'İmsak': return 'cloud-sun';
        case 'Sabah': return 'cloud-sun';
        case 'Güneş': return 'sun';
        case 'Öğle': return 'sun';
        case 'İkindi': return 'cloud-sun'; // afternoon
        case 'Akşam': return 'moon';
        case 'Yatsı': return 'star-and-crescent';
        default: return 'mosque';
    }
};

export const VakitKarti: React.FC<VakitKartiProps> = ({
    vakitBilgisi,
    kalanSureStr,
    suankiVakitAdi,
    vakitAraligi,
    tamamlandi,
    kayitHazir = true,
    onTamamla,
    onGeriAl,
    kayitKimligi,
    kilitli = false,
    konumModu,
    konumMetni,
    onKonumYenile,
    konumYenileniyor = false,
    gorunenVakitAdi
}) => {
    const renkler = useRenkler();
    const ikonAdi = getVakitIkonu(suankiVakitAdi);
    const baslikAdi = gorunenVakitAdi ?? suankiVakitAdi;
    const konumYenilenebilir = konumModu === 'oto' && !!onKonumYenile;

    return (
        <View className="mb-6 relative overflow-hidden rounded-3xl shadow-lg border"
            style={{
                backgroundColor: renkler.kartArkaplan,
                borderColor: renkler.sinir
            }}>

            {/* Dekoratif Arka Plan Efektleri */}
            <View className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.vurgu }} />

            <View className="p-6 text-center items-center">
                {/* Badge Satırı: Şu Anki Vakit + Konum */}
                <View className="flex-row items-center gap-2 mb-4">
                    {/* Eski kartın rozeti. Nokta STATİK: boşta sıfır hareket (eski `animate-ping`
                        sonsuz döngüydü). Kılındı bilgisini düğme taşır; rozet tekrar etmez. */}
                    <View className="flex-row items-center gap-2 px-3 py-1 rounded-full"
                        style={{ backgroundColor: kilitli ? renkler.metinIkincil + '15' : renkler.birincil + '15' }}>
                        {!kilitli && (
                            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: renkler.birincil }} />
                        )}
                        <Text className="text-xs font-bold" style={{ color: kilitli ? renkler.metinIkincil : renkler.birincil }}>
                            {kilitli ? 'SIRADAKİ VAKİT' : 'ŞU ANKİ VAKİT'}
                        </Text>
                    </View>

                    {konumMetni && (() => {
                        const cipIcerigi = (
                            <>
                                <FontAwesome5
                                    name={konumModu === 'oto' ? 'satellite-dish' : 'map-marker-alt'}
                                    size={10}
                                    color={renkler.metinIkincil}
                                />
                                <Text className="text-xs font-semibold" style={{ color: renkler.metinIkincil }}>
                                    {konumYenileniyor ? 'Güncelleniyor…' : konumMetni}
                                </Text>
                                {konumYenilenebilir && (
                                    <FontAwesome5
                                        name="sync-alt"
                                        size={9}
                                        color={renkler.birincil}
                                        style={{ opacity: konumYenileniyor ? 0.5 : 1 }}
                                    />
                                )}
                            </>
                        );

                        const cipStili = 'flex-row items-center gap-1 px-3 py-1 rounded-full';
                        const cipRengi = { backgroundColor: renkler.metinIkincil + '15' };

                        if (!konumYenilenebilir) {
                            return <View className={cipStili} style={cipRengi}>{cipIcerigi}</View>;
                        }

                        return (
                            // Çip küçük kalmalı (ana kartın baş köşesi) ama dokunma hedefi
                            // 44dp'ye ulaşmalı -> hitSlop. Böylece görsel yer kaplamadan
                            // erişilebilirlik tabanı korunur.
                            <TouchableOpacity
                                className={cipStili}
                                style={cipRengi}
                                onPress={onKonumYenile}
                                disabled={konumYenileniyor}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                accessibilityRole="button"
                                accessibilityLabel="Konumu yenile"
                                accessibilityHint="Şu anki konumunuzu alır ve namaz vakitlerini ona göre günceller"
                                accessibilityState={{ disabled: konumYenileniyor, busy: konumYenileniyor }}
                            >
                                {cipIcerigi}
                            </TouchableOpacity>
                        );
                    })()}
                </View>

                {/* İkon ve Başlık */}
                <View className="flex-col items-center justify-center mb-2">
                    <View className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                        style={{ backgroundColor: renkler.birincil + '10' }}>
                        <FontAwesome5 name={ikonAdi} size={36} color={renkler.birincil} />
                    </View>
                    <Text className="text-4xl font-black tracking-tight" style={{ color: renkler.metin }}>
                        {baslikAdi}
                    </Text>
                    <Text className="font-medium text-sm mt-1" style={{ color: renkler.metinIkincil }}>
                        {vakitAraligi}
                    </Text>
                </View>

                {/* Sayaç */}
                <View className="my-6 items-center">
                    <Text className="text-5xl font-mono font-bold tracking-tighter tabular-nums" style={{ color: renkler.metin }}>
                        {kalanSureStr}
                    </Text>
                    <Text className="text-xs font-semibold tracking-widest mt-2" style={{ color: renkler.metinIkincil }}>
                        KALAN SÜRE
                    </Text>
                </View>

                {/* Eski kartın düğmesi: "Kılındı olarak işaretle" ⇄ "✓ Kılındı", dönüşerek.
                    Geri alma da buradan (tek dokunuş; namazToggle yolu). Vakit girmediyse
                    eski gri düğme (dokunulmaz); metni durum sözlüğünden ("Henüz girmedi"). */}
                {kilitli ? (
                    <View
                        className="w-full rounded-2xl flex-row items-center justify-center gap-3"
                        style={{ height: KILDIM_DUGMESI_YUKSEKLIK, backgroundColor: renkler.metinIkincil, opacity: 0.7 }}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={NAMAZ_DURUMLARI.girmedi.etiket}
                        accessibilityState={{ disabled: true }}
                        testID="vakit-karti-girmedi"
                    >
                        <FontAwesome5 name="clock" size={20} color={renkler.birincilMetin} />
                        <Text className="font-bold text-lg" style={{ color: renkler.birincilMetin }}>
                            {NAMAZ_DURUMLARI.girmedi.etiket}
                        </Text>
                    </View>
                ) : !kayitHazir ? (
                    <View testID="vakit-karti-kayit-bekleniyor" style={{ alignSelf: 'stretch', height: KILDIM_DUGMESI_YUKSEKLIK }} />
                ) : (
                    <KildimDugmesi
                        kilindi={tamamlandi}
                        onKildim={onTamamla}
                        onGeriAl={onGeriAl}
                        kimlik={kayitKimligi}
                        vakitAdi={baslikAdi}
                        testID="vakit-karti-kildim"
                    />
                )}

                {/* Eski kartın teşvik satırı — tek satır, yalnız işaretlenebilirken. */}
                {!tamamlandi && !kilitli && kayitHazir && (
                    <View className="flex-row items-center justify-center mt-4 gap-2" testID="vakit-karti-tesvik">
                        <FontAwesome5 name="star" size={10} color={renkler.birincil} />
                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                            <Text className="font-bold" style={{ color: renkler.birincil }}>+{PUAN_DEGERLERI.namaz_kilindi} puan</Text>
                            {' · Serinizi koruyun'}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};
