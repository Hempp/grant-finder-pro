import { grantSourceRegistry } from "./registry";
import { GrantsGovSource } from "./grants-gov";
import { SamGovSource } from "./sam-gov";
import { StatePortalsSource } from "./state-portals";
import { CaliforniaGrantsSource } from "./california-grants";

// Register all built-in sources
grantSourceRegistry.register(new GrantsGovSource());
grantSourceRegistry.register(new SamGovSource());
grantSourceRegistry.register(new StatePortalsSource());
grantSourceRegistry.register(new CaliforniaGrantsSource());

export { grantSourceRegistry };
export type { GrantSource, ScrapedGrant } from "./types";
