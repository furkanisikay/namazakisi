#!/usr/bin/env python3
"""
Cami verisi üretici (Camideyim, issue #297).

OpenStreetMap PBF/OSM dosyasından `amenity=place_of_worship` + `religion=muslim`
öğelerini (node / way / relation) okuyup uygulamanın paketlediği kompakt ikili
dosyayı (`assets/camiler/tr.bin`) üretir. Biçim: `scripts/camiler/BICIM.md`.

Kullanım:
    python3 -I scripts/camiler/cami_verisi_uret.py GIRDI.osm.pbf CIKTI.bin [--ozet OZET.json]

Girdi önce osmium-tool ile süzülmüş olabilir (hız için, iş akışı böyle yapar):
    osmium tags-filter turkey-latest.osm.pbf nwr/amenity=place_of_worship -o suzulmus.osm.pbf

Bağımlılık: pyosmium (`pip install osmium`). Başka paket YOK — basitleştirme ve
geometri saf Python'dur.

Lisans: Bu betik projenin lisansındadır (GPL-3.0). ÜRETTİĞİ VERİ ise
OpenStreetMap türevidir ve ODbL 1.0 lisanslıdır (`assets/camiler/LICENSE.ODbL`).
"""
from __future__ import annotations

import argparse
import json
import math
import struct
import sys
import time
import zlib

SIHIR = b"NACM"
SURUM = 1
BASLIK_BOYUTU = 64
KAYIT_BOYUTU = 24
HUCRE_UDERECE = 100_000  # 0.1° ızgara hücresi (mikro-derece)
AZAMI_KOSE = 12
ADSIZ = 0xFFFFFFFF
POLIGONSUZ = 0xFFFFFFFF
DUNYA_YARICAPI_M = 6_371_008.8
I16_MAX = 32767

TUR_NODE, TUR_WAY, TUR_RELATION = 0, 1, 2


# --------------------------------------------------------------------------- #
# Geometri (saf)
# --------------------------------------------------------------------------- #
def yerel_xy(lat0: float, lng0: float, lat: float, lng: float) -> tuple[float, float]:
    """Merkez etrafında eşdikdörtgen izdüşüm (metre). Bina ölçeğinde hata ihmal edilebilir."""
    x = math.radians(lng - lng0) * math.cos(math.radians(lat0)) * DUNYA_YARICAPI_M
    y = math.radians(lat - lat0) * DUNYA_YARICAPI_M
    return x, y


def _nokta_dogru_uzakligi(p, a, b) -> float:
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def douglas_peucker(noktalar: list, eps: float) -> list:
    if len(noktalar) < 3:
        return list(noktalar)
    en_buyuk, indeks = 0.0, 0
    for i in range(1, len(noktalar) - 1):
        d = _nokta_dogru_uzakligi(noktalar[i], noktalar[0], noktalar[-1])
        if d > en_buyuk:
            en_buyuk, indeks = d, i
    if en_buyuk <= eps:
        return [noktalar[0], noktalar[-1]]
    sol = douglas_peucker(noktalar[: indeks + 1], eps)
    sag = douglas_peucker(noktalar[indeks:], eps)
    return sol[:-1] + sag


def dis_burun(noktalar: list) -> list:
    """Konveks zarf (Andrew). Basitleştirme başarısız olursa yedek."""
    p = sorted(set(noktalar))
    if len(p) <= 2:
        return p

    def capraz(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    alt, ust = [], []
    for q in p:
        while len(alt) >= 2 and capraz(alt[-2], alt[-1], q) <= 0:
            alt.pop()
        alt.append(q)
    for q in reversed(p):
        while len(ust) >= 2 and capraz(ust[-2], ust[-1], q) <= 0:
            ust.pop()
        ust.append(q)
    return alt[:-1] + ust[:-1]


def halkayi_basitlestir(halka_xy: list) -> list:
    """Kapalı halkayı (son nokta tekrarsız) en fazla AZAMI_KOSE köşeye indirir."""
    if len(halka_xy) <= AZAMI_KOSE:
        return list(halka_xy)
    kapali = list(halka_xy) + [halka_xy[0]]
    eps = 0.5
    while eps <= 64:
        sonuc = douglas_peucker(kapali, eps)[:-1]
        if 3 <= len(sonuc) <= AZAMI_KOSE:
            return sonuc
        eps *= 1.6
    zarf = dis_burun(halka_xy)
    if len(zarf) <= AZAMI_KOSE:
        return zarf
    kapali = zarf + [zarf[0]]
    eps = 1.0
    while eps <= 500:
        sonuc = douglas_peucker(kapali, eps)[:-1]
        if 3 <= len(sonuc) <= AZAMI_KOSE:
            return sonuc
        eps *= 1.6
    return zarf[:AZAMI_KOSE]


def alan_ve_agirlik_merkezi(halka_xy: list) -> tuple[float, float, float]:
    a = cx = cy = 0.0
    n = len(halka_xy)
    for i in range(n):
        x0, y0 = halka_xy[i]
        x1, y1 = halka_xy[(i + 1) % n]
        k = x0 * y1 - x1 * y0
        a += k
        cx += (x0 + x1) * k
        cy += (y0 + y1) * k
    a *= 0.5
    if abs(a) < 1e-9:
        mx = sum(p[0] for p in halka_xy) / n
        my = sum(p[1] for p in halka_xy) / n
        return 0.0, mx, my
    return abs(a), cx / (6 * a), cy / (6 * a)


# --------------------------------------------------------------------------- #
# Kayıt
# --------------------------------------------------------------------------- #
class Kayit:
    __slots__ = ("lat", "lng", "osm_id", "tur", "yaricap", "kose", "ad")

    def __init__(self, lat, lng, osm_id, tur, yaricap, kose, ad):
        self.lat, self.lng = lat, lng
        self.osm_id, self.tur = osm_id, tur
        self.yaricap = yaricap  # 0 = varsayılan (node)
        self.kose = kose  # [(dLatE6, dLngE6), ...] ya da []
        self.ad = ad


def etiket_uygun_mu(etiketler) -> bool:
    return etiketler.get("amenity") == "place_of_worship" and etiketler.get("religion") == "muslim"


def ad_sec(etiketler) -> str:
    return (etiketler.get("name:tr") or etiketler.get("name") or "").strip()


def halkadan_kayit(halka_lonlat: list, osm_id: int, tur: int, ad: str) -> Kayit | None:
    """[(lng, lat), ...] kapalı halka → kayıt (merkez + ≤12 köşe + yarıçap)."""
    if len(halka_lonlat) >= 2 and halka_lonlat[0] == halka_lonlat[-1]:
        halka_lonlat = halka_lonlat[:-1]
    if len(halka_lonlat) < 3:
        return None
    lat0 = sum(p[1] for p in halka_lonlat) / len(halka_lonlat)
    lng0 = sum(p[0] for p in halka_lonlat) / len(halka_lonlat)
    xy = [yerel_xy(lat0, lng0, lat, lng) for (lng, lat) in halka_lonlat]
    _, cx, cy = alan_ve_agirlik_merkezi(xy)
    m_lat = lat0 + math.degrees(cy / DUNYA_YARICAPI_M)
    m_lng = lng0 + math.degrees(cx / (DUNYA_YARICAPI_M * math.cos(math.radians(lat0))))
    basit = halkayi_basitlestir(xy)
    kose = []
    yaricap = 0.0
    for (x, y) in basit:
        lat = lat0 + math.degrees(y / DUNYA_YARICAPI_M)
        lng = lng0 + math.degrees(x / (DUNYA_YARICAPI_M * math.cos(math.radians(lat0))))
        d_lat = round((lat - m_lat) * 1e6)
        d_lng = round((lng - m_lng) * 1e6)
        kose.append((d_lat, d_lng))
    for (x, y) in xy:
        yaricap = max(yaricap, math.hypot(x - cx, y - cy))
    if any(abs(a) > I16_MAX or abs(b) > I16_MAX for a, b in kose):
        kose = []  # ~3,6 km'den büyük alan: poligon taşınmaz, yarıçap yeter
    return Kayit(m_lat, m_lng, osm_id, tur, max(1, min(255, math.ceil(yaricap))), kose, ad)


def osmium_ile_topla(girdi: str) -> tuple[list[Kayit], dict]:
    import osmium  # yalnız gerçek üretimde gerekir

    kayitlar: list[Kayit] = []
    sayac = {"node": 0, "way": 0, "relation": 0, "atlanan": 0}

    class Toplayici(osmium.SimpleHandler):
        def node(self, n):
            if not etiket_uygun_mu(n.tags) or not n.location.valid():
                return
            kayitlar.append(Kayit(n.location.lat, n.location.lon, n.id, TUR_NODE, 0, [], ad_sec(n.tags)))
            sayac["node"] += 1

        def way(self, w):
            if not etiket_uygun_mu(w.tags):
                return
            try:
                noktalar = [(nd.lon, nd.lat) for nd in w.nodes if nd.location.valid()]
            except osmium.InvalidLocationError:
                noktalar = []
            if len(noktalar) < 2:
                sayac["atlanan"] += 1
                return
            k = halkadan_kayit(noktalar, w.id, TUR_WAY, ad_sec(w.tags)) if w.is_closed() else None
            if k is None:
                # Açık yol (nadir): merkez + yarıçap.
                lat = sum(p[1] for p in noktalar) / len(noktalar)
                lng = sum(p[0] for p in noktalar) / len(noktalar)
                r = max(math.hypot(*yerel_xy(lat, lng, p[1], p[0])) for p in noktalar)
                k = Kayit(lat, lng, w.id, TUR_WAY, max(1, min(255, math.ceil(r))), [], ad_sec(w.tags))
            kayitlar.append(k)
            sayac["way"] += 1

        def area(self, a):
            # Kapalı yollar `way()` içinde işlendi; burada yalnız multipolygon ilişkiler.
            if a.from_way() or not etiket_uygun_mu(a.tags):
                return
            en_iyi, en_iyi_alan = None, -1.0
            for dis in a.outer_rings():
                halka = [(nd.lon, nd.lat) for nd in dis if nd.location.valid()]
                if len(halka) < 4:
                    continue
                lat0 = halka[0][1]
                xy = [yerel_xy(lat0, halka[0][0], p[1], p[0]) for p in halka]
                alan, _, _ = alan_ve_agirlik_merkezi(xy)
                if alan > en_iyi_alan:
                    en_iyi, en_iyi_alan = halka, alan
            if en_iyi is None:
                sayac["atlanan"] += 1
                return
            k = halkadan_kayit(en_iyi, a.orig_id(), TUR_RELATION, ad_sec(a.tags))
            if k:
                kayitlar.append(k)
                sayac["relation"] += 1

    Toplayici().apply_file(girdi, locations=True)
    return kayitlar, sayac


# --------------------------------------------------------------------------- #
# Yazım
# --------------------------------------------------------------------------- #
def ikili_uret(kayitlar: list[Kayit], veri_zamani: int) -> bytes:
    if not kayitlar:
        raise SystemExit("Hiç kayıt yok — girdi yanlış mı?")
    # Aynı OSM nesnesi iki kez gelmesin (tür + id).
    tekil = {}
    for k in kayitlar:
        tekil[(k.tur, k.osm_id)] = k
    kayitlar = list(tekil.values())

    lat_e6 = [round(k.lat * 1e6) for k in kayitlar]
    lng_e6 = [round(k.lng * 1e6) for k in kayitlar]
    min_lat = (min(lat_e6) // HUCRE_UDERECE) * HUCRE_UDERECE
    min_lng = (min(lng_e6) // HUCRE_UDERECE) * HUCRE_UDERECE
    satir = (max(lat_e6) - min_lat) // HUCRE_UDERECE + 1
    sutun = (max(lng_e6) - min_lng) // HUCRE_UDERECE + 1
    if satir > 0xFFFF or sutun > 0xFFFF:
        raise SystemExit("Izgara çok büyük")

    def hucre(i: int) -> int:
        r = (lat_e6[i] - min_lat) // HUCRE_UDERECE
        c = (lng_e6[i] - min_lng) // HUCRE_UDERECE
        return r * sutun + c

    sira = sorted(range(len(kayitlar)), key=lambda i: (hucre(i), lat_e6[i], lng_e6[i], kayitlar[i].tur, kayitlar[i].osm_id))

    izgara = [0] * (satir * sutun + 1)
    for i in sira:
        izgara[hucre(i) + 1] += 1
    for j in range(1, len(izgara)):
        izgara[j] += izgara[j - 1]

    kayit_tablosu = bytearray()
    poligon_tablosu = bytearray()
    ad_tablosu = bytearray()
    ad_ofsetleri: dict[str, int] = {}
    for i in sira:
        k = kayitlar[i]
        if k.ad:
            if k.ad not in ad_ofsetleri:
                b = k.ad.encode("utf-8")
                if len(b) > 255:
                    b = b[:255].decode("utf-8", "ignore").encode("utf-8")
                ad_ofsetleri[k.ad] = len(ad_tablosu)
                ad_tablosu += struct.pack("<B", len(b)) + b
            ad_ofset = ad_ofsetleri[k.ad]
        else:
            ad_ofset = ADSIZ
        if k.kose:
            pol_ofset = len(poligon_tablosu)
            for d_lat, d_lng in k.kose:
                poligon_tablosu += struct.pack("<hh", d_lat, d_lng)
        else:
            pol_ofset = POLIGONSUZ
        kayit_tablosu += struct.pack(
            "<iiIBBBBII",
            lat_e6[i],
            lng_e6[i],
            k.osm_id & 0xFFFFFFFF,
            (k.osm_id >> 32) & 0xFF,
            k.tur,
            len(k.kose),
            k.yaricap,
            pol_ofset,
            ad_ofset,
        )

    izgara_bayt = struct.pack(f"<{len(izgara)}I", *izgara)
    izgara_ofset = BASLIK_BOYUTU
    kayit_ofset = izgara_ofset + len(izgara_bayt)
    poligon_ofset = kayit_ofset + len(kayit_tablosu)
    ad_ofset_t = poligon_ofset + len(poligon_tablosu)
    toplam = ad_ofset_t + len(ad_tablosu)
    govde = izgara_bayt + bytes(kayit_tablosu) + bytes(poligon_tablosu) + bytes(ad_tablosu)
    crc = zlib.crc32(govde) & 0xFFFFFFFF

    baslik = struct.pack(
        "<4sHHIIiiHHIIIIIII8x",
        SIHIR,
        SURUM,
        KAYIT_BOYUTU,
        len(kayitlar),
        HUCRE_UDERECE,
        min_lat,
        min_lng,
        satir,
        sutun,
        veri_zamani,
        kayit_ofset,
        poligon_ofset,
        ad_ofset_t,
        izgara_ofset,
        toplam,
        crc,
    )
    assert len(baslik) == BASLIK_BOYUTU, len(baslik)
    return baslik + govde


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("girdi")
    ap.add_argument("cikti")
    ap.add_argument("--ozet", help="Kayıt sayısı/boyut özetinin yazılacağı JSON")
    ap.add_argument("--veri-zamani", type=int, default=None, help="Unix saniye (varsayılan: şimdi)")
    arg = ap.parse_args(argv)

    kayitlar, sayac = osmium_ile_topla(arg.girdi)
    veri = ikili_uret(kayitlar, arg.veri_zamani if arg.veri_zamani is not None else int(time.time()))
    with open(arg.cikti, "wb") as f:
        f.write(veri)
    ozet = {
        "kayit": len(kayitlar),
        "dagilim": sayac,
        "poligonlu": sum(1 for k in kayitlar if k.kose),
        "adli": sum(1 for k in kayitlar if k.ad),
        "bayt": len(veri),
    }
    print(json.dumps(ozet, ensure_ascii=False))
    if arg.ozet:
        with open(arg.ozet, "w", encoding="utf-8") as f:
            json.dump(ozet, f, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
