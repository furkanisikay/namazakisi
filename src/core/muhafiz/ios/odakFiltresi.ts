/**
 * iOS ODAK FİLTRESİ (issue #279) — "Namaz" Odağı açıkken hatırlatmalar nasıl gelir?
 *
 * SAF modül: `react-native` ve `expo-*` IMPORT ETMEZ.
 *
 * Uygulama Odak modu OLUŞTURAMAZ ve Odağın açık olup olmadığını SORAMAZ. iOS'un
 * verdiği tek yol `SetFocusFilterIntent`'tir: kullanıcı kendi Odağına (ör. "Namaz")
 * uygulamamızın filtresini ekler; Odak açılınca ve kapanınca sistem filtrenin
 * `perform()`'unu çağırır (gerekirse uygulamayı arka planda başlatarak). Swift
 * tarafı (`NamazOdakFiltresi`) değeri `UserDefaults`'a yazar, JS planlayıcı
 * (`IosMuhafizTeslimcisi`) her turda okur. Odak KAPANINCA parametre varsayılana
 * (boş) döner → `sessiz: false` yazılır.
 *
 * DAVRANIŞ: filtre "Hatırlatmaları sessiz ver" açıkken muhafız ve nafile
 * bildirimleri `passive` kesinti seviyesiyle kurulur — ekranı yakmaz, ses
 * çıkarmaz, Bildirim Merkezi'nde durur. `timeSensitive` (Odağı delen) seviye de
 * bastırılır: kullanıcı namazdayken/camideyken telefonun çalmasını istemez.
 * Android "Namaz modu"nun iOS karşılığıdır (orada Rahatsız Etmeyin kuralı açılır).
 *
 * SÜRE TAVANI (Android "Rahatsız Etmeyin süresiz açık kalamaz" dersinin ikizi):
 * Odak kapanış çağrısı herhangi bir sebeple gelmezse hatırlatmalar SONSUZA kadar
 * sessiz kalmamalı. Sessizlik yalnız filtrenin açıldığı andan itibaren
 * `ODAK_AZAMI_SURE_MS` içindeki uyarılara uygulanır; sonrası normal kurulur.
 *
 * BİLİNEN BEDEL: önceden kurulmuş bildirimler ancak yeniden planlamada değişir.
 * Filtre çağrısı uygulama açıksa olay ile, kapalıysa arka plan başlatmasındaki
 * açılış zinciriyle yeniden planlamayı tetikler; ikisi de olmazsa bir sonraki
 * ön plan/arka plan turuna kadar eski seviye geçerlidir.
 */

/** Sessizliğin en fazla süresi: filtrenin açıldığı andan itibaren. */
export const ODAK_AZAMI_SURE_MS = 3 * 60 * 60 * 1000;

export interface OdakFiltresiDurumu {
    /** "Hatırlatmaları sessiz ver" açık mı? */
    sessiz: boolean;
    /** Filtrenin son çağrıldığı an (epoch ms). */
    ms: number;
}

/** Native'den gelen ham JSON'u güvenle çözer; bozuksa `null` (= filtre yok). */
export function odakDurumunuCoz(ham: string | null | undefined): OdakFiltresiDurumu | null {
    if (!ham) return null;
    try {
        const d = JSON.parse(ham) as Partial<OdakFiltresiDurumu> | null;
        if (!d || typeof d !== 'object') return null;
        if (typeof d.sessiz !== 'boolean' || typeof d.ms !== 'number' || !Number.isFinite(d.ms)) return null;
        return { sessiz: d.sessiz, ms: d.ms };
    } catch {
        return null;
    }
}

/**
 * Bu anda tetiklenecek bir uyarı Odak filtresi yüzünden sessiz mi verilmeli?
 *
 * @param uyariMs Uyarının tetik anı.
 */
export function odakSessizlestirirMi(odak: OdakFiltresiDurumu | null, uyariMs: number): boolean {
    if (!odak || !odak.sessiz) return false;
    return uyariMs >= odak.ms && uyariMs < odak.ms + ODAK_AZAMI_SURE_MS;
}
