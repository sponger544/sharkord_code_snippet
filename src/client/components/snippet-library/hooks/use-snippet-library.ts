import { useCallback, useEffect, useRef, useState } from "react";
import { THEMES, getStoredTheme, setStoredTheme, type Theme } from "../../themes";
import { useStoreSelector } from "../../../store";
import { useCallAction } from "../../../store/hooks";
import type { Scope } from "../ui/scope-tabs";
import type { FolderInfo } from "../ui/folder-sidebar";
import type { SnippetSummary } from "../ui/snippet-card";
import type { SnippetDetail } from "../views/detail-view";
import type { SnippetVersion } from "../views/history-view";
import { copyToClipboard, downloadFile } from "../utils/helpers";

// ─── Dialog Types ────────────────────────────────────────────────────────

interface DialogState {
  type: "confirm" | "input";
  title: string;
  message: string;
  resolve: (val: boolean | string | null) => void;
}

export type View = "list" | "detail" | "new" | "edit" | "history" | "preview";

// ─── Hook ────────────────────────────────────────────────────────────────

export function useSnippetLibrary(onClose?: () => void) {
  const callAction = useCallAction();
  const selectedChannelId = useStoreSelector((s) => s.selectedChannelId);
  const ownUserId = useStoreSelector((s) => s.ownUserId);
  const channels = useStoreSelector((s) => s.channels || []);

  // ── Theme ────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const handleThemeChange = useCallback((id: string) => {
    const t = THEMES.find((th) => th.id === id);
    if (t) { setTheme(t); setStoredTheme(id); }
  }, []);

  // ── Scope & Navigation ───────────────────────────────────────────
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

  // ── UI State ─────────────────────────────────────────────────────
  const [copyToast, setCopyToast] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareChannelId, setShareChannelId] = useState<number | null>(selectedChannelId ?? null);
  const [downloadingZip, setDownloadingZip] = useState<string | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState("");

  // ── Form State ───────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState("");
  const [formLang, setFormLang] = useState("typescript");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Dialog State ─────────────────────────────────────────────────
  const [modal, setModal] = useState<DialogState | null>(null);
  const [modalInput, setModalInput] = useState("");
  const [editingFolder, setEditingFolder] = useState<FolderInfo | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────
  const userId = ownUserId ?? 0;
  const searchRef = useRef(search);
  searchRef.current = search;
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => { if (selectedChannelId) setShareChannelId(selectedChannelId); }, [selectedChannelId]);

  const buildPayload = useCallback((extra: Record<string, any> = {}) => ({
    scope,
    scopeId: scope === "user" ? userId : undefined,
    userId: scope === "user" ? userId : undefined,
    folderId: activeFolderId,
    ...extra,
  }), [scope, userId, activeFolderId]);

  const confirmDialog = (message: string): Promise<boolean> =>
    new Promise((resolve) => setModal({ type: "confirm", title: "Confirm Action", message, resolve }));

  const promptDialog = (title: string, defaultValue?: string): Promise<string | null> =>
    new Promise((resolve) => { setModalInput(defaultValue || ""); setModal({ type: "input", title, message: title, resolve }); });

  const handleModalConfirm = () => {
    if (!modal) return;
    if (modal.type === "confirm") modal.resolve(true);
    else modal.resolve(modalInput?.trim() || null);
    setModal(null);
  };

  const handleModalCancel = () => {
    if (modal) modal.resolve(null);
    setModal(null);
  };

  // ── Data Loading ─────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    try {
      const list = await callAction("list-folders", buildPayload());
      setFolders(list);
      if (!list.find((f) => f.id === activeFolderId)) setActiveFolderId("root");
    } catch (err) {
      console.error("[Client] list-folders failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load folders");
    }
  }, [scope, userId, activeFolderId, callAction, buildPayload]);

  const loadSnippets = useCallback(async (query?: string) => {
    if (viewRef.current !== "list") return;
    setLoading(true);
    setError(null);
    try {
      const results = await callAction("list-snippets", buildPayload({ query: query || undefined }));
      setSnippets(results);
    } catch (err) {
      console.error("[Client] list-snippets failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load snippets");
    } finally {
      setLoading(false);
    }
  }, [scope, userId, activeFolderId, callAction, buildPayload]);

  useEffect(() => { loadFolders(); loadSnippets(); }, [scope, userId, loadFolders, loadSnippets]);
  useEffect(() => { loadSnippets(); }, [activeFolderId, loadSnippets]);

  // ── Folder Actions ───────────────────────────────────────────────
  const handleCreateFolder = async () => {
    const name = await promptDialog("New Folder Name", "my-folder");
    if (!name) return;
    try {
      const { id } = await callAction("create-folder", buildPayload({ name }));
      setActiveFolderId(id);
      await loadFolders();
      await loadSnippets();
    } catch (err) {
      console.error("[Client] create-folder failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleEditFolder = (folder: FolderInfo) => setEditingFolder(folder);

  const handleSaveFolderSettings = async (name: string, icon: string, description: string) => {
    if (!editingFolder) return;
    const cleanName = name.replace(/__snip_[a-z0-9]{6}$/g, "");
    try {
      await callAction("rename-folder", buildPayload({ folderId: editingFolder.id, name: cleanName, icon, description }));
      setEditingFolder(null);
      await loadFolders();
    } catch (err) {
      console.error("[Client] rename-folder failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update folder");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const folderName = folders.find((f) => f.id === folderId)?.name.replace(/__snip_[a-z0-9]{6}$/, "") || folderId;
    const confirmed = await confirmDialog(`Delete "${folderName}" and all its snippets?`);
    if (!confirmed) return;
    try {
      await callAction("delete-folder", buildPayload({ folderId }));
      if (activeFolderId === folderId) setActiveFolderId("root");
      await loadFolders();
      await loadSnippets();
    } catch (err) {
      console.error("[Client] delete-folder failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete folder");
    }
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
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderId.replace(/__snip_[a-z0-9]{6}$/, "")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Client] download-folder-zip failed:", err);
      setError(err instanceof Error ? err.message : "Failed to download folder ZIP");
    } finally {
      setDownloadingZip(null);
    }
  };

  // ── Snippet Actions ──────────────────────────────────────────────
  const handleSelect = async (id: string, folderId: string) => {
    try {
      const snippet = await callAction("get-snippet", buildPayload({ id, folderId }));
      setSelected(snippet);
      setView("detail");
    } catch (err) {
      console.error("[Client] get-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load snippet");
    }
  };

  const handleCreate = async () => {
    if (activeFolderId === "root") { setError("Please select a folder first."); return; }
    if (!formTitle.trim() || !formContent.trim()) { setError("Title and content are required."); return; }
    setSaving(true);
    setError(null);
    try {
      await callAction("create-snippet", buildPayload({ title: formTitle.trim(), language: formLang.trim() || "text", description: formDesc.trim(), content: formContent }));
      resetForm();
      setView("list");
      await loadSnippets();
    } catch (err) {
      console.error("[Client] create-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create snippet");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!formTitle.trim() || !formContent.trim()) { setError("Title and content are required."); return; }
    setSaving(true);
    setError(null);
    try {
      await callAction("update-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, title: formTitle.trim(), language: formLang.trim() || "text", description: formDesc.trim(), content: formContent }));
      resetForm();
      setView("list");
      await loadSnippets();
    } catch (err) {
      console.error("[Client] update-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to update snippet");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    const confirmed = await confirmDialog(`Delete "${selected.title}"?`);
    if (!confirmed) return;
    try {
      await callAction("delete-snippet", buildPayload({ id: selected.id, folderId: selected.folderId }));
      setSelected(null);
      setView("list");
      await loadSnippets();
    } catch (err) {
      console.error("[Client] delete-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete snippet");
    }
  };

  const handleMoveSnippet = async () => {
    if (!selected || !targetFolderId) return;
    try {
      await callAction("move-snippet", buildPayload({ id: selected.id, targetFolderId, folderId: selected.folderId }));
      setMoveModalOpen(false);
      setView("list");
      await loadSnippets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move snippet");
    }
  };

  const handleCopy = async () => {
    if (!selected) return;
    const ok = await copyToClipboard(selected.content);
    if (ok) { setCopyToast(true); setTimeout(() => setCopyToast(false), 2000); }
  };

  const handleDownloadMd = () => {
    if (!selected) return;
    downloadFile(selected.content, `${selected.title.replace(/[^a-z0-9]/gi, "_")}.md`, "text/markdown");
  };

  const handleShare = async () => {
    if (!selected || !shareChannelId) { setError("Please select a channel to share to."); return; }
    setSharing(true);
    try {
      await callAction("share-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, channelId: shareChannelId }));
    } catch (err) {
      console.error("[Client] share-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to share snippet");
    } finally {
      setSharing(false);
    }
  };

  const handleOpenHistory = async () => {
    if (!selected) return;
    try {
      const list = await callAction("get-snippet-history", buildPayload({ id: selected.id, folderId: selected.folderId }));
      setHistory(list);
      setView("history");
    } catch (err) {
      console.error("[Client] get-snippet-history failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    }
  };

  const handlePreviewVersion = (v: SnippetVersion) => { setPreviewVersion(v); setView("preview"); };

  const handleRestore = async () => {
    if (!selected || !previewVersion) return;
    try {
      await callAction("restore-snippet", buildPayload({ id: selected.id, folderId: selected.folderId, createdAt: previewVersion.createdAt }));
      const refreshed = await callAction("get-snippet", buildPayload({ id: selected.id, folderId: selected.folderId }));
      setSelected(refreshed);
      setView("detail");
    } catch (err) {
      console.error("[Client] restore-snippet failed:", err);
      setError(err instanceof Error ? err.message : "Failed to restore version");
    }
  };

  // ── Navigation Helpers ───────────────────────────────────────────
  const resetForm = useCallback(() => { setFormTitle(""); setFormLang("typescript"); setFormDesc(""); setFormContent(""); }, []);
  const openNew = useCallback(() => { resetForm(); setView("new"); setError(null); }, [resetForm]);
  const openEdit = useCallback(() => {
    if (!selected) return;
    setFormTitle(selected.title);
    setFormLang(selected.language);
    setFormDesc(selected.description);
    setFormContent(selected.content);
    setView("edit");
    setError(null);
  }, [selected]);

  const goBack = useCallback(() => {
    setSelected(null);
    resetForm();
    setError(null);
    setPreviewVersion(null);
    setView("list");
    loadSnippets(searchRef.current);
    if (onClose) onClose();
  }, [resetForm, loadSnippets, onClose]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadSnippets(val);
  }, [loadSnippets]);

  // ── Return ───────────────────────────────────────────────────────
  return {
    // State
    theme, scope, folders, activeFolderId, view, snippets, selected,
    history, previewVersion, search, loading, error, copyToast, sharing,
    shareChannelId, downloadingZip, moveModalOpen, targetFolderId,
    formTitle, formLang, formDesc, formContent, saving,
    modal, modalInput, editingFolder, channels,

    // Actions
    handleThemeChange, setScope, setActiveFolderId, setView,
    handleCreateFolder, handleEditFolder, handleSaveFolderSettings,
    handleDeleteFolder, handleDownloadFolderZip, handleSelect,
    handleCreate, handleUpdate, handleDelete, handleCopy,
    handleDownloadMd, handleShare, handleOpenHistory,
    handlePreviewVersion, handleRestore, handleMoveSnippet,
    handleSearch, goBack, openNew, openEdit,

    // Dialogs
    confirmDialog, promptDialog, handleModalConfirm, handleModalCancel,

    // Form setters
    setFormTitle, setFormLang, setFormDesc, setFormContent,
    resetForm,

    // Misc setters
    setShareChannelId, setTargetFolderId, setMoveModalOpen, setModalInput,

    // Exposed for index.tsx wiring
    setEditingFolder: (f: FolderInfo | null) => setEditingFolder(f),
    loadSnippets,
  };
}
