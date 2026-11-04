import type { Sozluk } from '../tr';

/**
 * Khmer Müslümanlarının kalıplarına yakın dualar (çeviri değil). "សូមអល់ឡោះទទួលយក" meal 2:127'nin
 * "សូមទ្រង់…ទទួលយក" kalıbından TÜRETİLDİ (kaynakta birebir görülmedi); "សូមព្រះជាម្ចាស់របស់យើងទទួលយក
 * ពីពួកយើង" doğrudan 2:127 kalıbıdır. Kadir gecesi adı HE km "ឡៃឡាទុលក៏ទើរ". Kandil ve hicrî yılbaşı
 * selamı yalnız Türkiye geleneğinde söylenir (`selam.ts > GELENEK_SELAMI_DILLERI`); buradaki karşılıklar
 * tip bütünlüğü içindir. Yerli okuyucu gözden geçirmedi.
 */
export const samimiyet: Sozluk['samimiyet'] = {
  kurulumBittiSelami: 'សូមឲ្យមានពរជ័យ។',
  kabulDualari: ['សូមអល់ឡោះទទួលយក', 'សូមព្រះជាម្ចាស់របស់យើងទទួលយកពីពួកយើង', 'សូមអល់ឡោះទទួលយក', 'សូមអល់ឡោះទទួលយកទង្វើល្អរបស់យើង'],
  kabulDuasi: 'សូមអល់ឡោះទទួលយក',
  ekSabah: 'សូមឲ្យព្រឹកនេះមានពរជ័យ',
  ekYatsi: 'សូមឲ្យយប់នេះមានពរជ័យ',
  tamGunAna: 'សូមអល់ឡោះទទួលយក',
  tamGunAlt: 'ថ្ងៃនេះអ្នកបានសឡាតគ្រប់ទាំងប្រាំពេល។',
  kazaKabul: 'បានដកសឡាតសងវិញ{vakit} 1 ពីបញ្ជី។ {dua}។',
  kandilGeceleri: {
    regaib: 'សូមឲ្យយប់រ៉ាហ្គាអ៊ីបមានពរជ័យ',
    mirac: 'សូមឲ្យយប់អ៊ីស្រ៉ក និងមីអ្រ៉ាជមានពរជ័យ',
    berat: 'សូមឲ្យយប់បារ៉ាអះមានពរជ័យ',
    mevlid: 'សូមឲ្យថ្ងៃម៉ាវលីទមានពរជ័យ',
  },
  selamlar: {
    sahur: 'សូមឲ្យសាហួរមានពរជ័យ',
    bayram: 'សូមឲ្យថ្ងៃបុណ្យមានពរជ័យ',
    iftar: 'សូមឲ្យការស្រាយបួសមានពរជ័យ',
    kadir: 'សូមឲ្យយប់ឡៃឡាទុលក៏ទើរមានពរជ័យ',
    arefe: 'សូមឲ្យថ្ងៃអារ៉ហ្វះមានពរជ័យ',
    hicriYilbasi: 'សូមឲ្យឆ្នាំថ្មីហ៊ីជ្រះមានពរជ័យ',
    cuma: 'សូមឲ្យថ្ងៃសុក្រមានពរជ័យ',
    ramazan: 'សូមឲ្យខែរ៉ម៉ាហ្ទនមានពរជ័យ',
    sabah: 'សូមឲ្យព្រឹកនេះមានពរជ័យ',
  },
};
