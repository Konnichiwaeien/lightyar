"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Check, ChevronDown, RotateCcw, Search, Tag, X } from "lucide-react";
import type { StrapiTag } from "@/lib/api/types";

type NewsTopic = Pick<StrapiTag, "name" | "slug">;

export function NewsControls({ tags, totalItems }: { tags: NewsTopic[]; totalItems: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [searchReset, setSearchReset] = useState(0);
  const query = params.toString();
  const [optimisticQuery, setOptimisticQuery] = useOptimistic(query);
  const displayParams = new URLSearchParams(optimisticQuery);
  const nextQuery = useRef(query);
  useEffect(() => { if (!pending) nextQuery.current = query; }, [query, pending]);

  const navigate = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(nextQuery.current);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value); else next.delete(key);
    });
    next.delete("page");
    nextQuery.current = next.toString();
    startTransition(() => {
      setOptimisticQuery(next.toString());
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    });
  };
  const selected = (displayParams.get("tag") || "").split(",").filter(Boolean);
  const search = displayParams.get("search") || "";

  return (
    <div className="news-controls" aria-busy={pending}>
      <NewsSearch key={`${search}:${searchReset}`} initial={search} onSearch={value => navigate({ search: value.trim() })} />
      <div className="news-controls__fields">
        <NewsTopics tags={tags} selected={selected} onApply={slugs => navigate({ tag: slugs.join(",") })} />
        <label className="news-select news-select--sort">
          <span className="sr-only">Порядок новостей</span>
          <ArrowUpDown size={17} aria-hidden="true" />
          <select value={displayParams.get("sort") === "publishedAt:asc" ? "publishedAt:asc" : "publishedAt:desc"}
            onChange={event => navigate({ sort: event.target.value })}>
            <option value="publishedAt:desc">Сначала новые</option>
            <option value="publishedAt:asc">Сначала старые</option>
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </label>
      </div>
      <div className="news-controls__feedback">
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">{pending ? "Обновляем новости…" : `Новостей в списке: ${totalItems}`}</span>
        {(selected.length > 0 || search) && <button type="button" className="news-controls__reset"
          onClick={() => { setSearchReset(value => value + 1); navigate({ tag: null, search: null }); }}><RotateCcw size={16} aria-hidden="true" />Сбросить фильтры</button>}
      </div>
    </div>
  );
}

function NewsSearch({ initial, onSearch }: { initial: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(initial);
  return <form role="search" className="news-search" onSubmit={event => { event.preventDefault(); onSearch(value); }}>
    <label htmlFor="news-search" className="sr-only">Поиск по новостям</label>
    <div>
      <Search size={20} aria-hidden="true" />
      <input id="news-search" name="search" autoComplete="off" type="search" value={value} onChange={event => setValue(event.target.value)} placeholder="Поиск новостей…" maxLength={100} />
      {value && <button type="button" className="news-search__clear" aria-label="Очистить поиск" onClick={() => { setValue(""); onSearch(""); }}><X size={17} aria-hidden="true" /></button>}
      <button type="submit" className="news-search__submit"><Search size={17} aria-hidden="true" />Найти</button>
    </div>
  </form>;
}

function NewsTopics({ tags, selected, onApply }: {
  tags: NewsTopic[]; selected: string[]; onApply: (slugs: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const label = selected.length === 1 ? tags.find(tag => tag.slug === selected[0])?.name || "Выбранная тема"
    : selected.length > 1 ? "Темы" : "Все темы";
  return <div className="news-topics" ref={container}
    onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className="news-topics__trigger" data-active={selected.length > 0}
      aria-expanded={open} aria-controls="news-topics-options" onClick={() => { if (!open) setDraft(selected); setOpen(value => !value); }}>
      <Tag size={17} aria-hidden="true" /><span>{label}</span>{selected.length > 1 && <b className="news-topics__count">{selected.length}</b>}<ChevronDown size={14} aria-hidden="true" />
    </button>
    {open && <div id="news-topics-options" className="news-topics__options" data-lenis-prevent>
      <div className="news-topics__heading"><span>Темы новостей</span><button type="button" onClick={() => setDraft([])}>Сбросить</button></div>
      <fieldset className="news-topics__list"><legend className="sr-only">Темы новостей, можно выбрать несколько</legend>
        {tags.map(tag => <label key={tag.slug}>
          <input type="checkbox" checked={draft.includes(tag.slug)} onChange={() => setDraft(current => current.includes(tag.slug) ? current.filter(slug => slug !== tag.slug) : [...current, tag.slug])} />
          <span>{tag.name}</span>
          <Check className="news-topics__check" size={17} aria-hidden="true" />
        </label>)}
      </fieldset>
      <div className="news-topics__actions">
        <button type="button" className="news-topics__cancel" onClick={() => { setOpen(false); trigger.current?.focus(); }}>Отмена</button>
        <button type="button" className="news-topics__apply" onClick={() => {
          if (draft.length !== selected.length || draft.some(slug => !selected.includes(slug))) onApply(draft);
          setOpen(false); trigger.current?.focus();
        }}>Применить</button>
      </div>
    </div>}
  </div>;
}
