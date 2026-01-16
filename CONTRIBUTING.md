# Katki Rehberi

Namaz Akisi React Native projesine katki yaptiginiz icin tesekkurler! 🎉

## 🚀 Nasil Katki Yapabilirim?

### Hata Bildirimi

1. Onceki [Issues](https://github.com/furkanisikay/NamazAkisiRN/issues) kontrol edin
2. Yeni bir issue acin ve su bilgileri ekleyin:
   - Hata aciklamasi
   - Tekrar etme adimlari
   - Beklenen davranis
   - Ekran goruntuleri (varsa)
   - Cihaz ve OS bilgisi

### Ozellik Istegi

1. [Discussions](https://github.com/furkanisikay/NamazAkisiRN/discussions) bolumunde tartismaya acin
2. Ozelligin neden gerekli oldugunu aciklayin
3. Topluluk geri bildirimi bekleyin

### Kod Katkisi

1. Repoyu fork'layin
2. Feature branch olusturun:
   ```bash
   git checkout -b feature/ozellik-adi
   ```
3. Degisikliklerinizi yapin
4. Commit mesajlarinda [Conventional Commits](https://www.conventionalcommits.org/) kullanin:
   ```bash
   git commit -m "feat: yeni ozellik eklendi"
   git commit -m "fix: hata duzeltildi"
   git commit -m "docs: dokumantasyon guncellendi"
   ```
5. Pull Request acin

## 📝 Kod Standartlari

### TypeScript

- Tip guvenligini koruyun
- `any` kullanmaktan kacinin
- Interface'leri tercih edin

### Isimlendirme

- Degiskenler ve fonksiyonlar: Turkce, camelCase
- Componentler: PascalCase
- Dosyalar: PascalCase (componentler), camelCase (diger)

```typescript
// Dogru
const namazListesi = [];
function namazlariGetir() {}
const NamazKarti: React.FC = () => {};

// Yanlis
const prayer_list = [];
function getPrayers() {}
```

### Yorumlar

- Turkce yorumlar kullanin
- XML dokumantasyonu ekleyin:

```typescript
/**
 * Namaz durumunu degistirir
 * @param namazAdi - Degistirilecek namaz
 * @param tamamlandi - Yeni durum
 */
function namazDurumunuDegistir(namazAdi: string, tamamlandi: boolean) {}
```

### Dosya Yapisi

```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {}

// 3. Constants
const SABIT = 'deger';

// 4. Component
export const Komponent: React.FC<Props> = () => {};

// 5. Styles
const styles = StyleSheet.create({});
```

## 🧪 Test

```bash
# Testleri calistir
npm test

# TypeScript kontrolu
npx tsc --noEmit

# Lint kontrolu
npm run lint
```

## 📦 Build

```bash
# Gelistirme
npx expo start

# Android APK
eas build --platform android --profile preview

# iOS Simulator
eas build --platform ios --profile preview
```

## 🏗 Mimari

Proje Clean Architecture prensiplerini takip eder:

```
Domain <- Data <- Presentation
```

- **Domain**: Is mantigi, entity'ler
- **Data**: Veri kaynaklari, repository implementasyonlari
- **Presentation**: UI, state yonetimi

## 📞 Sorulariniz mi Var?

- GitHub Issues: Teknik sorular icin
- Discussions: Genel tartismalar icin

Tesekkurler! 🙏

