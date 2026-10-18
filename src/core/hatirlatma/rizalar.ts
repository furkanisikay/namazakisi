/**
 * TEK RIZA (sade tasarım, Dalga 3 — sahip kararı): sesli okuma ve gerçek alarm izni
 * BİR KEZ, tüm hatırlatmalar için sorulur. SAF.
 *
 * Eskiden her yüzey kendi rızasını tutuyordu (`muhafiz.sesliOnayi`, `nafile.sesliOnayi`,
 * cuma/camiye gitme/yatış/takvim `sesliOnayi`/`alarmOnayi`) ve kullanıcı aynı açıklamayı
 * altı kez görüyordu. Artık:
 *
 *  - YENİ onaylar ORTAK kayda yazılır (`HATIRLATMA_RIZALARI`, `HatirlatmaRizalari`).
 *  - OKUMA genel onayı türetir: ortak kayıt VEYA herhangi bir yüzeyin eski kaydı.
 *    Bu "uydurma" değildir: kullanıcı açıklamayı o yüzeyde GÖRÜP onaylamıştır; sahip
 *    kararı o onayın tüm hatırlatmalar için geçerli olmasıdır.
 *  - Göç (`rizaGocu`) eski yüzey kayıtlarındaki onayı ortak kayda BİR KEZ taşır; eski
 *    alanlar SİLİNMEZ (geriye uyum: eski sürüm yedeği / eski sürüme dönüş).
 *
 * Rıza UYDURULAMAZ kuralı aynen geçerlidir: ortak kayda yalnız kullanıcı açıklamayı
 * EKRANDA gördüğünde yazılır (çağıranın işi). Bu dosya hiçbir değeri `true`ya
 * kendiliğinden çevirmez — yalnız var olan `true`ları birleştirir.
 */

/** Ortak rıza kaydı. Alanlar yalnız `true` iken yazılır (yokluğu = onay yok). */
export interface HatirlatmaRizalari {
    /** Sesli okuma (sessiz modu ve Rahatsız Etmeyin'i deler) anlatıldı ve onaylandı. */
    sesliOnayi?: true;
    /** Gerçek alarm (tam ekran, sessizdeyken de çalar) anlatıldı ve onaylandı. */
    alarmOnayi?: true;
}

/** Bir yüzeyin eski rıza alanları (muhafız, nafile, cuma, camiye gitme, yatış, takvim). */
export interface YuzeyRizaKaydi {
    sesliOnayi?: boolean;
    alarmOnayi?: boolean;
}

/** Ekranın kullandığı genel onay. */
export interface GenelRiza {
    sesli: boolean;
    alarm: boolean;
}

/** Ham değeri ortak kayda indirger; bozuk/nesne-dışı → boş (onay yok). */
export function rizaKaydiniNormalize(ham: unknown): HatirlatmaRizalari {
    if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return {};
    const k = ham as Record<string, unknown>;
    return {
        ...(k.sesliOnayi === true ? { sesliOnayi: true as const } : {}),
        ...(k.alarmOnayi === true ? { alarmOnayi: true as const } : {}),
    };
}

/** Yüzey kaydından (bilinmeyen şekil olabilir) yalnız `true` rızaları okur. */
function yuzeyRizasi(ham: unknown): HatirlatmaRizalari {
    return rizaKaydiniNormalize(ham);
}

/**
 * Genel onay: ortak kayıt VEYA herhangi bir yüzeyin eski kaydı.
 * `yuzeyler` eksik/null öğe taşıyabilir (yüklenmemiş dilim, okunamayan anahtar).
 */
export function genelRizayiTuret(
    ortak: HatirlatmaRizalari | null | undefined,
    yuzeyler: ReadonlyArray<YuzeyRizaKaydi | null | undefined> = []
): GenelRiza {
    const tum = [rizaKaydiniNormalize(ortak), ...yuzeyler.map(yuzeyRizasi)];
    return {
        sesli: tum.some((r) => r.sesliOnayi === true),
        alarm: tum.some((r) => r.alarmOnayi === true),
    };
}

/**
 * Eski yüzey kayıtlarındaki onayı ortak kayda taşır. Değişen bir şey yoksa AYNI
 * referansı döndürür (gereksiz disk yazımı olmaz). Hiçbir onayı GERİ ALMAZ.
 */
export function rizaGocu(
    ortak: HatirlatmaRizalari,
    yuzeyler: ReadonlyArray<YuzeyRizaKaydi | null | undefined>
): HatirlatmaRizalari {
    const genel = genelRizayiTuret(ortak, yuzeyler);
    const sesliEksik = genel.sesli && ortak.sesliOnayi !== true;
    const alarmEksik = genel.alarm && ortak.alarmOnayi !== true;
    if (!sesliEksik && !alarmEksik) return ortak;
    return {
        ...ortak,
        ...(genel.sesli ? { sesliOnayi: true as const } : {}),
        ...(genel.alarm ? { alarmOnayi: true as const } : {}),
    };
}

/** Yeni onayı ortak kayda ekler (yalnız ekleme; onay geri alınmaz). */
export function rizaEkle(
    ortak: HatirlatmaRizalari,
    ek: { sesliOnayi?: boolean; alarmOnayi?: boolean }
): HatirlatmaRizalari {
    const sesli = ek.sesliOnayi === true && ortak.sesliOnayi !== true;
    const alarm = ek.alarmOnayi === true && ortak.alarmOnayi !== true;
    if (!sesli && !alarm) return ortak;
    return {
        ...ortak,
        ...(sesli ? { sesliOnayi: true as const } : {}),
        ...(alarm ? { alarmOnayi: true as const } : {}),
    };
}
