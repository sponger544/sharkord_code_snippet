import { Button } from "@sharkord/ui";
import { memo, useState } from "react";
import { SnippetLibrary } from "./snippet-library/index";

/**
 * Small button in the CHAT_ACTIONS slot that expands into the full library.
 */
const SnippetTrigger = memo(() => {
  const [open, setOpen] = useState(false);

  if (open) {
    return <SnippetLibrary onClose={() => setOpen(false)} />;
  }

  return (
    <Button
      onClick={() => setOpen(true)}
      title="Snippet Library"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        padding: "0.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      📚
    </Button>
  );
});

export { SnippetTrigger };
