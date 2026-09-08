# test-portal
In Tailwind CSS v4, Next.js requires the dedicated package `@tailwindcss/postcss` inside `postcss.config.mjs`. Without that specific plugin, `@import "tailwindcss";` does not compile, causing the browser to render unstyled HTML.

Follow these steps to enable Tailwind v4 in your project:

---

### Step 1: Install the Tailwind v4 PostCSS Plugin

In your VS Code terminal (inside `test-portal`), run:

```bash
npm install -D @tailwindcss/postcss

```

---

### Step 2: Create `postcss.config.mjs`

Create or update `postcss.config.mjs` in your root project directory:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

---

### Step 3: Verify `src/app/globals.css`

Ensure `src/app/globals.css` contains:

```css
@import "tailwindcss";

* {
  box-sizing: border-box;
}

body {
  background-color: #f0f4f8;
  color: #1e293b;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 0;
}

```

---

### Step 4: Verify `src/app/layout.tsx`

Ensure `src/app/layout.tsx` imports `globals.css` and the KaTeX CSS:

```tsx
import "./globals.css";
import "katex/dist/katex.min.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discrete Mathematics CBT Mock",
  description: "CBT Mock Test Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f0f4f8] text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

```

---

### Step 5: Restart the Dev Server

1. Stop the running terminal by pressing `Ctrl + C`.
2. Clear the Next.js cache:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

```


3. Start the dev server:
```bash
npm run dev

```


4. Hard-refresh `http://localhost:3000` (`Ctrl + Shift + R` or `Ctrl + F5`).

The application will now compile and load the full styled UI immediately upon opening.


--------------------------------------------------------------------------
Adding a new chapter test paper takes two steps: writing the Markdown file and registering it in the exam data.

---

### Step 1: Create the Question Paper Markdown File

Create a new file in `public/tests/` named with a unique ID matching your paper (e.g., `public/tests/upsc-polity-preamble.md`).

Format your questions following the standard template:

```markdown
### Question 1 (MCQ)
Which of the following words was **NOT** present in the original Preamble adopted on 26th November 1949?
- A) Sovereign
- B) Socialist
- C) Democratic
- D) Republic
- Correct: B

### Question 2 (MSQ)
Which of the following ideals in the Preamble of the Indian Constitution were borrowed from the French Revolution?
- A) Liberty
- B) Equality
- C) Justice
- D) Fraternity
- Correct: A, B, D

### Question 3 (NAT)
How many times has the Preamble of the Constitution of India been amended so far?
- Answer: 1
- Correct: 1

```

> **Key Rules for Questions:**
> * Header: `### Question <number> (<MCQ|MSQ|NAT>)`
> * Options: `- A) ...`, `- B) ...`
> * Key: `- Correct: B` (for MCQ), `- Correct: A, B, D` (for MSQ), or `- Correct: 1` (for NAT).
> * Math/LaTeX formulas: Use `$inline$` or `$$display$$`.
> * Diagrams: Place a standard ````mermaid` block directly under the prompt text.
> 
> 

---

### Step 2: Register the Test in `src/data/exams.ts`

Open `src/data/exams.ts` and add your new test entry into the `AVAILABLE_TESTS` array. Ensure the `id` matches the `.md` filename exactly:

```typescript
{
  id: "upsc-polity-preamble", // Exactly matches public/tests/upsc-polity-preamble.md
  title: "UPSC GS-1: Preamble & Philosophy of Constitution",
  category: "UPSC",           // "UPSC" | "GATE" | "SSC" | "Railways" | "Defence" | "Banking" | "State Exams"
  subCategory: "Indian Polity",// Must match one of the stream pills in CATEGORY_TAXONOMY
  subject: "Indian Polity",
  chapter: "Preamble & Basic Structure", // Specific chapter name displayed on the card
  totalQuestions: 3,
  durationMins: 10,
  maxMarks: 6,
  difficulty: "Moderate",
  badge: "New",
  isFree: true,
},

```

---

### Step 3: Verify the Stream Pill in `CATEGORY_TAXONOMY`

Check the `CATEGORY_TAXONOMY` object in `src/data/exams.ts` to confirm that the `subCategory` you assigned is listed under your category:

```typescript
export const CATEGORY_TAXONOMY: Record<string, string[]> = {
  UPSC: [
    "GS Paper I",
    "CSAT Paper II",
    "Indian Polity", // Matches subCategory: "Indian Polity"
    "Ancient History",
    "Geography",
    "Economy",
  ],
  // ... other categories
};

```

---

### How It Renders Automatically

* When a student opens the home portal and clicks **UPSC**, the filter drawer opens.
* Clicking **Indian Polity** will filter down to show your new chapter test: **"Preamble & Basic Structure"**.
* Clicking **Attempt CBT Now** fetches `/tests/upsc-polity-preamble.md` and immediately launches the test engine.