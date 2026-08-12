import {
  createRegisterAction,
  createRegisterCommand,
  type PluginContext,
  type UnloadPluginContext,
} from "@sharkord/plugin-sdk";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import type { Actions } from "../contracts/actions";
import type { Commands } from "../contracts/commands";

// ─── Types ───────────────────────────────────────────────────────────────

interface SnippetFile {
  id: string; title: string; language: string; description: string; folderId: string; content: string; createdAt: number; updatedAt: number;
}
interface FolderManifest { [folderId: string]: { icon: string; description: string; } }

// ─── File I/O Helpers ────────────────────────────────────────────────────

function getScopeDir(ctx: PluginContext, scope: string, scopeId?: number): string {
  const dirName = scope === "user" && scopeId ? `user-${scopeId}` : "global";
  const dir = path.join(ctx.path, "snippets", dirName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getFolderDir(scopeDir: string, folderId: string): string {
  const dir = path.join(scopeDir, folderId === "root" ? "root" : folderId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function snippetPath(dir: string, id: string): string { return path.join(dir, `${id}.json`); }

function loadSnippet(dir: string, id: string): SnippetFile | null {
  const filePath = snippetPath(dir, id);
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")) as SnippetFile; } catch { return null; }
}

function saveSnippet(dir: string, snippet: SnippetFile): void {
  fs.writeFileSync(snippetPath(dir, snippet.id), JSON.stringify(snippet, null, 2));
}

function loadFolderManifest(scopeDir: string): FolderManifest {
  const manifestPath = path.join(scopeDir, "folders.json");
  if (!fs.existsSync(manifestPath)) return {};
  try { return JSON.parse(fs.readFileSync(manifestPath, "utf-8")) as FolderManifest; } catch { return {}; }
}

function saveFolderManifest(scopeDir: string, manifest: FolderManifest): void {
  const manifestPath = path.join(scopeDir, "folders.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

function listSnippetsInDir(dir: string): Array<{ id: string; title: string; language: string; description: string; folderId: string; createdAt: number }> {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const snippets: any[] = [];
  for (const file of files) {
    const id = file.replace(".json", "");
    const s = loadSnippet(dir, id);
    if (s) snippets.push({ id: s.id, title: s.title, language: s.language, description: s.description, folderId: s.folderId, createdAt: s.createdAt });
  }
  return snippets.sort((a, b) => b.createdAt - a.createdAt);
}

function generateId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ─── Plugin Init ─────────────────────────────────────────────────────────

const onLoad = async (ctx: PluginContext) => {
  ctx.log("Snippet Library plugin loaded");
  ctx.ui.enable();

  const registerAction = createRegisterAction<Actions>(ctx);
  const registerCommand = createRegisterCommand<Commands>(ctx);

  // ── Folder Actions ─────────────────────────────────────────────────────

  registerAction("list-folders", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const manifest = loadFolderManifest(scopeDir);
    const folders: any[] = [];
    
    let totalCount = 0;
    if (fs.existsSync(scopeDir)) {
      const entries = fs.readdirSync(scopeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          totalCount += fs.readdirSync(path.join(scopeDir, entry.name)).filter(f => f.endsWith('.json')).length;
        }
      }
    }
    folders.push({ id: "root", name: "All Snippets", description: "View all snippets across all folders", icon: "📂", snippetCount: totalCount, sortOrder: 0 });

    if (fs.existsSync(scopeDir)) {
      const entries = fs.readdirSync(scopeDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== "root") {
          const count = fs.readdirSync(path.join(scopeDir, entry.name)).filter(f => f.endsWith('.json')).length;
          const meta = manifest[entry.name] || { icon: "📁", description: "" };
          folders.push({ id: entry.name, name: entry.name, description: meta.description, icon: meta.icon, snippetCount: count, sortOrder: 1 });
        }
      }
    }
    return folders;
  });

  registerAction("create-folder", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const safeName = payload.name.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    if (!safeName) throw new Error("Invalid folder name.");
    const id = safeName + "__snip_" + generateId().slice(0, 6);
    fs.mkdirSync(path.join(scopeDir, id), { recursive: true });
    
    const manifest = loadFolderManifest(scopeDir);
    manifest[id] = { icon: "📁", description: "" };
    saveFolderManifest(scopeDir, manifest);
    return { id };
  });

  registerAction("rename-folder", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const safeName = payload.name.trim().replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    const cleanName = safeName.replace(/__snip_[a-z0-9]{6}$/g, '');
    const suffix = payload.folderId.match(/__snip_[a-z0-9]{6}$/)?.[0] || "__snip_" + generateId().slice(0, 6);
    const newId = cleanName + suffix;
    
    const oldPath = path.join(scopeDir, payload.folderId);
    const newPath = path.join(scopeDir, newId);
    if (fs.existsSync(oldPath) && oldPath !== newPath) fs.renameSync(oldPath, newPath);
    
    const manifest = loadFolderManifest(scopeDir);
    if (manifest[payload.folderId]) {
      manifest[newId] = { ...manifest[payload.folderId], icon: payload.icon || manifest[payload.folderId].icon, description: payload.description ?? manifest[payload.folderId].description };
      delete manifest[payload.folderId];
    } else {
      manifest[newId] = { icon: payload.icon || "📁", description: payload.description || "" };
    }
    saveFolderManifest(scopeDir, manifest);
  });

  registerAction("delete-folder", async (_invoker, payload) => {
    if (payload.folderId === "root") throw new Error("Cannot delete 'All Snippets'.");
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const dirPath = path.join(scopeDir, payload.folderId);
    if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
    
    const manifest = loadFolderManifest(scopeDir);
    delete manifest[payload.folderId];
    saveFolderManifest(scopeDir, manifest);
  });

  registerAction("download-folder-zip", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = path.join(scopeDir, payload.folderId);
    if (!fs.existsSync(folderDir)) throw new Error("Folder not found.");
    
    const zip = new AdmZip();
    const files = fs.readdirSync(folderDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(folderDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const snippet = JSON.parse(content);
      const safeName = snippet.title.replace(/[^a-z0-9]/gi, '_') + ".md";
      zip.addFile(safeName, Buffer.from(snippet.content, 'utf-8'));
    }
    return zip.toBuffer().toString('base64');
  });

  // ── Snippet Actions ────────────────────────────────────────────────────

  registerAction("list-snippets", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    let snippets: any[] = [];
    
    if (payload.folderId === "root") {
      if (fs.existsSync(scopeDir)) {
        const entries = fs.readdirSync(scopeDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            snippets = snippets.concat(listSnippetsInDir(path.join(scopeDir, entry.name)));
          }
        }
      }
      snippets.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      const folderDir = getFolderDir(scopeDir, payload.folderId);
      snippets = listSnippetsInDir(folderDir);
    }

    if (payload.query?.trim()) {
      const q = payload.query.toLowerCase();
      snippets = snippets.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.language.toLowerCase().includes(q));
    }
    return snippets;
  });

  registerAction("get-snippet", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const snippet = loadSnippet(folderDir, payload.id);
    if (!snippet) throw new Error(`Snippet "${payload.id}" not found.`);
    return snippet;
  });

  registerAction("create-snippet", async (_invoker, payload) => {
    if (payload.folderId === "root") throw new Error("Cannot create snippets in 'All Snippets'. Please select a specific folder first.");
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const now = Date.now();
    const snippet: SnippetFile = {
      id: generateId(), title: payload.title, language: payload.language, description: payload.description,
      folderId: payload.folderId, content: payload.content, createdAt: now, updatedAt: now,
    };
    saveSnippet(folderDir, snippet);
    return { id: snippet.id };
  });

  registerAction("update-snippet", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const existing = loadSnippet(folderDir, payload.id);
    if (!existing) throw new Error(`Snippet "${payload.id}" not found.`);
    const updated: SnippetFile = { ...existing, title: payload.title, language: payload.language, description: payload.description, content: payload.content, updatedAt: Date.now() };
    saveSnippet(folderDir, updated);
  });

  registerAction("delete-snippet", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const filePath = snippetPath(folderDir, payload.id);
    if (!fs.existsSync(filePath)) throw new Error(`Snippet "${payload.id}" not found.`);
    fs.unlinkSync(filePath);
  });

  registerAction("move-snippet", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const sourceDir = getFolderDir(scopeDir, payload.folderId);
    const targetDir = getFolderDir(scopeDir, payload.targetFolderId);
    
    const snippet = loadSnippet(sourceDir, payload.id);
    if (!snippet) throw new Error(`Snippet "${payload.id}" not found.`);
    
    const movedSnippet: SnippetFile = { ...snippet, folderId: payload.targetFolderId };
    saveSnippet(targetDir, movedSnippet);
    fs.unlinkSync(snippetPath(sourceDir, payload.id));
  });

  registerAction("share-snippet", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const s = loadSnippet(folderDir, payload.id);
    if (!s) throw new Error("Snippet not found.");
    const md = `### ${s.title}\n\`\`\`${s.language}\n${s.content}\n\`\`\``;
    await ctx.messages.send(payload.channelId, md);
  });

  registerAction("get-snippet-history", async (_invoker, payload) => {
    const scopeDir = getScopeDir(ctx, payload.scope, payload.scopeId);
    const folderDir = getFolderDir(scopeDir, payload.folderId);
    const s = loadSnippet(folderDir, payload.id);
    if (!s) return [];
    return [{ title: s.title, language: s.language, description: s.description, content: s.content, createdAt: s.createdAt }];
  });

  registerAction("restore-snippet", async (_invoker, payload) => {
    // Placeholder for restore logic
  });

  // ── Commands ───────────────────────────────────────────────────────────

  registerCommand("snippets", { description: "Open the Snippet Library" }, async () => "Opening Snippet Library...");
};

const onUnload = (ctx: UnloadPluginContext) => { ctx.log("Snippet Library plugin unloaded"); };

export { onLoad, onUnload };
