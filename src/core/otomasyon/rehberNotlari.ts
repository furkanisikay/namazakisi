/**
 * Otomasyon rehberinin cihaza/ayara bağlı notları — SAF (sade tasarım, Dalga 1).
 *
 * "vakti girdi" anahtar kelimesi vakit bildirimi, "Camidesiniz" Camideyim bildirimi
 * gelince tetiklenir. Eskiden herkese "…açık olmalı" deniyordu; şimdi ölçülür:
 * ikisi de açıksa not yok, kapalı olan söylenir; hiçbiri kapalı değil ama biri
 * bilinmiyorsa genel cümle kalır.
 */
import { bicim, metin } from '../dil/aktifDil';
import { CAMIDESINIZ_ANAHTAR_KELIMESI, vakitGirdiEki } from './anahtarKelimeler';

const yerTutucular = () => ({ vakit: vakitGirdiEki(), cami: CAMIDESINIZ_ANAHTAR_KELIMESI });

/** Genel (durum bilinmiyorken) cümle. */
export const onkosulGenel = (): string => bicim(metin().muhafizAyar.rehberNot.genel, yerTutucular());

export function rutinOnkosulNotu(vakitBildirimiAcik: boolean | null, camideyimAcik: boolean | null): string | null {
    if (vakitBildirimiAcik === true && camideyimAcik === true) return null;
    const r = metin().muhafizAyar.rehberNot;
    const y = yerTutucular();
    // Cümle başı ayrı anahtardır (büyük harf dönüşümü yok); cami parçası tırnakla başlar.
    const parcalar: string[] = [];
    if (vakitBildirimiAcik === false) parcalar.push(bicim(r.vakitKapaliBas, y));
    if (camideyimAcik === false) parcalar.push(bicim(r.camiKapali, y));
    if (parcalar.length === 0) return onkosulGenel();
    return bicim(r.cumle, { cumle: parcalar.join(r.ayrac) });
}

/** One UI sürümü okunamaz → cümle sürüm adı vermeden yazılır. */
export const oneUiNotu = (): string => metin().muhafizAyar.rehberNot.oneUi;
