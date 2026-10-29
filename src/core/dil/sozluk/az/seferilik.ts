import type { Sozluk } from '../tr';

/** Mənbə fətvalar türkcədir; etiket bunu deyir. Hökm forması yoxdur (məlumat ötürülür). */
export const seferilik: Sozluk['seferilik'] = {
  mezhepler: { hanefi: 'Hənəfi', safii: 'Şafii' },
  kaynaklar: {
    vatan: 'Müsafirlik baxımından əsl vətən, iqamət vətəni və müvəqqəti qalma yeri (türkcə)',
    cem: 'Namazlar cəm edilərək (birləşdirilərək) qılına bilərmi? (türkcə)',
    baslangic: 'Müsafirliyin başlanğıcı necə müəyyən edilir? (türkcə)',
    ziyaret: 'Valideynlərinin yaşadığı yerə gedən şəxs müsafir olurmu? (türkcə)',
  },
  bilgiNotu:
    'Bu hökm deyil, məlumatdır. Müsafir sayılıb-sayılmamağınız səfərinizin məqsədindən, müddətindən və niyyətinizdən asılıdır.',
  baslik: 'Deyəsən, səfərdəsiniz',
  mesafeSatiri: 'İqamət yerinizdən düz xətt üzrə təxminən {km} km uzaqdasınız. {mezhep} məzhəbinə görə Diyanetin çatdırdığı məlumatlar:',
  maddeler: {
    hanefi: [
      'Hənəfi məzhəbində səfər (müsafirlik) məsafəsi təxminən 90 km-dir. Getdiyi yerdə 15 gündən az qalmağa niyyət edən şəxs müsafir sayılır.',
      'Müsafir sayılan şəxs dörd rükətli fərz namazlarını iki rükət qılır (qəsr).',
      'Hənəfi məzhəbində iki namazı birləşdirmək (cəm) yalnız həcdə, Ərəfat və Müzdəlifədədir. Diyanet səfər kimi mühüm üzrlü hallarda digər məzhəblərin görüşü ilə əməl oluna biləcəyini də bildirir.',
    ],
    safii: [
      'Şafii məzhəbində də səfər məsafəsi təxminən 90 km-dir. Getdiyi yerdə gəliş və gediş günləri istisna olmaqla 4 gündən az qalınarsa, səfər hökmləri davam edir.',
      'Müsafir sayılan şəxs dörd rükətli fərz namazlarını iki rükət qılır (qəsr).',
      'Şafii məzhəbində səfər zöhrlə əsri, məğriblə işanı birləşdirmək (cəm) üçün keçərli üzrlərdən sayılır.',
    ],
  },
  ozetAcik: 'Açıq · {mezhep}',
  ozetKapali: 'Bağlı',
  baglantiAcilamadi: 'Keçid açılmadı. İnternet bağlantınızı yoxlayın.',
  ikametGuncellendi: 'İqamət yeriniz yeniləndi',
  ikametKaydedilemedi: 'İqamət yeriniz yadda saxlanılmadı',
  kartiKapatin: 'Səfər məlumat kartını bağlayın',
  burasiEvimErisim: 'Bura mənim evimdir, iqamət yerim kimi yadda saxlayın',
  burasiEvim: 'Bura evimdir',
  diyanetteOkuyunErisim: 'Diyanet fətvasını brauzerdə oxuyun',
  diyanetteOkuyun: 'Diyanet saytında oxuyun',
  sayfa: {
    kayitliKonum: 'Yadda saxlanmış məkan',
    henuzKaydedilmedi: 'Hələ yadda saxlanılmayıb — ilk məkanınız iqamət yeri sayılır',
    buradasiniz: 'Hazırda buradasınız',
    uzaktasiniz: 'Hazırda düz xətt üzrə təxminən {km} km uzaqdasınız',
    konumBilinmiyor: 'Məkanınız hələ məlum deyil; əvvəlcə məkan seçin',
    giris:
      'İqamət yerinizdən təxminən {km} km uzaqlaşdıqda ana ekranda Diyanetin fətvalarını xülasə edən qısa məlumat kartı görəcəksiniz. Kart hər səfərdə bir dəfə çıxır, bildiriş göndərmir.',
    bilgiKarti: 'Məlumat kartı',
    kartBaslik: 'Səfər məlumat kartı',
    gosterilir: 'Ana ekranda göstərilir',
    gosterilmez: 'Göstərilmir',
    mezhepNotu: 'Kartın məzmunu məzhəbinizə görədir; məzhəbi Parametrlər › Namaz vaxtları bölməsindən seçə bilərsiniz.',
    ikametYeri: 'İqamət yeri',
    ikametYapErisim: 'Hazırkı məkanınızı iqamət yeri kimi yadda saxlayın',
    ikametYap: 'Hazırkı məkanı iqamət yeri edin',
    kaynaklar: 'Mənbələr (Diyanet Din İşləri Ali Şurası)',
    kaynakErisim: '{etiket}. Brauzerdə açılır',
    /** Türkiyəyə xas xidmət: yalnız türkcə interfeysdə göstərilir. */
    fetvaHatti: 'Suallarınız üçün Diyanetin 190 fətva xəttinə zəng edə bilərsiniz.',
  },
};
