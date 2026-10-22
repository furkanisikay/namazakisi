"""TV eşitleme kanalı (AES-256-GCM) ortak fikstürünü BAĞIMSIZ bir uygulamayla üretir.

Telefon (`@noble/ciphers`) ve TV (`javax.crypto`) bu dosyayla doğrulanır; ikisi de kendi
çıktısını buraya karşı sınar. Kural değişirse: betiği yeniden koş, TS + Kotlin testleri
birlikte güncelle.

    python scripts/tv/esitleme-fikstur-uret.py > tv/app/src/test/resources/esitleme-ornekleri.json
"""
import base64
import json

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def b64(b: bytes) -> str:
    return base64.b64encode(b).decode()


ANAHTAR = bytes(range(32))
SIR = bytes((i * 7 + 3) % 256 for i in range(32))
TV = "0123456789abcdef"
UYE = "fedcba9876543210"


def sifrele(anahtar: bytes, iv: bytes, aad: str, duz: str) -> dict:
    ct = AESGCM(anahtar).encrypt(iv, duz.encode("utf-8"), aad.encode("utf-8"))
    return {"iv": b64(iv), "aad": aad, "duz": duz, "ct": b64(ct)}


yuk = json.dumps(
    {"v": 2, "durum": {
        "ad": "Kadıköy, İstanbul",
        "konum": {"lat": 40.99, "lng": 29.03},
        "kilinan": {"2026-10-20": ["imsak", "ogle"], "2026-10-21": ["imsak"]},
        "ozelGun": False,
        "tvHatirlat": True,
        "durumumSayilsin": True,
        "cuma": {"aktif": True, "cikisDk": 25},
        "ramazan": False,
    }},
    ensure_ascii=False,
    separators=(",", ":"),
)

kanal = sifrele(ANAHTAR, bytes(range(0xA0, 0xAC)), f"2|{TV}|{UYE}|7", yuk)
istek = sifrele(
    SIR,
    bytes(range(0x10, 0x1C)),
    f"esle|2|{TV}|istek",
    json.dumps({"cihaz": "Furkan'ın telefonu", "ist": "a1b2c3d4e5f60718"}, ensure_ascii=False, separators=(",", ":")),
)
yanit = sifrele(
    SIR,
    bytes(range(0x30, 0x3C)),
    f"esle|2|{TV}|yanit|a1b2c3d4e5f60718",
    json.dumps({"durum": "onay", "u": UYE, "k": b64(ANAHTAR), "tvAdi": "Salon TV"}, ensure_ascii=False, separators=(",", ":")),
)

bozukEtiket = dict(kanal)
ct = bytearray(base64.b64decode(kanal["ct"]))
ct[-1] ^= 0x01
bozukEtiket = {**kanal, "ct": b64(bytes(ct))}

print(
    json.dumps(
        {
            "_aciklama": "TV eşitleme kanalı AES-256-GCM fikstürü. scripts/tv/esitleme-fikstur-uret.py (Python cryptography) üretir; telefon @noble/ciphers ve TV javax.crypto bu dosyaya karşı sınanır. ct = şifreli metin || 16 bayt GCM etiketi, base64. AAD UTF-8 dizesidir.",
            "anahtar": b64(ANAHTAR),
            "sir": base64.urlsafe_b64encode(SIR).decode().rstrip("="),
            "tvKimlik": TV,
            "uye": UYE,
            "kanal": kanal,
            "esleIstek": istek,
            "esleYanit": yanit,
            "ozelIpv4": {
                "_aciklama": "Telefon (TS + native) ve TV aynı katı kuralı uygular (denetim D-06): RFC 1918, oktet 0-255, başta sıfır/işaret yok.",
                "gecerli": ["10.0.0.7", "192.168.1.23", "172.16.0.1", "172.31.255.255", "10.255.255.254"],
                "gecersiz": [
                    "010.010.010.010", "192.168.01.1", "+10.0.0.1", "10.0.0.256", "172.15.0.1", "172.32.0.1",
                    "8.8.8.8", "127.0.0.1", "10.0.0", "10.0.0.1.1", " 10.0.0.1", "10.0.0.1 ", "0x0a.0.0.1", "",
                ],
            },
            "kararliPort": {k: 40000 + int(k[:4], 16) % 20000 for k in [TV, UYE, "ffffffffffffffff"]},
            "redler": [
                {"neden": "etiket bozuk", **bozukEtiket},
                {"neden": "AAD'de n farklı (tekrar/kaydırma)", **{**kanal, "aad": f"2|{TV}|{UYE}|8"}},
                {"neden": "başka TV kimliği", **{**kanal, "aad": f"2|ffffffffffffffff|{UYE}|7"}},
            ],
        },
        ensure_ascii=False,
        indent=2,
    )
)
