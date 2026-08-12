import { Button } from "@sharkord/ui";
import { memo, useState } from "react";
import type { Theme } from "../../themes";

interface ThemeSelectorProps {
  theme: Theme;
  onThemeChange: (id: string) => void;
}

const ThemeSelector = memo(({ theme, onThemeChange }: ThemeSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Button
        onClick={() => setOpen(!open)}
        title="Change theme"
        style={{
          background: "transparent",
          border: `1px solid ${theme.border}`,
          borderRadius: "0.5rem",
          padding: "0.3rem 0.6rem",
          cursor: "pointer",
          fontSize: "0.85rem",
          color: theme.textMuted,
        }}
      >
        🎨 {theme.name}
      </Button>
      {open && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "0.25rem", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.5rem", overflow: "hidden", zIndex: 1000, minWidth: "150px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
            {THEMES.map((t) => (
              <div
                key={t.id}
                onClick={() => { onThemeChange(t.id); setOpen(false); }}
                style={{ padding: "0.5rem 0.75rem", cursor: "pointer", color: theme.text, background: t.id === theme.id ? theme.accent + "22" : "transparent", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme.accent + "44")}
                onMouseLeave={(e) => (e.currentTarget.style.background = t.id === theme.id ? theme.accent + "22" : "transparent")}
              >
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: t.bg, border: `1px solid ${t.border}`, flexShrink: 0 }} />
                {t.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export { ThemeSelector };
