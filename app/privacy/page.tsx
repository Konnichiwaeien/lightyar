import type { Metadata } from "next";
import Link from "next/link";
import { InnerHeader } from "@/components/layout/inner-header";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Правила обработки персональных данных на сайте АНБО «Светлый».",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#e8e4dc] text-[#1c1c1c]">
      <InnerHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 md:px-12">
        <article className="rounded-[2rem] border border-black/5 bg-[#fcfaf7] p-6 shadow-sm [overflow-wrap:anywhere] sm:p-10 md:p-14">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">АНБО «Светлый»</p>
          <h1 className="mb-6 font-serif text-4xl leading-tight sm:text-5xl">Политика конфиденциаль&shy;ности</h1>
          <p className="mb-10 text-sm text-black/55">Редакция от 27 августа 2026 года</p>

          <div className="space-y-9 text-base leading-7 text-black/75">
            <section>
              <h2 className="mb-3 font-serif text-2xl text-black">1. Кто обрабатывает данные</h2>
              <p>
                Оператор — Автономная некоммерческая благотворительная организация «Светлый», ИНН 7604398926,
                ОГРН 1247600009590. Юридический адрес: г. Ярославль, ул. Республиканская, д. 78/9, кв. 16.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-2xl text-black">2. Какие данные мы получаем</h2>
              <p>
                При отправке заявки на подарок сайт получает имя, телефон, необязательный адрес электронной почты,
                изображение или PDF со штрих-кодом заказа, а также технические данные, необходимые для защиты формы от спама.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-2xl text-black">3. Для чего нужны данные</h2>
              <p>
                Данные используются только для связи с дарителем, получения посылки, подтверждения её передачи приюту,
                защиты формы от злоупотреблений и исполнения требований законодательства. Основание обработки — согласие,
                которое пользователь даёт перед отправкой формы.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-2xl text-black">4. Хранение и доступ</h2>
              <p>
                Доступ получают только сотрудники и волонтёры, которым он необходим для обработки заявки, а также
                технические поставщики хостинга и хранения файлов. Данные не публикуются и не продаются. Они хранятся не
                дольше, чем это нужно для выполнения заявки и соблюдения обязательных требований закона, после чего удаляются
                или обезличиваются.
              </p>
            </section>

            <section>
              <h2 className="mb-3 font-serif text-2xl text-black">5. Права пользователя</h2>
              <p>
                Можно запросить сведения об обработке, исправление или удаление данных, а также отозвать согласие. Для этого
                напишите в официальные сообщения организации во ВКонтакте и укажите, какую заявку нужно найти.
              </p>
              <a
                href="https://vk.com/im?sel=-228082117"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-12 items-center rounded-full bg-[#2e2620] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber-600"
              >
                Написать организации
              </a>
            </section>
          </div>

          <Link href="/" className="mt-12 inline-flex text-sm font-semibold text-amber-800 underline underline-offset-4">
            Вернуться на главную
          </Link>
        </article>
      </main>
    </div>
  );
}
