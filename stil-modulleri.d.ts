// TypeScript 6 `noUncheckedSideEffectImports`'i varsayılan açtı: `import './global.css'`
// (NativeWind giriş stili) için tür bildirimi şart. Metro dosyayı NativeWind'e verir;
// burada yalnız derleyiciye "bu bir stil modülü" denir.
declare module '*.css';
