import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { CodeWithTabs } from "./CodeTabs";
import { useState, useRef } from "react";
import { useElementVisibility } from "@/hooks/useElementVisibility";

const Schema = Block.extend({
  steps: z.array(Block.extend({ tabs: z.array(HighlightedCodeBlock) })),
});

export function ScrollTabCoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  const [selectedTab, setSelectedTab] = useState(steps[0]?.tabs[0]?.meta);
  const stepsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useElementVisibility(containerRef, {
    position: "center-vertical",
    offset: 100,
    threshold: 0.6,
  });

  const handleCodeScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop === 0 || scrollTop + clientHeight >= scrollHeight) {
      stepsRef.current?.scrollBy({
        top: scrollTop === 0 ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <SelectionProvider className="flex gap-8 max-w-[90vw] mx-auto py-4">
        {/* 左侧内容区域 */}
        <div
          ref={stepsRef}
          className="flex-1 prose overflow-y-visible steps-area scroll-smooth"
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
        <div className="w-[30vw]">
          <div
            className={`fixed top-16 w-[30vw] h-[calc(100vh-4rem)] transition-opacity duration-200 ${
              isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              ref={codeRef}
              onScroll={handleCodeScroll}
              className="h-full overflow-y-auto"
            >
              <Selection
                from={steps.map((step, i) => (
                  <CodeWithTabs
                    key={i}
                    tabs={step.tabs}
                    selectedTab={selectedTab}
                    onTabChange={setSelectedTab}
                    onStepChange={() => {
                      const tabExists = step.tabs.some(
                        (tab) => tab.meta === selectedTab
                      );
                      if (!tabExists) {
                        setSelectedTab(step.tabs[0]?.meta);
                      }
                    }}
                  />
                ))}
              />
            </div>
          </div>
        </div>
      </SelectionProvider>
    </div>
  );
}
