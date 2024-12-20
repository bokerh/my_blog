import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { HighlightedCode, Pre } from "codehike/code";

import { CopyButton } from "@/components/ui/copy-button/copybutton";
import { tokenTransitions } from "@/components/annotations/token-transitions";
import { wordWrap } from "@/components/annotations/word-wrap";

const Schema = Block.extend({
  steps: z.array(Block.extend({ code: HighlightedCodeBlock })),
});

function Code({ codeblock }: { codeblock: HighlightedCode }) {
  return (
    <>
      <div className="text-center text-sm text-gray-400 w-full min-w-full flex justify-between">
        {codeblock.meta}
        <CopyButton text={codeblock.code} />
      </div>
      <Pre
        code={codeblock}
        handlers={[tokenTransitions, wordWrap]}
        className=" p-3"
      />
    </>
  );
}

export function Scrollycoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  return (
    <SelectionProvider className="flex gap-4 my-4">
      <div className="flex-1 mt-32 my-[3vh] ml-2 prose">
        {steps.map((step, i) => (
          <Selectable
            key={i}
            index={i}
            selectOn={["click", "scroll"]}
            className="w-min-[30vw] border-l-4 border-transparent data-[selected=true]:border-blue-400 px-5 pt-2 pb-6 mb-24 rounded bg-zinc-500/10"
          >
            <h2 className="mt-4 text-xl">{step.title}</h2>
            <div>{step.children}</div>
          </Selectable>
        ))}
      </div>
      <div className="w-[30vw] rounded-lg bg-[#1f1f1f]">
        <div className="top-16 sticky overflow-auto p-4">
          <Selection
            from={steps.map((step, i) => (
              <Code key={i} codeblock={step.code} />
            ))}
          />
        </div>
      </div>
    </SelectionProvider>
  );
}
