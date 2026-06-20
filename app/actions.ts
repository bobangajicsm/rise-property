'use server';

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearAdminSession,
  createAdminSession,
  isAdminAuthenticated,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import {
  deletePropertyById,
  getAllProperties,
  upsertProperty,
} from "@/lib/properties-store";
import { saveFeaturedAreaConfigurations } from "@/lib/featured-areas-store";
import { savePropertyTypeConfigurations } from "@/lib/property-types-store";
import type {
  FeaturedAreaMutationInput,
  Property,
  PropertyMutationInput,
  PropertyTypeMutationInput,
} from "@/types/property";

async function assertAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized");
  }
}

function revalidatePropertyPaths(oldSlug?: string | null, newSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/buy");
  revalidatePath("/rent");
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/new");
  revalidatePath("/search");
  revalidatePath("/search/[slug]", "page");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/properties/${oldSlug}`);
  }

  if (newSlug) {
    revalidatePath(`/properties/${newSlug}`);
  }
}

function revalidateFeaturedAreaPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/locations");
}

function revalidatePropertyTypePaths() {
  revalidatePath("/");
  revalidatePath("/buy");
  revalidatePath("/rent");
  revalidatePath("/search");
  revalidatePath("/search/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/new");
}

export async function getData() {
  return getAllProperties({ includeDrafts: true });
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateAdminCredentials(email, password)) {
    redirect("/admin/login?error=invalid");
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function savePropertyAction(input: PropertyMutationInput) {
  await assertAdmin();

  const existingPropertiesWithDrafts = await getAllProperties({ includeDrafts: true });
  const previousProperty =
    typeof input.id === "number"
      ? existingPropertiesWithDrafts.find((property: Property) => property.id === input.id)
      : null;

  const property = await upsertProperty(input);
  revalidatePropertyPaths(previousProperty?.slug, property.slug);

  return property;
}

export async function deletePropertyAction(id: number) {
  await assertAdmin();

  const deletedProperty = await deletePropertyById(id);
  revalidatePropertyPaths(deletedProperty?.slug, null);

  return deletedProperty;
}

export async function saveFeaturedAreasAction(
  entries: FeaturedAreaMutationInput[],
) {
  await assertAdmin();

  const areas = await saveFeaturedAreaConfigurations(entries);
  revalidateFeaturedAreaPaths();

  return areas;
}

export async function savePropertyTypesAction(
  entries: PropertyTypeMutationInput[],
) {
  await assertAdmin();

  const propertyTypes = await savePropertyTypeConfigurations(entries);
  revalidatePropertyTypePaths();

  return propertyTypes;
}
