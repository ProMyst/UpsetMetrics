export interface SportItem {
  name: string;
  slug: string;
  description: string;
}

// Phase 1 coverage: nine sports at launch.
// Planned future additions: NASCAR, Cricket, Cycling, Rugby.
// Each will follow the same route pattern (app/{slug}/page.tsx) and
// be added to this array when editorial coverage begins.
export const SPORTS: SportItem[] = [
  { name: "Tennis", slug: "tennis", description: "Grand Slams, Masters, and the moments between" },
  { name: "Formula 1", slug: "f1", description: "The grid, the paddock, the unexpected" },
  { name: "Horse Racing", slug: "horse-racing", description: "Churchill Downs to Royal Ascot" },
  { name: "Equestrian", slug: "equestrian", description: "Show jumping, dressage, eventing" },
  { name: "Lacrosse", slug: "lacrosse", description: "College and professional" },
  { name: "Yachting", slug: "yachting", description: "America's Cup and offshore" },
  { name: "Polo", slug: "polo", description: "The sport of kings" },
  { name: "Golf", slug: "golf", description: "Majors, tours, and long-shot Sundays" },
  { name: "American", slug: "american", description: "NFL, NBA, CFB — the big upsets" },
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
