# Katkı Rehberi

Namaz Akışı React Native projesine katkı yaptığınız için teşekkürler! 🎉

## 🚀 Nasıl Katkı Yapabilirim?

### Hata Bildirimi

1. Önceki [Issues](https://github.com/furkanisikay/NamazAkisiRN/issues) bölümünü kontrol edin.
2. Yeni bir issue açın ve şu bilgileri ekleyin:
   - Hata açıklaması
   - Tekrar etme adımları
   - Beklenen davranış
   - Ekran görüntüleri (varsa)
   - Cihaz ve OS bilgisi

### Özellik İsteği

1. [Discussions](https://github.com/furkanisikay/NamazAkisiRN/discussions) bölümünde tartışmaya açın.
2. Özelliğin neden gerekli olduğunu açıklayın.
3. Topluluk geri bildirimi bekleyin.

### Kod Katkısı

1. Repoyu fork'layın.
2. Feature branch oluşturun:
   ```bash
   git checkout -b feature/ozellik-adi
   ```
3. Değişikliklerinizi yapın.
4. Commit mesajlarında [Conventional Commits](https://www.conventionalcommits.org/) kullanın:
   ```bash
   git commit -m "feat: yeni özellik eklendi"
   git commit -m "fix: hata düzeltildi"
   git commit -m "docs: dokümantasyon güncellendi"
   ```
5. Pull Request açın.

## ⚖️ Katkı Lisansı

Bu projeye katkı gönderdiğinizde şunları kabul etmiş olursunuz:

- Katkınız **GNU GPL sürüm 3 veya sonrası** ile lisanslanır.
- [LICENSE](LICENSE) dosyasındaki **GPLv3 §7 ek izni** katkınız için de geçerlidir — yani katkınızı içeren uygulama, App Store ve Google Play gibi dağıtım platformları üzerinden yayınlanabilir.

İkinci madde teknik bir zorunluluktur: Apple ve Google'ın hizmet şartları GPLv3'ün 10. bölümüyle çelişir; ek izin olmadan projenin tamamı mağazalarda dağıtılamaz hâle gelir. Katkınızın telif hakkı **size aittir**, devretmiş olmazsınız.

## 📝 Kod Standartları

### TypeScript

- Tip güvenliğini koruyun.
- `any` kullanmaktan kaçının.
- Interface'leri tercih edin.

### İsimlendirme

- Değişkenler ve fonksiyonlar: Türkçe, camelCase
- Componentler: PascalCase
- Dosyalar: PascalCase (componentler), camelCase (diğer)

```typescript
// Doğru
const namazListesi = [];
function namazlariGetir() {}
const NamazKarti: React.FC = () => {};

// Yanlış
const prayer_list = [];
function getPrayers() {}
```

### Yorumlar

- Türkçe yorumlar kullanın.
- XML dokümantasyonu ekleyin:

```typescript
/**
 * Namaz durumunu değiştirir
 * @param namazAdi - Değiştirilecek namaz
 * @param tamamlandi - Yeni durum
 */
function namazDurumunuDegistir(namazAdi: string, tamamlandi: boolean) {}
```

### Dosya Yapısı

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
# Testleri çalıştır
npm test

# TypeScript kontrolü
npx tsc --noEmit

# Lint kontrolü
npm run lint
```

## 📦 Build

```bash
# Geliştirme
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

- **Domain**: İş mantığı, entity'ler
- **Data**: Veri kaynakları, repository implementasyonları
- **Presentation**: UI, state yönetimi

## 📞 Sorularınız mı Var?

- GitHub Issues: Teknik sorular için
- Discussions: Genel tartışmalar için

Teşekkürler! 🙏
