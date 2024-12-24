import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { CodeWithTabs } from "./CodeTabs";
import { useState, useRef } from "react";
import type { HighlightedCode } from "codehike/code";

const Schema = Block.extend({
  steps: z.array(Block.extend({ tabs: z.array(HighlightedCodeBlock) })),
});

export function ScrollTabCoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  const [selectedTab, setSelectedTab] = useState(steps[0]?.tabs[0]?.meta);
  const stepsRef = useRef<HTMLDivElement>(null);

  // 处理 tab 变化
  const handleTabChange = (
    newTab: string,
    availableTabs: HighlightedCode[]
  ) => {
    const tabExists = availableTabs.some((tab) => tab.meta === selectedTab);
    if (!tabExists) {
      setSelectedTab(availableTabs[0]?.meta);
    }
  };

  return (
    <SelectionProvider className="flex gap-8 max-w-[90vw] mx-auto py-4 h-full">
      <div
        ref={stepsRef}
        className="flex-1 prose overflow-y-auto h-full steps-area scroll-smooth"
      >
        {steps.map((step, i) => (
          <Selectable
            key={i}
            index={i}
            selectOn={["click", "scroll"]}
            className="w-full border-l-4 border-transparent data-[selected=true]:border-zinc-100 px-5 pt-2 pb-6 mb-24 rounded bg-zinc-500/10"
            data-selectable
          >
            <h2 className="mt-4 text-xl">{step.title}</h2>
            <div>{step.children}</div>
          </Selectable>
        ))}
      </div>

      {/* 右侧代码区域 */}
      <div className="w-[30vw] rounded-lg code-area">
        <div className="overflow-y-auto top-16 bottom-0 sticky rounded-lg">
          <Selection
            from={steps.map((step, i) => (
              <CodeWithTabs
                key={i}
                tabs={step.tabs}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                onStepChange={() => handleTabChange(selectedTab, step.tabs)}
              />
            ))}
          />
        </div>
      </div>
    </SelectionProvider>
  );
}
