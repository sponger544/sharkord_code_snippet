import { Button } from "@sharkord/ui";
import { memo, useState } from "react";
import type { Theme } from "../../themes";
import type { FolderInfo } from "../ui/folder-sidebar";

const EMOJI_OPTIONS = [
  "📁", "📂", "📦", "🗂️", "📑", "🏷️", "🔖", "📌", "📍", "📎",
  "🛠️", "⚙️", "🔧", "💻", "🖥️", "📱", "🌐", "🔗", "📊", "📈",
  "🎨", "🎭", "🎬", "🎮", "🎲", "🧩", "🧪", "🔬", "🚀", "⭐",
  "🔥", "💡", "📝", "📖", "📚", "🗃️", "📥", "📤", "🔒", "🔓",
  "✅", "❌", "⚠️", "❓", "💬", "👥", "👤", "🏠", "🌍", "🎯",
];

interface FolderEditModalProps {
  folder: FolderInfo;
  theme: Theme;
  onSave: (name: string, icon: string, description: string) => void;
  onCancel: () => void;
}

const FolderEditModal = memo(({ folder, theme, onSave, onCancel }: FolderEditModalProps) => {
  const [name, setName] = useState(folder.name.replace(/__snip_[a-z0-9]{6}$/, ""));
  const [icon, setIcon] = useState(folder.icon);
  const [desc, setDesc] = useState(folder.description);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "320px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <h3 style={{ margin: "0 0 1rem", color: theme.text, fontSize: "1.1rem" }}>Folder Settings</h3>

        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }} />

        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Icon</label>
        <select value={icon} onChange={(e) => setIcon(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}>
          {EMOJI_OPTIONS.map((emoji) => <option key={emoji} value={emoji}>{emoji}</option>)}
        </select>

        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem", resize: "vertical" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
          <Button onClick={() => onSave(name.trim(), icon, desc.trim())} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>Save</Button>
        </div>
      </div>
    </div>
  );
});

export { FolderEditModal };
