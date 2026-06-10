# Analisis Sentimen Pasar Modal

Aplikasi web berbasis Flask untuk analisis sentimen tweet terkait saham pasar modal Indonesia. Project ini menyediakan dashboard analitik, pengelolaan dataset per periode, perbandingan performa model, autentikasi admin, serta endpoint API untuk kebutuhan visualisasi dan inferensi.

## Gambaran Umum

Project ini dirancang untuk menampilkan dan membandingkan hasil analisis sentimen dari beberapa pendekatan model, terutama:

- Deep Learning / IndoBERTweet
- Machine Learning / SVM

Aplikasi juga mendukung pengelolaan akun admin, halaman profil, serta pemrosesan data tweet berdasarkan periode waktu seperti:

- Before COVID
- COVID
- After COVID
- Semua periode

## Fitur Utama

- Autentikasi login, register, logout, dan manajemen sesi.
- Dashboard admin dengan ringkasan distribusi sentimen, tren, dan statistik model.
- Halaman dataset untuk tiap periode analisis.
- Halaman model Deep Learning dan Machine Learning.
- Fitur preview dan update model berbasis upload CSV.
- Halaman komparasi performa model, termasuk akurasi dan runtime.
- Manajemen akun untuk superadmin.
- Halaman profil pengguna dan ganti password.
- Endpoint API untuk dashboard, tren, detail saham, upload CSV, dan analisis kalimat.

## Teknologi Yang Digunakan

- Python
- Flask
- Flask-Session
- Pandas
- NumPy
- PyTorch
- Transformers
- scikit-learn
- NLTK
- Sastrawi
- Stanza
- Joblib

## Struktur Project

```text
app.py
controller/
middlewares/
routes/
services/
static/
templates/
utils/
data/
```

Beberapa folder penting:

- `controller/` berisi logika halaman, autentikasi, model, dashboard, dan komparasi.
- `routes/` berisi registrasi route Flask.
- `middlewares/` berisi middleware autentikasi dan role-based access.
- `services/` berisi pipeline update model dan skrip pengembangan.
- `templates/` berisi HTML untuk layout dan halaman admin.
- `static/` berisi CSS, JavaScript, gambar, dan vendor library.
- `data/` berisi dataset, hasil pemodelan, hasil komparasi, user, dan session Flask.

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/GhandiZero0X/analisis-sentimen-pasar-modal.git
cd analisis-sentimen-pasar-modal
```

### 2. Buat virtual environment

```bash
python -m venv .venv
```

Aktifkan environment:

```bash
.venv\Scripts\activate
```

### 3. Install dependensi

File `requirement.txt` pada project ini masih kosong, jadi install paket yang dibutuhkan secara manual:

```bash
pip install flask flask-session pandas numpy torch transformers scikit-learn nltk sastrawi stanza joblib openpyxl emoji werkzeug
```

Jika kamu memakai model dan pipeline tertentu yang membutuhkan paket tambahan, sesuaikan lagi dengan skrip di folder `services/` dan `controller/`.

## Menjalankan Aplikasi

Jalankan Flask app dari file utama:

```bash
python app.py
```

Secara default aplikasi akan berjalan pada:

```text
http://127.0.0.1:5000
```

## Halaman Utama

- `/` - halaman publik utama
- `/admin/login` - login admin
- `/admin/register` - registrasi akun
- `/admin/dashboard` - dashboard analitik
- `/admin/dataset/before-covid` - dataset sebelum COVID
- `/admin/dataset/covid` - dataset masa COVID
- `/admin/dataset/after-covid` - dataset setelah COVID
- `/admin/dataset/all-periods` - dataset semua periode
- `/admin/model/dl` - halaman model Deep Learning
- `/admin/model/ml` - halaman model Machine Learning
- `/admin/komparasi` - halaman perbandingan model
- `/admin/profile` - profil pengguna
- `/admin/accounts` - manajemen akun superadmin

## Endpoint API

Project ini juga menyediakan beberapa endpoint JSON:

- `GET /api/dashboard`
- `GET /api/trend`
- `GET /api/saham`
- `POST /api/upload`
- `POST /api/kalimat`

## Data dan Output

Beberapa lokasi data penting yang dipakai aplikasi:

- `data/users.csv` - data akun admin
- `data/csv/` - dataset tweet per model dan periode
- `data/modelDL/` - hasil model deep learning
- `data/modelML/` - hasil model machine learning
- `data/komparasi/` - tabel dan ringkasan komparasi model
- `data/uploads_temp/` - file upload sementara saat update model

## Catatan Penggunaan

- Aplikasi memakai server-side session dengan folder session di `data/flask_sessions/`.
- Beberapa halaman admin hanya bisa diakses setelah login.
- Akses manajemen akun dibatasi untuk role `superadmin`.
- Pipeline update model dijalankan di background thread dan statusnya bisa dipantau lewat endpoint status.

## Lisensi

Belum ditentukan.

## Kontribusi

Jika ingin menambah fitur atau memperbaiki analitik, pastikan perubahan tetap konsisten dengan struktur route, controller, dan format data yang sudah dipakai project ini.
