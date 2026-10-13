import AppIntents

// Siri, Spotlight, Kisayollar ve Eylem dugmesinde KURULUM GEREKTIRMEDEN gorunen
// kisayollar (issue #279). Apple siniri: en fazla 10 App Shortcut; her ifade
// `\(.applicationName)` icermek ZORUNDADIR ("Namaz Akışı sıradaki namaz ne zaman").
//
// IFADELER TURKCEDIR → projenin gelistirme bolgesi `tr` olmalidir
// (`plugins/withSiriKisayollari.js` yazar). Bolge `en` kalsaydi bu ifadeler Ingilizce
// sayilir ve Turkce Siri onlari HIC eslestirmezdi.
@available(iOS 16.0, *)
struct NamazKisayollari: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: SiradakiNamazIntent(),
            phrases: [
                "\(.applicationName) sıradaki namaz ne zaman",
                "\(.applicationName) sıradaki namaz",
                "\(.applicationName) ile sıradaki namazı söyle",
                "\(.applicationName) namaz vakti",
            ],
            shortTitle: "Sıradaki namaz",
            systemImageName: "clock"
        )
        AppShortcut(
            intent: SimdikiVaktiKildimIntent(),
            phrases: [
                "\(.applicationName) şu anki vakti kıldım",
                "\(.applicationName) namazımı kıldım",
                "\(.applicationName) ile vakti kıldım olarak işaretle",
            ],
            shortTitle: "Vakti kıldım",
            systemImageName: "checkmark.circle"
        )
        AppShortcut(
            intent: KibleyiAcIntent(),
            phrases: [
                "\(.applicationName) kıbleyi aç",
                "\(.applicationName) ile kıbleyi göster",
            ],
            shortTitle: "Kıble",
            systemImageName: "location.north.line"
        )
    }
}
