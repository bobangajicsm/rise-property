'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Save,
  Trash2,
} from "lucide-react";
import { savePropertyTypesAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import {
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
  type PropertyTypeConfig,
  type PropertyTypeMutationInput,
  type PropertyUsage,
} from "@/types/property";

interface AdminPropertyTypesManagerProps {
  propertyTypes: PropertyTypeConfig[];
}

interface EditablePropertyType extends PropertyTypeMutationInput {
  listingCount: number;
}

function toEditablePropertyTypes(propertyTypes: PropertyTypeConfig[]): EditablePropertyType[] {
  return propertyTypes.map((propertyType) => ({
    id: propertyType.id,
    label: propertyType.label,
    usage: propertyType.usage,
    isActive: propertyType.isActive,
    sortOrder: propertyType.sortOrder,
    listingCount: propertyType.listingCount,
  }));
}

export function AdminPropertyTypesManager({
  propertyTypes,
}: AdminPropertyTypesManagerProps) {
  const router = useRouter();
  const initialRows = useMemo(
    () => toEditablePropertyTypes(propertyTypes),
    [propertyTypes],
  );
  const [rows, setRows] = useState<EditablePropertyType[]>(initialRows);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const usageCounts = Object.fromEntries(
    PROPERTY_USAGES.map((usage) => [
      usage,
      rows.filter((row) => row.usage === usage).length,
    ]),
  ) as Record<PropertyUsage, number>;
  const activeCount = rows.filter((row) => row.isActive).length;
  const hasChanges = JSON.stringify(rows) !== JSON.stringify(initialRows);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  function updateRow(
    id: string,
    updater: (current: EditablePropertyType) => EditablePropertyType,
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? updater(row) : row)),
    );
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function handleSave() {
    setFeedback("");

    const seenKeys = new Set<string>();

    for (const row of rows) {
      const label = row.label.trim();

      if (!label) {
        setFeedback("Each property type needs a label before saving.");
        return;
      }

      const key = `${row.usage}:${label.toLowerCase()}`;

      if (seenKeys.has(key)) {
        setFeedback("Property types must be unique inside each usage group.");
        return;
      }

      seenKeys.add(key);
    }

    startTransition(async () => {
      try {
        const payload = rows.map((row, index) => ({
          id: row.id,
          label: row.label,
          usage: row.usage,
          isActive: row.isActive,
          sortOrder: index,
        }));

        const savedRows = await savePropertyTypesAction(payload);
        setRows(toEditablePropertyTypes(savedRows));
        setFeedback("Property type setup updated successfully.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "Unable to update property types right now.",
        );
      }
    });
  }

  return (
    <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
            Type Structure
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-black">
            Residential, Commercial, and International
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            The platform uses fixed primary type groups. The rows below are the
            subcategories used inside Residential, Commercial, and International.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.4rem] bg-gray-50 px-4 py-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
            Active
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-black">
            {activeCount}
          </p>
        </div>
        {PROPERTY_USAGES.map((usage) => (
          <div key={usage} className="rounded-[1.4rem] bg-gray-50 px-4 py-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
              {PROPERTY_USAGE_META[usage].label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-black">
              {usageCounts[usage]}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-[1.5rem] border border-gray-100 bg-gray-50/70 p-4 md:grid-cols-[minmax(0,1.2fr)_180px_140px_auto]"
          >
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Subcategory Label
              </label>
              <input
                value={row.label}
                onChange={(event) =>
                  updateRow(row.id, (current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder={
                  row.usage === "commercial"
                    ? "Showroom"
                    : row.usage === "international"
                      ? "Overseas Listing"
                      : "Townhouse"
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Main Type
              </label>
              <select
                value={row.usage}
                onChange={(event) =>
                  updateRow(row.id, (current) => ({
                    ...current,
                    usage: event.target.value as PropertyUsage,
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
              >
                {PROPERTY_USAGES.map((usage) => (
                  <option key={usage} value={usage}>
                    {PROPERTY_USAGE_META[usage].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Status
              </label>
              <button
                type="button"
                onClick={() =>
                  updateRow(row.id, (current) => ({
                    ...current,
                    isActive: !current.isActive,
                  }))
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                  row.isActive
                    ? "border-accent/20 bg-accent/8 text-accent"
                    : "border-gray-200 bg-white text-gray-500",
                )}
              >
                <span>{row.isActive ? "Active" : "Inactive"}</span>
                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold tracking-[0.18em] uppercase">
                  {row.listingCount} live
                </span>
              </button>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={row.listingCount > 0}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  row.listingCount > 0
                    ? "Deactivate used types instead of removing them."
                    : "Remove property type"
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-gray-500">
          Residential, Commercial, and International stay fixed as the main
          type groups. Use this section to manage the subcategories under each one.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isPending ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isPending ? "Saving Subcategories" : "Save Subcategories"}
        </button>
      </div>

      {feedback ? (
        <div className="mt-4 rounded-[1.25rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {feedback}
        </div>
      ) : null}
    </section>
  );
}
