import type { NextConfig } from "next";
import {
  remarkCodeHike,
  recmaCodeHike,
  type CodeHikeConfig,
} from "codehike/mdx";
import nextra from "nextra";

const chConfig: CodeHikeConfig = {
  components: { code: "Code" },
  ignoreCode: (codeblock) => codeblock.lang === "mermaid",
  syntaxHighlighting: {
    theme: "material-darker",
  },
};

const mdxOptions = {
  remarkPlugins: [[remarkCodeHike, chConfig]],
  recmaPlugins: [[recmaCodeHike, chConfig]],
};

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    mdxRs: true,
  },
};

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  codeHighlight: false,
  mdxOptions,
});

export default withNextra(nextConfig);
