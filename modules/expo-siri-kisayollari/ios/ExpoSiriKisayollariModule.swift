import ExpoModulesCore
import Foundation

/**
 * SIRI / KISAYOLLAR / ODAK — JS koprusu (issue #279).
 *
 * App Intents'in kendisi BU MODULDE DEGIL, ana uygulama hedefindedir
 * (`targets/siri-kisayollari/` altindaki Swift dosyalari, `plugins/withSiriKisayollari.js` kopyalar).
 * Sebep: App Intents metadata'si (`Metadata.appintents`) yalnizca intent'i derleyen
 * HEDEF icin cikarilir; bir pod (statik kutuphane) icindeki intent'ler sisteme
 * gorunmez. Intent'ler bu modulun `SiriDeposu`'nu `import ExpoSiriKisayollari` ile
 * kullanir → ayni surec, ayni kilit, ayni `UserDefaults`.
 *
 * Fonksiyon adlari BILINCLI OLARAK Android modulleriyle aynidir:
 *   - `vakitlerKaydet` / `kilinanlarKaydet` ← Android `WidgetVeri` (WidgetServisi aynen kullanir)
 *   - `bekleyenleriAl` / `tamamlandi` / `basarisiz` ← Android `KildimKuyrugu`
 *     (KildimKuyruguServisi aynen kullanir)
 *
 * iOS widget uzantisi ve canli etkinlik (#295) ayni depoyu (App Group) ve ayni yuku
 * kullanir; `canliEtkinlik*` fonksiyonlari `CanliEtkinlikKoprusu`'na devreder.
 *
 * Apple Watch (#285): `saat*` fonksiyonlari `SaatKoprusu`'na devreder (WatchConnectivity).
 * Saat yuku Wear OS'a giden yukun AYNISIDIR (`WearSenkronServisi`); saatten gelen
 * "Kildim" yukaridaki ortak kuyruga duser.
 */
public class ExpoSiriKisayollariModule: Module {
    private var gozlemci: NSObjectProtocol?
    private var dinleyici: CihazDinleyici?

    public func definition() -> ModuleDefinition {
        Name("ExpoSiriKisayollari")

        Events("onSiriDegisikligi", "onCihazIstegi")

        // Intent uygulama ACIKKEN calisirsa (ayni surec) JS hemen haberdar olur;
        // kapaliyken JS acilista/one gelince okur.
        OnCreate {
            self.gozlemci = NotificationCenter.default.addObserver(
                forName: SiriDeposu.degisiklikBildirimi,
                object: nil,
                queue: nil
            ) { [weak self] bildirim in
                let tur = (bildirim.userInfo?["tur"] as? String) ?? ""
                self?.sendEvent("onSiriDegisikligi", ["tur": tur])
            }
        }

        // Cihaz agi dinleyicisi (iPad <-> iPhone): YALNIZ on planda; karar ve sifre JS'te.
        AsyncFunction("dinleyiciBaslat") { (kimlik: String, ad: String, port: Int, promise: Promise) in
            let d = self.dinleyici ?? CihazDinleyici { [weak self] veri in self?.sendEvent("onCihazIstegi", veri) }
            self.dinleyici = d
            d.baslat(kimlik: kimlik, ad: ad, tercihPort: port) { acilan in
                if let acilan = acilan { promise.resolve(acilan) } else { promise.reject("DINLEYICI", "Dinleyici acilamadi") }
            }
        }

        /// Bu cihazin Wi-Fi IPv4'u (QR'a yazilir); yoksa nil.
        AsyncFunction("yerelAdres") { () -> String? in
            return CihazDinleyici.yerelIpv4()
        }

        AsyncFunction("dinleyiciDurdur") {
            self.dinleyici?.durdur()
        }

        AsyncFunction("dinleyiciYanitla") { (id: String, kod: Int, govde: String) in
            self.dinleyici?.yanitla(id: id, kod: kod, govde: govde)
        }

        OnDestroy {
            self.dinleyici?.durdur()
            if let g = self.gozlemci {
                NotificationCenter.default.removeObserver(g)
                self.gozlemci = nil
            }
        }

        // Widget (#295) ayni yukten beslenir: her yazimdan sonra zaman cizelgeleri tazelenir.
        // AsyncFunction: UserDefaults yazimi + WidgetCenter XPC'si JS thread'ini bekletmesin.
        AsyncFunction("vakitlerKaydet") { (json: String) in
            SiriDeposu.varsayilan.cizelgeyiYaz(json)
            CanliEtkinlikKoprusu.widgetlariTazele()
        }

        AsyncFunction("kilinanlarKaydet") { (json: String) in
            SiriDeposu.varsayilan.kilinanlariYaz(json)
            CanliEtkinlikKoprusu.widgetlariTazele()
        }

        /// Gunun ayeti yuku v1 (`docs/ajan/gunun-ayeti.md`; Android `WidgetVeri.gununAyetiKaydet` ikizi).
        /// Yalniz ayet widget'inin zaman cizelgesi tazelenir.
        AsyncFunction("gununAyetiKaydet") { (json: String) in
            SiriDeposu.varsayilan.gununAyetiYaz(json)
            CanliEtkinlikKoprusu.gununAyetiWidgetiniTazele()
        }

        /// Duvar kagidi fotograf zemini: secilen gorseli App Group'a `duvar/<dosya>` olarak yeniden
        /// kodlar (en cok 2048 px, JPEG 0,9). Ad `duvar-foto-<ozet>.(jpg|png)` degilse false.
        /// AsyncFunction: kod cozme/kodlama JS thread'ini bekletmesin (ANR).
        AsyncFunction("duvarFotografiniYaz") { (kaynakUri: String, dosya: String) -> Bool in
            return DuvarFotografi.yaz(kaynakUri: kaynakUri, dosya: dosya)
        }

        AsyncFunction("duvarFotografiniSil") { (dosya: String) in
            DuvarFotografi.sil(dosya)
        }

        AsyncFunction("bekleyenleriAl") { () -> String in
            return SiriDeposu.varsayilan.bekleyenleriJson()
        }

        /// Cihaz agindan gelen "Kildim": kaynak SABIT (`cihaz`); JS baska kaynak adina yazamaz.
        AsyncFunction("cihazdanKildimEkle") { (tarih: String, vakit: String) -> Bool in
            return SiriDeposu.varsayilan.kildimEkle(
                tarih: tarih, vakit: vakit, kaynak: SiriDeposu.cihazKaynagi,
                simdiMs: Int64(Date().timeIntervalSince1970 * 1000))
        }

        AsyncFunction("tamamlandi") { (id: String) in
            SiriDeposu.varsayilan.tamamlandi(id)
        }

        AsyncFunction("basarisiz") { (id: String) in
            SiriDeposu.varsayilan.basarisiz(id)
        }

        /// Odak filtresinin son durumu (`{"sessiz":Bool,"ms":Int}`); hic calismadiysa nil.
        AsyncFunction("odakDurumuAl") { () -> String? in
            return SiriDeposu.varsayilan.odakJson()
        }

        /// Arayuz dili (App Group): widget ve saat koprusu metinleri bu dilde kurar.
        Function("arayuzDiliniAyarla") { (kod: String) -> Void in
            SiriDeposu.varsayilan.arayuzDiliniYaz(kod)
        }

        /// Cihazin GENEL dili: genel tercih alanindaki `AppleLanguages`'in ilki. `UserDefaults.standard`
        /// once uygulama alanini okur; uygulama dili yazilinca "cihaz dili" secenegi yanilirdi.
        /// Okunamazsa nil (JS eski yola duser). Cihazda DOGRULANMADI.
        AsyncFunction("cihazDiliniOku") { () -> String? in
            if let alan = UserDefaults.standard.persistentDomain(forName: UserDefaults.globalDomain),
               let diller = alan["AppleLanguages"] as? [String], let ilk = diller.first {
                return ilk
            }
            return nil
        }

        /// Ayarlar > Namaz Akisi > Dil'deki UYGULAMAYA OZEL dil: uygulamanin kendi tercih alanindaki
        /// `AppleLanguages`'in ilki; secilmemisse nil (cihaz dili izlenir). Cihaz genel dili DEGIL
        /// (`UserDefaults.standard` genel alani da birlestirir, burada yalniz uygulama alani okunur).
        /// JS degisip degismedigini izler (`DilServisi.sistemDiliDegisimi`). Cihazda DOGRULANMADI.
        AsyncFunction("uygulamaDiliniOku") { () -> String? in
            guard let kimlik = Bundle.main.bundleIdentifier,
                  let alan = UserDefaults.standard.persistentDomain(forName: kimlik),
                  let diller = alan["AppleLanguages"] as? [String] else { return nil }
            return diller.first
        }

        /// Uygulama icinde secilen dili Ayarlar'daki uygulama diline de yazar (nil = cihaz dili).
        /// iOS bunu bir sonraki acilista sistem metinlerine uygular; arayuz zaten JS'ten anlik degisir.
        AsyncFunction("uygulamaDiliniYaz") { (etiket: String?) -> Bool in
            if let e = etiket, !e.isEmpty {
                UserDefaults.standard.set([e], forKey: "AppleLanguages")
            } else {
                UserDefaults.standard.removeObject(forKey: "AppleLanguages")
            }
            return true
        }

        /// Kullanicinin vakit adi takimi (JSON) ya da nil (anahtar silinir, dil tablosu).
        /// `arayuzDiliniAyarla` gibi yalniz yazar; widget/saat cizimi bir sonraki okumada alir.
        Function("vakitAdlariniAyarla") { (json: String?) -> Void in
            SiriDeposu.varsayilan.vakitAdlariniYaz(json)
        }

        /// Arayuzun rakam sistemi ("arab" Dogu Arap, "beng" Bengalce) ya da nil (anahtar silinir, Bati).
        /// Widget, canli etkinlik ve Siri cevabi CIZIM aninda okur (`RakamSistemi`). Deger
        /// degistiyse widget'lar tazelenir (yuk ayni kaldigi icin JS yeniden yazmaz, D-21);
        /// WidgetCenter XPC'si JS thread'ini bekletmesin diye arka planda.
        Function("rakamSisteminiAyarla") { (kod: String?) -> Void in
            if SiriDeposu.varsayilan.rakamSisteminiYaz(kod) {
                DispatchQueue.global(qos: .utility).async { CanliEtkinlikKoprusu.widgetlariTazele() }
            }
        }

        /// Canli etkinlik (Live Activity, #295) bu build'de var mi? (Widget uzantisi bayragi.)
        Function("canliEtkinlikDestekli") { () -> Bool in
            return CanliEtkinlikKoprusu.destekleniyor
        }

        /// Kullanici Ayarlar'dan canli etkinlikleri kapatmis mi?
        AsyncFunction("canliEtkinlikIzniAcik") { () -> Bool in
            return CanliEtkinlikKoprusu.izinAcik()
        }

        /// Mevcut canli etkinlikleri ISTENENE esitler (nil = hicbiri). Sonuc kodu doner.
        /// `secenek`: `{"onPlanda":Bool,"korunacaklar":[String]|null}` (yoksa on plan varsayilir).
        AsyncFunction("canliEtkinlikEsitle") { (json: String?, secenek: String?) async -> String in
            return await CanliEtkinlikKoprusu.esitle(json: json, secenekJson: secenek)
        }

        /// Bu build Apple Watch uygulamasini tasiyor mu? (#285, `NamazSaatUygulamasi` plist anahtari)
        Function("saatDestekli") { () -> Bool in
            return SaatKoprusu.destekleniyor
        }

        /// Wear yukunu saate gonderir (son durum). Sonuc kodu: gonderildi | bekliyor | saatYok | hata.
        AsyncFunction("saatDurumGonder") { (json: String) -> String in
            return SaatKoprusu.paylasilan.durumGonder(json)
        }

        /// Saatin sessiz uyandirma cevaplari (`{kimlik:{islem}}`), Android `saatUyandirmaDurumlari` ikizi.
        AsyncFunction("saatUyandirmaDurumlari") { () -> String in
            return SiriDeposu.varsayilan.saatUyandirmaJson(simdiMs: SiriDeposu.simdiMs())
        }

        /// Saatte basilan teheccud Kildim'larini TUKETIR (`[{tarih,tur}]`).
        AsyncFunction("saatNafileKildimleriniAl") { () -> String in
            return SiriDeposu.varsayilan.saatNafileKildimleriniAl()
        }

        /// Bekleyen ekran istegini TUKETIR (ör. "kible"); yoksa/bayatsa nil.
        AsyncFunction("ekranIstegiAl") { () -> String? in
            return SiriDeposu.varsayilan.ekranIstegiAl(simdiMs: SiriDeposu.simdiMs())
        }
    }
}
