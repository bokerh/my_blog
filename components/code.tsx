import { Pre, RawCode, highlight } from "codehike/code";
import { callout } from "@/components/annotations/callout";
import { className } from "@/components/annotations/classname";
import { wordWrap } from "@/components/annotations/word-wrap";
import { CopyButton } from "@/components/annotations/button";
import { diff } from "@/components/annotations/diff";
import { mark } from "@/components/annotations/mark";
import { lineNumbers } from "@/components/annotations/line-numbers";

export async function Code({ codeblock }: { codeblock: RawCode }) {
  const highlighted = await highlight(codeblock, "github-from-css");
  return (
    <>
      <div className="text-sm text-gray-500">{highlighted.meta}</div>

      <div>
        <CopyButton text={highlighted.code} />
      </div>

      <Pre
        code={highlighted}
        handlers={[callout, className, wordWrap, mark, diff, lineNumbers]}
        className="border bg-card"
      />
    </>
  );
}
