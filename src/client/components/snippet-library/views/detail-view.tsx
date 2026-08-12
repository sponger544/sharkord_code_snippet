import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";
import { langColor, formatDate } from "../utils/helpers";
import { renderMarkdown } from "../utils/markdown-renderer";
import { ChannelSelector } from "../ui/channel-selector";

export interface SnippetDetail {
  id: string;
  title: string;
  language: string;
  description: string;
  folderId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface ChannelInfo {
  id: number;
  name: string;
}

interface DetailViewProps {
  theme: Theme;
  selected: SnippetDetail;
  channels: ChannelInfo[];
  shareChannelId: number | null;
  copyToast: boolean;
  sharing: boolean;
  onBack: () => void;
  onCopy: () => void;
  onDownloadMd: () => void;
  onOpenMove: () => void;
  onShareChannelSelect: (id: number) => void;
  onShare: () => void;
  onOpenHistory: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DetailView = memo(({
  theme, selected, channels, shareChannelId, copyToast, sharing,
  onBack, onCopy, onDownloadMd, onOpenMove, onShareChannelSelect, onShare, onOpenHistory, onEdit, onDelete,
}: DetailViewProps) => {
  const rendered = renderMarkdown(selected.content, theme);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
      {/* Toolbar */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0, flexWrap: "wrap" }}>
        <Button onClick={onBack} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>← Back</Button>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1, minWidth: "150px" }}>{selected.title}</span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(selected.language) + "22", color: langColor(selected.language) }}>{selected.language}</span>
        <Button onClick={onCopy} style={{ background: copyToast ? theme.success : theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>{copyToast ? "✓ Copied" : "📋 Copy"}</Button>
        <Button onClick={onDownloadMd} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>📥 .md</Button>
        <Button onClick={onOpenMove} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>📦 Move</Button>
        <ChannelSelector channels={channels} selectedId={shareChannelId} onSelect={onShareChannelSelect} theme={theme} />
        <Button onClick={onShare} disabled={sharing || !shareChannelId} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600, opacity: sharing || !shareChannelId ? 0.5 : 1 }}>{sharing ? "Sharing..." : "📤 Share"}</Button>
        <Button onClick={onOpenHistory} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>🕒 History</Button>
        <Button onClick={onEdit} style={{ background: theme.warning, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>Edit</Button>
        <Button onClick={onDelete} style={{ background: theme.danger, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>Delete</Button>
      </div>

      {/* Description */}
      {selected.description && (
        <div style={{ padding: "0.75rem 1.5rem", fontSize: "0.85rem", color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>
          {selected.description}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
        <div dangerouslySetInnerHTML={{ __html: rendered }} />
      </div>

      {/* Footer */}
      <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.7rem", color: theme.textFaint, borderTop: `1px solid ${theme.border}` }}>
        Created {formatDate(selected.createdAt)} · Updated {formatDate(selected.updatedAt)}
      </div>
    </div>
  );
});

export { DetailView };
