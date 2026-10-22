/**
 * "Kıldım işaretleyebilen uygulamalar" (issue #299) — otomasyon güven listesi.
 *
 * Samsung Rutinler, Tasker gibi bir uygulama "Kıldım" kısayolunu ya da
 * `namazakisi://kildim` bağlantısını ilk kez açtığında kullanıcıya bir kez sorulur;
 * verilen kararlar (paket başına, native SharedPreferences) burada listelenir:
 * izin ↔ engel değiştirilir ya da kayıt kaldırılır (kaldırılan uygulamaya bir dahaki
 * istekte yeniden sorulur). Ana ekran kısayolları listede yer almaz, her zaman çalışır.
 *
 * Başlık navigasyon header'ındadır (AGENTS.md: sayfa başlığı TEK yerde). Yalnız Android.
 */
import * as React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import { useRenkler } from '../../core/theme';
import { Anahtar } from '../components/common/Anahtar';
import { kisaBildirimGoster } from '../components/common/KisaBildirim';
import { KildimGuvenServisi } from '../../domain/services/KildimGuvenServisi';
import {
    guvenKarariEtiketi,
    guvenListesiniSirala,
    type KildimGuvenKaydi,
} from '../../core/kildim/kildimGuven';

export const KildimUygulamalariSayfasi: React.FC = () => {
    const renkler = useRenkler();
    const [liste, setListe] = React.useState<KildimGuvenKaydi[] | null>(null);

    const yukle = React.useCallback(() => {
        if (!KildimGuvenServisi.kullanilabilirMi()) return undefined;
        let iptal = false;
        KildimGuvenServisi.listeAl().then((l) => {
            if (!iptal) setListe(guvenListesiniSirala(l));
        });
        return () => {
            iptal = true;
        };
    }, []);
    // Soru başka bir yerden (kısayol, bağlantı) yanıtlanmış olabilir → her odakta tazele.
    useFocusEffect(yukle);

    const kararDegistir = React.useCallback(async (k: KildimGuvenKaydi, izin: boolean) => {
        const karar = izin ? 'izin' : 'engel';
        // İyimser: anahtar anında döner, yazım başarısızsa geri alınır.
        setListe((l) => l && l.map((x) => (x.paket === k.paket ? { ...x, karar } : x)));
        const tamam = await KildimGuvenServisi.kararDegistir(k.paket, karar);
        if (!tamam) {
            setListe((l) => l && l.map((x) => (x.paket === k.paket ? k : x)));
            kisaBildirimGoster('Karar kaydedilemedi. Lütfen yeniden deneyin.');
        }
    }, []);

    const kaldir = React.useCallback(async (k: KildimGuvenKaydi) => {
        const tamam = await KildimGuvenServisi.kaldir(k.paket);
        if (tamam) {
            setListe((l) => l && l.filter((x) => x.paket !== k.paket));
            kisaBildirimGoster(`${k.ad} listeden kaldırıldı. Bir dahaki istekte size yeniden sorulacak.`);
        } else {
            kisaBildirimGoster('Kayıt kaldırılamadı. Lütfen yeniden deneyin.');
        }
    }, []);

    if (!KildimGuvenServisi.kullanilabilirMi()) {
        return (
            <View className="flex-1 p-6 items-center justify-center" style={{ backgroundColor: renkler.arkaplan }}>
                <FontAwesome5 name="user-shield" size={28} color={renkler.metinIkincil} solid />
                <Text className="text-sm text-center mt-3" style={{ color: renkler.metinIkincil }}>
                    Bu ayar yalnız Android telefonlarda kullanılabilir.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: renkler.arkaplan }}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-sm mb-4" style={{ color: renkler.metinIkincil }}>
                Samsung Rutinler, Tasker gibi bir uygulama namazınızı kılındı olarak işaretlemek istediğinde size bir kez
                sorulur. Verdiğiniz kararlar burada listelenir; dilediğiniz zaman değiştirebilirsiniz.
            </Text>

            {liste != null && liste.length === 0 && (
                <View
                    testID="kildim-uygulamalari-bos"
                    className="p-6 items-center"
                    style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
                >
                    <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mb-3"
                        style={{ backgroundColor: renkler.birincil + '20' }}
                    >
                        <FontAwesome5 name="user-shield" size={18} color={renkler.birincil} solid />
                    </View>
                    <Text className="text-base font-bold text-center mb-1" style={{ color: renkler.metin }}>
                        Henüz bir karar vermediniz
                    </Text>
                    <Text className="text-sm text-center" style={{ color: renkler.metinIkincil }}>
                        Bir otomasyon ilk kez &quot;Kıldım&quot; gönderdiğinde size sorulur ve kararınız burada görünür.
                    </Text>
                </View>
            )}

            {liste != null && liste.length > 0 && (
                <View style={{ gap: 12 }}>
                    {liste.map((k) => {
                        const izinli = k.karar === 'izin';
                        const renk = izinli ? renkler.birincil : renkler.hata;
                        return (
                            <View
                                key={k.paket}
                                testID={`kildim-uygulama-${k.paket}`}
                                className="p-4"
                                style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, borderWidth: 1, borderColor: renkler.sinir }}
                            >
                                <View className="flex-row items-center">
                                    <View
                                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                                        style={{ backgroundColor: renk + '20' }}
                                    >
                                        <FontAwesome5 name={izinli ? 'check' : 'ban'} size={16} color={renk} solid />
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <Text className="text-base font-semibold" style={{ color: renkler.metin }} numberOfLines={1}>
                                            {k.ad}
                                        </Text>
                                        <Text className="text-xs" style={{ color: renkler.metinIkincil }} numberOfLines={1}>
                                            {guvenKarariEtiketi(k.karar)}
                                            {k.ad !== k.paket ? ` · ${k.paket}` : ''}
                                        </Text>
                                    </View>
                                    <Anahtar
                                        value={izinli}
                                        onValueChange={(v) => {
                                            kararDegistir(k, v).catch(() => undefined);
                                        }}
                                        trackColor={{ false: renkler.sinir, true: renkler.birincil + '60' }}
                                        thumbColor={izinli ? renkler.birincil : '#f4f3f4'}
                                        accessibilityLabel={`${k.ad}: namazlarınızı işaretleyebilsin`}
                                    />
                                </View>
                                <TouchableOpacity
                                    className="flex-row items-center self-start mt-3 px-3 rounded-xl"
                                    style={{ minHeight: 44 }}
                                    onPress={() => {
                                        kaldir(k).catch(() => undefined);
                                    }}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${k.ad} uygulamasını listeden kaldırın`}
                                >
                                    <FontAwesome5 name="trash-alt" size={13} color={renkler.metinIkincil} style={{ marginRight: 8 }} />
                                    <Text className="text-sm" style={{ color: renkler.metinIkincil }}>
                                        Listeden kaldırın
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            )}

            <Text className="text-xs mt-4" style={{ color: renkler.metinIkincil }}>
                Ana ekrandaki kısayollar, widget ve hızlı ayarlar kutusu her zaman çalışır; bu listeye girmez.
                Tarayıcılara kalıcı izin verilmez, çünkü her web sayfası bu bağlantıyı açabilir.
            </Text>
        </ScrollView>
    );
};
