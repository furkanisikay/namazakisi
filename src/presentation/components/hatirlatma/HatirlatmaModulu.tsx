/**
 * BİRLEŞİK HATIRLATMA MODÜLÜ — tek bileşen (plan §3.2, PR-3).
 *
 * Her hatırlatma yüzeyinin GÖVDESİ: kart (`PencereKarti` — yön, zaman şeridi, adım listesi,
 * ekle, akışı önizle), adım detayı (`AdimDetayModal` — sesli okuma ve gerçek alarm rıza
 * modalları onun ağacında) ve akış önizlemesi (`AkisOnizlemeModal`). Durum makinesi
 * `useHatirlatmaDuzenleyici`'dedir; yüzey yalnız `PencereTanimi`, kendi değeri, dönüşümleri
 * (kısıtlarıyla), yazıcısı ve rıza durumunu verir.
 *
 * Yüzeye özgü ÜST ayarlar (cuma ana anahtarı, camiye gitme vakit çipleri, yatış saati, takvim
 * rızası, muhafız yoğunluğu) modülün DIŞINDA kalır.
 *
 * Adım aç/kapa anahtarı: muhafızda daima; ek yüzeyde ve nafilede birden çok adım varken (tek
 * adımda yüzeyin kendi ana anahtarı aynı işi yapar).
 */
import * as React from 'react';
import type { VakitMuhafizAyari } from '../../../core/muhafiz/matrisTipleri';
import type { PencereYonu } from '../../../core/muhafiz/pencereTipleri';
import { PencereKarti } from './PencereKarti';
import { AdimDetayModal } from './AdimDetayModal';
import { AkisOnizlemeModal } from './AkisOnizlemeModal';
import type { PencereTanimi } from './pencereTanimi';
import {
    useHatirlatmaDuzenleyici,
    type HatirlatmaDuzenleyiciSecenekleri,
    type HatirlatmaIslemleri,
} from '../../hooks/useHatirlatmaDuzenleyici';
import {
    adimEkle,
    adimGuncelle,
    adimSil,
    type AdimKisitlari,
    type AdimliAyar,
} from '../../../core/hatirlatma/adimDizisi';

/**
 * Ek yüzeylerin (cuma, camiye gitme, yatış, takvim) dönüşümleri — ortak adım dizisinin
 * (`core/hatirlatma/adimDizisi.ts`) yüzey kısıtlarıyla çağrılması. Modül düzeyinde bir kez
 * kurulmalı (referans sabit kalsın).
 */
export function ekAdimIslemleri<T extends AdimliAyar>(
    kisit: AdimKisitlari,
    yon: PencereYonu = 'cikisaDogru'
): HatirlatmaIslemleri<T> {
    return {
        adimlar: (a) => a.adimlar,
        ekle: (a) => adimEkle(a, yon, kisit),
        guncelle: (a, i, s) => adimGuncelle(a, i, s, yon, kisit),
        sil: (a, i) => adimSil(a, i),
    };
}

export interface HatirlatmaModuluProps<T> extends Omit<HatirlatmaDuzenleyiciSecenekleri<T>, 'yon' | 'bosMetinOtomatik'> {
    tanim: PencereTanimi;
    ttsDestekli: boolean | null;
    /** Rıza kayıtları (yüzeyin kendi alanı). */
    sesliOnayiVar: boolean;
    alarmOnayiVar: boolean;
    /** Sesli rıza modalının yüzeye özgü metinleri. */
    sesliOnayMetinleri?: { altBaslik?: string; kapatmaNotu?: string };
    /** Adım silinebilir mi (en az bir hatırlatma kalır). */
    silinebilirMi: (deger: T) => boolean;
    /** `'herZaman'` (muhafız) | `'cokAdimda'` (ek yüzey/nafile — tek adımda ana anahtar yeter). */
    adimAnahtari?: 'herZaman' | 'cokAdimda';
    stil?: 'kart' | 'gomulu';
    acikMi?: boolean;
    onAcKapa?: () => void;
    onYonDegistir?: (yon: PencereYonu) => void;
    karsiYonAyari?: VakitMuhafizAyari;
    onTumPencerelereUygula?: () => void;
}

export function HatirlatmaModulu<T>(props: HatirlatmaModuluProps<T>) {
    const {
        tanim,
        deger,
        islemler,
        ttsDestekli,
        sesliOnayiVar,
        alarmOnayiVar,
        sesliOnayMetinleri,
        silinebilirMi,
        adimAnahtari = 'cokAdimda',
        stil,
        acikMi,
        onAcKapa,
        onYonDegistir,
        karsiYonAyari,
        onTumPencerelereUygula,
    } = props;
    const d = useHatirlatmaDuzenleyici<T>({
        deger,
        yon: tanim.yon,
        islemler,
        yaz: props.yaz,
        bosMetinOtomatik: tanim.bosMetinOtomatik,
        onDetayAcildi: props.onDetayAcildi,
        onDetayKapandi: props.onDetayKapandi,
    });
    const seviyeler = islemler.adimlar(deger);
    const ayar: VakitMuhafizAyari = { yon: tanim.yon, seviyeler };
    const anahtarVar = adimAnahtari === 'herZaman' || seviyeler.length > 1;
    const detaySeviyesi = d.detay !== null ? seviyeler[d.detay] : undefined;

    return (
        <>
            <PencereKarti
                tanim={tanim}
                ayar={ayar}
                acikMi={acikMi}
                onAcKapa={onAcKapa}
                onAdimSec={d.detayiAc}
                onAdimAcKapa={anahtarVar ? d.adimAcKapa : undefined}
                onAdimEkle={d.adimEkle}
                onAkisiOnizle={d.onizlemeyiAc}
                onYonDegistir={onYonDegistir}
                karsiYonAyari={karsiYonAyari}
                onTumPencerelereUygula={onTumPencerelereUygula}
                stil={stil}
            />

            {d.detay !== null && detaySeviyesi && (
                <AdimDetayModal
                    gorunur
                    tanim={tanim}
                    seviyeler={seviyeler}
                    indeks={d.detay}
                    ttsDestekli={ttsDestekli}
                    onDegistir={(seviye, riza) => d.adimDegistir(d.detay as number, seviye, riza)}
                    onKapat={d.detayiKapat}
                    onSil={silinebilirMi(deger) ? () => d.adimSil(d.detay as number) : undefined}
                    alarmOnayiVar={alarmOnayiVar}
                    sesliOnayiVar={sesliOnayiVar}
                    sesliOnayMetinleri={sesliOnayMetinleri}
                />
            )}

            {d.onizlemeAcik && (
                <AkisOnizlemeModal gorunur tanim={tanim} ayar={ayar} ttsDestekli={ttsDestekli} onKapat={d.onizlemeyiKapat} />
            )}
        </>
    );
}
