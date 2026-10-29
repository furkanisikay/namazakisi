import type { Sozluk } from '../tr';

/**
 * Azərbaycan dilində vaxt adları Qafqaz Müsəlmanları İdarəsinin (QMİ, qafqazislam.com) təqvim
 * adlarıdır: Sübh · Günəş (uzun: Günəşin çıxması) · Zöhr · Əsr · Məğrib · İşa. QMİ cədvəlindəki ayrıca
 * "İmsak vaxtı" sətri Cəfəri ehtiyat saatıdır; tətbiqin imsak saatı sübhün girişidir, ona görə
 * `imsakVakti` = "Sübh". Məzhəb fərz edilmir (Azərbaycanda təqvimi istifadəçi seçir); "Məğrib"
 * mətnlərdə günəşin batmasına bağlanmır. `kucuk` cümlə içi biçimdir ("əsr namazı"); `buyuk` əllə
 * yazılır (i → İ, ı → I, ə → Ə). Terminlər: Qıldım / Qılındı, qəza, nafilə, qiblə, cümə, məkruh vaxt,
 * hesablama üsulu, Namaz Qoruyucusu (Prayer Guardian), seriya (streak), bərpa (toparlanma), müsafir
 * (seferîlik), Qəza dəftəri, Parametrlər (Ayarlar), bildiriş, məkan.
 */
export const vakit: Sozluk['vakit'] = {
  adlar: { imsak: 'Sübh', gunes: 'Günəş', ogle: 'Zöhr', ikindi: 'Əsr', aksam: 'Məğrib', yatsi: 'İşa' },
  buyuk: { imsak: 'SÜBH', gunes: 'GÜNƏŞ', ogle: 'ZÖHR', ikindi: 'ƏSR', aksam: 'MƏĞRİB', yatsi: 'İŞA' },
  kucuk: { imsak: 'sübh', gunes: 'günəş', ogle: 'zöhr', ikindi: 'əsr', aksam: 'məğrib', yatsi: 'işa' },
  imsakVakti: 'Sübh',
  cuma: 'Cümə',
  cumaKucuk: 'cümə',
  gunesDogusu: 'Günəşin çıxması',
  gunesDogusuKucuk: 'günəşin çıxması',
  durum: { kilindi: 'Qılındı', vaktiGeldi: 'Namaz vaxtıdır', girmedi: 'Hələ vaxtı deyil', gecti: 'Qılınmadı' },
  durumKucuk: { kilindi: 'qılındı', vaktiGeldi: 'namaz vaxtıdır', girmedi: 'hələ vaxtı deyil', gecti: 'qılınmadı' },
  /** "Qıldım" = istifadəçinin öz bəyanı (1-ci şəxs); status "Qılındı". */
  eylem: { kildim: 'Qıldım', kilindi: 'Qılındı' },
  kerahatVakti: 'Məkruh vaxt',
  isaretle: 'Qılındı kimi qeyd edin',
  geriAlEtiketi: '{durum}, geri almaq üçün toxunun',
  geriAlindi: 'Qeyd götürüldü',
};
