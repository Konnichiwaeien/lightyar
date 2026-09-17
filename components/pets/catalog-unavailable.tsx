import { InnerHeader } from '@/components/layout/inner-header';
export function CatalogUnavailable() {
  return <div className="pets-page"><InnerHeader /><main id="main-content" className="pets-wrap pets-error" tabIndex={-1}>
    <h1>Не получилось загрузить питомцев</h1>
    <p>Попробуйте обновить страницу через минуту. Если каталог всё ещё не открывается, напишите нам во ВКонтакте.</p>
    {/* A full document retry also recovers a cached failed server response. */}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
    <a className="pets-button" href="/pets">Обновить каталог</a>
    <p><a className="pets-text-link" href="https://vk.com/im?sel=-228082117">Написать в приют</a></p>
  </main></div>;
}
