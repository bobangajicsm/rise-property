'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  LoaderCircle,
  Save,
  Upload,
  UserRoundCheck,
} from "lucide-react";
import { saveAgentAction } from "@/app/actions";
import { AdminAgentAssignmentPanel } from "@/components/admin/admin-agent-assignment-panel";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { DEFAULT_AGENT_CAPABILITIES } from "@/data/agents";
import { cn } from "@/lib/utils";
import {
  LISTING_TYPE_META,
  LISTING_TYPES,
  PROPERTY_USAGE_META,
  PROPERTY_USAGES,
  type ListingType,
  type ManagedPropertyAgent,
  type Property,
  type PropertyAgentCapabilities,
  type PropertyAgentMutationInput,
  type PropertyUsage,
} from "@/types/property";

interface AdminAgentEditorProps {
  agent?: ManagedPropertyAgent;
  agents: ManagedPropertyAgent[];
  properties: Property[];
}

interface AgentFormState {
  id?: string;
  name: string;
  role: string;
  image: string;
  imageKey?: string;
  phone: string;
  email: string;
  whatsapp: string;
  bio: string;
  languagesText: string;
  specialtiesText: string;
  areas: string[];
  capabilities: PropertyAgentCapabilities;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: string;
  loginUsername: string;
  loginPassword: string;
  canLogin: boolean;
}

interface UploadPayload {
  success?: boolean;
  key?: string;
  url?: string;
  error?: string;
}

interface PendingImageCrop {
  file: File;
  previewUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

const avatarCanvasSize = 512;

function linesToText(lines: string[]) {
  return lines.join("\n");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function createEmptyFormState(agents: ManagedPropertyAgent[]): AgentFormState {
  return {
    name: "",
    role: "Property Consultant",
    image: "",
    phone: "+974 3111 6240",
    email: "maha@rise-property.com",
    whatsapp: "https://wa.me/97431116240",
    bio: "",
    languagesText: "",
    specialtiesText: "",
    areas: [],
    capabilities: DEFAULT_AGENT_CAPABILITIES,
    isActive: true,
    isDefault: agents.length === 0,
    sortOrder: String(agents.length),
    loginUsername: "",
    loginPassword: "",
    canLogin: false,
  };
}

function agentToFormState(agent: ManagedPropertyAgent): AgentFormState {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    image: agent.image,
    imageKey: agent.imageKey,
    phone: agent.phone,
    email: agent.email,
    whatsapp: agent.whatsapp,
    bio: agent.bio,
    languagesText: linesToText(agent.languages),
    specialtiesText: linesToText(agent.specialties),
    areas: agent.areas,
    capabilities: agent.capabilities,
    isActive: agent.isActive,
    isDefault: agent.isDefault,
    sortOrder: String(agent.sortOrder),
    loginUsername: agent.loginUsername ?? "",
    loginPassword: "",
    canLogin: agent.canLogin,
  };
}

function formStateToPayload(form: AgentFormState): PropertyAgentMutationInput {
  return {
    id: form.id,
    name: form.name.trim(),
    role: form.role.trim(),
    image: form.image.trim(),
    imageKey: form.imageKey,
    phone: form.phone.trim(),
    email: form.email.trim(),
    whatsapp: form.whatsapp.trim(),
    bio: form.bio.trim(),
    languages: textToLines(form.languagesText),
    specialties: textToLines(form.specialtiesText),
    areas: form.areas,
    capabilities: form.capabilities,
    isActive: form.isActive,
    isDefault: form.isDefault,
    sortOrder: Number(form.sortOrder),
    loginUsername: form.loginUsername.trim(),
    loginPassword: form.loginPassword.trim() || undefined,
    canLogin: form.canLogin,
  };
}

function getUniqueAreas(properties: Property[]) {
  return [...new Set(properties.map((property) => property.area).filter(Boolean))].sort();
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image preview."));
    image.src = url;
  });
}

async function drawCroppedImage({
  canvas,
  imageUrl,
  zoom,
  offsetX,
  offsetY,
}: {
  canvas: HTMLCanvasElement;
  imageUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
}) {
  const image = await loadImage(imageUrl);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare image crop.");
  }

  const size = avatarCanvasSize;
  const baseScale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const scale = baseScale * zoom;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (drawWidth - size) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - size) / 2);
  const drawX = (size - drawWidth) / 2 + (offsetX / 100) * maxOffsetX;
  const drawY = (size - drawHeight) / 2 + (offsetY / 100) * maxOffsetY;

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#f3f4f6";
  context.fillRect(0, 0, size, size);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

async function createCroppedAvatarFile(crop: PendingImageCrop) {
  const canvas = document.createElement("canvas");
  canvas.width = avatarCanvasSize;
  canvas.height = avatarCanvasSize;

  await drawCroppedImage({
    canvas,
    imageUrl: crop.previewUrl,
    zoom: crop.zoom,
    offsetX: crop.offsetX,
    offsetY: crop.offsetY,
  });

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to export cropped image."));
          return;
        }

        const baseName = crop.file.name.replace(/\.[^.]+$/, "") || "agent";
        resolve(new File([blob], `${baseName}.webp`, { type: "image/webp" }));
      },
      "image/webp",
      0.9,
    );
  });
}

export function AdminAgentEditor({
  agent,
  agents,
  properties,
}: AdminAgentEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropObjectUrlRef = useRef<string | null>(null);
  const initialFormState = useMemo(
    () => (agent ? agentToFormState(agent) : createEmptyFormState(agents)),
    [agent, agents],
  );
  const [formState, setFormState] = useState<AgentFormState>(initialFormState);
  const [feedback, setFeedback] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingCrop, setPendingCrop] = useState<PendingImageCrop | null>(null);
  const [isPending, startTransition] = useTransition();
  const areaOptions = useMemo(() => getUniqueAreas(properties), [properties]);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(initialFormState);
  const canSubmit =
    !isPending && !isUploading && !pendingCrop && (agent ? isDirty : true);

  useEffect(() => {
    if (!pendingCrop || !cropCanvasRef.current) {
      return;
    }

    let isCancelled = false;

    drawCroppedImage({
      canvas: cropCanvasRef.current,
      imageUrl: pendingCrop.previewUrl,
      zoom: pendingCrop.zoom,
      offsetX: pendingCrop.offsetX,
      offsetY: pendingCrop.offsetY,
    }).catch((error) => {
      if (!isCancelled) {
        setUploadError(
          error instanceof Error ? error.message : "Unable to preview image crop.",
        );
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [pendingCrop]);

  useEffect(() => {
    return () => {
      if (cropObjectUrlRef.current) {
        URL.revokeObjectURL(cropObjectUrlRef.current);
      }
    };
  }, []);

  function updateCapabilities(
    updater: (current: PropertyAgentCapabilities) => PropertyAgentCapabilities,
  ) {
    setFormState((current) => ({
      ...current,
      capabilities: updater(current.capabilities),
    }));
  }

  function toggleListingType(value: ListingType) {
    updateCapabilities((current) => {
      const isSelected = current.listingTypes.includes(value);

      if (isSelected && current.listingTypes.length === 1) {
        return current;
      }

      return {
        ...current,
        listingTypes: isSelected
          ? current.listingTypes.filter((entry) => entry !== value)
          : [...current.listingTypes, value],
      };
    });
  }

  function toggleUsage(value: PropertyUsage) {
    updateCapabilities((current) => {
      const isSelected = current.usages.includes(value);

      if (isSelected && current.usages.length === 1) {
        return current;
      }

      return {
        ...current,
        usages: isSelected
          ? current.usages.filter((entry) => entry !== value)
          : [...current.usages, value],
      };
    });
  }

  function toggleArea(value: string) {
    setFormState((current) => {
      const isSelected = current.areas.includes(value);
      return {
        ...current,
        areas: isSelected
          ? current.areas.filter((entry) => entry !== value)
          : [...current.areas, value],
      };
    });
  }

  function clearPendingCrop() {
    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current);
      cropObjectUrlRef.current = null;
    }

    setPendingCrop(null);
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Only image uploads are supported.");
      return;
    }

    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    cropObjectUrlRef.current = previewUrl;
    setPendingCrop({
      file,
      previewUrl,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    });

    if (event.target) {
      event.target.value = "";
    }
  }

  async function uploadCroppedImage() {
    if (!pendingCrop) {
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const croppedFile = await createCroppedAvatarFile(pendingCrop);
      const formData = new FormData();
      formData.append("file", croppedFile);

      const response = await fetch("/api/admin/upload-agent-image", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as UploadPayload;

      if (!response.ok || !payload.success || !payload.url) {
        throw new Error(payload.error || "Upload failed.");
      }

      setFormState((current) => ({
        ...current,
        image: payload.url ?? current.image,
        imageKey: payload.key ?? current.imageKey,
      }));
      clearPendingCrop();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setUploadError("");

    if (pendingCrop) {
      setFeedback("Upload or cancel the pending image crop before saving.");
      return;
    }

    if (!formState.name.trim()) {
      setFeedback("Agent name is required.");
      return;
    }

    if (!formState.email.trim()) {
      setFeedback("Agent email is required.");
      return;
    }

    if (!formState.phone.trim()) {
      setFeedback("Agent phone is required.");
      return;
    }

    if (formState.canLogin && !formState.loginUsername.trim()) {
      setFeedback("Agent login username is required.");
      return;
    }

    if (formState.canLogin && !agent?.hasPassword && !formState.loginPassword.trim()) {
      setFeedback("Set an agent password before enabling login access.");
      return;
    }

    startTransition(async () => {
      try {
        const savedAgent = await saveAgentAction(formStateToPayload(formState));
        setFeedback("Agent saved.");
        router.push(`/admin/agents/${savedAgent.id}`);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save agent.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-6">
          {feedback ? (
            <div className="rounded-[1.5rem] border border-accent/20 bg-accent/5 px-5 py-4 text-sm text-gray-600">
              {feedback}
            </div>
          ) : null}

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                Profile
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-black">
                Agent Details
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
              <div>
                <div className="overflow-hidden rounded-[1.6rem] border border-gray-100 bg-gray-50">
                  {formState.image ? (
                    <img
                      src={formState.image}
                      alt={formState.name || "Agent"}
                      className="aspect-square w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-gray-400">
                      <ImagePlus className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-4 py-3 text-[10px] font-bold tracking-[0.2em] text-gray-600 uppercase transition-all hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                  <Upload className="h-4 w-4" />
                  )}
                  Choose Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {uploadError ? (
                  <p className="mt-2 text-xs text-red-600">{uploadError}</p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Name
                  </label>
                  <input
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Agent name"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Role
                  </label>
                  <input
                    value={formState.role}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                    placeholder="Property Consultant"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="agent@rise-property.com"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Phone
                  </label>
                  <input
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+974 0000 0000"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    WhatsApp URL
                  </label>
                  <input
                    value={formState.whatsapp}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        whatsapp: event.target.value,
                      }))
                    }
                    placeholder="https://wa.me/974..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Image URL
                  </label>
                  <input
                    value={formState.image}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        image: event.target.value,
                        imageKey: undefined,
                      }))
                    }
                    placeholder="/team/agent.jpg"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
                {pendingCrop ? (
                  <div className="md:col-span-2 rounded-[1.6rem] border border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                      <canvas
                        ref={cropCanvasRef}
                        width={avatarCanvasSize}
                        height={avatarCanvasSize}
                        className="aspect-square w-full rounded-[1.25rem] bg-white object-cover shadow-sm"
                      />
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                            Zoom
                          </label>
                          <input
                            type="range"
                            min="0.65"
                            max="2.5"
                            step="0.05"
                            value={pendingCrop.zoom}
                            onChange={(event) =>
                              setPendingCrop((current) =>
                                current
                                  ? {
                                      ...current,
                                      zoom: Number(event.target.value),
                                    }
                                  : current,
                              )
                            }
                            className="w-full accent-accent"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                            Horizontal
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            step="1"
                            value={pendingCrop.offsetX}
                            onChange={(event) =>
                              setPendingCrop((current) =>
                                current
                                  ? {
                                      ...current,
                                      offsetX: Number(event.target.value),
                                    }
                                  : current,
                              )
                            }
                            className="w-full accent-accent"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                            Vertical
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            step="1"
                            value={pendingCrop.offsetY}
                            onChange={(event) =>
                              setPendingCrop((current) =>
                                current
                                  ? {
                                      ...current,
                                      offsetY: Number(event.target.value),
                                    }
                                  : current,
                              )
                            }
                            className="w-full accent-accent"
                          />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={uploadCroppedImage}
                            disabled={isUploading}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-white uppercase transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isUploading ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            Upload Crop
                          </button>
                          <button
                            type="button"
                            onClick={clearPendingCrop}
                            disabled={isUploading}
                            className="rounded-full border border-gray-200 bg-white px-5 py-3 text-[10px] font-bold tracking-[0.22em] text-gray-600 uppercase transition-all hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Bio
                  </label>
                  <textarea
                    value={formState.bio}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        bio: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Short consultant bio"
                    className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                Capabilities
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-black">
                Coverage & Routing
              </h3>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div>
                <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Listing Types
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {LISTING_TYPES.map((listingType) => {
                    const isSelected = formState.capabilities.listingTypes.includes(listingType);

                    return (
                      <button
                        key={listingType}
                        type="button"
                        onClick={() => toggleListingType(listingType)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                          isSelected
                            ? "border-accent bg-accent/8 text-accent"
                            : "border-gray-200 bg-gray-50 text-gray-500",
                        )}
                      >
                        {LISTING_TYPE_META[listingType].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                  Usage Types
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {PROPERTY_USAGES.map((usage) => {
                    const isSelected = formState.capabilities.usages.includes(usage);

                    return (
                      <button
                        key={usage}
                        type="button"
                        onClick={() => toggleUsage(usage)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all",
                          isSelected
                            ? "border-accent bg-accent/8 text-accent"
                            : "border-gray-200 bg-gray-50 text-gray-500",
                        )}
                      >
                        {PROPERTY_USAGE_META[usage].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <ToggleSwitch
                  label="Lead Routing"
                  description="Allow forms and CRM context to route leads to this agent."
                  checked={formState.capabilities.leadRouting}
                  onCheckedChange={(checked) =>
                    updateCapabilities((current) => ({
                      ...current,
                      leadRouting: checked,
                    }))
                  }
                  onLabel="Enabled"
                  offLabel="Disabled"
                />
                <ToggleSwitch
                  label="Show on Website"
                  description="Allow this profile to be displayed on public listing pages."
                  checked={formState.capabilities.showOnWebsite}
                  onCheckedChange={(checked) =>
                    updateCapabilities((current) => ({
                      ...current,
                      showOnWebsite: checked,
                    }))
                  }
                  onLabel="Visible"
                  offLabel="Hidden"
                />
              </div>

              <div className="space-y-3">
                <ToggleSwitch
                  label="WhatsApp"
                  description="Enable WhatsApp contact actions for this agent."
                  checked={formState.capabilities.canReceiveWhatsApp}
                  onCheckedChange={(checked) =>
                    updateCapabilities((current) => ({
                      ...current,
                      canReceiveWhatsApp: checked,
                    }))
                  }
                  onLabel="Enabled"
                  offLabel="Disabled"
                />
                <ToggleSwitch
                  label="Email"
                  description="Enable email lead context for this agent."
                  checked={formState.capabilities.canReceiveEmail}
                  onCheckedChange={(checked) =>
                    updateCapabilities((current) => ({
                      ...current,
                      canReceiveEmail: checked,
                    }))
                  }
                  onLabel="Enabled"
                  offLabel="Disabled"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                Login
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-black">
                Agent Listing Access
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Create a username and password so this agent can access only their assigned listings.
              </p>
            </div>

            <div className="space-y-4">
              <ToggleSwitch
                label="Agent Login Access"
                description="When enabled, this agent can sign in from the admin login screen and see assigned listings only."
                checked={formState.canLogin}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    canLogin: checked,
                  }))
                }
                onLabel="Enabled"
                offLabel="Disabled"
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    Username
                  </label>
                  <input
                    value={formState.loginUsername}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        loginUsername: event.target.value,
                      }))
                    }
                    placeholder="agent.username"
                    autoComplete="off"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                    {agent?.hasPassword ? "New Password" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={formState.loginPassword}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        loginPassword: event.target.value,
                      }))
                    }
                    placeholder={agent?.hasPassword ? "Leave blank to keep current" : "Set password"}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                  />
                </div>
              </div>

              {agent?.hasPassword ? (
                <p className="text-xs leading-relaxed text-gray-500">
                  A password is already set. Fill New Password only if you want to replace it.
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-[0.24em] text-gray-400 uppercase">
                Metadata
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-black">
                Languages, Specialties, Areas
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                  Languages
                </label>
                <textarea
                  value={formState.languagesText}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      languagesText: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="English&#10;Arabic"
                  className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                  Specialties
                </label>
                <textarea
                  value={formState.specialtiesText}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      specialtiesText: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Luxury rentals&#10;Investment sales"
                  className="w-full rounded-[1.5rem] border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Area Coverage
              </p>
              <div className="flex flex-wrap gap-2">
                {areaOptions.map((area) => {
                  const isSelected = formState.areas.includes(area);

                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all",
                        isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-gray-200 bg-gray-50 text-gray-500 hover:border-black hover:text-black",
                      )}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-4">
              <img
                src={formState.image || "/team/ousama.jpeg"}
                alt={formState.name || "Agent preview"}
                className="h-16 w-16 rounded-[1.25rem] object-cover object-top"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-black">
                  {formState.name || "New Agent"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {formState.role || "Property Consultant"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <ToggleSwitch
                label="Status"
                description="Inactive agents stay in historical listings but are hidden from new assignment lists."
                checked={formState.isActive}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    isActive: checked,
                  }))
                }
                onLabel="Active"
                offLabel="Inactive"
              />
              <ToggleSwitch
                label="Default Agent"
                description="Used when old records need a safe fallback assignment."
                checked={formState.isDefault}
                onCheckedChange={(checked) =>
                  setFormState((current) => ({
                    ...current,
                    isDefault: checked,
                    isActive: checked ? true : current.isActive,
                  }))
                }
                onLabel="Default"
                offLabel="Standard"
              />
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-[0.22em] text-gray-400 uppercase">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formState.sortOrder}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      sortOrder: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[10px] font-bold tracking-[0.22em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50",
                canSubmit ? "bg-black text-white hover:bg-accent" : "bg-gray-200 text-gray-500",
              )}
            >
              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : formState.isDefault ? (
                <UserRoundCheck className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {agent ? "Save Agent" : "Create Agent"}
            </button>
          </section>
        </aside>
      </form>

      {agent ? (
        <AdminAgentAssignmentPanel
          agent={agent}
          agents={agents}
          properties={properties}
        />
      ) : null}
    </div>
  );
}
