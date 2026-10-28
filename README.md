# Inventory PWA — v1.2.0

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


## Ekspor Stock Out DC (v1.2.0)
Unggah `LaporanStokOutDCINew` bersama bahan Master Stock. Setelah proses, unduh file `MASTER STOCK` dan `Stock Out DC` secara terpisah. Stock Out DC memakai workbook acuan `assets-stockout-template.xlsx`, menambahkan sheet tanggal H-1, dan memilih PRDCD yang `STOCK_OUT = Y`. Baris/detail disalin dari sheet tanggal sebelumnya yang tersedia agar format dan strukturnya tetap sama.
