import type { Sozluk } from '../tr';

/** Vakit girdi bildirimi: ibadete çağrı → "تو" + emir. */
export const icerik: Sozluk['icerik'] = {
  ayetKunyesi: 'قرآن {ref} · {yayimci}، QuranEnc {surum}',
  vakitGirdi: {
    uykudan: 'نماز از خواب بهتر است. به سوی رستگاری بشتاب.',
    araVer: 'کمی از کارهای دنیا دست بکش و در پیشگاه پروردگارت بایست.',
    yorgunluk: 'نماز عصر منتظر توست تا خستگی روز را بزدایی و آرامش بیابی.',
    sukur: 'نماز مغرب شکر روز است. برای ایستادن در پیشگاه پروردگارت بشتاب.',
    aksamKisa: 'وقت مغرب کوتاه است؛ وقتش رسید، بی‌درنگ بخوان.',
    geceKaranligi: 'در تاریکی شب با پروردگارت خلوت کن. نماز عشا داروی جان است.',
    davet: 'برای پایان دادن روز با خشنودی الله، به نماز عشا دعوت شده‌ای.',
  },
};
