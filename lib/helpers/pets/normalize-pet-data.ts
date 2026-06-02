import { StrapiPet } from "@/lib/api/types";
import { petsService } from "@/lib/api/services/pets";
import { calculateAgeInYears } from "./calculate-age-in-years";

export interface MappedPet {
  id: string;
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
}

/**
 * Normalizes a raw StrapiPet object into a flat, well-structured MappedPet object
 * optimized for presentation rendering and page filtering.
 *
 * @param pet Raw StrapiPet object returned from the API
 * @returns Normalized MappedPet object
 */
export function normalizePetData(pet: StrapiPet): MappedPet {
  const petStatus = pet.status || "shelter";
  const speciesText = pet.type === "dog" ? "Собака" : "Кошка";
  const genderText = pet.sex === "male" ? "Мальчик" : "Девочка";
  
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

  // Use first character's char code of the ID for consistent hash indexing
  const idHash = pet.documentId ? pet.documentId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

  if (pet.photos && pet.photos.length > 0) {
    primaryImage = petsService.resolveMediaUrl(pet.photos[0].url);
    imagesList = pet.photos.map(photo => petsService.resolveMediaUrl(photo.url));
  } else {
    primaryImage = "";
    imagesList = [];
  }

  // Resolve tag
  let tag = "Ищет дом";
  if (petStatus === "home") {
    tag = "Дома";
  } else if (idHash % 4 === 1) {
    tag = "Новенький";
  } else if (idHash % 4 === 2) {
    tag = "Срочно";
  }

  return {
    id: pet.documentId,
    name: pet.name,
    species: speciesText,
    breed: breedText,
    age: ageInYears,
    gender: genderText,
    image: primaryImage,
    images: imagesList,
    status: petStatus,
    description: pet.shortDescr || pet.descr || "Ищет заботливую семью. Очень ласковый, послушный и приученный к порядку.",
    tag: tag,
    colorName,
    colorHex,
    size: pet.size || "medium",
    activity: pet.activity || 3,
    friendliness: pet.friendliness || 3,
    trainability: pet.trainability || 3,
    socialized: pet.socialized !== undefined ? pet.socialized : true,
  };
}
