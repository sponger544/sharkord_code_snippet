import { Button } from "@sharkord/ui";
import { memo, useEffect, useRef, useState } from "react";
import { useStoreSelector } from "../store";
import { useCallAction } from "../store/hooks";
import { LANG_COLORS, langColor } from "./snippet-library/utils/helpers";

// ─── Types ───────────────────────────────────────────────────────────────

interface PickerSnippet {
  id: string;
  title: string;
  language: string;
  description: string;
  folderId: string;
  content: string;
  createdAt: number;
}

// ─── Language Colors ─────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", python: "#3572A5", rust: "#dea584",
  go: "#00ADD8", java: "#b07219", cpp: "#f34b7d", c: "#555555", html: "#e34c26",
  css: "#563d7c", sql: "#e38c00", bash: "#89e051", yaml: "#cb171e", json: "#292929",
  markdown: "#083fa1", shell: "#89e051", lua: "#000080", kotlin: "#A97BFF", swift: "#F05138",
};

function langColor(lang: string): string {
  return LANG_COLORS[lang.toLowerCase()] || "#89b4fa";
}

// ─── Format a snippet as a chat message ──────────────────────────────────

function formatSnippetForChat(s: PickerSnippet): string {
  const lang = s.language || "text";
  const preview = s.content.trim().split("\n").slice(0, 8).join("\n");
  const truncated = s.content.split("\n").length > 8 ? "..." : "";

  return [
    `📚 **${s.title}**  ·  ${lang}`,
    s.description ? `_${s.description}_` : "",
    "─────────────────────────────",
    `\`\`\`${lang}`,
    preview,
    truncated,
    "\`\`\`",
  ].filter(Boolean).join("\n");
}

// ─── Picker Component ────────────────────────────────────────────────────

const SnippetPicker = memo(() => {
  const callAction = useCallAction();
  const selectedChannelId = useStoreSelector((s) => s.selectedChannelId);
  const ownUserId = useStoreSelector((s) => s.ownUserId);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PickerSnippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<"channel" | "global" | "user">("channel");

  const ref = useRef<HTMLDivElement>(null);
  const channelId = selectedChannelId ?? 1;
  const userId = ownUserId ?? 0;

  // ── Fetch snippets ───────────────────────────────────────────────────

  const fetchResults = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const scopeId = scope === "channel" ? channelId : undefined;
      const userIdParam = scope === "user" ? userId : undefined;
      // Fetch from all folders in scope
      const allSnippets: PickerSnippet[] = [];

      // Get folders first
      const folders = await callAction("list-folders", { scope, scopeId, userId: userIdParam });
      for (const folder of folders) {
        const list = await callAction("list-snippets", {
          scope, scopeId, userId: userIdParam,
          folderId: folder.id, query,
        });
        // Get content for each snippet (needed for formatting)
        for (const s of list) {
          try {
            const detail = await callAction("get-snippet", {
              scope, scopeId, userId: userIdParam,
              folderId: folder.id, id: s.id,
            });
            allSnippets.push({ ...s, content: detail.content });
          } catch {
            // Skip if fetch fails
          }
        }
      }

      // Client-side search if query exists
      if (query.trim()) {
        const q = query.toLowerCase();
        setResults(allSnippets.filter(
          (s) => s.title.toLowerCase().includes(q) ||
                 s.description.toLowerCase().includes(q) ||
                 s.language.toLowerCase().includes(q) ||
                 s.content.toLowerCase().includes(q),
        ));
      } else {
        setResults(allSnippets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snippets");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when opened or scope changes
  useEffect(() => {
    if (open) fetchResults(search);
  }, [open, scope]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchResults(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ── Post snippet to channel ──────────────────────────────────────────

  const handlePost = async (snippet: PickerSnippet) => {
    setPosting(snippet.id);
    try {
      const message = formatSnippetForChat(snippet);
      // Use the store's sendMessage action
      const store = (window as any).__SHARKORD_STORE__;
      await store.actions.sendMessage(channelId, message);
      setOpen(false);
      setSearch("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post snippet");
    } finally {
      setPosting(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger Button */}
      <Button
        onClick={() => { setOpen(!open); setSearch(""); }}
        title="Attach snippet to chat"
        style={{
          background: open ? "#3b82f6" : "transparent",
          color: "#e2e8f0",
          border: "none",
          borderRadius: "0.35rem",
          padding: "0.3rem 0.5rem",
          fontSize: "1rem",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        📚
      </Button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 0.5rem)",
          right: 0,
          width: "420px",
          maxHeight: "500px",
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "0.75rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "0.75rem", borderBottom: "1px solid #1e293b" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e2e8f0", marginBottom: "0.5rem" }}>
              📚 Attach Snippet
            </div>

            {/* Scope Tabs */}
            <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
              {(["channel", "global", "user"] as const).map((s) => (
                <Button key={s} onClick={() => setScope(s)} style={{
                  background: scope === s ? "#3b82f6" : "#1e293b",
                  color: scope === s ? "#fff" : "#94a3b8",
                  borderRadius: "0.35rem",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.7rem",
                  fontWeight: scope === s ? 600 : 400,
                  textTransform: "capitalize",
                }}>
                  {s === "channel" ? "💬" : s === "global" ? "🌐" : "👤"} {s}
                </Button>
              ))}
            </div>

            {/* Search */}
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search snippets..."
              style={{
                width: "100%",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "0.5rem",
                padding: "0.4rem 0.6rem",
                color: "#e2e8f0",
                fontSize: "0.8rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.25rem" }}>
            {error && (
              <div style={{ padding: "0.75rem", color: "#f87171", fontSize: "0.8rem" }}>
                ⚠️ {error}
              </div>
            )}

            {loading && results.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                Searching...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                No snippets found
              </div>
            )}

            {results.map((s) => (
              <div
                key={s.id}
                onClick={() => handlePost(s)}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.5rem",
                  cursor: posting === s.id ? "wait" : "pointer",
                  opacity: posting === s.id ? 0.5 : 1,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "0.2rem",
                  background: langColor(s.language) + "22",
                  color: langColor(s.language),
                  flexShrink: 0,
                  marginTop: "0.15rem",
                }}>
                  {s.language}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.title}
                  </div>
                  {s.description && (
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.description}
                    </div>
                  )}
                </div>
                {posting === s.id && (
                  <span style={{ fontSize: "0.7rem", color: "#3b82f6", flexShrink: 0 }}>Posting...</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "0.4rem 0.75rem", borderTop: "1px solid #1e293b", fontSize: "0.65rem", color: "#475569", textAlign: "center" }}>
            Click a snippet to attach it to the chat
          </div>
        </div>
      )}
    </div>
  );
});

export { SnippetPicker };
