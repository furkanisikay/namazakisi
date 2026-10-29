import { cogul } from '../../tipler';
import type { Sozluk } from '../tr';

/**
 * İbadətə çağırış (cümə, məscid, təqvim, işa) "sən" + əmr; qeyd etmə/hesab "siz".
 * Başlıqda vaxt adı və müddət öndədir (ilk 16 simvol).
 */
export const bildirim: Sozluk['bildirim'] = {
  eylem: { kildim: '✅ Qıldım', kazayaEkle: 'Qəzaya əlavə et', inceleyin: 'Baxın' },
  kanal: {
    genel: 'Ümumi bildirişlər',
    muhafiz: 'Namaz Qoruyucusu',
    muhafizAciklama: 'Namaz vaxtı xatırlatmaları',
    acil: 'Təcili namaz xatırlatması',
    acilAciklama: 'Vaxt çıxmaq üzrədir - təcili xatırlatmalar',
    vakit: 'Vaxt bildirişləri',
    vakitAciklama: 'Vaxt daxil olduqda göndərilən xatırlatmalar',
    muhafizSes: 'Namaz Qoruyucusu · {ses}',
    acilSes: 'Təcili xatırlatma · {ses}',
    acilSesAciklama: 'Vaxt çıxmaq üzrədir — təcili xatırlatmalar',
    titresimli: '{kanal} · Vibrasiyalı',
    alarm: 'Namaz siqnalı',
    alarmSes: 'Namaz siqnalı · {ses}',
    uygulamaSesi: 'Tətbiqin səsi',
    seciliSes: 'Seçdiyiniz səs',
  },
  cuma: {
    baslik: 'Cümə · {sure} qaldı · namaz yaxınlaşır',
    govdeIlk: 'Zöhr vaxtına {sure} qaldı. Hazırlaş, məscidə yola düş.',
    govde: 'Zöhr vaxtına {sure} qaldı. Məscidə yola düş.',
  },
  camiye: {
    hazirlanBaslik: '{ad} · azana {dk} dəq · məscidə hazırlaş',
    hazirlanGovde: '{ad} namazına məsciddə çatmaq üçün hazırlaş, {sonra} dəq sonra yola düş — azana {dk} dəq.',
    yolaCikBaslik: '{ad} · azana {dk} dəq · məscidə yola düş',
    yolaCikGovde: '{ad} namazına məsciddə çatmaq üçün yola düş — azana {dk} dəq.',
  },
  takvim: {
    etkinlikTek: '“{ad}”',
    etkinlikCoklu: cogul({ one: 'Təqvimindəki {n} ardıcıl tədbir', other: 'Təqvimindəki {n} ardıcıl tədbir' }),
    etkinlikBir: 'Təqvimindəki bir tədbir',
    sonAnIkindi: 'əsr üçün son uyğun an {saat} (sonrası məkruhdur)',
    sonAnVakit: '{kucuk} vaxtının çıxışı {saat}',
    onceBaslik: '{ad} · tədbir {saat} · əvvəlcə qıl',
    onceGovde: '{etkinlik} {aralik} arası davam edir; {sonAn}. Tədbir başlamazdan əvvəl {kucuk} namazını qıl.',
    kaplarBaslik: '{ad} · tədbir vaxtı əhatə edir',
    kaplarGovde:
      '{etkinlik} {aralik} arası davam edir və {kucuk} vaxtını ({giris}–{son}) əhatə edir. Qısa fasilə verib {kucuk} namazını qılmağı indidən planla.',
  },
  yatis: {
    yatsiBaslik: '{ad} · yatmazdan əvvəl qıl 🌙',
    yatsiGovde: '{ad} vaxtı hələ davam edir; yuxuya getməzdən əvvəl namaza dur.',
    ozet: 'Bu gün {kilinan}/5 · {liste} qeyd olunmayıb',
    tekOto: 'Qılmısınızsa, qeyd edin. {oto}',
    tekKaza: 'Qılmısınızsa, qeyd edin; qıla bilməmisinizsə, qəza dəftərinizə əlavə edin.',
    tekSuruyor: 'Qılmısınızsa, qeyd edin. Vaxt hələ davam edir.',
    cokluOto: 'Qıldıqlarınızı qeyd etmək üçün tətbiqi açıb nəzərdən keçirin. {oto}',
    coklu: 'Qıldıqlarınızı qeyd etmək üçün tətbiqi açıb nəzərdən keçirin.',
    otoSor: 'Qeyd etməsəniz, bu gün barədə Qəza dəftərində sizdən soruşulacaq.',
    otoEkle: 'Qeyd etməsəniz, namaz günü bitdikdə qəzaya əlavə olunacaq.',
  },
  gunSonu: {
    baslik: 'Günü tamamlamadınız · seriya',
    govde: 'Qıldığınız namazları gün bitməmiş qeyd etsəniz, seriyanız davam edəcək.',
  },
};
