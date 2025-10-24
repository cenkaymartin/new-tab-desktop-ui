# 📁 Extension Klasörünü Bulma Rehberi

## Klasörler Nerede?

Extension dosyalarınız şu klasörlerde hazır:

```
/home/user/Newtab-desktop-ui/dist-chrome    ← Chrome için
/home/user/Newtab-desktop-ui/dist-firefox   ← Firefox için
```

---

## 🔍 Adım Adım Bulma

### Linux / Mac Kullanıyorsanız:

**1. Terminal'i Açın**

**2. Projeye Gidin:**
```bash
cd /home/user/Newtab-desktop-ui
```

**3. Klasörleri Görün:**
```bash
ls -la dist*
```

Şunu göreceksiniz:
```
dist-chrome/    ← Chrome extension burada
dist-firefox/   ← Firefox extension burada
```

**4. Dosya Yöneticisinde Açın:**
```bash
# Linux için
xdg-open /home/user/Newtab-desktop-ui/dist-chrome

# Mac için
open /home/user/Newtab-desktop-ui/dist-chrome
```

---

### Windows Kullanıyorsanız:

**1. Dosya Gezgini'ni Açın**

**2. Adres Çubuğuna Yazın:**
```
C:\Users\[KULLANICI_ADINIZ]\Newtab-desktop-ui
```

**3. İçinde Şu Klasörleri Göreceksiniz:**
```
📁 dist-chrome    ← Chrome için bunu kullanın
📁 dist-firefox   ← Firefox için bunu kullanın
```

---

## 🚀 Chrome'a Yükleme (DETAYLI)

### Adım 1: Klasörün Yolunu Kopyalayın

**Linux/Mac:**
```
/home/user/Newtab-desktop-ui/dist-chrome
```

**Windows:**
```
C:\Users\[KULLANICI_ADINIZ]\Newtab-desktop-ui\dist-chrome
```

### Adım 2: Chrome'u Açın

1. Chrome tarayıcınızı başlatın
2. Adres çubuğuna **TAM OLARAK** şunu yazın:
   ```
   chrome://extensions
   ```
3. Enter'a basın

### Adım 3: Developer Mode'u Açın

Sağ üst köşede **"Developer mode"** yazısını bulun ve anahtarı açın.

### Adım 4: Extension'ı Yükleyin

1. **"Load unpacked"** (Paketlenmemiş uzantıyı yükle) butonuna tıklayın

2. Açılan pencerede:
   - **Linux/Mac:** `/home/user/Newtab-desktop-ui/dist-chrome` gidin
   - **Windows:** `C:\Users\[...]\Newtab-desktop-ui\dist-chrome` gidin

3. **`dist-chrome`** klasörünü seçin (içine girmeyin, klasörün kendisini seçin!)

4. **"Select Folder"** veya **"Klasörü Seç"** butonuna tıklayın

### Adım 5: Doğrulama

✅ Extension listesinde **"Easy Speed Dial v3"** görünecek
✅ Versiyon: **3.0.0**
✅ Sağ üstte extension icon'u belirecek

### Adım 6: Test Edin

1. **Yeni sekme açın** (Ctrl+T veya Cmd+T)
2. **Bookmark grid'ini göreceksiniz!** 🎉

---

## 🦊 Firefox'a Yükleme (DETAYLI)

### Adım 1: Firefox'u Açın

1. Firefox tarayıcınızı başlatın
2. Adres çubuğuna **TAM OLARAK** şunu yazın:
   ```
   about:debugging
   ```
3. Enter'a basın

### Adım 2: This Firefox Sekmesi

Sol menüden **"This Firefox"** (Bu Firefox) sekmesine tıklayın

### Adım 3: Geçici Eklenti Yükle

1. **"Load Temporary Add-on..."** (Geçici Eklenti Yükle) butonuna tıklayın

2. Açılan pencerede:
   - `/home/user/Newtab-desktop-ui/dist-firefox` klasörüne gidin
   - **ÖNEMLİ:** İçine girin!

3. **`manifest.json`** dosyasını seçin

4. **"Open"** (Aç) butonuna tıklayın

### Adım 4: Test Edin

1. **Yeni sekme açın** (Ctrl+T veya Cmd+T)
2. **Bookmark grid'ini göreceksiniz!** 🎉

**⚠️ DİKKAT:**
Firefox'ta geçici eklentiler tarayıcı kapatıldığında silinir. Her açılışta tekrar yüklemeniz gerekir.

---

## 🔧 SORUN GİDERME

### "Klasör bulunamadı" Hatası

**Çözüm 1: Build Dosyalarını Kontrol Edin**

Terminal'de şunu çalıştırın:
```bash
cd /home/user/Newtab-desktop-ui
ls -la dist-chrome/
```

Eğer "No such file or directory" diyorsa:
```bash
npm run build:chrome    # Chrome için
npm run build:firefox   # Firefox için
```

**Çözüm 2: Tam Yolu Kullanın**

Chrome extension yüklerken **tam yolu** kopyalayıp yapıştırın:
```
/home/user/Newtab-desktop-ui/dist-chrome
```

### "manifest.json bulunamadı" Hatası

**Çözüm:**

manifest.json dosyasının var olduğunu kontrol edin:
```bash
cat /home/user/Newtab-desktop-ui/dist-chrome/manifest.json
```

Eğer dosya yoksa, yeniden build edin:
```bash
npm run build:chrome
```

### Extension Yüklendi Ama Çalışmıyor

**Çözüm:**

1. Extension'ın **enabled** (etkin) olduğunu kontrol edin
2. Hata varsa **"Details"** → **"Errors"** kısmına bakın
3. Chrome/Firefox'u tamamen kapatıp tekrar açın
4. Extension'ı kaldırıp tekrar yükleyin

---

## 📍 HANGİ KLASÖRÜ SEÇMELİYİM?

### Chrome İÇİN:
```
dist-chrome/    ← BU KLASÖRÜ
├── manifest.json
├── index.html
├── settings.html
├── assets/
└── icons/
```

### Firefox İÇİN:
```
dist-firefox/
├── manifest.json  ← BU DOSYAYI
├── index.html
├── settings.html
├── assets/
└── icons/
```

---

## 💡 HIZLI İPUCU

**Terminal'den Doğrudan Açın:**

```bash
# Chrome için dosya yöneticisinde aç
xdg-open /home/user/Newtab-desktop-ui/dist-chrome

# Firefox için dosya yöneticisinde aç
xdg-open /home/user/Newtab-desktop-ui/dist-firefox
```

---

## ✅ BAŞARILI YÜKLEME KONTROLLİSTESİ

Chrome için:
- [ ] chrome://extensions açıldı
- [ ] Developer mode açık
- [ ] Load unpacked tıklandı
- [ ] dist-chrome klasörü seçildi
- [ ] Extension listede görünüyor
- [ ] Yeni sekme açılınca grid görünüyor

Firefox için:
- [ ] about:debugging açıldı
- [ ] This Firefox sekmesine girildi
- [ ] Load Temporary Add-on tıklandı
- [ ] dist-firefox/manifest.json seçildi
- [ ] Extension listede görünüyor
- [ ] Yeni sekme açılınca grid görünüyor

---

## 🎯 ÖZET

**Chrome:**
```
1. chrome://extensions
2. Developer mode ON
3. Load unpacked
4. Klasör seç: /home/user/Newtab-desktop-ui/dist-chrome
5. ✅ Bitti!
```

**Firefox:**
```
1. about:debugging
2. This Firefox
3. Load Temporary Add-on
4. Dosya seç: /home/user/Newtab-desktop-ui/dist-firefox/manifest.json
5. ✅ Bitti!
```

---

Hala sorun yaşıyorsanız, hangi adımda takıldığınızı söyleyin, yardımcı olayım! 🚀
