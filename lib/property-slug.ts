export function slugifyPropertyValue(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPropertySlug(title: string, id?: number | null) {
  const base = slugifyPropertyValue(title);

  if (typeof id === "number" && Number.isFinite(id)) {
    return `${base}-${id}`;
  }

  return base;
}
