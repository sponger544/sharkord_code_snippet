import { Button } from "@sharkord/ui";
import { memo, useState } from "react";
import type { Theme } from "../../themes";

interface ChannelInfo {
  id: number;
  name: string;
}

interface ChannelSelectorProps {
  channels: ChannelInfo[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  theme: Theme;
}

const ChannelSelector = memo(({ channels, selectedId, onSelect, theme }: ChannelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const selected = channels.find((c) => c.id === selectedId);

  return (
    <div style={{ position: "relative" }}>
      <Button
        onClick={() => setOpen(true)}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: "0.5rem",
          padding: "0.3rem 0.6rem",
          cursor: "pointer",
          fontSize: "0.8rem",
          color: theme.text,
          minWidth: "120px",
          textAlign: "left",
        }}
      >
        {selected ? `📢 ${selected.name}` : "📢 Select Channel"}
      </Button>
      {open && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "0.25rem", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: "0.5rem", overflow: "hidden", zIndex: 1000, minWidth: "180px", maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
            {channels.length === 0 && <div style={{ padding: "0.5rem", fontSize: "0.8rem", color: theme.textMuted }}>No channels available</div>}
            {channels.map((c) => (
              <div
                key={c.id}
                onClick={() => { onSelect(c.id); setOpen(false); }}
                style={{ padding: "0.4rem 0.75rem", cursor: "pointer", color: theme.text, background: c.id === selectedId ? theme.accent + "22" : "transparent", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme.accent + "44")}
                onMouseLeave={(e) => (e.currentTarget.style.background = c.id === selectedId ? theme.accent + "22" : "transparent")}
              >
                #{c.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export { ChannelSelector };
