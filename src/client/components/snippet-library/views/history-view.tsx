import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";
import { langColor, formatDate } from "../utils/helpers";

export interface SnippetVersion {
  title: string;
  language: string;
  description: string;
  content: string;
  createdAt: number;
}

interface HistoryViewProps {
  theme: Theme;
  history: SnippetVersion[];
  onBack: () => void;
  onPreviewVersion: (v: SnippetVersion) => void;
}

const HistoryView = memo(({ theme, history, onBack, onPreviewVersion }: HistoryViewProps) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
    {/* Header */}
    <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
      <Button onClick={onBack} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>← Back</Button>
      <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>🕒 Version History</span>
    </div>

    {/* List */}
    <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.5rem" }}>
      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>No previous versions saved yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {history.map((v, idx) => (
            <div
              key={`${v.createdAt}-${idx}`}
              onClick={() => onPreviewVersion(v)}
              style={{ padding: "0.75rem 1rem", background: theme.surface, borderRadius: "0.5rem", cursor: "pointer", border: "1px solid transparent", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(v.language) + "22", color: langColor(v.language), flexShrink: 0 }}>{v.language}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{v.title}</span>
                <span style={{ fontSize: "0.75rem", color: theme.textFaint }}>{formatDate(v.createdAt)}</span>
              </div>
              {v.description && <div style={{ fontSize: "0.8rem", color: theme.textMuted, marginTop: "0.25rem" }}>{v.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
));

export { HistoryView };
