# VitreBook (Android Native)

> Fully native Android E-Book Reader and Public-Domain Document Indexer built with **Kotlin, Jetpack Compose, and Material 3**.

---

## Architecture & Tech Stack

- **Platform:** Native Android (Kotlin)
- **UI Toolkit:** Jetpack Compose + Material 3 (`androidx.compose.material3`)
- **Theme:** Dark Obsidian Material You palette (`#09090B` background, `#121215` surface, `#27272A` borders)
- **Image Pipeline:** Coil (`io.coil-kt:coil-compose`)
- **Networking & Scrapers:** OkHttp + Jsoup + Gson
- **Built-in PDF Viewer:** Native `android.graphics.pdf.PdfRenderer` (zero external C++ dependencies, 60 FPS hardware acceleration)
- **State & Storage:** Kotlin Coroutines `StateFlow` + Android `SharedPreferences`

---

## Core Features

1. **Multi-Source E-Book Indexer:**
   - Real-time client-side search across Open Library and Project Gutenberg.
   - Optional LibGen edition-metadata search, debounced while typing. These results are metadata-only: VitreBook does not download them, and the detail screen labels them accordingly.
   - Verified public-domain classics: *Pride and Prejudice*, *Frankenstein*, *Dracula*, *The Adventures of Sherlock Holmes*, *Alice's Adventures in Wonderland*, *The Art of War*.
   - Filter chips for quick genre exploration (*Classics*, *Fiction*, *Sci-Fi*, *Philosophy*, *Mystery*, *History*).

2. **Real Streaming Downloads:**
   - Client-side OkHttp downloader with real-time percentage and transfer rate.
   - Stores documents in app-private storage (`context.filesDir/books/`).
   - Magic byte validation (`%PDF-`) rejects server HTML block pages and automatically falls back to verified public copies.

3. **Built-in Native Android PDF Reader:**
   - Powered directly by Android's native `PdfRenderer`.
   - **True Night Mode:** Color matrix channel inversion turns white pages to deep obsidian black and text to crisp white for night reading.
   - Smooth page navigation slider + Previous / Next buttons.
   - Pinch-to-zoom and pan gestures.
   - Automatically saves `lastReadPage` and reading progress on every page turn.

4. **Offline Library:**
   - Grid and list views of downloaded offline books.
   - Real reading progress percentage bars.
   - 1-tap **⚡ Starter Book** button to instantly test the reader.

---

## Build Instructions

```bash
# Clone the repository
git clone https://github.com/Rzxiq/VitreBook.git
cd VitreBook

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease
```
The output APK is generated at `app/build/outputs/apk/release/app-release.apk`.
