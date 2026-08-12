import { Button, Input } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";
import type { Scope } from "../ui/scope-tabs";
import { ScopeTabs } from "../ui/scope-tabs";
import { ThemeSelector } from "../ui/theme-selector";
import { FolderSidebar, type FolderInfo } from "../ui/folder-sidebar";
import { SnippetCard, type SnippetSummary } from "../ui/snippet-card";

interface ListViewProps {
  theme: Theme;
  scope: Scope;
  folders: FolderInfo[];
  activeFolderId: string;
  snippets: SnippetSummary[];
  search: string;
  loading: boolean;
  error: string | null;
  onClose?: () => void;
  onScopeChange: (s: Scope) => void;
  onThemeChange: (id: string) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenNew: () => void;
  onSelectFolder: (id: string) => void;
  onCreateFolder: () => void;
  onEditFolder: (f: FolderInfo) => void;
  onDeleteFolder: (id: string) => void;
  onDownloadFolderZip: (id: string) => void;
  onSelectSnippet: (id: string, folderId: string) => void;
}

const ListView = memo(({
  theme, scope, folders, activeFolderId, snippets, search, loading, error, onClose,
  onScopeChange, onThemeChange, onSearch, onOpenNew,
  onSelectFolder, onCreateFolder, onEditFolder, onDeleteFolder, onDownloadFolderZip,
  onSelectSnippet,
}: ListViewProps) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
    {/* Header */}
    <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
      {onClose && <Button onClick={onClose} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>✕</Button>}
      <span style={{ fontSize: "1.25rem", fontWeight: 700, flex: 1 }}>📚 Snippet Library</span>
      <ScopeTabs scope={scope} onChange={onScopeChange} theme={theme} />
      <Input placeholder="Search..." value={search} onChange={onSearch} style={{ width: "200px", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }} />
      <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
      <Button onClick={onOpenNew} disabled={activeFolderId === "root"} title={activeFolderId === "root" ? "Select a folder first" : ""} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 600, opacity: activeFolderId === "root" ? 0.5 : 1, cursor: activeFolderId === "root" ? "not-allowed" : "pointer" }}>+ New</Button>
    </div>

    {/* Error */}
    {error && <div style={{ margin: "0.75rem 1.5rem", padding: "0.75rem", background: theme.dangerBg, borderRadius: "0.5rem", fontSize: "0.875rem", color: theme.danger }}>{error}</div>}

    {/* Body */}
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <FolderSidebar
        folders={folders}
        activeFolderId={activeFolderId}
        onSelect={onSelectFolder}
        onCreate={onCreateFolder}
        onEdit={onEditFolder}
        onDelete={onDeleteFolder}
        onDownloadZip={onDownloadFolderZip}
        theme={theme}
      />
      <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 1.5rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>Loading...</div>
        ) : snippets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: theme.textMuted }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
            <div>No snippets here. Click <strong>+ New</strong> to create one!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {snippets.map((s) => (
              <SnippetCard key={s.id} s={s} onClick={() => onSelectSnippet(s.id, s.folderId)} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
));

export { ListView };
