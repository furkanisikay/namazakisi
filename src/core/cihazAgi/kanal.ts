/**
 * Cihaz ağı şifreli kanalı (tasarım `docs/superpowers/specs/2026-10-21-cihaz-ekosistemi-design.md` §4.3).
 *
 * TV'ye özgü DEĞİLDİR: telefon → TV (alıcı-only) bugün; telefon ↔ tablet (çift yönlü) aynı
 * kanalı kullanacak. Sunucu YOK; iki cihaz yerel ağda doğrudan konuşur.
 *
 * - AES-256-GCM, üyeye özel 32 bayt anahtar (eşleştirmede alıcı üretir).
 * - iv = rastgele 12 bayt (çağıran verir: üretimde expo-crypto CSPRNG; testte sabit).
 * - `n` üye başına KESİN ARTAN sayaç; yalnız tekrar (replay) koruması. Alıcı "son görülen"den
 *   büyük olmayanı reddeder. Ardışık olması gerekmez (gönderen çökerse atlama zararsız).
 * - AAD = `v|alıcıKimlik|üye|n` (UTF-8). Eşleştirme mesajları ayrı önekle (`esle|…`) bağlanır;
 *   üye kanalıyla karışamaz.
 * - Zarf: `{v, u, n, iv, ct}`; ct = şifreli metin || 16 bayt GCM etiketi, base64.
 *
 * İkizi: TV `cekirdek/CihazKanali.kt` (javax.crypto). Ortak fikstür
 * `tv/app/src/test/resources/esitleme-ornekleri.json`, BAĞIMSIZ bir Python uygulamasıyla üretilir
 * (`scripts/tv/esitleme-fikstur-uret.py`). Saf modül: React Native / expo import ETMEZ.
 */
import { gcm } from '@noble/ciphers/aes';
import naclUtil from 'tweetnacl-util';

export const KANAL_SURUMU = 2;
export const IV_UZUNLUGU = 12;

export interface KanalZarfi {
    v: number;
    u: string;
    n: number;
    iv: string;
    ct: string;
}

export const kanalAad = (aliciKimlik: string, uye: string, n: number): string => `${KANAL_SURUMU}|${aliciKimlik}|${uye}|${n}`;
export const esleIstekAad = (aliciKimlik: string): string => `esle|${KANAL_SURUMU}|${aliciKimlik}|istek`;
export const esleYanitAad = (aliciKimlik: string, istek: string): string => `esle|${KANAL_SURUMU}|${aliciKimlik}|yanit|${istek}`;

export function base64Coz(b64: string): Uint8Array {
    return naclUtil.decodeBase64(b64);
}

export function base64Yaz(b: Uint8Array): string {
    return naclUtil.encodeBase64(b);
}

/** QR'daki eşleştirme sırrı base64url (dolgusuz). */
export function base64UrlCoz(s: string): Uint8Array {
    const std = s.replace(/-/g, '+').replace(/_/g, '/');
    return naclUtil.decodeBase64(std + '='.repeat((4 - (std.length % 4)) % 4));
}

/** Düz metni şifreler; `ct` (etiket dahil) base64 döner. */
export function sifrele(anahtar: Uint8Array, iv: Uint8Array, aad: string, duz: string): string {
    if (anahtar.length !== 32) throw new Error('anahtar 32 bayt olmalı');
    if (iv.length !== IV_UZUNLUGU) throw new Error('iv 12 bayt olmalı');
    const sifreli = gcm(anahtar, iv, naclUtil.decodeUTF8(aad)).encrypt(naclUtil.decodeUTF8(duz));
    return base64Yaz(sifreli);
}

/** Çözer; etiket/AAD/anahtar tutmazsa `null` (ASLA fırlatmaz — kötü veri bir sonuçtur). */
export function coz(anahtar: Uint8Array, ivB64: string, aad: string, ctB64: string): string | null {
    try {
        const iv = base64Coz(ivB64);
        if (anahtar.length !== 32 || iv.length !== IV_UZUNLUGU) return null;
        const duz = gcm(anahtar, iv, naclUtil.decodeUTF8(aad)).decrypt(base64Coz(ctB64));
        return naclUtil.encodeUTF8(duz);
    } catch {
        return null;
    }
}

/** Üye kanalı zarfı. */
export function zarfla(
    anahtar: Uint8Array,
    iv: Uint8Array,
    aliciKimlik: string,
    uye: string,
    n: number,
    duz: string,
): KanalZarfi {
    return { v: KANAL_SURUMU, u: uye, n, iv: base64Yaz(iv), ct: sifrele(anahtar, iv, kanalAad(aliciKimlik, uye, n), duz) };
}
