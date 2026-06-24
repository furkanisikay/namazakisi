# CI/CD Faz 1 — Koruma + Kalite Kapıları — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** master'a "kırmızı master"ı kökten engelleyen branch protection (Dengeli) ekle ve test coverage erozyonunu durduran ratchet eşiği + CI özetinde gerçek coverage raporu kur — auto-release'i bozmadan.

**Architecture:** İki bağımsız iş. **C (Kalite):** `jest.config.js`'e `coverageThreshold` (mevcut seviyenin birkaç puan altı = ratchet) + `coverageReporters`'a `json-summary`; CI test özetine `coverage-summary.json`'dan gerçek % tablosu. **A (Koruma):** auto-release push'unu admin'e ait `RELEASE_TOKEN` PAT'a çevir (klasik branch protection `enforce_admins:false` ile admin bypass → bot push çalışır) + push'a `pull --rebase`+retry hardening; sonra `gh api` ile master'a required-check (quality+test) + require-PR(0) + linear-history koruması.

**Tech Stack:** Jest (jest-expo), GitHub Actions, `gh` CLI / GitHub REST branch-protection API, bash.

## Global Constraints

- Kullanıcıya görünen TÜM metin kibar "siz" dili; kod isimleri Türkçe. (Bu fazda kullanıcıya görünen yeni metin yok; CI summary teknik.)
- Her değişiklikten sonra `npm run verify` (typecheck+lint+test) **GEÇMELİ**; dokunulan dosyaya yeni lint warning ekleme.
- `.github/workflows` ve repo ayarı değişikliği AGENTS.md "⚠️ önce sor" kapsamında — kullanıcı onayı alındı (Faz 1).
- **Release penceresi kuralı:** master'a push/merge yapmadan önce uçuşta release koşusu OLMADIĞINI doğrula (`gh run list --branch master --json status`); varsa bitene kadar bekle (uçuştaki release'in pull-rebase'siz push'u non-fast-forward kırılır).
- Mevcut auto-release zinciri: `ci.yml auto-release → android-build.yml` (push: `github-actions[bot]` + `GITHUB_TOKEN`, satır 463-473). Required-check contexts'in TAM adları: `🔍 Kod Kalitesi`, `🧪 Testler` (emoji dahil birebir).
- Coverage başlangıç değerleri (2026-06-24 ölçümü): Statements **52.46%**, Branches **37.22%**, Functions **42.57%**, Lines **53.2%**.

---

## File Structure
- `jest.config.js` — Modify: `coverageReporters` + `coverageThreshold` ekle.
- `.github/workflows/ci.yml` — Modify: test job'un coverage özet adımı (gerçek % tablosu).
- `.github/workflows/android-build.yml` — Modify: checkout token → `RELEASE_TOKEN`; push step'e `pull --rebase`+retry.
- Repo ayarı (dosya değil): master branch protection (`gh api`), `RELEASE_TOKEN` secret (kullanıcı sağlar).

---

## Task 1: Coverage ratchet eşiği (C)

**Files:**
- Modify: `jest.config.js`

**Interfaces:**
- Produces: `coverage/coverage-summary.json` (json-summary reporter çıktısı; Task 2 bunu okur).

- [ ] **Step 1: Önce mevcut coverage'ı doğrula (eşik altı kalmasın)**

Run: `npx jest --coverage --coverageReporters=text-summary --silent`
Expected: Statements ~52%, Branches ~37%, Functions ~42%, Lines ~53% (eşikler bunların altında olmalı).

- [ ] **Step 2: `jest.config.js`'e reporters + threshold ekle**

`coverageDirectory: "coverage",` satırının hemen ÜSTÜNE ekle:

```js
  // CI özeti coverage/coverage-summary.json'u okur (Task 2); text+lcov korunur.
  coverageReporters: ["text", "lcov", "json-summary"],
  // Ratchet: mevcut seviyenin birkaç puan altı → erozyonu durdurur, mevcut suite'i bloklamaz.
  // Coverage yükseldikçe bu tabanlar da yükseltilmeli (yukarı doğru ratchet).
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 35,
      functions: 40,
      lines: 50,
    },
  },
```

- [ ] **Step 3: Eşiğin mevcut kodda GEÇTİĞİNİ doğrula**

Run: `npx jest --coverage --silent`
Expected: PASS — sonda "Jest: ... threshold" HATASI YOK; `coverage/coverage-summary.json` oluşur.

- [ ] **Step 4: Eşiğin gerçekten zorladığını kanıtla (geçici negatif test)**

`jest.config.js`'de `lines: 50` → geçici `lines: 99` yap, sonra:
Run: `npx jest --coverage --silent 2>&1 | grep -i "coverage threshold"`
Expected: "Jest: Coverage threshold for lines (99%) not met: 53.2%" benzeri HATA çıkar (eşik aktif). Sonra `99` → `50`'ye GERİ AL.

- [ ] **Step 5: verify + commit**

Run: `npm run verify`
Expected: typecheck+lint+test PASS.

```bash
git add jest.config.js
git commit -m "test(coverage): ratchet eşiği (S50/B35/F40/L50) + json-summary reporter

Mevcut: S52.46/B37.22/F42.57/L53.2 — taban birkaç puan altı (erozyon durdurma).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: CI özetinde gerçek coverage tablosu (C)

**Files:**
- Modify: `.github/workflows/ci.yml` (test job "📊 Test Ozeti" adımı, ~140-153)

**Interfaces:**
- Consumes: `coverage/coverage-summary.json` (Task 1'den; CI'da `npm test -- --coverage` zaten satır 130'da koşuyor).

- [ ] **Step 1: Parse mantığını yerelde doğrula**

Önce coverage üret: `npx jest --coverage --silent` (Task 1 sonrası `coverage/coverage-summary.json` var).
Sonra parse'ı test et:

```bash
node -e 'const t=require("./coverage/coverage-summary.json").total; for(const k of ["lines","statements","functions","branches"]) console.log(`| ${k} | ${t[k].pct}% | ${t[k].covered}/${t[k].total} |`);'
```

Expected: 4 satırlık markdown tablo, ör. `| lines | 53.2% | 3343/6283 |`.

- [ ] **Step 2: ci.yml test özet adımını coverage tablosuyla genişlet**

`.github/workflows/ci.yml` içinde mevcut bloğu DEĞİŞTİR — bul:

```yaml
            echo "| Unit Tests | ${{ steps.tests.outcome == 'success' && '✅ Basarili' || '❌ Basarisiz' }} |"
            echo ""
            if [ -f coverage/lcov.info ]; then
              echo "> 📊 Coverage raporu artifact olarak yuklendi."
            fi
          } >> $GITHUB_STEP_SUMMARY
```

ile değiştir:

```yaml
            echo "| Unit Tests | ${{ steps.tests.outcome == 'success' && '✅ Basarili' || '❌ Basarisiz' }} |"
            echo ""
            if [ -f coverage/coverage-summary.json ]; then
              echo "#### 📊 Coverage (eşik: S50 / B35 / F40 / L50)"
              echo ""
              echo "| Metrik | % | Kapsam |"
              echo "|--------|---|--------|"
              node -e 'const t=require("./coverage/coverage-summary.json").total; const ad={lines:"Lines",statements:"Statements",functions:"Functions",branches:"Branches"}; for(const k of ["lines","statements","functions","branches"]) console.log(`| ${ad[k]} | ${t[k].pct}% | ${t[k].covered}/${t[k].total} |`);' >> $GITHUB_STEP_SUMMARY
            elif [ -f coverage/lcov.info ]; then
              echo "> 📊 Coverage raporu artifact olarak yuklendi."
            fi
          } >> $GITHUB_STEP_SUMMARY
```

> Not: `node -e ... >> $GITHUB_STEP_SUMMARY` satırı tablo satırlarını doğrudan ekler; çevresindeki `echo`'lar zaten `{ } >> $GITHUB_STEP_SUMMARY` bloğunda.

- [ ] **Step 3: actionlint ile workflow geçerliliğini doğrula**

Run: `npx -y actionlint .github/workflows/ci.yml` (yoksa: bu adımı atla, YAML'i gözle kontrol et — girinti doğru mu).
Expected: hata yok.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: test özetine gerçek coverage tablosu (coverage-summary.json)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5: PR aç, CI'da coverage özetini ve eşiğin canlı çalıştığını doğrula**

Task 1+2 birlikte bir PR'da gider (C bütünü). PR'ın test job summary'sinde coverage tablosu görünmeli; eşik altı bir senaryo (gerekirse manuel) testi fail etmeli. Bu PR Faz-1-A'dan BAĞIMSIZ merge edilebilir.

---

## Task 3: Release push'u RELEASE_TOKEN + rebase&retry'a çevir (A)

> ⚠️ Bu task, koruma açılınca bot push'unun çalışmasını sağlar. **Task 4'ten ÖNCE** gitmeli (yoksa koruma açılır açılmaz release kırılır).

**Files:**
- Modify: `.github/workflows/android-build.yml` (checkout ~68-72; push step 463-473)

**Interfaces:**
- Consumes: `secrets.RELEASE_TOKEN` (admin'e ait, `contents:write` yetkili fine-grained PAT — kullanıcı sağlar).
- Produces: master'a fast-forward, dayanıklı (rebase+retry) release push'u.

- [ ] **Step 1: KULLANICI ÖN KOŞULU — RELEASE_TOKEN oluştur**

Kullanıcı: GitHub → Settings → Developer settings → **Fine-grained PAT** → repo: `furkanisikay/namazakisi`, izin: **Contents: Read and write** (+ workflow gerekiyorsa). Token'ı repo → Settings → Secrets → Actions → **`RELEASE_TOKEN`** olarak ekle.
Doğrula: `gh secret list --repo furkanisikay/namazakisi` çıktısında `RELEASE_TOKEN` görünür.
*Bu adım yapılmadan Task 3-4-5 ilerleyemez.*

- [ ] **Step 2: Checkout token'ını RELEASE_TOKEN yap**

`.github/workflows/android-build.yml` checkout adımında (~72) bul:
```yaml
          token: ${{ secrets.GITHUB_TOKEN }}
```
ile değiştir:
```yaml
          token: ${{ secrets.RELEASE_TOKEN }}   # admin PAT → korumalı master'a bypass push (enforce_admins:false)
```

- [ ] **Step 3: Push step'ine pull --rebase + retry ekle**

`android-build.yml` push step'inde (463-473) bul:
```bash
          git tag -a ${{ steps.version.outputs.version_tag }} -m "Release ${{ steps.version.outputs.version_tag }}"
          git push origin HEAD:${{ github.ref_name }}
          git push origin ${{ steps.version.outputs.version_tag }}
```
ile değiştir:
```bash
          git tag -a ${{ steps.version.outputs.version_tag }} -m "Release ${{ steps.version.outputs.version_tag }}"
          # Robustluk: build sürerken master'a araya commit kaçtıysa rebase + retry (non-fast-forward kırılmasını önle)
          for deneme in 1 2 3; do
            if git push origin HEAD:${{ github.ref_name }}; then
              echo "✅ master push başarılı (deneme $deneme)"; break
            fi
            echo "⚠️ push reddedildi (deneme $deneme) — pull --rebase deneniyor"
            git pull --rebase origin ${{ github.ref_name }} || { echo "❌ rebase başarısız"; exit 1; }
            [ "$deneme" = "3" ] && { echo "❌ 3 denemede push başarısız"; exit 1; }
          done
          git push origin ${{ steps.version.outputs.version_tag }}
```

- [ ] **Step 4: Workflow geçerliliğini doğrula**

Run: `npx -y actionlint .github/workflows/android-build.yml` (yoksa YAML'i gözle kontrol et).
Expected: hata yok.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/android-build.yml
git commit -m "ci(release): push için RELEASE_TOKEN (admin bypass) + pull-rebase&retry hardening

Korumalı master'da bot push'unun çalışması + eşzamanlı push'a dayanıklılık (#release-race).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: master branch protection (Dengeli) — gh api (A)

> Task 3 merge edilip RELEASE_TOKEN secret'ı eklenMEDEN bu task'ı UYGULAMA (release kırılır).

**Files:** Dosya değil — repo ayarı (`gh api`). Versiyonlanması için JSON'u referans olarak repoda tut.

**Interfaces:**
- Consumes: required check adları `🔍 Kod Kalitesi`, `🧪 Testler`; RELEASE_TOKEN push yolu (Task 3).

- [ ] **Step 1: Mevcut korumayı not et (rollback için)**

Run: `gh api repos/furkanisikay/namazakisi/branches/master/protection 2>&1 | head -5`
Expected: `Branch not protected` (404) — başlangıç durumu.

- [ ] **Step 2: Korumayı uygula**

```bash
gh api --method PUT repos/furkanisikay/namazakisi/branches/master/protection --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "checks": [ {"context":"🔍 Kod Kalitesi"}, {"context":"🧪 Testler"} ] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 0, "dismiss_stale_reviews": false },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
```

Expected: 200 + dönen JSON'da `required_status_checks.checks` iki context, `enforce_admins.enabled:false`, `required_linear_history.enabled:true`.

- [ ] **Step 3: Uygulandığını doğrula**

Run: `gh api repos/furkanisikay/namazakisi/branches/master/protection --jq '{checks:[.required_status_checks.checks[].context], admin:.enforce_admins.enabled, linear:.required_linear_history.enabled, force:.allow_force_pushes.enabled}'`
Expected: `{"checks":["🔍 Kod Kalitesi","🧪 Testler"],"admin":false,"linear":true,"force":false}`

---

## Task 5: Davranışsal doğrulama + rollback (A)

**Files:** Yok (doğrulama).

- [ ] **Step 1: Başarısız-check'li PR MERGE EDİLEMİYOR (kapı çalışıyor)**

```bash
git checkout -b test/koruma-dogrulama master
# Kasıtlı kırık test ekle
printf "test('koruma kapisi', () => { expect(1).toBe(2); });\n" > src/__tests__/koruma_gecici.test.ts
git add src/__tests__/koruma_gecici.test.ts
git commit -m "test: koruma kapısı doğrulama (geçici)"
git push -u origin test/koruma-dogrulama
gh pr create --title "TEST: koruma kapısı" --body "Geçici — merge edilmemeli" --base master
```
CI bitince: `gh pr merge --squash` DENE.
Expected: merge **REDDEDİLİR** ("required status checks ... failing" / "not mergeable").

- [ ] **Step 2: Test PR'ını temizle**

```bash
gh pr close test/koruma-dogrulama --delete-branch
git checkout master
```

- [ ] **Step 3: (Opsiyonel ama önerilen) RELEASE_TOKEN admin push yetkisini güvenle kanıtla**

Korumalı master'a admin PAT'ın boş `[skip ci]` commit'i push edebildiğini doğrula (release tetiklemez):
```bash
# Uçuşta release yok mu?
gh run list --branch master --limit 3 --json status --jq '[.[]|select(.status!="completed")]|length'   # 0 olmalı
git pull origin master
git commit --allow-empty -m "chore: koruma push testi [skip ci]"
git push origin HEAD:master   # senin (admin) kimliğinle → enforce_admins:false sayesinde geçer
```
Expected: push **başarılı** (admin bypass çalışıyor → CI'daki RELEASE_TOKEN de aynı mantıkla geçer). Not: bu yerel push senin admin kimliğinle; CI'da aynı yetkili RELEASE_TOKEN kullanılır.

- [ ] **Step 4: Gerçek release ile uçtan uca doğrula (bir sonraki master merge'i)**

Faz-1-C PR'ı (Task 1-2) master'a merge edildiğinde auto-release çalışır → push (RELEASE_TOKEN + rebase/retry) korumalı master'a **başarılı** olmalı; tag + GitHub Release kesilir.
Doğrula: `gh run list --branch master --workflow ci.yml --limit 1` SUCCESS; `git tag --sort=-creatordate | head -1` yeni sürüm.

- [ ] **ROLLBACK (gerekirse):** Release/PR akışı koruma yüzünden kırılırsa korumayı anında kaldır:
```bash
gh api --method DELETE repos/furkanisikay/namazakisi/branches/master/protection
```

---

## Self-Review notları
- **Spec kapsamı:** A (ruleset→klasik branch protection ile aynı Dengeli semantiği: required check + require-PR(0) + linear + admin/release bypass) ✓; C (coverageThreshold ratchet + summary coverage) ✓. Release-push hardening (D'den) Task 3'e folded (kullanıcı onayıyla) ✓.
- **Sapma notu:** Spec "ruleset (modern)" diyordu; plan **klasik branch protection** kullanıyor çünkü `enforce_admins:false` + admin-PAT push, GITHUB_TOKEN'ın korumalı master'a push edememesi sorununu deterministik çözer (ruleset bypass-actor'ün github-actions botunu kapsaması belirsiz). Aynı Dengeli sonucu verir; kullanıcı ruleset ısrar ederse bypass_actors=RepositoryRole(admin) ile eşdeğer kurulur.
- **Ön koşul:** Task 3-4-5, kullanıcının `RELEASE_TOKEN` secret'ını sağlamasına bağlı (Task 3 Step 1). C (Task 1-2) bağımsız ve önce merge edilebilir.
