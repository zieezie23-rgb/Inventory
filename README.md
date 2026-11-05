# Inventory v2.7.2

## v2.7.2 — Hilangkan latar bidang pada bagian No PO dan Hasil PO Expired
- Bagian No PO yang dicek (1) dan Hasil (2) dibuat transparan; bidang hijau muda yang mengganggu dihilangkan.
- Tidak mengubah ukuran, jarak, struktur HTML, JavaScript, maupun alur kerja.
- Cache Service Worker dan query stylesheet dinaikkan ke v2.7.2.


## v2.7.1 — Link pemilih file tanpa shape dan perapihan PO Expired
- Semua tombol memakai tampilan panel hijau gelap, outline neon, dan aksen neon di bagian bawah.
- Ukuran, padding, font-size, min-height, width, serta layout tombol yang sudah ada dipertahankan.
- Deklarasi skin tombol lama dibersihkan; app.js dan alur kerja tidak diubah.


## v2.7.1 — Perapihan tema dan kontrol
- Menghapus kedua blok `<style>` inline dari HTML.
- Memindahkan stylesheet PO Expired ke `styles.css` dan menggabungkannya dalam satu file stylesheet.
- Menghapus blok override global v2.6.8 yang sebelumnya menimpa CSS lama.
- Mengganti palet biru/merah/kuning lama pada komponen dialog, tombol, panel, dan progress menjadi palet Anime Cyberpunk Neon Green pada deklarasi sumbernya.
- Cache Service Worker dan query stylesheet dinaikkan ke v2.7.1.


## v2.6.8 — Tipografi tanpa putih dan tombol utama lebih lega
- Seluruh teks antarmuka dipaksa mengikuti palet hijau neon; tidak menggunakan teks putih.
- Jarak antar tombol utama diperbesar.
- Tinggi tombol utama ditambah untuk desktop dan mobile.
- Fungsi aplikasi, struktur data, dan template tetap dipertahankan.

# Inventory v2.6.6

## v2.6.6 — Audit konsistensi tema Anime Cyberpunk Neon Green
- Menetralkan sisa palet tema lama (biru, merah, kuning) pada header, panel, tombol proses, dialog, tabel, dan modul PO Expired.
- Menyamakan tampilan modul PO Expired dengan palet gelap dan aksen neon hijau.
- Memperbarui warna tema PWA dan cache stylesheet.
- Fitur, alur proses, dan format data tetap dipertahankan.

## v2.6.5 — Check Item terintegrasi dan tema Anime Cyberpunk
- Tombol Check Item terintegrasi langsung pada halaman Inventory.
- Tema gelap dengan aksen neon hijau, efek grid/scanline, panel futuristik, dan tombol bercahaya.
- Fitur dan format data tetap dipertahankan.

Ekstrak ZIP ini; `index.html`, `app.js`, `styles.css`, dan `sw.js` berada langsung di folder utama.


## v2.6.8 theme correction
- Final Anime Cyberpunk Neon Green override is loaded after embedded legacy styles, including PO Expired.
- Replaced remaining legacy white/blue/red/yellow UI surfaces with coordinated dark green neon styling (semantic warning/error colors retained).
- Increased home action button height and spacing.
- Header, footer, CSS query, and Service Worker cache version synchronized to v2.6.8.
