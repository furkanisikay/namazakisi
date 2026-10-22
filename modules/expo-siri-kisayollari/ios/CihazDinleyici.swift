import Foundation
import Network

/// Cihaz agi dinleyicisi (iPhone / iPad; YALNIZ on planda - JS AppState'e baglar). Android
/// `expo-tv-esleme/.../CihazDinleyici.kt` ikizi: kararlar ve sifre JS'te; burada yalniz kapilar
/// (yerel es, en cok 3 baglanti, baslik <= 1 KB, govde <= 8 KB, 5 sn okuma) ve istek olayla
/// JS'e verilir; JS 8 sn icinde `yanitla` demezse 503.
///
/// Bonjour: `_namazakisi._tcp`, TXT `i=<kimlik>`, `t=cihaz`. Info.plist'te
/// `NSBonjourServices` + `NSLocalNetworkUsageDescription` (app.json) zorunlu; iOS ilk dinlemede
/// yerel ag iznini sorar.
final class CihazDinleyici {
    static let govdeAzami = 8 * 1024
    static let baslikAzami = 1024
    static let yollar: Set<String> = ["/esle", "/esle-durum", "/esitle"]

    private var dinleyici: NWListener?
    private let kuyruk = DispatchQueue(label: "namazakisi.cihaz.dinleyici")
    private var bekleyenler: [String: (Int, String) -> Void] = [:]
    private var sayac = 0
    private var acik = 0
    private let olay: ([String: Any]) -> Void

    init(olay: @escaping ([String: Any]) -> Void) {
        self.olay = olay
    }

    /// Once kararli porta (kimlikten) baglanir: es yeniden basladiginda iPhone (kesif yapmaz) ayni
    /// adrese ulassin. Port doluysa sistem secer.
    func baslat(kimlik: String, ad: String, tercihPort: Int, tamam: @escaping (Int?) -> Void) {
        kuyruk.async {
            if let d = self.dinleyici, let port = d.port?.rawValue {
                tamam(Int(port))
                return
            }
            self.ac(kimlik: kimlik, ad: ad, port: NWEndpoint.Port(rawValue: UInt16(clamping: tercihPort)), tamam: tamam)
        }
    }

    private func ac(kimlik: String, ad: String, port: NWEndpoint.Port?, tamam: @escaping (Int?) -> Void) {
        do {
            let d = try NWListener(using: .tcp, on: port ?? .any)
            let txt = NWTXTRecord(["i": kimlik, "t": "cihaz"])
            d.service = NWListener.Service(name: String(ad.prefix(40)), type: "_namazakisi._tcp", domain: nil, txtRecord: txt)
            var bildirildi = false
            d.stateUpdateHandler = { [weak self] durum in
                switch durum {
                case .ready:
                    if !bildirildi { bildirildi = true; tamam(d.port.map { Int($0.rawValue) }) }
                case .failed, .cancelled:
                    guard !bildirildi else { return }
                    bildirildi = true
                    if port != nil, let self = self {
                        // Kararli port dolu: sistem secsin.
                        self.dinleyici = nil
                        self.ac(kimlik: kimlik, ad: ad, port: nil, tamam: tamam)
                    } else {
                        tamam(nil)
                    }
                default:
                    break
                }
            }
            d.newConnectionHandler = { [weak self] b in self?.kabul(b) }
            dinleyici = d
            d.start(queue: kuyruk)
        } catch {
            if port != nil { ac(kimlik: kimlik, ad: ad, port: nil, tamam: tamam) } else { tamam(nil) }
        }
    }

    func durdur() {
        kuyruk.async {
            self.dinleyici?.cancel()
            self.dinleyici = nil
            let eski = self.bekleyenler
            self.bekleyenler = [:]
            eski.values.forEach { $0(503, "") }
        }
    }

    func yanitla(id: String, kod: Int, govde: String) {
        kuyruk.async {
            guard let geri = self.bekleyenler.removeValue(forKey: id) else { return }
            geri([200, 202, 400, 403, 409].contains(kod) ? kod : 503, govde)
        }
    }

    // MARK: - Baglanti

    private func kabul(_ b: NWConnection) {
        guard acik < 3, CihazDinleyici.yerelMi(b.endpoint) else {
            b.cancel()
            return
        }
        acik += 1
        b.stateUpdateHandler = { [weak self] durum in
            switch durum {
            case .cancelled, .failed:
                self?.kuyruk.async { self?.acik -= 1 }
            default:
                break
            }
        }
        b.start(queue: kuyruk)
        kuyruk.asyncAfter(deadline: .now() + 5) { if b.state != .cancelled { b.cancel() } }
        oku(b, birikim: Data())
    }

    private func oku(_ b: NWConnection, birikim: Data) {
        b.receive(minimumIncompleteLength: 1, maximumLength: 4096) { [weak self] veri, _, bitti, hata in
            guard let self = self else { return }
            var tampon = birikim
            if let veri = veri { tampon.append(veri) }
            if hata != nil || tampon.count > CihazDinleyici.baslikAzami + CihazDinleyici.govdeAzami {
                b.cancel()
                return
            }
            guard let ayrac = tampon.range(of: Data("\r\n\r\n".utf8)) else {
                if bitti { b.cancel() } else { self.oku(b, birikim: tampon) }
                return
            }
            guard ayrac.lowerBound <= CihazDinleyici.baslikAzami,
                  let baslik = String(data: tampon[tampon.startIndex..<ayrac.lowerBound], encoding: .isoLatin1),
                  let (yol, uzunluk) = CihazDinleyici.baslikCoz(baslik)
            else {
                self.yaz(b, kod: 400, govde: "")
                return
            }
            let govde = tampon[ayrac.upperBound...]
            if govde.count < uzunluk {
                if bitti { b.cancel() } else { self.oku(b, birikim: tampon) }
                return
            }
            let metin = String(data: govde.prefix(uzunluk), encoding: .utf8) ?? ""
            self.sayac += 1
            let id = "i\(self.sayac)"
            self.bekleyenler[id] = { [weak self] kod, yanit in self?.yaz(b, kod: kod, govde: yanit) }
            self.olay(["id": id, "yol": yol, "govde": metin, "ip": CihazDinleyici.ipMetni(b.endpoint)])
            self.kuyruk.asyncAfter(deadline: .now() + 8) {
                if let geri = self.bekleyenler.removeValue(forKey: id) { geri(503, "") }
            }
        }
    }

    private func yaz(_ b: NWConnection, kod: Int, govde: String) {
        let metin: String
        switch kod {
        case 200: metin = "OK"
        case 202: metin = "Accepted"
        case 400: metin = "Bad Request"
        case 403: metin = "Forbidden"
        case 409: metin = "Conflict"
        default: metin = "Service Unavailable"
        }
        let bayt = Data(govde.utf8)
        let basliklar = "HTTP/1.1 \(kod) \(metin)\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: \(bayt.count)\r\nConnection: close\r\n\r\n"
        var paket = Data(basliklar.utf8)
        paket.append(bayt)
        b.send(content: paket, completion: .contentProcessed { _ in b.cancel() })
    }

    /// en0 (Wi-Fi) uzerindeki ozel IPv4.
    static func yerelIpv4() -> String? {
        var liste: UnsafeMutablePointer<ifaddrs>?
        guard getifaddrs(&liste) == 0, let ilk = liste else { return nil }
        defer { freeifaddrs(liste) }
        var bulunan: String?
        var p: UnsafeMutablePointer<ifaddrs>? = ilk
        while let a = p {
            let arayuz = a.pointee
            if let adres = arayuz.ifa_addr, adres.pointee.sa_family == UInt8(AF_INET), String(cString: arayuz.ifa_name) == "en0" {
                var ad = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                if getnameinfo(adres, socklen_t(adres.pointee.sa_len), &ad, socklen_t(ad.count), nil, 0, NI_NUMERICHOST) == 0 {
                    let aday = String(cString: ad)
                    // QR yalniz OZEL IPv4 tasir (okuyan taraf zaten reddeder): 10/8, 172.16/12, 192.168/16.
                    let o = aday.split(separator: ".").compactMap { Int($0) }
                    if o.count == 4, o[0] == 10 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && (16...31).contains(o[1])) {
                        bulunan = aday
                    }
                }
            }
            p = arayuz.ifa_next
        }
        return bulunan
    }

    // MARK: - Saf kurallar (Android `DinleyiciKurallari` ikizi)

    static func baslikCoz(_ baslik: String) -> (String, Int)? {
        let satirlar = baslik.components(separatedBy: "\r\n")
        let ilk = (satirlar.first ?? "").split(separator: " ").map(String.init)
        guard ilk.count >= 3, ilk[0] == "POST", ilk[2].hasPrefix("HTTP/1."), yollar.contains(ilk[1]) else { return nil }
        for satir in satirlar.dropFirst() {
            let parca = satir.split(separator: ":", maxSplits: 1).map { $0.trimmingCharacters(in: .whitespaces) }
            if parca.count == 2, parca[0].lowercased() == "content-length", let n = Int(parca[1]), (1...govdeAzami).contains(n) {
                return (ilk[1], n)
            }
        }
        return nil
    }

    /// Esin IPv4 metni (IPv4-eslemeli IPv6 dahil); bilinmiyorsa bos.
    static func ipMetni(_ uc: NWEndpoint) -> String {
        guard case let .hostPort(host, _) = uc else { return "" }
        switch host {
        case .ipv4(let a):
            return [UInt8](a.rawValue).map(String.init).joined(separator: ".")
        case .ipv6(let a):
            let o = [UInt8](a.rawValue)
            if o.prefix(10).allSatisfy({ $0 == 0 }) && o[10] == 0xff && o[11] == 0xff { return o[12...15].map(String.init).joined(separator: ".") }
            return ""
        default:
            return ""
        }
    }

    static func yerelMi(_ uc: NWEndpoint) -> Bool {
        guard case let .hostPort(host, _) = uc else { return false }
        switch host {
        case .ipv4(let a):
            let o = [UInt8](a.rawValue)
            return o[0] == 10 || o[0] == 127 || (o[0] == 192 && o[1] == 168) || (o[0] == 172 && (16...31).contains(o[1]))
        case .ipv6(let a):
            let o = [UInt8](a.rawValue)
            if o.prefix(10).allSatisfy({ $0 == 0 }) && o[10] == 0xff && o[11] == 0xff {
                return o[12] == 10 || o[12] == 127 || (o[12] == 192 && o[13] == 168) || (o[12] == 172 && (16...31).contains(o[13]))
            }
            if o.prefix(15).allSatisfy({ $0 == 0 }) && o[15] == 1 { return true }
            return (o[0] == 0xfe && (o[1] & 0xc0) == 0x80) || (o[0] & 0xfe) == 0xfc
        default:
            return false
        }
    }
}
