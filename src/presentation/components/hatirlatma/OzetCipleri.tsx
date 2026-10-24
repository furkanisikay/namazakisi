/**
 * ÖZET ÇİPLERİ — hatırlatma özetlerinin görsel dili (sahip geri bildirimi 2026-10).
 *
 * "20 dk kala · bildirim + sesli okuma · titreşim · alarm" gibi orta noktalı metin
 * özetlerinin yerine geçer: her kanal küçük, tonlu bir ikon çipidir; tekrar varsa
 * yanında "↻ 5 dk" rozeti durur; ton (sertlik) ayrı bir renk noktasıyla gösterilebilir.
 *
 * ERİŞİLEBİLİRLİK: çip satırı ekran okuyucudan GİZLİDİR — bilgi hiçbir zaman yalnız
 * ikonla verilmez; çipleri taşıyan satırın `accessibilityLabel`'ı tam cümleyi
 * (`seviyeOzetiOlustur` / `vakitOzetiOlustur`) okur. Çipler ayrıca okunsaydı TalkBack
 * aynı bilgiyi iki kez söylerdi.
 *
 * Renk: çip zemini `renk + '20'` (proje deseni), ikon `renk`; metin daima tema metni.
 */
import * as React from 'react';
import { Text, View } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRenkler } from '../../../core/theme';
import type { OzetKanali } from '../../../core/muhafiz/seviyeOzeti';
import { bicim } from '../../../core/dil/aktifDil';
import { useMetin } from '../../hooks/useMetin';

/** Kanal → ikon (FontAwesome5). Tek kaynak: kart, önizleme ve detay aynı ikonu kullanır. */
export const KANAL_IKONLARI: Record<OzetKanali, string> = {
    bildirim: 'bell',
    sesli: 'volume-up',
    titresim: 'mobile-alt',
    alarm: 'clock',
};

export interface OzetCipleriProps {
    kanallar: readonly OzetKanali[];
    /** Çip rengi (adımın ton rengi ya da birincil). */
    renk: string;
    /** Tekrar aralığı (dk) — verilirse "↻ N dk" rozeti çizilir. */
    tekrarDk?: number;
    /** Ton noktası (Gelişmiş başlığında nazik dışı sertlik). */
    ton?: { ikon: string; renk: string };
    /** Bildirim sesi adı — yalnız ÖZEL ses seçildiyse gösterilir (varsayılan sesi yazmak gürültüdür). */
    sesAdi?: string;
    boyut?: 'kucuk' | 'normal';
    testID?: string;
}

export const OzetCipleri: React.FC<OzetCipleriProps> = ({ kanallar, renk, tekrarDk, ton, sesAdi, boyut = 'normal', testID }) => {
    const renkler = useRenkler();
    const dkSablonu = useMetin().hatirlatma.onizleme.dk;
    const cap = boyut === 'kucuk' ? 20 : 24;
    const ikonBoyu = boyut === 'kucuk' ? 9 : 11;
    return (
        <View
            testID={testID}
            className="flex-row items-center flex-wrap"
            style={{ gap: 5 }}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
        >
            {kanallar.map((k) => (
                <View
                    key={k}
                    testID={testID ? `${testID}-${k}` : undefined}
                    className="items-center justify-center"
                    style={{ width: cap, height: cap, borderRadius: cap / 2, backgroundColor: `${renk}20` }}
                >
                    <FontAwesome5 name={KANAL_IKONLARI[k]} size={ikonBoyu} color={renk} solid />
                </View>
            ))}
            {ton && (
                <View
                    className="items-center justify-center"
                    style={{ width: cap, height: cap, borderRadius: cap / 2, backgroundColor: `${ton.renk}20` }}
                >
                    <FontAwesome5 name={ton.ikon} size={ikonBoyu} color={ton.renk} solid />
                </View>
            )}
            {tekrarDk !== undefined && (
                <View
                    className="flex-row items-center px-2 rounded-full"
                    style={{ height: cap, backgroundColor: renkler.arkaplan, borderWidth: 1, borderColor: renkler.sinir }}
                >
                    <FontAwesome5 name="redo" size={ikonBoyu - 1} color={renkler.metinIkincil} style={{ marginRight: 4 }} />
                    <Text className="text-[11px] font-semibold" style={{ color: renkler.metin }}>
                        {bicim(dkSablonu, { dk: tekrarDk })}
                    </Text>
                </View>
            )}
            {!!sesAdi && (
                <Text className="text-[11px] ml-0.5" numberOfLines={1} style={{ color: renkler.metinIkincil, maxWidth: 140 }}>
                    {sesAdi}
                </Text>
            )}
        </View>
    );
};
