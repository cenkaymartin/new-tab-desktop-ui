# Easy Speed Dial v3 - Kurulum Kılavuzu (Türkçe)

## 🎯 Hızlı Başlangıç

Bu kılavuz, Easy Speed Dial v3 extension'ını tarayıcınıza nasıl yükleyeceğinizi adım adım anlatır.

---

## 📋 İçindekiler

1. [Chrome için Kurulum](#chrome-için-kurulum)
2. [Firefox için Kurulum](#firefox-için-kurulum)
3. [İlk Kullanım](#ilk-kullanım)
4. [Backup Restore (Yeni Özellik!)](#backup-restore)
5. [Sorun Giderme](#sorun-giderme)

---

## 🔵 Chrome için Kurulum

### Adım 1: Extension Dosyalarını Hazırlayın

Extension dosyaları `dist-chrome` klasöründe hazır durumda.

### Adım 2: Chrome Extension Sayfasını Açın

1. Chrome tarayıcınızı açın
2. Adres çubuğuna şunu yazın: `chrome://extensions`
3. Enter'a basın

### Adım 3: Developer Mode'u Aktifleştirin

Sağ üst köşede **"Developer mode"** (Geliştirici modu) anahtarını açın.

![Developer Mode Switch]

### Adım 4: Extension'ı Yükleyin

1. **"Load unpacked"** (Paketlenmemiş uzantıyı yükle) butonuna tıklayın
2. Açılan pencerede projenin **`dist-chrome`** klasörünü seçin
3. **"Select Folder"** (Klasörü Seç) butonuna tıklayın

### Adım 5: Doğrulama

✅ Extension yüklendiğinde listede "Easy Speed Dial v3" görünecek
✅ Sağ üst köşede icon'u göreceksiniz
✅ Yeni sekme açtığınızda bookmark grid'i göreceksiniz

---

## 🦊 Firefox için Kurulum

### Adım 1: Extension Dosyalarını Hazırlayın

Extension dosyaları `dist-firefox` klasöründe hazır durumda.

### Adım 2: Firefox Debugging Sayfasını Açın

1. Firefox tarayıcınızı açın
2. Adres çubuğuna şunu yazın: `about:debugging`
3. Enter'a basın

### Adım 3: "This Firefox" Sekmesine Gidin

Sol menüden **"This Firefox"** (Bu Firefox) sekmesine tıklayın.

### Adım 4: Geçici Eklenti Yükleyin

1. **"Load Temporary Add-on..."** (Geçici Eklenti Yükle) butonuna tıklayın
2. Açılan pencerede **`dist-firefox`** klasörüne gidin
3. **`manifest.json`** dosyasını seçin
4. **"Open"** (Aç) butonuna tıklayın

### Adım 5: Doğrulama

✅ Extension yüklendiğinde listede görünecek
✅ Yeni sekme açtığınızda bookmark grid'i göreceksiniz

> **⚠️ Not:** Firefox'ta "geçici eklenti" olarak yüklenen extension'lar tarayıcı kapatıldığında silinir. Tarayıcıyı her açtığınızda tekrar yüklemeniz gerekir. Kalıcı kullanım için extension'ı Firefox Add-ons'a yayınlamak gerekir.

---

## 🚀 İlk Kullanım

### Extension Yüklendikten Sonra

1. **Yeni sekme açın** (Ctrl+T / Cmd+T)
2. **Bookmark grid'ini göreceksiniz**
3. Sağ üst köşedeki **⚙️ ayarlar butonu** ile özelleştirme yapabilirsiniz

### Temel Özellikler

#### 📚 Bookmark Ekleme
- Grid'de boş alana **sağ tık** → "Add Bookmark" (Yer İmi Ekle)
- Veya sağ üst **+ butonu**

#### 🎨 Görünüm Özelleştirme
- ⚙️ Ayarlar → **Wallpaper** (20+ hazır arkaplan)
- ⚙️ Ayarlar → **Theme** (Açık/Koyu/Sistem)
- ⚙️ Ayarlar → **Dial Size** (Küçük/Orta/Büyük)
- ⚙️ Ayarlar → **Grid Layout** (2-panel, 3-panel, 4-panel, tam ekran)

#### 🔄 Sürükle-Bırak
- Bookmark'ları **sürükleyerek** konumlarını değiştirebilirsiniz

#### 🖼️ Özel İkon/Thumbnail
- Bookmark'a **sağ tık** → "Customize Thumbnail" (Thumbnail Özelleştir)
- Kendi resminizi yükleyin

---

## 🆕 Backup Restore (Yeni Özellik!)

### Backup Oluşturma

1. ⚙️ **Ayarlar** → "Export JSON" butonuna tıklayın
2. `easy-speed-dial-backup-YYYY-MM-DD.json` dosyası indirilecek
3. Bu dosyayı güvenli bir yerde saklayın

### Backup'ı Geri Yükleme (Restore)

1. ⚙️ **Ayarlar** → "Restore JSON" butonuna tıklayın
2. Backup dosyanızı seçin
3. **✨ YENİ:** Favicon'lar otomatik olarak arka planda yüklenmeye başlar!
4. Sayfa otomatik olarak yenilenecek

### 🎉 Yenilik: Otomatik Favicon Yükleme

**Eski Durum:**
- ❌ Restore sonrası icon'lar görünmüyordu
- ❌ Her siteyi tek tek ziyaret etmek gerekiyordu

**Yeni Durum:**
- ✅ Restore sırasında favicon'lar otomatik çekiliyor
- ✅ %70-80 favicon direkt yükleniyor
- ✅ Console'da progress görebilirsiniz (F12 → Console)
- ✅ Kalan %20-30 tıklayınca yüklenir

#### Progress İzleme

1. Restore yaparken **F12** ile console'u açın
2. Şu logları göreceksiniz:

```
Starting favicon prefetch for 50 bookmarks...
10 favicons already cached, fetching 40 new ones
[Favicon Prefetch] 10% (4/40) - success: https://github.com
[Favicon Prefetch] 20% (8/40) - success: https://google.com
...
Favicon prefetch completed in 8234ms
✓ Successful: 35, ✗ Failed: 5, ⊘ Skipped: 10
```

#### Manuel Test (İsteğe Bağlı)

Console'da (F12) şu komutları deneyebilirsiniz:

```javascript
// Cache istatistikleri
window.getFaviconStats()

// Cache temizle
window.clearFaviconCache()

// Manuel favicon prefetch
window.batchPrefetchFavicons([
  'https://github.com',
  'https://google.com'
])
```

---

## 🎨 Özelleştirme Seçenekleri

### Arkaplan

- **20+ Hazır Wallpaper:** Galaxy, Beach, Desert, Abstract, vb.
- **Özel Resim:** Kendi resminizi yükleyin
- **Tek Renk:** Renk seçici ile özel renk

### Dial (Bookmark Kartları)

- **Boyut:** Tiny / Small / Medium / Large
- **Şekil:** Yuvarlak / Kare
- **Şeffaflık:** Saydam arka plan
- **Başlık:** Göster / Gizle / URL göster

### Grid Düzeni

- **Full Screen:** Tam ekran grid
- **2-Panel:** İki bölümlü
- **3-Panel:** Üç bölümlü
- **4-Panel:** Dört bölümlü

### Tema

- **System:** Sistem temasını takip et
- **Light:** Açık tema
- **Dark:** Koyu tema

---

## ❓ Sorun Giderme

### Extension Görünmüyor

**Chrome:**
1. `chrome://extensions` adresine gidin
2. Extension'ın **enabled** (etkin) olduğundan emin olun
3. Hata mesajı varsa "Details" butonuna tıklayıp kontrol edin

**Firefox:**
1. `about:debugging#/runtime/this-firefox` adresine gidin
2. Extension listede görünüyor mu kontrol edin
3. Geçici eklenti ise, tarayıcıyı kapatıp açtıysanız tekrar yüklemeniz gerekir

### Yeni Sekme Açılmıyor

1. Extension'ın yüklü olduğundan emin olun
2. Tarayıcıyı tamamen kapatıp tekrar açın
3. Extension'ı kaldırıp tekrar yükleyin

### Favicon'lar Yüklenmiyor

**Otomatik Yükleme (Restore Sonrası):**
1. Restore yaparken **F12** → Console'u açın
2. `[Favicon Prefetch]` loglarını izleyin
3. Eğer hata varsa console'da görünecek

**Manuel Yükleme:**
1. Bookmark'a tıklayın (site ziyaret edilince favicon yüklenir)
2. Console'da: `window.getFaviconStats()` ile cache durumunu kontrol edin
3. Cache problemi varsa: `window.clearFaviconCache()` ile temizleyin

### Bookmark'lar Kayboldu

1. ⚙️ Ayarlar → "Restore JSON"
2. Backup dosyanızı yükleyin
3. Eğer backup yoksa, tarayıcı bookmark'larınız hala duruyordur
4. Extension'ı kaldırıp tekrar yükleyin

### Performance Problemi

**Çok fazla bookmark varsa:**
1. ⚙️ Ayarlar → "Max Columns" değerini azaltın
2. "Dial Size" değerini küçültün
3. Şeffaflık özelliğini kapatın

---

## 🔧 Gelişmiş Ayarlar

### Console Komutları

Extension'ın debug fonksiyonlarına erişmek için console'u (F12) açın:

```javascript
// Favicon cache istatistikleri
window.getFaviconStats()
// Çıktı: { successful: 50, failed: 5, methods: {...} }

// Cache'i temizle
window.clearFaviconCache()

// Batch favicon prefetch
window.batchPrefetchFavicons(['https://site1.com', 'https://site2.com'])

// Cache'i doğrula
window.validateFaviconCache()

// Cache'i export et
window.exportFaviconCache()
```

### Backup Dosyası Formatı

Backup dosyası JSON formatındadır ve şunları içerir:

```json
{
  "backupVersion": "2.2",
  "timestamp": "2025-10-21T10:30:00.000Z",
  "attachTitle": true,
  "themeOption": "dark",
  "wallpaper": "galaxy",
  "dialSize": "medium",
  "gridLayout": "full-screen-panel",
  "panelBookmarks": [...],
  "dialColors": {...},
  "dialImages": {...}
}
```

---

## 📞 Destek

### Hata Bildirimi

Bir hata ile karşılaştıysanız:

1. Console'u açın (F12)
2. Hata mesajlarını kopyalayın
3. GitHub Issues'a bildirin

### Özellik İsteği

Yeni özellik önerileriniz için GitHub Issues kullanın.

---

## 📦 Build Bilgileri

### Chrome Build
- **Konum:** `dist-chrome/`
- **Manifest Version:** 3
- **Dosya Boyutu:** ~2MB

### Firefox Build
- **Konum:** `dist-firefox/`
- **Manifest Version:** 2
- **Dosya Boyutu:** ~2MB

### Yeniden Build Etme

Eğer kaynak kodda değişiklik yaptıysanız:

```bash
# Chrome için
npm run build:chrome

# Firefox için
npm run build:firefox

# Her ikisi için
npm run build:chrome && npm run build:firefox
```

---

## 🎓 Ek Kaynaklar

- **Teknik Döküman:** `FAVICON_PREFETCH_GUIDE.md`
- **README:** `README.md`
- **Lisans:** MIT License

---

## ✅ Kurulum Tamamlandı!

Artık Easy Speed Dial v3'ü kullanmaya başlayabilirsiniz! 🎉

**Yeni Özellikler:**
- ✨ Otomatik favicon yükleme
- 📦 Geliştirilmiş backup/restore
- 🎨 20+ wallpaper seçeneği
- 🔧 Detaylı debug araçları

Keyifli kullanımlar! 🚀
