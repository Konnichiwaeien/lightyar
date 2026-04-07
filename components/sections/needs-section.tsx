"use client";

import { ShoppingCart, Package, Heart, Truck } from "lucide-react";

interface Props {
  textEnter: () => void;
  textLeave: () => void;
}

const ITEMS = [
  { 
    title: "Сухой корм", 
    desc: "Для собак и щенков (Pedigree, Chappi, Сириус). Важен каждый килограмм.",
    icon: Package,
    color: "bg-amber-100 text-amber-600"
  },
  { 
    title: "Консервы", 
    desc: "Влажные корма для кошек, послеоперационных и стареньких животных.",
    icon: Heart,
    color: "bg-rose-100 text-rose-600"
  },
  { 
    title: "Пеленки 60×90", 
    desc: "Жизненно необходимы для щенков, спинальников и животных в стационаре.",
    icon: ShoppingCart,
    color: "bg-sky-100 text-sky-600"
  },
  { 
    title: "Амуниция", 
    desc: "Крепкие поводки от 3 метров, ошейники для средних и крупных собак, шлейки.",
    icon: Truck,
    color: "bg-emerald-100 text-emerald-600"
  },
];

export function NeedsSection({ textEnter, textLeave }: Props) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#f4f0eb] border-b border-stone-200" id="needs">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">[ Гуманитарная помощь ]</h2>
            <h3
              className="text-4xl md:text-5xl lg:text-7xl font-serif text-stone-900 leading-[1.05]"
              onMouseEnter={textEnter}
              onMouseLeave={textLeave}
            >
              Вы можете помочь <br />
              <span className="italic font-light text-stone-500">вещами</span>
            </h3>
          </div>
          <div className="max-w-md">
            <p className="text-stone-600 font-light text-lg">
              Закажите необходимое на пункты выдачи WB или Ozon, и наши волонтеры заберут посылку. Мы рады любой, даже самой маленькой баночке корма.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 flex flex-col shadow-xl shadow-stone-200/50 hover:-translate-y-2 transition-transform duration-500"
                onMouseEnter={textEnter}
                onMouseLeave={textLeave}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-8`}>
                  <Icon size={24} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-stone-900">{item.title}</h4>
                <p className="text-stone-500 font-light text-sm flex-1 mb-8">{item.desc}</p>
                <div className="flex gap-2 mt-auto">
                  <a
                    href="#"
                    className="flex-1 text-center bg-stone-100 text-stone-600 hover:bg-fuchsia-600 hover:text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors pointer-events-auto cursor-none"
                  >
                    Wildberries
                  </a>
                  <a
                    href="#"
                    className="flex-1 text-center bg-stone-100 text-stone-600 hover:bg-blue-500 hover:text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors pointer-events-auto cursor-none"
                  >
                    Ozon
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
