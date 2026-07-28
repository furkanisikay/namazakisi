/**
 * Konum Değişikliği Servisi — konuma bağlı HER ŞEYİN tek yayma noktası
 *
 * NEDEN VAR: Konum değişince yalnız namaz vakitleri değil, onlardan türeyen her
 * şey değişir — muhafız bildirimleri, TTS anons alarmları, geri sayım bildirimi,
 * iftar/sahur sayaçları, vakit girdi bildirimleri ve ana ekran widget'ı. Bu liste
 * eskiden İKİ ayrı yerde yaşıyordu: `App.tsx` açılışta yedisini de beslerken,
 * konum değişim yolu (arka plan görevi) yalnızca muhafızı besliyordu. Sonuç:
 * kullanıcı İstanbul'dan Erzurum'a uçup uygulamayı açmazsa muhafız onu takip
 * ediyor ama geri sayım, iftar/sahur ve widget İstanbul'da kalıyordu.
 *
 * Bu dosya o listenin TEK sahibidir. Yeni bir konuma-bağlı tüketici eklendiğinde
 * buraya eklenir; çağıranlar (geofence çıkış olayı, arka plan onarım görevi,
 * uygulama açılışı) listeyi bilmez. Nöbetçi test her tüketicinin çağrıldığını
 * doğrular — liste bir daha ayrışamaz.
 *
 * STORE'A BAĞIMLI DEĞİLDİR (domain kuralı): arka plan görevi Redux olmadan
 * çalışır, bu yüzden tüm ayarlar ham AsyncStorage'dan okunur ve tipler dosya
 * içinde yerelleştirilmiştir (yapısal uyum yeter).
 *
 * KAPSAM DIŞI: Takvim olayları (`TakvimServisi`) bilinçli olarak dahil DEĞİL —
 * store thunk'ı (`takvimSlice`) üzerinden gidiyor ve kullanıcı uygulamayı
 * açtığında zaten tazeleniyor.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from '../../core/utils/Logger';
import { muhafizMatrisiniCoz } from '../../core/muhafiz/motorAdaptoru';
import type { MuhafizMatrisi } from '../../core/muhafiz/matrisTipleri';
import {
    sayacBaslangicEsikleriHesapla,
    muhafizUyarilanVakitleriBul,
} from '../../core/utils/vakitSayacYardimcisi';
import { DEPOLAMA_ANAHTARLARI } from '../../core/constants/UygulamaSabitleri';
import { NamazVaktiHesaplayiciServisi } from './NamazVaktiHesaplayiciServisi';
import { ArkaplanMuhafizServisi } from './ArkaplanMuhafizServisi';
import { VakitBildirimYoneticiServisi } from './VakitBildirimYoneticiServisi';
import { VakitSayacBildirimServisi } from './VakitSayacBildirimServisi';
import { IftarSayacBildirimServisi } from './IftarSayacBildirimServisi';
import { SahurSayacBildirimServisi } from './SahurSayacBildirimServisi';
import { WidgetServisi } from './WidgetServisi';
import { CumaHatirlatmaServisi } from './CumaHatirlatmaServisi';

/** Koordinat çifti (store tipine bağlı olmamak için yerel) */
export interface Koordinatlar {
    lat: number;
    lng: number;
}

/**
 * Tek bir tüketiciyi hata-yalıtımlı çalıştırır.
 *
 * Kritik: ortak tek bir try/catch, ilk patlayan tüketicide zinciri keser ve
 * kalan tüm tüketicileri sessizce atlar (aynı tuzak `MuhafizKanalServisi` kanal
 * döngüsünde yaşandı). Her tüketici KENDİ catch'ine sahip olmalı.
 */
async function guvenliCalistir(ad: string, calistir: () => Promise<void> | void): Promise<void> {
    try {
        await calistir();
    } catch (e) {
        Logger.error('KonumDegisikligi', `${ad} guncellenemedi:`, e);
    }
}

/** Ham AsyncStorage'dan JSON okur; yoksa/bozuksa null döner (ASLA fırlatmaz) */
async function guvenliOku(anahtar: string): Promise<Record<string, unknown> | null> {
    try {
        const ham = await AsyncStorage.getItem(anahtar);
        if (!ham) return null;
        const cozulmus = JSON.parse(ham);
        // 'null' / '42' gibi nesne-dışı değerler downstream alan erişiminde çökerdi
        return cozulmus && typeof cozulmus === 'object' ? cozulmus : null;
    } catch (e) {
        Logger.warn('KonumDegisikligi', `${anahtar} okunamadi:`, e);
        return null;
    }
}

/**
 * Koordinat gerçek bir konum mu?
 *
 * `{lat:0, lng:0}` bu projede "henüz yapılandırılmadı" nöbetçisidir (App.tsx de
 * aynı kontrolü yapar) — Gine Körfezi'ne bildirim planlamak yerine atlanır.
 */
function koordinatGecerliMi(koordinatlar: Koordinatlar | null | undefined): koordinatlar is Koordinatlar {
    return (
        !!koordinatlar &&
        typeof koordinatlar.lat === 'number' &&
        typeof koordinatlar.lng === 'number' &&
        Number.isFinite(koordinatlar.lat) &&
        Number.isFinite(koordinatlar.lng) &&
        !(koordinatlar.lat === 0 && koordinatlar.lng === 0)
    );
}

/**
 * Konum değişikliğini konuma bağlı TÜM tüketicilere yayar.
 *
 * SIRA ZORUNLU: `NamazVaktiHesaplayiciServisi.yapilandir` ÖNCE çağrılır, çünkü
 * `VakitBildirimYoneticiServisi.bildirimleriGuncelle()` koordinatı o singleton'ın
 * `getKonfig()`'inden okur. Arka plan görevinde singleton taze/yapılandırılmamış
 * olduğu için, sıra bozulursa vakit bildirimleri "Konum yok" deyip HİÇ planlanmaz
 * (uygulama içinde ise bayat koordinatla planlanır). Geri kalan tüketiciler
 * birbirinden bağımsızdır ve paralel çalışır.
 *
 * @param koordinatlar Yeni konum. Geçersizse (0/0, NaN) hiçbir şey yapılmaz.
 */
export async function konumDegistiUygula(koordinatlar: Koordinatlar): Promise<void> {
    if (!koordinatGecerliMi(koordinatlar)) {
        Logger.warn('KonumDegisikligi', 'Gecersiz koordinat, yayma atlandi');
        return;
    }

    // 1. SENKRON ÖN KOŞUL: hesaplayıcıyı yapılandır (bkz. yukarıdaki sıra notu)
    await guvenliCalistir('Namaz hesaplayici', () => {
        NamazVaktiHesaplayiciServisi.getInstance().yapilandir({
            latitude: koordinatlar.lat,
            longitude: koordinatlar.lng,
        });
    });

    // 2. Ayarları ham depolamadan oku (store yok — arka planda da çalışmalı)
    const [muhafizAyarlari, vakitSayacAyarlari, iftarAyarlari, sahurAyarlari] = await Promise.all([
        guvenliOku(DEPOLAMA_ANAHTARLARI.MUHAFIZ_AYARLARI),
        guvenliOku(DEPOLAMA_ANAHTARLARI.VAKIT_SAYAC_AYARLARI),
        guvenliOku(DEPOLAMA_ANAHTARLARI.IFTAR_SAYAC_AYARLARI),
        guvenliOku(DEPOLAMA_ANAHTARLARI.SAHUR_SAYAC_AYARLARI),
    ]);

    // Muhafiz matrisi TEK kaynak: matris varsa o, yoksa/bozuksa eski global
    // esik/sikliklardan turetilir (motorAdaptoru asla undefined dondurmez).
    // Global alanlar ZORUNLU oldugu icin tarihsel varsayilanlarla doldurulur.
    const eskiEsikler = (muhafizAyarlari?.esikler ?? {}) as Record<string, number | undefined>;
    const eskiSikliklar = (muhafizAyarlari?.sikliklar ?? {}) as Record<string, number | undefined>;
    const muhafizMatrisi = muhafizMatrisiniCoz({
        matris: muhafizAyarlari?.matris as MuhafizMatrisi | undefined,
        esikler: {
            seviye1: eskiEsikler.seviye1 || 45,
            seviye2: eskiEsikler.seviye2 || 25,
            seviye3: eskiEsikler.seviye3 || 10,
            seviye4: eskiEsikler.seviye4 || 3,
        },
        sikliklar: {
            seviye1: eskiSikliklar.seviye1 || 15,
            seviye2: eskiSikliklar.seviye2 || 10,
            seviye3: eskiSikliklar.seviye3 || 5,
            seviye4: eskiSikliklar.seviye4 || 1,
        },
    });
    const muhafizAktif = muhafizAyarlari?.aktif === true;

    // 3. Kalan tüketiciler paralel — her biri kendi hata yalıtımında
    await Promise.all([
        guvenliCalistir('Muhafiz bildirimleri', () =>
            ArkaplanMuhafizServisi.getInstance().yapilandirVePlanla({
                aktif: muhafizAktif,
                koordinatlar,
                matris: muhafizMatrisi,
            }),
        ),

        guvenliCalistir('Vakit bildirimleri', () =>
            VakitBildirimYoneticiServisi.getInstance().bildirimleriGuncelle(),
        ),

        guvenliCalistir('Vakit sayaci', () =>
            VakitSayacBildirimServisi.getInstance().yapilandirVePlanla({
                aktif: vakitSayacAyarlari?.aktif === true,
                koordinatlar,
                baslangicEsikleri: sayacBaslangicEsikleriHesapla(
                    typeof vakitSayacAyarlari?.sayacBaslangicSeviyesi === 'number'
                        ? vakitSayacAyarlari.sayacBaslangicSeviyesi
                        : 1,
                    muhafizMatrisi,
                ),
                // Bu ikisi eksik gecilirse sayac bastirmasi bozulur (AGENTS.md #90)
                muhafizAktif,
                muhafizUyarilanVakitler: muhafizUyarilanVakitleriBul(muhafizMatrisi),
            }),
        ),

        guvenliCalistir('Iftar sayaci', () =>
            IftarSayacBildirimServisi.getInstance().yapilandirVePlanla({
                aktif: iftarAyarlari?.aktif === true,
                koordinatlar,
            }),
        ),

        guvenliCalistir('Sahur sayaci', () =>
            SahurSayacBildirimServisi.getInstance().yapilandirVePlanla({
                aktif: sahurAyarlari?.aktif === true,
                koordinatlar,
            }),
        ),

        guvenliCalistir('Widget', () =>
            WidgetServisi.getInstance().vakitleriyaz(koordinatlar),
        ),

        // Cuma hatırlatması da konuma bağlıdır: öğle vakti kayınca hatırlatma anı
        // da kayar. Penceresi DÖRT HAFTA olduğu için bayatlığı diğer tüketicilerden
        // (bugün+yarın) çok daha uzun sürer — yayma noktasından düşerse kullanıcı
        // yeni şehrinde bir ay boyunca eski şehrin saatiyle hatırlatılır.
        guvenliCalistir('Cuma hatirlatmasi', () =>
            CumaHatirlatmaServisi.getInstance().hatirlatmalariGuncelle(koordinatlar),
        ),
    ]);

    Logger.info('KonumDegisikligi', 'Konuma bagli tum tuketiciler guncellendi');
}
