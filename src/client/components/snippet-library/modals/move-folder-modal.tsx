import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";
import type { FolderInfo } from "../ui/folder-sidebar";

interface MoveFolderModalProps {
  folders: FolderInfo[];
  currentFolderId: string;
  selectedTarget: string;
  onTargetChange: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  theme: Theme;
}

const MoveFolderModal = memo(({ folders, currentFolderId, selectedTarget, onTargetChange, onConfirm, onCancel, theme }: MoveFolderModalProps) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "300px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      <h3 style={{ margin: "0 0 1rem", color: theme.text, fontSize: "1.1rem" }}>Move Snippet</h3>
      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: theme.textMuted }}>Target Folder</label>
      <select value={selectedTarget} onChange={(e) => onTargetChange(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}>
        {folders.filter((f) => f.id !== currentFolderId).map((f) => (
          <option key={f.id} value={f.id}>{f.icon} {f.name.replace(/__snip_[a-z0-9]{6}$/, "")}</option>
        ))}
      </select>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
        <Button onClick={onConfirm} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>Move</Button>
      </div>
    </div>
  </div>
));

export { MoveFolderModal };
