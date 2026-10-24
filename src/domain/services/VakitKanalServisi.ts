/**
 * "Vakit girdi" bildiriminin SESE ÖZGÜ kanalları — muhafızın `MuhafizKanalServisi`
 * ikizi, AYRI uzayda (`vakit_bildirim_<hash8>`).
 *
 * Planlamadan ÖNCE çağrılır (`VakitBildirimYoneticiServisi.bildirimleriGuncelle`):
 *  1. Her özel sesi native `sesAdiAl` ile doğrular; çözülemeyen (silinmiş dosya)
 *     varsayılana düşer — doğrulanmış kayıt DİSKE YAZILMAZ, her tur yeniden doğrulanır.
 *  2. Kalan seslerin kanalını YOKSA kurar (var olan kanala ses yazılmaz; kanal sesi
 *     değiştirilemez, id sesin fonksiyonudur).
 *  3. Kullanılmayan `vakit_bildirim_*` kanallarını toplar (taban kanal korunur).
 *
 * Doğrulanmış kayıt DÖNDÜRÜLÜR; çağıran bildirimleri O kayıtla planlar — ham kayıtla
 * planlamak var olmayan kanala bildirim gönderirdi (Android 8+ HİÇ göstermez).
 * iOS'ta `content://` anlamsız → boş kayıt (her vakit sistem sesi).
 */
import { Platform } from 'react-native';
import { Logger } from '../../core/utils/Logger';
import { metin } from '../../core/dil/aktifDil';
import {
    benzersizVakitSesleri,
    cozulemeyenVakitSesleriniDusur,
    vakitBildirimKanalId,
    vakitKanalAdi,
    type VakitBildirimSesleri,
} from '../../core/bildirim/vakitBildirimSesi';

type Kopru = typeof import('../../../modules/expo-countdown-notification/src');


/**
 * Son uygulanan GC kümesi: küme değişmediyse native toplama ATLANIR (cihazın TÜM
 * kanallarını sıralar; bu yol açılış + konum yayması + 15 dk görevinde koşar).
 * `MuhafizKanalServisi.sonToplananKume` ikizi. Testler için sıfırlanabilir.
 */
let sonToplananKume: string | null = null;
export function vakitKanalGcOnbelleginiSifirla(): void {
    sonToplananKume = null;
}

export async function vakitKanallariniHazirla(sesler: VakitBildirimSesleri): Promise<VakitBildirimSesleri> {
    if (Platform.OS !== 'android') return {};
    // TEMBEL: köprü native olay yayıcısını yükler; bu servisi (dolaylı) yükleyen her
    // test köprüyü mock'lamak zorunda kalmasın (AGENTS.md `requireNativeModule` tuzağı).
    const { sesAdiAl, vakitKanaliniGarantile, vakitKanallariniTemizle } = require(
        '../../../modules/expo-countdown-notification/src'
    ) as Kopru;

    const cozulemeyen = new Set<string>();
    for (const s of benzersizVakitSesleri(sesler)) {
        try {
            const ad = await sesAdiAl(s.bildirimSesi);
            if (!ad) cozulemeyen.add(s.bildirimSesi);
        } catch {
            cozulemeyen.add(s.bildirimSesi);
        }
    }
    if (cozulemeyen.size > 0) {
        Logger.warn('VakitKanal', `${cozulemeyen.size} vakit sesi çözülemedi; varsayılan sese düşüldü`);
    }
    let dogrulanmis = cozulemeyenVakitSesleriniDusur(sesler, cozulemeyen);

    // Kanalı kurulamayan ses de varsayılana düşer (yoksa bildirim kanalsız kalırdı).
    const kurulamayan = new Set<string>();
    for (const s of benzersizVakitSesleri(dogrulanmis)) {
        try {
            const kuruldu = await vakitKanaliniGarantile(
                vakitBildirimKanalId(s.bildirimSesi),
                vakitKanalAdi(s),
                metin().bildirim.kanal.vakitAciklama,
                s.bildirimSesi
            );
            if (!kuruldu) kurulamayan.add(s.bildirimSesi);
        } catch (e) {
            Logger.error('VakitKanal', 'Kanal kurulamadı', e);
            kurulamayan.add(s.bildirimSesi);
        }
    }
    dogrulanmis = cozulemeyenVakitSesleriniDusur(dogrulanmis, kurulamayan);

    const korunacak = benzersizVakitSesleri(dogrulanmis).map((s) => vakitBildirimKanalId(s.bildirimSesi));
    const kume = [...korunacak].sort().join(',');
    if (kume !== sonToplananKume) {
        try {
            await vakitKanallariniTemizle(korunacak);
            sonToplananKume = kume;
        } catch (e) {
            Logger.warn('VakitKanal', 'Kanal çöp toplama başarısız', e);
        }
    }
    return dogrulanmis;
}
