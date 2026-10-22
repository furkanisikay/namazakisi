import ExpoModulesCore
import Foundation
import Network
import UIKit

/// Sistem koşulları köprüsü (Düşük Güç Modu, Düşük Veri Modu, ağ, şarj, arka planda
/// uygulama yenileme). SALT OKUR, izin istemez. Ham değer döner; karar saf JS
/// çekirdeğindedir (`src/core/sistem/sistemDurumu.ts`). Okunamayan alan sözlüğe
/// hiç yazılmaz → JS "bilinmiyor" sayar.
///
/// Kaynaklar (developer.apple.com):
///  - ProcessInfo.isLowPowerModeEnabled + NSProcessInfoPowerStateDidChange
///  - NWPath.isConstrained (Düşük Veri Modu) / isExpensive (hücresel, kişisel erişim noktası)
///  - UIApplication.backgroundRefreshStatus (yalnız ana iş parçacığında)
///  - UIDevice.batteryState (önce isBatteryMonitoringEnabled = true)
public class ExpoSistemDurumuModule: Module {
  private let izleyici = NWPathMonitor()
  private let kuyruk = DispatchQueue(label: "namazakisi.sistemdurumu")
  private let kilit = NSLock()
  private var yol: NWPath?
  private var dinliyor = false
  private var gozlemciler: [NSObjectProtocol] = []

  public func definition() -> ModuleDefinition {
    Name("ExpoSistemDurumu")

    Events("onSistemDurumuDegisti")

    OnCreate {
      self.izleyici.pathUpdateHandler = { [weak self] yeni in
        guard let self = self else { return }
        self.kilit.lock()
        self.yol = yeni
        let yay = self.dinliyor
        self.kilit.unlock()
        if yay { DispatchQueue.main.async { self.yayinla() } }
      }
      self.izleyici.start(queue: self.kuyruk)
    }

    AsyncFunction("durumAl") { () -> [String: Any] in
      return self.durum()
    }.runOnQueue(.main)

    OnStartObserving {
      DispatchQueue.main.async { self.dinlemeyiBaslat() }
    }

    OnStopObserving {
      DispatchQueue.main.async { self.dinlemeyiDurdur() }
    }

    OnDestroy {
      self.izleyici.cancel()
      DispatchQueue.main.async { self.dinlemeyiDurdur() }
    }
  }

  /// Ana iş parçacığında çağrılır (UIKit alanları).
  private func durum() -> [String: Any] {
    var sonuc: [String: Any] = ["platform": "ios"]
    sonuc["gucTasarrufu"] = ProcessInfo.processInfo.isLowPowerModeEnabled

    switch UIApplication.shared.backgroundRefreshStatus {
    case .available: sonuc["arkaPlanYenileme"] = "acik"
    case .denied: sonuc["arkaPlanYenileme"] = "kapali"
    case .restricted: sonuc["arkaPlanYenileme"] = "kisitli"
    @unknown default: break
    }

    let cihaz = UIDevice.current
    if !cihaz.isBatteryMonitoringEnabled { cihaz.isBatteryMonitoringEnabled = true }
    switch cihaz.batteryState {
    case .charging, .full: sonuc["sarjda"] = true
    case .unplugged: sonuc["sarjda"] = false
    default: break
    }
    if cihaz.batteryLevel >= 0 {
      sonuc["pilYuzde"] = Int((cihaz.batteryLevel * 100).rounded())
    }

    kilit.lock()
    let mevcut = yol
    kilit.unlock()
    // İlk güncelleme gelmeden ağ alanları bilinmiyor sayılır (yanlış "ağ yok" demesin).
    if let mevcut = mevcut {
      if mevcut.status != .satisfied {
        sonuc["agTuru"] = "yok"
      } else if mevcut.usesInterfaceType(.wifi) {
        sonuc["agTuru"] = "wifi"
      } else if mevcut.usesInterfaceType(.wiredEthernet) {
        sonuc["agTuru"] = "ethernet"
      } else if mevcut.usesInterfaceType(.cellular) {
        sonuc["agTuru"] = "hucresel"
      } else {
        sonuc["agTuru"] = "diger"
      }
      sonuc["olculuAg"] = mevcut.isExpensive
      sonuc["veriTasarrufu"] = mevcut.isConstrained ? "acik" : "kapali"
    }
    return sonuc
  }

  private func yayinla() {
    sendEvent("onSistemDurumuDegisti", durum())
  }

  private func dinlemeyiBaslat() {
    kilit.lock()
    let zaten = dinliyor
    dinliyor = true
    kilit.unlock()
    if zaten { return }
    let merkez = NotificationCenter.default
    let adlar: [Notification.Name] = [
      .NSProcessInfoPowerStateDidChange,
      UIDevice.batteryStateDidChangeNotification,
      UIApplication.backgroundRefreshStatusDidChangeNotification,
    ]
    if !UIDevice.current.isBatteryMonitoringEnabled { UIDevice.current.isBatteryMonitoringEnabled = true }
    gozlemciler = adlar.map { ad in
      merkez.addObserver(forName: ad, object: nil, queue: .main) { [weak self] _ in
        self?.yayinla()
      }
    }
  }

  private func dinlemeyiDurdur() {
    kilit.lock()
    dinliyor = false
    kilit.unlock()
    gozlemciler.forEach { NotificationCenter.default.removeObserver($0) }
    gozlemciler = []
  }
}
