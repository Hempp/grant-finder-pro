import { grantSourceRegistry } from "./registry";
import { GrantsGovSource } from "./grants-gov";
import { SimplerGrantsGovSource } from "./simpler-grants-gov";
import { SamGovSource } from "./sam-gov";
import { NihReporterSource } from "./nih-reporter";
import { SbirGovSource } from "./sbir-gov";
import { StatePortalsSource } from "./state-portals";
import { CaliforniaGrantsSource } from "./california-grants";
import { FoundationsSource } from "./foundations";
import { CorporateGrantsSource } from "./corporate";
import { NsfAwardsSource } from "./nsf-awards";

// Register all built-in sources
grantSourceRegistry.register(new GrantsGovSource());
grantSourceRegistry.register(new SimplerGrantsGovSource());
grantSourceRegistry.register(new SamGovSource());
grantSourceRegistry.register(new NihReporterSource());
grantSourceRegistry.register(new SbirGovSource());
grantSourceRegistry.register(new StatePortalsSource());
grantSourceRegistry.register(new CaliforniaGrantsSource());
grantSourceRegistry.register(new FoundationsSource());
grantSourceRegistry.register(new CorporateGrantsSource());
grantSourceRegistry.register(new NsfAwardsSource());

export { grantSourceRegistry };
export type { GrantSource, ScrapedGrant } from "./types";
