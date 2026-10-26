import SwiftUI
import UIKit

// APPLE TV PANOSU — tvOS SwiftUI uygulamasi (Android TV `tv/` panosunun ikizi).
//
// Pano YALNIZ GOSTERIR: vakitler cihazda, telefonla ayni hesapla (`TvVakitHesabi`)
// bulunur; ag ve konum izni yok, il elle secilir (`iller.json`, telefonun manuel konum
// listesi). Secim `UserDefaults` > `il_plaka` (ekran goruntusu hatti `-il_plaka 34`
// baslatma argumaniyla tohumlar: arguman alani UserDefaults okumasini ezer).
//
// Hedef `plugins/withNamazTV.js` ile prebuild'de kurulur (bayrak varsayilan KAPALI).

@main
struct NamazTVUygulamasi: App {
    var body: some Scene {
        WindowGroup {
            TvKokGorunumu()
        }
    }
}

/// Telefonun koyu tema tokenlari (`koyuTema` + yesil palet). TV daima koyudur.
/// Kontrast: beyaz metin aktif satirda `birincilKoyu` (#388E3C, ~4.6:1) uzerinde; `birincil`
/// (#4CAF50) beyazla 2.8:1'de kaldigi icin METIN ZEMINI olmaz; amber yalniz noktada.
enum TvRenk {
    static let arkaplan = Color(red: 0x12 / 255, green: 0x12 / 255, blue: 0x12 / 255)
    static let kart = Color(red: 0x1E / 255, green: 0x1E / 255, blue: 0x1E / 255)
    static let metin = Color.white
    static let metinIkincil = Color(red: 0xB0 / 255, green: 0xB0 / 255, blue: 0xB0 / 255)
    static let sinir = Color(red: 0x33 / 255, green: 0x33 / 255, blue: 0x33 / 255)
    static let birincil = Color(red: 0x4C / 255, green: 0xAF / 255, blue: 0x50 / 255)
    static let birincilKoyu = Color(red: 0x38 / 255, green: 0x8E / 255, blue: 0x3C / 255)
    static let uyari = Color(red: 0xFF / 255, green: 0xCA / 255, blue: 0x28 / 255)
}

/// Pano arayuz metinleri (W5) — TV CIHAZIN dilini izler (`TvDili.cihaz`; Android TV kaynak
/// sistemiyle ayni karar). Ingilizce karsiliklar JS sozlugunden (`sozluk/en`) ve Android TV
/// `values-en` ile ayni. Arayuz kaydi: Turkcede kibar "siz", Ingilizcede notr.
struct TvMetin {
    let dil: String
    private var t: TvArayuzMetinleri { TvArayuzMetinleri.dil(dil) }

    var sehrinizSecin: String { t.sehrinizSecin }
    var ilMerkezi: String { t.ilMerkezi }
    func ilSecErisim(_ il: String) -> String { TvDili.bicim(t.ilSecErisim, ["il": il]) }
    func kalan(_ ad: String) -> String { TvDili.bicim(t.kalan, ["ad": ad]) }
    func kalanErisim(_ ad: String, _ sure: String) -> String { TvDili.bicim(t.kalanErisim, ["ad": ad, "sure": sure]) }
    var konumuDegistirin: String { t.konumuDegistirin }
    func kerahatSuruyor(_ tur: String, _ bitis: String, _ aciklama: String) -> String {
        TvDili.bicim(t.kerahatSuruyor, ["tur": tur, "bitis": bitis, "aciklama": aciklama])
    }
    func siradakiKerahat(_ tur: String, _ bas: String, _ bit: String) -> String {
        TvDili.bicim(t.siradakiKerahat, ["tur": tur, "bas": bas, "bit": bit])
    }
    func cumaBilgisi(_ giris: String) -> String { TvDili.bicim(t.cumaBilgisi, ["giris": giris]) }
    var suAnkiEk: String { t.suAnkiEk }
    var siradakiEk: String { t.siradakiEk }
}

/// `TvMetin` dil tablosu. Yer tutucular `{il}`, `{ad}`, `{sure}`, `{tur}`, `{bitis}`,
/// `{aciklama}`, `{bas}`, `{bit}`, `{giris}`. Duzen: sira tr, en, id, de, fr, bs, ru, ms, ar, ur;
/// cevrilmemis dil Ingilizce kopya (`// ÇEVİRİ: <kod>`).
struct TvArayuzMetinleri {
    let sehrinizSecin: String
    let ilMerkezi: String
    let ilSecErisim: String
    let kalan: String
    let kalanErisim: String
    let konumuDegistirin: String
    let kerahatSuruyor: String
    let siradakiKerahat: String
    let cumaBilgisi: String
    let suAnkiEk: String
    let siradakiEk: String

    static let tr = TvArayuzMetinleri(
        sehrinizSecin: "Şehrinizi seçin",
        ilMerkezi: "Namaz vakitleri il merkezine göre hesaplanır. Seçiminizi sonra değiştirebilirsiniz.",
        ilSecErisim: "{il}, seçin",
        kalan: "{ad} vaktine kalan",
        kalanErisim: "{ad} vaktine kalan süre {sure}",
        konumuDegistirin: "Konumu değiştirin",
        kerahatSuruyor: "Kerahat vakti: {tur}, bitiş {bitis}. {aciklama}",
        siradakiKerahat: "Sıradaki kerahat: {tur} {bas}–{bit}",
        cumaBilgisi: "Bugün cuma. Cuma namazı öğle vaktinde kılınır (giriş {giris}).",
        suAnkiEk: ", şu anki vakit",
        siradakiEk: ", sıradaki vakit"
    )

    static let en = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )


    // id — Endonezce (beta)
    static let id = TvArayuzMetinleri(
        sehrinizSecin: "Pilih kota Anda",
        ilMerkezi: "Waktu salat dihitung berdasarkan ibu kota provinsi. Anda dapat mengubah pilihan nanti.",
        ilSecErisim: "{il}, pilih",
        kalan: "Sisa waktu hingga {ad}",
        kalanErisim: "Sisa waktu hingga {ad}: {sure}",
        konumuDegistirin: "Ubah lokasi",
        kerahatSuruyor: "Waktu makruh: {tur}, berakhir {bitis}. {aciklama}",
        siradakiKerahat: "Waktu makruh berikutnya: {tur} {bas}–{bit}",
        cumaBilgisi: "Hari ini Jumat. Salat Jumat ditunaikan pada waktu Dzuhur (masuk {giris}).",
        suAnkiEk: ", waktu salat saat ini",
        siradakiEk: ", waktu salat berikutnya"
    )


    // de — Almanca (beta): JS `sozluk/de` (hitap "Sie", "bitte" yok)
    static let de = TvArayuzMetinleri(
        sehrinizSecin: "Wählen Sie Ihre Stadt",
        ilMerkezi: "Die Gebetszeiten werden für das Stadtzentrum berechnet. Sie können Ihre Auswahl später ändern.",
        ilSecErisim: "{il}, auswählen",
        kalan: "Verbleibende Zeit bis {ad}",
        kalanErisim: "Verbleibende Zeit bis {ad}: {sure}",
        konumuDegistirin: "Standort ändern",
        kerahatSuruyor: "Makruh-Zeit: {tur}, endet um {bitis}. {aciklama}",
        siradakiKerahat: "Nächste Makruh-Zeit: {tur} {bas}–{bit}",
        cumaBilgisi: "Heute ist Freitag. Das Freitagsgebet wird zur Dhuhr-Zeit verrichtet (Beginn {giris}).",
        suAnkiEk: ", aktuelle Gebetszeit",
        siradakiEk: ", nächste Gebetszeit"
    )


    // fr
    static let fr = TvArayuzMetinleri(
        sehrinizSecin: "Choisissez votre ville",
        ilMerkezi: "Les heures de prière sont calculées pour le chef-lieu de la province. Vous pourrez modifier votre choix plus tard.",
        ilSecErisim: "{il}, choisir",
        kalan: "Temps restant avant {ad}",
        kalanErisim: "Temps restant avant {ad} : {sure}",
        konumuDegistirin: "Changer de position",
        kerahatSuruyor: "Moment makrouh : {tur}, fin à {bitis}. {aciklama}",
        siradakiKerahat: "Prochain moment makrouh : {tur} {bas}–{bit}",
        cumaBilgisi: "Aujourd’hui, c’est vendredi. Joumoua se prie à l’heure de Dhuhr (début à {giris}).",
        suAnkiEk: ", prière en cours",
        siradakiEk: ", prochaine prière"
    )


    // bs
    static let bs = TvArayuzMetinleri(
        sehrinizSecin: "Odaberite svoj grad",
        ilMerkezi: "Vremena se računaju za centar grada. Izbor kasnije možete promijeniti.",
        ilSecErisim: "{il}, odaberite",
        kalan: "Do vakta: {ad}",
        kalanErisim: "{ad}: još {sure}",
        konumuDegistirin: "Promijenite lokaciju",
        kerahatSuruyor: "Mekruh vrijeme: {tur}, ističe u {bitis}. {aciklama}",
        siradakiKerahat: "Sljedeće mekruh vrijeme: {tur} {bas}–{bit}",
        cumaBilgisi: "Danas je petak. Džuma-namaz se klanja u vrijeme podne-namaza (nastupa u {giris}).",
        suAnkiEk: ", trenutni vakat",
        siradakiEk: ", sljedeći vakat"
    )


    // ru
    static let ru = TvArayuzMetinleri(
        sehrinizSecin: "Выберите свою провинцию",
        ilMerkezi: "Время намазов рассчитывается для центра провинции. Выбор можно изменить позже.",
        ilSecErisim: "{il}, выбрать",
        kalan: "{ad} через",
        kalanErisim: "{ad} через {sure}",
        konumuDegistirin: "Изменить местоположение",
        kerahatSuruyor: "Время макрух: {tur}, до {bitis}. {aciklama}",
        siradakiKerahat: "Следующее время макрух: {tur} {bas}–{bit}",
        cumaBilgisi: "Сегодня пятница. Джума-намаз совершается во время Зухр (начало в {giris}).",
        suAnkiEk: ", текущий намаз",
        siradakiEk: ", следующий намаз"
    )


    // ms
    static let ms = TvArayuzMetinleri(
        sehrinizSecin: "Pilih bandar anda",
        ilMerkezi: "Waktu solat dikira berdasarkan pusat wilayah. Anda boleh menukar pilihan anda kemudian.",
        ilSecErisim: "{il}, pilih",
        kalan: "Baki masa sehingga {ad}",
        kalanErisim: "Baki masa sehingga {ad}: {sure}",
        konumuDegistirin: "Tukar lokasi",
        kerahatSuruyor: "Waktu makruh: {tur}, tamat {bitis}. {aciklama}",
        siradakiKerahat: "Waktu makruh seterusnya: {tur} {bas}–{bit}",
        cumaBilgisi: "Hari ini Jumaat. Solat Jumaat ditunaikan pada waktu Zohor (masuk {giris}).",
        suAnkiEk: ", waktu semasa",
        siradakiEk: ", waktu seterusnya"
    )


    // ÇEVİRİ: ar
    static let ar = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )


    // ÇEVİRİ: ur
    static let ur = TvArayuzMetinleri(
        sehrinizSecin: "Select your city",
        ilMerkezi: "Prayer times are calculated for the province center. You can change your choice later.",
        ilSecErisim: "{il}, select",
        kalan: "Time left until {ad}",
        kalanErisim: "Time left until {ad}: {sure}",
        konumuDegistirin: "Change location",
        kerahatSuruyor: "Makruh time: {tur}, ends {bitis}. {aciklama}",
        siradakiKerahat: "Next makruh time: {tur} {bas}–{bit}",
        cumaBilgisi: "Today is Friday. Jumu'ah is prayed at Dhuhr time (begins {giris}).",
        suAnkiEk: ", current prayer",
        siradakiEk: ", next prayer"
    )

    static let tablo: [String: TvArayuzMetinleri] = [
        "tr": tr, "en": en, "id": id, "de": de, "fr": fr, "bs": bs, "ru": ru, "ms": ms,
        "ar": ar, "ur": ur,
    ]

    static func dil(_ kod: String) -> TvArayuzMetinleri { tablo[TvDili.coz(kod)] ?? tr }
}

struct TvKokGorunumu: View {
    @AppStorage("il_plaka") private var plaka: String = ""
    private let iller: [TvIl] = {
        guard let yol = Bundle.main.url(forResource: "iller", withExtension: "json"),
              let veri = try? Data(contentsOf: yol) else { return [] }
        return TvIlListesi.coz(veri)
    }()

    var body: some View {
        Group {
            if let il = TvIlListesi.bul(iller, plaka.isEmpty ? nil : plaka) {
                TvPanoGorunumu(il: il) { plaka = "" }
            } else {
                TvIlSecimGorunumu(iller: iller) { plaka = $0.plaka }
            }
        }
        .background(TvRenk.arkaplan.ignoresSafeArea())
        .preferredColorScheme(.dark)
    }
}

/// Il secimi: D-pad ile odaklanan liste. Konum donanimi olmadigi icin il merkezi kullanilir.
struct TvIlSecimGorunumu: View {
    let iller: [TvIl]
    let secildi: (TvIl) -> Void
    private let m = TvMetin(dil: TvDili.cihaz)

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text(m.sehrinizSecin)
                .font(.system(size: 52, weight: .semibold))
                .foregroundColor(TvRenk.metin)
            Text(m.ilMerkezi)
                .font(.system(size: 28))
                .foregroundColor(TvRenk.metinIkincil)
            ScrollView {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 24), count: 4), spacing: 24) {
                    ForEach(iller) { il in
                        Button {
                            secildi(il)
                        } label: {
                            Text(il.ad)
                                .font(.system(size: 30))
                                .frame(maxWidth: .infinity, minHeight: 72)
                        }
                        .accessibilityLabel(m.ilSecErisim(il.ad))
                    }
                }
                .padding(.vertical, 24)
            }
        }
        .padding(.horizontal, 80)
        .padding(.vertical, 54)
    }
}

/// Pano: solda saat, geri sayim ve bilgi serit; sagda alti vakit.
struct TvPanoGorunumu: View {
    let il: TvIl
    let konumuDegistir: () -> Void
    private let bolge = TimeZone.current
    /// Cihaz dili (W5); ay/gun, vakit ve kerahat adlari da bu dilde.
    private let dil = TvDili.cihaz
    private var m: TvMetin { TvMetin(dil: dil) }

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { baglam in
            let simdi = Int64(baglam.date.timeIntervalSince1970 * 1000)
            let durum = TvPanoHesabi.hesapla(simdiMs: simdi, bolge: bolge) { tarih in
                TvVakitOnbellegi.paylasilan.al(il: il, tarih: tarih)
            }
            let ofset = TvKaydirma.ofset(simdi)
            HStack(alignment: .top, spacing: 60) {
                solSutun(durum: durum, simdi: simdi)
                    .frame(maxWidth: .infinity, alignment: .leading)
                vakitListesi(durum: durum)
                    .frame(maxWidth: .infinity)
            }
            .offset(x: CGFloat(ofset.0), y: CGFloat(ofset.1))
            // TV tasma (overscan) guvenli alani.
            .padding(.horizontal, 80)
            .padding(.vertical, 54)
        }
        // Pano saatlerce acik durur; yalniz bu ekranda ekran kapanmaz.
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { UIApplication.shared.isIdleTimerDisabled = false }
    }

    @ViewBuilder
    private func solSutun(durum: TvPanoDurumu, simdi: Int64) -> some View {
        VStack(alignment: .leading, spacing: 28) {
            VStack(alignment: .leading, spacing: 6) {
                Text(il.ad).font(.system(size: 46, weight: .semibold)).foregroundColor(TvRenk.metin)
                Text(TvBicim.tarih(durum.tarih, dil: dil)).font(.system(size: 30)).foregroundColor(TvRenk.metinIkincil)
            }
            HStack(alignment: .lastTextBaseline, spacing: 10) {
                Text(TvBicim.saat(simdi, bolge))
                    .font(.system(size: 190, weight: .light).monospacedDigit())
                    .foregroundColor(TvRenk.metin)
                Text(TvBicim.saniye(simdi, bolge))
                    .font(.system(size: 60).monospacedDigit())
                    .foregroundColor(TvRenk.metinIkincil)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(m.kalan(durum.gorunenAd(durum.siradaki, dil: dil)))
                    .font(.system(size: 32)).foregroundColor(TvRenk.metinIkincil)
                Text(TvBicim.geriSayim(durum.kalanMs))
                    .font(.system(size: 96, weight: .semibold).monospacedDigit())
                    .foregroundColor(TvRenk.metin)
                    .accessibilityLabel(m.kalanErisim(durum.gorunenAd(durum.siradaki, dil: dil), TvBicim.geriSayim(durum.kalanMs)))
            }
            bilgiSeridi(durum: durum)
            Spacer(minLength: 0)
            Button(action: konumuDegistir) {
                Label(m.konumuDegistirin, systemImage: "mappin.and.ellipse").font(.system(size: 26))
            }
        }
    }

    @ViewBuilder
    private func bilgiSeridi(durum: TvPanoDurumu) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            if let k = durum.kerahat {
                // Saate hal eki EKLENMEZ ("07:42'e" okunusa gore degisir).
                bilgiSatiri(TvRenk.uyari, m.kerahatSuruyor(k.tur.ad(dil), TvBicim.saat(k.bitis, bolge), k.tur.aciklama(dil)))
            } else if let s = durum.siradakiKerahat {
                bilgiSatiri(TvRenk.sinir, m.siradakiKerahat(s.tur.ad(dil), TvBicim.saat(s.baslangic, bolge), TvBicim.saat(s.bitis, bolge)))
            }
            if durum.cuma {
                bilgiSatiri(TvRenk.birincil, m.cumaBilgisi(TvBicim.saat(durum.vakitler.ogle, bolge)))
            }
        }
    }

    private func bilgiSatiri(_ renk: Color, _ metin: String) -> some View {
        HStack(spacing: 16) {
            Circle().fill(renk).frame(width: 16, height: 16)
            Text(metin).font(.system(size: 26)).foregroundColor(TvRenk.metin).lineLimit(2)
        }
    }

    @ViewBuilder
    private func vakitListesi(durum: TvPanoDurumu) -> some View {
        VStack(spacing: 14) {
            ForEach(TvVakit.allCases, id: \.self) { vakit in
                let aktif = vakit == durum.aktif
                let siradaki = vakit == durum.siradaki && durum.siradakiMs == durum.vakitler.saat(vakit)
                HStack {
                    Text(durum.gorunenAd(vakit, dil: dil))
                        .font(.system(size: 44, weight: aktif ? .bold : .regular))
                    Spacer()
                    Text(TvBicim.saat(durum.vakitler.saat(vakit), bolge))
                        .font(.system(size: 50, weight: aktif ? .bold : .medium).monospacedDigit())
                }
                .foregroundColor(TvRenk.metin)
                .padding(.horizontal, 36)
                .frame(height: 104)
                .background(RoundedRectangle(cornerRadius: 24).fill(aktif ? TvRenk.birincilKoyu : TvRenk.kart))
                .overlay(RoundedRectangle(cornerRadius: 24).stroke(siradaki ? TvRenk.birincil : .clear, lineWidth: 3))
                .accessibilityElement(children: .combine)
                .accessibilityLabel(
                    "\(durum.gorunenAd(vakit, dil: dil)) \(TvBicim.saat(durum.vakitler.saat(vakit), bolge))"
                        + (aktif ? m.suAnkiEk : "") + (siradaki ? m.siradakiEk : "")
                )
            }
        }
        .frame(maxHeight: .infinity)
    }
}

/// Gun bazinda vakit onbellegi: saniyelik cizim adhan hesabini her seferinde yapmasin.
final class TvVakitOnbellegi {
    static let paylasilan = TvVakitOnbellegi()
    private var harita: [String: TvGunlukVakitler] = [:]

    func al(il: TvIl, tarih: TvTarih) -> TvGunlukVakitler {
        let anahtar = "\(il.plaka)_\(tarih.iso)"
        if let v = harita[anahtar] { return v }
        if harita.count > 6 { harita.removeAll() }
        let v = TvVakitHesabi.hesapla(lat: il.lat, lng: il.lng, tarih: tarih)
        harita[anahtar] = v
        return v
    }
}
