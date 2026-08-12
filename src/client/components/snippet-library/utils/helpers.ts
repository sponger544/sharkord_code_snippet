// ─── Language Colors ─────────────────────────────────────────────────────

export const LANG_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", python: "#3572A5", rust: "#dea584",
  go: "#00ADD8", java: "#b07219", cpp: "#f34b7d", c: "#555555", html: "#e34c26",
  css: "#563d7c", sql: "#e38c00", bash: "#89e051", yaml: "#cb171e", json: "#292929",
  markdown: "#083fa1", shell: "#89e051", lua: "#000080", kotlin: "#A97BFF", swift: "#F05138",
};

export function langColor(lang: string): string {
  return LANG_COLORS[lang.toLowerCase()] || "#89b4fa";
}

// ─── Formatting ──────────────────────────────────────────────────────────

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Clipboard ───────────────────────────────────────────────────────────

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true, () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); return true; }
    catch { return false; }
    finally { document.body.removeChild(ta); }
  });
}

// ─── File Download ───────────────────────────────────────────────────────

export function downloadFile(content: string, filename: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
