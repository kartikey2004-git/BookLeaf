import { access } from "node:fs/promises";

await access(new URL("../dist/index.js", import.meta.url));
await access(new URL("../dist/BOOKLEAF_KNOWLEDGE_BASE.md", import.meta.url));
console.log("AI artifact contains the knowledge base.");
