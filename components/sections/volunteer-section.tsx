"use client";

import Image from "next/image";
import { ArrowUpRight, Camera, Footprints, HouseHeart, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useCursor } from "@/components/ui/cursor-context";
import "./volunteer-section.css";

const VOLUNTEER_ROLES = [
  {
    icon: Footprints,
    title: "Выгул",
    description: "Погулять и пообщаться с собаками недалеко от Ярославля",
  },
  {
    icon: Camera,
    title: "Фото и посты",
    description: "Снять питомца и помочь рассказать о нём",
  },
  {
    icon: HouseHeart,
    title: "Передержка",
    description: "Дать животному временный дом и спокойный быт",
  },
] as const;

export function VolunteerSection({ imageUrl }: { imageUrl?: string }) {
  const { imageEnter, imageLeave } = useCursor();

  return (
    <section className="volunteer-section" id="volunteer">
      <div className="volunteer-editorial">
        <header className="volunteer-copy">
          <h2>
            Приходите <em>помогать</em>
          </h2>
          <p>
            Можно приехать погулять с собаками, помочь с фото и постами или взять животное
            на передержку. Выберите то, что подходит именно вам.
          </p>
        </header>

        <figure
          className="volunteer-scene"
          onMouseEnter={imageEnter}
          onMouseLeave={imageLeave}
        >
          <Image
            src={imageUrl || "/about/panorama.jpg"}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[50%_50%] md:object-[50%_48%]"
          />
        </figure>

        <aside className="volunteer-action-panel" aria-label="Как можно помочь">
          <ol>
            {VOLUNTEER_ROLES.map((role, index) => {
              const RoleIcon = role.icon;
              return (
                <motion.li
                  className="volunteer-role"
                  key={role.title}
                  initial={false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.48, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="volunteer-role__number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="volunteer-role__icon" aria-hidden="true"><RoleIcon size={30} strokeWidth={1.65} /></span>
                  <div className="volunteer-role__copy">
                    <strong>{role.title}</strong>
                    <p>{role.description}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
          <a href="mailto:help@svetly.ru?subject=Хочу стать волонтером">
            <span><Mail size={17} aria-hidden="true" /> Отправить заявку</span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}
