package com.furkanisikay.namazakisi.saat.cekirdek

/**
 * Saatteki muhafız hatırlatmalarının ALARM ZİNCİRİ (issue #280) — SAF, JVM testli.
 *
 * Saat telefonun hazır planını taşır (`Yuk.plan`) ama yüzlerce alarmı birden
 * KURMAZ: yalnız SIRADAKİ kayıt kuruludur; o çalınca bildirim gösterilir ve bir
 * sonraki kurulur. Böylece kılınma, yeni yük ya da saat değişimi tek bir alarmı
 * yeniden kurmakla biter, Android'in uygulama başına alarm sınırına da yaklaşılmaz.
 *
 * Zaman (`simdi`) ENJEKTE edilir; Android'e bağımlılık `AlarmKurucu` arayüzündedir.
 */
object AlarmZinciri {
    /**
     * Gecikmiş tetik ne kadar eskiyse hâlâ gösterilir? Doze / yaklaşık alarm birkaç
     * dakika kaydırabilir; daha eskisi (saat kapalıydı, yeniden başladı) gürültüdür.
     */
    const val GECIKME_TOLERANSI_MS = 10 * 60_000L

    /** Telefonda kılınmış ya da saatte işaretlenip onay bekleyen vakit uyarı ÜRETMEZ. */
    fun kilinmisMi(yuk: Yuk, bekleyen: Set<String>, tarih: String, vakit: String): Boolean {
        val gun = yuk.gunler.firstOrNull { it.tarih == tarih }
        return (gun != null && vakit in gun.kilinan) || VakitHesabi.kimlik(tarih, vakit) in bekleyen
    }

    /** Kurulacak sıradaki kayıt: `simdi`den SONRA ve kılınmamış vakte ait en erken uyarı. */
    fun siradaki(yuk: Yuk?, bekleyen: Set<String>, simdi: Long): PlanKaydi? =
        yuk?.plan
            ?.filter { it.ms > simdi && !kilinmisMi(yuk, bekleyen, it.tarih, it.vakit) }
            ?.minByOrNull { it.ms }

    data class TetikKarari(
        /** Gösterilecek bildirim (yoksa null — kılındı, çok eski ya da zaten gösterildi). */
        val goster: PlanKaydi?,
        /** Ardından kurulacak alarm. */
        val sonraki: PlanKaydi?,
    )

    /**
     * Alarm çaldığında ne yapılır? Gecikmeyle birden fazla kayıt birikmişse yalnız
     * EN SONUNCUSU (en güncel/en sert) gösterilir — eskileri peş peşe çalmak bilekte
     * gürültüdür. `sonGosterilenMs` aynı kaydın (ör. yeniden başlatma sonrası) ikinci
     * kez gösterilmesini engeller.
     */
    fun tetiklendi(yuk: Yuk?, bekleyen: Set<String>, simdi: Long, sonGosterilenMs: Long): TetikKarari {
        if (yuk == null) return TetikKarari(null, null)
        val goster = yuk.plan
            .filter {
                it.ms <= simdi &&
                    it.ms > sonGosterilenMs &&
                    simdi - it.ms <= GECIKME_TOLERANSI_MS &&
                    !kilinmisMi(yuk, bekleyen, it.tarih, it.vakit)
            }
            .maxByOrNull { it.ms }
        return TetikKarari(goster, siradaki(yuk, bekleyen, simdi))
    }
}

/** Alarm kurma yüzeyi — üretimde `AlarmManager`, testte sahte. */
interface AlarmKurucu {
    /** Kesin alarm izni var mı? (API 31+ `canScheduleExactAlarms`) */
    fun kesinKurulabilirMi(): Boolean
    fun kesinKur(ms: Long, kimlik: String)
    /** İzin yoksa yedek: Doze'da da çalan ama birkaç dakika kayabilen alarm. */
    fun yaklasikKur(ms: Long, kimlik: String)
    fun iptal()
}

/** Zincirin TEK kurma noktası: yeni yük, kılınma, açılış, BOOT/TIME_SET hepsi buradan geçer. */
class ZincirYoneticisi(private val kurucu: AlarmKurucu) {
    /** @return kurulan kayıt (yoksa null — alarm iptal edildi) */
    fun yenidenKur(yuk: Yuk?, bekleyen: Set<String>, simdi: Long): PlanKaydi? {
        val siradaki = AlarmZinciri.siradaki(yuk, bekleyen, simdi)
        kur(siradaki)
        return siradaki
    }

    fun kur(kayit: PlanKaydi?) {
        when {
            kayit == null -> kurucu.iptal()
            kurucu.kesinKurulabilirMi() -> kurucu.kesinKur(kayit.ms, kayit.id)
            else -> kurucu.yaklasikKur(kayit.ms, kayit.id)
        }
    }
}

/**
 * Telefon köprüsünden gelen muhafız bildirimleri saatte DIŞLANSIN mı? (çift bildirim)
 *
 * Yalnız saatin kendisi gösterebiliyorsa: bildirim izni açık VE yük sürüm 2+ (plan
 * taşıyan telefon). İzin kapalıyken dışlamak kullanıcıyı bilekte hiç uyarısız bırakırdı.
 * Etiketi yalnız yeni telefon sürümü bastığı için eski telefonla dışlamanın etkisi yoktur.
 */
object KopruKarari {
    fun muhafizKoprusuDislansinMi(yuk: Yuk?, bildirimIzni: Boolean): Boolean =
        // Plan BOŞSA çoğaltacak bir şey yok: köprü kalmalı, yoksa telefon muhafızı açıkken
        // (plan okunamayıp boş gönderildiyse) bilekte hiç uyarı kalmaz (Fable incelemesi).
        bildirimIzni && yuk != null && yuk.surum >= 2 && yuk.plan.isNotEmpty()
}
