'use client';

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRoundCheck,
} from "lucide-react";
import {
  deleteAgentAction,
  transferAgentPropertiesAction,
} from "@/app/actions";
import { AdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { cn } from "@/lib/utils";
import type { ManagedPropertyAgent } from "@/types/property";

interface AdminAgentsTableProps {
  agents: ManagedPropertyAgent[];
}

function getTransferCandidates(
  agents: ManagedPropertyAgent[],
  agentId: string,
) {
  return agents
    .filter((agent) => agent.id !== agentId && agent.isActive)
    .sort((first, second) => {
      if (first.isDefault !== second.isDefault) {
        return first.isDefault ? -1 : 1;
      }

      return first.sortOrder - second.sortOrder || first.name.localeCompare(second.name);
    });
}

export function AdminAgentsTable({ agents }: AdminAgentsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteTarget, setDeleteTarget] = useState<ManagedPropertyAgent | null>(null);
  const [transferTargetAgentId, setTransferTargetAgentId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? agent.isActive : !agent.isActive);
      const matchesSearch =
        !query ||
        [agent.name, agent.role, agent.email, agent.phone, agent.slug].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [agents, search, statusFilter]);

  const stats = useMemo(() => {
    const activeCount = agents.filter((agent) => agent.isActive).length;
    const inactiveCount = agents.length - activeCount;
    const listingCount = agents.reduce((count, agent) => count + agent.listingCount, 0);

    return [
      { label: "Agents", value: String(agents.length) },
      { label: "Active", value: String(activeCount) },
      { label: "Inactive", value: String(inactiveCount) },
      { label: "Assigned Listings", value: String(listingCount) },
    ];
  }, [agents]);

  const transferCandidates = useMemo(
    () => (deleteTarget ? getTransferCandidates(agents, deleteTarget.id) : []),
    [agents, deleteTarget],
  );

  function requestDelete(agent: ManagedPropertyAgent) {
    const candidates = getTransferCandidates(agents, agent.id);

    setTransferTargetAgentId(candidates[0]?.id ?? "");
    setDeleteTarget(agent);
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const agent = deleteTarget;
    const shouldTransferListings = agent.listingCount > 0;
    const transferTarget = transferCandidates.find(
      (candidate) => candidate.id === transferTargetAgentId,
    );

    if (shouldTransferListings && !transferTarget) {
      setFeedback("Choose an agent to receive the listings first.");
      return;
    }

    setFeedback("");

    startTransition(async () => {
      try {
        const transferResult =
          shouldTransferListings && transferTarget
            ? await transferAgentPropertiesAction(agent.id, transferTarget.id)
            : null;

        await deleteAgentAction(agent.id);
        setDeleteTarget(null);
        setTransferTargetAgentId("");
        setFeedback(
          transferResult && transferTarget
            ? `${transferResult.count} listing${transferResult.count === 1 ? "" : "s"} transferred to ${transferTarget.name}. ${agent.name} was deleted.`
            : `${agent.name} was deleted.`,
        );
        router.refresh();
      } catch (error) {
        setDeleteTarget(null);
        setTransferTargetAgentId("");
        setFeedback(
          error instanceof Error ? error.message : "Unable to update agent.",
        );
      }
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.7rem] border border-black/5 bg-white px-5 py-5 shadow-sm"
            >
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                {stat.label}
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-black">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

      <div className="rounded-[2rem] border border-black/5 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agents"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | "active" | "inactive")
              }
              className="rounded-full border border-gray-200 bg-white px-4 py-3 text-[10px] font-bold tracking-[0.18em] text-gray-600 uppercase outline-none transition-colors focus:border-accent"
            >
              <option value="all">All Agents</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="rounded-full bg-gray-100 px-4 py-3 text-center text-[10px] font-bold tracking-[0.22em] text-gray-500 uppercase">
              {filteredAgents.length} Results
            </div>
            <Link
              href="/admin/agents/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Agent
            </Link>
          </div>
        </div>

        {feedback ? (
          <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
            {feedback}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filteredAgents.map((agent) => (
            <article
              key={agent.id}
              className="rounded-[1.7rem] border border-gray-100 bg-gray-50/70 p-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="h-20 w-20 rounded-[1.25rem] object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-bold text-black">
                      {agent.name}
                    </h3>
                    {agent.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
                        <UserRoundCheck className="h-3.5 w-3.5" />
                        Default
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase",
                        agent.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-200 text-gray-500",
                      )}
                    >
                      {agent.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-gray-600">
                    {agent.role}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-gray-500 sm:grid-cols-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span className="truncate">{agent.phone}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 border-t border-gray-200/70 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                    {agent.listingCount} Listings
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-gray-500 uppercase">
                    {agent.capabilities.listingTypes.join(" / ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/agents/${agent.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={isPending || agent.isDefault}
                    onClick={() => requestDelete(agent)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title={agent.isDefault ? "Default agent cannot be deleted." : "Delete agent"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredAgents.length === 0 ? (
          <div className="mt-6 rounded-[1.6rem] border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-black">No agents found</p>
            <p className="mt-2 text-sm text-gray-500">
              Adjust the search or create a new consultant profile.
            </p>
          </div>
        ) : null}
      </div>
      </div>
      <AdminConfirmDialog
        open={deleteTarget !== null}
        variant="danger"
        title={
          deleteTarget?.listingCount
            ? "Transfer Listings Before Delete"
            : "Delete Agent"
        }
        description={
          deleteTarget
            ? deleteTarget.listingCount > 0
              ? `${deleteTarget.name} has ${deleteTarget.listingCount} assigned listing${deleteTarget.listingCount === 1 ? "" : "s"}. Choose who should receive those listings before deleting this agent.`
              : `Delete ${deleteTarget.name} from the agent directory. This action cannot be undone.`
            : ""
        }
        confirmLabel={deleteTarget?.listingCount ? "Transfer & Delete" : "Delete"}
        confirmDisabled={Boolean(deleteTarget?.listingCount) && !transferTargetAgentId}
        isPending={isPending}
        onCancel={() => {
          setDeleteTarget(null);
          setTransferTargetAgentId("");
        }}
        onConfirm={confirmDelete}
      >
        {deleteTarget?.listingCount ? (
          <div className="rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
            <label className="block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
              Transfer Listings To
            </label>
            {transferCandidates.length > 0 ? (
              <select
                value={transferTargetAgentId}
                onChange={(event) => setTransferTargetAgentId(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-black outline-none transition-colors focus:border-accent"
              >
                {transferCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                    {candidate.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-red-600">
                Create or activate another agent before deleting this profile.
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Listings keep their public pages, images and details. Only ownership changes.
            </p>
          </div>
        ) : null}
      </AdminConfirmDialog>
    </>
  );
}
