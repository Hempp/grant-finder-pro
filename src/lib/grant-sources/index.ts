import { grantSourceRegistry } from "./registry";
import { GrantsGovSource } from "./grants-gov";
import { SamGovSource } from "./sam-gov";
import { StatePortalsSource } from "./state-portals";
import { CaliforniaGrantsSource } from "./california-grants";
import { FoundationsSource } from "./foundations";
import { CorporateGrantsSource } from "./corporate";
import { NsfAwardsSource } from "./nsf-awards";

// Register all built-in sources
grantSourceRegistry.register(new GrantsGovSource());
grantSourceRegistry.register(new SamGovSource());
grantSourceRegistry.register(new StatePortalsSource());
grantSourceRegistry.register(new CaliforniaGrantsSource());
grantSourceRegistry.register(new FoundationsSource());
grantSourceRegistry.register(new CorporateGrantsSource());
grantSourceRegistry.register(new NsfAwardsSource());

export { grantSourceRegistry };
export type { GrantSource, ScrapedGrant } from "./types";
