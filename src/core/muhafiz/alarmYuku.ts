/**
 * GERÇEK ALARM (issue #74) — kanal kimliği ve native yük sözleşmesi. SAF modül.
 *
 * Plan çekirdekte kalır: hangi tetiğin alarm olduğunu `motorAdaptoru.alarmAniMi`
 * (adımın İLK tetiği) söyler, `UyariPlani.alarm` taşır. Burada yalnız Android
 * teslimcisinin native `setAlarmClock` yoluna gönderdiği YÜK ve alarm bildirim
 * KANALININ kimliği üretilir.
 *
 * SÖZLEŞME İKİ TARAFTA KİLİTLİ: yük Kotlin `cekirdek/MuhafizAlarmKurallari.yukCoz`
 * ile çözülür; ikisi de `android/app/src/test/resources/muhafiz-alarm-ornekleri.json`
 * örneğini kabul eder (JS testi üretir ve karşılaştırır, JVM testi çözer). Alan eklerken
 * örneği de güncelle; biçim değişirse `ALARM_YUK_SURUMU`'nu iki tarafta birlikte artır.
 */
import type { VakitAdi } from '../types';
import type { MuhafizMatrisi } from './matrisTipleri';
import { MUHAFIZ_VAKITLERI } from './matrisTipleri';
import { adimKapaliMi } from './kanalKumesi';
import { alarmGerekliMi } from './motorAdaptoru';
import { ozelSesMi, sesGorunenAdi, sesHashi, sesKimliginiNormalize } from './sesKimligi';
import { VARSAYILAN_SES } from './matrisTipleri';
import { VAKIT_ADLARI } from '../utils/muhafizMetinYardimcisi';

/** Yük biçim sürümü — Kotlin `MuhafizAlarmKurallari.YUK_SURUMU`. */
export const ALARM_YUK_SURUMU = 1;

/** Alarm en fazla bu kadar çalar, sonra normal bildirime düşer — Kotlin `CALMA_SURESI_MS`. */
export const ALARM_CALMA_SURESI_DK = 2;

/**
 * Alarm kanalı öneki — Kotlin `MuhafizAlarmKurallari.KANAL_TABANI`.
 *
 * `muhafiz_` İLE BAŞLAMAZ (bilinçli): muhafız kanal çöp toplayıcısı `muhafiz_*` olup
 * listede olmayan her kanalı siler (`MuhafizKanallari.copleriTopla`) — alarm kanalı o
 * uzayda olsaydı her planlama turunda silinir, alarm var olmayan kanala giderdi.
 */
export const ALARM_KANAL_TABANI = 'namaz_alarm';

/**
 * Alarm kanalı kimliği = SESİN fonksiyonu (muhafız kanallarıyla aynı gerekçe: kanal
 * sesi oluşturulduktan sonra değiştirilemez, silip yeniden oluşturmak tombstone'a
 * takılır). Varsayılan ses → taban `namaz_alarm` (cihazın ALARM sesi), seçilen ses →
 * `namaz_alarm_<hash8>`. Önem ve titreşim alarmda sabittir, kimliğe girmez.
 */
export function alarmKanalIdOlustur(bildirimSesi: string | undefined | null): string {
    const ses = sesKimliginiNormalize(bildirimSesi);
    return ses === VARSAYILAN_SES ? ALARM_KANAL_TABANI : `${ALARM_KANAL_TABANI}_${sesHashi(ses)}`;
}

/** Android bildirim ayarlarında görünen kanal adı (kibar, ayırt edilebilir). */
export function alarmKanalAdiOlustur(bildirimSesi: string | undefined, sesAdi?: string): string {
    const ses = sesKimliginiNormalize(bildirimSesi);
    return ses === VARSAYILAN_SES ? 'Namaz alarmı' : `Namaz alarmı · ${sesGorunenAdi(ses, sesAdi)}`;
}

/** Matrisin kullandığı alarm kanalları (çöp toplamada KORUNACAKLAR). */
export function alarmKanallariniCikar(matris: MuhafizMatrisi | undefined): string[] {
    if (!matris) return [];
    const kume = new Set<string>();
    for (const vakit of MUHAFIZ_VAKITLERI) {
        for (const s of matris[vakit]?.seviyeler ?? []) {
            if (!s || adimKapaliMi(s.kanallar) || !alarmGerekliMi(s.kanallar)) continue;
            kume.add(alarmKanalIdOlustur(s.bildirimSesi));
        }
    }
    return [...kume].sort();
}

export interface AlarmYukuGirdisi {
    kimlik: string;
    tetikMs: number;
    baslik: string;
    metin: string;
    vakit: VakitAdi;
    /** Vaktin ait olduğu gün (YYYY-MM-DD) — kimlikle aynı. */
    tarih: string;
    cikisMs: number;
    /** Ertele üst sınırı (`ertelemeSiniriMs`); 0 = ertele düğmesi yok. */
    erteleSinirMs: number;
    seviye: number;
    bildirimSesi: string;
    sesAdi?: string;
    /** Adımın NORMAL muhafız kanalı (ertelenen kopya + normal bildirime düşüş). */
    kanalId: string;
    /** Muhafız bildiriminin `data` nesnesi (ertelenen kopyanın gövdesi). */
    veri: Record<string, unknown>;
}

export interface AlarmYuku {
    surum: number;
    kimlik: string;
    tetikMs: number;
    baslik: string;
    metin: string;
    vakit: VakitAdi;
    vakitAdi: string;
    tarih: string;
    cikisMs: number;
    erteleSinirMs: number;
    seviye: number;
    alarmKanalId: string;
    alarmKanalAdi: string;
    /** Yalnız kullanıcının seçtiği `content://` ses; yoksa native cihazın ALARM sesini çalar. */
    sesUri: string | null;
    kanalId: string;
    veri: Record<string, unknown>;
}

/** Native `MuhafizAlarm.planla`'ya giden yük. */
export function alarmYukuOlustur(g: AlarmYukuGirdisi): AlarmYuku {
    const ses = sesKimliginiNormalize(g.bildirimSesi);
    return {
        surum: ALARM_YUK_SURUMU,
        kimlik: g.kimlik,
        tetikMs: g.tetikMs,
        baslik: g.baslik,
        metin: g.metin,
        vakit: g.vakit,
        vakitAdi: VAKIT_ADLARI[g.vakit] ?? '',
        tarih: g.tarih,
        cikisMs: g.cikisMs,
        erteleSinirMs: g.erteleSinirMs,
        seviye: g.seviye,
        alarmKanalId: alarmKanalIdOlustur(ses),
        alarmKanalAdi: alarmKanalAdiOlustur(ses, g.sesAdi),
        sesUri: ozelSesMi(ses) ? ses : null,
        kanalId: g.kanalId,
        veri: g.veri,
    };
}
