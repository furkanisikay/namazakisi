/**
 * Tablet ana-ayrıntı düzeninde sağda açık ayrıntının KÖK rotası — liste satırı seçili
 * görünsün diye (`AnaAyrintiDuzeni` sağlar). Telefonda ve dar pencerede `null`: liste
 * tam ekrandır, seçili satır yoktur.
 *
 * Ayrı ve bağımlılıksız dosyadır: listeyi çizen ekranlar (Ayarlar) bunu okurken
 * düzen bileşeninin ikon/güvenli alan bağımlılıklarını testlerine taşımasın.
 */
import * as React from 'react';

export const AnaAyrintiSecimi = React.createContext<string | null>(null);

export const useAnaAyrintiSecimi = (): string | null => React.useContext(AnaAyrintiSecimi);
