/**
 * Gök paneli hareket bağlamı: kaydırma başlayınca süren nabız/parıltı animasyonları
 * DURUR ve dinlenme hâline döner ("kaydırma sırasında hiç oynamasın"). Değer bir
 * sayaçtır; `IlerlemeSayfasi` her `onScrollBeginDrag`'da artırır. 0 = henüz durdurma yok.
 * Sağlayıcı yoksa (Seri sekmesi tek başına) 0 kalır ve davranış değişmez.
 */
import { createContext, useContext } from 'react';

export const GokHareketiBaglami = createContext(0);

export function useGokDurdurmaSayaci(): number {
  return useContext(GokHareketiBaglami);
}
