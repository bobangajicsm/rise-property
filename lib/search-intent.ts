import type { Property } from "@/types/property";

export interface SearchShortcutConfig {
  id: string;
  label: string;
  query: string;
  kind: "bedrooms" | "property";
  bedrooms?: "1" | "2" | "3" | "4";
  matcher?: string;
}

export const QATAR_SEARCH_SHORTCUTS: SearchShortcutConfig[] = [
  {
    id: "studio",
    label: "Studio",
    query: "studio",
    kind: "property",
    matcher: "studio",
  },
  {
    id: "1bhk",
    label: "1 Bedroom",
    query: "1bhk",
    kind: "bedrooms",
    bedrooms: "1",
  },
  {
    id: "2bhk",
    label: "2 Bedrooms",
    query: "2bhk",
    kind: "bedrooms",
    bedrooms: "2",
  },
  {
    id: "3bhk",
    label: "3 Bedrooms",
    query: "3bhk",
    kind: "bedrooms",
    bedrooms: "3",
  },
  {
    id: "4bhk",
    label: "4+ Bedrooms",
    query: "4bhk",
    kind: "bedrooms",
    bedrooms: "4",
  },
  {
    id: "villa",
    label: "Villa",
    query: "villa",
    kind: "property",
    matcher: "villa",
  },
  {
    id: "penthouse",
    label: "Penthouse",
    query: "penthouse",
    kind: "property",
    matcher: "penthouse",
  },
  {
    id: "office",
    label: "Office",
    query: "office",
    kind: "property",
    matcher: "office",
  },
  {
    id: "shop",
    label: "Shop",
    query: "shop",
    kind: "property",
    matcher: "shop",
  },
];

export interface ParsedSearchIntent {
  normalizedQuery: string;
  cleanedQuery: string;
  bedrooms: "1" | "2" | "3" | "4" | null;
  propertyMatchers: string[];
}

export function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function parsePropertySearchIntent(query: string): ParsedSearchIntent {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return {
      normalizedQuery,
      cleanedQuery: "",
      bedrooms: null,
      propertyMatchers: [],
    };
  }

  let cleanedQuery = ` ${normalizedQuery} `;
  let bedrooms: ParsedSearchIntent["bedrooms"] = null;

  const bedroomMatchers: Array<{
    regex: RegExp;
    value: ParsedSearchIntent["bedrooms"];
  }> = [
    { regex: /\b4\s*\+?\s*bhk\b/g, value: "4" },
    { regex: /\b3\s*bhk\b/g, value: "3" },
    { regex: /\b2\s*bhk\b/g, value: "2" },
    { regex: /\b1\s*bhk\b/g, value: "1" },
    { regex: /\b4\s*\+?\s*bed(room)?s?\b/g, value: "4" },
    { regex: /\b3\s*bed(room)?s?\b/g, value: "3" },
    { regex: /\b2\s*bed(room)?s?\b/g, value: "2" },
    { regex: /\b1\s*bed(room)?s?\b/g, value: "1" },
  ];

  for (const matcher of bedroomMatchers) {
    if (matcher.regex.test(cleanedQuery)) {
      bedrooms = matcher.value;
      cleanedQuery = cleanedQuery.replace(matcher.regex, " ");
      break;
    }
  }

  const propertyMatchers = QATAR_SEARCH_SHORTCUTS.filter(
    (shortcut) =>
      shortcut.kind === "property" &&
      shortcut.matcher &&
      cleanedQuery.includes(` ${shortcut.matcher} `),
  ).map((shortcut) => shortcut.matcher as string);

  for (const matcher of propertyMatchers) {
    cleanedQuery = cleanedQuery.replace(new RegExp(`\\b${matcher}\\b`, "g"), " ");
  }

  return {
    normalizedQuery,
    cleanedQuery: normalizeSearchValue(cleanedQuery),
    bedrooms,
    propertyMatchers,
  };
}

export function hasShortcutIntent(intent: ParsedSearchIntent) {
  return Boolean(intent.bedrooms || intent.propertyMatchers.length > 0);
}

export function matchesShortcutIntent(
  property: Pick<Property, "beds" | "title" | "type">,
  intent: ParsedSearchIntent,
) {
  const shortcutHaystack = `${property.title} ${property.type}`.toLowerCase();

  if (intent.bedrooms) {
    if (intent.bedrooms === "4") {
      if (property.beds < 4) {
        return false;
      }
    } else if (property.beds !== Number.parseInt(intent.bedrooms, 10)) {
      return false;
    }
  }

  if (
    intent.propertyMatchers.length > 0 &&
    !intent.propertyMatchers.every((matcher) => shortcutHaystack.includes(matcher))
  ) {
    return false;
  }

  return true;
}
