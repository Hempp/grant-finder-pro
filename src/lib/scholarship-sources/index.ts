import { scholarshipSourceRegistry } from "./registry";
import { CuratedDatabaseSource } from "./curated-database";
import { FederalStudentAidSource } from "./federal-student-aid";
import { CorporateScholarshipsSource } from "./corporate-scholarships";
import { NicheScholarshipsSource } from "./niche-scholarships";
import { StateScholarshipsSource } from "./state-scholarships";
import { ProfessionalAssociationsSource } from "./professional-associations";
import { MinorityScholarshipsSource } from "./minority-scholarships";
import { EssayContestsSource } from "./essay-contests";
import { Scholarships360Source } from "./scholarships360";
import { CollegeBoardSource } from "./college-board";

// Register all scholarship sources
scholarshipSourceRegistry.register(new FederalStudentAidSource());
scholarshipSourceRegistry.register(new CuratedDatabaseSource());
scholarshipSourceRegistry.register(new CorporateScholarshipsSource());
scholarshipSourceRegistry.register(new NicheScholarshipsSource());
scholarshipSourceRegistry.register(new StateScholarshipsSource());
scholarshipSourceRegistry.register(new ProfessionalAssociationsSource());
scholarshipSourceRegistry.register(new MinorityScholarshipsSource());
scholarshipSourceRegistry.register(new EssayContestsSource());
scholarshipSourceRegistry.register(new Scholarships360Source());
scholarshipSourceRegistry.register(new CollegeBoardSource());

export { scholarshipSourceRegistry } from "./registry";
export type { ScholarshipSource, ScrapedScholarship, ScholarshipFilters } from "./types";
export { ScholarshipSourceRegistry } from "./registry";
export { CuratedDatabaseSource } from "./curated-database";
export { FederalStudentAidSource } from "./federal-student-aid";
export { CorporateScholarshipsSource } from "./corporate-scholarships";
export { NicheScholarshipsSource } from "./niche-scholarships";
export { StateScholarshipsSource } from "./state-scholarships";
export { ProfessionalAssociationsSource } from "./professional-associations";
export { MinorityScholarshipsSource } from "./minority-scholarships";
export { EssayContestsSource } from "./essay-contests";
export { Scholarships360Source } from "./scholarships360";
export { CollegeBoardSource } from "./college-board";
