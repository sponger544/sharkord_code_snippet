import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";
import { formatDate } from "../utils/helpers";
import { renderMarkdown } from "../utils/markdown-renderer";
import type { SnippetVersion } from "./history-view";

interface PreviewViewProps {
  theme: Theme;
  previewVersion: SnippetVersion;
  onBack: () => void;
  onRestore: () => void;
}

const PreviewView = memo(({ theme, previewVersion, onBack, onRestore }: PreviewViewProps) => {
  const rendered = renderMarkdown(previewVersion.content, theme);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: theme.bg, color: theme.text }}>
      {/* Header */}
      <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <Button onClick={onBack} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem" }}>← Back</Button>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, flex: 1 }}>{previewVersion.title} (Preview)</span>
        <Button onClick={onRestore} style={{ background: theme.success, color: "#000", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontWeight: 600 }}>↩ Restore</Button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
        <div dangerouslySetInnerHTML={{ __html: rendered }} />
      </div>

      {/* Footer */}
      <div style={{ padding: "0.5rem 1.5rem", fontSize: "0.7rem", color: theme.textFaint, borderTop: `1px solid ${theme.border}` }}>
        Version from {formatDate(previewVersion.createdAt)}
      </div>
    </div>
  );
});

export { PreviewView };
