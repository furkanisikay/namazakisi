package com.furkanisikay.namazakisi.tv.cekirdek

import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * Cihaz ağı şifreli kanalı — alıcı tarafı (telefon ikizi `src/core/cihazAgi/kanal.ts`).
 *
 * AES-256-GCM (`javax.crypto`, API 26+), 12 bayt iv, 128 bit etiket; ct = şifreli || etiket.
 * AAD: üye kanalı `2|alıcı|üye|n`, eşleştirme `esle|2|alıcı|istek` / `esle|2|alıcı|yanit|<ist>`.
 * Ortak fikstür `esitleme-ornekleri.json` (bağımsız Python üretimi). Saf: android.* yok.
 */
object CihazKanali {
    const val SURUM = 2
    private const val ETIKET_BIT = 128

    fun kanalAad(alici: String, uye: String, n: Long) = "$SURUM|$alici|$uye|$n"
    fun esleIstekAad(alici: String) = "esle|$SURUM|$alici|istek"
    fun esleYanitAad(alici: String, istek: String) = "esle|$SURUM|$alici|yanit|$istek"

    fun b64(b: ByteArray): String = Base64.getEncoder().encodeToString(b)
    fun b64Coz(s: String): ByteArray? = try {
        Base64.getDecoder().decode(s)
    } catch (e: IllegalArgumentException) {
        null
    }

    fun b64UrlYaz(b: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(b)

    fun sifrele(anahtar: ByteArray, iv: ByteArray, aad: String, duz: String): String {
        require(anahtar.size == 32 && iv.size == 12)
        val c = Cipher.getInstance("AES/GCM/NoPadding")
        c.init(Cipher.ENCRYPT_MODE, SecretKeySpec(anahtar, "AES"), GCMParameterSpec(ETIKET_BIT, iv))
        c.updateAAD(aad.toByteArray(Charsets.UTF_8))
        return b64(c.doFinal(duz.toByteArray(Charsets.UTF_8)))
    }

    /** Çözer; anahtar/AAD/etiket tutmazsa `null` (fırlatmaz). */
    fun coz(anahtar: ByteArray, ivB64: String, aad: String, ctB64: String): String? = try {
        val iv = b64Coz(ivB64)
        val ct = b64Coz(ctB64)
        if (iv == null || ct == null || iv.size != 12 || anahtar.size != 32 || ct.size < 16) {
            null
        } else {
            val c = Cipher.getInstance("AES/GCM/NoPadding")
            c.init(Cipher.DECRYPT_MODE, SecretKeySpec(anahtar, "AES"), GCMParameterSpec(ETIKET_BIT, iv))
            c.updateAAD(aad.toByteArray(Charsets.UTF_8))
            String(c.doFinal(ct), Charsets.UTF_8)
        }
    } catch (e: Exception) {
        null
    }
}
