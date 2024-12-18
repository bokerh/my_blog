import { remarkCodeHike, recmaCodeHike, CodeHikeConfig } from "codehike/mdx";
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkMermaid } from "@theguild/remark-mermaid";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

const chConfig: CodeHikeConfig = {
  components: {
    code: "Code",
    inlineCode: "InlineCode",
  },
  syntaxHighlighting: {
    theme: "slack-ochin",
  },
  ignoreCode: (codeblock) => codeblock.lang === "mermaid",
};

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [[remarkCodeHike, chConfig], remarkMermaid, ...v],
    recmaPlugins: [[recmaCodeHike, chConfig], remarkMermaid],
  },
});
