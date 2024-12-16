import { remarkCodeHike, recmaCodeHike, CodeHikeConfig } from "codehike/mdx";
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkMermaid } from "@theguild/remark-mermaid";

export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

const chConfig: CodeHikeConfig = {
  components: {
    code: "Code",
  },
};

export default defineConfig({
  mdxOptions: {
    remarkPlugins: (v) => [remarkMermaid, [remarkCodeHike, chConfig], ...v],
    recmaPlugins: [[recmaCodeHike, chConfig]],
  },
});
