# Inventory v2.8.7

## v2.8.7 — Indikator progress PO EXPIRED
- Progress PO EXPIRED ditampilkan pada halaman utama saat menyiapkan sumber data dan saat tombol proses di popup dijalankan.
- Tombol proses di popup dinonaktifkan sementara agar proses tidak dijalankan berulang.
- Logika perhitungan PO EXPIRED tidak diubah; hanya status/progress dan pengaturan alur UI yang ditambahkan.

## v2.8.6 — Penyederhanaan Raw Material dan progress proses/upload
- Menghapus panel sumber, status, dan tombol proses yang ditandai pada popup Raw Material; popup kini fokus menampilkan hasil tabel.
- Tombol RAW MATERIAL di halaman utama langsung memulai proses. Jika sumber belum lengkap, aplikasi menampilkan sumber yang kurang pada status utama dan membuka Daftar File.
- Progress proses Raw Material ditampilkan di halaman utama, dengan tahapan dan persentase selama perhitungan berjalan.
- Progress upload file ditampilkan pada halaman utama dan popup Daftar File, termasuk nama file yang sedang dibaca dan persentase total.
- Daftar file kategori Bahan menggunakan dua kolom, termasuk pada layar ponsel.
- Perhitungan inti Raw Material dipertahankan; proses rekap/detail dijalankan bertahap agar progress dapat diperbarui tanpa membekukan tampilan.
- Tombol + Pilih Folder dan + Pilih File tetap berupa teks bergaris bawah.
- Cache Service Worker dan referensi aset diperbarui ke v2.8.6.

# Inventory v2.8.5

## v2.8.5 — Perbaikan POMGG.CSV dan tombol file
- File bernama POMGG.CSV langsung dipetakan sebagai POM G113 saat diunggah, tanpa menjalankan pemindaian CSV tambahan yang berat.
- Pemrosesan POM tetap memakai parser POM utama Inventory.
- Tombol + Pilih Folder dan + Pilih File menggunakan gaya teks tanpa kotak, tetap bergaris bawah.
- Cache Service Worker dan referensi aset diperbarui ke v2.8.5.
- Logika perhitungan Inventory dan Raw Material tidak diubah.

# Inventory v2.8.3

## v2.8.3 — Label tautan tambah file
- Mengubah label di pojok kanan atas popup Daftar File menjadi “+ Pilih Folder” dan “+ Pilih File”.
- Kedua kontrol tetap berupa teks tanpa kotak/background/border, dengan garis bawah.
- ID tombol, event handler, dan fungsi pemilihan file/folder tidak diubah.
- Cache Service Worker diperbarui ke v2.8.3.

# Inventory v2.8.1

## v2.8.0 — Ikon header diperbesar dan dipindahkan
- Ikon aplikasi diperbesar dan ditempatkan di pojok kanan bawah header, menempel pada garis/border header.
- Pencerminan horizontal kanan-kiri tetap dipertahankan.
- Perubahan hanya pada CSS header; JavaScript aplikasi dan template Excel tidak diubah.

# Inventory v2.8.0

## v2.7.6 — Penyesuaian header, popup file, dan ikon menu
- Menghilangkan panel gelap di belakang ikon aplikasi pada hero; gambar ikon ditampilkan tanpa bingkai/background CSS.
- Di halaman awal hanya tersisa tautan teks bergaris bawah “Daftar File”.
- Tombol “Pilih Folder” dan “Pilih File” dipindahkan ke pojok kanan atas header popup Daftar File Inventory. ID tombol dipertahankan agar event handler tetap bekerja.
- Ikon pada tujuh tombol menu utama tidak lagi memakai kotak/shape; ukuran ikon dan teks diperbesar tanpa mengubah tinggi, padding, atau susunan kartu menu.
- Logika aplikasi, app.js, template Excel, dan alur proses tidak diubah.

# Inventory v2.7.6

## v2.7.6 — Header Command Center dirapikan
- Menghapus header lama agar tidak tampil ganda dengan Command Center.
- Mengganti emblem dekoratif dengan ikon aplikasi Inventory yang sebenarnya.
- Menghapus kalimat tagline di hero.
- Memindahkan versi aplikasi ke pojok kanan atas hero.
- Mengganti jumlah modul dengan akses teks bergaris bawah: Pilih File, Pilih Folder, dan Daftar File.
- Memindahkan kontrol pemilih file/folder yang sudah ada tanpa mengubah ID maupun event handler.
- app.js, template Excel, fungsi, dan alur proses tidak diubah.

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


## v2.7.6 — Inventory Command Center Home
- Memperbarui tampilan halaman awal dengan hero panel bertema cyberpunk neon green, identitas sistem, dan ringkasan 7 modul.
- Memperjelas kartu menu dengan ikon, deskripsi singkat, dan indikator arah; layout tetap responsif untuk ponsel.
- Semua ID tombol, event handler, dan urutan modul dipertahankan. Tidak mengubah app.js, template Excel, atau logika proses.
- Memperbarui versi stylesheet dan cache Service Worker ke v2.7.6.


## v2.8.0 — Horizontal flip header icon
- Mengubah pencerminan ikon header dari vertikal (atas-bawah) menjadi horizontal (kanan-kiri) menggunakan scaleX(-1).
- Posisi, ukuran, dan layout ikon tetap sama.
- Tidak mengubah app.js, template, atau alur fungsi aplikasi.
- Memperbarui versi stylesheet dan cache Service Worker ke v2.8.0.


## v2.8.0 — Home spacing and PO Expired compact layout
- Menghapus label LOCAL WORKSPACE dan SELECT MODULE pada halaman awal.
- Menambah jarak antar kartu/tombol menu utama.
- Memperbaiki aturan `hidden` pada bagian Hasil PO Expired agar tidak muncul sebelum ada hasil.
- Popup PO Expired kini mengikuti tinggi konten, dengan batas maksimum layar dan scroll bila konten panjang; ruang kosong bawah dikurangi.
- Tidak mengubah logika JavaScript, ID kontrol, maupun template Excel.


## v2.8.1 — Integrasi Raw Material
- Menambahkan menu RAW MATERIAL sebagai satu tombol pada Command Center.
- Menggunakan Master Stock yang dibentuk dari sumber Inventory (PRODMAST dan data terkait), tanpa upload Master Stock terpisah.
- PLU.csv terdeteksi dari struktur kolom dan masuk kategori Bahan.
- LPP vs Plano yang sudah ada digunakan sebagai sumber LPP; Planogram Display dan Storage dikenali dari header kolom dan masuk kategori Tarikan LWA.
- Proses Raw Material menampilkan pemeriksaan kelengkapan sumber dan hasil dua tabel dalam popup, dengan ekspor terpisah.
- Mesin perhitungan Check Raw Material dipindahkan tanpa mengubah rumus pembentukan dua tabel.
