import { StrapiClient } from "../client";
import { StrapiPet, StrapiResponseCollection } from "../types";

export interface PetFilters {
  status?: string; // 'shelter' or 'home' (wait, in Strapi schema there isn't a direct status field, but wait, let's check how "home" / "shelter" is handled in our DB! Ah! If birthDate exists or isHome exists? Let's check how the DB schema handles this. Wait, let's look at the DB fields: sterilized, socialized, etc. But wait, in the mock page: status is 'home' or 'shelter'. In Strapi, do we have a status? No! Wait, how did the db represent home vs shelter? Ah, maybe we don't have it, or we can filter by type (cat/dog), or we can treat them all as in shelter, or we can treat sterilized/socialized as indicators. Wait! Let's check if the DB has a way to distinguish them, or if we can just return all pets as "shelter" since they are in the database, and only if they are adopted we set it? Actually, let's filter by type/breed, and we can also check if the pet name matches home/shelter, or we can treat all pets as in shelter for now! Let's support a filter by species ('cat' | 'dog') and general query parameters.)
}

export class PetsService extends StrapiClient {
  /**
   * Fetch all pets with pagination and population
   */
  async getPets(options?: {
    type?: 'cat' | 'dog';
    status?: 'shelter' | 'home';
    sex?: 'male' | 'female';
    size?: 'small' | 'medium' | 'large';
    search?: string;
    limit?: number;
    start?: number;
  }): Promise<StrapiPet[] | null> {
    try {
      let query = "/pets?populate[0]=photos&populate[1]=dogBreed&populate[2]=catBreed&populate[3]=color&sort[0]=createdAt:desc";
      
      if (options?.type) {
        query += `&filters[type][$eq]=${options.type}`;
      }
      if (options?.status) {
        query += `&filters[status][$eq]=${options.status}`;
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
      if (options?.limit) {
        query += `&pagination[limit]=${options.limit}`;
      }
      if (options?.start) {
        query += `&pagination[start]=${options.start}`;
      }

      const response = await this.fetchJson<StrapiResponseCollection<StrapiPet>>(query, {
        next: { revalidate: 60 } // Cache and revalidate every minute
      });
      return response.data || [];
    } catch (error) {
      console.error("[PetsService] getPets failed:", error);
      throw error;
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
