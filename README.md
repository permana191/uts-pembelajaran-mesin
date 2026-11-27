<div align="center">

# CARBONTEL AI // Vehicular CO<sub>2</sub> Emission Telemetry
### Prediksi Tingkat Emisi Karbon Dioksida ($	ext{CO}_2$) Kendaraan Bermotor Berbasis Spesifikasi Mesin dan Konsumsi Bahan Bakar Menggunakan *Multiple Linear Regression* & *Random Forest Regressor*

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5.1-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**Disusun oleh:** Sigit Miraj Permana (`301240037`) — Kelas 5B  
**Program Studi:** Teknik Informatika, Fakultas Teknologi Informasi — Universitas Bale Bandung (FTI UNIBBA)  
**Mata Kuliah:** Pembelajaran Mesin (*Machine Learning*) — UTS Semester 5

</div>

---

## Daftar Isi Interaktif
- [1. Ringkasan Proyek & Latar Belakang](#1-ringkasan-proyek--latar-belakang)
- [2. Arsitektur Struktur Direktori Proyek](#2-arsitektur-struktur-direktori-proyek)
- [3. Pembahasan Database & Skema Dataset](#3-pembahasan-database--skema-dataset)
- [4. Pipeline Pra-Pemrosesan & Pemodelan ML](#4-pipeline-pra-pemrosesan--pemodelan-ml)
- [5. Hasil Evaluasi Eksperimental](#5-hasil-evaluasi-eksperimental)
- [6. Fitur Antarmuka Web Cyberpunk Telemetry (6 Menu Interaktif)](#6-fitur-antarmuka-web-cyberpunk-telemetry-6-menu-interaktif)
- [7. Dokumentasi REST API Backend](#7-dokumentasi-rest-api-backend)
- [8. Panduan Instalasi Lokal & Deployment Vercel](#8-panduan-instalasi-lokal--deployment-vercel)

---

## 1. Ringkasan Proyek & Latar Belakang

Sektor transportasi darat merupakan salah satu kontributor utama emisi gas rumah kaca global berupa karbon dioksida ($	ext{CO}_2$). **CARBONTEL AI** merupakan sistem analitik dan simulasi berbasis web yang mengimplementasikan dua paradigma pembelajaran mesin (*supervised regression*)—yakni **Multiple Linear Regression** sebagai model *baseline* parametrik dan **Random Forest Regressor** sebagai model *ensemble* non-linier—untuk memprediksi tingkat emisi gas buang kendaraan ($	ext{g/km}$) berdasarkan kapasitas mesin, konfigurasi silinder, transmisi, jenis bahan bakar, serta konsumsi bahan bakar kota dan jalan tol.

---

## 2. Arsitektur Struktur Direktori Proyek

Struktur repositori ini mengikuti standar arsitektur proyek *Machine Learning* dengan penempatan `app.py` dan `vercel.json` di direktori *root* untuk memastikan kemudahan *serverless deployment* pada platform Vercel:

```text
UTS_ML_Prediksi_Emisi_CO2_301240037/
├── app.py                                 # Entrypoint utama Flask di root (siap Vercel & lokal)
├── vercel.json                            # Konfigurasi routing & build serverless Vercel
├── requirements.txt                       # Daftar dependensi Python teroptimasi
├── Procfile                               # Konfigurasi deployment Gunicorn (Railway/Render/Heroku)
├── Dockerfile                             # Konfigurasi container Docker
├── README.md                              # Dokumentasi interaktif & komprehensif proyek
├── data/
│   ├── CO2 Emissions_Canada.csv           # Dataset mentah resmi (7.385 baris, 12 atribut)
│   ├── Data Description.csv               # Kamus metadata kode transmisi & bahan bakar
│   └── co2_cleaned.csv                    # Dataset bersih hasil deduplikasi & filtering (6.281 baris)
├── models/
│   ├── mlr_co2_model.joblib               # Pipeline terlatih Multiple Linear Regression (2.8 KB)
│   ├── rf_co2_model.joblib                # Pipeline terlatih Random Forest Regressor (compressed)
│   └── model_metadata.json                # Metadata statistik, metrik evaluasi & sampel dataset
├── notebooks/
│   ├── CO2_Emission_Prediction_ML.ipynb   # Notebook interaktif EDA & pelatihan model (Google Colab)
│   └── train_model.py                     # Skrip otomasi pelatihan & ekspor model
├── app/
│   ├── app.py                             # Entrypoint mirror sesuai struktur standar akademik
│   ├── static/
│   │   ├── css/style.css                  # Stylesheet Dark Mode Cyberpunk + animasi GPU-accelerated
│   │   ├── js/main.js                     # Controller Vanilla JS ultra-efisien (Event Delegation)
│   │   └── charts/                        # 10 grafik evaluasi & EDA (300 DPI, tema putih jurnal)
│   └── templates/
│       └── index.html                     # Antarmuka web 6 menu interaktif dengan Right Sidebar
└── docs/
    └── Panduan_Laporan_Artikel_UTS.md     # Referensi angka & daftar gambar untuk artikel ilmiah
```

---

## 3. Pembahasan Database & Skema Dataset

Dataset yang digunakan bersumber dari portal data terbuka Pemerintah Kanada (*Natural Resources Canada*) melalui repositori Kaggle (*CO2 Emission by Vehicles*), terdiri atas **7.385 rekaman kendaraan** dan **12 kolom atribut** dengan kelengkapan **100% (*0 missing values*)**.

<details>
<summary><b>Klik untuk Membuka Kamus Skema & Tipe Data Lengkap (12 Kolom)</b></summary>

| No | Nama Kolom | Tipe Data | Peran dalam Model | Deskripsi & Rentang Nilai |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `Make` | `string` | Eksplorasi | Merek pabrikan kendaraan (42 merek unik, misal: Ford, Toyota, BMW, Bugatti). |
| 2 | `Model` | `string` | Eksplorasi | Varian model kendaraan (2.053 varian unik; dieliminasi saat pelatihan karena kardinalitas tinggi). |
| 3 | `Vehicle Class` | `categorical` | **Fitur Input ($X_1$)** | Kategori bodi & segmen kendaraan (16 kelas: *Compact, SUV-Small, Mid-Size, Pickup*, dll.). |
| 4 | `Engine Size(L)` | `float64` | **Fitur Input ($X_2$)** | Kapasitas volume ruang bakar mesin dalam liter ($0,9	ext{ L} - 8,4	ext{ L}$). |
| 5 | `Cylinders` | `int64` | **Fitur Input ($X_3$)** | Jumlah silinder mesin ($3, 4, 5, 6, 8, 10, 12, 16$ silinder). |
| 6 | `Transmission` | `categorical` | **Fitur Input ($X_4$)** | Kode sistem transmisi (`A`, `AM`, `AS`, `AV`, `M`) beserta jumlah percepatan (`3–10`). |
| 7 | `Fuel Type` | `categorical` | **Fitur Input ($X_5$)** | Jenis bahan bakar: `X` (*Regular Gasoline*), `Z` (*Premium*), `D` (*Diesel*), `E` (*Ethanol E85*). |
| 8 | `Fuel Consumption City (L/100 km)` | `float64` | **Fitur Input ($X_6$)** | Konsumsi bahan bakar pada siklus berkendara perkotaan ($4,2 - 30,6	ext{ L/100 km}$). |
| 9 | `Fuel Consumption Hwy (L/100 km)` | `float64` | **Fitur Input ($X_7$)** | Konsumsi bahan bakar pada siklus jalan bebas hambatan/tol ($4,0 - 20,6	ext{ L/100 km}$). |
| 10 | `Fuel Consumption Comb (L/100 km)` | `float64` | **Fitur Input ($X_8$)** | Konsumsi bahan bakar kombinasi berbobot ($55\%	ext{ City} + 45\%	ext{ Hwy}$). |
| 11 | `Fuel Consumption Comb (mpg)` | `int64` | Dieliminasi | Konversi konsumsi kombinasi dalam satuan imperial *miles per gallon* (kolinear terbalik). |
| 12 | `CO2 Emissions(g/km)` | `int64` | **Target ($Y$)** | Kadar emisi gas buang karbon dioksida dalam gram per kilometer ($96 - 522	ext{ g/km}$). |

</details>

<details>
<summary><b>Klik untuk Membuka Audit Temuan Kritis Pra-Pemrosesan Data</b></summary>

1. **Deduplikasi 1.103 Baris Identik ($14,94\%$):** Dataset mentah memuat rekaman survei lintas tahun di mana kendaraan dengan spesifikasi identik tercatat berulang kali. Penghapusan baris duplikat mencegah kebocoran evaluasi (*data leakage*) antara *training set* dan *testing set*.
2. **Eliminasi Anomali Kelas Tunggal (`Fuel Type = 'N'`):** Pada kode bahan bakar *Natural Gas* (`N`), hanya ditemukan **1 baris observasi** (*Chevrolet Impala Dual Fuel*). Baris tunggal ini dihapus agar pembagian data latih-uji tetap stabil.
3. **Efek Stoikiometri Bahan Bakar:** Rasio emisi $	ext{CO}_2$ per liter bahan bakar berbeda signifikan antar jenis bahan bakar: **Diesel (`D`)** menghasilkan rasio tertinggi ($26,89	ext{ g CO}_2$ per $	ext{L/100 km}$), diikuti **Bensin (`X`/`Z`)** ($pprox 23,31$), sedangkan **Ethanol E85 (`E`)** paling rendah per liternya ($16,32$). Perbedaan gradien kemiringan inilah yang berhasil ditangkap secara presisi oleh percabangan pohon keputusan pada **Random Forest Regressor**.

</details>

---

## 4. Pipeline Pra-Pemrosesan & Pemodelan ML

Alur rekayasa fitur dan pelatihan model dienkapsulasi ke dalam `sklearn.pipeline.Pipeline` agar transformasi fitur saat inferensi web identik 100% dengan fase pelatihan:

1. **Feature Encoding (`ColumnTransformer`):**
   - Fitur kategorikal (`Vehicle Class`, `Transmission`, `Fuel Type`) ditransformasi menggunakan `OneHotEncoder(handle_unknown='ignore')`.
   - Fitur numerik (`Engine Size`, `Cylinders`, `Fuel Consumption City`, `Hwy`, `Comb`) diteruskan langsung tanpa distorsi skala.
2. **Pembagian Data (*Train-Test Split*):** Rasio **80% Data Latih (5.024 baris)** dan **20% Data Uji (1.257 baris)** dengan `random_state=42`.
3. **Arsitektur Algoritma:**
   - **Multiple Linear Regression:** $\hat{y} = eta_0 + \sum_{j=1}^{p} eta_j x_j$
   - **Random Forest Regressor:** $\hat{y}_{RF}(x) = rac{1}{B} \sum_{b=1}^{B} T_b(x)$ dengan $B = 60$ pohon keputusan (`max_depth=16`).

---

## 5. Hasil Evaluasi Eksperimental

| Skenario Dataset | Algoritma | $R^2$ Score | MAE ($	ext{g/km}$) | MSE | RMSE ($	ext{g/km}$) | 5-Fold CV $R^2$ |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Dataset Deduplikasi** ($N = 6.281$) | **Random Forest Regressor** | **0,99647** | **2,003** | **12,932** | **3,596** | **0,99513** |
| **Dataset Deduplikasi** ($N = 6.281$) | Multiple Linear Regression | 0,99223 | 3,074 | 28,443 | 5,333 | 0,99164 |
| **Dataset Mentah** ($N = 7.385$) | Random Forest Regressor | 0,99679 | 1,716 | 11,042 | 3,323 | — |
| **Dataset Mentah** ($N = 7.385$) | Multiple Linear Regression | 0,99136 | 3,039 | 29,713 | 5,451 | — |

> **Analisis:** Random Forest Regressor berhasil menurunkan galat prediksi **RMSE sebesar 32,57%** (dari $5,333	ext{ g/km}$ menjadi $3,596	ext{ g/km}$) dibandingkan Multiple Linear Regression pada data uji bersih.

---

## 6. Fitur Antarmuka Web Cyberpunk Telemetry (6 Menu Interaktif)

Aplikasi web dirancang dengan tema **Dark Mode Cyberpunk Automotive HUD**, **Right-Aligned Sidebar**, animasi perpindahan tab berbasis akselerasi GPU (`transform` & `opacity`), serta JavaScript Vanilla ultra-ringan:

1. **`01 // Telemetry Overview`:** Ringkasan KPI akurasi model, grafik distribusi rata-rata emisi per kelas kendaraan, korelasi bahan bakar, dan tabel komparasi metrik evaluasi.
2. **`02 // Simulator Emisi CO2`:** Simulasi prediksi *real-time* dengan *slider* interaktif, 6 *preset* kendaraan dunia nyata (*Hyundai Ioniq Hybrid* hingga *Bugatti Chiron W16*), klasifikasi *Eco-Tier* (`A+` sampai `E`), kalkulasi jejak karbon tahunan ($	ext{kg/tahun}$), dan estimasi kebutuhan pohon penyerap karbon.
3. **`03 // Arena Komparasi`:** Perbandingan *head-to-head* hingga 5 konfigurasi kendaraan sekaligus dalam grafik batang interaktif dan matriks efisiensi tahunan.
4. **`04 // Eksplorasi Dataset`:** Tabel sampel dataset interaktif dengan pencarian merek/model, filter jenis bahan bakar (`X, Z, D, E`), filter kelas kendaraan, dan paginasi.
5. **`05 // Galeri Grafik Laporan`:** Koleksi lengkap **10 grafik resolusi tinggi (300 DPI)** bertema putih bersih standar jurnal ilmiah lengkap dengan fitur *Lightbox Zoom* dan unduhan `.png` satu klik untuk laporan artikel.
6. **`06 // Metodologi & Rumus`:** Dokumentasi persamaan matematis model, metrik regresi, dan temuan pra-pemrosesan data.

---

## 7. Dokumentasi REST API Backend

<details>
<summary><b>Klik untuk Melihat Spesifikasi Endpoint <code>POST /api/predict</code></b></summary>

**Request Body (`application/json`):**
```json
{
  "vehicle_class": "COMPACT",
  "engine_size": 2.0,
  "cylinders": 4,
  "transmission": "AS6",
  "fuel_type": "X",
  "fuel_city": 8.5,
  "fuel_hwy": 6.4,
  "annual_km": 15000
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "predictions": {
    "random_forest": 176.5,
    "multiple_linear_regression": 178.4,
    "delta_models": 1.9
  },
  "derived": {
    "fuel_comb_l100km": 7.56,
    "fuel_comb_mpg": 37.4,
    "annual_co2_kg": 2647.5,
    "trees_offset": 121.6,
    "diff_vs_avg_pct": -29.7
  },
  "eco_classification": {
    "tier": "TIER B // ECO-BALANCED",
    "status": "Emisi Rendah - Moderat",
    "level": "good"
  }
}
```

</details>

---

## 8. Panduan Instalasi Lokal & Deployment Vercel

### Menjalankan Secara Lokal (Windows / Linux / macOS)
```bash
# 1. Buat dan aktifkan virtual environment
python -m venv venv
venv\Scripts\activate        # Windows PowerShell/CMD
# source venv/bin/activate   # Linux/macOS

# 2. Instal dependensi
pip install -r requirements.txt

# 3. Jalankan server Flask
python app.py
```
Buka browser pada alamat **`http://127.0.0.1:5000`**.

