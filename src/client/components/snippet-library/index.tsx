import { memo } from "react";
import { ConfirmModal } from "./modals/confirm-modal";
import { FolderEditModal } from "./modals/folder-edit-modal";
import { MoveFolderModal } from "./modals/move-folder-modal";
import { ListView } from "./views/list-view";
import { DetailView } from "./views/detail-view";
import { FormView } from "./views/form-view";
import { HistoryView } from "./views/history-view";
import { PreviewView } from "./views/preview-view";
import { useSnippetLibrary } from "./hooks/use-snippet-library";

const SnippetLibrary = memo(({ onClose }: { onClose?: () => void }) => {
  const lib = useSnippetLibrary(onClose);
  const { theme } = lib;

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {/* ── Modals ──────────────────────────────────────────────── */}
      {lib.modal && (
        <ConfirmModal
          modal={lib.modal}
          theme={theme}
          inputValue={lib.modalInput}
          onInputChange={lib.setModalInput}
          onConfirm={lib.handleModalConfirm}
          onCancel={lib.handleModalCancel}
        />
      )}
      {lib.editingFolder && (
        <FolderEditModal
          folder={lib.editingFolder}
          theme={theme}
          onSave={lib.handleSaveFolderSettings}
          onCancel={() => lib.setEditingFolder(null)}
        />
      )}
      {lib.moveModalOpen && (
        <MoveFolderModal
          folders={lib.folders}
          currentFolderId={lib.selected?.folderId || "root"}
          selectedTarget={lib.targetFolderId}
          onTargetChange={lib.setTargetFolderId}
          onConfirm={lib.handleMoveSnippet}
          onCancel={() => lib.setMoveModalOpen(false)}
          theme={theme}
        />
      )}

      {/* ── Views ───────────────────────────────────────────────── */}
      {lib.view === "detail" && lib.selected && (
        <DetailView
          theme={theme}
          selected={lib.selected}
          channels={lib.channels}
          shareChannelId={lib.shareChannelId}
          copyToast={lib.copyToast}
          sharing={lib.sharing}
          onBack={lib.goBack}
          onCopy={lib.handleCopy}
          onDownloadMd={lib.handleDownloadMd}
          onOpenMove={() => {
            lib.setTargetFolderId(lib.folders.find((f) => f.id !== lib.selected?.folderId)?.id || "root");
            lib.setMoveModalOpen(true);
          }}
          onShareChannelSelect={lib.setShareChannelId}
          onShare={lib.handleShare}
          onOpenHistory={lib.handleOpenHistory}
          onEdit={lib.openEdit}
          onDelete={lib.handleDelete}
        />
      )}

      {lib.view === "history" && (
        <HistoryView
          theme={theme}
          history={lib.history}
          onBack={() => lib.setView("detail")}
          onPreviewVersion={lib.handlePreviewVersion}
        />
      )}

      {lib.view === "preview" && lib.previewVersion && (
        <PreviewView
          theme={theme}
          previewVersion={lib.previewVersion}
          onBack={() => lib.setView("history")}
          onRestore={lib.handleRestore}
        />
      )}

      {(lib.view === "new" || lib.view === "edit") && (
        <FormView
          theme={theme}
          isNew={lib.view === "new"}
          saving={lib.saving}
          error={lib.error}
          formTitle={lib.formTitle}
          formLang={lib.formLang}
          formDesc={lib.formDesc}
          formContent={lib.formContent}
          onBack={lib.goBack}
          onSave={lib.view === "new" ? lib.handleCreate : lib.handleUpdate}
          onTitleChange={lib.setFormTitle}
          onLangChange={lib.setFormLang}
          onDescChange={lib.setFormDesc}
          onContentChange={lib.setFormContent}
        />
      )}

      {lib.view === "list" && (
        <ListView
          theme={theme}
          scope={lib.scope}
          folders={lib.folders}
          activeFolderId={lib.activeFolderId}
          snippets={lib.snippets}
          search={lib.search}
          loading={lib.loading}
          error={lib.error}
          onClose={lib.goBack}
          onScopeChange={lib.setScope}
          onThemeChange={lib.handleThemeChange}
          onSearch={lib.handleSearch}
          onOpenNew={lib.openNew}
          onSelectFolder={(id) => {
            lib.setActiveFolderId(id);
            lib.loadSnippets(lib.search);
          }}
          onCreateFolder={lib.handleCreateFolder}
          onEditFolder={lib.handleEditFolder}
          onDeleteFolder={lib.handleDeleteFolder}
          onDownloadFolderZip={lib.handleDownloadFolderZip}
          onSelectSnippet={lib.handleSelect}
        />
      )}
    </div>
  );
});

export { SnippetLibrary };
