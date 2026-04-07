import { scholarshipSourceRegistry } from "./registry";
import { CuratedDatabaseSource } from "./curated-database";
import { FederalStudentAidSource } from "./federal-student-aid";
import { CorporateScholarshipsSource } from "./corporate-scholarships";

// Register all scholarship sources
scholarshipSourceRegistry.register(new FederalStudentAidSource());
scholarshipSourceRegistry.register(new CuratedDatabaseSource());
scholarshipSourceRegistry.register(new CorporateScholarshipsSource());

export { scholarshipSourceRegistry } from "./registry";
export type { ScholarshipSource, ScrapedScholarship, ScholarshipFilters } from "./types";
export { ScholarshipSourceRegistry } from "./registry";
export { CuratedDatabaseSource } from "./curated-database";
export { FederalStudentAidSource } from "./federal-student-aid";
export { CorporateScholarshipsSource } from "./corporate-scholarships";
