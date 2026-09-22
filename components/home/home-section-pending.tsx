const labels = {
  pets: "Они ищут дом",
  campaigns: "Нужна помощь",
  donate: "Помощь не может ждать",
  needs: "Соберём посылку",
  news: "Новости «Светлого»",
};

/** Real anchors and reserved space exist before the streamed section arrives. */
export function HomeSectionPending({ section }: { section: keyof typeof labels }) {
  return (
    <section id={section} data-home-pending={section} aria-busy="true"
      aria-label={labels[section]} className={`home-section-pending home-section-pending--${section}`}>
      <div className="home-section-pending__content">
        <h2>{labels[section]}</h2>
        <p role="status">Загружаем…</p>
        <div className="home-section-pending__shape" aria-hidden="true" />
      </div>
    </section>
  );
}
