import { StrapiPet } from "@/lib/api/types";
import { petsService } from "@/lib/api/services/pets";
import { calculateAgeInYears } from "./calculate-age-in-years";

export interface MappedPet {
  id: string;
  slug?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  image: string;
  images: string[];
  status: string;
  description: string;
  tag: string;
  colorName: string;
  colorHex: string;
  size: 'small' | 'medium' | 'large';
  activity: number;
  friendliness: number;
  trainability: number;
  socialized: boolean;
  characteristics?: { activity?: number; friendliness?: number; trainability?: number };
}

/**
 * Normalizes a raw StrapiPet object into a flat, well-structured MappedPet object
 * optimized for presentation rendering and page filtering.
 *
 * @param pet Raw StrapiPet object returned from the API
 * @returns Normalized MappedPet object
 */
export function normalizePetData(pet: StrapiPet): MappedPet {
  const petStatus = pet.petStatus || "shelter";
  const speciesText = pet.type === "dog" ? "Собака" : "Кошка";
  const genderText = pet.sex === "male" ? "Мальчик" : pet.sex === "female" ? "Девочка" : pet.sex === "mixed" ? "Мальчики и девочки" : "Пол не указан";
  
  // Resolve breed
  const breedText = pet.type === "dog" 
    ? (pet.dogBreed?.name || "Метис") 
    : (pet.catBreed?.name || "Метис");

  // Resolve age
  const ageInYears = calculateAgeInYears(pet.birthDate);

  // Resolve color
  const colorName = pet.color?.name || "";
  const colorHex = pet.color?.color || "";

  // Resolve images
  let primaryImage = "";
  let imagesList: string[] = [];

  if (pet.photos && pet.photos.length > 0) {
    primaryImage = petsService.resolveMediaUrl(pet.photos[0].url);
    imagesList = pet.photos.map(photo => petsService.resolveMediaUrl(photo.url));
  } else {
    primaryImage = "/photo-placeholder.jpg";
    imagesList = ["/photo-placeholder.jpg"];
  }

  // Resolve tag
  let tag = "Ищет дом";
  if (petStatus === "home") {
    tag = "Дома";
  }

  return {
    id: pet.documentId,
    slug: pet.slug,
    name: pet.name,
    species: speciesText,
    breed: breedText,
    age: ageInYears,
    gender: genderText,
    image: primaryImage,
    images: imagesList,
    status: petStatus,
    description: pet.shortDescr || pet.descr || "О характере и привычках питомца расскажет куратор при знакомстве.",
    tag: tag,
    colorName,
    colorHex,
    size: pet.size || "medium",
    activity: pet.activity || 3,
    friendliness: pet.friendliness || 3,
    trainability: pet.trainability || 3,
    socialized: pet.socialized !== undefined ? pet.socialized : true,
    // Display only recorded assessments, never the matching algorithm's defaults.
    characteristics: Object.fromEntries(
      (['activity', 'friendliness', 'trainability'] as const)
        .filter(key => Number.isInteger(pet[key]) && pet[key]! >= 1 && pet[key]! <= 5)
        .map(key => [key, pet[key]])
    ),
  };
}
