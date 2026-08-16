# 🖥️ Laptop Inventory System — Dimension 666

A **FREE** laptop inventory management system hosted on GitHub Pages with optional Google Sheets cloud sync.

## ✨ Features

- ✅ **Full CRUD** — Add, Edit, Delete laptops
- ✅ **Search & Filter** — By model, status, serial, issue
- ✅ **Dashboard** — Real-time stats (total, in-progress, completed)
- ✅ **Parts Tracker** — Auto-count missing parts (LCD, Battery, etc.)
- ✅ **Export CSV** — One-click reports
- ✅ **Google Sheets Sync** — FREE cloud backup (optional)
- ✅ **Offline Ready** — Works without internet
- ✅ **Mobile Responsive** — Works on phones & tablets
- ✅ **Zero Cost** — 100% FREE hosting on GitHub Pages

## 🚀 Quick Start

### Option 1: Use Live Demo
Visit: `https://yourusername.github.io/laptop-inventory/`

### Option 2: Deploy Your Own

1. **Fork this repo** or create a new one
2. **Upload `index.html`** to your repository
3. **Enable GitHub Pages**:
   - Go to Settings > Pages
   - Select "Deploy from main branch"
   - Save
4. **Open your URL** — `https://yourusername.github.io/repo-name/`

## ☁️ Google Sheets Setup (Optional but Recommended)

1. **Create a Google Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Create Service Account → Generate JSON key
   - Download the JSON file

2. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com/)
   - Create a new spreadsheet
   - Share it with your service account email (found in JSON file)

3. **Connect in the App**:
   - Open your GitHub Pages URL
   - Setup wizard will appear
   - Paste your service account JSON
   - Enter your Sheet ID (found in the URL)
   - Click Connect!

## 📊 Data Structure

### Laptops Sheet Columns:
| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Model | Laptop model name |
| Serial | Serial number / Asset ID |
| RAM | Memory size |
| Storage | Main storage |
| Addl Storage | Additional storage (SD card, etc.) |
| Qty | Quantity |
| Status | pending/repairing/testing/done/waiting |
| Days | Days in progress |
| Issue | Problem description / delay reason |
| Missing Parts | LCD, Frame, Battery, Keyboard, Other |
| Notes | Additional info |

### Status Meanings:
- **Pending** — Not yet started
- **Repairing** — Currently being fixed
- **Testing** — Quality check phase
- **Done** — Completed and ready
- **Waiting** — Stuck, waiting for parts

## 💰 Cost Breakdown

| Service | Cost |
|---------|------|
| GitHub Pages | ✅ FREE |
| Google Sheets API | ✅ FREE (1M requests/day) |
| Google Account | ✅ FREE |
| SSL Certificate | ✅ FREE |
| **Total Monthly** | **₱0.00** |

## 🔒 Security

- Service account credentials are stored **ONLY** in your browser's LocalStorage
- **NEVER** uploaded or shared
- **NEVER** committed to GitHub
- All communication uses HTTPS encryption

## 🛠️ Maintenance

### Backup Data:
1. Click **"Export CSV"** to download your data
2. Or use Google Sheets (if connected) — auto-backup

### Restore Data:
1. Import the CSV file into the app
2. Or connect to Google Sheets

## 📱 Mobile Access

Open the URL on any smartphone:
- Works in Chrome, Safari, Firefox
- Responsive design adapts to screen size
- Add to home screen for app-like experience

## 👥 Team Collaboration

1. **Share the URL** with your team
2. **Connect the same Google Sheet** to sync data
3. Everyone sees real-time updates
4. Works simultaneously without conflicts

## 🐛 Troubleshooting

### "Cannot connect to Google Sheets"
- Verify your service account JSON is correct
- Check that Sheet ID is correct
- Ensure sheet is shared with service account email

### "Data not syncing"
- Click **"Sync Now"** to manually push data
- Check your internet connection
- Data also saves locally — no data loss

### "Missing parts not counting"
- Ensure parts are comma-separated: `LCD, Battery, Keyboard`
- Supported keywords: LCD, Panel, Frame, Battery, Keyboard, Other

## 📝 License

**MIT License** — Free to use, modify, and distribute.

## 🙏 Support

For questions or feature requests:
- Open an issue on GitHub
- Or contact your admin

---

**Made with ❤️ for Dimension 666 — Repair & Assembly Tracker**