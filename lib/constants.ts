export interface SportItem {
  name: string;
  slug: string;
  description: string;
}

// Phase 1 coverage — the focused launch lineup 2026-07-03.
// Primary focus (top of the list): Soccer (FIFA WC bracket), WNBA, MLB.
// Secondary focus: NBA and NFL — American league coverage split from the
// original combined "American" route into league-specific pages.
//
// Hidden but preserved (see app/_tennis, _f1, _horse-racing, _equestrian,
// _lacrosse, _yachting, _polo, _golf, _american): the original Phase 1
// niche lineup. Underscore prefix opts folders out of Next.js App Router
// routing while keeping the code + placeholders committed for a future
// unhide when editorial coverage begins.
export const SPORTS: SportItem[] = [
  { name: "Soccer", slug: "soccer", description: "FIFA World Cup, UEFA, CONMEBOL, MLS" },
  { name: "WNBA", slug: "wnba", description: "The growing league, playoffs, rivalries" },
  { name: "MLB", slug: "mlb", description: "162 games, October, the World Series" },
  { name: "NBA", slug: "nba", description: "Regular season, playoffs, the Finals" },
  { name: "NFL", slug: "nfl", description: "Sunday, Monday, Thursday, the Super Bowl" },
];

export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Sports", href: "#", hasDropdown: true },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Methodology", href: "/methodology" },
  { label: "Archive", href: "/archive" },
];

export const TICKER_ITEMS = [
  { matchup: "ALCARAZ d. SINNER", event: "ROLAND GARROS", score: 87 },
  { matchup: "SHELTON d. DJOKOVIC", event: "INDIAN WELLS", score: 91 },
  { matchup: "SCHAUFFELE +1400", event: "THE MASTERS", score: 78 },
  { matchup: "ÅBERG EAGLES 18", event: "US OPEN (GOLF)", score: 72 },
  { matchup: "VERSTAPPEN P9", event: "MONACO GP", score: 64 },
  { matchup: "SIERRA LEONE 50/1", event: "ROYAL ASCOT", score: 93 },
  { matchup: "LIONS OVER CHIEFS", event: "SUPER BOWL", score: 89 },
  { matchup: "CAVS SWEEP CELTICS", event: "NBA EASTERN CONF", score: 84 },
  { matchup: "INEOS CAPSIZE", event: "AMERICA'S CUP", score: 81 },
  { matchup: "LA DOLFINA FALLS", event: "ARGENTINE OPEN", score: 68 },
  { matchup: "BLANEY FROM P28", event: "DAYTONA 500", score: 76 },
  { matchup: "KENT STATE OVER DUKE", event: "NCAA LACROSSE", score: 62 },
];

export const EASE_SILK = [0.22, 1, 0.36, 1] as const;
export const DURATION_REVEAL = 1.2;
export const STAGGER_DEFAULT = 0.08;
