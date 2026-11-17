## v4.6.5 — Koreksi format dan kesimpulan ekspor Excel HISTORY

- PRDCD, ZONA, dan SUPCO diratakan ke tengah pada seluruh sheet HISTORY yang relevan.
- Tabel Σ SUPCO per Keterangan dihapus dari sheet Kesimpulan Trend Stock; tabel jumlah item tetap dipertahankan.
- Keterangan SL dan BPB diratakan ke tengah; kategori Tidak ada PO dan Ada PO tanpa kedatangan menggabungkan kedua kolom keterangan, sedangkan SL 0% tetap terpisah.
- Kolom Keterangan SL yang sama tetap dapat digabung vertikal.
- Tanggal dengan jendela rolling SL yang belum lengkap 14 hari dihilangkan dari sheet History SL dan TREND ekspor.
- Versi aplikasi, header/footer, manifest, dan cache Service Worker disinkronkan ke v4.6.5.

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
