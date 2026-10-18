# CI, sürümleme ve yayın hattı

Ne zaman okunur: `.github/workflows` düzenlerken, PR birleştirirken/release beklerken, EAS/Play gönderimi ya da dependabot PR'ı ile uğraşırken; Jules ortamını kurarken.

## Hat yapısı
- **APK = Gradle (`android-build.yml`), AAB = EAS (`expo-build.yml`) → Play Store internal track.** `android-build.yml` reusable'dır, `ci.yml`'in `auto-release` job'undan çağrılır.
- **Reusable'ın istediği izinler çağıran job'un izinlerinin alt kümesi olmalı:** `actions: write` hem `android-build.yml`'de hem `auto-release`'te; yoksa `startup_failure`. `ci.yml` üst seviyesi `contents: read`, yazma yalnız `auto-release`'te.
- **Release sırası: önce GitHub Release yayınla, EN SON EAS dispatch.** `eas.json`: `appVersionSource: local`; sürüm numarasını CI yönetir (elle değiştirme).
- **`android-build.yml` PREBUILD ÇALIŞTIRMAZ (bilinçli).** `expo prebuild --clean` git'teki `android/` özelleştirmelerini siliyordu (APK'da widget yoktu, `tools:node="remove"` izinleri geri geliyordu) ve release commit'i yeniden üretilen `build.gradle`'ı master'a yazabilirdi. "Build yeşil" native kodun APK'ya girdiğini kanıtlamaz → `aapt2 dump xmltree <apk> --file AndroidManifest.xml` ile alıcıları/izinleri say. İmza yaması yalnız derleme içindir: `build.gradle` `$RUNNER_TEMP`'e kopyalanır, derleme sonrası geri konur. Native değişikliği emülatörde görmek için `android-ekran-goruntuleri.yml` (git'teki `android/`'dan derler).

## Sürümleme (`paulhatch/semantic-version`, `android-build.yml`)
- **Desen eğik çizgiyle sarılmadıkça DÜZ METİNDİR.** `minor_pattern: '/^feat(\(.+\))?!?:/'` — TEK tırnak şart (YAML çift tırnakta `\(` geçersiz kaçış, workflow parse edilmez); `^` gerekli (`search_commit_body: true` gövdede geçen "feat"i saymasın). Eski düz `feat:` kapsamlı commit'lerde (`feat(cuma):`) hiç eşleşmedi, 0.23.x'te 42 feat commit'i yalnız patch üretti. `major_pattern: "BREAKING CHANGE:"` düz metin olarak doğru.
- **Uygulamayı değiştirmeyen commit'e `feat:` değil `ci:`/`chore:` öneki ver** (aksi halde minor atlar).

## Her merge bir release keser
- **master'a her push (`paths-ignore`: `**.md`/`docs`/`LICENSE` hariç) `auto-release` koşar (~24 dk), `chore:` dahil en az patch bump → imzalı APK + Play internal.** Betik ve workflow commit'leri de release keser (yaşandı: bir günde 10 AAB, 0.27.0 → 0.28.0).
- **Merge'leri serileştir.** `ci.yml` `concurrency: cancel-in-progress: true` → arka arkaya merge'de sonraki push öncekinin release'ini iptal eder. İlişkili/dependabot PR'larını tek dalda birleştir (tek lockfile → `npx -y npm@10 ci` → tek release).
- **Release commit'i (`chore(release): X [skip ci]`) `package.json`, `package-lock.json`, `app.json`, `build.gradle`, `UygulamaSabitleri.ts`, `CHANGELOG.md`'yi değiştirir** → açık dependabot/lockfile PR'ları çakışır, rebase gerekir.
- **`workflow_dispatch` araçlarını (ekran görüntüsü, Play mağaza) ayrı dalda geliştir, `gh workflow run <wf> --ref <dal>` ile koş;** dispatch dalın workflow sürümünü kullanır. Sonda tek PR, tek release.
- **Yalnız araç/belge içeren PR'ı `[skip ci]`'lı birleştirme commit'iyle birleştir** (`gh pr merge N --merge --subject "... [skip ci]"`; PR #252'de doğrulandı). Uygulama kodu içeren PR'da KULLANMA. `.md`-only commit doğrudan master'a gidebilir (release tetiklemez), ama uçuştaki release'e gereksiz push atma.
- **"Commit ve Tag" adımı araya kaçan push'a dayanıklıdır:** `pull --rebase --autostash` + 3 denemeli retry (PR #170); rebase çakışırsa (ör. CHANGELOG.md'ye dokunan push) bilinçli olarak abort + hata verir.
- **TAG push'tan SONRA atılır — sırayı bozma.** Önce atılırsa rebase release commit'ini yeniden yazar, tag yetim commit'te kalır ve GitHub Release oraya bağlanır. Sıra: commit → rebase+push (retry) → tag → tag push.
- **Shell'de `git push | grep` KULLANMA:** `set -o pipefail` boru hattına `git push`'un exit kodunu verir, `if` yanlış dala gider. Çıktıyı değişkene al, exit kodunu ayrı denetle.

## EAS / Play gönderimi (`expo-build.yml`)
- **`expo-build.yml` Node 22, diğer workflow'lar Node 20 — bilinçli.** `expo/expo-github-action` eas-cli'yi `yarn add` ile kurar; transitif `@oclif/plugin-autocomplete` (3.3.0+) `>=22` ister ve yarn reddeder (eas-cli'nin kendi `engines`'i `>=20` dese de). Sürüm pinlemek bunu engellemez. Belirti: AAB ~52 sn'de patlar, APK/Release yeşilken Play'e hiçbir şey gitmez. `node_modules` cache anahtarı Node sürümünü içerir (`node${{ env.NODE_VERSION }}`). Ucuz doğrulama: `build_aab=false, build_apk=false, internal_a_gonder=false` ile dispatch (~1 dk).
- **EAS kuyruğu 2 saati aşabilir → `eas build` adımı job'u düşürmemeli.** Adıma `continue-on-error: true` + kendi `timeout-minutes`'ı (bugün 200; job 240, büyük olmalı), sonra durumu EAS'e sor (`eas build:list --limit 1 --json`, `appBuildVersion` ile versionCode eşle) ve submit'i adımın outcome'una değil o duruma bağla (yaşandı: 114 dk kuyruk, biten build gönderilmedi). Biten bir build'i sonradan göndermek: `sadece_submit` girdisi.
- **Saat/TV paketleri ayrı iş (`saat_tv`); iOS build/TestFlight girdileri (`build_ios`, `testflight_a_gonder`) yalnız elle dispatch'te** — ayrıntı: [wear-tv.md](wear-tv.md), [ios.md](ios.md).

## Dependabot
- **Expo SDK'nın yönettiği paketlere dokunmaz (`.github/dependabot.yml` ignore listesi).** Liste `node_modules/expo/bundledNativeModules.json` ∩ `package.json` ile üretilir; SDK dışı sürüm native build'i kırar. **SDK yükseltmesinde listeyi yeniden üret;** paketler SDK ile birlikte `npx expo install --fix` ile güncellenir.
- **`react-test-renderer` listede değil ama `react` sürümüne kilitlidir** (peer `react@^<kendi sürümü>`); react'tan önde giden bump `npm ci`'da `ERESOLVE` ile düşer → kapat.
- **`@react-navigation/bottom-tabs` ve `native` birlikte gider** (peer); ayrı PR'lar tek başına birleştirilemez.

## Jules / ajan ortamı
- **Jules proje ayarlarında: setup script `npm ci`, test komutu `npm run verify`.** Aksi halde kendini doğrulamaz, bozuk PR açar. Görevde yeni bağımlılık eklerse o görevde `npm install` ile lockfile'ı yeniden üretmeli (npm@10 kuralı).
- **Node 20** (`package.json > engines.node >= 20.19.4`, CI pin'i). `postinstall: patch-package` atlanmamalı. PR hedef dalı `master`. Jules `git push` kullanıyorsa panelde `CI=true` (`.githooks/pre-push` verify'ı atlar). Prod anahtarı koyma.
