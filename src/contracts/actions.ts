export type Actions = {
  "list-folders": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string };
    response: Array<{ id: string; name: string; description: string; icon: string; snippetCount: number; sortOrder: number }>;
  };
  "create-folder": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; name: string };
    response: { id: string };
  };
  "rename-folder": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId: string; name: string; icon?: string; description?: string };
    response: void;
  };
  "delete-folder": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId: string };
    response: void;
  };
  "list-snippets": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; query?: string };
    response: Array<{ id: string; title: string; language: string; description: string; folderId: string; createdAt: number }>;
  };
  "get-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string };
    response: { id: string; title: string; language: string; description: string; folderId: string; content: string; createdAt: number; updatedAt: number };
  };
  "create-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; title: string; language: string; description: string; content: string };
    response: { id: string };
  };
  "update-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string; title: string; language: string; description: string; content: string };
    response: void;
  };
  "delete-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string };
    response: void;
  };
  "move-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId: string; id: string; targetFolderId: string };
    response: void;
  };
  "share-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string; channelId: number };
    response: void;
  };
  "download-folder-zip": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId: string };
    response: string;
  };
  "get-snippet-history": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string };
    response: Array<{ title: string; language: string; description: string; content: string; createdAt: number }>;
  };
  "restore-snippet": {
    payload: { scope: string; scopeId?: number; userId?: number; folderId?: string; id: string; createdAt: number };
    response: void;
  };
};
