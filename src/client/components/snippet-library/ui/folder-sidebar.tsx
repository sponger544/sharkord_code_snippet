import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";

export interface FolderInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  snippetCount: number;
  sortOrder: number;
}

interface FolderSidebarProps {
  folders: FolderInfo[];
  activeFolderId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (f: FolderInfo) => void;
  onDelete: (id: string) => void;
  onDownloadZip: (id: string) => void;
  theme: Theme;
}

const FolderSidebar = memo(({ folders, activeFolderId, onSelect, onCreate, onEdit, onDelete, onDownloadZip, theme }: FolderSidebarProps) => (
  <div style={{ width: "180px", flexShrink: 0, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: theme.textMuted, textTransform: "uppercase" }}>Folders</span>
      <Button onClick={onCreate} style={{ background: theme.accent, color: "#fff", borderRadius: "0.25rem", padding: "0.15rem 0.4rem", fontSize: "0.7rem" }}>+</Button>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0.25rem" }}>
      {folders.map((f) => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <div
            onClick={() => onSelect(f.id)}
            style={{ flex: 1, padding: "0.3rem 0.35rem", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.75rem", color: theme.text, background: f.id === activeFolderId ? theme.accent + "33" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            onMouseEnter={(e) => { if (f.id !== activeFolderId) e.currentTarget.style.background = theme.accent + "11"; }}
            onMouseLeave={(e) => { if (f.id !== activeFolderId) e.currentTarget.style.background = "transparent"; }}
          >
            {f.icon} {f.name.replace(/__snip_[a-z0-9]{6}$/, "")}{" "}
            <span style={{ color: theme.textFaint, fontSize: "0.65rem" }}>({f.snippetCount})</span>
          </div>
          {f.id !== "root" && (
            <div style={{ display: "flex", gap: "0.1rem" }}>
              <span onClick={() => onDownloadZip(f.id)} style={{ cursor: "pointer", color: theme.textFaint, fontSize: "0.65rem", padding: "0.1rem" }} title="Download ZIP">📦</span>
              <span onClick={() => onEdit(f)} style={{ cursor: "pointer", color: theme.textFaint, fontSize: "0.65rem", padding: "0.1rem" }} title="Settings">⚙️</span>
              <span onClick={() => onDelete(f.id)} style={{ cursor: "pointer", color: theme.textFaint, fontSize: "0.65rem", padding: "0.1rem" }} title="Delete">🗑</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
));

export { FolderSidebar };
