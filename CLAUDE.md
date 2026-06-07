# CLAUDE.md — Namaz Akışı

> Tüm proje kuralları, komutlar, mimari, gotcha'lar ve sınırlar **[AGENTS.md](./AGENTS.md)**'dedir — tek doğru kaynak. Aşağıdaki içe aktarma onu bu bağlama yükler.

@AGENTS.md

## Claude'a özel
- **Tek doğrulama kapısı:** Bir işi bitirmeden önce `npm run verify` çalıştır ve geçir (typecheck + lint + test).
- **Bilgi tabanını güncel tut:** Çalışırken öğrendiğin kalıcı bilgiyi (tekrar düşmemen gereken tuzak/çözüm, yeni reçete, komut, konvansiyon, kararın *nedeni*) proaktif olarak — kullanıcı istemeden — **`AGENTS.md`**'ye ekle, aynı commit içinde. Kurallar: kısa ve eyleme dönük yaz; mevcut bölüme ekle, yenisini ancak gerekiyorsa aç; sır/token/kişisel veri YAZMA; spekülasyon değil yalnızca doğrulanmış bilgi; dosyayı şişirme (eskiyen maddeyi güncelle/sil).
- Kullanıcıyla **daima Türkçe** konuş.
