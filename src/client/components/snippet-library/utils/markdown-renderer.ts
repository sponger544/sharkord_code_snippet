import type { Theme } from "../../themes";

const MAX_RENDER_CHARS = 50000;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMarkdown(text: string, theme: Theme): string {
  try {
    if (!text) return "";
    if (text.length > MAX_RENDER_CHARS) {
      return `<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow:auto;max-height:60vh;font-size:0.85rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
    }

    const lines = text.split("\n");
    const blocks: string[] = [];
    let i = 0;
    let safety = 0;

    while (i < lines.length && safety < lines.length * 2) {
      safety++;
      const line = lines[i];

      // ── Code blocks ──────────────────────────────────────────────
      if (line.trimStart().startsWith("```")) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trimStart().startsWith("```") && safety < lines.length * 2) {
          codeLines.push(lines[i]);
          i++;
          safety++;
        }
        i++; // skip closing ```
        const escaped = codeLines.join("\n")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        blocks.push(`<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow-x:auto;font-size:0.85rem;margin:0.5rem 0"><code>${escaped}</code></pre>`);
        continue;
      }

      // ── Tables ───────────────────────────────────────────────────
      if (line.trimStart().startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+$/.test(lines[i + 1].trim())) {
        const parseRow = (l: string) => l.split("|").slice(1, -1).map(c => c.trim());
        const headerCells = parseRow(lines[i]);
        i++; // header
        i++; // separator
        const bodyRows: string[][] = [];
        while (i < lines.length && lines[i].trimStart().startsWith("|")) {
          bodyRows.push(parseRow(lines[i]));
          i++;
          safety++;
        }
        let tHtml = `<table style="width:100%;border-collapse:collapse;margin:0.5rem 0;font-size:0.9rem;color:${theme.text}">`;
        tHtml += `<thead><tr>${headerCells.map(c => `<th style="padding:0.5rem;border:1px solid ${theme.border};background:${theme.surface};text-align:left;font-weight:600">${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>`;
        bodyRows.forEach((row, rIdx) => {
          tHtml += `<tr style="background:${rIdx % 2 === 0 ? "transparent" : theme.surface}">${row.map(cell => `<td style="padding:0.5rem;border:1px solid ${theme.border}">${escapeHtml(cell)}</td>`).join("")}</tr>`;
        });
        tHtml += `</tbody></table>`;
        blocks.push(tHtml);
        continue;
      }

      // ── Headings ─────────────────────────────────────────────────
      if (line.startsWith("### ")) { blocks.push(`<h3 style="margin:1rem 0 0.5rem;font-size:1.1rem;color:${theme.text}">${escapeHtml(line.slice(4))}</h3>`); i++; continue; }
      if (line.startsWith("## "))  { blocks.push(`<h2 style="margin:1rem 0 0.5rem;font-size:1.3rem;color:${theme.text}">${escapeHtml(line.slice(3))}</h2>`); i++; continue; }
      if (line.startsWith("# "))   { blocks.push(`<h1 style="margin:1rem 0 0.5rem;font-size:1.5rem;color:${theme.text}">${escapeHtml(line.slice(2))}</h1>`); i++; continue; }

      // ── Horizontal rule ──────────────────────────────────────────
      if (line.trim().match(/^---+$/)) { blocks.push(`<hr style="border:none;border-top:1px solid ${theme.border};margin:1rem 0"/>`); i++; continue; }

      // ── Blank line ───────────────────────────────────────────────
      if (line.trim() === "") { i++; continue; }

      // ── Paragraph ────────────────────────────────────────────────
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        !lines[i].match(/^#{1,6} /) &&
        !lines[i].trimStart().startsWith("```") &&
        !lines[i].trimStart().startsWith("|") &&
        lines[i].trim() !== "" &&
        !lines[i].trim().match(/^---+$/) &&
        safety < lines.length * 2
      ) {
        paraLines.push(lines[i]);
        i++;
        safety++;
      }
      if (paraLines.length > 0) {
        blocks.push(`<p style="margin:0.25rem;line-height:1.6;color:${theme.text}">${paraLines.map(escapeHtml).join("<br/>")}</p>`);
      }
    }

    return blocks.join("\n");
  } catch {
    return `<pre style="background:${theme.codeBg};color:${theme.codeText};padding:1rem;border-radius:0.5rem;overflow:auto;max-height:60vh;font-size:0.85rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  }
}
