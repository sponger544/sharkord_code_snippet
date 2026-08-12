import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";

interface ConfirmModalProps {
  modal: { type: "confirm" | "input"; title: string; message: string };
  theme: Theme;
  inputValue: string;
  onInputChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = memo(({ modal, theme, inputValue, onInputChange, onConfirm, onCancel }: ConfirmModalProps) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}>
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.75rem", padding: "1.5rem", minWidth: "320px", maxWidth: "90%", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      <h3 style={{ margin: "0 0 0.5rem", color: theme.text, fontSize: "1.1rem" }}>{modal.title}</h3>
      <p style={{ margin: "0 0 1rem", color: theme.textMuted, fontSize: "0.9rem", lineHeight: 1.5 }}>{modal.message}</p>
      {modal.type === "input" && (
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          style={{ width: "100%", background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, color: theme.text, borderRadius: "0.5rem", padding: "0.5rem 0.75rem", marginBottom: "1rem", outline: "none", boxSizing: "border-box", fontSize: "0.9rem" }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <Button onClick={onCancel} style={{ background: theme.btnSecondary, color: theme.btnSecondaryText, borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem" }}>Cancel</Button>
        <Button onClick={onConfirm} style={{ background: theme.accent, color: "#fff", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>
          {modal.type === "confirm" ? "Confirm" : "OK"}
        </Button>
      </div>
    </div>
  </div>
));

export { ConfirmModal };
