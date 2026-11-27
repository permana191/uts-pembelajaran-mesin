# Panduan Penyusunan Laporan Artikel Ilmiah (UTS Pembelajaran Mesin)

Dokumen ini berisi rincian metrik kuantitatif, daftar gambar (tema putih 300 DPI), dan struktur penulisan artikel ilmiah sesuai ketentuan tugas (6–10 halaman, format 2 kolom, Times New Roman 10 pt, spasi 1, Turnitin < 25%, AI Detection < 30%).

## 1. Usulan Judul Artikel
**Komparasi Algoritma Multiple Linear Regression dan Random Forest Regressor dalam Prediksi Tingkat Emisi Karbon Dioksida ($	ext{CO}_2$) Kendaraan Bermotor**

## 2. Daftar Gambar Siap Pakai (Folder `app/static/charts/`)
Seluruh 10 grafik berikut telah disediakan dalam tema putih bersih resolusi 300 DPI:
1. `01_distribusi_target_co2.png` — Distribusi Target Emisi $	ext{CO}_2$ ($N = 6.281$, Mean = $251,16	ext{ g/km}$, Median = $246,00	ext{ g/km}$).
2. `02_korelasi_heatmap_fitur.png` — Matriks Korelasi Pearson Antar Variabel Numerik.
3. `03_emisi_per_jenis_bahan_bakar.png` — Perbandingan Distribusi Emisi $	ext{CO}_2$ per Jenis Bahan Bakar (`X`, `Z`, `D`, `E`).
4. `04_emisi_per_kelas_kendaraan.png` — Peringkat Rata-Rata Emisi $	ext{CO}_2$ pada 16 Kelas Kendaraan.
5. `05_hubungan_konsumsi_bbm_vs_co2.png` — Visualisasi Gradien Stoikiometri Konsumsi Bahan Bakar vs Emisi $	ext{CO}_2$.
6. `06_hubungan_kapasitas_mesin_silinder_co2.png` — Hubungan Kapasitas Mesin (L) dan Jumlah Silinder terhadap Emisi $	ext{CO}_2$.
7. `07_perbandingan_metrik_model.png` — Perbandingan Kuantitatif $R^2$, MAE, dan RMSE antara MLR dan Random Forest.
8. `08_actual_vs_predicted_comparison.png` — Scatter Plot *Actual vs Predicted* pada Data Uji.
9. `09_analisis_residual_error.png` — Plot Residual dan Distribusi Kepadatan Galat Prediksi.
10. `10_feature_importance_rf.png` — Peringkat 10 Fitur Paling Berpengaruh pada Random Forest Regressor.

## 3. Rangkuman Angka Kunci untuk Tabel Hasil
- **Dataset Mentah:** 7.385 baris, 12 kolom, 0 *missing values*.
- **Pembersihan Data:** 1.103 baris duplikat identik dihapus + 1 observasi anomali `Fuel Type = 'N'` dihapus $ightarrow$ **6.281 baris unik** (5.024 data latih, 1.257 data uji).
- **Multiple Linear Regression (Data Uji Bersih):** $R^2 = 0,99223$, $	ext{MAE} = 3,074	ext{ g/km}$, $	ext{MSE} = 28,443$, $	ext{RMSE} = 5,333	ext{ g/km}$, 5-Fold CV $R^2 = 0,99164$.
- **Random Forest Regressor (Data Uji Bersih):** $R^2 = 0,99647$, $	ext{MAE} = 2,003	ext{ g/km}$, $	ext{MSE} = 12,932$, $	ext{RMSE} = 3,596	ext{ g/km}$, 5-Fold CV $R^2 = 0,99513$.
