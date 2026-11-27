## v5.1.3 — Urutan tabel Barang Baru & Open TAG
- Urutan tabel (termasuk export Excel dan JPG) kini: KET1 (Belum pernah NPB ke toko paling atas, Stock exist masih >50% dari BPB paling bawah), lalu KET2, kemudian Hari terbanyak. Urutan PRDCD tidak lagi dipakai; baris dengan Hari yang sama tetap pada urutan sumber.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.3.

## v5.1.2 — Glitch diperlambat dan form login ikut glitch
- Glitch COMMAND CENTER diperlambat sekitar 3x (jeda antar frame dan antar ledakan lebih panjang); kecepatan mudah diatur lewat konstanta `SLOW` di skrip glitch.
- Form login kini ikut ber-glitch dengan gaya yang sama (pita bergeser, pecahan warna hijau, garis scan, ledakan acak) tetapi lebih halus agar isian password tetap terbaca. Efek hanya berjalan saat form login tampil.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.2.

## v5.1.1 — Glitch COMMAND CENTER bergaya TV rusak
- Teks "COMMAND CENTER" kini glitch terus-menerus: pita horizontal bergeser acak, pecahan warna hijau (hijau, hijau kebiruan, hijau limau), garis scan, serta ledakan acak yang melebarkan dan merobek teks lalu kembali normal.
- Efek memakai filter SVG dan skrip kecil; dimatikan otomatis jika perangkat memilih "kurangi animasi" dan dijeda saat tab tidak aktif.
- Penanda versi halaman, JavaScript, manifest, dan cache Service Worker dinaikkan ke v5.1.1.
