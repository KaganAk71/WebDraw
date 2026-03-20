<div align="center">

# 🎨 Web Draw — Browser Drawing Engine

<a href="#english">🇬🇧 English</a> | <a href="#türkçe">🇹🇷 Türkçe</a>

<br/>

  <img src="https://img.shields.io/github/stars/KaganAk71/WebDraw?style=for-the-badge&color=ff0080">
  <img src="https://img.shields.io/github/forks/KaganAk71/WebDraw?style=for-the-badge&color=00eaff">
  <img src="https://img.shields.io/github/issues/KaganAk71/WebDraw?style=for-the-badge&color=ffe600">
  <img src="https://img.shields.io/github/license/KaganAk71/WebDraw?style=for-the-badge&color=7CFF00">

<br/><br/>
*A professional, zero-install, lightweight and infinite-canvas web sketching tool!*
<br/>
*Profesyonel, kurulum gerektirmeyen, hafif ve parça mimarisiyle çalışan sonsuz tuval!*
</div>

---

<h2 id="english">🇬🇧 English Version</h2>

**Web Draw** is a feature-rich, client-side drawing and annotation application built purely with HTML5 Canvas, Vanilla JavaScript, and CSS3. It features an infinite canvas, a premium Mac-style UI, multiple drawing tools, dynamic grid backgrounds, and much more.

### 🌟 Features
- **Infinite Canvas:** Uses a heavily optimized chunked-raster memory architecture. Draw limitlessly without performance lags.
- **Hardware Pan & Zoom:** Use `Middle Mouse` or `Spacebar` to pan, and the `Mouse Wheel` to smoothly zoom.
- **Tools:** Pen (various dynamic brushes), Transparent Pen, Eraser, Blur Smudge Tool, Text, and Geometric Shapes.
- **Mac-style UI:** Beautiful glassmorphism panels, dark/light theme, and dynamic cursors.
- **No Dependencies:** Built completely with Vanilla JS ES2022. No React, no bundlers!

### 🛠️ Technologies Built With
- **HTML5 Canvas** (2D Context & Virtual Camera)
- **Vanilla JavaScript** (ES2022 Modules)
- **CSS3** (Custom Properties, Flexbox, UI glassmorphism)

### 🚀 Installation
1. Clone the repository: `git clone https://github.com/KaganAk71/WebDraw.git`
2. Run any static server (e.g., Python): `python3 -m http.server 8000`
3. Navigate to `http://localhost:8000` on your browser!

### 📖 Usage
- **Space + Drag** or **Middle click:** Pan around the infinite canvas.
- **Mouse Wheel:** Zoom in and out.
- **Right Click:** Erase instantly or pan (configurable in settings).
- **Shortcuts:** `H` (Hand), `P` (Pen), `E` (Eraser), `B` (Blur), `T` (Text), `R` (Shape), `S` (Settings).

### 🗺️ Roadmap
- [x] Infinite Canvas & Chunked memory rendering
- [x] Dynamic Grid Backgrounds
- [x] Blur, Shape, and Text tools
- [ ] Browser Extension packaging (Manifest V3)
- [ ] Collaboration / Multi-player support

### 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<h2 id="türkçe">🇹🇷 Türkçe Versiyon</h2>

**Web Draw**, yalnızca HTML5 Canvas, Vanilla JavaScript ve CSS3 ile saf (pure) olarak geliştirilmiş, performanslı bir web çizim motorudur. Sonsuz bir tuval altyapısına, şık Mac tarzı bir arayüze ve eksiksiz çizim araçlarına sahiptir.

### 🌟 Özellikler
- **Sonsuz Tuval (Infinite Canvas):** Belleği yormayan `Chunked-Raster` (Parçalı Raster) mimarisi. Donmadan sınırsızca çizin.
- **Donanımsal Kaydırma & Yakınlaştırma:** Kaydırmak (pan) için `Boşluk (+ Sol Tık)` ya da `Orta Tuş` kullanın. Pürüzsüz yakınlaştırma için `Fare Tekerleği`ni kullanın.
- **Araçlar:** Kalem (Tükenmez, kurşun, fosforlu, suluboya vb.), Silgi, Bulanıklaştırma (Blur), Metin ve Geometrik Şekiller.
- **Gelişmiş Arayüz:** Karanlık/aydınlık (Dark/Light) tema, cam efektleri (glassmorphism) ve dinamik imleç.
- **Sıfır Bağımlılık (No Dependencies):** React veya paketleyici (Webpack vs.) gerektirmez. Saf Vanilla JS.

### 🛠️ Kullanılan Teknolojiler
- **HTML5 Canvas** (2D Render Motoru ve Sanal Kamera)
- **Vanilla JavaScript** (ES2022 Modüler Yapı)
- **CSS3** (Renk Değişkenleri, Flexbox, UI Cam Efekti)

### 🚀 Kurulum & Kullanım
1. Repoyu klonlayın: `git clone https://github.com/KaganAk71/WebDraw.git`
2. Herhangi bir statik sunucu ile başlatın: `python3 -m http.server 8000`
3. Tarayıcınızda `http://localhost:8000` adresine gidin. Bütün sistem bu kadar!

### 📖 Kısayollar
- **Pan (El Aracı):** `Boşluk tuşuna basılı tutun` veya farenizin orta topuna basılı tutun.
- **Diğerleri:** `H` (El), `P` (Kalem), `E` (Silgi), `B` (Bulanıklaştırma), `T` (Yazı), `R` (Şekiller), `S` (Ayarlar).

### 🗺️ Yol Haritası (Roadmap)
- [x] Parçalı Sonsuz Tuval (Chunked rendering) Mimarisinin Kurulması
- [x] Dinamik Kılavuz (Grid) Çizgileri 
- [x] Yeni Araçlar (Şekil, Metin, Blur)
- [ ] Google Chrome & Edge Eklentisi (Extension) Paketlemesi
- [ ] Gerçek Zamanlı Çoklu Oyuncu (Multiplayer) Desteği

### 🤝 Nasıl Katkı Sağlanır?
Açık kaynak dünyasını yaşatan şey sizlerin katkılarıdır! İstediğiniz özelliği eklemekte özgürsünüz.
1. Projeyi Forklayın
2. Yeni bir dal (branch) açın (`git checkout -b ozellik/YeniOzellik`)
3. Yaptığınız değişiklikleri commit edin (`git commit -m 'Yeni bir özellik eklendi'`)
4. Dalınızı (branch) Pushlayın (`git push origin ozellik/YeniOzellik`)
5. Bir "Pull Request" (PR) oluşturun.

---

<br/>

## 📈 Star History

<a href="https://www.star-history.com/?repos=KaganAk71%2FWebDraw&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/image?repos=KaganAk71/WebDraw&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/image?repos=KaganAk71/WebDraw&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/image?repos=KaganAk71/WebDraw&type=date&legend=top-left" />
 </picture>
</a>

<br/>

## 🧑‍💻 Developer

**KağanAk** 🔗 [https://github.com/KaganAk71](https://github.com/KaganAk71)  
*Biz Türk Yazılımcılarıyız 🇹🇷💻*  
*We are Turkish Coders 🇹🇷💻*

Deneyap Atölyelerinde kurulduk ve şimdi burada projelerimizi geliştiriyoruz.  
Sizlerin desteğiyle daha da iyisini yapacağız.

We were founded in the Deneyap Workshops, and we are now developing our projects here.  
With your support, we will become even better.

**🔥 Made with passion by Turkish Coders**  
*Your Code. Your Freedom.*

---

### ❤️ Destek / Support
Eğer bu projeyi beğendiyseniz sağ üstten yıldız (`Star ⭐️`) vererek destek olabilirsiniz! Desteğiniz bizim için çok önemli.
If you like this project, please consider giving it a `Star ⭐️` on GitHub to show your support!
