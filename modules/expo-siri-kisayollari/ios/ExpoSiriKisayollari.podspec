Pod::Spec.new do |s|
  s.name           = 'ExpoSiriKisayollari'
  s.version        = '0.1.0'
  s.summary        = 'Siri, Kisayollar ve Odak filtresi icin paylasilan depo ve JS koprusu'
  s.description    = 'App Intents ana uygulama hedefinde derlenir; bu pod UserDefaults deposunu, vakit kararini ve JS koprusunu tasir.'
  s.author         = 'Furkan ISIKAY'
  s.homepage       = 'https://github.com/furkanisikay/namazakisi'
  s.license        = { :type => 'GPL-3.0', :file => '../../../LICENSE' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: 'https://github.com/furkanisikay/namazakisi' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Canli etkinlik (#295): ActivityKit iOS 16.1'dedir, dagitim hedefi 15.1 → ZAYIF bag.
  # Guclu bag (Swift otomatik baglama) iOS 15'te acilista "Library not loaded" ile cokertirdi.
  s.weak_frameworks = 'ActivityKit', 'WidgetKit'

  # Swift/Objective-C uyumluluk bayraklari (expo-module-scripts sablonu).
  # DEFINES_MODULE: ana uygulama hedefindeki App Intents `import ExpoSiriKisayollari`
  # ile `SiriDeposu`'nu kullanir — modul haritasi olmadan bu import derlenmez.
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  # Yalniz bu dizin: `../test/main.swift` (swiftc test kosucusu) pod'a GIRMEZ.
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
