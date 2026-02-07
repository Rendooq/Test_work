# High-Performance Text Transformation Tool

A robust, React-based text manipulation utility designed for handling large datasets (10,000+ lines) efficiently directly in the browser.

## 🚀 Key Features

- **High Performance:** Utilizes a dedicated **Web Worker** to offload heavy text processing (Regex operations, sorting, filtering) from the main thread, ensuring the UI remains responsive even with massive text files.
- **Undo/Redo History:** Custom hook implementation for state time-travel (up to 15 steps).
- **Persistence:** Auto-saves content to LocalStorage to prevent data loss.
- **Modular Logic:** Transformation logic is isolated in pure functions, making it testable and reusable.
- **Modern UI:** Built with Next.js App Router, Tailwind CSS, and Framer Motion for a polished experience.

## 🛠 Architecture & Performance Choices

### 1. Web Workers
Processing 10,000+ lines of text involves heavy string manipulation (splitting, mapping, regex replacement, joining). Doing this on the main JavaScript thread would block the Event Loop, causing the UI to freeze (drop frames).
- **Solution:** We spawn a `textWorker.ts`. The main thread sends the text and the requested action to the worker. The worker processes it asynchronously and sends back the result.
- **Benefit:** The UI (buttons, scrolling, typing) remains interactive while the text is being processed.

### 2. Controlled Component vs Virtualization
For the editor, we use a controlled `<textarea>`.
- **Why not Virtualization?** While libraries like `react-window` are great for rendering thousands of DOM elements (like a list of `<div>`s), a native `<textarea>` is highly optimized by the browser engine for text rendering. Virtualizing an *editable* text area is complex and often introduces bugs with cursor position and selection.
- **Optimization:** We debounce the LocalStorage save and ensure the stats calculation is efficient. React 18's concurrent features also help keep the input responsive.

### 3. Feature-Sliced / Modular Design
- `src/utils/textUtils.ts`: Pure logic. No React dependencies.
- `src/workers/textWorker.ts`: Worker entry point.
- `src/hooks/useHistory.ts`: State management logic isolated from UI.
- `src/app/page.tsx`: UI composition.

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install lucide-react framer-motion clsx tailwind-merge
