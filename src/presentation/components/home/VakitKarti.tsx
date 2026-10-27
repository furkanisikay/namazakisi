import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import { VakitBilgisi } from '../../../domain/services/NamazVaktiHesaplayiciServisi';
import { NamazAdi, namazAdiGoster } from '../../../core/constants/UygulamaSabitleri';
import { bicim, sayili } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';
import { PUAN_DEGERLERI } from '../../../core/types/SeriTipleri';
import { NAMAZ_DURUMLARI } from '../../../core/vakit/durumSozlugu';
import { KildimDugmesi, KILDIM_DUGMESI_YUKSEKLIK } from '../hareket/KildimDugmesi';
import { KabulEkSatiri } from '../hareket/KabulEkSatiri';
import { VakitIkonu, vakitIkonKodu } from '../ortak/VakitIkonu';
import { kildimDugmesiRenkleri } from '../../../core/anaEkran/kildimDugmesiRenkleri';
import { GeriSayimBirimli } from './GeriSayimMetni';

interface VakitKartiProps {
    /** Sayaç hedefi `vakitBilgisi.sonrakiVakitGiris`; saniyelik çizim yalnız `GeriSayimMetni`nde (D-03). */
    vakitBilgisi: VakitBilgisi | null;
    /** Sayaç sıfıra inince (vakit sınırı) bir kez; ana ekran vakit bilgisini tazeler. */
    onSayacBitti?: () => void;
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
    /** Hesap yönteminin kısa adı ("Diyanet", "JAKIM"); verilirse konum çipinin yanında çip olur. */
    yontemAdi?: string;
    /** Yöntem çipine dokununca (yöntem sayfası). */
    onYontem?: () => void;
    /**
     * Basligta gosterilecek ad. Verilmezse `suankiVakitAdi` kullanilir.
     * Cuma gunu ogle icin "Cuma" olur — SALT GORUNUM; ikon ve tum kimlik
     * karsilastirmalari `suankiVakitAdi` uzerinden surer.
     */
    gorunenVakitAdi?: string;
    /**
     * Geniş ekran (tablet / iPad iki bölme): kart daha ferah, başlık ve geri sayım daha
     * büyük çizilir. Telefonda verilmez; düzen birebir eskisi kalır.
     */
    genis?: boolean;
    /**
     * Kılınınca düğmede yazan dua ("Allah kabul etsin" — `core/samimiyet/kabulDuasi`,
     * gün + vakitle deterministik). Verilmezse durum adı "Kılındı".
     */
    kabulMetni?: string;
    /** Kılınınca düğmenin altındaki kısa selam ("Hayırlı sabahlar"); yalnız sabah ve yatsı. */
    kabulEki?: string | null;
}

const getVakitIkonu = (vakit: string): string => {
    switch (vakit) {
        case 'İmsak': return 'cloud-sun'; // dil-haric: kimlik (servis vakit adı)
        case NamazAdi.Sabah: return 'cloud-sun';
        case NamazAdi.Gunes: return 'sun';
        case NamazAdi.Ogle: return 'sun';
        case NamazAdi.Ikindi: return 'cloud-sun'; // afternoon
        case NamazAdi.Aksam: return 'moon';
        case NamazAdi.Yatsi: return 'star-and-crescent';
        default: return 'mosque';
    }
};

export const VakitKarti: React.FC<VakitKartiProps> = ({
    vakitBilgisi,
    onSayacBitti,
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
    yontemAdi,
    onYontem,
    gorunenVakitAdi,
    genis = false,
    kabulMetni,
    kabulEki,
}) => {
    const renkler = useRenkler();
    const m = useMetin().anaEkran.kart;
    // Gri "Henüz girmedi" düğmesinin metni zemine göre ölçülür (koyu temada gri açıktır).
    const { girmediMetin } = kildimDugmesiRenkleri({
        birincil: renkler.birincil,
        basarili: renkler.basarili,
        metinIkincil: renkler.metinIkincil,
        birincilMetin: renkler.birincilMetin,
    });
    // Saat/TV ile aynı simge ailesi (FontAwesome "sun" küçükte dişliye benziyordu).
    const ikonKodu = vakitIkonKodu(suankiVakitAdi);
    const ikonAdi = getVakitIkonu(suankiVakitAdi);
    const baslikAdi = gorunenVakitAdi ?? namazAdiGoster(suankiVakitAdi);
    const konumYenilenebilir = konumModu === 'oto' && !!onKonumYenile;

    return (
        <View className="mb-6 relative overflow-hidden rounded-3xl shadow-lg border"
            style={{
                backgroundColor: renkler.kartArkaplan,
                borderColor: renkler.sinir,
                // Geniş düzende ebeveyn alan verirse (üç sütun) kart sütunu doldurur;
                // içerik içinde dikey ortalanır. Ebeveyn içerik boyundaysa etkisiz.
                ...(genis ? { flexGrow: 1 } : null),
            }}>

            {/* Dekoratif Arka Plan Efektleri */}
            <View className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.birincil }} />
            <View className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-10"
                style={{ backgroundColor: renkler.vurgu }} />

            <View className="p-6 text-center items-center" style={genis ? stiller.genisIcerik : undefined}>
                {/* Badge Satırı: Şu Anki Vakit + Konum */}
                <View className="flex-row flex-wrap items-center gap-2 mb-4">
                    {/* Eski kartın rozeti. Nokta STATİK: boşta sıfır hareket (eski `animate-ping`
                        sonsuz döngüydü). Kılındı bilgisini düğme taşır; rozet tekrar etmez. */}
                    <View className="flex-row items-center gap-2 px-3 py-1 rounded-full"
                        style={{ backgroundColor: kilitli ? renkler.metinIkincil + '15' : renkler.birincil + '15' }}>
                        {!kilitli && (
                            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: renkler.birincil }} />
                        )}
                        {/* Metin daima tema metni: birincil renkli küçük metin açık zeminde AA'yı tutmaz. */}
                        <Text className="text-xs font-bold" style={{ color: renkler.metin }}>
                            {kilitli ? m.siradakiVakit : m.suankiVakit}
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
                                    {konumYenileniyor ? m.guncelleniyor : konumMetni}
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
                                accessibilityLabel={m.konumuYenile}
                                accessibilityHint={m.konumuYenileIpucu}
                                accessibilityState={{ disabled: konumYenileniyor, busy: konumYenileniyor }}
                            >
                                {cipIcerigi}
                            </TouchableOpacity>
                        );
                    })()}

                    {yontemAdi ? (
                        <TouchableOpacity
                            className="flex-row items-center gap-1 px-3 py-1 rounded-full"
                            style={{ backgroundColor: renkler.birincil + '15' }}
                            onPress={onYontem}
                            disabled={!onYontem}
                            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                            accessibilityRole="button"
                            accessibilityLabel={bicim(m.yontemErisim, { ad: yontemAdi })}
                            accessibilityHint={m.yontemIpucu}
                            testID="yontem-cipi"
                        >
                            <FontAwesome5 name="mosque" size={9} color={renkler.metinIkincil} />
                            <Text className="text-xs font-semibold" style={{ color: renkler.metin }}>
                                {yontemAdi}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* İkon ve Başlık */}
                <View className="flex-col items-center justify-center mb-2">
                    <View className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                        style={[{ backgroundColor: renkler.birincil + '10' }, genis && stiller.genisIkon]}>
                        {ikonKodu ? (
                            <VakitIkonu kod={ikonKodu} boyut={genis ? 52 : 38} renk={renkler.birincil} testID={`vakit-karti-ikon-${ikonKodu}`} />
                        ) : (
                            <FontAwesome5 name={ikonAdi} size={genis ? 52 : 36} color={renkler.birincil} />
                        )}
                    </View>
                    <Text className="text-4xl font-black tracking-tight" style={[{ color: renkler.metin }, genis && stiller.genisBaslik]}>
                        {baslikAdi}
                    </Text>
                    <Text className="font-medium text-sm mt-1" style={{ color: renkler.metinIkincil }}>
                        {vakitAraligi}
                    </Text>
                </View>

                {/* Sayaç */}
                <View className="my-6 items-center" style={genis ? stiller.genisSayacKutusu : undefined}>
                    {/* Birimli: "01:09:09" duvar saati gibi okunuyordu (saat/TV ile aynı dil). */}
                    <GeriSayimBirimli
                        hedefIso={vakitBilgisi?.sonrakiVakitGiris}
                        onBitti={onSayacBitti}
                        rakamBoyu={genis ? 76 : 48}
                        birimRengi={renkler.metinIkincil}
                        style={{ color: renkler.metin, fontWeight: '800', letterSpacing: -1 }}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                    />
                    <Text className="text-sm font-medium mt-1" style={{ color: renkler.metinIkincil }}>
                        {m.kalanSure}
                    </Text>
                </View>

                {/* Eski kartın düğmesi: "Kılındı olarak işaretle" ⇄ "✓ Kılındı", dönüşerek.
                    Geri alma da buradan (tek dokunuş; namazToggle yolu). Vakit girmediyse
                    eski gri düğme (dokunulmaz); metni durum sözlüğünden ("Henüz girmedi"). */}
                {kilitli ? (
                    <View
                        className="w-full rounded-2xl flex-row items-center justify-center gap-3"
                        style={{ height: KILDIM_DUGMESI_YUKSEKLIK, backgroundColor: renkler.metinIkincil }}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={NAMAZ_DURUMLARI.girmedi.etiket}
                        accessibilityState={{ disabled: true }}
                        testID="vakit-karti-girmedi"
                    >
                        <FontAwesome5 name="clock" size={20} color={girmediMetin} />
                        <Text className="font-bold text-lg" style={{ color: girmediMetin }}>
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
                        kilindiMetni={kabulMetni}
                        testID="vakit-karti-kildim"
                    />
                )}

                {/* Kılınınca sessiz ek selam (sabah/yatsı) — teşvik satırının yerinde, kayma yok. */}
                {!kilitli && kayitHazir && !!kabulEki && (
                    <KabulEkSatiri
                        metin={kabulEki}
                        gorunur={tamamlandi}
                        kimlik={kayitKimligi}
                        testID="vakit-karti-kabul-eki"
                    />
                )}

                {/* Eski kartın teşvik satırı — tek satır, yalnız işaretlenebilirken. */}
                {!tamamlandi && !kilitli && kayitHazir && (
                    <View className="flex-row items-center justify-center mt-4 gap-2" testID="vakit-karti-tesvik">
                        <FontAwesome5 name="star" size={10} color={renkler.birincil} />
                        <Text className="text-xs" style={{ color: renkler.metinIkincil }}>
                            <Text className="font-bold" style={{ color: renkler.metin }}>{sayili(m.puan, PUAN_DEGERLERI.namaz_kilindi)}</Text>
                            {` · ${m.seriniziKoruyun}`}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// Geniş ekran ölçüleri (tablet / iPad). Telefonda hiçbiri uygulanmaz.
const stiller = StyleSheet.create({
    genisIcerik: { paddingHorizontal: 40, paddingVertical: 40, flexGrow: 1, justifyContent: 'center' },
    genisIkon: { width: 112, height: 112, borderRadius: 28 },
    genisBaslik: { fontSize: 52, lineHeight: 60 },
    genisSayacKutusu: { marginVertical: 40 },
});
