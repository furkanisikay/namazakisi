Pod::Spec.new do |s|
  s.name           = 'ExpoIcloudEsitleme'
  s.version        = '0.1.0'
  s.summary        = 'Cihazlar arasi esitleme: iCloud anahtar-deger deposu koprusu'
  s.description    = 'NSUbiquitousKeyValueStore ile tek sifreli zarfi okur/yazar (issue #288).'
  s.author         = 'Furkan ISIKAY'
  s.homepage       = 'https://github.com/furkanisikay/namazakisi'
  s.license        = { :type => 'GPL-3.0', :file => '../../../LICENSE' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: 'https://github.com/furkanisikay/namazakisi' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
