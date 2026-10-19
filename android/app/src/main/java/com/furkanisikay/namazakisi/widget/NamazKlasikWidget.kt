package com.furkanisikay.namazakisi.widget

/**
 * Klasik (yeşil) 1×1 widget — Widget 1.0'ın (0.21) görünümü: yeşil zemin, "öğleye:"
 * ve sıradaki vakit girişine kalan süre. Widget 2.0 (issue #275) eski sağlayıcıların
 * sınıf adını koruyup düzenini değiştirince bu görünüm kaybolmuştu; sahip isteğiyle
 * AYRI sağlayıcı olarak geri geldi (Widget 2.0 widget'ları aynen kalır).
 *
 * Çizim ve zamanlama yine tek kapıdan: [WidgetGuncelleyici] (`klasikCiz`). Dakikalık
 * alarm YOK — kalan süreyi `Chronometer` çizer. "Kıldım" YOK (eskisinde de yoktu);
 * dokunuş uygulamayı açar.
 */
class NamazKlasikWidget : NamazWidgetSaglayicisi()

/** Klasik (yeşil) 4×2 widget — geri sayım + günün altı vakti (bkz. [NamazKlasikWidget]). */
class NamazKlasikGenisWidget : NamazWidgetSaglayicisi()
