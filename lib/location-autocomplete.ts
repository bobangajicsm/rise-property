export interface LocationSuggestion {
  label: string;
  value: string;
  category: string;
  score: number;
}

function scoreSuggestion(value: string, query: string) {
  const normalizedValue = value.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedValue === normalizedQuery) {
    return 120;
  }

  if (normalizedValue.startsWith(normalizedQuery)) {
    return 90;
  }

  if (normalizedValue.split(/\s+/).some((part) => part.startsWith(normalizedQuery))) {
    return 70;
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return 50;
  }

  return 0;
}

export function getLocationSuggestions({
  query,
  primaryLocations,
  secondaryLocations = [],
}: {
  query: string;
  primaryLocations: string[];
  secondaryLocations?: string[];
}) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const suggestions = new Map<string, LocationSuggestion>();

  for (const value of primaryLocations) {
    const score = scoreSuggestion(value, normalizedQuery);

    if (score > 0) {
      suggestions.set(value, {
        label: value,
        value,
        category: "Popular",
        score,
      });
    }
  }

  for (const value of secondaryLocations) {
    const score = scoreSuggestion(value, normalizedQuery);

    if (score > 0 && !suggestions.has(value)) {
      suggestions.set(value, {
        label: value,
        value,
        category: "Location",
        score: score - 5,
      });
    }
  }

  return [...suggestions.values()]
    .sort((first, second) => second.score - first.score)
    .slice(0, 8);
}
