export function slugify(value: string) {
  return value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export function createUniqueSlug(value: string, suffix?: string | number) {
  const base = slugify(value);
  return suffix === undefined || suffix === null || suffix === "" ? base : `${base}-${suffix}`;
}

export async function uniqueSlug(value: string, exists: (candidate: string) => Promise<boolean>) {
  const base = slugify(value);
  if (!(await exists(base))) return base;
  for (let index = 2; index < 10000; index += 1) {
    const candidate = `${base}-${index}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}
