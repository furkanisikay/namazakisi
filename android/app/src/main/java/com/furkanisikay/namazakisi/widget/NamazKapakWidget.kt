package com.furkanisikay.namazakisi.widget

/**
 * Samsung Flex Window (Galaxy Z Flip kapak ekranı) widget'ı (issue #283).
 *
 * Çizim [NamazWidget] ile AYNI çiziciden geçer (boyuta göre düzen; kapak ekranı
 * boyutunda günün vakitleri). Mevcut iki sağlayıcıya Samsung meta-data'sı
 * EKLENMEDİ: `display="sub_screen"` bir sağlayıcının ana ekran seçicisindeki
 * davranışını değiştirip değiştirmediği belgelenmemiştir — mevcut yerleşimleri
 * riske atmamak için kapak ekranı AYRI bir sağlayıcıdır.
 *
 * Kapak ekranı kapalı telefonda kilit açılmadan kullanılır → widget her zaman SALT
 * OKUNUR çizilir ("Kıldım" yayını verilmez; dokunuş uygulamayı açar) —
 * `KilitEkraniKarari.saltOkunurMu`.
 */
class NamazKapakWidget : NamazWidgetSaglayicisi()
