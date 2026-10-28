# VitreBook 📖

> **Standalone, Sideloaded Android E-Book Reader & Client-Side Catalog Indexer**
> Built with React Native (TypeScript), Cheerio, Zustand, MMKV, and GitHub Actions CI/CD.

---

## 🌟 Highlights & Architecture

- **Zero-Backend Architecture ($0 Server Cost):** All catalog queries and HTML table parsing run directly on the client device using `axios` and `cheerio`.
- **Dynamic Mirror Discovery:** Queries a remote GitHub Gist configuration on startup to obtain working mirrors (`libgen.is`, `libgen.rs`, `libgen.li`, etc.) and fallback resolvers (`library.lol/main/{MD5}`, `libgen.li/ads.php?md5={MD5}`).
- **Two-Stage Indexing & Direct File Resolution:**
  1. **Search Query:** Scrapes HTML tables to extract Book Title, Author, Year, Language, Size, Extension, Cover Thumbnail, and the 32-character **MD5 Hash**.
  2. **Direct Link Resolver:** Evaluates resolver mirror landing pages and extracts direct `.pdf` and `.epub` links.
- **Offline Storage & Download Stream:** Streams files to local app storage using `react-native-blob-util` with real-time percentage progress and speed calculation.
- **Embedded PDF Reader:** In-app reader built on `react-native-pdf` featuring dark/night reading mode, page jump controls, and auto-saving `lastReadPage` to `react-native-mmkv`.
- **Automated CI/CD:** Push version tags (`v1.0.0`) to trigger GitHub Actions to build unsigned/signed `arm64-v8a` APKs and attach them directly to GitHub Releases.
- **Self-Updating:** In-app update banner checks `api.github.com/repos/Rzxiq/VitreBook/releases/latest` and prompts to install new APK versions.

---

## 📂 Project Structure

```
VitreBook/
├── .github/
│   └── workflows/
│       └── android-release.yml       # Automated APK build & GitHub Release pipeline
├── android/                          # Native Android Gradle configuration (arm64-v8a ABI splits)
├── src/
│   ├── api/
│   │   ├── configService.ts          # Remote mirror discovery via Gist JSON
│   │   ├── httpClient.ts             # Axios instance with custom mobile User-Agent
│   │   └── scrapers/
│   │       ├── index.ts              # Unified Scraper & Catalog manager
│   │       ├── libgenScraper.ts      # HTML table parser & MD5 extractor
│   │       └── mirrorResolver.ts     # Direct file URL resolver
│   ├── components/
│   │   ├── BookCard.tsx              # Card showing cover, metadata, and format badges
│   │   ├── DownloadProgressModal.tsx # Real-time speed and progress modal
│   │   ├── MirrorSelectorModal.tsx   # Domain switcher & custom mirror input
│   │   └── UpdateBanner.tsx          # In-app GitHub release update detector
│   ├── navigation/
│   │   └── AppNavigator.tsx          # Bottom tabs + Root native stack navigation
│   ├── screens/
│   │   ├── SearchScreen.tsx          # Catalog search with format filter chips
│   │   ├── BookDetailScreen.tsx      # Metadata breakdown, MD5 info, & download CTA
│   │   ├── LibraryScreen.tsx         # Offline downloaded book grid with % read
│   │   ├── PdfReaderScreen.tsx       # Dark mode PDF reader with auto page saving
│   │   └── SettingsScreen.tsx        # Mirror configuration, cache management, & updater
│   ├── services/
│   │   ├── downloadManager.ts        # Stream manager & filesystem deletion
│   │   └── updateService.ts          # Checks GitHub Releases API for new APKs
│   ├── store/
│   │   ├── useLibraryStore.ts        # Fast local storage via Zustand + MMKV
│   │   └── useSettingsStore.ts       # Mirror and reader preferences via MMKV
│   ├── types/
│   │   └── book.d.ts                 # Full TypeScript interfaces
│   └── utils/
│       └── fileHelpers.ts            # Bytes formatting and filename sanitization
├── App.tsx                           # Main entry component
├── index.js                          # React Native registerComponent
├── package.json
└── tsconfig.json
```

---

## 🚀 Building & Sideloading

### Automated CI/CD (Recommended)
1. Push any commit to `main` to build an APK artifact.
2. Push a Git tag to create a public release with the `.apk` attached:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Download the built APK directly onto your Android device from the **Releases** tab.

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Run Android build
npx react-native run-android
```
