# Riset: Pajak Penghasilan Dokter di Indonesia (per 2025/2026)

Dokumen ini merangkum aturan PPh Orang Pribadi yang relevan untuk dokter di Indonesia, sebagai dasar untuk membangun kalkulator pajak berbasis HTML. Fokus: dokter dengan penghasilan campuran — gaji sebagai pegawai (RS/klinik/PNS) **dan/atau** jasa medis sebagai bukan pegawai (praktik mandiri, jasa di RS mitra, honor).

> Disclaimer: ini rangkuman untuk kebutuhan pemodelan aplikasi, bukan nasihat pajak resmi. Aturan turunan (PMK/PER) bisa berubah; tandai versi tahun pajak di aplikasi.

---

## 1. Klasifikasi status dokter untuk tujuan pajak

Ini adalah keputusan pertama yang menentukan skema mana yang dipakai:

| Status | Contoh | Skema pemotongan |
|---|---|---|
| **Pegawai tetap** | Dokter PNS/ASN, dokter kontrak tetap RS dengan gaji bulanan & ikatan kerja | PPh 21 pegawai — TER bulanan + rekonsiliasi tahunan tarif Pasal 17 |
| **Bukan pegawai (pekerjaan bebas)** | Dokter praktik mandiri, dokter tamu/mitra RS yang dibayar per tindakan/jasa medis, honor seminar | PPh 21 bukan pegawai (dipotong pihak pembayar) — final di muka, tapi tetap direkonsiliasi di SPT Tahunan |
| **Usaha lain** | Apotek, klinik milik sendiri, distribusi alkes | PPh Final UMKM 0,5% (PP 55/2022, dulu PP 23/2018) **jika** berbentuk usaha, bukan jasa profesi |

**Poin penting:** Penghasilan dari **jasa profesi dokter** (baik praktik mandiri maupun jasa di RS) termasuk kategori **"pekerjaan bebas / tenaga ahli"**, dan secara eksplisit **dikecualikan** dari tarif final UMKM 0,5% PP 23/2018 & PP 55/2022. Jadi dokter **tidak bisa** memilih skema 0,5% untuk penghasilan praktiknya — harus dihitung dengan Norma Penghitungan Penghasilan Neto (NPPN) atau pembukuan, lalu kena tarif progresif Pasal 17.

Banyak dokter punya **kombinasi** kedua status ini sekaligus (gaji tetap RS + jasa medis lepas + praktik pribadi) — semuanya digabung di SPT Tahunan.

---

## 2. Skema A — Dokter sebagai pegawai tetap (gaji bulanan)

### 2.1 Pemotongan bulanan (Jan–Nov): Tarif Efektif Rata-rata (TER)
Sejak PP 58/2023 & PMK 168/2023 (berlaku 1 Jan 2024), pemberi kerja **tidak lagi** menghitung biaya jabatan/PTKP setiap bulan. Cukup:

```
PPh 21 bulanan = Tarif TER × Penghasilan bruto bulanan
```

Tarif TER dikelompokkan 3 kategori berdasarkan status PTKP:

| Kategori TER | Status PTKP |
|---|---|
| A | TK/0, TK/1, K/0 |
| B | TK/2, TK/3, K/1, K/2 |
| C | K/3 |

Masing-masing kategori punya tabel tarif berjenjang berdasarkan besaran penghasilan bruto bulanan (puluhan baris, 0%–34%). Tabel lengkap ada di Lampiran PMK 168/2023.

### 2.2 Masa pajak Desember: rekonsiliasi tahunan (tarif Pasal 17)
Di masa pajak terakhir (Desember, atau saat berhenti kerja), pemberi kerja **wajib** menghitung ulang PPh 21 setahun penuh dengan cara konvensional:

```
Penghasilan bruto setahun (gaji + tunjangan + bonus + THR, dll)
– Biaya jabatan (5% × bruto, maks Rp 6.000.000/tahun)
– Iuran pensiun/JHT/JP yang dibayar sendiri pegawai
= Penghasilan neto setahun
– PTKP
= Penghasilan Kena Pajak (PKP)
× Tarif Pasal 17 (progresif, lihat §4)
= PPh 21 terutang setahun
– PPh 21 yang sudah dipotong (TER) Jan–Nov
= PPh 21 masa Desember (kurang/lebih bayar)
```

**Catatan implementasi:** karena TER hanya estimasi bulanan, angka yang benar-benar menentukan pajak terutang setahun **selalu** rumus Pasal 17 di atas. Untuk kalkulator "berapa pajak yang harus dibayar", kita bisa langsung pakai rumus tahunan ini tanpa perlu mengimplementasikan seluruh tabel TER (TER hanya relevan kalau ingin menampilkan estimasi potongan bulanan payroll).

---

## 3. Skema B — Dokter sebagai bukan pegawai (jasa medis / praktik)

Ini skema yang paling sering bikin bingung karena berubah signifikan mulai 2024.

### 3.1 Dasar pengenaan: 50% dari penghasilan bruto
```
PPh 21 dipotong = Tarif Pasal 17 × (50% × Penghasilan bruto per periode)
```
- **Penghasilan bruto** untuk dokter praktik di RS/klinik = jasa dokter yang dibayar pasien **sebelum** dipotong bagi hasil RS (bukan net setelah potongan RS).
- Berlaku untuk honorarium, jasa profesi, komisi, dsb dari pemberi kerja/pemotong (RS, klinik, event, dsb).

### 3.2 Perubahan penting sejak PMK 168/2023 (berlaku 2024)
- **Dihapus**: pembedaan "penghasilan berkesinambungan" vs "tidak berkesinambungan" dan akumulasi penghasilan bulan-berjalan yang dulu bikin tarif naik progresif dalam tahun berjalan.
- **Sekarang**: tarif Pasal 17 diterapkan **per masa pajak (per pembayaran/bulan) secara tidak kumulatif** — setiap bulan dihitung dari nol lagi.
- **Efek samping**: karena tiap bulan "reset" ke tarif terendah (5%), potongan bulanan cenderung lebih kecil dibanding penghasilan setahun yang sebenarnya sudah masuk bracket lebih tinggi. Ini menyebabkan **kurang bayar besar saat SPT Tahunan** — banyak dokter kaget karena potongan bulanan terasa kecil tapi tagihan tahunan besar. Ini poin edukasi penting untuk ditampilkan di aplikasi.

### 3.3 NPWP vs tanpa NPWP
- Tanpa NPWP: tarif +20% lebih tinggi dari tarif normal.
- Pengecualian: kalau NIK yang divalidasi sudah dipakai sebagai NPWP di sistem coretax / e-Bupot, surcharge 20% ini tidak berlaku (PENG-6/PJ.09/2024).

### 3.4 Contoh alur (dokter mitra RS, dibayar bulanan)
| Bulan | Jasa dokter (bruto) | DPP (50%) | Tarif | PPh 21 dipotong |
|---|---|---|---|---|
| Jan | Rp 50.000.000 | Rp 25.000.000 | 5% | Rp 1.250.000 |
| Mar | Rp 50.000.000 | Rp 25.000.000 | 5% | Rp 1.250.000 |
| Agu | Rp 50.000.000 | Rp 25.000.000 | 5% | Rp 1.250.000 |

Total dipotong sepanjang tahun: Rp 3.750.000 — **tapi ini bukan pajak final**. Di SPT Tahunan, penghasilan ini digabung dengan semua penghasilan lain, dihitung ulang pakai Pasal 17 atas total setahun, dan potongan bulanan di atas hanya jadi **kredit pajak** (pengurang), bukan pajak final.

### 3.5 Praktik mandiri (pasien bayar langsung ke dokter, tidak lewat pemotong)
Kalau dokter buka praktik sendiri dan pasien membayar langsung (tidak ada pihak ketiga yang wajib memotong PPh 21), tidak ada pemotongan di muka. Dokter menghitung sendiri penghasilan neto praktiknya dan membayar sendiri lewat **PPh Pasal 25** (angsuran bulanan) + pelunasan di SPT Tahunan (Pasal 29).

Untuk menghitung penghasilan neto dari praktik, dokter (omzet < Rp 4,8 miliar/tahun) boleh pilih:

**a) Norma Penghitungan Penghasilan Neto (NPPN)**
```
Penghasilan neto = Penghasilan bruto praktik × % Norma
```
- Untuk profesi **dokter**, persentase norma = **50%** dari omzet (berlaku untuk 10 ibu kota provinsi besar — Medan, Palembang, Jakarta, Bandung, Semarang, Surabaya, Denpasar, Manado, Makassar, Pontianak — maupun ibu kota provinsi/daerah lainnya; sumber yang ditemukan konsisten menyebut 50% merata untuk profesi dokter).
- Syarat: wajib memberitahukan pemakaian NPPN ke DJP dalam 3 bulan pertama tahun pajak berjalan. Kalau tidak memberitahukan, dianggap wajib pembukuan.
- Tidak perlu bukukan biaya operasional detail — cukup catat omzet bruto.

**b) Pembukuan (akuntansi biasa)**
```
Penghasilan neto = Penghasilan bruto – Biaya operasional yang diakui fiskal
```
- Wajib untuk omzet ≥ Rp 4,8 miliar/tahun, atau kalau dokter memilih ini secara sukarela (biasanya menguntungkan kalau biaya operasional riil > 50% omzet, misal sewa klinik, alat, staf, obat).

---

## 4. Tarif Pasal 17 UU PPh (berlaku sejak UU HPP 2021, masih berlaku 2025/2026)

| Lapisan PKP | Tarif |
|---|---|
| Rp 0 – Rp 60.000.000 | 5% |
| > Rp 60.000.000 – Rp 250.000.000 | 15% |
| > Rp 250.000.000 – Rp 500.000.000 | 25% |
| > Rp 500.000.000 – Rp 5.000.000.000 | 30% |
| > Rp 5.000.000.000 | 35% |

Progresif berjenjang (bukan flat) — dihitung berdasarkan Penghasilan Kena Pajak (PKP) tahunan **setelah** dikurangi PTKP.

---

## 5. PTKP (Penghasilan Tidak Kena Pajak) tahunan

Basis: Rp 54.000.000 (Wajib Pajak sendiri), + Rp 4.500.000 kalau kawin, + Rp 4.500.000 per tanggungan (maks 3 tanggungan).

| Status | PTKP/tahun |
|---|---|
| TK/0 (lajang, 0 tanggungan) | Rp 54.000.000 |
| TK/1 | Rp 58.500.000 |
| TK/2 | Rp 63.000.000 |
| TK/3 | Rp 67.500.000 |
| K/0 (kawin, 0 tanggungan) | Rp 58.500.000 |
| K/1 | Rp 63.000.000 |
| K/2 | Rp 67.500.000 |
| K/3 | Rp 72.000.000 |

(Berlaku juga penghasilan istri digabung suami secara default, kecuali istri punya NPWP terpisah dan penghasilan dipisah — nuansa ini bisa jadi opsi lanjutan, tidak wajib di versi pertama kalkulator.)

---

## 6. Menggabungkan semua penghasilan — SPT Tahunan Formulir 1770

Dokter dengan penghasilan dari pekerjaan bebas **wajib** lapor pakai **Formulir 1770** (bukan 1770 S/SS yang untuk karyawan biasa tanpa usaha/pekerjaan bebas).

Alur penghitungan pajak terutang setahun:
```
Penghasilan neto dari pekerjaan (gaji, dari bukti potong 1721-A1/A2, kalau ada)
+ Penghasilan neto dari pekerjaan bebas (jasa medis, NPPN atau pembukuan)
+ Penghasilan neto lainnya (jika ada, di luar yang final)
= Total penghasilan neto
– PTKP
= Penghasilan Kena Pajak (PKP), dibulatkan ke bawah ribuan terdekat
× Tarif Pasal 17 (progresif)
= PPh terutang setahun

PPh terutang setahun
– Kredit pajak (PPh 21 yang sudah dipotong pemberi kerja + PPh 21 yang dipotong pemotong jasa medis + PPh 25 yang sudah disetor sendiri)
= PPh Pasal 29 (Kurang Bayar) atau Lebih Bayar
```

### PPh Pasal 25 (angsuran bulanan tahun berjalan)
Untuk dokter dengan penghasilan usaha/pekerjaan bebas signifikan, DJP mewajibkan angsuran bulanan tahun berjalan, dihitung dari SPT tahun sebelumnya:
```
PPh 25 per bulan ≈ (PPh terutang tahun lalu – kredit pajak yang dipotong pihak lain tahun lalu) / 12
```
Ini relevan untuk fitur "proyeksi angsuran tahun depan", tapi bisa jadi fitur v2 — v1 cukup fokus ke penghitungan pajak terutang tahunan.

---

## 7. Ringkasan yang perlu ditampilkan ke pengguna (kalkulator)

Untuk MVP, minimal input yang dibutuhkan dari pengguna:
1. Status PTKP (TK/K + jumlah tanggungan 0–3)
2. Sumber penghasilan (bisa lebih dari satu, dicentang):
   - **Gaji pegawai tetap** (kalau ada): total bruto setahun, biaya jabatan otomatis dihitung, iuran pensiun/JHT/JP yang dibayar sendiri (opsional)
   - **Jasa medis/honor sebagai bukan pegawai**: total bruto setahun (bisa dari beberapa RS/klinik) — dan opsional, total PPh 21 yang sudah dipotong pemberi kerja (dari bukti potong) untuk dihitung sebagai kredit pajak
   - **Praktik mandiri** (pasien bayar langsung): omzet bruto setahun → pilih NPPN (default 50%) atau pembukuan (input biaya)
3. Output:
   - Total penghasilan neto
   - PTKP yang dipakai
   - PKP
   - Rincian pajak per lapisan tarif (breakdown 5/15/25/30/35%)
   - Total PPh terutang setahun
   - Total kredit pajak (potongan yang sudah dibayar di muka)
   - Kurang bayar / lebih bayar
   - Catatan edukasi: kenapa potongan bulanan terasa kecil tapi tagihan tahunan besar (poin §3.2)

---

## 8. Asumsi & hal yang perlu dikonfirmasi sebelum coding

- **NPPN 50% untuk dokter**: sumber yang ditemukan konsisten (beberapa artikel konsultan pajak) menyebut 50% merata. Kalau butuh kepastian hukum penuh, rujukan resminya KEP-536/PJ./2000 (masih berlaku, belum ada revisi khusus soal ini) — cukup solid untuk kalkulator estimasi, tapi sebaiknya dilabeli "estimasi, bukan nasihat pajak resmi" di UI.
- **TER bulanan** tidak diimplementasi penuh di v1 (tabelnya panjang per kategori) — cukup dijelaskan sebagai konteks, kalkulator fokus ke **pajak terutang tahunan** yang jadi angka final yang benar-benar harus dibayar/dilaporkan.
- **Suami-istri digabung/pisah harta**, **zakat/sumbangan wajib pengurang penghasilan**, **kompensasi kerugian tahun lalu**: nuansa lanjutan, tidak wajib di MVP.
- **PPh Pasal 25 angsuran tahun berjalan**: v2, bukan MVP.

---

## Sumber

- [Panduan Pajak Dokter Praktik Mandiri – Medisy](https://medisy.id/article/panduan-pajak-dokter-praktik-mandiri-2026-cara-hitung-norma-nppn-agar-tidak-salah-bayar)
- [PPh Profesi Dokter Menjadi Lebih Tinggi? – DJP](https://www.pajak.go.id/en/node/114896)
- [Dokter – DJP](https://pajak.go.id/en/node/37752)
- [Contoh Penghitungan PPh Pasal 21 Jasa Dokter Praktik di RS/Klinik – DDTC News](https://news.ddtc.co.id/berita/nasional/1799732/contoh-penghitungan-pph-pasal-21-jasa-dokter-praktik-di-rs-atau-klinik)
- [Update Cara Hitung PPh 21 Bukan Pegawai Sesuai PMK 168/2023 – Ortax](https://ortax.org/penghitungan-pph-21-bukan-pegawai-dengan-penghasilan-berkesinambungan)
- [Perhitungan Pajak Dokter Terbaru 2024 – Proconsult](https://proconsult.id/perhitungan-pajak-dokter-terbaru-2024/)
- [PTKP Tarif Efektif Rata-Rata (TER) PPh Pasal 21 – Pratama Indomitra Institute](https://institute.pratamaindomitra.co.id/ptkp-tarif-efektif-rata-rata-ter-pph-pasal-21)
- [Ini Contoh Jasa Pekerjaan Bebas yang Tak Bisa Pakai PPh Final 0,5% – DDTC News](https://news.ddtc.co.id/berita/nasional/45167/ini-contoh-jasa-pekerjaan-bebas-yang-tak-bisa-pakai-pph-final-05)
