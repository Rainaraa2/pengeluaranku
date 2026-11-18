# PengeluaranKu - Aplikasi Pencatat Pengeluaran Pribadi

**PengeluaranKu** adalah aplikasi web pencatat pengeluaran keuangan pribadi yang elegan, minimalis, dan modern dengan perpaduan tema **White & Lilac Gradient** (Soft Lavender Aesthetic).

Kini dilengkapi dengan fitur **Progressive Web App (PWA)** sehingga aplikasi dapat dipasang langsung ke **Desktop Windows/Mac** atau **Layar Utama HP**, lengkap dengan logo resmi di desktop, serta konfigurasi siap deploy ke **Netlify**.

---

## 🌟 Fitur Utama

1. **Desktop App & Mobile PWA (Dapat Diunduh)**:
   - Tombol **"Pasang di Desktop"** langsung di Navbar, Sidebar, dan Pengaturan.
   - Ikon logo resmi di Desktop komputer dan Start Menu.
   - Jendela aplikasi mandiri (*standalone window*) tanpa address bar browser.
   - Berjalan secara offline dengan Service Worker.

2. **Dashboard & Analisis Keuangan**:
   - Kartu ringkasan utama: **Total Pengeluaran Bulan Ini**, **Jumlah Transaksi**, **Pengeluaran Terbesar**, dan **Kategori Tertinggi**.
   - Filter periode interaktif (Bulan dan Tahun) yang secara otomatis memperbarui seluruh data dashboard.
   - **Pie Chart (Distribusi Kategori)**: Menampilkan persentase pengeluaran per kategori, nominal, dan palet warna lilac/lavender.
   - **Bar Chart (Tren Pengeluaran Bulanan)**: Menampilkan perbandingan nominal 12 bulan dalam setahun.
   - Daftar 5 transaksi terbaru beserta tautan cepat ke riwayat lengkap.

3. **Form Tambah & Edit Pengeluaran**:
   - **Nama Barang**: Input teks dengan validasi wajib diisi.
   - **Tanggal**: Date picker fleksibel (default hari ini, bisa memilih tanggal sebelumnya).
   - **Kategori**: Dropdown 9 kategori standar dengan warna dan ikon khas.
   - **Jumlah (Rupiah Otomatis)**: Input angka yang otomatis memformat ke Rupiah (`Rp 25.000`).
   - **Keterangan**: Catatan opsional untuk detail transaksi.
   - Tombol Simpan, Reset, dan Batal dengan notifikasi toast responsif.

4. **Riwayat Transaksi Lengkap (CRUD)**:
   - Pencarian *real-time* berdasarkan nama barang, kategori, atau keterangan.
   - Filter multikriteria: Bulan, Tahun, Kategori, Rentang Tanggal, dan Nominal.
   - Pengurutan: Terbaru, Terlama, Nominal Terbesar, dan Nominal Terkecil.
   - Penghitungan otomatis total transaksi dan akumulasi nominal sesuai filter aktif.
   - Edit transaksi (*auto-fill* data lama) dan Hapus transaksi dengan modal konfirmasi.

5. **Laporan & Ringkasan Bulanan**:
   - Ringkasan 5 KPI keuangan (Total, Jumlah, Rata-rata, Terbesar, Terkecil).
   - Rincian tabel kategori terurut dari nominal terbesar beserta persentase dan progress bar.
   - **Download Excel (.xlsx)**: Menggunakan SheetJS (`xlsx`) dengan 2 sheet rapi (*Detail Pengeluaran* dan *Ringkasan Laporan*).
   - **Download PDF (.pdf)**: Menggunakan `jspdf` dan `jspdf-autotable` dengan tata letak laporan rapi beraksen lilac.

6. **Backup & Restore Data JSON**:
   - **Backup**: Ekspor seluruh transaksi tersimpan ke file JSON standar.
   - **Restore Aman**: Validasi format berkas JSON dengan 2 pilihan mode: *Mode Gabungkan Data (Merge)* atau *Mode Ganti Semua Data (Replace)*.

7. **Penyimpanan Lokal Persisten**:
   - Tersimpan offline di browser menggunakan **IndexedDB (Dexie.js)**.

---

## 🚀 Panduan Hosting ke Netlify

Folder `dist/` dan konfigurasi `netlify.toml` serta `_redirects` sudah disiapkan secara optimal.

### Metode 1: Netlify Drop (Instan 30 Detik, Tanpa Git)
1. Jalankan build aplikasi:
   ```bash
   npm run build
   ```
2. Buka peramban ke **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
3. Buka folder `c:\coding\web\pengeluaranku\dist` di File Explorer Anda.
4. Tarik (*drag & drop*) folder `dist` tersebut ke area upload Netlify Drop.
5. Situs Anda langsung aktif dan memiliki tautan HTTPS gratis (misal: `https://pengeluaranku.netlify.app`).

### Metode 2: Hubungkan Repositori Git (Auto-Deploy saat Push)
1. Push project ini ke GitHub / GitLab.
2. Di dashboard Netlify, pilih **"Add new site"** > **"Import an existing project"**.
3. Pilih repositori Anda. Netlify otomatis mendeteksi berkas `netlify.toml`:
   - **Base directory**: `pengeluaranku` (atau kosongkan jika repo ada di root)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Klik **Deploy site**.

### Metode 3: Netlify CLI
```bash
cd c:\coding\web\pengeluaranku
npm run build
npx netlify deploy --prod --dir=dist
```

---

## 💻 Panduan Memasang Logo Aplikasi di Desktop (PWA)

1. Buka aplikasi di Google Chrome, Microsoft Edge, atau Brave.
2. Di pojok kanan atas kolom alamat (URL bar), klik ikon komputer kecil bertuliskan **"Install / Pasang PengeluaranKu"** (atau klik tombol **"Pasang di Desktop"** di dalam aplikasi).
3. Klik **Install**.
4. Ikon logo **PengeluaranKu** akan langsung terpasang di **Desktop Windows/Mac** Anda!
5. Anda dapat membuka aplikasi kapan saja seperti aplikasi desktop bawaan tanpa perlu membuka browser secara manual.
