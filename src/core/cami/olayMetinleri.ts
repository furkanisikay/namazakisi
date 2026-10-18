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

/** Güven puanı gerekçeleri — "neden sorduk / neden açmadık" (Faz 2). */
const ZAMAN_METNI: Record<string, string> = {
    cuma: 'cuma namazı vakti',
    ezanYakin: 'ezan vaktine yakın',
    kapiIci: 'vakit içinde ama ezandan uzak',
    serbest: 'vakit yakınında değil',
};
const YER_METNI: Record<string, string> = {
    poligonIci: 'caminin binası içinde',
    kullaniciAlani: 'seçtiğiniz alanın içinde',
    noktaMerkez: 'caminin hemen yanında',
    noktaKenar: 'caminin alanının kenarında',
    tampon: 'binanın hemen dışında',
};
const HAREKET_METNI: Record<string, string> = {
    durgun: 'duruyordunuz',
    yavas: 'yavaş hareket ediyordunuz',
    hareketli: 'hareket hâlindeydiniz',
};
const TAVAN_METNI: Record<string, string> = {
    gecipGidiyor: 'Önünden geçiyor gibiydiniz; hiçbir şey yapılmadı.',
    hareketli: 'Hareket hâlinde olduğunuz için kendiliğinden açılmadı.',
    kenar: 'Bina dışında (ör. yolda) olabileceğiniz için kendiliğinden açılmadı.',
    vakitDisi: 'Vakit yakınında olmadığınız için kendiliğinden açılmadı.',
};

/**
 * Cümle başını büyütür — `toUpperCase`/`toLocaleUpperCase` YOK (AGENTS.md: 'i' → 'I'
 * tuzağı; Hermes'te Intl'e güvenilmez). Sabit Türkçe harita.
 */
const BUYUK_HARF: Record<string, string> = {
    a: 'A', b: 'B', c: 'C', ç: 'Ç', d: 'D', e: 'E', f: 'F', g: 'G', ğ: 'Ğ', h: 'H', ı: 'I', i: 'İ', j: 'J', k: 'K',
    l: 'L', m: 'M', n: 'N', o: 'O', ö: 'Ö', p: 'P', r: 'R', s: 'S', ş: 'Ş', t: 'T', u: 'U', ü: 'Ü', v: 'V', y: 'Y', z: 'Z',
};
export const ilkHarfiBuyut = (m: string): string => (m ? (BUYUK_HARF[m.charAt(0)] ?? m.charAt(0)) + m.slice(1) : m);

/** "ezan vaktine yakın · caminin binası içinde · duruyordunuz" */
export function guvenGerekcesi(o: Readonly<Record<string, unknown>>): string {
    const parcalar = [
        typeof o.zaman === 'string' ? ZAMAN_METNI[o.zaman] : undefined,
        typeof o.yerSinifi === 'string' ? YER_METNI[o.yerSinifi] : undefined,
        typeof o.hareket === 'string' ? HAREKET_METNI[o.hareket] : undefined,
    ].filter((p): p is string => !!p);
    return parcalar.join(' · ');
}

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
        case 'guven': {
            const gerekce = guvenGerekcesi(o);
            const tavan = typeof o.tavan === 'string' ? TAVAN_METNI[o.tavan] : undefined;
            const bicimNotu =
                o.bicim === 'sorarak' && o.eylem === 'sor' && o.guvenKarari === 'otomatik'
                    ? '"Sorarak aç" seçili olduğu için sorulacak.'
                    : o.bicim === 'otomatik' && o.eylem === 'otomatik' && o.guvenKarari === 'sor'
                      ? '"Otomatik aç" seçili olduğu için açılacak.'
                      : undefined;
            const aciklama = [gerekce ? `${ilkHarfiBuyut(gerekce)}.` : null, tavan, bicimNotu]
                .filter(Boolean)
                .join(' ');
            const baslik =
                o.eylem === 'otomatik'
                    ? `Güven yüksek: ${yer}`
                    : o.eylem === 'sor'
                      ? `Emin olunamadı, size sorulacak: ${yer}`
                      : `Camide sayılmadınız: ${yer}`;
            return {
                zamanMs: t,
                ikon: o.eylem === 'otomatik' ? 'check-double' : o.eylem === 'sor' ? 'question-circle' : 'walking',
                baslik,
                aciklama: aciklama || undefined,
                ton: o.eylem === 'otomatik' ? 'iyi' : 'notr',
            };
        }
        case 'soruldu':
            return {
                zamanMs: t,
                ikon: 'bell',
                baslik: '"Camide misiniz?" diye soruldu',
                aciklama: 'Bildirimden Namaz modunu açabilir ya da "Hayır" diyebilirsiniz.',
                ton: 'notr',
            };
        case 'soruKabul':
            return { zamanMs: t, ikon: 'check', baslik: `Camide olduğunuzu onayladınız · ${yer}`, ton: 'iyi' };
        case 'soruRet':
            return {
                zamanMs: t,
                ikon: 'times',
                baslik: `"Hayır" dediniz · ${yer}`,
                aciklama: 'Bu vakit için burada bir daha sorulmayacak.',
                ton: 'notr',
            };
        case 'soruCikis':
            return { zamanMs: t, ikon: 'sign-out-alt', baslik: 'Soru cevaplanmadan alandan çıktınız', ton: 'notr' };
        case 'reddedilmis':
            return {
                zamanMs: t,
                ikon: 'times-circle',
                baslik: 'Bu vakitte "Hayır" demiştiniz',
                aciklama: 'Konum ölçülmedi, hiçbir şey yapılmadı.',
                ton: 'iyi',
            };
        case 'camide': {
            const mod =
                o.mod === 'acildi'
                    ? 'Namaz modu açıldı.'
                    : o.mod === 'kullaniciKapatti'
                      ? 'Namaz modunu bu vakit için kapatmıştınız.'
                      : o.mod === 'erisimYok'
                        ? 'Rahatsız Etmeyin erişimi olmadığı için Namaz modu açılamadı.'
                        : 'Hatırlatmalar sessiz gelir; sesli okumalar duyulmaz.';
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
