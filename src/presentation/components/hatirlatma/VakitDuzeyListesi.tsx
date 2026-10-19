/**
 * "Vakit vakit" — her vakte ayrı düzey (Hafif · Normal · Yoğun), persona çalışması
 * 2026-10-19 ("akşamları daha az bildirim, diğerleri kalsın": 12 dokunuş → 2).
 *
 * Seçili düzey SAKLANMAZ, matristen TÜRETİLİR (`vakitPresetleUyumluMu`): vaktin
 * zamanlaması hangi hazır düzeyle birebir aynıysa o seçili görünür; hiçbiri değilse
 * "Kendi ayarınız" yazılır. Şema/göç yok. Yazım çağıranın (`presetVakteUygula` +
 * planlama + sığma simülasyonu). Etiketler düzey seçicisiyle AYNI sözlükten
 * (`DUZEY_ADLARI`) — aynı ekranda iki ayrı sözcük takımı olmasın.
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import { useRenkler } from '../../../core/theme';
import type { MuhafizMatrisi, MuhafizVakti } from '../../../core/muhafiz/matrisTipleri';
import { MUHAFIZ_VAKITLERI } from '../../../core/muhafiz/matrisTipleri';
import { vakitPresetleUyumluMu } from '../../../core/muhafiz/matrisIslemleri';
import { DUZEY_ADLARI } from '../../../core/hatirlatma/duzeyOzeti';
import { VAKIT_ADLARI } from '../../../core/utils/muhafizMetinYardimcisi';
import { HATIRLATMA_PRESETLERI } from '../../store/muhafizSlice';
import { ParcaliSecici } from './ParcaliSecici';

export type VakitDuzeyi = 'hafif' | 'normal' | 'yogun';
const DUZEYLER: readonly VakitDuzeyi[] = ['hafif', 'normal', 'yogun'];

/** Vaktin zamanlaması hangi hazır düzeye birebir uyuyor? (uymuyorsa `null`) */
export function vakitDuzeyiniBul(matris: MuhafizMatrisi, vakit: MuhafizVakti): VakitDuzeyi | null {
    const v = matris[vakit];
    if (!v) return null;
    return DUZEYLER.find((d) => vakitPresetleUyumluMu(v, vakit, HATIRLATMA_PRESETLERI[d].seviyeler, d)) ?? null;
}

/** Beş vakit aynı hazır düzeydeyse o düzey, değilse `null` (= "Kendi ayarınız"). */
export function ortakDuzeyiBul(matris: MuhafizMatrisi): VakitDuzeyi | null {
    const ilk = vakitDuzeyiniBul(matris, MUHAFIZ_VAKITLERI[0]);
    if (!ilk) return null;
    return MUHAFIZ_VAKITLERI.every((v) => vakitDuzeyiniBul(matris, v) === ilk) ? ilk : null;
}

export interface VakitDuzeyListesiProps {
    matris: MuhafizMatrisi;
    onSec: (vakit: MuhafizVakti, duzey: VakitDuzeyi) => void;
    /** Gece sessizliği açık mı (yatsı uyarıları sessizliğin başlangıcına çapalanır — söylenir). */
    geceSessiz?: boolean;
    /** Bugün yatsı sessizlikten SONRA giriyor (yatsı hatırlatması gelmez — söylenir). */
    yatsiDustu?: boolean;
}

export const VakitDuzeyListesi: React.FC<VakitDuzeyListesiProps> = ({ matris, onSec, geceSessiz = false, yatsiDustu = false }) => {
    const renkler = useRenkler();
    return (
        <View
            testID="vakit-duzey-listesi"
            style={{ backgroundColor: renkler.kartArkaplan, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 12 }}
        >
            {MUHAFIZ_VAKITLERI.map((vakit, i) => {
                const secili = vakitDuzeyiniBul(matris, vakit);
                const yatsiGece = vakit === 'yatsi' && geceSessiz;
                return (
                    <View key={vakit} style={{ paddingVertical: 10, borderTopWidth: i > 0 ? 0.5 : 0, borderTopColor: renkler.sinir }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: renkler.metin }}>{VAKIT_ADLARI[vakit]}</Text>
                            {secili === null ? (
                                <Text testID={`vakit-duzey-${vakit}-ozel`} style={{ fontSize: 14, color: renkler.metin }}>
                                    Kendi ayarınız
                                </Text>
                            ) : null}
                        </View>
                        <ParcaliSecici
                            secenekler={DUZEYLER.map((d) => ({
                                deger: d,
                                etiket: DUZEY_ADLARI[d],
                                erisimEtiketi: `${VAKIT_ADLARI[vakit]}: ${DUZEY_ADLARI[d]}`,
                                testID: `vakit-duzey-${vakit}-${d}`,
                            }))}
                            secili={secili}
                            onSec={(d) => onSec(vakit, d)}
                        />
                        {yatsiGece ? (
                            <Text testID="vakit-duzey-yatsi-gece" style={{ fontSize: 14, lineHeight: 20, marginTop: 8, color: renkler.metin }}>
                                {yatsiDustu
                                    ? 'Bugün yatsı gece sessizliğinden sonra giriyor; yatsı hatırlatması gelmez.'
                                    : 'Yatsı uyarıları gece sessizliğinden önce gelir.'}
                            </Text>
                        ) : null}
                    </View>
                );
            })}
        </View>
    );
};
