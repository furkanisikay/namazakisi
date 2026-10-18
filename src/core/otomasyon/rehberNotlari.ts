/**
 * Otomasyon rehberinin cihaza/ayara bağlı notları — SAF (sade tasarım, Dalga 1).
 *
 * "vakti girdi" anahtar kelimesi vakit bildirimi, "Camidesiniz" Camideyim bildirimi
 * gelince tetiklenir. Eskiden herkese "…açık olmalı" deniyordu; şimdi ölçülür:
 * ikisi de açıksa not yok, kapalı olan söylenir; hiçbiri kapalı değil ama biri
 * bilinmiyorsa genel cümle kalır.
 */
import { turkceBuyukHarf } from '../utils/turkceHarf';

/** Genel (durum bilinmiyorken) cümle. */
export const ONKOSUL_GENEL =
    '"vakti girdi" için Bildirim Ayarları\'nda vakit bildirimleri, "Camidesiniz" için Camideyim açık olmalı.';

export function rutinOnkosulNotu(vakitBildirimiAcik: boolean | null, camideyimAcik: boolean | null): string | null {
    if (vakitBildirimiAcik === true && camideyimAcik === true) return null;
    const parcalar: string[] = [];
    if (vakitBildirimiAcik === false) {
        parcalar.push('vakit bildirimleri kapalı olduğu için "vakti girdi" tetiklenmez (Bildirim Ayarları\'ndan açabilirsiniz)');
    }
    if (camideyimAcik === false) parcalar.push('Camideyim kapalı olduğu için "Camidesiniz" tetiklenmez');
    if (parcalar.length === 0) return ONKOSUL_GENEL;
    const cumle = parcalar.join('; ');
    return `${turkceBuyukHarf(cumle.charAt(0))}${cumle.slice(1)}.`;
}

/** One UI sürümü okunamaz → cümle sürüm adı vermeden yazılır. */
export const ONE_UI_NOTU =
    'Bazı One UI sürümlerinde aynı anda yalnız bir bildirimle tetiklenen rutinin çalıştığı bildiriliyor. Birden çok rutin kurduysanız tek rutinde birleştirmeyi deneyin.';
