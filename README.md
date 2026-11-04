# Inventory v2.5.6

Perubahan:
- Gradasi tombol proses dibuat menyatu: merah 15%, biru 70%, kuning 15%, dengan transisi lembut.
- Arah gradasi dari kiri bawah menuju kanan atas (`/`), 30° di atas garis horizontal.
- CSS sudut aksen dan override gradasi lama yang tidak lagi dipakai dibersihkan; pseudo-element aksen dinonaktifkan.
- Versi aplikasi dan cache Service Worker dinaikkan ke v2.5.6.

Ekstrak ZIP ini; `index.html`, `app.js`, `styles.css`, dan `sw.js` berada langsung di folder utama.

Perbaikan BRD: elemen status mesin BRD diberi ID unik `brdEngineStatus`, sehingga proses konversi tidak lagi menulis textContent ke elemen null akibat ID status ganda/tidak cocok.
