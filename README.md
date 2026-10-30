# Inventory PWA — v1.5.0

Aplikasi PWA pemrosesan lokal untuk menyusun 77 kolom Master Stock berdasarkan sumber yang dipilih. Ekspor menjadi `.xlsx` dengan acuan gaya workbook Master Stock: lebar kolom, judul tanggal, dua baris header, merge cells, border, format sel, serta freeze panes.

## Tanggal proses
Tanggal proses diambil otomatis saat tombol **Proses MSTSTK** dijalankan. Tanggal yang sama digunakan pada judul `MASTER STOCK <TANGGAL>` dan nama file `MASTER STOCK <TANGGAL>.xlsx`.

## Menjalankan
Jalankan melalui hosting HTTPS atau localhost agar Service Worker dan aset offline bekerja. Buka `index.html` langsung melalui `file://` tidak mendukung instalasi PWA secara penuh.

## Catatan
- File diproses di browser perangkat; tidak diunggah ke server.
- File sumber pada versi ini berupa CSV/TXT.
- `TGL RUBAH PTAG` menggunakan tanggal `TGL_AKHIR` terbaru per PRDCD dari `LaporanHistoryTag`.
- G294 dan G295 memakai format sumber yang sama seperti G113 dengan pemetaan terpisah.

Ikon aplikasi PWA menggunakan `assets/icon.png` (ikon aplikasi dan shortcut).


## Ekspor Stock Out DC (v1.2.1)
Unggah `LaporanStokOutDCINew` bersama bahan Master Stock. Setelah proses, unduh file `MASTER STOCK` dan `Stock Out DC` secara terpisah. Stock Out DC memakai workbook acuan `templates/assets-stockout-template.xlsx`, menambahkan sheet tanggal H-1, dan memilih PRDCD yang `STOCK_OUT = Y`. Baris/detail disalin dari sheet tanggal sebelumnya yang tersedia agar format dan strukturnya tetap sama.

## Perbaikan v1.2.5
- Parser CSV diperbaiki agar tanda kutip (`"`) yang muncul di tengah nilai tanpa kutip tidak dianggap sebagai pembuka field kutipan. Ini mencegah banyak baris PRODMAST tergabung menjadi satu dan jumlah item Master Stock terpotong.
- Versi service worker/cache dinaikkan agar perangkat mengambil app.js terbaru.

## Perbaikan v1.2.5
- KEB dibaca sebagai laporan berformat, bukan tabel dengan header rapi. PRDCD/PLU diambil dari kolom B, nilai KEB dijumlahkan dari kolom K per PRDCD, dan jumlah toko dijumlahkan dari kolom Q per PRDCD.


## Perubahan v1.2.5
- Notifikasi hasil proses disembunyikan secara default dan dapat dibuka/tutup melalui tombol.
- Tombol MASTER STOCK dan STOCK OUT DC memakai gaya yang sama, berada di tengah secara horizontal, dan label tombol tidak menampilkan ekstensi .xlsx. Nama file unduhan tetap berekstensi .xlsx.


## Penamaan dan urutan sheet Stock Out DC (v1.2.8)
- Nama file menggunakan bulan dan tahun dari tanggal H-1: `Stock Out DC <bulan> <tahun>.xlsx`.
- Tanggal proses 1 akan menghasilkan file untuk bulan sebelumnya dan sheet tanggal terakhir bulan sebelumnya (misalnya proses 1 November menghasilkan `Stock Out DC Oktober 2026.xlsx`, sheet `31`).
- Tanggal proses 2 akan menghasilkan file untuk bulan berjalan dan memulai urutan sheet dari `01` (misalnya proses 2 November menghasilkan `Stock Out DC November 2026.xlsx`, sheet `01`).
- Pemilihan sheet didasarkan pada tanggal H-1; aset template digunakan sebagai dasar setiap ekspor.


## Verifikasi lokasi STM (v1.5.0)
- Baris lokasi STM dipetakan per PRDCD dan lokasi 01/02/03; jika ada baris duplikat tanpa lokasi dan baris lain berisi lokasi, baris berisi lokasi diprioritaskan.
- Sebelum ekspor, aplikasi memeriksa bahwa lokasi valid dari STM lokasi 01 tidak hilang pada kolom LT/RAK/BAR/CELL. Jika ditemukan kehilangan, proses dibatalkan dan PRDCD contoh ditampilkan.
- Jika PRDCD 10000021 tersedia pada sumber, aplikasi melakukan uji silang LT/RAK/BAR/CELL terhadap STM dan mencatat hasilnya di log proses.


## v1.5.0 — Penyederhanaan antarmuka
- Daftar file ringkas: nama file dan status.
- MASTER STOCK dan STOCK OUT diproses melalui tombol terpisah.
- Setiap tombol hanya menjalankan proses dan mengunduh hasilnya sendiri.


Versi 1.4.8: upload file Stock Out DC.xlsx terakhir sebagai workbook lanjutan; proses STOCK OUT menambahkan sheet tanggal berikutnya ke workbook yang diunggah. Tombol proses disembunyikan sebelum ada file sumber yang diunggah.


## v1.5.0 — Integrasi Konversi BRD
- File BRD dapat diunggah melalui bagian File sumber yang sama dengan sumber inventory.
- Mendukung beberapa file BRD sekaligus; seluruhnya digabung mengikuti aturan penggabungan aplikasi Konversi BRD asli.
- Tombol BRD menjalankan keluaran BRD DBF/CSV, MSTG atau MSTXH/MSTD DBF, ALOKASI CSV, BPB CSV, dan NPB CSV.
- Mesin konversi mempertahankan kode konversi asli Konversi-BRD-main. Tidak ada upload BRD terpisah.
