## v5.1.5 — Perbaikan kotak pada teks glitch header
- Menghilangkan kotak di belakang teks COMMAND CENTER. Penyebabnya garis scan yang menutupi seluruh kotak teks dan glow teks yang ikut membentuk pecahan warna. Sekarang garis scan hanya berada di dalam huruf dan glow dibuat dengan drop-shadow yang mengikuti bentuk huruf.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.5.

## v5.1.4 — Pembersihan CSS
- Menghapus aturan CSS peninggalan versi lama yang sudah tidak punya elemen di halaman maupun skrip, serta deklarasi yang sepenuhnya tertimpa aturan lebih baru dengan selector yang sama. Ukuran styles.css turun dari sekitar 167 KB menjadi sekitar 122 KB.
- Tampilan tidak berubah: gaya komputasi seluruh elemen dibandingkan sebelum dan sesudah pembersihan (layar login, halaman utama, dan semua dialog, pada lima ukuran layar) dan hasilnya identik.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.4.

## v5.1.3 — Urutan tabel Barang Baru & Open TAG
- Urutan tabel (termasuk export Excel dan JPG) kini: KET1 (Belum pernah NPB ke toko paling atas, Stock exist masih >50% dari BPB paling bawah), lalu KET2, kemudian Hari terbanyak. Urutan PRDCD tidak lagi dipakai; baris dengan Hari yang sama tetap pada urutan sumber.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.3.
