/**
 * Otomatik konum değişikliği bildirimi: ne zaman gönderilir, ne yazar (saf).
 *
 * Arka plan takibi (bölge çıkışı ya da 15 dk'lık onarım) konumu kullanıcı
 * uygulamayı açmadan günceller; bildirim olmazsa kullanıcı vakitlerin neden
 * değiştiğini bilmez. Ama mesafe eşiği tek başına ölçüt olamaz: aynı şehirde
 * birkaç kilometrelik gidiş gelişler (ör. İstanbul'da karşı yakaya geçmek) her
 * gün eşiği aşar ve bildirim gürültüye dönerdi. Bu yüzden bildirim yalnız
 * görünen yer ADI (ilçe ya da il) değiştiğinde gider.
 *
 * Girdi tipi burada yerelleştirilmiştir — `src/core/` veri katmanına bağımlı
 * olamaz (AGENTS.md); yapısal uyum yeterlidir.
 */

export interface KonumAdiGirdisi {
    ilce: string;
    il: string;
}

const temizle = (deger: string | undefined | null): string => (deger ?? '').trim();

/** Adın gösterilebilir olup olmadığı: ilçe ya da il'den en az biri dolu olmalı. */
const adVarMi = (adres: KonumAdiGirdisi | null | undefined): adres is KonumAdiGirdisi =>
    !!adres && (temizle(adres.ilce) !== '' || temizle(adres.il) !== '');

/**
 * Bildirim gönderilmeli mi?
 *
 * - Ayar açıkça kapatılmışsa (`false`) hayır; alan hiç yoksa (eski kayıt) açık sayılır.
 * - Eski ad bilinmiyorsa hayır: ilk konum alımı bir "değişiklik" değildir ve
 *   karşılaştıracak bir şey yoktur.
 * - Yeni ad çözülemediyse (ters coğrafi kodlama başarısız) hayır: kullanıcıya
 *   "Konumunuz güncellendi:" deyip yer adı veremeyiz.
 * - İlçe ya da il değiştiyse evet.
 */
export function konumDegisimBildirimiGerekliMi(
    eski: KonumAdiGirdisi | null | undefined,
    yeni: KonumAdiGirdisi | null | undefined,
    ayarAcik: boolean | undefined,
): boolean {
    if (ayarAcik === false) return false;
    if (!adVarMi(eski) || !adVarMi(yeni)) return false;
    return temizle(eski.ilce) !== temizle(yeni.ilce) || temizle(eski.il) !== temizle(yeni.il);
}

/** "Palandöken, Erzurum"; ilçe ile il aynıysa ya da biri boşsa tek ad. */
export function konumAdiMetni(adres: KonumAdiGirdisi): string {
    const ilce = temizle(adres.ilce);
    const il = temizle(adres.il);
    if (ilce && il && ilce !== il) return `${ilce}, ${il}`;
    return il || ilce;
}

export interface KonumBildirimMetni {
    baslik: string;
    govde: string;
}

/** Bildirim metni. Arayüz metnidir (ibadete çağrı değil) → kibar "siz" dili. */
export function konumDegisimBildirimMetni(yeni: KonumAdiGirdisi): KonumBildirimMetni {
    return {
        baslik: `Konumunuz güncellendi: ${konumAdiMetni(yeni)}`,
        govde: 'Namaz vakitleri yeni konumunuza göre ayarlandı.',
    };
}
