## v2.2.9 — Integrasi BRD ke dalam Inventory

- Seluruh logika BRD Engine telah digabung langsung ke `app.js` dan berjalan pada dokumen Inventory yang sama; tidak ada iframe, file HTML/JS engine terpisah, atau komunikasi `postMessage`.
- Seluruh logika konversi BRD dipertahankan dan dipanggil langsung melalui fungsi internal `convertBrdFiles` dari alur proses Inventory.
- Pilihan ekspor tetap mencakup BRD.DBF, BRD.CSV, MSTG/MSTXH.DBF, NPB.CSV (Alokasi), BPB.CSV, dan Detail NPB.CSV.
- Upload BRD tetap menggunakan File Manager Inventory dan dapat memproses beberapa file sekaligus.
- Cache Service Worker dinaikkan ke v2.2.9.

Catatan: pemeriksaan sintaks dan integrasi statis dilakukan; proses ekspor perlu diuji dengan file BRD operasional.
