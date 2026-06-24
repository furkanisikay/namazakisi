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
**Hedefler:** Kırmızı master'ı kökten engelle · güvenlik taraması ekle · coverage erozyonunu durdur · workflow'ları bakımı kolay, gözlemlenebilir, tedarik-zinciri-güvenli hâle getir — auto-release akışını bozmadan.
**Hedef olmayanlar (YAGNI):** EAS kota sorunu (faturalama, kod değil — ayrı) · prod runtime hata-izleme (Sentry; ayrı araştırma) · `develop` dalına protection (kullanımda değilse) · yeni build matrisi/platform.

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

## 4. Faz sırası (tek spec, fazlı uygulama)
1. **Faz 1 — A + C:** coverageThreshold + run-summary coverage; sonra master ruleset (release-bot bypass doğrulanarak). En yüksek kaldıraç. *Sıra önemli: ruleset'i açmadan önce quality+test check adlarının kararlı olduğundan emin ol.*
2. **Faz 2 — B:** CodeQL + dependency-review workflow'ları + secret scanning/push protection ayarı. (Yeni check'ler kararlı çalıştıktan sonra istenirse ruleset'e zorunlu check olarak eklenir.)
3. **Faz 3 — D:** SHA-pinning + composite setup + zengin summary + standardizasyon.

## 5. Doğrulama / kabul kriterleri
- Branch protection: check'siz/CI-kırık bir PR **merge edilemez**; release-bot push'u **çalışır** (bir release başarıyla kesilir).
- Güvenlik: CodeQL PR'da çalışır; bilinen-açıklı bir test bağımlılığı dependency-review'ı **fail** ettirir (manuel doğrulama).
- Kalite: coverage eşiği altına düşen bir değişiklik testi **fail** eder.
- Workflow'lar: `actionlint` (veya gh) ile geçerli; mevcut `npm run verify` ve release akışı bozulmaz; her job'da timeout+permissions.
- Hiçbir faz auto-release'i (master direct push) kırmaz.

## 6. Sınırlar / riskler
- **Ruleset bypass** repo planına/araçlarına bağlı; bypass kurulamazsa "Hafif" moda (sadece zorunlu check, require-PR yok) düşülür — yine de auto-release korunur. Bu, implementasyonda doğrulanacak ilk şey.
- `.github/workflows` ve repo güvenlik ayarı değişiklikleri AGENTS.md "⚠️ önce sor" kapsamında — kullanıcı onayı alındı.
- CI/CD değişiklikleri canlı pipeline'ı etkiler; her faz küçük PR'la, release penceresine dikkat ederek (master'a her merge ~24dk release keser) indirilir.
