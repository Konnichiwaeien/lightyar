import Image from "next/image";

/**
 * Первый экран раздела. Фотография ведёт, текст сидит в нижней трети,
 * оба действия ведут внутрь страницы — заглушек здесь нет.
 */
export function ReportsHero({
  imageUrl,
  latestYear,
}: {
  imageUrl?: string;
  latestYear?: number;
}) {
  return (
    <section className="reports-hero">
      <div className="reports-hero-inner">
        {imageUrl ? (
          <div className="reports-hero-media">
            <Image
              src={imageUrl}
              alt="Волонтёр выводит собак на утреннюю прогулку"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : null}
        <div className="reports-hero-body">
          <div className="reports-wrap">
            <h1>
              Что мы сделали <em>на ваши деньги</em>
            </h1>
            <div className="reports-hero-meta">
              <p>Каждый рубль, каждое животное и каждый документ с октября 2024 года.</p>
              <div className="reports-pill-row">
                {latestYear ? (
                  <a className="reports-pill" href={`/reports/${latestYear}`}>
                    Открыть отчёт за {latestYear}
                  </a>
                ) : null}
                <a className="reports-pill reports-pill--ghost" href="#itogi">
                  Итоги за всё время
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
