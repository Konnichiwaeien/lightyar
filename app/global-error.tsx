"use client";

/**
 * Последний рубеж: ловит ошибки, случившиеся в корневом layout,
 * где обычный error.tsx уже не работает. Поэтому здесь свои <html> и <body>
 * и никаких зависимостей от провайдеров приложения — они могли не подняться.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#e8e4dc",
          color: "#1c1c1c",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", marginBottom: "1rem", fontWeight: 600 }}>
            Что-то сломалось на нашей стороне
          </h1>
          <p style={{ color: "#6c655b", lineHeight: 1.6, marginBottom: "2rem" }}>
            Мы уже знаем о проблеме. Попробуйте обновить страницу — а если не поможет, напишите нам в сообщения
            группы, и мы поможем вручную.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              font: "inherit",
              fontWeight: 600,
              padding: "0.9rem 1.8rem",
              borderRadius: 999,
              border: 0,
              background: "#1c1c1c",
              color: "#f4f1eb",
              cursor: "pointer",
            }}
          >
            Обновить страницу
          </button>
        </main>
      </body>
    </html>
  );
}
