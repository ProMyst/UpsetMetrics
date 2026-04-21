export interface SportItem {
  name: string;
  slug: string;
  description: string;
}

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
  { matchup: "ALCARAZ → NORRIE", event: "INDIAN WELLS", score: 88 },
  { matchup: "VERSTAPPEN P7", event: "MONACO", score: 64 },
  { matchup: "SIERRA LEONE 50/1", event: "CHURCHILL DOWNS", score: 91 },
  { matchup: "YALE OVER DUKE", event: "NCAA LACROSSE", score: 73 },
  { matchup: "LUNA ROSSA CAPSIZE", event: "AMERICA'S CUP", score: 82 },
  { matchup: "MATSUYAMA +2800", event: "THE OPEN", score: 77 },
  { matchup: "CELTICS SWEPT", event: "NBA PLAYOFFS", score: 85 },
  { matchup: "POLO CHALLENGE UPSET", event: "ARGENTINE OPEN", score: 69 },
];

export const EASE_SILK = [0.22, 1, 0.36, 1] as const;
export const DURATION_REVEAL = 1.2;
export const STAGGER_DEFAULT = 0.08;
