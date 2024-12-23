import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { CodeWithTabs } from "./CodeTabs";
import { useState } from "react";
import { HighlightedCode } from "codehike/code";

const Schema = Block.extend({
  steps: z.array(Block.extend({ tabs: z.array(HighlightedCodeBlock) })),
});

export function ScrollTabCoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  const [selectedTab, setSelectedTab] = useState(steps[0]?.tabs[0]?.meta);

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
    <SelectionProvider className="flex gap-4 my-4">
      <div className="flex-1 mt-32 my-[3vh] ml-2 prose overflow-y-auto">
        <div className="min-h-[calc(100vh-8rem)]">
          {steps.map((step, i) => (
            <Selectable
              key={i}
              index={i}
              selectOn={["click", "scroll"]}
              className="w-full border-l-4 border-transparent data-[selected=true]:border-zinc-100 px-5 pt-2 pb-6 mb-24 rounded bg-zinc-500/10"
            >
              <h2 className="mt-4 text-xl">{step.title}</h2>
              <div>{step.children}</div>
            </Selectable>
          ))}
        </div>
      </div>
      <div className="w-[30vw] rounded-lg bg-background">
        <div className="top-32 mt-16 my-[3vh] sticky">
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto rounded-lg">
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
      </div>
    </SelectionProvider>
  );
}
