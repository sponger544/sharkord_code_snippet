import { memo } from "react";
import type { Theme } from "../../themes";
import { langColor, formatDate } from "../utils/helpers";

export interface SnippetSummary {
  id: string;
  title: string;
  language: string;
  description: string;
  folderId: string;
  createdAt: number;
}

interface SnippetCardProps {
  s: SnippetSummary;
  onClick: () => void;
  theme: Theme;
}

const SnippetCard = memo(({ s, onClick, theme }: SnippetCardProps) => (
  <div
    onClick={onClick}
    style={{ padding: "0.75rem 1rem", background: theme.surface, borderRadius: "0.5rem", cursor: "pointer", border: "1px solid transparent", transition: "border-color 0.15s" }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accent)}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(s.language) + "22", color: langColor(s.language), flexShrink: 0 }}>
        {s.language}
      </span>
      <span style={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
      <span style={{ fontSize: "0.7rem", color: theme.textFaint, flexShrink: 0 }}>{formatDate(s.createdAt)}</span>
    </div>
    {s.description && (
      <div style={{ fontSize: "0.8rem", color: theme.textMuted, marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {s.description}
      </div>
    )}
  </div>
));

export { SnippetCard };
