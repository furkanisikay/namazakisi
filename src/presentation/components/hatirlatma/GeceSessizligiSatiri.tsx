/**
 * "Gece sessiz saatler" — Hatırlatmalar sayfasında TEK satır (anahtar + canlı cümle) ve
 * metne dokununca başlangıç saati seçimi. Kural `core/muhafiz/geceSessizligi.ts`'te;
 * bu bileşen yalnız ayarı gösterir/yazar (yazım çağıranın: muhafız kaydı + planlama).
 *
 * Mevcut kullanıcıda alan yoktur → KAPALI görünür ve özet ne kazanacağını söyler
 * (göç yok, sahip kararı). Açılınca saat korunur ya da varsayılan 23:00 gelir.
 */
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import { AnahtarSatiri } from '../ortak/AnahtarSatiri';
import { BildirimModali } from '../common/BildirimModali';
import {
    GECE_BASLANGIC_SECENEKLERI,
    VARSAYILAN_GECE_SESSIZLIGI,
    geceBaslangicMetni,
    type GeceSessizligi,
} from '../../../core/muhafiz/geceSessizligi';
import { geceSessizligiOzeti } from '../../../core/hatirlatma/hatirlatmaOzetleri';

export interface GeceSessizligiSatiriProps {
    ayar: GeceSessizligi | undefined;
    onDegistir: (yeni: GeceSessizligi) => void;
    testID?: string;
}

export const GeceSessizligiSatiri: React.FC<GeceSessizligiSatiriProps> = ({ ayar, onDegistir, testID = 'satir-gece-sessizligi' }) => {
    const renkler = useRenkler();
    const [acik, setAcik] = React.useState(false);
    const taban = ayar ?? { ...VARSAYILAN_GECE_SESSIZLIGI, aktif: false };
    const [secim, setSecim] = React.useState({ saat: taban.baslangicSaat, dakika: taban.baslangicDakika });

    const ac = () => {
        setSecim({ saat: taban.baslangicSaat, dakika: taban.baslangicDakika });
        setAcik(true);
    };

    return (
        <>
            <AnahtarSatiri
                ikon="cloud-moon"
                baslik="Gece sessiz saatler"
                ozet={geceSessizligiOzeti(ayar)}
                deger={ayar?.aktif === true}
                onDegistir={(v) => onDegistir({ ...taban, aktif: v })}
                onPress={ac}
                testID={testID}
            />
            <BildirimModali
                gorunur={acik}
                tip="bilgi"
                baslik="Gece sessiz saatler"
                mesaj="Seçtiğiniz saatten imsağa kadar vakit çıkmadan hatırlatması gelmez. Yatsı hatırlatmaları ve yatsıya kurduğunuz alarm sessizlik başlamadan önce gelir. Diğer alarmlarınız yine çalar."
                icerik={
                    <View
                        accessibilityRole="radiogroup"
                        accessibilityLabel="Sessizlik başlangıcı"
                        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}
                    >
                        {GECE_BASLANGIC_SECENEKLERI.map((s) => {
                            const metin = geceBaslangicMetni({ baslangicSaat: s.saat, baslangicDakika: s.dakika });
                            const secili = s.saat === secim.saat && s.dakika === secim.dakika;
                            return (
                                <TouchableOpacity
                                    key={metin}
                                    testID={`gece-baslangic-${metin}`}
                                    onPress={() => setSecim(s)}
                                    accessibilityRole="radio"
                                    accessibilityLabel={metin}
                                    accessibilityState={{ selected: secili, checked: secili }}
                                    style={{
                                        minWidth: 72,
                                        minHeight: 44,
                                        paddingHorizontal: 12,
                                        borderRadius: 14,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: secili ? renkler.birincil : renkler.sinir,
                                        backgroundColor: secili ? renkler.birincil : renkler.arkaplan,
                                    }}
                                >
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: secili ? renkler.birincilMetin : renkler.metin }}>
                                        {metin}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                }
                birincilEtiket="Kaydedin"
                birincilIkon="check"
                onBirincil={() => {
                    onDegistir({ aktif: true, baslangicSaat: secim.saat, baslangicDakika: secim.dakika });
                    setAcik(false);
                }}
                onKapat={() => setAcik(false)}
                kapatEtiketi="Vazgeçin"
            />
        </>
    );
};
