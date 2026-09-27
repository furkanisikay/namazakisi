Pod::Spec.new do |s|
  s.name           = 'ExpoMuhafizAnons'
  s.version        = '0.1.0'
  s.summary        = 'Muhafiz sesli anonsunun iOS tarafi: cihaz ici TTS -> ses dosyasi'
  s.description    = 'AVSpeechSynthesizer ile cevrimdisi sentez; ciktiyi Library/Sounds altina yazar.'
  s.author         = 'Furkan ISIKAY'
  s.homepage       = 'https://github.com/furkanisikay/namazakisi'
  s.license        = { :type => 'GPL-3.0', :file => '../../../LICENSE' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: 'https://github.com/furkanisikay/namazakisi' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C uyumluluk bayraklari (expo-module-scripts sablonu)
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
