import type { StrapiPet } from "../lib/api/types";

const importedPetStatus: Pick<StrapiPet, "petStatus"> = {
  petStatus: "home",
};

void importedPetStatus;
