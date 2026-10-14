import ExpoModulesCore
import Foundation

/**
 * CIHAZLAR ARASI ESITLEME (issue #288) — iCloud anahtar-deger deposu koprusu.
 *
 * Veri kullanicinin KENDI iCloud hesabinda, uygulamaya ait anahtar-deger alaninda
 * durur (NSUbiquitousKeyValueStore). Gelistiricinin sunucusu yoktur ve icerik JS
 * tarafinda kullanici parolasindan turetilen anahtarla ZATEN sifrelenmistir; bu modul
 * yalniz tek bir metni (zarf) ve onun surum etiketini saklar.
 *
 * ENTITLEMENT: `com.apple.developer.ubiquity-kvstore-identifier` olmadan depo
 * yalniz YEREL davranir (hata vermez, esitlemez). Entitlement `plugins/withIcloudEsitleme`
 * bayragi `etkin: true` iken eklenir; bayrak kapaliyken JS saglayiciyi hic gostermez.
 *
 * SINIRLAR: deger basina ve toplamda 1 MB. JS boyutu yazmadan once denetler; burada
 * da asilirsa `false` doner.
 */
public class ExpoIcloudEsitlemeModule: Module {
    private static let enBuyukBayt = 1_000_000

    public func definition() -> ModuleDefinition {
        Name("ExpoIcloudEsitleme")

        /** Cihazda iCloud hesabi acik mi? (Entitlement yoksa da nil donebilir.) */
        AsyncFunction("hesapVarMi") { () -> Bool in
            return FileManager.default.ubiquityIdentityToken != nil
        }

        /** Anahtarin degeri; yoksa nil. Okumadan once yerel kopya buluttan tazelenir. */
        AsyncFunction("oku") { (anahtar: String) -> String? in
            let depo = NSUbiquitousKeyValueStore.default
            depo.synchronize()
            return depo.string(forKey: anahtar)
        }

        /** Degeri yazar; boyut siniri asilirsa false. */
        AsyncFunction("yaz") { (anahtar: String, deger: String) -> Bool in
            if deger.utf8.count > Self.enBuyukBayt {
                return false
            }
            let depo = NSUbiquitousKeyValueStore.default
            depo.set(deger, forKey: anahtar)
            // synchronize() bulut gonderimini garanti etmez, yalnizca istek; sonucu
            // "yazilamadi" saymak hesapsiz cihazda her yazimi hata gosterirdi.
            _ = depo.synchronize()
            return true
        }

        /** Anahtari siler. */
        AsyncFunction("sil") { (anahtar: String) -> Bool in
            let depo = NSUbiquitousKeyValueStore.default
            depo.removeObject(forKey: anahtar)
            _ = depo.synchronize()
            return true
        }
    }
}
