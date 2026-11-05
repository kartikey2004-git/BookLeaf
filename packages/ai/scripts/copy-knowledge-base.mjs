import { copyFile, mkdir } from "node:fs/promises";
const repositoryKnowledgeBase = new URL(
  "../../../BOOKLEAF_KNOWLEDGE_BASE.md",
  import.meta.url,
);
const outputDirectory = new URL("../dist/", import.meta.url);

await mkdir(outputDirectory, { recursive: true });
await copyFile(
  repositoryKnowledgeBase,
  new URL("BOOKLEAF_KNOWLEDGE_BASE.md", outputDirectory),
);
