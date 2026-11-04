# Inventory v2.6.0

Perubahan:
- Outline tombol diganti menjadi garis putus-putus berwarna kuning.
- Garis bawah header ditambahkan dengan garis putus-putus kuning.
- Gradasi tombol proses 120 derajat dan perbaikan ekspor BRD dari versi sebelumnya tetap dipertahankan.
- Versi header aplikasi, footer, stylesheet, README, dan cache Service Worker diseragamkan ke v2.6.0.

Ekstrak ZIP ini; `index.html`, `app.js`, `styles.css`, dan `sw.js` berada langsung di folder utama.


## v2.6.0 — Check Item terintegrasi
- Tombol Check Item terintegrasi langsung pada halaman Inventory.
- Memakai PRODMAST, POM G113, LaporanHistoryTag, dan hasil perhitungan Master Stock Inventory yang sudah tersedia.
- LaporanLPPvsPlano masuk kategori Tarikan LWA; REG 4 bulan masuk Tarikan Harian G113.
- Proses bertahap: hasil tahap pertama tampil pada halaman Inventory, popup SS-FT, lalu popup hasil akhir.
