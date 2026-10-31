# Inventory PWA — v1.7.1

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


## Verifikasi lokasi STM (v1.5.4)
- Baris lokasi STM dipetakan per PRDCD dan lokasi 01/02/03; jika ada baris duplikat tanpa lokasi dan baris lain berisi lokasi, baris berisi lokasi diprioritaskan.
- Sebelum ekspor, aplikasi memeriksa bahwa lokasi valid dari STM lokasi 01 tidak hilang pada kolom LT/RAK/BAR/CELL. Jika ditemukan kehilangan, proses dibatalkan dan PRDCD contoh ditampilkan.
- Jika PRDCD 10000021 tersedia pada sumber, aplikasi melakukan uji silang LT/RAK/BAR/CELL terhadap STM dan mencatat hasilnya di log proses.


## v1.5.4 — Penyederhanaan antarmuka
- Daftar file ringkas: nama file dan status.
- MASTER STOCK dan STOCK OUT diproses melalui tombol terpisah.
- Setiap tombol hanya menjalankan proses dan mengunduh hasilnya sendiri.


Versi 1.4.8: upload file Stock Out DC.xlsx terakhir sebagai workbook lanjutan; proses STOCK OUT menambahkan sheet tanggal berikutnya ke workbook yang diunggah. Tombol proses disembunyikan sebelum ada file sumber yang diunggah.


## v1.5.4 — Integrasi Konversi BRD
- File BRD dapat diunggah melalui bagian File sumber yang sama dengan sumber inventory.
- Mendukung beberapa file BRD sekaligus; seluruhnya digabung mengikuti aturan penggabungan aplikasi Konversi BRD asli.
- Tombol BRD menjalankan keluaran BRD DBF/CSV, MSTG atau MSTXH/MSTD DBF, ALOKASI CSV, BPB CSV, dan NPB CSV.
- Mesin konversi mempertahankan kode konversi asli Konversi-BRD-main. Tidak ada upload BRD terpisah.


## v1.5.5 — Perbaikan Service Level 3 gudang
- Baris POM dengan RECID = 1 dikeluarkan dari perhitungan Service Level.
- Periode PO_DATE adalah 14 hari kalender sebelum tanggal proses, tidak termasuk tanggal proses (contoh proses 30 Oktober: 16–29 Oktober).
- Service Level dihitung dari total BPB_QTY dibagi total QTY (PO) per PRDCD dan gudang.
- Jika total PO tidak tersedia/nol atau data PRDCD tidak valid, hasil ditampilkan NO PO. BPB nol dengan PO positif menghasilkan 0, bukan NO PO.


## v1.5.6 — SL Supplier G113
- Tombol SL SUPPLIER menggunakan workbook SL Supplier ke DC yang diunggah sebagai file lama, seperti alur Stock Out DC.
- Daftar PRDCD dan variabel master (DESC2, DIV, FRAC, FK, ACOST, PKM, SUPCO, SNAMA) disegarkan mengikuti hasil perhitungan MASTER STOCK.
- Data harian tanggal 1 sampai H-2 dipertahankan dari workbook lama; kolom H-1 diperbarui dari Service Level G113 dengan aturan POM yang sama seperti MASTER STOCK.
- PLU yang tidak ada dalam MASTER STOCK dikeluarkan; PLU baru ditambahkan dengan histori kosong. Sheet bulan yang sesuai harus sudah tersedia dan tidak dibuatkan sheet baru.


## v1.5.8 — BPB Supplier
- Menambahkan role upload Rekap Supplier (.xlsx) dan LRBPB_SUPPLIER (.csv).
- Tombol BPB SUPPLIER membuat sheet tanggal baru berdasarkan sheet tanggal terakhir.
- Data transaksi dijumlahkan per PLU: QTY dan GROSSPLUSPPN.
- DESC dan DIV dilengkapi dari PRODMAST (fallback dari sheet sebelumnya); SUPCO dan nama supplier diambil dari LRBPB_SUPPLIER.
- Sheet REKAP diperbarui untuk jumlah supplier unik, jumlah PLU, dan total nominal Gross + PPN.
- Nama output mengikuti pola `Rekap Supplier <Bulan> <Tahun>.xlsx`.


## v1.5.8 — Stock Out menggunakan workbook upload
- STOCK OUT memakai file Stock Out DC terakhir yang diunggah sebagai workbook dasar; tidak memakai template terpisah bawaan aplikasi.
- Sheet tanggal baru menyalin struktur dan format dari sheet tanggal terakhir.
- Rentang tabel, format setiap kolom, dan auto-filter diperluas sampai baris data terakhir yang dihasilkan.

## v1.5.9 — Perbaikan perhitungan H-1 SL Supplier
- Perhitungan H-1 SL SUPPLIER G113 dilakukan langsung dari POM G113, bukan mengambil hasil kolom SL dari proses MASTER STOCK.
- Hanya RECID = 1 yang dikecualikan; RECID H dan R tetap dihitung.
- Periode PO_DATE: tanggal proses dikurangi 14 hari sampai H-1, inklusif.
- BPB_QTY kosong dihitung 0; PO ditemukan dengan BPB 0 menghasilkan 0, bukan NO PO.

## v1.6.0 — Pengelompokan daftar file sumber
- Daftar file sumber dikelompokkan menjadi Bahan, Tarikan Harian, Tarikan LWA, File Update, dan Depo.
- Urutan kelompok mengikuti urutan tersebut.

## v1.6.1–v1.6.2 — Status tombol proses dan notifikasi
- Notifikasi keberhasilan proses utama dipersingkat.
- Saat satu proses berjalan, tombol proses lain dikunci agar tidak menjalankan proses bersamaan.
- Tampilan aktif hanya diberikan kepada tombol proses yang sedang dijalankan; tombol lain tidak ikut tampak ditekan.

## v1.6.3 — Perbaikan ekspor SL Supplier
- Perbaikan penulisan nilai ke sel Excel yang sebelumnya kosong agar nilai hasil pembaruan dapat dibaca dengan benar.

## v1.6.4 — Validasi PRDCD pada BPB Supplier
- Hanya PRDCD/PLU yang terdiri dari tepat 8 digit yang disertakan dalam hasil rekap BPB Supplier.
- PRDCD dengan panjang atau format lain dilewati; angka nol di depan tetap dipertahankan.

## v1.6.5 — Status seluruh file upload
- Daftar upload menampilkan seluruh file yang dibutuhkan, termasuk yang belum diunggah.
- Status file ditampilkan sebagai Terunggah atau Belum, dengan pengelompokan tetap dipertahankan.
- File HPG dimasukkan ke kelompok Tarikan Harian.

## v1.6.6 — Penyegaran tampilan tombol dan header
- Background/shape di belakang simbol tombol proses dihilangkan.
- Aksen merah dan kuning diterapkan pada tombol.
- Teks header diberi outline putih.

## v1.6.7 — Penyempurnaan aksen tombol proses
- Kelima tombol proses (MASTER STOCK, STOCK OUT, SL SUPPLIER, BPB SUPPLIER, dan BRD) menampilkan aksen merah di sisi kiri serta aksen merah-kuning di sisi bawah.
- Warna dasar tombol dan simbol tanpa background tetap dipertahankan.



## v1.6.8 — Perbaikan instalasi PWA desktop
- Manifest menggunakan `start_url` dan `scope` relatif terhadap direktori aplikasi, sehingga sesuai untuk GitHub Pages project site `/Inventory/`.
- Mode tampilan instalasi menggunakan `standalone`.
- Menambahkan ikon PNG khusus 192 × 192 dan 512 × 512 untuk persyaratan instalasi Chrome desktop.
- Cache Service Worker diperbarui ke v1.6.8 dan mencakup kedua ikon instalasi baru.


## v1.7.1 — Perbaikan instalasi Android
- Manifest menggunakan ID, `start_url`, dan `scope` absolut `/Inventory/` agar konsisten dengan GitHub Pages pada subpath repository.
- Ikon instalasi 192×192 dan 512×512 dibuat ulang dengan logo lebih jelas dan latar belakang solid.
- Ditambahkan ikon 512×512 khusus `maskable` untuk launcher Android.
- Cache Service Worker dinaikkan ke v1.7.1 dan mencakup seluruh ikon PWA.


## v1.7.1
- Memperbaiki pemilihan ekspor BRD dari dialog Inventory: mesin konversi kini memakai daftar jenis ekspor yang dikirim langsung oleh dialog, bukan status checkbox internal yang berpotensi tertinggal.
- Hanya jenis file yang dicentang pengguna yang diproses dan diunduh.
