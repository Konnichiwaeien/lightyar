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
  "populate[photos][fields][0]=url",
  "populate[photos][fields][1]=formats",
  "sort[0]=intakeDate:asc",
  "pagination[pageSize]=200",
].join("&");

/** Карточка подопечного для поля «лиц»: минимум, достаточный для кружка и ссылки */
export interface CensusPet {
  documentId: string;
  name: string;
  photo?: string;
  status: "shelter" | "home";
  type: "dog" | "cat";
  intakeYear?: number;
  inTreatment: boolean;
}

interface StrapiCensusPet extends PetStatsInput {
  documentId: string;
  name: string;
  photos?: { url?: string; formats?: { thumbnail?: { url?: string }; small?: { url?: string } } }[] | null;
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
        const intakeYear = pet.intakeDate ? Number(String(pet.intakeDate).slice(0, 4)) : undefined;
        return {
          documentId: pet.documentId,
          name: pet.name,
          photo: source ? this.resolveMediaUrl(source) : undefined,
          status: pet.petStatus === "home" ? "home" : "shelter",
          type: pet.type === "cat" ? "cat" : "dog",
          intakeYear: Number.isInteger(intakeYear) ? intakeYear : undefined,
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
