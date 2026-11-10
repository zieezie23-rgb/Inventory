## v3.7.2 — Login dan kunci otomatis
- Menambahkan popup login sebelum pengguna dapat masuk ke halaman utama.
- Password akses: `zie` (satu kolom input).
- Aplikasi terkunci kembali setelah 15 menit tanpa aktivitas.
- Saat terkunci, data upload tetap tersimpan di memori selama halaman tidak di-refresh atau ditutup.
- Login tidak menggunakan penyimpanan sesi permanen; halaman yang dimuat ulang meminta login kembali.

## v3.7.1 — Perbaikan ekspor History dan TREND
- Memperbarui nomor versi aplikasi menjadi v3.7.1.
- Mempertahankan perbaikan ekspor pada paket v3.7.0-EXPORT-FIX.
- HISTORY Stock Out Detail: header tabel boleh wrap ke beberapa baris; isi tabel tetap satu baris (tanpa wrap).

## v3.6.9 — Kolom PKM dan tanggal perubahan PTAG pada Detail Stock Out

- Menambahkan kolom PKM dan Tgl Rubah Tag sebelum kolom PTAG pada detail item Ringkasan Stock Out.
- Tgl Rubah Tag menggunakan tanggal perubahan PTAG terakhir dari rentang data History, ditampilkan sebagai tanggal singkat.
- DESC2 dan SNAMA rata kiri; PRDCD, SUPCO, PERIODE, dan KETERANGAN rata tengah.
- Penyesuaian tata letak export JPEG detail Stock Out.
- Logika perhitungan inti dan modul lain tidak diubah.

## v3.6.9 — Kolom perubahan PTAG pada History Stock Out

- Menambahkan kolom **Tgl Rubah PTAG** dan **Ket PTag** di akhir sheet `History Stock Out`.
- Tanggal diambil dari perubahan PTAG terakhir selama rentang tanggal History (tidak menganggap nilai pada hari pertama sebagai perubahan karena tidak ada pembanding sebelum periode).
- Tanggal disimpan sebagai nilai tanggal Excel numerik dengan format `dd mmm yy`, sehingga tetap dapat difilter dan diurutkan sebagai tanggal.
- Jika tidak ada perubahan PTAG selama periode, kedua kolom dikosongkan.
- Sheet History lainnya dan delapan modul selain History tidak diubah.

## v3.6.6 — Sinkronisasi nilai export History
- Sheet Penurunan Stock dan 50 Item Terbesar memakai nilai penurunan positif yang sama dengan ringkasan aplikasi.
- Sheet 50 Supp Terbesar menjumlahkan Stock Awal/Akhir dari ringkasan per item (tanggal stok valid pertama/terakhir), bukan memaksa tanggal pertama/terakhir kosong menjadi nol.
- Kolom Penurunan Stock supplier dihitung Stock Awal dikurangi Stock Akhir.

## v3.6.5 — Perapian format Export History
- Merapikan seluruh tabel export History dengan garis sel, header konsisten, tinggi baris, dan alignment per kolom.
- Kolom rupiah menggunakan angka numerik dengan pemisah ribuan tanpa desimal dan rata kanan.
- PRDCD, ZONA, SL, serta kolom tanggal yang bukan nilai rupiah rata tengah; kolom lainnya rata kiri.
- Tidak mengubah data maupun rumus perhitungan History.

## v3.6.4 — Perbaikan Export History dan Ringkasan Stock Out
- Memperbaiki pembuatan sheet Kesimpulan saat export XLSX agar baris awal bagian SUPCO selalu tersedia.
- Tombol Export XLSX dan Export JPEG mengikuti tema cyberpunk Inventory.
- Detail Ringkasan Stock Out menampilkan dan mengekspor maksimal 10 item per keterangan; jumlah total tetap ditampilkan.

## v3.6.3 — Tombol Export netral dan tombol X tanpa kotak
- Tombol Export pada header History dan detail Ringkasan Stock Out menggunakan warna netral tanpa aksen hijau.
- Tombol X di kedua area tampil sebagai ikon tanpa border atau latar berbentuk kotak.
- Fungsi export dan tutup panel tidak diubah.

## v3.6.3 — Perapian tabel History
- Lebar kolom SUPCO pada tab 20 SUPCO disamakan dengan kolom PRDCD pada tab 20 Item.
- Kolom Kesimpulan pada kedua tabel peringkat diratakan ke kiri.
- Kolom ringkasan penyebab dirapatkan pada desktop dan layar HP.

## v3.6.3 — Penyesuaian History SL dan tampilan analisa

- Syarat Stock Out diperketat: selain STOCK < MEAN, MEAN > 0, dan PTAG yang memenuhi kriteria, PKM dari STM G113 lokasi 01 wajib > 0. Syarat ini diterapkan konsisten pada grafik, ringkasan, hitungan hari Stock Out, klasifikasi Stock Out berturut-turut, dan export History Stock Out.
- Tab Ringkasan: teks Keterangan rata kiri dan jarak/lebar kolom periode serta selisih dirapatkan, termasuk tampilan mobile.
- Grafik SL memakai perhitungan rolling 14 hari berdasarkan tanggal PO; BPB dihitung hanya untuk PO dalam jendela tersebut dan yang sudah diterima sampai tanggal titik grafik. Titik tanpa 14 hari data sebelumnya tidak ditampilkan.
- Menghapus panel Kesimpulan Ringkasan pada tab penyebab.
- Menyederhanakan tabel 20 Item Terbesar dan 20 SUPCO Terbesar menjadi empat kolom sesuai permintaan.
- Filter Analisa Penyebab dibuka dengan Semua Periode dan Semua Kesimpulan.

## v3.5.8 — Penyesuaian grafik History
- Urutan grafik tab History: Stock, Stock Out, SL Supplier, PO, lalu BPB.
- Grafik Stock Out berdiri sendiri; tidak lagi digabung dengan SL Supplier.
- Semua grafik menggunakan satu sumbu Y di kiri; sumbu kanan dihilangkan.
- Skala Stock dikunci 40–70 miliar rupiah; SL Supplier 1–100%.
- Skala PO dan BPB menyesuaikan rentang nilai data secara otomatis.
- Tidak mengubah sumber data, rumus, hasil analisis, maupun alur proses lainnya.

## v3.5.7 — Pemisahan sumbu Stock Out dan SL Supplier pada grafik
- Menata ulang export History menjadi 10 sheet: History Stock, History Ptag, History BPB, History SL, History Stock Out, Penurunan Stock, 50 Item Terbesar, 50 Supp Terbesar, Kesimpulan, dan TREND.
- Menyesuaikan redaksi judul, header, istilah Σ Item/Σ Supplier, variasi periode, dan nama sheet mengikuti workbook contoh.
- Mempertahankan kolom Periode, SL, dan Keterangan pada History Stock Out.
- Memindahkan lima grafik harian terpisah ke sheet TREND dan mempertahankan grafik pada tab History di aplikasi.
- Merapikan lebar kolom, header, perataan teks, freeze panes, dan filter tanpa mengubah rumus atau logika analisis.

## v3.5.5 — Grafik History harian per kategori
- Grafik PO dihitung dari nilai PO yang dibuat pada tanggal tersebut, bukan akumulasi PO bergulir 14 hari.
- Grafik BPB menggunakan nilai BPB yang diterima pada tanggal BPB.
- Grafik SL Supplier dihitung per tanggal dari BPB harian dibanding PO harian.
- Grafik aplikasi dan sheet Excel `Grafik` dipisahkan menjadi lima grafik: PO Harian, BPB Harian, STOCK, SL Supplier, dan Jumlah Item STOCK OUT.
- Grafik STOCK OUT hanya menampilkan jumlah item STOCK OUT; seri STOCK tidak digandakan pada grafik tersebut.
- Perhitungan analisa SL 2 Minggu, 1 Bulan, dan 3 Bulan tetap menggunakan periode analisa yang sudah ada.

## v3.5.3 — Perapihan tombol History dan export JPEG per detail STOCK OUT
- Tombol Export XLSX dan tutup History dibuat lebih ringkas, sejajar, dan proporsional.
- Tombol Export JPEG dipindahkan ke panel detail, berdampingan dengan tombol tutup.
- Setiap baris Ringkasan StockOut membuka detailnya sendiri dan memiliki export JPEG yang hanya mengekspor daftar item detail tersebut.

## v3.5.2 — Detail Ringkasan STOCK OUT dan tab Top 20 gabungan

- Kolom Keterangan pada Ringkasan StockOut rata kiri.
- Baris Ringkasan StockOut dapat dipilih untuk menampilkan daftar item dengan kolom PRDCD, DESC2, SUPCO, SNAMA, PTAG, STOCK, PERIODE, SL, dan KETERANGAN.
- Daftar item STOCK OUT dapat diekspor ke JPEG.
- Tab 20 Item Terbesar dan 20 SUPCO Terbesar digabung menjadi satu tab; kedua tabel tetap menampilkan 20 baris.
- Export Excel tetap mempertahankan sheet Top 50 item dan Top 50 SUPCO.

## v3.5.1 — Ringkasan STOCK OUT dan perapihan tabel SUPCO

- Header tabel 20 SUPCO terbesar dapat membungkus teks; isi baris tetap satu baris/tidak wrap.
- Export History Stock Out menambahkan kolom Periode, SL, dan Keterangan berdasarkan STOCK OUT berturut-turut.
- Tab dan sheet Ringkasan StockOut merangkum keterangan serta jumlah item, diurutkan dari terbanyak.
- Sheet export History Stock Out tetap memuat penanda harian Y dan kolom ringkasan periode.

## v3.5.0 — Penyempurnaan History
- Grafik aplikasi dipisah ke tab Grafik, mendahului tab Ringkasan; tab Rekap Harian dihilangkan dari tampilan aplikasi.
- Tampilan Top Item dan Top SUPCO dibatasi 20 baris; export tetap 50 baris.
- Export History memuat satu sheet Grafik dan sheet History Stock, History Ptag, History BPB, History SL, serta History Stock Out (Y per tanggal saat item memenuhi kriteria STOCK OUT).
- Skala sumbu grafik dibuat mulai dari nilai maksimum di atas hingga nol di bawah dengan interval berurutan.

## v3.4.0 — Penyaringan LT History

- Seluruh proses History hanya menyertakan item dengan LT berupa huruf.
- LT angka (termasuk 00, 90, 91, 92, dan 95) serta LT kosong dikecualikan.
- Penyaringan dilakukan pada sumber daftar item History sehingga berlaku konsisten untuk tabel, grafik, analisis STOCK OUT, SL Supplier, ringkasan, Top 50, dan seluruh sheet export.
- Fungsi di luar History dan pemetaan `zone()` untuk proses lain tidak diubah.

## v3.3.8 — Sinkronisasi Grafik STOCK dan Perbaikan Kriteria STOCK OUT

- Garis STOCK (Rp) pada grafik utama dan grafik STOCK OUT kini menggunakan agregat total STOCK yang sama per tanggal, dari seluruh item History ber-ZONA.
- Seri jumlah item STOCK OUT tetap dihitung terpisah.
- STOCK OUT hanya dihitung jika STOCK < MEAN, MEAN > 0, dan PTAG termasuk E, D, S, L, atau kosong.
- Pengecualian MEAN = 0 dan filter PTAG diterapkan konsisten pada jumlah STOCK OUT harian, STOCK OUT Days, ringkasan shortage, supplier, serta kondisi kedatangan penuh yang langsung diikuti STOCK OUT.
- Sheet export Grafik dan Grafik STOCK OUT mengikuti angka STOCK total yang sama.
- Perhitungan SL dan analisa penyebab lainnya tidak diubah.

## v3.3.8 — Perapihan Ringkasan, SUPCO, dan Export

- Kesimpulan ringkasan dipindahkan ke bawah tabel rekap penyebab.
- Header dan kolom kesimpulan 50 SUPCO dibuat membungkus teks dengan lebar lebih rapat.
- Export menambahkan sheet “Kesimpulan Ringkasan” dan merapikan lebar kolom pada sheet 50 SUPCO.
- Perhitungan SL, trend, dan analisa penyebab tidak diubah.

## v3.3.8 — Ringkasan dan Rekap History

- Nilai selisih negatif ditampilkan dalam tanda kurung dan warna merah tanpa tanda minus.
- Ringkasan dilengkapi teks kesimpulan penyebab terbanyak untuk periode 2 minggu, 1 bulan, dan 3 bulan.
- Keterangan penjelas lama pada ringkasan dihapus.
- Header Rekap Harian dirapatkan; jumlah baris dan navigasi dipindahkan ke kanan atas sejajar judul.
- Tabel 50 Item Terbesar ditambahkan kolom Kesimpulan.
- Empat kolom kesimpulan pada 50 SUPCO Terbesar menggunakan kriteria analisa.
- Perhitungan SL, klasifikasi trend, dan hasil Analisa Penyebab tidak diubah.

## v3.3.5 — Perbaikan error ringkasan History

- Ringkasan jumlah item dan SUPCO sekarang dihitung dari satu kesimpulan per item untuk masing-masing periode.
- Tidak lagi mencampurkan kategori SL (CAUSE) dengan teks kesimpulan (TREND), sehingga tidak ada akses `.add()` ke kelompok yang tidak terbentuk.
- Fungsi modul Inventory lainnya dipertahankan.

## v3.3.5 — Perbaikan kesimpulan dan filter Analisa History

- Frasa transisi dari kondisi tanpa PO menggunakan awalan **Ada PO**.
- Kesimpulan `SL 0%` ke `SL 0%` menjadi **SL 0%, tidak ada kedatangan**.
- Kondisi SL yang stabil di bawah 100% ditulis **SL stabil <100%**; stabil 100% juga diberi label eksplisit.
- Keterangan tunggal yang berdiri sendiri hanya **Tidak ada PO**.
- Filter Analisa Penyebab dipisah menjadi **Periode** dan **Jenis Kesimpulan**. Periode menentukan kolom kesimpulan yang digunakan untuk menyaring item.
- Ringkasan keterangan menghitung kesimpulan, bukan mencampur kategori SL dengan kesimpulan.

- Tidak ada PO pada awal periode → SL 0%: kesimpulan “Mulai ada PO, tetapi Tidak ada Kedatangan”.
- Tidak ada PO pada awal periode → SL <100%: kesimpulan “Mulai ada PO dan kedatangan”.
- Tidak ada PO pada awal periode → SL 100%: kesimpulan “Mulai ada PO dengan kedatangan penuh”.
- Mempertahankan aturan SL 0% → SL 0% = “Tidak ada Kedatangan”.

## v3.3.2 — Klasifikasi SL 0% tanpa kedatangan

- Jika kategori SL pada 7 hari awal dan periode berjalan sama-sama SL 0%, kesimpulan langsung menjadi “Tidak ada Kedatangan”.
- Kondisi tersebut tidak lagi dianalisis sebagai tren nilai kedatangan meningkat, menurun, atau stabil.
- Aturan kondisi awal Tidak ada PO dan klasifikasi kategori SL lainnya tetap dipertahankan.

## v3.3.1 — Perbaikan kondisi awal Tidak ada PO

- Jika 7 hari awal tidak memiliki PO dan periode berjalan memiliki PO, tren diklasifikasikan SL naik.
- Menghapus keluaran SL tidak dapat dibandingkan untuk kondisi awal Tidak ada PO.
- Jika seluruh periode tidak memiliki PO, hasil tetap hanya Tidak ada PO.

## v3.3.0 — Klasifikasi SL 0% dan SL 100%

- Jika kategori awal dan akhir sama-sama SL 0%, hasil tetap ditampilkan sebagai SL 0%.
- Jika kategori awal dan akhir sama-sama SL 100%, hasil tetap ditampilkan sebagai SL 100%.
- Perubahan angka di dalam kategori SL <100% tetap stabil.
- Perubahan antar kategori 0%, <100%, dan 100% diklasifikasikan naik/turun.

## v3.2.9 — Perbaikan klasifikasi tren SL berbasis kategori

- Tren SL membandingkan kategori SL awal periode dengan kategori SL periode berjalan, bukan regresi angka persentase.
- Perubahan dalam kategori SL <100% (misalnya 50% ke 70% atau 70% ke 50%) tetap stabil.
- Perubahan SL 100% ke SL <100% diklasifikasikan turun; SL 0% ke SL <100% diklasifikasikan naik.

## v3.2.8 — Filter RECID dan periode SL berdasarkan tanggal PO

- Perhitungan History hanya memakai RECID R, H, dan blank.
- Periode ditentukan oleh PO_DATE; BPB_QTY dari PO terpilih dihitung tanpa filter BPB_DATE.
- SL 14 hari mengikuti aturan tanggal PO yang sama.

## v3.2.7 — Perbaikan pencocokan PO dan BPB pada perhitungan SL

- BPB hanya dihitung untuk baris PO yang tanggal PO-nya termasuk dalam periode yang sedang dianalisis.
- Penerimaan dari PO yang dibuat di luar periode tidak lagi menambah SL periode tersebut.
- Tidak ada pembatasan angka SL secara paksa; nilai tetap berasal dari hasil pencocokan sumber.
- Periode tanpa PO menghasilkan keterangan “Tidak ada PO”.
- Tampilan SL positif di bawah 1% dibulatkan menjadi 1%, sesuai permintaan.

## v3.2.7 — Perbaikan dasar hitung SL dan tren periode

- SL per periode dihitung dari total kuantitas BPB bertanggal BPB_DATE dalam rentang yang sama dibagi total kuantitas PO bertanggal PO_DATE dalam rentang tersebut.
- Rentang periode total: 14 hari, 30 hari, dan 3 bulan kalender sampai H-1.
- Tren 2 minggu membandingkan 7 hari pertama dengan 7 hari terakhir; 1 bulan membandingkan 15 hari pertama dengan 15 hari terakhir; 3 bulan membandingkan 30 hari pertama dengan 30 hari terakhir.
- Kategori SL: Tidak ada PO (PO=0), SL 0% (PO ada dan BPB=0), SL <100% (1–99%), SL 100% (100% atau lebih).
- Arah tren SL ditentukan dari perubahan kategori, bukan selisih persentase mentah. Karena itu SL 5% ke 90% tetap stabil dalam kategori SL <100%.
- Nilai kedatangan dibandingkan dari nominal BPB dalam masing-masing bagian awal dan akhir. Jika salah satu bagian tidak memiliki PO, arah tren SL dinyatakan tidak dapat dibandingkan; tren nilai kedatangan tetap dihitung.

# Inventory v3.6.8

## v3.2.7 — Validasi kategori SL, tren, dan ringkasan mobile

- Tren SL disederhanakan menjadi keterangan ringkas, misalnya “SL turun, nilai kedatangan meningkat” atau “SL naik, nilai kedatangan menurun”; tidak lagi menampilkan kategori SL asal dan tujuan.
- Perbandingan nilai kedatangan menggunakan nilai BPB (Rp), bukan jumlah transaksi kedatangan.
- Daftar keterangan ringkasan diurutkan berdasarkan kategori SL, kemudian arah perubahan SL dan nilai kedatangan.
- Ringkasan Item dan SUPCO menambahkan selisih 3 bulan dikurangi 2 minggu, selain selisih antarperiode yang sudah tersedia.
- Tinggi tombol X disamakan dengan tombol Export pada desktop dan perangkat kecil.

## v3.2.7 — Penyederhanaan tren SL dan selisih periode

- Setiap item analisa hanya memperoleh satu kesimpulan penyebab pada masing-masing periode 14 hari, 1 bulan, dan 3 bulan. Jumlah kategori per periode sama dengan jumlah item yang masuk analisa.
- Menambahkan perbandingan kategori SL (0%, <100%, 100%) dan jumlah kedatangan untuk 14 hari (dibanding 14 hari sebelumnya), 1 bulan (dibanding 1 bulan sebelumnya), dan 3 bulan (awal vs akhir periode). Kategori 100% memakai nilai SL tepat 100% atau lebih; nilai di bawah 100% tetap <100%. Jika PO tidak tersedia, ditulis “Tidak ada PO”.
- Ringkasan penyebab menampilkan jumlah item dan jumlah SUPCO per keterangan untuk 14 hari, 1 bulan, dan 3 bulan, beserta selisih antarperiode; tidak menampilkan rincian per supplier maupun rupiah.
- Persentase nol ditampilkan sebagai 0%.
- Menambahkan filter keterangan pada tabel Analisa Penyebab. Tombol Export XLSX dan Tutup diseragamkan ukurannya.
- Tab History ditata menyerupai tumpukan file.

## v3.1.8 — Koreksi History dan export
- Istilah BPB lengkap diganti menjadi SL 100%.
- STOCK OUT dibatasi pada STOCK < MEAN dengan PTAG E, D, S, L, atau kosong.
- Peringkat 50 SUPCO berdasarkan jumlah item yang mengalami penurunan STOCK.
- Tab History satu baris bergaya dokumen; ringkasan penyebab berupa daftar.
- Penyelarasan angka, SUPCO, dan SL diperbaiki; sheet grafik dan format tabel ekspor dibenahi.

## v3.1.4 — Modul History (tambahan terpisah)
- Menambahkan tombol HISTORY tanpa mengubah alur proses modul operasional yang sudah ada.
- PRDCD dibatasi hanya dari PRODMAST dan hanya item yang memiliki ZONA pada LT STM G113 lokasi 01.
- Parameter dibaca langsung dari PRODMAST, STM G113, HPG, HRGBELI, dan SUPMAST; tidak membangun Master Stock.
- STOCK dan PTAG harian dibaca dari kolom STOCKnn dan TAGnn pada REG bulanan.
- Tanggal akhir mengikuti TGLUPD REG dikurangi satu hari (H-1); pemeriksaan memastikan seluruh bulan pada rentang tiga bulan tersedia.
- BPB harian diambil dari BPB_DATE/BPB_QTY POM. SL Supplier dihitung per item dengan PO/BPB bergulir 14 hari hingga H-1.
- Menampilkan tabel dua tingkat, grafik gabungan, grafik item, grafik SUPCO, analisis shortage terhadap MEAN, serta ranking 50 item dan 50 SUPCO.
- Ekspor satu XLSX berisi lima sheet: Grafik (3 chart Excel), Rekap, Analisa, 50 Item Terbesar, dan 50 SUPCO Terbesar.
- Pembacaan REG dan POM dilakukan streaming per baris agar tidak membuat array objek raksasa di memori.

## v3.0.3 — Standarisasi indikator progres

- Menyatukan tampilan progres proses dan unggah file melalui renderer yang sama.
- Progress bar memakai gerakan kilau yang berjalan selama proses aktif; angka persentase tetap mengikuti progres yang dilaporkan proses.
- Outline/border pada jalur dan isi progress bar dihilangkan.
- Animasi berhenti saat progres mencapai 100% atau indikator disembunyikan.
- Menghilangkan kedipan teks status agar informasi proses tetap stabil dan animasi terpusat pada progress bar.

## v3.0.1 — Optimasi persiapan PO EXPIRED

- PO EXPIRED tidak lagi menjalankan `processData()` atau membangun seluruh Master Stock.
- Data yang dibutuhkan PO EXPIRED dirakit langsung dari PRODMAST, HRGBELI, SUPMAST, STM G113, PAR G113, HPG, POM G113, KEB, PROTECT, SEAS, PROMO, dan Stock Out.
- Data Seasonal tetap dimuat dari laporan Seasonal khusus.
- Struktur tabel, perhitungan, dan alur pemeriksaan PO EXPIRED dipertahankan.

## v3.0.0 — Penyederhanaan struktur JavaScript
- Seluruh fungsi Raw Material kini berada di app.js.
- Referensi raw-material.js di index.html dan Service Worker dihapus.
- Fungsi deteksi file, perhitungan, tabel, dan ekspor Raw Material dipertahankan.

# Inventory v3.2.7

## v3.2.7 — Penyederhanaan tren SL dan selisih periode

- Setiap item analisa hanya memperoleh satu kesimpulan penyebab pada masing-masing periode 14 hari, 1 bulan, dan 3 bulan. Jumlah kategori per periode sama dengan jumlah item yang masuk analisa.
- Menambahkan perbandingan kategori SL (0%, <100%, 100%) dan jumlah kedatangan untuk 14 hari (dibanding 14 hari sebelumnya), 1 bulan (dibanding 1 bulan sebelumnya), dan 3 bulan (awal vs akhir periode). Kategori 100% memakai nilai SL tepat 100% atau lebih; nilai di bawah 100% tetap <100%. Jika PO tidak tersedia, ditulis “Tidak ada PO”.
- Ringkasan penyebab menampilkan jumlah item dan jumlah SUPCO per keterangan untuk 14 hari, 1 bulan, dan 3 bulan, beserta selisih antarperiode; tidak menampilkan rincian per supplier maupun rupiah.
- Persentase nol ditampilkan sebagai 0%.
- Menambahkan filter keterangan pada tabel Analisa Penyebab. Tombol Export XLSX dan Tutup diseragamkan ukurannya.
- Tab History ditata menyerupai tumpukan file.

## v3.1.8 — Koreksi History dan export
- Istilah BPB lengkap diganti menjadi SL 100%.
- STOCK OUT dibatasi pada STOCK < MEAN dengan PTAG E, D, S, L, atau kosong.
- Peringkat 50 SUPCO berdasarkan jumlah item yang mengalami penurunan STOCK.
- Tab History satu baris bergaya dokumen; ringkasan penyebab berupa daftar.
- Penyelarasan angka, SUPCO, dan SL diperbaiki; sheet grafik dan format tabel ekspor dibenahi.


## v2.9.9 — Raw Material membaca sumber langsung
- Raw Material mengambil subset data langsung dari PRODMAST dan STM G113 tanpa menjalankan ulang proses pembentukan Master Stock 77 kolom.
- Filter barang dan pemetaan ALAMAT mengikuti aturan Master Stock yang sama.
- Sumber STM G113 kini menjadi syarat kesiapan Raw Material karena dibutuhkan untuk ALAMAT.


## v2.9.8 — Ekspor Raw Material dalam satu workbook
- Tombol ekspor Rekap dan Detail digabung menjadi satu tombol Export.
- Satu file `Check Raw Material dd mmm yy.xlsx` berisi sheet `Rekap` dan `Detail`.
- Kolom tanggal tetap disimpan sebagai nilai tanggal Excel dengan format `dd mmm yy`.
- Tombol navigasi tabel disingkat menjadi `Rekap` dan `Detail`; perhitungan tidak diubah.

## v2.9.7 — Tanggal Excel Raw Material sebagai nilai tanggal
- Kolom tanggal pada ekspor Rekap Item dan Detail Display/Storage disimpan sebagai nilai tanggal Excel, bukan teks.
- Format tampilan sel Excel menggunakan `dd mmm yy`; tampilan tabel aplikasi tetap `DD MMM YY`.
- Perhitungan dan penyusunan data Raw Material tidak diubah.

## v2.9.6 — Koreksi notifikasi jumlah file
- Notifikasi Daftar File kini menghitung file fisik yang dimuat, bukan jumlah jenis sumber/slot. File REG bulanan dihitung masing-masing.
- Tidak mengubah pemetaan file, proses, maupun perhitungan Inventory.


## v2.9.5 — Perbaikan ekspor XLSX dan CSV
- Memisahkan fungsi unduhan ekspor BRD dari fungsi unduhan XLSX Inventory agar tidak saling menimpa akibat nama fungsi yang sama.
- Ekspor MASTER STOCK, STOCK OUT, BPB SUPPLIER, Rekap Supplier, dan SL SUPPLIER kembali menggunakan downloader yang menerima Blob XLSX dengan benar.
- Ekspor CSV BRD diberi MIME `text/csv;charset=utf-8` dan UTF-8 BOM tunggal agar karakter lebih mudah dikenali aplikasi spreadsheet.
- Tidak mengubah data, delimiter CSV (tetap koma), format workbook, maupun rumus/perhitungan Inventory.


## v2.9.4 — Koreksi jumlah Tarikan Harian dan kategori laporan Seasonal
- Penghitung Tarikan Harian kini menghitung file fisik, bukan hanya jenis/slot sumber. Empat file REG bulanan dihitung masing-masing sehingga 22 file Tarikan Harian ditampilkan sebagai 22 file.
- Penghitung ringkasan Daftar File diberi label “jenis sumber” agar tidak disalahartikan sebagai jumlah file fisik.
- Workbook `Laporan Harian Seasonal` dipindahkan dari kategori Bahan ke kategori File Update.
- Pemetaan peran workbook Seasonal dan pemakaiannya pada proses PO EXPIRED tetap dipertahankan; perubahan kategori tidak mengubah proses atau perhitungan.
- Logika Inventory, PO EXPIRED, SL SUPPLIER, dan Raw Material selain tampilan kategori/penghitung tidak diubah.

# Inventory v2.9.3

## v2.9.3 — Optimasi proses SL SUPPLIER
- Menghapus pemanggilan `processData()` penuh dari pembuatan SL SUPPLIER.
- Membentuk hanya kolom MASTER STOCK yang benar-benar dipakai, dengan aturan filter PRODMAST, pemetaan HRGBELI/SUPMAST, dan PKM STM G113 yang sama.
- Membaca POM G113 satu kali untuk agregasi PO/BPB pada rentang 14 hari yang sama.
- Menampilkan tahapan dan progres pemrosesan SL SUPPLIER di halaman utama.
- Struktur workbook, sheet tanggal, format baris, serta rumus SL tetap dipertahankan.

## v2.9.3 — Persiapan PO EXPIRED sebelum popup dibuka
- Persiapan data PO EXPIRED sekarang dijalankan dari halaman utama setelah tombol PO EXPIRED ditekan.
- Progress persiapan tampil di halaman utama; popup baru dibuka setelah Master Stock, POM, data pendukung, dan parsing laporan Seasonal selesai.
- Jika persiapan gagal, popup tidak dibuka dan pesan kesalahan ditampilkan di halaman utama.
- Pemeriksaan No PO tetap baru berjalan setelah tombol Cek PO ditekan.


## v2.9.3 — Perbaikan pemetaan bahan Seasonal untuk PO EXPIRED
- Memisahkan `seas.csv` (sumber indikator Seasonal untuk Master Stock) dari workbook `Laporan Harian Seasonal` (sumber angka Target, PO, BPB, dan PO Out untuk PO EXPIRED).
- `seas.csv` dan workbook laporan Seasonal kini masuk kategori **Bahan** pada Daftar File.
- Workbook laporan Seasonal dikenali berdasarkan nama laporan dan ekstensi Excel, tidak lagi tertangkap sebagai file `SEAS`.
- Penentuan item BASIC kini mengikuti indikator `SEASONAL`/rincian pada data Master Stock, bukan nilai `POLA1` di laporan Seasonal.
- Kolom kuantitas Seasonal tetap dibaca dari sheet `BASIC` pada workbook laporan.
- Pemeriksaan PO EXPIRED meminta kedua sumber Seasonal tersebut agar klasifikasi BASIC dan angka laporan sama-sama tersedia.
- Logika hitung PO, POM, Stock Out, Promo, dan Raw Material tidak diubah.


## v2.8.8 — Perapian panel hasil Raw Material
- Menghapus panel “Langkah selanjutnya” pada popup Raw Material.
- Memindahkan tombol ekspor ke baris yang sama dengan tab Tabel 1 dan Tabel 2, rata kanan.
- Tombol ekspor mengikuti tab aktif; Export Tabel 1 untuk Rekap dan Export Tabel 2 untuk Detail.
- Menghapus area ekspor lama di bawah tabel.

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

## v2.9.0 — Perbaikan BRD dan input PO EXPIRED
- Memulihkan pointer/touch interaction pada kolom No PO di popup PO EXPIRED.
- Memastikan textarea dapat menerima fokus dan input teks pada browser perangkat sentuh.
- Tidak mengubah rumus maupun alur pemeriksaan PO EXPIRED.

- File berekstensi `.BRD` kini didekode menjadi teks saat diunggah (UTF-8 dengan fallback Windows-1252), sehingga isi file tersedia untuk mesin konversi BRD.
- Memperbaiki penyebab file BRD terdaftar tetapi tidak dapat dipilih/diproses: sebelumnya konten BRD sengaja dikosongkan saat pembacaan.
- Tidak mengubah parser, format ekspor, maupun rumus/aturan konversi BRD.

## v3.1.4 — Analisa tren History 3 bulan
- History membandingkan STOCK OUT harian selama rentang 3 bulan dan menampilkan tren jumlah item STOCK OUT.
- Analisa pengadaan dibagi menjadi 14 hari, 30 hari, dan 3 bulan: Tidak ada PO, Tidak ada kedatangan, serta SL <100%.
- POM dipisahkan berdasarkan tanggal PO dan tanggal BPB pada baris RECID R; RECID 1 tetap dikecualikan mengikuti filter perhitungan yang sudah digunakan aplikasi.
- Pemeriksaan BPB sesuai PO melihat STOCK pada hari berikutnya.
- Ranking 50 item memakai penurunan STOCK dari tanggal awal ke akhir periode; ranking 50 SUPCO memakai jumlah item yang menurun.
- Tanggal akhir History mengikuti tanggal STOCK aktual terakhir yang terisi pada REG, bukan hanya TGLUPD. MEAN HPG terbaru dipakai sebagai patokan tetap sepanjang periode.


## v3.1.4 — History berbasis nilai rupiah
- Grafik PO 14 hari, BPB, STOCK, dan STOCK OUT menggunakan nilai rupiah berdasarkan ACOST; SL Supplier tetap persentase.
- Nilai PO dan BPB pada analisa 14 hari, 30 hari, dan 3 bulan ditampilkan dalam rupiah, sedangkan SL tetap persentase.
- Peringkat 50 item dan 50 SUPCO diurutkan berdasarkan dampak penurunan nilai STOCK (Rp), bukan qty.
- Ringkasan penyebab penurunan diurutkan berdasarkan dampak rupiah; jumlah item tetap disertakan sebagai informasi pendamping.
- Kolom BPB dan STOCK harian pada tabel serta export History ditampilkan dalam rupiah.


## v3.1.8 — Penyempurnaan tampilan History dan export
- Popup History dibagi menjadi tab Ringkasan, 50 Item & SUPCO, Analisa Penyebab, dan Rekap Harian agar tidak menjadi satu halaman panjang.
- Grafik per item dan per SUPCO diganti dengan tabel peringkat 50 item dan 50 SUPCO terbesar.
- Grafik STOCK OUT kini menampilkan nilai STOCK (Rp) dari item yang berstatus STOCK OUT, bukan nilai kekurangan terhadap MEAN.
- Istilah status diperbarui menjadi SL 100%, SL 0%, dan SL <100%; label SL Supplier disingkat menjadi SL Supp.
- Format angka dibulatkan ke ribuan tanpa desimal; nilai nol ditampilkan sebagai tanda hubung, nilai negatif ditampilkan dalam kurung dan merah, tanpa mengubah nilai numerik sumber pada XLSX.
- Header tabel diratakan tengah. Analisa Penyebab ditambahkan kolom Kesimpulan/Keterangan dan ringkasan penyebab ditampilkan pada tab Ringkasan.
- Export XLSX dirapikan dengan lebar kolom, header berwarna, format angka ribuan, format negatif merah dalam kurung, dan nilai nol tampil sebagai tanda hubung tanpa mengubah nilai numeriknya.
- Catatan kecil di bagian bawah popup dihapus.


## v3.1.8 — Grafik STOCK OUT
- Grafik STOCK OUT menampilkan dua seri dengan sumbu terpisah: jumlah item STOCK OUT dan nilai STOCK dalam rupiah.
- Sheet Grafik pada export XLSX menambahkan kolom jumlah item STOCK OUT, sementara nilai STOCK tetap rupiah.


Pembaruan v3.1.8: tab 50 Item dan 50 SUPCO dipisahkan. Export History menambahkan sheet Grafik STOCK dan Grafik STOCK OUT berisi data tren harian untuk masing-masing grafik.

## Update v3.6.3 — Grafik History
- Urutan grafik tab History: Stock, Stock Out, SL Supplier, PO, lalu BPB.
- Grafik Stock Out berdiri sendiri; tidak lagi digabung dengan SL Supplier.
- Semua grafik menggunakan satu sumbu Y di kiri; sumbu kanan dihilangkan.
- Skala Stock dikunci 40–70 miliar rupiah; SL Supplier 1–100%.
- Skala PO dan BPB menyesuaikan rentang nilai data secara otomatis.
- Tidak mengubah sumber data, rumus, hasil analisis, maupun alur proses lainnya.


## v3.6.7 — Perbaikan instalasi dan pintasan PWA
- Memperkuat manifest agar identitas, start URL, scope, dan ikon PWA konsisten pada GitHub Pages.
- Menambahkan tombol Pasang Aplikasi/Cara Pasang pada halaman utama.
- Memperbaiki Service Worker agar cache lama dibersihkan dan halaman utama dibuka dengan strategi network-first serta fallback offline.
- Mengurangi risiko instalasi gagal karena satu aset cache tidak tersedia.


## v3.6.10
- HISTORY Stock Out Detail: table headers may wrap onto multiple lines; body cell values remain single-line (no wrapping).


## v3.7.0 — Perbaikan ekspor HISTORY
- SL harian item dihitung dari PO yang sama dengan BPB yang sudah diterima pada tanggal pengukuran; SL TREND memakai rasio BPB terhadap PO dari cohort PO 14 hari berjalan, bukan membagi transaksi BPB dan PO pada tanggal kalender yang sama.
- Statistik periode hanya menghitung BPB yang tanggal penerimaannya sudah terjadi pada akhir periode.
- Format angka ekspor diseragamkan sesuai format akuntansi yang diminta; kolom SL dan tanggal tetap memakai format khusus.
- SUPCO diratakan ke tengah; header Kesimpulan pada tiap blok tabel diberi format header; isi data tidak wrap.
- Kolom Penurunan Stock dihapus dari 50 Item Terbesar.
- Grafik TREND dipindahkan ke sisi kanan tabel.
