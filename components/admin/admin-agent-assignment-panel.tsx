'use client';

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeft,
  CheckSquare,
  Eye,
  LoaderCircle,
  Search,
  Square,
} from "lucide-react";
import {
  assignFilteredPropertiesToAgentAction,
  assignPropertiesToAgentAction,
  transferAgentPropertiesAction,
} from "@/app/actions";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { formatPrice } from "@/lib/property-formatting";
import { cn } from "@/lib/utils";
import {
  LISTING_TYPES,
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
  PROPERTY_VISIBILITY_META,
  PROPERTY_VISIBILITY_STATUSES,
  type AgentAssignmentFilters,
  type ManagedPropertyAgent,
  type Property,
} from "@/types/property";

interface AdminAgentAssignmentPanelProps {
  agent: ManagedPropertyAgent;
  agents: ManagedPropertyAgent[];
  properties: Property[];
}

type AssignmentConfirmDialog =
  | {
      type: "assign-filtered";
      count: number;
      filters: AgentAssignmentFilters;
    }
  | {
      type: "transfer";
      fromAgentId: string;
      fromName: string;
    };

function getPropertyAgentId(property: Property) {
  return property.agentId ?? property.agent.id ?? "";
}

function getPropertyAgentIds(property: Property) {
  return [
    property.agentId,
    property.agent.id,
    ...(property.agentIds ?? []),
    ...(property.agents ?? []).map((agent) => agent.id),
  ].filter((agentId): agentId is string => Boolean(agentId?.trim()));
}

function matchesFilters(property: Property, filters: AgentAssignmentFilters) {
  const query = filters.query?.trim().toLowerCase();

  if (query) {
    const haystack = [
      property.id,
      property.slug,
      property.title,
      property.location,
      property.area,
      property.type,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(query)) {
      return false;
    }
  }

  if (
    filters.listingType &&
    filters.listingType !== "all" &&
    property.listingType !== filters.listingType
  ) {
    return false;
  }

  if (
    filters.visibilityStatus &&
    filters.visibilityStatus !== "all" &&
    property.visibilityStatus !== filters.visibilityStatus
  ) {
    return false;
  }

  if (filters.usage && filters.usage !== "all" && property.usage !== filters.usage) {
    return false;
  }

  if (
    filters.propertyType &&
    filters.propertyType !== "all" &&
    property.type !== filters.propertyType
  ) {
    return false;
  }

  if (filters.area && filters.area !== "all" && property.area !== filters.area) {
    return false;
  }

  if (
    filters.currentAgentId &&
    filters.currentAgentId !== "all" &&
    !getPropertyAgentIds(property).includes(filters.currentAgentId)
  ) {
    return false;
  }

  return true;
}

export function AdminAgentAssignmentPanel({
  agent,
  agents,
  properties,
}: AdminAgentAssignmentPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<AgentAssignmentFilters["listingType"]>("all");
  const [visibilityStatus, setVisibilityStatus] =
    useState<AgentAssignmentFilters["visibilityStatus"]>("all");
  const [usage, setUsage] = useState<AgentAssignmentFilters["usage"]>("all");
  const [propertyType, setPropertyType] = useState("all");
  const [area, setArea] = useState("all");
  const [currentAgentId, setCurrentAgentId] = useState(agent.id);
  const [transferFromAgentId, setTransferFromAgentId] = useState("");
  const [manuallySelectedIds, setManuallySelectedIds] = useState<number[]>([]);
  const [manuallyDeselectedIds, setManuallyDeselectedIds] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<AssignmentConfirmDialog | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<AgentAssignmentFilters>(
    () => ({
      query,
      listingType,
      visibilityStatus,
      usage,
      propertyType,
      area,
      currentAgentId,
    }),
    [
      area,
      currentAgentId,
      listingType,
      propertyType,
      query,
      usage,
      visibilityStatus,
    ],
  );

  const propertyTypes = useMemo(
    () => [...new Set(properties.map((property) => property.type).filter(Boolean))].sort(),
    [properties],
  );
  const areas = useMemo(
    () => [...new Set(properties.map((property) => property.area).filter(Boolean))].sort(),
    [properties],
  );
  const agentNameById = useMemo(
    () => new Map(agents.map((entry) => [entry.id, entry.name])),
    [agents],
  );
  const filteredProperties = useMemo(
    () => properties.filter((property) => matchesFilters(property, filters)),
    [properties, filters],
  );
  const assignedPropertyIds = useMemo(
    () =>
      properties
        .filter((property) => getPropertyAgentIds(property).includes(agent.id))
        .map((property) => property.id),
    [agent.id, properties],
  );
  const manuallyDeselectedSet = useMemo(
    () => new Set(manuallyDeselectedIds),
    [manuallyDeselectedIds],
  );
  const selectedIds = useMemo(
    () => [
      ...new Set([
        ...assignedPropertyIds.filter((id) => !manuallyDeselectedSet.has(id)),
        ...manuallySelectedIds,
      ]),
    ],
    [assignedPropertyIds, manuallyDeselectedSet, manuallySelectedIds],
  );
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(
    () => filteredProperties.map((property) => property.id),
    [filteredProperties],
  );
  const assignedToAgentCount = assignedPropertyIds.length;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

  function toggleVisibleSelection() {
    const visibleIdSet = new Set(visibleIds);

    if (allVisibleSelected) {
      setManuallySelectedIds((current) =>
        current.filter((id) => !visibleIdSet.has(id)),
      );
      setManuallyDeselectedIds((current) => [...new Set([...current, ...visibleIds])]);
      return;
    }

    setManuallyDeselectedIds((current) =>
      current.filter((id) => !visibleIdSet.has(id)),
    );
    setManuallySelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  }

  function toggleProperty(id: number) {
    if (selectedSet.has(id)) {
      setManuallySelectedIds((current) => current.filter((entry) => entry !== id));
      setManuallyDeselectedIds((current) =>
        current.includes(id) ? current : [...current, id],
      );
      return;
    }

    setManuallyDeselectedIds((current) => current.filter((entry) => entry !== id));
    setManuallySelectedIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  }

  function resetSelection() {
    setManuallySelectedIds([]);
    setManuallyDeselectedIds([]);
  }

  function assignSelected() {
    if (selectedIds.length === 0) {
      setFeedback("Select at least one listing first.");
      return;
    }

    setFeedback("");

    startTransition(async () => {
      try {
        const result = await assignPropertiesToAgentAction(agent.id, selectedIds);
        resetSelection();
        setFeedback(`${result.count} listing${result.count === 1 ? "" : "s"} assigned.`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error ? error.message : "Unable to assign listings.",
        );
      }
    });
  }

  function assignFiltered() {
    if (filteredProperties.length === 0) {
      setFeedback("No listings match the current filters.");
      return;
    }

    setConfirmDialog({
      type: "assign-filtered",
      count: filteredProperties.length,
      filters,
    });
  }

  function confirmAssignmentAction() {
    if (!confirmDialog) {
      return;
    }

    const dialog = confirmDialog;
    setFeedback("");

    startTransition(async () => {
      try {
        if (dialog.type === "assign-filtered") {
          const result = await assignFilteredPropertiesToAgentAction(
            agent.id,
            dialog.filters,
          );
          resetSelection();
          setFeedback(`${result.count} filtered listing${result.count === 1 ? "" : "s"} assigned.`);
        } else {
          const result = await transferAgentPropertiesAction(dialog.fromAgentId, agent.id);
          setTransferFromAgentId("");
          resetSelection();
          setFeedback(`${result.count} listing${result.count === 1 ? "" : "s"} transferred.`);
        }

        setConfirmDialog(null);
        router.refresh();
      } catch (error) {
        setConfirmDialog(null);
        setFeedback(
          error instanceof Error ? error.message : "Unable to update listing ownership.",
        );
      }
    });
  }

  function transferFromAgent() {
    if (!transferFromAgentId) {
      setFeedback("Choose an agent to transfer from.");
      return;
    }

    const fromName = agentNameById.get(transferFromAgentId) ?? "selected agent";

    setConfirmDialog({
      type: "transfer",
      fromAgentId: transferFromAgentId,
      fromName,
    });
  }

  return (
    <>
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
            Assignment
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold text-black">
            Listing Ownership
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {assignedToAgentCount} listing{assignedToAgentCount === 1 ? "" : "s"} currently assigned to {agent.name}.
          </p>
        </div>
        <div className="rounded-[1.4rem] bg-gray-50 px-5 py-4 text-sm text-gray-600">
          <span className="font-semibold text-black">{selectedIds.length}</span> selected
          <span className="mx-2 text-gray-300">/</span>
          <span className="font-semibold text-black">{filteredProperties.length}</span> filtered
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(140px,1fr))]">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search listings"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
        <select
          value={listingType}
          onChange={(event) =>
            setListingType(event.target.value as AgentAssignmentFilters["listingType"])
          }
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Listing Types</option>
          {LISTING_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === "buy" ? "Buy" : "Rent"}
            </option>
          ))}
        </select>
        <select
          value={visibilityStatus}
          onChange={(event) =>
            setVisibilityStatus(
              event.target.value as AgentAssignmentFilters["visibilityStatus"],
            )
          }
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Visibility</option>
          {PROPERTY_VISIBILITY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PROPERTY_VISIBILITY_META[status].label}
            </option>
          ))}
        </select>
        <select
          value={usage}
          onChange={(event) =>
            setUsage(event.target.value as AgentAssignmentFilters["usage"])
          }
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Usage</option>
          {PROPERTY_USAGES.map((usageOption) => (
            <option key={usageOption} value={usageOption}>
              {PROPERTY_USAGE_META[usageOption].label}
            </option>
          ))}
        </select>
        <select
          value={propertyType}
          onChange={(event) => setPropertyType(event.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Property Types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={area}
          onChange={(event) => setArea(event.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Areas</option>
          {areas.map((areaName) => (
            <option key={areaName} value={areaName}>
              {areaName}
            </option>
          ))}
        </select>
        <select
          value={currentAgentId}
          onChange={(event) => setCurrentAgentId(event.target.value)}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="all">All Current Agents</option>
          {agents.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleVisibleSelection}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
          >
            {allVisibleSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            Visible
          </button>
          <button
            type="button"
            onClick={resetSelection}
            className="rounded-full border border-gray-200 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={isPending || selectedIds.length === 0}
            onClick={assignSelected}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Assign Selected
          </button>
          <button
            type="button"
            disabled={isPending || filteredProperties.length === 0}
            onClick={assignFiltered}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-black uppercase transition-all hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Assign All Filtered
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <select
            value={transferFromAgentId}
            onChange={(event) => setTransferFromAgentId(event.target.value)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          >
            <option value="">Transfer all from agent</option>
            {agents
              .filter((entry) => entry.id !== agent.id)
              .map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name} ({entry.listingCount})
                </option>
              ))}
          </select>
          <button
            type="button"
            disabled={isPending || !transferFromAgentId}
            onClick={transferFromAgent}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </button>
        </div>
      </div>

      {feedback ? (
        <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
          {feedback}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-gray-100">
        <div className="hidden grid-cols-[56px_minmax(0,1.4fr)_150px_150px_120px_160px] bg-gray-50 px-4 py-3 text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase xl:grid">
          <span />
          <span>Listing</span>
          <span>Type</span>
          <span>Agent</span>
          <span>Price</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredProperties.slice(0, 100).map((property) => {
            const propertyAgentId = getPropertyAgentId(property);
            const isSelected = selectedSet.has(property.id);

            return (
              <div
                key={property.id}
                className={cn(
                  "grid gap-3 bg-white p-4 xl:grid-cols-[56px_minmax(0,1.4fr)_150px_150px_120px_160px] xl:items-center",
                  isSelected && "bg-accent/5",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleProperty(property.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 text-gray-500 transition-colors hover:border-black hover:text-black"
                  aria-label={isSelected ? "Unselect listing" : "Select listing"}
                >
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-accent" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-black">
                    #{property.id} {property.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {property.location}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 xl:hidden">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-500 uppercase">
                      {property.listingType} / {property.type}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-500 uppercase">
                      {agentNameById.get(propertyAgentId) ?? property.agent.name}
                    </span>
                  </div>
                </div>

                <div className="hidden xl:block">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-gray-600 uppercase">
                    {property.listingType} / {property.type}
                  </span>
                </div>

                <p className="hidden truncate text-sm text-gray-600 xl:block">
                  {agentNameById.get(propertyAgentId) ?? property.agent.name}
                </p>

                <p className="text-sm font-semibold text-black xl:block">
                  QAR {formatPrice(property.price)}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/listings/${property.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white px-6 py-12 text-center">
            <p className="font-semibold text-black">No listings match these filters</p>
          </div>
        ) : null}
      </div>

      {filteredProperties.length > 100 ? (
        <p className="mt-3 text-sm text-gray-500">
          Showing first 100 matching listings. &quot;Assign All Filtered&quot; still applies to every matching listing server-side.
        </p>
      ) : null}
      </section>
      <AdminConfirmDialog
        open={confirmDialog !== null}
        variant={confirmDialog?.type === "transfer" ? "accent" : "primary"}
        title={
          confirmDialog?.type === "transfer"
            ? "Transfer Listings"
            : "Assign Filtered Listings"
        }
        description={
          confirmDialog?.type === "transfer"
            ? `Move all listings currently assigned to ${confirmDialog.fromName} over to ${agent.name}.`
            : confirmDialog
              ? `Assign ${confirmDialog.count} matching listing${confirmDialog.count === 1 ? "" : "s"} to ${agent.name}.`
              : ""
        }
        confirmLabel={confirmDialog?.type === "transfer" ? "Transfer" : "Assign"}
        isPending={isPending}
        onCancel={() => setConfirmDialog(null)}
        onConfirm={confirmAssignmentAction}
      />
    </>
  );
}
