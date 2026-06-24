# CI/CD Güçlendirme — Tasarım

> Tarih: 2026-06-24 · Durum: onaylandı (brainstorming) · Sonraki: implementasyon planı

## 1. Amaç ve bağlam

Mevcut CI/CD sağlam bir temele sahip (3 workflow: `ci.yml` quality+test+summary+auto-release, `android-build.yml` Gradle APK+GitHub Release reusable, `expo-build.yml` EAS→Play Store; dependabot; least-priv permissions; concurrency; npm cache) ama dört kritik boşluk var (bu oturumda yaşananlar dahil):
- **master'da branch protection YOK** → "kırmızı master" (npm-parite/cosmiconfig merge'i CI kırıkken indi) ve yanlış merge mümkün.
- **Güvenlik taraması YOK** (SAST/secret/dependency-review).
- **Coverage eşiği YOK** → sessiz erozyon.
- Workflow'lar senior-DevOps standardına çekilmeli (action SHA-pinning, tekrar azaltma, zengin run-summary, standardizasyon).

**Kritik kısıt:** `auto-release` master'a **doğrudan** `git push` eder (android-build.yml: `github-actions[bot]` + `secrets.GITHUB_TOKEN`, release commit'i `[skip ci]`). Her koruma tasarımı bu push'u kırmamalı → release-bot **bypass** zorunlu.

## 2. Hedefler / Hedef olmayanlar
**Hedefler:** Kırmızı master'ı kökten engelle · güvenlik taraması ekle · coverage erozyonunu durdur · workflow'ları bakımı kolay, gözlemlenebilir, tedarik-zinciri-güvenli hâle getir · **EAS kota bağımlılığını kaldır** (Gradle AAB + Play API ile self-yeterli release; bugünkü "EAS bitik" durumu Play'e çıkışı tamamen engelledi) — auto-release akışını bozmadan.
**Hedef olmayanlar (YAGNI):** prod runtime hata-izleme (Sentry; ayrı araştırma) · `develop` dalına protection (kullanımda değilse) · yeni build matrisi/platform.

## 3. Tasarım — 4 bileşen

### A) Koruma — master ruleset (DENGELİ)
GitHub **ruleset** (modern; `gh api`/Settings ile) master'a:
- **Zorunlu status check:** `🔍 Kod Kalitesi` ve `🧪 Testler` (tam check adları) — PR'lar bunlar geçmeden merge edilemez.
- **Require a pull request** (zorunlu onay sayısı **0** — solo), **linear history**, force-push ve dal-silme engeli.
- **Bypass listesi:** **(1) Repository admin (kullanıcı)** — hotfix için; **(2) release-bot.** Release-bot bypass yaklaşımı: önce ruleset bypass'ına GitHub Actions bot eklenir (rulesets bypass aktör listesi destekliyorsa); desteklemiyorsa **fallback:** `auto-release`/`android-build.yml` push'u ince-yetkili bir **`RELEASE_TOKEN`** PAT'a çevrilir (checkout `token:` + push) ve o kimlik bypass'a eklenir. Implementasyonda hangisinin geçerli olduğu doğrulanır; **bypass olmadan koruma açılmaz** (release zincirini kırar).
- Uygulama: `gh api --method PUT repos/.../rulesets` (veya branch protection API) — versiyonlanması için ruleset JSON'u repoda `.github/` altında referans olarak da tutulur (kaynak-kontrollü kayıt).

### B) Güvenlik taraması
- **CodeQL** (`.github/workflows/codeql.yml`): JS/TS, PR + push(master) + haftalık schedule; `security-events: write`, diğer izinler salt-okunur.
- **dependency-review** (`.github/workflows/dependency-review.yml` veya ci.yml'e job): PR'da yeni bağımlılıkların bilinen açığı/uyumsuz lisansı varsa **fail**. (Public repo → dependency graph ücretsiz.)
- **Secret scanning + push protection:** repo güvenlik ayarı (`gh api`/Settings ile aç) — gitleaks gerekmez (GitHub'ınki public repoda kapsıyor).

### C) Kalite kapıları
- **Jest `coverageThreshold`** (`jest.config.js`): mevcut coverage ölçülüp **biraz altına "ratchet"** edilir (global lines/statements/functions/branches) — erozyonu durdurur, mevcut suite'i bloklamaz. CI'da `npm test -- --coverage` ile zorlanır (verify/test job'u coverage ile koşar).
- **Run-summary'ye coverage + test sayısı:** test job'u toplam/geçen test + coverage %'sini `$GITHUB_STEP_SUMMARY`'ye yazar.

### D) Workflow refactor (yapı + özetler)
- **Action SHA-pinning:** tüm 3. taraf action'lar (checkout, setup-node, action-gh-release, EAS actions vb.) tam SHA'ya pinlenir (`# vX.Y.Z` yorumlu); dependabot zaten günceller.
- **Composite "setup" action** (`.github/actions/kurulum/action.yml`): checkout + setup-node(cache:npm) + `npm ci` tekrarını quality+test (ve gerekirse build) job'larında tekille.
- **Zengin `$GITHUB_STEP_SUMMARY`:** test sayıları + coverage% (C), release sürüm/changelog (android-build), güvenlik bulgu özeti (CodeQL/dependency-review), tutarlı tablo formatı. Mevcut `ci-summary` job korunur/genişletilir.
- **Standardizasyon:** başlık doküman blokları tek şablon; build workflow'larına `concurrency`; her job'da explicit `timeout-minutes` + en dar `permissions`.
- **Release-push robustluğu (yaşanmış olay, 2026-06-24):** `auto-release`/`android-build.yml`'in "Commit ve Tag" adımı `git push origin HEAD:master`'ı `pull --rebase` yapmadan çalıştırıyor → master'a araya kaçan *herhangi* bir push (docs dahil) release'i `non-fast-forward` ile **kırıyor** (v0.23.13 release'i bu yüzden başarısız oldu — native build başarılıydı). Düzeltme: push'tan önce `git pull --rebase origin master` + sınırlı **retry** (rebase→push döngüsü, 2-3 deneme). Bu, A'daki ruleset linear-history kuralıyla da uyumlu olmalı (bot push'u hâlâ fast-forward).

### E) Build çıktıları + EAS-bağımsız AAB (Gradle → Play)
Bugünkü olay (EAS kota bitik → Play'e hiç AAB çıkamadı) bunu tetikledi. Hedef: release self-yeterli olsun.

**Geçmiş koşu kanıtı (2026-06-24 ölçümü):** `bundleRelease` committed workflow'a **hiç girmemiş** → AAB her zaman EAS'tı. EAS süreleri: tipik **~18dk**, bir kez **65dk** (ücretsiz kuyruk spike), son koşular **FAIL** (kota). Gradle APK: build ~21.5dk, tam koşu ~27dk. **Bugünkü tam release ~45dk** (Gradle APK+Release ~27dk → sıralı EAS AAB→Play ~18dk). → E doğru yapılırsa (tek derleme, EAS leg yok) **~30dk**, yani bugünden **hızlı** ve EAS-bağımsız. **"Çok yavaş" kök nedeni KESİN: EAS bulut kuyruğu** — exhaustive tarama (tüm dallar, tüm tarihçe, silinmiş dosyalar, `--local`, fastlane/supply) Gradle/local AAB'nin **hiç denenmediğini** doğruladı; AAB her zaman `eas build --platform android` (bulut) idi. İleriye dönük tuzak (kaçınılacak): AAB'yi ayrı 2. Gradle build'i yapmak = ~2× süre — **yasak**, tek çağrıdan üret.
- **Gradle AAB — PERFORMANS KRİTİK (yaşanmış: AAB'yi ayrı build yapmak süreyi ~ikiye katlıyordu):** mevcut `assembleRelease` (APK) tek başına **~21.5 dk** (süre = tek ağır native derleme; Gradle caching/parallel/config-cache/Xmx4g zaten açık). AAB'yi **ikinci ayrı build olarak ÜRETME.** Çözüm: APK+AAB'yi **TEK Gradle çağrısından** çıkar → `./gradlew assembleRelease bundleRelease` (paylaşılan derleme/JS-bundle/resource-merge **bir kez**; AAB yalnız kendi paketleme adımını ekler, tahmini **+2-5 dk**). APK bugünküyle birebir kalır. *Alternatif (daha yalın): sadece `bundleRelease` + `bundletool build-apks --mode=universal` ile AAB'den imzalı universal APK çıkar (saniyeler) → tek derleme, iki çıktı, ~bugünkü süre.* Gerçek delta implementasyonda **ölçülür**; kabul kriteri: release süresi bugünkünün **belirgin üstüne çıkmamalı**.
- **Ortak yayın (ayrı yer):** APK + AAB **ikisi de GitHub Release asset'i** (sürüm-versiyonlu tek indirilebilir yer; `NamazAkisi-vX.Y.Z.apk` / `.aab`) + kısa-retention **workflow artifact**. APK = sideload/test, AAB = Play.
- **Otomatik Play upload:** Gradle AAB, **Play Developer API** ile internal track'e yüklenir (`r0adkll/upload-google-play` veya fastlane supply); yeni secret **`PLAY_SERVICE_ACCOUNT_JSON`**. GitHub Release yayınından SONRA (mevcut sıra kuralıyla uyumlu).
- **EAS ilişkisi (mimari karar):** Gradle+PlayAPI **birincil otomatik Play-upload** olur; **EAS auto-leg'i (`expo-build.yml` çağrısı) auto-release zincirinden ÇIKARILIR** → aynı sürümün çift-upload çakışması önlenir + EAS kota bağımlılığı tümden kalkar. `expo-build.yml` **manuel `workflow_dispatch` için korunur** (yedek/deneme), zincirden kaldırılır.
- **⚠️ İmza paritesi (zorunlu kapı):** AAB, Play'in beklediği **upload key** ile imzalanmalı. APK zaten `release.keystore` ile imzalı; bu anahtarın Play'in upload/app-signing anahtarı olduğu **Play Console'dan DOĞRULANMADAN** otomatik upload AÇILMAZ (yanlış anahtar = Play reddi). EAS başka bir managed key kullanıyorduysa migrasyon gerekebilir.
- **Ön koşullar (kullanıcı eylemi):** GCP service account oluştur → Play Developer API + Play Console'a bağla → "internal track'e yayın" izni ver → JSON'u `PLAY_SERVICE_ACCOUNT_JSON` secret'ı olarak ekle. Bu adımlar olmadan E etkinleşemez.

## 4. Faz sırası (tek spec, fazlı uygulama)
1. **Faz 1 — A + C:** coverageThreshold + run-summary coverage; sonra master ruleset (release-bot bypass doğrulanarak). En yüksek kaldıraç. *Sıra önemli: ruleset'i açmadan önce quality+test check adlarının kararlı olduğundan emin ol.*
2. **Faz 2 — E (build çıktıları, zamanlı: EAS bitik):** **E1** — Gradle `bundleRelease` AAB üret + APK & AAB'yi GitHub Release'e + artifact'e ekle (ön koşulsuz; hemen shippable AAB sağlar). **E2** — Play Developer API auto-upload + EAS auto-leg'i zincirden çıkar (**ön koşullar:** `PLAY_SERVICE_ACCOUNT_JSON` secret'ı + imza paritesi Play Console'dan doğrulanmış olmalı; aksi halde E2 beklemede kalır, E1 yine de değerli).
3. **Faz 3 — B:** CodeQL + dependency-review workflow'ları + secret scanning/push protection ayarı. (Yeni check'ler kararlı çalıştıktan sonra istenirse ruleset'e zorunlu check olarak eklenir.)
4. **Faz 4 — D:** SHA-pinning + composite setup + zengin summary + standardizasyon + **release-push rebase&retry hardening**. *(Release-push hardening zamanlıysa Faz 1'e çekilebilir — bugünkü kırılmayı tekrarlatmaz.)*

## 5. Doğrulama / kabul kriterleri
- Branch protection: check'siz/CI-kırık bir PR **merge edilemez**; release-bot push'u **çalışır** (bir release başarıyla kesilir).
- Güvenlik: CodeQL PR'da çalışır; bilinen-açıklı bir test bağımlılığı dependency-review'ı **fail** ettirir (manuel doğrulama).
- Kalite: coverage eşiği altına düşen bir değişiklik testi **fail** eder.
- Workflow'lar: `actionlint` (veya gh) ile geçerli; mevcut `npm run verify` ve release akışı bozulmaz; her job'da timeout+permissions.
- Hiçbir faz auto-release'i (master direct push) kırmaz.
- Release-push robustluğu: build sürerken master'a araya bir commit kaçsa bile release push'u (rebase+retry ile) **başarılı** olur.
- Build çıktıları: her release'de **APK + AAB** GitHub Release'e eklenir; AAB imzalı ve (E2 etkinse) Play internal track'e **otomatik yüklenir** (test cihazında/internal track'te doğrulanır). EAS bitikken bile Play'e çıkış **mümkün**.
- **Build süresi:** APK+AAB **tek native derlemeden** üretilir; release toplam süresi bugünkü (~21-24 dk) seviyenin **belirgin üstüne çıkmaz** (AAB ikinci tam build OLARAK üretilmez). CI step-timing ile doğrulanır.

## 6. Sınırlar / riskler
- **Ruleset bypass** repo planına/araçlarına bağlı; bypass kurulamazsa "Hafif" moda (sadece zorunlu check, require-PR yok) düşülür — yine de auto-release korunur. Bu, implementasyonda doğrulanacak ilk şey.
- `.github/workflows` ve repo güvenlik ayarı değişiklikleri AGENTS.md "⚠️ önce sor" kapsamında — kullanıcı onayı alındı.
- CI/CD değişiklikleri canlı pipeline'ı etkiler; her faz küçük PR'la, release penceresine dikkat ederek (master'a her merge ~24dk release keser) indirilir.
- **E2 imza paritesi:** Gradle AAB, Play'in upload key'iyle imzalanmazsa Play **reddeder**; EAS managed key kullanıyorduysa migrasyon/anahtar-eşleme gerekebilir. Doğrulanmadan auto-upload açılmaz (E1 bu riskten bağımsız, güvenli).
- **E2 dış bağımlılık:** Play service account secret'ı kullanıcı tarafından sağlanmadan E2 etkinleşemez; bu yüzden E1/E2 ayrıştırıldı.
- **Çift-upload:** EAS auto-leg'i kaldırılmazsa aynı sürüm iki kez Play'e yüklenir (çakışma). E2 EAS auto-zincirini ÇIKARIR; EAS yalnız manuel dispatch'te kalır.
