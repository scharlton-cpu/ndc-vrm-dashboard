"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bookmark, Users, Save, Trash2, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveQueryAction, saveSegmentAction, deleteSavedQueryAction } from "@/lib/actions/query-centre";
import { QUERY_CATEGORIES, type QueryDefinition } from "@/lib/query-centre/fields";

type SavedQuery = { id: string; name: string; category: string; filterJson: unknown };
type SavedSegment = { id: string; name: string; description: string | null; voterCount: number; kind: string };

export function SavedPanel({
  savedQueries,
  savedSegments,
  currentDef,
  onLoad,
}: {
  savedQueries: SavedQuery[];
  savedSegments: SavedSegment[];
  currentDef: QueryDefinition;
  onLoad: (def: QueryDefinition) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveQueryOpen, setSaveQueryOpen] = useState(false);
  const [saveSegmentOpen, setSaveSegmentOpen] = useState(false);
  const [qName, setQName] = useState("");
  const [qCategory, setQCategory] = useState<string>(QUERY_CATEGORIES[0]);
  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sKind, setSKind] = useState("GEOGRAPHIC");

  function handleSaveQuery() {
    if (!qName.trim()) return;
    startTransition(async () => {
      await saveQueryAction(qName.trim(), qCategory, currentDef);
      toast.success("Query saved");
      setSaveQueryOpen(false);
      setQName("");
      router.refresh();
    });
  }

  function handleSaveSegment() {
    if (!sName.trim()) return;
    startTransition(async () => {
      const seg = await saveSegmentAction(sName.trim(), sDesc.trim(), sKind, currentDef);
      toast.success(`Segment saved — ${seg.voterCount.toLocaleString()} voters`);
      setSaveSegmentOpen(false);
      setSName("");
      setSDesc("");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSavedQueryAction(id);
      toast.success("Query deleted");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Dialog open={saveQueryOpen} onOpenChange={setSaveQueryOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Save className="size-3.5" /> Save Query</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Query</DialogTitle>
              <DialogDescription>Save this filter combination for quick reuse.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Name</Label>
                <Input value={qName} onChange={(e) => setQName(e.target.value)} placeholder="e.g. Uncontacted, low-interaction voters" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Category</Label>
                <Select value={qCategory} onValueChange={setQCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUERY_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveQuery} disabled={pending || !qName.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={saveSegmentOpen} onOpenChange={setSaveSegmentOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Users className="size-3.5" /> Save as Segment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Segment</DialogTitle>
              <DialogDescription>Operational voter groupings — geographic, canvassing, consent, or contact-completeness. Not for belief-based targeting.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Segment Name</Label>
                <Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. St. George Uncanvassed Households" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Kind</Label>
                <Select value={sKind} onValueChange={setSKind}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GEOGRAPHIC">Geographic</SelectItem>
                    <SelectItem value="CANVASSING_LIST">Canvassing List</SelectItem>
                    <SelectItem value="CONSENT_STATE">Consent State</SelectItem>
                    <SelectItem value="CONTACT_COMPLETENESS">Contact Completeness</SelectItem>
                    <SelectItem value="ISSUE_GROUP">Issue Group</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSegment} disabled={pending || !sName.trim()}>Save Segment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Bookmark className="size-3.5" /> Saved Queries
        </p>
        {savedQueries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved queries yet.</p>
        ) : (
          <ul className="space-y-1">
            {savedQueries.map((q) => (
              <li key={q.id} className="group flex items-center gap-1 rounded-md border bg-card px-2 py-1.5 text-xs">
                <button
                  className="flex flex-1 items-center gap-1.5 truncate text-left hover:text-primary"
                  onClick={() => onLoad(q.filterJson as QueryDefinition)}
                >
                  <FolderOpen className="size-3.5 shrink-0" />
                  <span className="truncate">{q.name}</span>
                </button>
                <button
                  className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                  onClick={() => handleDelete(q.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Users className="size-3.5" /> Saved Segments
        </p>
        {savedSegments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved segments yet.</p>
        ) : (
          <ul className="space-y-1">
            {savedSegments.map((s) => (
              <li key={s.id} className="rounded-md border bg-card px-2 py-1.5 text-xs">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-muted-foreground">{s.voterCount.toLocaleString()} voters · {s.kind.replaceAll("_", " ")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
