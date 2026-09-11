import { StrapiClient } from "../client";
import { StrapiPet, StrapiResponseCollection } from "../types";

export interface PetsQueryOptions {
  type?: "cat" | "dog";
  status?: "shelter" | "home";
  sex?: "male" | "female";
  size?: "small" | "medium" | "large";
  search?: string;
  sort?: string;
  limit?: number;
  start?: number;
  ids?: string[];
}

const QUIZ_PETS_QUERY = [
  "fields[0]=name",
  "fields[1]=type",
  "fields[2]=sex",
  "fields[3]=size",
  "fields[4]=birthDate",
  "fields[5]=shortDescr",
  "fields[6]=petStatus",
  "fields[7]=activity",
  "fields[8]=friendliness",
  "fields[9]=trainability",
  "fields[10]=socialized",
  "populate[photos][fields][0]=url",
  "populate[dogBreed][fields][0]=name",
  "populate[catBreed][fields][0]=name",
  "filters[petStatus][$eq]=shelter",
  "sort[0]=name:asc",
  "pagination[pageSize]=100",
].join("&");


export class PetsService extends StrapiClient {
  /**
   * Fetch all pets with pagination and population
   */
  async getPetsCollection(options?: PetsQueryOptions): Promise<StrapiResponseCollection<StrapiPet>> {
    if (options?.ids && options.ids.length === 0) {
      return { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
    }

    try {
      const defaultSort = options?.sort || 'createdAt:desc';
      let query = `/pets?populate[0]=photos&populate[1]=dogBreed&populate[2]=catBreed&populate[3]=color&sort[0]=${defaultSort}`;
      
      if (options?.type) {
        query += `&filters[type][$eq]=${options.type}`;
      }
      if (options?.status) {
        query += `&filters[petStatus][$eq]=${options.status}`;
      }
      if (options?.sex) {
        query += `&filters[sex][$eq]=${options.sex}`;
      }
      if (options?.size) {
        query += `&filters[size][$eq]=${options.size}`;
      }
      if (options?.search) {
        query += `&filters[name][$containsi]=${encodeURIComponent(options.search)}`;
      }
      options?.ids?.forEach((id, index) => {
        query += `&filters[documentId][$in][${index}]=${encodeURIComponent(id)}`;
      });
      if (options?.limit) {
        query += `&pagination[limit]=${options.limit}`;
      }
      if (options?.start) {
        query += `&pagination[start]=${options.start}`;
      }

      const response = await this.fetchJson<StrapiResponseCollection<StrapiPet>>(query, {
        next: { revalidate: 60 } // Cache and revalidate every minute
      });
      return response;
    } catch (error) {
      console.error("[PetsService] getPetsCollection failed:", error);
      throw error;
    }
  }

  async getPets(options?: PetsQueryOptions): Promise<StrapiPet[] | null> {
    const response = await this.getPetsCollection(options);
    return response.data || [];
  }

  async getQuizPets(): Promise<StrapiPet[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<StrapiPet>>(
        `/pets?${QUIZ_PETS_QUERY}`,
        { next: { revalidate: 3600 } },
      );
      return response.data || [];
    } catch (error) {
      console.error("[PetsService] getQuizPets failed:", error);
      return [];
    }
  }

  /**
   * Fetch a single pet by its documentId (or ID)
   */
  async getPetById(id: string): Promise<StrapiPet | null> {
    try {
      // In Strapi v5, we fetch by documentId. We can fetch using /pets/[documentId]
      const response = await this.fetchJson<{ data: StrapiPet }>(
        `/pets/${id}?populate[0]=photos&populate[1]=dogBreed&populate[2]=catBreed&populate[3]=color`,
        {
          next: { revalidate: 60 }
        }
      );
      return response.data || null;
    } catch (error) {
      console.error(`[PetsService] getPetById failed for ID: ${id}`, error);
      throw error;
    }
  }

  /**
   * Fetch all pet documentIds for static routing (SSG)
   */
  async getAllPetIds(): Promise<string[]> {
    try {
      const response = await this.fetchJson<StrapiResponseCollection<{ documentId: string }>>(
        `/pets?fields[0]=documentId&pagination[limit]=200`,
        {
          next: { revalidate: 3600 }
        }
      );
      return (response.data || []).map(item => item.documentId);
    } catch (error) {
      console.error("[PetsService] getAllPetIds failed:", error);
      return [];
    }
  }
}

export const petsService = new PetsService();
export default petsService;
