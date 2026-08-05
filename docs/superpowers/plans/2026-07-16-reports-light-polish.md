# Reports Light Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести страницы отчётности на светлую, спокойную визуальную систему, упростить тексты и добавить умеренные scroll/hover-анимации.

**Architecture:** Сохраняем серверные страницы, текущий источник данных и файловые маршруты. Визуальная переработка сосредоточена в `reports.css` и существующих компонентах; один изолированный client-компонент `ReportReveal` отвечает за одноразовое появление секций и reduced-motion fallback.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS cascade layers, Framer Motion 12, Node test runner, Playwright.

---

## File map

- `app/reports/page.tsx` — светлая обзорная композиция и прямой текст.
- `app/reports/[year]/page.tsx` — порядок и текст секций годового отчёта.
- `components/reports/reports.css` — световые поверхности, типографика, responsive и интерактивные состояния.
- `components/reports/report-reveal.tsx` — единственный новый client-island для scroll reveal.
- `components/reports/reports-hero.tsx` — документальная фотография и факты первого экрана.
- `components/reports/report-cover.tsx` — светлая обложка годового отчёта.
- `components/reports/financial-flow.tsx` — прямой заголовок финансового блока.
- `components/reports/report-archive.tsx` — прямой заголовок и hover/focus года.
- `components/reports/outcome-list.tsx` — прямой заголовок результатов.
- `components/reports/document-stack.tsx` — прямой заголовок и интерактивные листы.
- `components/reports/reports-structure.test.mjs` — source-контракты световой системы, текста и motion fallback.

### Task 1: Зафиксировать новый тон и световой баланс тестами

**Files:**
- Modify: `components/reports/reports-structure.test.mjs`

- [ ] **Step 1: Добавить failing contract**

```js
test("reports use direct copy and reserve dark surface for finance", () => {
  const overview = read("../../app/reports/page.tsx");
  const cover = read("./report-cover.tsx");
  const finance = read("./financial-flow.tsx");
  const css = read("./reports.css");

  assert.match(overview, /Открытая отчётность/);
  assert.doesNotMatch(overview, /Помощь должна быть/);
  assert.match(cover, /Отчёт за 2024 год/);
  assert.match(finance, />Движение средств</);
  assert.match(css, /\.reports-hero[^{]*\{[^}]*background: var\(--paper\)/s);
  assert.match(css, /\.financial-flow[^{]*\{[^}]*background: var\(--archive-black\)/s);
});
```

- [ ] **Step 2: Подтвердить RED**

Run: `node --test components/reports/reports-structure.test.mjs`  
Expected: FAIL на старом тексте и тёмном `.reports-hero`.

- [ ] **Step 3: Не менять production-код до подтверждённого RED**

### Task 2: Сделать обзор и обложку light-first

**Files:**
- Modify: `app/reports/page.tsx`
- Modify: `components/reports/report-cover.tsx`
- Modify: `components/reports/reports-hero.tsx`
- Modify: `components/reports/reports.css`

- [ ] **Step 1: Заменить hero-copy на прямой текст**

```tsx
<p className="reports-kicker">АНБО «Светлый» · открытые данные</p>
<h1 id="reports-title">Открытая <em>отчётность</em></h1>
<p className="reports-intro">Результаты работы, движение средств и исходные документы по каждому опубликованному году.</p>
```

Для годовой обложки:

```tsx
<p>{report.period}</p>
<h1 id="report-title">Отчёт за {report.year} год</h1>
<span>{report.summary}</span>
```

- [ ] **Step 2: Перевести hero и cover на бумажную поверхность**

`.reports-hero` получает `background: var(--paper); color: var(--ink)`, фотография остаётся отдельной правой плоскостью. `.report-cover` становится двухколоночной светлой секцией; затемнение остаётся локально поверх фотографии. Доля тёмной поверхности первого viewport не превышает площади фотографии.

- [ ] **Step 3: Стабилизировать текстовую сетку**

Ограничить заголовки `max-inline-size`, уменьшить desktop scale на 10–20%, выровнять подписи и описания по одному grid-start. На mobile использовать последовательность copy → image → facts без абсолютного позиционирования текста.

- [ ] **Step 4: Проверить GREEN**

Run: `node --test components/reports/reports-structure.test.mjs`  
Expected: новый copy/light contract PASS.

### Task 3: Упростить все заголовки и светлые финальные поверхности

**Files:**
- Modify: `components/reports/financial-flow.tsx`
- Modify: `components/reports/report-archive.tsx`
- Modify: `components/reports/outcome-list.tsx`
- Modify: `components/reports/document-stack.tsx`
- Modify: `app/reports/[year]/page.tsx`
- Modify: `components/reports/report-neighbors.tsx`
- Modify: `components/reports/reports.css`

- [ ] **Step 1: Применить согласованные заголовки**

```text
Движение средств
Отчёты по годам
Результаты первых трёх месяцев
Исходные документы
Начало работы организации
```

Удалить метафоры «поле зрения», «закрытые полки», «не верить на слово» и «чья-то безопасность» из заголовков. Описания должны сообщать период, источник или действие.

- [ ] **Step 2: Сделать neighbors светлыми**

`.report-neighbors` получает `background: var(--sheet); color: var(--ink)` и обычные разделители. Hover/focus использует мягкую янтарную заливку без инверсии всей секции.

- [ ] **Step 3: Сократить тёмную финансовую секцию**

Уменьшить vertical padding, сохранить точные суммы, SVG и zero-note. На mobile оставить текстовый `<dl>` без декоративной SVG-линии.

- [ ] **Step 4: Запустить tests и lint для отчётности**

Run: `node --test components/reports/reports-structure.test.mjs`  
Run: `eslint app/reports components/reports`  
Expected: 0 failures, 0 lint errors.

### Task 4: Добавить осмысленный motion-island

**Files:**
- Create: `components/reports/report-reveal.tsx`
- Modify: `app/reports/page.tsx`
- Modify: `app/reports/[year]/page.tsx`
- Modify: `components/reports/reports-structure.test.mjs`
- Modify: `components/reports/reports.css`

- [ ] **Step 1: Добавить failing motion contract**

```js
test("report reveal is one-shot and respects reduced motion", () => {
  const reveal = read("./report-reveal.tsx");
  assert.match(reveal, /useInView/);
  assert.match(reveal, /useReducedMotion/);
  assert.match(reveal, /once: true/);
  assert.match(reveal, /opacity/);
});
```

Run: `node --test components/reports/reports-structure.test.mjs`  
Expected: FAIL с ENOENT для `report-reveal.tsx`.

- [ ] **Step 2: Реализовать минимальный `ReportReveal`**

```tsx
"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

export function ReportReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.12 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={{ opacity: reduced || visible ? 1 : 0, y: reduced || visible ? 0 : 24 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Обернуть только крупные смысловые секции**

Использовать `ReportReveal` для cumulative impact, archive, methodology, outcomes, context и documents. Не оборачивать каждую строку, сумму и ссылку. Hero использует отдельный CSS stagger на первом paint.

- [ ] **Step 4: Добавить интерактивные состояния**

Архив года: `transform: translateY(-2px)` и проявление янтарной линии. Документы: `translateY(-6px)` на hover/focus-within. Все переходы отключаются существующим `prefers-reduced-motion`.

- [ ] **Step 5: Подтвердить GREEN**

Run: `node --test`  
Expected: все source-контракты PASS.

### Task 5: Browser-полировка и финальная проверка

**Files:**
- Modify when inspection finds a defect: `components/reports/reports.css`
- Save: `docs/verification/reports-light-desktop.png`
- Save: `docs/verification/reports-light-mobile.png`
- Save: `docs/verification/report-2024-light-desktop.png`
- Save: `docs/verification/report-2024-light-mobile.png`

- [ ] **Step 1: Собрать production build**

Run: `next build`  
Expected: `/reports` static, `/reports/2024` SSG, exit 0.

- [ ] **Step 2: Проверить browser matrix**

На 1440×1000 и 390×844 проверить оба маршрута: HTTP 200, один `h1`, overflow 0, отсутствие console/page errors, читаемый порядок секций.

- [ ] **Step 3: Проверить motion и keyboard**

Проверить normal/reduced motion, Tab по hero CTA, архиву, четырём действиям документов и финальной навигации. Контент должен быть доступен до завершения анимации.

- [ ] **Step 4: Выполнить один simplification pass**

Удалить один декоративный элемент, который не объясняет данные. Предпочтительный кандидат — сквозной `ReportBeam`; оставить локальные янтарные линии в hero, finance и archive.

- [ ] **Step 5: Запустить финальную матрицу**

Run: `node --test`  
Run: `eslint .`  
Run: `next build`  
Run: `git diff --check`  
Expected: 0 test failures, 0 lint errors, build exit 0, clean diff check. Существующие warnings вне `app/reports` и `components/reports` перечислить отдельно.
