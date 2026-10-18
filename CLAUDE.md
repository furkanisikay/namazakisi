# CLAUDE.md — Namaz Akışı

> Proje kuralları, komutlar, mimari ve genel tuzaklar **[AGENTS.md](./AGENTS.md)**'dedir — tek doğru kaynak. Alan bilgisi `docs/ajan/` altındadır; AGENTS.md sonundaki konu dizininden dokunduğun alanın belgesini işe başlamadan oku.

@AGENTS.md

## Claude'a özel
- **Tek doğrulama kapısı:** bir işi bitirmeden önce `npm run verify` çalıştır ve geçir (typecheck + lint + test).
- **Bilgi tabanını güncel tut:** çalışırken öğrendiğin kalıcı bilgiyi (tekrar düşmemen gereken tuzak/çözüm, reçete, komut, kararın *nedeni*) kullanıcı istemeden, aynı commit içinde yaz. Her alanda geçerli kural → `AGENTS.md`; bir özelliğe/alana özgü bilgi → ilgili `docs/ajan/<konu>.md` (yoksa aç ve AGENTS.md konu dizinine ekle). Kural önce, gerekçe tek cümle; mevcut maddeyi güncelle ya da eskiyeni sil, şişirme; yalnız doğrulanmış bilgi; sır/token/kişisel veri yazma. AGENTS.md'de alan dosyalarını `@` ile içe aktarma (her oturumda yüklenir) — düz bağlantı kullan.
- Kullanıcıyla **daima Türkçe** konuş.
