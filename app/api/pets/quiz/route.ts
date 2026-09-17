import { petsService } from '@/lib/api/services/pets';
import { normalizePetData } from '@/lib/helpers/pets/normalize-pet-data';
export async function GET() {
  try {
    const pets = await petsService.getQuizPets();
    return Response.json(pets.map(normalizePetData), {headers:{'Cache-Control':'public, max-age=60, s-maxage=3600'}});
  } catch {
    return Response.json({error:'Не удалось загрузить питомцев'},{status:503});
  }
}
