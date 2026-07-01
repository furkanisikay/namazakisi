---
name: buffer-sosyal-icerik
description: Namaz Akışı'nda bir özellik/güncelleme/duyuru için marka diline uygun sosyal medya görselleri üretir (Adobe HTML→PNG), kanal başına (X/LinkedIn/Instagram) kısa ve profesyonel metinler yazar, Buffer'da taslak veya doğrudan paylaşım oluşturur. Kullanıcı "sosyal medyada duyur", "buffer'a ekle", "bunu paylaş", "sosyal medya görseli yap" gibi bir istekte bulunduğunda kullan.
---

# Buffer Sosyal İçerik Skill'i

Namaz Akışı'nda yeni bir özellik/güncelleme çıktığında **görsel üretiminden Buffer'da yayına kadar** uçtan uca akışı yürütür. 2026-07'de Takvim Entegrasyonu duyurusunda kurulup doğrulanmış bir reçetedir — buradaki adımların DIŞINA çıkma, yeni bir yöntem "icat etmeye" çalışma.

## Ne zaman kullanılır
Kullanıcı bir özelliği/güncellemeyi sosyal medyada duyurmak istediğinde (X/Twitter, LinkedIn, Instagram — Buffer'a bağlı kanallar). Ekran görüntüsü verilmişse veya repo'da yakın zamanda eklenmiş bir özellik varsa onu esas al.

## Akış

### 1. İçeriği topla
- Kullanıcı ekran görüntüsü verdiyse `Read` ile incele.
- Duyurulacak özelliği repoda tara (Explore agent veya Grep): ilgili servis/ekran dosyaları, `src/core/constants/YeniOzellikler.ts` içindeki "yeni özellik" kaydı (başlık/açıklama zaten kibar "siz" dilinde hazır olabilir — doğrudan kopya kaynağı olarak kullan), varsa README.
- UI metinlerini (buton adları, ayar başlıkları) not al — görseldeki mini-mockup'ta ve metinlerde otantiklik için kullanılacak.

### 2. Marka görsel dili (sabit — her seferinde yeniden keşfetme)
- Renkler: `src/core/theme/temalar.ts` → varsayılan/ilk palet **Zümrüt**: birincil `#4CAF50`, koyu `#388E3C`, açık `#C8E6C9`, vurgu `#00BFA5`. Kullanıcı başka bir palet istemedikçe bunu kullan.
- Logo: `assets/icon.png` (yeşil zeminde alev+hilal+geometrik motif). Küçük rozet olarak kullanılacaksa `border-radius` + `overflow:hidden` + `transform:scale(~1.5)` ile beyaz boşluğu kırp.
- Ton: sade, şık, kurumsal, bol boşluklu, tek bir "imza öğesi" (ör. gerçek uygulama ekranını yansıtan mini mockup illüstrasyonu) — geri kalanı sakin tut. Asla "AI-üretimi" hissi verme.
- Tipografi (bu oturumda seçilip doğrulandı, tekrar aynısını iste): başlık **Omnes Pro** (`OmnesSemiBold`/`Omnes-Bold`/`OmnesBlack`), gövde/etiket **InterFace** (`InterFace-Regular`/`Medium`/`SemiBold`). Farklı bir bağlamda `font_recommend` ile yeniden seçilebilir ama sonucu bu ikisiyle karşılaştır.

### 3. Görselleri üret (Adobe for Creativity — HTML→PNG)
1. `mcp__Adobe_for_creativity__adobe_mandatory_init` çağır.
2. `mcp__Adobe_for_creativity__create_visual_design_express_skill` çağır — playbook'u getirir, sıkı takip et (fixed-canvas HTML kuralları, meta etiketler, birim kuralları).
3. Teslim şeklini **AskUserQuestion** ile sor (net değilse): PNG mi, Adobe Express dokümanı mı, ikisi mi + şablon mu net-yeni tasarım mı. Bu skill genelde **PNG** yoluna gider (aşağıdaki adım 4-5), Express dokümanı istenirse playbook'un `export_html_to_express` + `html_export_readiness_skill` adımlarını izle.
4. Tipografi: `font_recommend` → `find_fonts` (PostScript adlarını doğrula) → `get_fontkit_embed_url` (CSS embed snippet).
5. Kanal başına HTML dosyası yaz (`/tmp/.../scratchpad/` altına, self-contained, `<head>`'de font embed):
   - Instagram kare: **1080×1080**
   - LinkedIn: **1200×627**
   - X/Twitter: **1200×675**
   - Marka logosunu `file:///home/user/namazakisi/assets/icon.png` ile yerelden referansla (base64'e çevirip context'i şişirme).
6. HTML'i PNG'ye çevir — **Playwright bu ortamda global kurulu, `node_modules` içinde DEĞİL**:
   ```bash
   NODE_PATH=/opt/node22/lib/node_modules node shot.js input.html output.png .post <width> <height>
   ```
   `shot.js`: `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })` → `page.goto('file://'+path)` → `el.screenshot()`. Render sonrası **mutlaka `Read` ile görseli aç ve gözden geçir** (çakışan öğe, taşan metin, kırpılan köşe var mı) — ilk seferde tam doğru çıkmayabilir, zoom-crop ile (`clip` parametresi) şüpheli bölgeleri kontrol et.

### 4. Kanal başına metin yaz
- Kısa tut, uzun paragraf yazma. Kibar "siz" dili, aktif fiil.
- **X/Twitter**: en kısa, 1 emoji + tek cümle + link. 280 karakteri kontrol et.
- **LinkedIn**: kurumsal ama sıcak, 2-3 kısa paragraf, kullanıcı "biz" değil "ben" tonunu tercih ederse (kişisel profilse) buna uy, 1-2 hashtag.
- **Instagram**: samimi-profesyonel, emoji serbest, 4-6 alakalı hashtag.
- **Uygulama linkini ekle**: Play Store — `https://play.google.com/store/apps/details?id=com.furkanisikay.namazakisi` (paket adı `app.json > android.package`'den doğrulanabilir). Kullanıcı ayrıca repo linki isterse `https://github.com/furkanisikay/namazakisi`.
- Kullanıcı bir gönderiyi Buffer arayüzünden elle düzenlediyse (ör. "ekledik"→"ekledim" gibi) o metni SIFIRLAMA, üzerine yalnız istenen eklemeyi yap.

### 5. Buffer'a yükle — KRİTİK GOTCHA: görsel barındırma
`mcp__Buffer_Remote_MCP__create_post` / `edit_post` görsel için **herkese açık, hem GET hem HEAD destekleyen** bir URL ister.

- **Adobe'nin `asset_finalize_file_upload` → `presignedAssetUrl`'i KULLANMA (kalıcı çözüm için)**: bu link yalnızca **GET** için imzalı; Buffer'ın "Hemen Yayınla" / Instagram doğrulaması **HEAD** isteği atıyor → `403`/`404` ile başarısız oluyor (taslağa kaydederken çalışır çünkü o an GET yapılır, ama gerçek yayınlama anında tekrar doğrulanır ve patlar — bu yüzden "taslaktan hemen yayınla çalışmıyor" şikayeti çıkar). Ayrıca `X-Amz-Expires` ile birkaç saatte de dolar.
- **Doğru yol**: PNG'leri repoya geçici olarak commit'le (`marketing/social/<tarih>-<konu>/`), aktif dala push'la (branch talimatına göre — farklı dala push YAPMA), oluşan `https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path>` URL'ini kullan. Bu hem GET hem HEAD destekler ve kalıcıdır. `curl -I` ile göndermeden önce doğrula.
- Akış: `get_account` → `list_channels` (org'u kullanıcıya isimle söyle) → her kanal için `create_post` (`saveToDraft:true` varsayılan, kullanıcı "hemen paylaş" dediyse `mode:"shareNow", saveToDraft:false`).
- Instagram, `type`+`shouldShareToFeed` + görsel zorunlu kılar; metadata: `{"instagram":{"type":"post","shouldShareToFeed":true}}`.
- **Idea'lar düzenlenemez/silinemez** (Buffer GraphQL şemasında `updateIdea`/`deleteIdea` yok — `introspect_schema` ile doğrulandı). Mümkünse doğrudan `create_post` (taslak) kullan; yalnızca görsel/metin kısıtı gerçekten engelliyorsa `create_idea`'ya düş ve kullanıcıya "eski idea'yı elle silmeniz gerekiyor" diye söyle.
- Yayın sonrası `get_post` ile `status`/`sentAt`/`externalLink` doğrula; `status:"error"` ise `error.message`'ı oku (çoğunlukla yukarıdaki görsel-erişim sorunu).

### 6. Temizlik — repoyu kirletme
Buffer gönderileri `sent` (veya en azından görseli başarıyla `draft` içine çektiyse) olduktan sonra **adım 5'te repoya eklenen PNG'leri SİL** (`git rm`, commit, push). Bu klasör yalnızca geçici barındırma amaçlıdır, kalıcı bir marketing arşivi DEĞİL. Aynı dalda açık bir PR varsa description'ı güncelle; net diff sıfırsa PR'ı kapatabilirsin (merge etme).

## Alternatif: Canva
Connector'da Canva da var ama bu akış için daha fazla adım/sürtünme gerektiriyor (şablon arama, oturum, dışa aktarma). **Varsayılan olarak kullanma** — yalnızca kullanıcı özellikle Canva isterse veya Adobe bağlantısı kullanılamıyorsa (`get_account_type` → `guest`/`noauth`) yedek olarak değerlendir.

## Doğrulama notu
Bu iş akışı `src/` kodunu değiştirmez → `npm run verify` GEREKMEZ. Yalnızca gerçek kod değişikliği yaptıysan (ör. `YeniOzellikler.ts`'ye yeni kayıt eklemek gibi ayrı bir istekse) proje kapısı geçerli olur.
