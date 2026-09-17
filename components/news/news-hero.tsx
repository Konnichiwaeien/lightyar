import { ArrowDown } from "lucide-react";
import { NewsEntrance } from "./news-entrance";
import { NewsHeroGallery } from "./news-hero-gallery";

export function NewsHero() {
  return (
    <section className="news-hero" aria-labelledby="news-title">
      <div className="news-shell">
        <div className="news-hero__layout">
          <div className="news-hero__copy">
            <h1 id="news-title">Новости<br /><em>приюта</em></h1>
            <p>Прогулки с волонтёрами, новости подопечных и приветы из дома. Рассказываем, что происходит в «Светлом», и публикуем отчёты о сборах.</p>
            <a href="#news-feed" className="news-read-link">Читать истории <span><ArrowDown size={20} aria-hidden="true" /></span></a>
          </div>
          <NewsEntrance>
            <NewsHeroGallery />
          </NewsEntrance>
        </div>
      </div>
    </section>
  );
}
