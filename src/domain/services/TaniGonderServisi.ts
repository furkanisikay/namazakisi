import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system/next';
import { UYGULAMA } from '../../core/constants/UygulamaSabitleri';
import { Logger } from '../../core/utils/Logger';
import { taniRaporuOlustur } from './TaniRaporuServisi';

export async function taniEpostasiniAc(opts: {
  baglam?: string;
  konumDahil: boolean;
  neOldu?: string;
}): Promise<'gonderildi' | 'iptal' | 'paylasildi' | 'hata'> {
  try {
    const rapor = taniRaporuOlustur(opts);
    const dosya = new File(Paths.cache, `namaz-akisi-tani.txt`);
    try { dosya.create(); } catch { /* zaten varsa yoksay */ }
    dosya.write(rapor.logMetni);

    if (await MailComposer.isAvailableAsync()) {
      const sonuc = await MailComposer.composeAsync({
        recipients: [UYGULAMA.DESTEK_EPOSTA],
        subject: rapor.konu,
        body: rapor.govde,
        attachments: [dosya.uri],
      });
      // composeAsync status: sent | saved | cancelled | undetermined.
      // Android'de OS intent gönder/iptal'i bildirmez → sonuç neredeyse her zaman
      // 'undetermined'; bunu iptal saymak başarılı gönderimi yutar. Yalnız 'cancelled'
      // iptaldir; gerisi (sent/saved/undetermined) kullanıcının devam ettiği kabul edilir.
      return sonuc.status === 'cancelled' ? 'iptal' : 'gonderildi';
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dosya.uri, { mimeType: 'text/plain', dialogTitle: rapor.konu });
      return 'paylasildi';
    }
    Logger.error('TaniGonderServisi', 'Ne e-posta ne paylaşım kullanılabilir', {});
    return 'hata';
  } catch (error) {
    Logger.error('TaniGonderServisi', 'Tanı e-postası açılamadı', {
      hata: error instanceof Error ? error.message : 'bilinmeyen',
    });
    return 'hata';
  }
}
