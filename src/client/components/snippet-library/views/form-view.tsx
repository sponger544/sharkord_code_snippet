import { Button, Input, Textarea } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";

interface FormViewProps {
  theme: Theme;
  isNew: boolean;
  saving: boolean;
  error: string | null;
  formTitle: string;
  formLang: string;
  formDesc: string;
  formContent: string;
  onBack: () => void;
  onSave: () => void;
  onTitleChange: (v: string) => void;
  onLangChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onContentChange: (v: string) => void;
}

const FormView = memo(({
  theme, isNew, saving, error, formTitle, formLang, formDesc, formContent,
  onBack, onSave, onTitleChange, onLangChange, onDescChange, onContentChange,
}: FormViewProps) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
    {/* Header */}
    <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
      <Button onClick={onBack} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>← Back</Button>
      <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>{isNew ? "New Snippet" : "Edit Snippet"}</span>
      <Button onClick={onSave} disabled={saving} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
        {saving ? "Saving..." : isNew ? "Create" : "Save"}
      </Button>
    </div>

    {/* Error */}
    {error && <div style={{ margin: "0.75rem 1.5rem", padding: "0.75rem", background: theme.dangerBg, borderRadius: "0.5rem", fontSize: "0.875rem", color: theme.danger }}>{error}</div>}

    {/* Form */}
    <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Title</label>
        <Input value={formTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="My Awesome Snippet" style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }} />
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Language</label>
          <Input value={formLang} onChange={(e) => onLangChange(e.target.value)} placeholder="typescript" style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }} />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem", display: "block" }}>Description</label>
          <Input value={formDesc} onChange={(e) => onDescChange(e.target.value)} placeholder="Brief description..." style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem" }} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: theme.textMuted, marginBottom: "0.25rem" }}>Content (Markdown)</label>
        <Textarea value={formContent} onChange={(e) => onContentChange(e.target.value)} placeholder="Write your snippet here..." style={{ flex: 1, width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.85rem", resize: "none" }} />
      </div>
    </div>
  </div>
));

export { FormView };
