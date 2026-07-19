# 🌿 RythuMitra – Smart Farming Assistant

> **Empowering Farmers with AI-Based Crop Health Monitoring**

RythuMitra (రైతు మిత్ర — "Farmer's Friend" in Telugu) is a feature-rich, offline-capable smart farming web application that helps farmers detect crop diseases, get fertilizer recommendations, track crop growth stages, monitor weather alerts, and connect with nearby agricultural support centers — all from a single, beautiful interface.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔬 **AI Disease Detection** | Upload or drag-and-drop a leaf photo to instantly detect crop diseases with confidence scores, severity ratings, and treatment recommendations |
| 💊 **Fertilizer Advisor** | Get crop-specific NPK fertilizer type, quantity per acre, and optimal application phase |
| 📈 **Crop Growth Tracker** | Select a crop and sowing date to visualize your current growth stage on an animated timeline |
| 🌦️ **Weather Alerts** | Live weather metrics (temperature, humidity, rain chance, wind speed) with farming-specific risk advisories |
| 📊 **Agricultural Analytics** | Interactive bar charts showing crop health distribution and monthly diagnostics by season |
| 📍 **Nearby Agriculture Centers** | GPS-powered map to locate nearby agriculture support centers based on your detected disease |
| 🌐 **Multi-Language Support** | Full UI translation support for English, Telugu, Hindi, Tamil, Malayalam, and Kannada |
| 📴 **Offline Mode** | Core disease detection and advisory features work fully offline without internet access |
| 👤 **Farmer Accounts** | Secure sign-in / sign-up with Supabase Auth to save scan history and enquiries |

---

## 🗂️ Project Structure

```
agri-project/
├── index.html            # Main application HTML (single-page)
├── style.css             # Complete stylesheet (~2900 lines, custom design system)
├── script.js             # All client-side logic (~2500 lines)
├── supabase-config.js    # Supabase project URL and anon key (configure here)
├── supabase-tables.sql   # SQL schema to set up Supabase database tables
├── package-lock.json     # Dependency lockfile
└── assets/
    ├── hero_bg.png           # Hero section background image
    ├── healthy_leaf.png      # Sample preset — healthy rice leaf
    ├── leaf_spot.png         # Sample preset — tomato leaf spot
    └── powdery_mildew.png    # Sample preset — wheat powdery mildew
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A [Supabase](https://supabase.com) account (free tier works) — for Auth and data storage
- *(Optional)* A local web server (e.g., VS Code Live Server, `npx serve`, etc.)

### 1. Clone or Download

```bash
git clone https://github.com/your-username/agri-project.git
cd agri-project
```

Or simply download and extract the ZIP.

### 2. Configure Supabase

Open `supabase-config.js` and replace the values with your own Supabase project credentials:

```js
window.SUPABASE_URL = "https://your-project-ref.supabase.co";
window.SUPABASE_ANON_KEY = "your-anon-key";
```

> You can find these in your Supabase dashboard under **Project Settings → API**.

### 3. Set Up the Database

In your Supabase project, open the **SQL Editor** and run the contents of `supabase-tables.sql`:

```sql
-- Creates farmer_enquiries and crop_scans tables
```

This sets up the two required tables:
- `farmer_enquiries` — stores contact form submissions
- `crop_scans` — stores disease scan results per user

### 4. Set Up Supabase Storage *(Optional)*

To enable crop image uploads, create a public storage bucket named **`crop-images`** in your Supabase dashboard under **Storage**.

### 5. Run Locally

Open `index.html` directly in a browser, **or** use a local server for full functionality:

```bash
# Using Node.js (npx)
npx serve .

# Using Python
python -m http.server 8080
```

Then navigate to `http://localhost:8080`.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (Semantic, Single Page) |
| **Styling** | Vanilla CSS (Custom Design System, CSS Variables, Animations) |
| **Logic** | Vanilla JavaScript (ES6+, no framework) |
| **Auth & DB** | [Supabase](https://supabase.com) (Auth + PostgreSQL + Storage) |
| **Map** | [Leaflet.js](https://leafletjs.com/) v1.9.4 |
| **Fonts** | Google Fonts — Outfit & Plus Jakarta Sans |

---

## 🌍 Supported Languages

The UI can be switched at runtime via the **language selector** in the navbar:

- 🇬🇧 English
- 🇮🇳 తెలుగు (Telugu)
- 🇮🇳 हिन्दी (Hindi)
- 🇮🇳 தமிழ் (Tamil)
- 🇮🇳 മലയാളം (Malayalam)
- 🇮🇳 ಕನ್ನಡ (Kannada)

---

## 🔐 Authentication Flow

1. Users land on the **Farmer Account** screen.
2. They can **Sign Up** with an email and password (Supabase Auth).
3. After signing in, the main app content unlocks.
4. A **profile dropdown** in the header shows the logged-in email and a Sign Out option.
5. Scan results are saved per user session to the `crop_scans` table in Supabase.

---

## 🌱 Sample Disease Presets

Three clickable preset images are included for quick testing without uploading a photo:

| Preset | Disease | Crop |
|---|---|---|
| `leaf_spot.png` | Leaf Spot (Septoria) | Tomato |
| `powdery_mildew.png` | Powdery Mildew | Wheat |
| `healthy_leaf.png` | No Disease (Healthy) | Rice |

---

## 📋 Database Schema

### `farmer_enquiries`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `created_at` | Timestamptz | Auto timestamp |
| `name` | Text | Farmer's name |
| `phone` | Text | Phone number |
| `crop` | Text | Crop type |
| `message` | Text | Enquiry message |

### `crop_scans`
| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `created_at` | Timestamptz | Auto timestamp |
| `name` | Text | Farmer's name |
| `phone` | Text | Phone number |
| `crop` | Text | Crop type scanned |
| `disease` | Text | Detected disease name |
| `confidence` | Text | Detection confidence % |
| `symptoms` | Text | Symptom description |
| `treatments` | Text | Treatment recommendation |
| `image_url` | Text | Uploaded image URL (Supabase Storage) |

---

## 📦 Dependencies

| Library | Version | CDN Used |
|---|---|---|
| Leaflet.js | 1.9.4 | unpkg.com |
| Supabase JS | Latest | cdn.jsdelivr.net |

No build tools or npm installs are required for the core application.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Supabase](https://supabase.com) — Backend as a Service
- [Leaflet.js](https://leafletjs.com/) — Interactive maps
- [Google Fonts](https://fonts.google.com/) — Outfit & Plus Jakarta Sans typefaces
- Inspired by the real needs of Indian farmers 🌾

---

*Built with ❤️ for the farming community of India.*
