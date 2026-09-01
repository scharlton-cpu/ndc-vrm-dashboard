import { MapPin } from "lucide-react";

export function MapPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-[repeating-linear-gradient(45deg,var(--muted)_0,var(--muted)_1px,transparent_0,transparent_12px)] text-center">
      <MapPin className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Map integration point — connect a geodata/mapping provider to render boundaries and pins here.
      </p>
    </div>
  );
}
