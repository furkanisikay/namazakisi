package com.furkanisikay.namazakisi.cekirdek

/**
 * Kilit ekranı / dock (hub) widget'ının SAF kararları (issue #295) — JVM testi:
 * `KilitEkraniKarariTest`. Android'e dokunmaz.
 *
 * Android 16 QPR2 telefon kilit ekranı widget'ları ve tabletlerin "hub" (şarj
 * istasyonu) modu aynı SystemUI "communal" ana bilgisayarını kullanır ve widget'ı
 * `OPTION_APPWIDGET_HOST_CATEGORY = WIDGET_CATEGORY_KEYGUARD` (0x2) ile bağlar
 * (AOSP `CommunalWidgetHost`). Ayrı bir "dock" kategorisi YOKTUR.
 *
 * NEDEN "Kıldım" kilit ekranında verilmez: communal ana bilgisayarı ETKİNLİK
 * niyetlerini kilidi açtırarak başlatır (`startPendingIntentMaybeDismissingKeyguard`)
 * ama YAYIN niyetlerini (widget "Kıldım" = `PendingIntent.getBroadcast`) kilit
 * açılmadan işletir. Cepte ya da masada kilitli telefona yanlış bir dokunuş ibadet
 * kaydı yazardı; kilit ekranına bakan herkes de işaretleyebilirdi. En sade güvenli
 * çözüm: kilit ekranında widget SALT OKUNUR — durum görünür ("Kılındı" dahil),
 * dokunuş uygulamayı açar (kilit açılır), işaretleme orada yapılır.
 */
object KilitEkraniKarari {
    /** `AppWidgetProviderInfo.WIDGET_CATEGORY_KEYGUARD` — saf kalmak için sabit kopya. */
    const val KATEGORI_KILIT_EKRANI = 0x2

    /** `OPTION_APPWIDGET_HOST_CATEGORY` değeri kilit ekranı (ya da hub) mı? */
    fun kilitEkraniMi(hostKategorisi: Int): Boolean =
        hostKategorisi > 0 && (hostKategorisi and KATEGORI_KILIT_EKRANI) != 0

    /**
     * Widget salt okunur mu çizilmeli? Kilit ekranı kategorisi YA DA Samsung Flex
     * Window (Z Flip kapak ekranı, issue #283) sağlayıcısı. Kapak ekranı kapalı
     * telefonda kilit açılmadan kullanılır; Samsung'un ana bilgisayarının host
     * kategorisini `KEYGUARD` olarak verdiği doğrulanmadığı için kapak sağlayıcısı
     * kategoriden bağımsız salt okunurdur (yanlış dokunuş ibadet kaydı yazmasın).
     */
    fun saltOkunurMu(hostKategorisi: Int, kapakEkraniSaglayicisi: Boolean): Boolean =
        kapakEkraniSaglayicisi || kilitEkraniMi(hostKategorisi)

    /** İşaretleme (yayın) niyeti yalnız kılınabilir durumda VE kilit ekranı DIŞINDA verilir. */
    fun kildimNiyetiVerilsinMi(kildim: KildimDurumu, kilitEkrani: Boolean): Boolean =
        kildim == KildimDurumu.KILINABILIR && !kilitEkrani

    /**
     * 2×2 / 4×2 düzende "Kıldım" düğmesi görünsün mü? Kilit ekranında kılınabilir
     * durumdaki düğme GİZLENİR (basılamayan bir "Kıldım" düğmesi bozuk görünür);
     * "Kılındı" / "İşaretleniyor" bilgi olarak kalır.
     */
    fun dugmeGorunurMu(kildim: KildimDurumu, veriVar: Boolean, kilitEkrani: Boolean): Boolean =
        veriVar && !(kilitEkrani && kildim == KildimDurumu.KILINABILIR)

    /** Kapak ekranı ipucu (issue #283) — kılınabilir vakitte ne yapılacağını söyler. */
    const val KAPAK_IPUCU = "İşaretlemek için telefonunuzu açın"

    /**
     * Samsung Flex Window ipucu satırı. Kapakta dokunuş uygulamayı açma niyetini
     * taşır ama Flex Window'da uygulamanın kapakta açılması Samsung'un ayrı iznine
     * (Flex Window'da uygulamalar / Good Lock MultiStar) bağlıdır; izin yoksa dokunuş
     * SESSİZCE hiçbir şey yapmayabilir. Bu yüzden işaretlenebilir vakitte yol ekranda
     * yazılır: telefonu açıp işaretleyin. Kapak dışında ya da kılınabilir olmayan
     * durumda `null` (satır normal içeriğini gösterir).
     */
    fun kapakIpucu(kapakEkrani: Boolean, kildim: KildimDurumu): String? =
        if (kapakEkrani && kildim == KildimDurumu.KILINABILIR) KAPAK_IPUCU else null

    /** Ekran okuyucu metni — kilit ekranında işaretleme vaadi verilmez. */
    fun erisimMetni(
        ad: String,
        kildim: KildimDurumu,
        kilitEkrani: Boolean,
        kapakEkrani: Boolean = false,
    ): String = when (kildim) {
        KildimDurumu.KILINABILIR ->
            if (kapakEkrani) "$ad namazı kılınmadı. $KAPAK_IPUCU"
            else if (kilitEkrani) "$ad namazı kılınmadı. İşaretlemek için uygulamayı açın"
            else "$ad namazını kılındı olarak işaretleyin"
        KildimDurumu.BEKLIYOR -> "$ad namazı işaretleniyor"
        KildimDurumu.KILINDI -> "$ad namazı kılındı. Uygulamayı açın"
        KildimDurumu.YOK -> "Uygulamayı açın"
    }
}
