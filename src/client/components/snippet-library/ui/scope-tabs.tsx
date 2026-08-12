import { Button } from "@sharkord/ui";
import { memo } from "react";
import type { Theme } from "../../themes";

export type Scope = "global" | "user";

interface ScopeTabsProps {
  scope: Scope;
  onChange: (s: Scope) => void;
  theme: Theme;
}

const ScopeTabs = memo(({ scope, onChange, theme }: ScopeTabsProps) => {
  const tabs: { key: Scope; label: string; icon: string }[] = [
    { key: "global", label: "Global", icon: "🌐" },
    { key: "user", label: "Mine", icon: "👤" },
  ];

  return (
    <div style={{ display: "flex", gap: "0.2rem", background: theme.surface, borderRadius: "0.5rem", padding: "0.15rem" }}>
      {tabs.map((t) => (
        <Button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            background: scope === t.key ? theme.accent : "transparent",
            color: scope === t.key ? "#fff" : theme.textMuted,
            borderRadius: "0.4rem",
            padding: "0.25rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: scope === t.key ? 600 : 400,
          }}
        >
          {t.icon} {t.label}
        </Button>
      ))}
    </div>
  );
});

export { ScopeTabs };
