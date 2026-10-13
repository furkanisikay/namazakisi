/**
 * "Son algılamalar" zaman çizelgesi — native olay günlüğünü kullanıcının
 * anlayacağı cümlelere çevirir: neden algılandı, neden algılanmadı.
 *
 * Kayıt: uygulamanın kullanıcıyla konuşması → kibar "siz". Bilinmeyen olay
 * türü atlanır (eski/yeni sürüm farkı ekranı bozmasın).
 */
import { AZAMI_DOGRULUK_M } from './camiTipleri';

export type OlayTonu = 'iyi' | 'notr' | 'uyari';

export interface OlaySatiri {
    zamanMs: number;
    ikon: string;
    baslik: string;
    aciklama?: string;
    ton: OlayTonu;
}

export interface HamOlay {
    zamanMs: number;
    tur: string;
    [ek: string]: unknown;
}

const VAKIT_ADLARI: Record<string, string> = {
    imsak: 'Sabah',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
};

const metin = (d: unknown): string | null => (typeof d === 'string' && d.trim() ? d.trim() : null);
const sayi = (d: unknown): number | null => (typeof d === 'number' && Number.isFinite(d) ? d : null);

export function olaySatiriOlustur(o: HamOlay): OlaySatiri | null {
    const yer = metin(o.yer) ?? 'Cami';
    const t = o.zamanMs;
    switch (o.tur) {
        case 'izlemeKuruldu':
            return {
                zamanMs: t,
                ikon: 'satellite-dish',
                baslik: `Yakınınızdaki ${sayi(o.sayi) ?? 0} yer izleniyor`,
                aciklama: 'Bekleme işini telefonun konum servisi yapar; uygulama yalnız bir olay olunca uyanır.',
                ton: 'notr',
            };
        case 'izinYok':
            return {
                zamanMs: t,
                ikon: 'lock',
                baslik: 'Konum izni eksik',
                aciklama:
                    o.izin === 'arkaPlanYok'
                        ? '"Her zaman" konum izni olmadan uygulama kapalıyken camide olduğunuz anlaşılamaz.'
                        : 'Konum izni verilmediği için camiler izlenemiyor.',
                ton: 'uyari',
            };
        case 'izlemeHatasi':
            return {
                zamanMs: t,
                ikon: 'exclamation-triangle',
                baslik: 'Camiler izlenemedi',
                aciklama: 'Telefonunuzun konumu kapalı olabilir. Açınca izleme yeniden kurulur.',
                ton: 'uyari',
            };
        case 'dwell':
            return {
                zamanMs: t,
                ikon: 'hourglass-half',
                baslik: `${yer} çevresinde ${sayi(o.dk) ?? 3} dakikayı geçtiniz`,
                aciklama: 'Telefon uygulamayı uyandırdı.',
                ton: 'notr',
            };
        case 'vakitDisi':
            return {
                zamanMs: t,
                ikon: 'clock',
                baslik: 'Vakit yakınında değildiniz',
                aciklama: 'Konum ölçülmedi, hiçbir şey yapılmadı. İsterseniz "Yalnız vakit yakınında" ayarını kapatabilirsiniz.',
                ton: 'iyi',
            };
        case 'olcum': {
            const dogruluk = sayi(o.dogrulukM);
            const mesafe = sayi(o.mesafeM);
            switch (o.sonuc) {
                case 'camide':
                    return {
                        zamanMs: t,
                        ikon: 'crosshairs',
                        baslik: `Hassas ölçüm: ${yer} alanının içindesiniz`,
                        aciklama: dogruluk != null ? `Ölçüm ${dogruluk} m doğrulukla alındı.` : undefined,
                        ton: 'iyi',
                    };
                case 'supheli':
                    return {
                        zamanMs: t,
                        ikon: 'question-circle',
                        baslik: 'Ölçüm yeterince hassas değildi',
                        aciklama: `${dogruluk != null ? `${dogruluk} m doğruluk ` : 'Doğruluk '}${AZAMI_DOGRULUK_M} m'den kaba. Yanlışlıkla sessize almamak için mod açılmadı.`,
                        ton: 'iyi',
                    };
                case 'disarida':
                    return {
                        zamanMs: t,
                        ikon: 'crosshairs',
                        baslik:
                            mesafe != null
                                ? `Hassas ölçüm: ${yer} alanının ${mesafe} m dışındasınız`
                                : 'Hassas ölçüm: bir caminin alanında değilsiniz',
                        aciklama: 'Camide sayılmadınız. Yanlışsa Camideyim ayarlarından alanı genişletebilirsiniz.',
                        ton: 'iyi',
                    };
                case 'konumYok':
                    return { zamanMs: t, ikon: 'map-marker-alt', baslik: 'Konum ölçülemedi', aciklama: 'Mod açılmadı.', ton: 'uyari' };
                default:
                    return null;
            }
        }
        case 'camide': {
            const mod =
                o.mod === 'acildi'
                    ? 'Namaz modu açıldı.'
                    : o.mod === 'kullaniciKapatti'
                      ? 'Namaz modunu bu vakit için kapatmıştınız.'
                      : o.mod === 'erisimYok'
                        ? 'Rahatsız Etmeyin erişimi olmadığı için Namaz modu açılamadı.'
                        : 'Hatırlatmalar sessiz gelir; kurulu sesli anonslar konuşmaz.';
            return { zamanMs: t, ikon: 'mosque', baslik: `Camidesiniz · ${yer}`, aciklama: mod, ton: 'iyi' };
        }
        case 'cikis':
            return {
                zamanMs: t,
                ikon: 'sign-out-alt',
                baslik: `${yer} alanından çıktınız`,
                aciklama: sayi(o.dk) != null ? `${sayi(o.dk)} dakika kaldınız.` : undefined,
                ton: 'iyi',
            };
        case 'sure':
            return {
                zamanMs: t,
                ikon: 'stopwatch',
                baslik: 'Üst süre doldu',
                aciklama: 'Çıkış algılanmadı; Camidesiniz hâli kendiliğinden kapandı.',
                ton: 'notr',
            };
        case 'kapatildi':
            return { zamanMs: t, ikon: 'power-off', baslik: 'Camidesiniz hâli kapatıldı', ton: 'notr' };
        case 'haricTutuldu':
            return {
                zamanMs: t,
                ikon: 'ban',
                baslik: `${yer} cami değil olarak işaretlendi`,
                aciklama: 'Burada artık "camidesiniz" denmez. Camideyim ayarlarından geri alabilirsiniz.',
                ton: 'notr',
            };
        case 'modElleKapatildi':
            return {
                zamanMs: t,
                ikon: 'toggle-off',
                baslik: 'Namaz modunu kapattınız',
                aciklama: 'Bu vakit için yeniden açılmayacak.',
                ton: 'notr',
            };
        case 'kildim': {
            const vakit = typeof o.vakit === 'string' ? VAKIT_ADLARI[o.vakit] : undefined;
            return { zamanMs: t, ikon: 'check-circle', baslik: `${vakit ?? 'Namaz'} kılındı olarak işaretlendi`, ton: 'iyi' };
        }
        case 'yenileme':
            if (o.sonuc === 'yenile') {
                return { zamanMs: t, ikon: 'sync-alt', baslik: 'Uzaklaştınız; yakın camiler yenilendi', ton: 'notr' };
            }
            if (o.sonuc === 'bayatKonum') {
                return {
                    zamanMs: t,
                    ikon: 'sync-alt',
                    baslik: 'Konum ölçülemedi; liste daha sonra yenilenecek',
                    ton: 'notr',
                };
            }
            return null;
        default:
            return null;
    }
}

/** En yeni üstte; tanınmayan olaylar atılır. */
export function zamanCizelgesiOlustur(olaylar: readonly HamOlay[], azami = 30): OlaySatiri[] {
    return olaylar
        .filter((o) => o && typeof o.zamanMs === 'number' && typeof o.tur === 'string')
        .map(olaySatiriOlustur)
        .filter((s): s is OlaySatiri => s != null)
        .sort((a, b) => b.zamanMs - a.zamanMs)
        .slice(0, azami);
}
