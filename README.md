## v5.0.7 — Non Dry berdasarkan Dept
- KET "Non Dry" pada Check Item Tidak Bergerak: ZONA kosong atau 0 dan Dept 4 (digit pertama CAT_COD), bukan lagi berdasarkan DIV.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.7.

## v5.0.6 — Non Dry pada Check Item Tidak Bergerak
- KET "Non Dry" kini berlaku untuk semua item yang ZONA-nya kosong atau 0, tanpa melihat DIV (sebelumnya harus DIV 4).
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.6.

## v5.0.5 — Format kolom DSI pada export Excel Barang Baru & Open TAG
- Kolom DSI memakai format akuntansi yang sama dengan kolom angka lain, dengan 2 digit di belakang koma: `_(* #,##0.00_);_(* [RED](#,##0.00);_(* "-"??_);_(@_)`.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.5.

## v5.0.4 — KET1/KET2 Barang Baru & Open TAG dan format Excel
- KET1 "Sisa Stock Masih ada xx%" diganti menjadi "Stock exist masih >50% dari BPB"; perhitungan KET1 tidak berubah.
- KET2 untuk KET1 "Belum pernah NPB ke toko": Belum Ada JTD Toko, PKM Toko 0 (Nol), Over Stock di Toko, dan jika JTD toko ada menjadi "Sudah ada JTD Toko tetapi belum ada PB Toko".
- KET2 untuk KET1 "Stock exist masih >50% dari BPB" menjadi "Keluar bertahap sesuai PB toko".
- Export Excel: kolom FRAC, ACOST, QTY BPB, STOCK, JTD, OVER, PKM 0, dan Est Kebutuhan memakai format akuntansi `_(* #,##0_);_(* [RED](#,##0);_(* "-"??_);_(@_)`.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.4.

## v5.0.3 — Penyempurnaan tampilan
- Layar lebar (sidebar Daftar File aktif): tombol Daftar File di pojok kanan atas Menu Operasional disembunyikan.
- Ekspor ALOKASI RAW: isi kelseasonal.csv di dalam Item Raw.zip seluruhnya huruf kapital.
- Footer dibuat transparan (tanpa latar, bayangan, dan blur).
- Mode aplikasi desktop (PWA): title bar/status bar dibuat transparan memakai window controls overlay; area atas tetap bisa dipakai untuk memindahkan jendela.
- Teks header INVENTORY COMMAND CENTER diberi efek glitch (dimatikan otomatis bila perangkat memilih kurangi animasi).
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.3.

## v5.0.2 — Penyempurnaan Check Item
- KET2 menggunakan tiga klasifikasi utama: Belum Ada JTD Toko, PKM Toko 0 (Nol), dan Over Stock di Toko. Item yang tidak memenuhi ketiganya diklasifikasikan sebagai “Keluar bertahap sesuai kebutuhan Toko.”
- Kesimpulan mempertahankan header dan tanggal, lalu mengelompokkan rincian berdasarkan KET1 dan KET2. Kategori tanpa item tidak ditampilkan.
- Rincian ekspor Excel memuat KET1, KET2, dan Jumlah Item.
- Penanda versi halaman, JavaScript, manifest, cache Service Worker, serta referensi aset JavaScript diperbarui ke v5.0.2.

## v4.9.9 — Penyatuan Modul PO EXPIRED

- Menetapkan implementasi PO EXPIRED yang tertanam di `index.html` sebagai satu-satunya sumber kode aktif.
- Menghapus `inline-check.js` yang tidak direferensikan oleh halaman maupun Service Worker.
- Tidak mengubah rumus, alur pemeriksaan, maupun tampilan PO EXPIRED.
- Menyinkronkan penanda versi dan identitas cache PWA ke v4.9.9.

## v4.9.9 — Pengaturan Font per Kategori dan Popup Tema Matrix

- Pengaturan ukuran font dipisah menjadi Header/Judul, Daftar Menu, Daftar File, Pop-up Login, dan Lain-Lain.
- Lain-Lain menjadi satu skala global untuk semua area selain empat kategori khusus, termasuk notifikasi.
- Daftar kategori menggunakan popup khusus bertema Matrix, bukan dropdown bawaan Android/WebView.
- Skala ukuran tetap bertambah/berkurang 5% melalui tombol − dan +.

## v4.9.9 — Sinkronisasi Versi dan Penyempurnaan Login
- Menyinkronkan penanda versi aplikasi pada halaman, footer, JavaScript, manifest, dan Service Worker ke v4.9.9.
- Cache PWA menggunakan identitas rilis v4.9.9 agar pembaruan terdeteksi.
- Pengaturan ukuran font per bagian dengan tombol −/+ dalam kenaikan 5%.
- Pada halaman terkunci, form login disembunyikan sampai latar diklik.
- Login tidak membedakan huruf besar dan kecil.

## v4.9.3 — Tombol Pengaturan Terlihat di Header

- Memposisikan ikon roda gigi secara absolut di pojok kanan atas kartu header agar tidak terdorong keluar oleh tata letak flex dan elemen ilustrasi.
- Ikon tetap tanpa kotak, border, maupun background; area sentuh 44×44 px.

## v4.9.2 — Penyempurnaan Pengaturan Font

- Daftar font menampilkan nama font langsung menggunakan tipografi font masing-masing.
- Rentang ukuran font aplikasi diperluas menjadi 50%–150%.

## v4.9.0 — Pengaturan Font
- Menambahkan tombol Pengaturan pada header utama.
- Pengguna dapat memilih font TTF/OTF yang terdeteksi otomatis dari folder `assets/fonts/`.
- Pilihan font disimpan di perangkat dan diterapkan ke seluruh antarmuka.
- Untuk menambahkan font, cukup unggah file `.ttf` atau `.otf` ke `assets/fonts/`. GitHub Actions akan membuat ulang `fonts.json` secara otomatis; tidak perlu mengedit JSON.
- Font default: `font.ttf` (Drobix Extrude).

## v4.9.0 — Font Drobix Extrude
- Font utama diganti menjadi Drobix Extrude dan disimpan sebagai `assets/fonts/font.ttf`.
- CSS diseragamkan agar elemen antarmuka menggunakan font Drobix Extrude dari `font.ttf`, termasuk tombol, tabel, popup, menu, dan formulir.
- Nomor versi dan cache Service Worker diperbarui ke v4.9.0.

Untuk mengganti font, cukup timpa `assets/fonts/font.ttf` dengan file TTF baru bernama sama.
## v4.8.0 — Font Shizenko Japan Demo
- Mengganti font utama antarmuka dengan Shizenko Japan Demo.
- Menyinkronkan nomor versi aplikasi, header, footer, JavaScript, manifest, parameter aset, dan cache Service Worker ke v4.8.0.

## v4.8.0 — Teks sidebar satu baris
- Semua teks di sidebar Daftar File satu baris (tanpa wrap); nama yang panjang dikecilkan otomatis satu per satu sampai muat. Versi disinkronkan ke 4.8.0.

## v4.7.8 — Lebar sidebar Daftar File 1/5 halaman
- Sidebar Daftar File selebar 1/5 lebar layar (20vw); sisanya untuk menu operasional. Font, judul, dan tombol di sidebar mengecil mengikuti lebar. Versi disinkronkan ke 4.7.8.

## v4.7.7 — Daftar File sebagai sidebar
- Layar lebar (>=1280px): Daftar File tampil sebagai sidebar tetap di kiri (bukan popup) dan halaman utama bergeser ke kanan; tombol Pilih Folder dan Pilih File ada di pojok kanan atas sidebar.
- Isi sidebar 3 kolom (Tarikan Harian G113 | G294 | G295, lalu Bahan | Tarikan LWA | File Update); ukuran font dan tinggi baris menyesuaikan tinggi layar sehingga pas satu layar tanpa scroll.
- Sidebar bisa dikecilkan ke samping lewat tab di tepi sidebar atau tombol Kecilkan; pilihan tersimpan di browser.
- Layar lebih kecil tetap memakai dialog popup. Versi disinkronkan ke 4.7.7.

## v4.7.6 — Tampilan Daftar File dan layar lebar
- Daftar File: semua teks huruf kapital; label PROMO dan nama file promo ditampilkan tanpa ekstensi .xlsx.
- Layar lebar: menu operasional 4 kolom (sebelumnya 5), ukuran layar tidak berubah.
- Versi aplikasi, header/footer, manifest, parameter aset, dan cache service worker disinkronkan ke 4.7.6.

## v4.7.5 — Batas qty Alokasi Raw
- Qty alokasi per baris (toko + PRDCD) dibatasi maksimal 999, dibulatkan turun ke kelipatan Minor (contoh Minor 400 menjadi maksimal 800).

## v4.7.4 — Alokasi Raw digabung ke app.js
- Kode alokasi-raw.js dipindahkan ke app.js sebagai satu bagian terpisah (dibungkus IIFE sendiri) agar tidak bertabrakan dengan modul lain; file alokasi-raw.js dihapus.
- Dialog ALOKASI RAW kini hanya berisi isian x Minor dan tombol Hitung Alokasi; bagian upload dihapus.
- Target dan Plan masuk ke Daftar File (grup Bahan) dan diunggah lewat tombol upload yang sudah ada; jenis file dikenali dari kolom (Target: TOKO, PRDCD, TARGET, NPB; Plan: TOKO dan PLAN PICKING).
- Master Stock tidak perlu diunggah ulang: Minor diambil langsung dari DATAWHS (kolom MINOR_TOKO, lalu MINOR), sumber bahan yang sama dengan Master Stock.
- Stock Akhir diambil dari kolom QTY_LPP file LaporanLPPvsPlano (dijumlah per PLU).
- Isi Item Raw.zip tidak berubah.

## v4.7.3 — Tombol ALOKASI RAW
- Menambahkan satu tombol proses ALOKASI RAW di Menu Operasional yang membuka dialog dengan fungsi aplikasi Alokasi Raw v1.0.0.
- Upload Target, Plan, Stock Akhir, dan Master Stock (jenis file dikenali otomatis); isi x Minor lalu Hitung Alokasi; unduh Item Raw.zip (CSV per PLU + kelseasonal.csv).
- Logika perhitungan disalin apa adanya dari Alokasi Raw v1.0.0 (file baru alokasi-raw.js); pembaca Excel memakai pustaka yang sudah ada di Inventory.
- Grid menu disesuaikan untuk 11 tombol: 4 kolom (≥1280px) dan 6 kolom (≥1600px).

## v4.7.2 — Tampilan layar lebar
- Pada layar ≥1100px halaman utama memakai lebar layar (maks. 1760px), tidak lagi terkunci di kolom 1000px ala HP.
- Menu operasional 3 kolom (≥1100px) dan 5 kolom (≥1280px); hero, ikon, dan tombol diperbesar.
- Dialog Daftar File, Check Item, Raw Material, History, dan PO Expired dilebarkan di desktop.
- Tampilan HP dan tablet tidak berubah.

## v4.7.1 — Format sheet DATA MASTER PB
- Hanya item dengan CATCODE 1-3 yang diproses.
- Sheet DATA berbentuk Excel Table mulai baris 2 (header), data langsung dari baris 3 (baris kosong dihapus); header PKM kedua diberi nama PKM2 agar unik.
- Format per kolom: teks rata tengah (PRDCD, ZONA, ALAMAT, KDSB, PTAG, STOCK OUT), general rata kiri (DESC, KET Promo, Jenis Promo), general rata tengah (CATCODE, FK), tanggal asli dd mmm yy (Awal/Akhir Promo), SL persen, kolom lain format akuntansi dengan negatif merah.
- Kolom STOCK OUT berupa nilai teks (bukan rumus) agar tidak berubah menjadi teks saat sel diedit.
- Promo kosong ditampilkan kosong (bukan 0). Rumus R:AD tetap dipertahankan.

## v4.7.0 — Perbaikan error MASTER PB
- Memperbaiki error "MONTHS_ID is not defined" saat proses MASTER PB: daftar singkatan bulan kini tersedia di scope utama sehingga nama file unduhan (MASTER PB dd Mmm yy.xlsx) dapat dibentuk.
- Menyinkronkan versi aplikasi, header/footer, manifest, parameter aset, dan cache Service Worker ke v4.7.0.

## v4.6.8 — Koreksi merge Kesimpulan Trend Stock dan rentang grafik History

- Menggabungkan kolom Keterangan SL dan Keterangan BPB untuk seluruh lima kategori awal, termasuk SL <100% dan SL 100%.
- Memperbarui rentang kelima grafik di halaman History agar dimulai setelah 14 hari pertama, sehingga konsisten dengan awal periode SL 14 hari yang lengkap.
- Menyinkronkan versi aplikasi, header/footer, manifest, dan cache Service Worker ke v4.6.8.

## v4.6.8 — Koreksi format dan kesimpulan ekspor Excel HISTORY

- PRDCD, ZONA, dan SUPCO diratakan ke tengah pada seluruh sheet HISTORY yang relevan.
- Tabel Σ SUPCO per Keterangan dihapus dari sheet Kesimpulan Trend Stock; tabel jumlah item tetap dipertahankan.
- Keterangan SL dan BPB diratakan ke tengah; kategori Tidak ada PO dan Ada PO tanpa kedatangan menggabungkan kedua kolom keterangan, sedangkan SL 0% tetap terpisah.
- Kolom Keterangan SL yang sama tetap dapat digabung vertikal.
- Tanggal dengan jendela rolling SL yang belum lengkap 14 hari dihilangkan dari sheet History SL dan TREND ekspor.
- Versi aplikasi, header/footer, manifest, dan cache Service Worker disinkronkan ke v4.6.8.

## v4.6.3 — Penyempurnaan ekspor Excel HISTORY
- Format kolom ekspor disesuaikan: PRDCD, Zona, dan SUPCO sebagai teks rata tengah; DESC2, SNAMA, dan keterangan rata kiri; SL dalam format persen; tanggal sebagai nilai tanggal Excel `dd mmm yy`; angka lainnya memakai format angka standar dengan negatif merah.
- Kolom harian mempertahankan format sesuai jenis datanya.
- Sheet Kesimpulan Stock Out tidak lagi menampilkan ringkasan per zona; daftar item ditampilkan lengkap dan dikelompokkan berdasarkan setiap keterangan ringkasan.
- Sheet Kesimpulan Trend Stock memisahkan Keterangan SL dan Keterangan BPB. Keterangan SL berulang digabung vertikal; kedua kolom tetap terpisah, termasuk pada SL 0%.
- Versi aplikasi, header/footer, manifest, dan cache Service Worker disinkronkan ke v4.6.3.

## v4.6.2 — Trend BPB mengikuti tanggal PO
- Trend PO tetap dikelompokkan berdasarkan PO_DATE.
- Trend BPB dikelompokkan berdasarkan PO_DATE dari baris PO asal, bukan BPB_DATE.
- BPB parsial dari satu PO dijumlahkan pada tanggal PO yang sama.
- BPB hanya masuk jika BPB_DATE sudah terjadi sampai tanggal akhir analisis, sehingga penerimaan setelah tanggal analisis tidak ikut dihitung.
- Perhitungan tanggal penerimaan aktual tetap disimpan untuk metrik seperti tanggal BPB terakhir dan analisis arah kedatangan.
- Versi aplikasi, header/footer, manifest, dan cache Service Worker disinkronkan ke v4.6.2.

## v4.6.1 — Koreksi rumus SL HISTORY
- Semua SL harian per tanggal memakai Qty PO dengan tanggal PO H-14 sampai H-1 (14 hari sebelumnya, tidak termasuk tanggal analisa).
- Qty BPB diambil dari baris PO yang sama dan hanya dihitung jika BPB_DATE sudah terjadi sampai tanggal analisa.
- Rumus SL: total Qty BPB ÷ total Qty PO × 100%; tidak menggunakan ACOST atau nilai rupiah.
- Tabel History SL, analisa rolling 14 hari, grafik SL, sheet TREND Excel, serta grafik dan KPI SL PowerPoint memakai dasar perhitungan kuantitas yang sama.
- Grafik Excel menampilkan seluruh tanggal analisa, termasuk 14 tanggal pertama, karena nilai rolling dihitung menggunakan riwayat PO sebelum tanggal tampilan.

## v4.6.1 — Penyesuaian urutan sheet HISTORY
- Sheet **Analisa Stock out** sekarang berada tepat setelah **Analisa 3 Bulan**.
- Urutan styling, format tanggal/persentase, freeze pane, dan grafik pada sheet **TREND** disesuaikan dengan posisi baru.

## v4.6.1 — Penyempurnaan tabel dan grafik HISTORY

- Menghilangkan garis tepi hitam pada area gambar grafik PowerPoint.
- Semua tabel: kolom PRDCD dipersempit dan teks PRDCD rata tengah.
- Hasil Analisa Stock: mulai kriteria SL stabil 100%, keterangan dipisah menjadi Keterangan SL dan Keterangan Kedatangan; nilai SL yang sama digabung vertikal, sedangkan kriteria sebelumnya menggabungkan dua kolom keterangan.
- Tabel Analisis Stock Out per hari dibuat lebih rapat dengan tinggi baris lebih kecil.
- Rasio PowerPoint tetap 4:3.

## v4.5.8 — Satuan KPI PO/BPB diperbaiki
- Nilai PO dan BPB pada grafik serta KPI ditampilkan dalam miliar rupiah.
- Varian PO dan BPB juga menggunakan satuan miliar rupiah.
- Persentase pergerakan tetap dihitung dari total 14 hari pertama dibanding total 14 hari terakhir.
- Sinkronisasi versi aplikasi, manifest, dan cache Service Worker ke v4.5.8.

## v4.5.8 — HISTORY PPT correction pass
- Posisi periode cover diturunkan dan seluruh subjudul slide dihilangkan.
- Teks Pokok Bahasan dan seluruh teks kartu KPI diratakan ke tengah.
- Seluruh nilai penurunan negatif ditampilkan merah, dalam tanda kurung, tanpa tanda minus.
- Slide Hasil Analisa Stock dikembalikan menjadi satu tabel pertama dari sheet `Kesimpulan Trend Stock` (kolom A:G), bukan dua blok tabel.
- Heatmap Stock Out memperbesar teks tanggal dan mempersempit kolom bulan.
- Contoh Stock Out menambahkan kolom SNAMA dan TGL RUBAH PTAG.
- KPI PO/BPB dihitung sebagai total 14 hari pertama dibanding total 14 hari terakhir; urutan kartu PO pada baris pertama dan BPB pada baris kedua.
- Grafik Trend SL menampilkan label SALDO AWAL pada titik valid pertama.
- Rasio PowerPoint tetap 4:3.

## v4.5.8 — HISTORY PPT final layout refinement

- Menghapus footer dan nomor halaman dari seluruh slide PowerPoint.
- Menghapus outline pada gambar grafik agar grafik STOCK, Stock Out, dan SL tampil bersih.
- Mengubah header tabel contoh penurunan Stock menjadi STOCK AWAL, STOCK AKHIR, dan PENURUNAN; nilai ditampilkan dengan akhiran `jt`.
- Nilai negatif pada tabel Hasil Analisa Stock ditampilkan merah dan dalam tanda kurung tanpa tanda minus.
- Tabel contoh Stock Out disusun vertikal dari atas ke bawah, satu tabel untuk setiap kriteria.
- Rasio PowerPoint tetap 4:3.

## v4.5.8 — Revisi layout dan contoh item HISTORY PPT 4:3
- Memperbaiki jarak teks pada slide rumusan masalah agar tidak bertumpuk.
- Menipiskan garis trend STOCK, PO, dan BPB; grid horizontal tetap tipis dan outline grafik dihilangkan.
- Menghapus baris judul/section duplikat pada tabel Hasil Analisa Stock dan Stock Out, menyisakan header kolom.
- Mengubah judul daftar 10 item menjadi “Contoh Item dengan Penurunan Stock Terbesar”.
- Setiap slide contoh Stock Out (3 Bulan, 1 Bulan, 2 Minggu) menampilkan kriteria Tidak ada PO, SL 0%, dan SL ≤ 100%, maksimal 5 item per kriteria, tanpa kolom jumlah hari Stock Out.
- Rasio PowerPoint tetap 4:3; perhitungan dan sumber data HISTORY tidak diubah.

## v4.5.8 — HISTORY PPT analysis detail & chart correction 4:3
- Memperbaiki grafik STOCK: grid horizontal dibuat tipis dan garis trend STOCK dibuat lebih tegas; ketebalan garis tidak lagi terbawa antar-elemen canvas.
- Mempertegas garis trend PO dan BPB serta membedakan warnanya secara konsisten: PO biru dan BPB oranye.
- Menambahkan slide HASIL ANALISA STOCK berisi tabel pertama dari sheet Excel Kesimpulan Trend Stock.
- Menambahkan slide HASIL ANALISA STOCK OUT berisi tabel kriteria dan jumlah item dari sheet Excel Kesimpulan Stock Out.
- Mengubah contoh penurunan Stock menjadi tabel 10 item dengan penurunan terbesar.
- Mengubah contoh Stock Out menjadi tabel maksimal 5 item untuk masing-masing kriteria 3 Bulan, 1 Bulan, dan 2 Minggu.
- Kandidat contoh item tetap dibatasi pada PTAG E, D, S, L, dan kosong. Perhitungan dan sumber data HISTORY tidak diubah.
- Rasio PowerPoint tetap 4:3; seluruh penanda versi, manifest, dan cache Service Worker diperbarui ke v4.5.8.

## v4.5.8 — Executive HISTORY PPT refinement 4:3
- Mempertegas garis grafik STOCK, PO, dan BPB serta memperbesar marker titik data agar lebih mudah dibaca.
- Membedakan warna PO (biru) dan BPB (oranye) secara konsisten pada grafik perbandingan.
- Membatasi kandidat analisis dan contoh item PPT pada PTAG E, D, S, L, dan kosong; mesin perhitungan HISTORY dan data aplikasi tidak diubah.
- Memisahkan contoh kasus Stock Out berturut-turut menjadi tiga slide: 3 Bulan, 1 Bulan, dan 2 Minggu (total 16 slide utama).
- Memperbarui tampilan PPT dengan latar lebih bersih, aksen warna berdasarkan bagian, footer, dan nomor halaman; rasio tetap 4:3.
- Menyinkronkan seluruh penanda versi, manifest, dan cache Service Worker ke v4.5.8.

## v4.4.9 — Executive Analysis HISTORY PPT 4:3
- Menyusun ulang ekspor PowerPoint HISTORY menjadi alur Executive Business Analysis 14 slide: pembukaan, identifikasi masalah, analisis, contoh kasus, faktor penyebab, solusi, tindak lanjut, kesimpulan, dan monitoring.
- Mempertahankan rasio slide 4:3 dan seluruh sumber data serta perhitungan HISTORY.
- Menyinkronkan seluruh penanda versi aplikasi, aset, manifest, dan cache Service Worker ke v4.4.9.
- Tidak mengubah alur fitur aplikasi selain penyajian ekspor PowerPoint HISTORY dan penanda rilis.

## v4.4.8
- Menambahkan satu slide ringkasan “Analisa Stock Out berdasarkan SL” berisi tabel kriteria SL dan jumlah item saja.
- Slide contoh setelah ringkasan menggunakan judul tetap “Contoh item Stock Out perkriteria”.
- Menampilkan dua kriteria dalam satu slide bila memungkinkan; contoh item disesuaikan menjadi lima per kriteria agar tabel tetap terbaca.
- Tidak mengubah sumber data, kriteria SL, hasil perhitungan, maupun alur fitur lainnya.

## v4.4.3
- Label grafik Stock pada ekspor PowerPoint menggunakan satuan miliar rupiah, termasuk sumbu nilai dan label saldo awal/akhir. Grafik PO dan BPB tetap menggunakan juta rupiah.

## v4.4.3 — Isi tabel tidak dipotong
- Menghapus pemotongan teks/angka dengan elipsis pada tabel PPT.
- Ukuran font menyesuaikan lebar sel; tabel heatmap memakai ukuran khusus agar angka tetap utuh.
- Interval label sumbu X tetap setiap 7 hari.

## v4.4.3 — Perbaikan keterbacaan tabel dan interval label grafik
- Render gambar tabel PPT menggunakan PNG lossless agar tepi huruf lebih tajam dan tidak kabur akibat kompresi JPEG. Ukuran font tetap Segoe UI: header 32 px dan isi 28 px.
- Label sumbu X pada grafik History dan PPT ditampilkan per 7 hari (serta tanggal terakhir bila tidak tepat pada interval), sementara titik dan garis data tetap memakai seluruh data harian.
- Memperbarui penanda versi aplikasi dan cache service worker ke v4.4.3.
- Tidak mengubah sumber data, perhitungan, hasil analisis, maupun alur fitur.

## v4.4.0 — Penetapan versi dan konsistensi font tabel PPT
- Menetapkan versi rilis menjadi v4.4.0 pada seluruh penanda versi aplikasi, pemanggilan aset, footer, dan cache service worker.
- Mempertahankan font tabel PPT Segoe UI: header Bold 32 px dan isi Regular 28 px.
- Tidak mengubah fungsi, data, perhitungan, maupun alur aplikasi lainnya.

## v4.3.10 — Konsistensi font tabel PPT
- Menggunakan Segoe UI untuk teks pada gambar tabel PPT; header Segoe UI Bold 32 px dan isi Segoe UI Regular 28 px.
- Mempertahankan ukuran huruf, pemotongan teks panjang, isi data, perhitungan, dan alur aplikasi.
- Menyinkronkan nomor versi pada aplikasi, halaman, dan cache service worker.

## v4.3.9 — Penyesuaian ukuran teks tabel PPT
- Menetapkan ukuran teks header tabel menjadi 32 px dan isi tabel 28 px pada gambar tabel PPT.
- Mempertahankan pemotongan teks panjang agar ukuran huruf tidak mengecil hanya karena kolom sempit.
- Tidak mengubah isi data, perhitungan, maupun alur aplikasi.

## v4.3.8 — Memperbesar teks pada tabel gambar PPT
- Teks isi tabel dinaikkan agar ukuran akhirnya terbaca jelas di slide.
- Header tabel diperbesar; teks panjang dipotong rapi alih-alih mengecilkan font secara ekstrem.
- Ukuran penjelasan grafik dan alur aplikasi lainnya tidak diubah.

## v4.3.7 — Keseimbangan ukuran teks tabel dan keterangan grafik
- Keterangan di bawah grafik dikembalikan ke ukuran visual sekitar 20 px (15 pt pada teks PowerPoint).
- Teks di gambar tabel disesuaikan kembali: isi 20 px, header 22 px dan header lanjutan 19 px.
- Isi data, perhitungan, serta alur aplikasi tidak diubah.

## v4.3.6 — Keseimbangan teks penjelasan grafik
- Menyamakan ukuran visual paragraf penjelasan di bawah grafik dengan teks isi tabel (11,5 pt, Segoe UI reguler).
- Menjaga ukuran judul dan elemen grafik lainnya tetap seperti sebelumnya.
- Tidak mengubah data, perhitungan, maupun alur aplikasi.

# Inventory — Riwayat Perubahan

## v4.3.4 — Sinkronisasi versi dan dokumentasi
- Menaikkan nomor versi aplikasi menjadi v4.3.4 pada seluruh penanda versi, pemanggilan aset, dan cache service worker.
- Memperbarui README agar sesuai dengan versi aplikasi terbaru.
- Mempertahankan seluruh fitur, data, perhitungan, dan alur aplikasi.

## v4.3.3 — Perbaikan proporsi tabel PPT
- Memperbaiki proporsi gambar tabel saat ditempatkan pada slide PowerPoint agar teks tidak tampak tertarik.
- Menyesuaikan tata letak tabel agar ukuran teks dan baris tetap proporsional.
- Tidak mengubah isi tabel maupun perhitungan.

## v4.3.2 — Penyesuaian ukuran teks PPT
- Memperbesar teks non-judul pada PowerPoint sesuai permintaan.
- Mempertahankan ukuran judul.

## v4.3.1 — Penyesuaian teks PPT
- Penyesuaian ukuran teks pada elemen PowerPoint.

## v4.3.0 — Kriteria SL dari HRGBELI
- Menggunakan HRGBELI kolom AI sebagai sumber kriteria SL.

## v5.0.2 — Pengurutan & export Check Item
- Urutan hasil Barang Baru & Open TAG kini berdasarkan Hari terbanyak, lalu Sisa Stock (%) terbesar, kemudian PRDCD terkecil.
- Export JPEG dan Excel mengikuti urutan hasil yang sama.
- Export Excel Check Item dirapikan dengan judul, header biru, garis tabel, lebar kolom, filter, freeze header, dan format tanggal/angka.
- Semua penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.0.2.
