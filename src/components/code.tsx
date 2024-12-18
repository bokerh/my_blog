import { Pre, HighlightedCode, Inline } from "codehike/code";
import { callout } from "@/components/annotations/callout";

export function Code({ codeblock }: { codeblock: HighlightedCode }) {
  return (
    <>
      <div className="text-xl text-red-600 w-full min-w-full flex justify-between">
        {codeblock.meta}
      </div>

      <Pre
        code={codeblock}
        handlers={[callout]}
        className="border bg-card"
        style={codeblock.style}
      />
    </>
  );
}

export function InlineCode({ codeblock }: { codeblock: HighlightedCode }) {
  return <Inline code={codeblock} style={codeblock.style} />;
}
