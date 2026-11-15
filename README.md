## v4.4.6
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
