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