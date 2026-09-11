import { StrapiClient } from "../client";
import type { StrapiResponseCollection } from "../types";
import { buildPetStats, EMPTY_PET_STATS, type PetStats, type PetStatsInput } from "../../reports/pet-stats";

const STATS_QUERY = [
  "status=published",
  "fields[0]=petStatus",
  "fields[1]=type",
  "fields[2]=intakeDate",
  "fields[3]=adoptedAt",
  "fields[4]=undergoingTreatment",
  "pagination[pageSize]=200",
].join("&");

const CENSUS_QUERY = [
  "status=published",
  "fields[0]=name",
  "fields[1]=petStatus",
  "fields[2]=type",
  "fields[3]=intakeDate",
  "fields[4]=adoptedAt",
  "fields[5]=undergoingTreatment",
  "fields[6]=birthDate",
  "fields[7]=sex",
  "fields[8]=size",
  "fields[9]=sterilized",
  "fields[10]=weight",
  "fields[11]=height",
  "populate[photos][fields][0]=url",
  "populate[photos][fields][1]=formats",
  "populate[photos][fields][2]=width",
  "populate[photos][fields][3]=height",
  "sort[0]=intakeDate:asc",
  "pagination[pageSize]=200",
].join("&");

/** Карточка подопечного для поля «лиц»: минимум, достаточный для кружка и ссылки */
export interface CensusPet {
  documentId: string;
  name: string;
  photo?: string;
  /** Тот же кадр крупно: кружку хватает превью, плитке в тримапе нет */
  cover?: string;
  status: "shelter" | "home";
  type: "dog" | "cat";
  intakeYear?: number;
  /** Полные даты нужны графику: по ним считаются кварталы */
  intakeDate?: string;
  adoptedAt?: string;
  /** Дата рождения есть у всех карточек: по ней строится шкала возраста */
  birthDate?: string;
  sex?: string;
  size?: string;
  sterilized?: boolean;
  /** Вес в килограммах и число фотографий: для цифр, которых нет в отчётах */
  weight?: number;
  photoCount?: number;
  /** Все кадры карточки в среднем размере: для галереи случайных моментов */
  gallery?: { src: string; width: number; height: number }[];
  inTreatment: boolean;
}

/** Вес в базе бывает строкой с запятой: приводим к числу, мусор отбрасываем. */
function parseWeight(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

interface StrapiCensusPet extends PetStatsInput {
  documentId: string;
  name: string;
  birthDate?: string | null;
  sex?: string | null;
  size?: string | null;
  sterilized?: boolean | null;
  weight?: number | string | null;
  photos?: {
    url?: string;
    width?: number;
    height?: number;
    formats?: {
      thumbnail?: { url?: string };
      small?: { url?: string };
      medium?: { url?: string; width?: number; height?: number };
      large?: { url?: string; width?: number; height?: number };
    };
  }[] | null;
}

export class PetStatsService extends StrapiClient {
  /**
   * Сводка по всем подопечным. Отчётность обновляется редко, поэтому кэш
   * держится час: постоянно пересчитывать 79 карточек на каждый визит незачем.
   */
  async getPetStats(): Promise<PetStats> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<PetStatsInput>>(
        `/pets?${STATS_QUERY}`,
        { next: { revalidate: 3600 } },
      );
      return buildPetStats(response.data || []);
    } catch (error) {
      console.error("[PetStatsService] getPetStats failed:", error);
      return EMPTY_PET_STATS;
    }
  }

  /**
   * Подопечные для поля «лиц». Берём самое маленькое из доступных превью —
   * кружок редко шире 80px, полноразмерное фото здесь ни к чему.
   */
  async getCensusPets(): Promise<CensusPet[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiCensusPet>>(
        `/pets?${CENSUS_QUERY}`,
        { next: { revalidate: 3600 } },
      );
      return (response.data || []).map((pet) => {
        const first = pet.photos?.[0];
        const source = first?.formats?.thumbnail?.url || first?.formats?.small?.url || first?.url;
        // Плитка бывает шире 600px, и превью на ней расплывалось.
        const large = first?.formats?.large?.url || first?.formats?.medium?.url || first?.url;
        const intakeYear = pet.intakeDate ? Number(String(pet.intakeDate).slice(0, 4)) : undefined;
        return {
          documentId: pet.documentId,
          name: pet.name,
          photo: source ? this.resolveMediaUrl(source) : undefined,
          cover: large ? this.resolveMediaUrl(large) : undefined,
          status: pet.petStatus === "home" ? "home" : "shelter",
          type: pet.type === "cat" ? "cat" : "dog",
          intakeYear: Number.isInteger(intakeYear) ? intakeYear : undefined,
          intakeDate: pet.intakeDate ?? undefined,
          adoptedAt: pet.adoptedAt ?? undefined,
          birthDate: pet.birthDate ?? undefined,
          sex: pet.sex ?? undefined,
          size: pet.size ?? undefined,
          sterilized: pet.sterilized ?? undefined,
          weight: parseWeight(pet.weight),
          photoCount: pet.photos?.length ?? 0,
          gallery: (pet.photos ?? []).flatMap((photo) => {
            const format = photo.formats?.large ?? photo.formats?.medium;
            const url = format?.url ?? photo.url;
            const width = format?.width ?? photo.width;
            const height = format?.height ?? photo.height;
            return url && width && height ? [{ src: this.resolveMediaUrl(url), width, height }] : [];
          }),
          inTreatment: pet.undergoingTreatment === true && pet.petStatus !== "home",
        };
      });
    } catch (error) {
      console.error("[PetStatsService] getCensusPets failed:", error);
      return [];
    }
  }
}

export const petStatsService = new PetStatsService();
export default petStatsService;
