Pod::Spec.new do |s|
  s.name           = 'ExpoMuhafizAlarmKit'
  s.version        = '0.1.0'
  s.summary        = 'Muhafiz gercek alarminin iOS 26 AlarmKit koprusu ve paylasilan alarm deposu'
  s.description    = 'AlarmKit cagrilari ve App Intents ana uygulama hedefindedir; bu pod alarm kayit deposunu, saf kurallari ve JS koprusunu tasir.'
  s.author         = 'Furkan ISIKAY'
  s.homepage       = 'https://github.com/furkanisikay/namazakisi'
  s.license        = { :type => 'GPL-3.0', :file => '../../../LICENSE' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: 'https://github.com/furkanisikay/namazakisi' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # DEFINES_MODULE: ana hedefteki `NamazAlarmPlanlayici` ve alarm intent'leri
  # `import ExpoMuhafizAlarmKit` ile `AlarmDeposu`/`AlarmKurallari`'ni kullanir.
  # Pod AlarmKit'e DOKUNMAZ (yalniz Foundation + ExpoModulesCore) → zayif bag gerekmez.
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  # Yalniz bu dizin: `../test/main.swift` (swiftc test kosucusu) pod'a GIRMEZ.
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
