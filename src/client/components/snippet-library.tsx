import { Button, Input, Textarea } from "@sharkord/ui";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useStoreSelector } from "../../store";
import { useCallAction } from "../../store/hooks";
import { THEMES, getStoredTheme, setStoredTheme, type Theme } from "./themes";

// ─── Types ───────────────────────────────────────────────────────────────

type Scope = "global" | "user";

interface SnippetSummary {
  id: string; title: string; language: string; description: string; folderId: string; createdAt: number;
}
interface SnippetDetail extends SnippetSummary { content: string; updatedAt: number; }
interface SnippetVersion { title: string; language: string; description: string; content: string; createdAt: number; }
interface FolderInfo { id: string; name: string; description: string; icon: string; snippetCount: number; sortOrder: number; }
type View = "list" | "detail" | "new" | "edit" | "history" | "preview";

// ─── Emoji Options ───────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  "📁", "📂", "📦", "🗂️", "📑", "🏷️", "🔖", "📌", "📍", "📎",
  "🛠️", "⚙️", "🔧", "💻", "🖥️", "📱", "🌐", "🔗", "📊", "📈",
  "🎨", "🎭", "🎬", "🎮", "🎲", "🧩", "🧪", "🔬", "🚀", "⭐",
  "🔥", "💡", "📝", "📖", "📚", "🗃️", "📥", "📤", "🔒", "🔓",
  "✅", "❌", "⚠️", "❓", "💬", "👥", "👤", "🏠", "🌍", "🎯"
];

// ─── Confirmation Modal ──────────────────────────────────────────────────

function AppModal({ modal, theme, inputValue, onInputChange, onConfirm, onCancel }: {
  modal: { type: 'confirm' | 'input'; title: string; message: string };
  theme: Theme; inputValue: string; onInputChange: (v: string) => void; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "320px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <h3 style={{ margin: "0 0 0.5rem", color: theme.text, fontSize: "1.1rem" }}>{modal.title}</h3>
        <p style={{ margin: "0 0 1rem", color: theme.textMuted, fontSize: "0.9rem", lineHeight: 1.5 }}>{modal.message}</p>
        {modal.type === 'input' && (
          <input value={inputValue} onChange={e => onInputChange(e.target.value)} autoFocus
            onKeyDown={e => e.key === "Enter" && onConfirm()}
            style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }} />
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
          <Button onClick={onConfirm} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>{modal.type === 'confirm' ? 'Confirm' : 'OK'}</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Folder Settings Modal ───────────────────────────────────────────────

function FolderEditModal({ folder, theme, onSave, onCancel }: {
  folder: FolderInfo; theme: Theme; onSave: (name: string, icon: string, description: string) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(folder.name.replace(/__snip_[a-z0-9]{6}$/, ''));
  const [icon, setIcon] = useState(folder.icon);
  const [desc, setDesc] = useState(folder.description);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "320px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <h3 style={{ margin: "0 0 1rem", color: theme.text, fontSize: "1.1rem" }}>Folder Settings</h3>
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }} />
        
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Icon</label>
        <select value={icon} onChange={e => setIcon(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "0.75rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}>
          {EMOJI_OPTIONS.map(emoji => <option key={emoji} value={emoji}>{emoji}</option>)}
        </select>
        
        <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.8rem", color: theme.textMuted }}>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem", resize: "vertical" }} />
        
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
          <Button onClick={() => onSave(name.trim(), icon, desc.trim())} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>Save</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Move Folder Modal ───────────────────────────────────────────────────

function MoveFolderModal({ folders, currentFolderId, selectedTarget, onTargetChange, onConfirm, onCancel, theme }: {
  folders: FolderInfo[]; currentFolderId: string; selectedTarget: string; onTargetChange: (id: string) => void; onConfirm: () => void; onCancel: () => void; theme: Theme;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "300px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <h3 style={{ margin: "0 0 1rem", color: theme.text, fontSize: "1.1rem" }}>Move Snippet</h3>
        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: theme.textMuted }}>Target Folder</label>
        <select value={selectedTarget} onChange={e => onTargetChange(e.target.value)} style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}>
          {folders.filter(f => f.id !== currentFolderId).map(f => (
            <option key={f.id} value={f.id}>{f.icon} {f.name.replace(/__snip_[a-z0-9]{6}$/, '')}</option>
          ))}
        </select>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
          <Button onClick={onConfirm} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>Move</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Markdown Renderer ───────────────────────────────────────────────────

const MAX_RENDER_CHARS = 50000;
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderMarkdown(text: string, theme: Theme): string {
  try {
    if (!text) return "";
    if (text.length > MAX_RENDER_CHARS) return `<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow:auto;max-height:60vh;font-size:0.85rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
    
    const lines = text.split("\n"); 
    const blocks: string[] = []; 
    let i = 0, safety = 0;
    
    while (i < lines.length && safety < lines.length * 2) {
      safety++; 
      const line = lines[i];
      
      if (line.trimStart().startsWith("```")) {
        const codeLines: string[] = []; i++;
        while (i < lines.length && !lines[i].trimStart().startsWith("```") && safety < lines.length * 2) { codeLines.push(lines[i]); i++; safety++; }
        i++; 
        const escaped = codeLines.join("\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        blocks.push(`<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow-x:auto;font-size:0.85rem;margin:0.5rem 0"><code>${escaped}</code></pre>`); 
        continue;
      }
      
      if (line.trimStart().startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+$/.test(lines[i+1].trim())) {
        const parseRow = (l: string) => l.split('|').slice(1, -1).map(c => c.trim());
        const headerCells = parseRow(lines[i]); i++; i++;
        const bodyRows: string[][] = [];
        while (i < lines.length && lines[i].trimStart().startsWith("|")) { bodyRows.push(parseRow(lines[i])); i++; safety++; }
        let tHtml = `<table style="width:100%;border-collapse:collapse;margin:0.5rem 0;font-size:0.9rem;color:${theme.text}">`;
        tHtml += `<thead><tr>${headerCells.map(c => `<th style="padding:0.5rem;border:1px solid ${theme.border};background:${theme.surface};text-align:left;font-weight:600">${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>`;
        bodyRows.forEach((row, rIdx) => {
          tHtml += `<tr style="background:${rIdx % 2 === 0 ? 'transparent' : theme.surface}">${row.map(cell => `<td style="padding:0.5rem;border:1px solid ${theme.border}">${escapeHtml(cell)}</td>`).join('')}</tr>`;
        });
        tHtml += `</tbody></table>`; blocks.push(tHtml); continue;
      }
      
      if (line.startsWith("### ")) { blocks.push(`<h3 style="margin:1rem 0 0.5rem;font-size:1.1rem;color:${theme.text}">${escapeHtml(line.slice(4))}</h3>`); i++; continue; }
      if (line.startsWith("## ")) { blocks.push(`<h2 style="margin:1rem 0 0.5rem;font-size:1.3rem;color:${theme.text}">${escapeHtml(line.slice(3))}</h2>`); i++; continue; }
      if (line.startsWith("# ")) { blocks.push(`<h1 style="margin:1rem 0 0.5rem;font-size:1.5rem;color:${theme.text}">${escapeHtml(line.slice(2))}</h1>`); i++; continue; }
      if (line.trim().match(/^---+$/)) { blocks.push(`<hr style="border:none;border-top:1px solid ${theme.border};margin:1rem 0"/>`); i++; continue; }
      if (line.trim() === "") { i++; continue; }
      
      const paraLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^#{1,6} /) && !lines[i].trimStart().startsWith("```") && !lines[i].trimStart().startsWith("|") && lines[i].trim() !== "" && !lines[i].trim().match(/^---+$/) && safety < lines.length * 2) { paraLines.push(lines[i]); i++; safety++; }
      if (paraLines.length > 0) blocks.push(`<p style="margin:0.25rem;line-height:1.6;color:${theme.text}">${paraLines.map(escapeHtml).join("<br/>")}</p>`);
    }
    return blocks.join("\n");
  } catch { return `<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow:auto;max-height:60vh;font-size:0.85rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`; }
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = { typescript: "#3178c6", javascript: "#f7df1e", python: "#3572A5", rust: "#dea584", go: "#00ADD8", java: "#b07219", cpp: "#f34b7d", c: "#555555", html: "#e34c26", css: "#563d7c", sql: "#e38c00", bash: "#89e051", yaml: "#cb171e", json: "#292929", markdown: "#083fa1", shell: "#89e051", lua: "#000080", kotlin: "#A97BFF", swift: "#F05138" };
function langColor(lang: string): string { return LANG_COLORS[lang.toLowerCase()] || "#89b4fa"; }
function formatDate(ts: number): string { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true, () => {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); return true; } catch { return false; } finally { document.body.removeChild(ta); }
  });
}
function downloadFile(content: string, filename: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Theme Selector ──────────────────────────────────────────────────────

function ThemeSelector({ theme, onThemeChange }: { theme: Theme; onThemeChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen(!open)} title="Change theme" style={{ background: "transparent", border: `1px solid ${theme.border}`, borderRadius: "0.5rem", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.85rem", color: theme.textMuted }}>🎨 {theme.name}</Button>
      {open && (<>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "0.25rem", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.5rem", overflow: "hidden", zIndex: 1000, minWidth: "150px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          {THEMES.map((t) => (
            <div key={t.id} onClick={() => { onThemeChange(t.id); setOpen(false); }} style={{ padding: "0.5rem 0.75rem", cursor: "pointer", color: theme.text, background: t.id === theme.id ? theme.accent + "22" : "transparent", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }} onMouseEnter={(e) => (e.currentTarget.style.background = theme.accent + "44")} onMouseLeave={(e) => (e.currentTarget.style.background = t.id === theme.id ? theme.accent + "22" : "transparent")}>
              <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: t.bg, border: `1px solid ${t.border}`, flexShrink: 0 }} />{t.name}
            </div>
          ))}
        </div>
      </>)}
    </div>
  );
}

// ─── Channel Selector ────────────────────────────────────────────────────

function ChannelSelector({ channels, selectedId, onSelect, theme }: { channels: Array<{ id: number; name: string }>; selectedId: number | null; onSelect: (id: number) => void; theme: Theme }) {
  const [open, setOpen] = useState(false);
  const selected = channels.find((c) => c.id === selectedId);
  return (
    <div style={{ position: "relative" }}>
      <Button onClick={() => setOpen(true)} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.5rem", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.8rem", color: theme.text, minWidth: "120px", textAlign: "left" }}>
        {selected ? `📢 ${selected.name}` : "📢 Select Channel"}
      </Button>
      {open && (<>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
        <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "0.25rem", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.5rem", overflow: "hidden", zIndex: 1000, minWidth: "180px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
          {channels.length === 0 && <div style={{ padding: "0.5rem", fontSize: "0.8rem", color: theme.textMuted }}>No channels available</div>}
          {channels.map((c) => (
            <div key={c.id} onClick={() => { onSelect(c.id); setOpen(false); }} style={{ padding: "0.4rem 0.75rem", cursor: "pointer", color: theme.text, background: c.id === selectedId ? theme.accent + "22" : "transparent", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }} onMouseEnter={(e) => (e.currentTarget.style.background = theme.accent + "44")} onMouseLeave={(e) => (e.currentTarget.style.background = c.id === selectedId ? theme.accent + "22" : "transparent")}>
              #{c.name}
            </div>
          ))}
        </div>
      </>)}
    </div>
  );
}

// ─── Folder Sidebar ──────────────────────────────────────────────────────

function FolderSidebar({ folders, activeFolderId, onSelect, onCreate, onEdit, onDelete, onDownloadZip, theme }: { folders: FolderInfo[]; activeFolderId: string; onSelect: (id: string) => void; onCreate: () => void; onEdit: (f: FolderInfo) => void; onDelete: (id: string) => void; onDownloadZip: (id: string) => void; theme: Theme }) {
  return (
    <div style={{ width: "180px", flexShrink: 0, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "0.6rem 0.75rem", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: theme.textMuted, textTransform: "uppercase" }}>Folders</span>
        <Button onClick={onCreate} style={{ background: theme.accent, color: "#fff", borderRadius: "0.25rem", padding: "0.15rem 0.4rem", fontSize: "0.7rem" }}>+</Button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0.25rem" }}>
        {folders.map((f) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <div onClick={() => onSelect(f.id)} style={{ flex: 1, padding: "0.3rem 0.35rem", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.75rem", color: theme.text, background: f.id === activeFolderId ? theme.accent + "33" : "transparent", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} onMouseEnter={(e) => { if (f.id !== activeFolderId) e.currentTarget.style.background = theme.accent + "11"; }} onMouseLeave={(e) => { if (f.id !== activeFolderId) e.currentTarget.style.background = "transparent"; }}>
              {f.icon} {f.name.replace(/__snip_[a-z0-9]{6}$/, '')} <span style={{ color: theme.textFaint, fontSize: "0.65rem" }}>({f.snippetCount})</span>
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
  );
}

// ─── Scope Tabs ──────────────────────────────────────────────────────────

function ScopeTabs({ scope, onChange, theme }: { scope: Scope; onChange: (s: Scope) => void; theme: Theme }) {
  const tabs: { key: Scope; label: string; icon: string }[] = [{ key: "global", label: "Global", icon: "🌐" }, { key: "user", label: "Mine", icon: "👤" }];
  return (
    <div style={{ display: "flex", gap: "0.2rem", background: theme.surface, borderRadius: "0.5rem", padding: "0.15rem" }}>
      {tabs.map((t) => (
        <Button key={t.key} onClick={() => onChange(t.key)} style={{ background: scope === t.key ? theme.accent : "transparent", color: scope === t.key ? "#fff" : theme.textMuted, borderRadius: "0.4rem", padding: "0.25rem 0.6rem", fontSize: "0.75rem", fontWeight: scope === t.key ? 600 : 400 }}>{t.icon} {t.label}</Button>
      ))}
    </div>
  );
}

// ─── Snippet Card ────────────────────────────────────────────────────────

function SnippetCard({ s, onClick, theme }: { s: SnippetSummary; onClick: () => void; theme: Theme }) {
  return (
    <div onClick={onClick} style={{ padding: "0.75rem 1rem", background: theme.surface, borderRadius: "0.5rem", cursor: "pointer", border: "1px solid transparent", transition: "border-color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(s.language) + "22", color: langColor(s.language), flexShrink: 0 }}>{s.language}</span>
        <span style={{ fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
        <span style={{ fontSize: "0.7rem", color: theme.textFaint, flexShrink: 0 }}>{formatDate(s.createdAt)}</span>
      </div>
      {s.description && <div style={{ fontSize: "0.8rem", color: theme.textMuted, marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.description}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

const SnippetLibrary = memo(({ onClose }: { onClose?: () => void }) => {
  const callAction = useCallAction();
  const selectedChannelId = useStoreSelector((s) => s.selectedChannelId);
  const ownUserId = useStoreSelector((s) => s.ownUserId);
  const channels = useStoreSelector((s) => s.channels || []);

  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const handleThemeChange = useCallback((id: string) => { const t = THEMES.find((th) => th.id === id); if (t) { setTheme(t); setStoredTheme(id); } }, []);

  const [scope, setScope] = useState<Scope>("global");
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [activeFolderId, setActiveFolderId] = useState("root");
  const [view, setView] = useState<View>("list");
  const [snippets, setSnippets] = useState<SnippetSummary[]>([]);
  const [selected, setSelected] = useState<SnippetDetail | null>(null);
  const [history, setHistory] = useState<SnippetVersion[]>([]);
  const [previewVersion, setPreviewVersion] = useState<SnippetVersion | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareChannelId, setShareChannelId] = useState<number | null>(selectedChannelId ?? null);
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formLang, setFormLang] = useState("typescript");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState<{ type: 'confirm' | 'input'; title: string; message: string; resolve: (val: boolean | string | null) => void } | null>(null);
  const [modalInput, setModalInput] = useState("");
  const [editingFolder, setEditingFolder] = useState<FolderInfo | null>(null);

  const confirmDialog = (message: string): Promise<boolean> => new Promise(resolve => setModal({ type: 'confirm', title: 'Confirm Action', message, resolve }));
  const promptDialog = (title: string, defaultValue?: string): Promise<string | null> => new Promise(resolve => { setModalInput(defaultValue || ""); setModal({ type: 'input', title, message: title, resolve }); });

  const handleModalConfirm = () => { if (!modal) return; if (modal.type === 'confirm') modal.resolve(true); else modal.resolve(modalInput?.trim() || null); setModal(null); };
  const handleModalCancel = () => { if (modal) modal.resolve(null); setModal(null); };

  const userId = ownUserId ?? 0;
  const searchRef = useRef(search); searchRef.current = search;
  const viewRef = useRef(view); viewRef.current = view;

  useEffect(() => { if (selectedChannelId) setShareChannelId(selectedChannelId); }, [selectedChannelId]);

  const buildPayload = useCallback((extra: Record<string, any> = {}) => ({
    scope, scopeId: scope === "user" ? userId : undefined, userId: scope === "user" ? userId : undefined, folderId: activeFolderId, ...extra,
  }), [scope, userId, activeFolderId]);

  const loadFolders = useCallback(async () => {
    try { const list = await callAction("list-folders", buildPayload()); setFolders(list); if (!list.find((f) => f.id === activeFolderId)) setActiveFolderId("root"); }
    catch (err) { console.error("[Client] list-folders failed:", err); setError(err instanceof Error ? err.message : "Failed to load folders"); }
  }, [scope, userId, activeFolderId, callAction, buildPayload]);

  const loadSnippets = useCallback(async (query?: string) => {
    if (viewRef.current !== "list") return;
    setLoading(true); setError(null);
    try { const results = await callAction("list-snippets", buildPayload({ query: query || undefined })); setSnippets(results); }
    catch (err) { console.error("[Client] list-snippets failed:", err); setError(err instanceof Error ? err.message : "Failed to load snippets"); }
    finally { setLoading(false); }
  }, [scope, userId, activeFolderId, callAction, buildPayload]);

  useEffect(() => { loadFolders(); loadSnippets(); }, [scope, userId, loadFolders, loadSnippets]);
  useEffect(() => { loadSnippets(); }, [activeFolderId, loadSnippets]);

  // ── Folder Actions ───────────────────────────────────────────

  const handleCreateFolder = async () => {
    const name = await promptDialog("New Folder Name", "my-folder");
    if (!name) return;
    try { const { id } = await callAction("create-folder", buildPayload({ name })); setActiveFolderId(id); await loadFolders(); await loadSnippets(); }
    catch (err) { console.error("[Client] create-folder failed:", err); setError(err instanceof Error ? err.message : "Failed to create folder"); }
  };

  const handleEditFolder = (folder: FolderInfo) => setEditingFolder(folder);

  const handleSaveFolderSettings = async (name: string, icon: string, description: string) => {
    if (!editingFolder) return;
    const cleanName = name.replace(/__snip_[a-z0-9]{6}$/g, '');
    try { await callAction("rename-folder", buildPayload({ folderId: editingFolder.id, name: cleanName, icon, description })); setEditingFolder(null); await loadFolders(); }
    catch (err) { console.error("[Client] rename-folder failed:", err); setError(err instanceof Error ? err.message : "Failed to update folder"); }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folderName = folders.find((f) => f.id === folderId)?.name.replace(/__snip_[a-z0-9]{6}$/, '') || folderId;
    const confirmed = await confirmDialog(`Delete "${folderName}" and all its snippets?`);
    if (!confirmed) return;
    try { await callAction("delete-folder", buildPayload({ folderId })); if (activeFolderId === folderId) setActiveFolderId("root"); await loadFolders(); await loadSnippets(); }
    catch (err) { console.error("[Client] delete-folder failed:", err); setError(err instanceof Error ? err.message : "Failed to delete folder"); }
  };

  const handleDownloadFolderZip = async (folderId: string) => {
    setDownloadingZip(folderId);
    try {
      const data = await callAction("download-folder-zip", buildPayload({ folderId }));
      const binaryString = atob(data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${folderId.replace(/__snip_[a-z0-9]{6}$/, '')}.zip`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) { console.error("[Client] download-folder-zip failed:", err); setError(err instanceof Error ? err.message : "Failed to download folder ZIP"); }
    finally { setDownloadingZip(null); }
  };

  // ── Snippet Actions ──────────────────────────────────────────

  const handleSelect = async (id: string, folderId: string) => {
    try { const snippet = await callAction("get-snippet", buildPayload({ id, folderId })); setSelected(snippet); setView("detail"); }
    catch (err) { console.error("[Client] get-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to load snippet"); }
  };

  const handleCreate = async () => {
    if (activeFolderId === "root") { setError("Please select a folder first."); return; }
    if (!formTitle.trim() || !formContent.trim()) { setError("Title and content are required."); return; }
    setSaving(true); setError(null);
    try { await callAction("create-snippet", buildPayload({ title: formTitle.trim(), language: formLang.trim() || "text", description: formDesc.trim(), content: formContent })); resetForm(); setView("list"); await loadSnippets(); }
    catch (err) { console.error("[Client] create-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to create snippet"); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!formTitle.trim() || !formContent.trim()) { setError("Title and content are required."); return; }
    setSaving(true); setError(null);
    try { await callAction("update-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, title: formTitle.trim(), language: formLang.trim() || "text", description: formDesc.trim(), content: formContent })); resetForm(); setView("list"); await loadSnippets(); }
    catch (err) { console.error("[Client] update-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to update snippet"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const confirmed = await confirmDialog(`Delete "${selected.title}"?`);
    if (!confirmed) return;
    try { await callAction("delete-snippet", buildPayload({ id: selected.id, folderId: selected.folderId })); setSelected(null); setView("list"); await loadSnippets(); }
    catch (err) { console.error("[Client] delete-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to delete snippet"); }
  };

  const handleMoveSnippet = async () => {
    if (!selected || !targetFolderId) return;
    try {
      await callAction("move-snippet", buildPayload({ id: selected.id, targetFolderId, folderId: selected.folderId }));
      setMoveModalOpen(false);
      setView("list");
      await loadSnippets();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to move snippet"); }
  };

  const handleCopy = async () => {
    if (!selected) return;
    const ok = await copyToClipboard(selected.content);
    if (ok) { setCopyToast(true); setTimeout(() => setCopyToast(false), 2000); }
  };

  const handleDownloadMd = () => {
    if (!selected) return;
    downloadFile(selected.content, `${selected.title.replace(/[^a-z0-9]/gi, '_')}.md`, "text/markdown");
  };

  const handleShare = async () => {
    if (!selected || !shareChannelId) { setError("Please select a channel to share to."); return; }
    setSharing(true);
    try { await callAction("share-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, channelId: shareChannelId })); setSharing(false); }
    catch (err) { console.error("[Client] share-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to share snippet"); setSharing(false); }
  };

  const handleOpenHistory = async () => {
    if (!selected) return;
    try { const list = await callAction("get-snippet-history", buildPayload({ id: selected.id, folderId: selected.folderId })); setHistory(list); setView("history"); }
    catch (err) { console.error("[Client] get-snippet-history failed:", err); setError(err instanceof Error ? err.message : "Failed to load history"); }
  };

  const handlePreviewVersion = (v: SnippetVersion) => { setPreviewVersion(v); setView("preview"); };

  const handleRestore = async () => {
    if (!selected || !previewVersion) return;
    try { await callAction("restore-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, createdAt: previewVersion.createdAt })); const refreshed = await callAction("get-snippet", buildPayload({ id: selected.id, folderId: selected.folderId })); setSelected(refreshed); setView("detail"); }
    catch (err) { console.error("[Client] restore-snippet failed:", err); setError(err instanceof Error ? err.message : "Failed to restore version"); }
  };

  const resetForm = () => { setFormTitle(""); setFormLang("typescript"); setFormDesc(""); setFormContent(""); };
  const openNew = () => { resetForm(); setView("new"); setError(null); };
  const openEdit = () => { if (!selected) return; setFormTitle(selected.title); setFormLang(selected.language); setFormDesc(selected.description); setFormContent(selected.content); setView("edit"); setError(null); };
  const goBack = () => { setSelected(null); resetForm(); setError(null); setPreviewVersion(null); setView("list"); loadSnippets(searchRef.current); if (onClose) onClose(); };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => { const val = e.target.value; setSearch(val); loadSnippets(val); };

  const btnSecondary = { background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" };
  const inputStyle = { background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" };

  // ── Render: List View ─────────────────────────────────────────

  const renderList = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        {onClose && <Button onClick={goBack} style={btnSecondary}>✕</Button>}
        <span style={{ fontSize: "1.25rem", fontWeight: 700, flex: 1 }}>📚 Snippet Library</span>
        <ScopeTabs scope={scope} onChange={setScope} theme={theme} />
        <Input placeholder="Search..." value={search} onChange={handleSearch} style={{ width: "200px", ...inputStyle }} />
        <ThemeSelector theme={theme} onThemeChange={handleThemeChange} />
        <Button onClick={openNew} disabled={activeFolderId === "root"} title={activeFolderId === "root" ? "Select a folder first" : ""} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 600, opacity: activeFolderId === "root" ? 0.5 : 1, cursor: activeFolderId === "root" ? "not-allowed" : "pointer" }}>+ New</Button>
      </div>
      {error && <div style={{ margin: "0.75rem 1.5rem", padding: "0.75rem", background: theme.dangerBg, borderRadius: "0.5rem", fontSize: "0.875rem", color: theme.danger }}>{error}</div>}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <FolderSidebar folders={folders} activeFolderId={activeFolderId} onSelect={(id) => { setActiveFolderId(id); loadSnippets(searchRef.current); }} onCreate={handleCreateFolder} onEdit={handleEditFolder} onDelete={handleDeleteFolder} onDownloadZip={handleDownloadFolderZip} theme={theme} />
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.5rem" }}>
          {loading ? <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>Loading...</div> :
            snippets.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}><div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div><div>No snippets here. Click <strong>+ New</strong> to create one!</div></div> :
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>{snippets.map((s) => <SnippetCard key={s.id} s={s} onClick={() => handleSelect(s.id, s.folderId)} theme={theme} />)}</div>}
        </div>
      </div>
    </div>
  );

  // ── Render: Detail View ───────────────────────────────────────

  const renderDetail = () => {
    if (!selected) return null;
    const rendered = renderMarkdown(selected.content, theme);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0, flexWrap: "wrap" }}>
          <Button onClick={goBack} style={btnSecondary}>← Back</Button>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1, minWidth: "150px" }}>{selected.title}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(selected.language) + "22", color: langColor(selected.language) }}>{selected.language}</span>
          <Button onClick={handleCopy} style={{ background: copyToast ? theme.success : theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>{copyToast ? "✓ Copied" : "📋 Copy"}</Button>
          <Button onClick={handleDownloadMd} style={{ ...btnSecondary, fontWeight: 600 }}>📥 .md</Button>
          <Button onClick={() => { setTargetFolderId(folders.find(f => f.id !== selected.folderId)?.id || "root"); setMoveModalOpen(true); }} style={{ ...btnSecondary, fontWeight: 600 }}>📦 Move</Button>
          <ChannelSelector channels={channels} selectedId={shareChannelId} onSelect={setShareChannelId} theme={theme} />
          <Button onClick={handleShare} disabled={sharing || !shareChannelId} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600, opacity: sharing || !shareChannelId ? 0.5 : 1 }}>{sharing ? "Sharing..." : "📤 Share"}</Button>
          <Button onClick={handleOpenHistory} style={{ ...btnSecondary, fontWeight: 600 }}>🕒 History</Button>
          <Button onClick={openEdit} style={{ background: theme.warning, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>Edit</Button>
          <Button onClick={handleDelete} style={{ background: theme.danger, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>Delete</Button>
        </div>
        {selected.description && <div style={{ padding: "0.75rem 1.5rem", fontSize: "0.85rem", color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>{selected.description}</div>}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}><div dangerouslySetInnerHTML={{ __html: rendered }} /></div>
        <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.7rem", color: theme.textFaint, borderTop: `1px solid ${theme.border}` }}>Created {formatDate(selected.createdAt)} · Updated {formatDate(selected.updatedAt)}</div>
      </div>
    );
  };

  // ── Render: History View ──────────────────────────────────────

  const renderHistory = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <Button onClick={() => setView("detail")} style={btnSecondary}>← Back</Button>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>🕒 Version History</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.5rem" }}>
        {history.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>No previous versions saved yet.</div> :
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {history.map((v, idx) => (
              <div key={`${v.createdAt}-${idx}`} onClick={() => handlePreviewVersion(v)} style={{ padding: "0.75rem 1rem", background: theme.surface, borderRadius: "0.5rem", cursor: "pointer", border: "1px solid transparent", transition: "border-color 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = theme.accent)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", background: langColor(v.language) + "22", color: langColor(v.language), flexShrink: 0 }}>{v.language}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{v.title}</span>
                  <span style={{ fontSize: "0.75rem", color: theme.textFaint }}>{formatDate(v.createdAt)}</span>
                </div>
                {v.description && <div style={{ fontSize: "0.8rem", color: theme.textMuted, marginTop: "0.25rem" }}>{v.description}</div>}
              </div>
            ))}
          </div>}
      </div>
    </div>
  );

  // ── Render: Preview View ──────────────────────────────────────

  const renderPreview = () => {
    if (!previewVersion) return null;
    const rendered = renderMarkdown(previewVersion.content, theme);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          <Button onClick={() => setView("history")} style={btnSecondary}>← Back</Button>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>{previewVersion.title} (Preview)</span>
          <Button onClick={handleRestore} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>↩ Restore</Button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}><div dangerouslySetInnerHTML={{ __html: rendered }} /></div>
        <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.7rem", color: theme.textFaint, borderTop: `1px solid ${theme.border}` }}>Version from {formatDate(previewVersion.createdAt)}</div>
      </div>
    );
  };

  // ── Render: Form ──────────────────────────────────────────────

  const renderForm = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <Button onClick={goBack} style={btnSecondary}>← Back</Button>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>{view === "new" ? "New Snippet" : "Edit Snippet"}</span>
        <Button onClick={view === "new" ? handleCreate : handleUpdate} disabled={saving} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 600, opacity: saving ? 0.5 : 1 }}>{saving ? "Saving..." : view === "new" ? "Create" : "Save"}</Button>
      </div>
      {error && <div style={{ margin: "0.75rem 1.5rem", padding: "0.75rem", background: theme.dangerBg, borderRadius: "0.5rem", fontSize: "0.875rem", color: theme.danger }}>{error}</div>}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div><label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Title</label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="My Awesome Snippet" style={{ width: "100%", ...inputStyle }} /></div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}><label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Language</label><Input value={formLang} onChange={(e) => setFormLang(e.target.value)} placeholder="typescript" style={{ width: "100%", ...inputStyle }} /></div>
          <div style={{ flex: 2 }}><label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Description</label><Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Brief description..." style={{ width: "100%", ...inputStyle }} /></div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}><label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem" }}>Content (Markdown)</label><Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Write your snippet here..." style={{ flex: 1, width: "100%", ...inputStyle, fontFamily: "monospace", fontSize: "0.85rem", resize: "none" }} /></div>
      </div>
    </div>
  );

  // ── View Router ───────────────────────────────────────────────

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {modal && <AppModal modal={modal} theme={theme} inputValue={modalInput} onInputChange={setModalInput} onConfirm={handleModalConfirm} onCancel={handleModalCancel} />}
      {editingFolder && <FolderEditModal folder={editingFolder} theme={theme} onSave={handleSaveFolderSettings} onCancel={() => setEditingFolder(null)} />}
      {moveModalOpen && <MoveFolderModal folders={folders} currentFolderId={selected?.folderId || "root"} selectedTarget={targetFolderId} onTargetChange={setTargetFolderId} onConfirm={handleMoveSnippet} onCancel={() => setMoveModalOpen(false)} theme={theme} />}
      {view === "detail" ? renderDetail() : view === "history" ? renderHistory() : view === "preview" ? renderPreview() : (view === "new" || view === "edit") ? renderForm() : renderList()}
    </div>
  );
});

export { SnippetLibrary };
