import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { CodeWithTabs } from "./CodeTabs";
import { useState, useEffect, useRef } from "react";
import { HighlightedCode } from "codehike/code";

const Schema = Block.extend({
  steps: z.array(Block.extend({ tabs: z.array(HighlightedCodeBlock) })),
});

export function ScrollTabCoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  const [selectedTab, setSelectedTab] = useState(steps[0]?.tabs[0]?.meta);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 处理滚动
  useEffect(() => {
    const container = containerRef.current;
    const stepsArea = stepsRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !stepsArea || !wrapper) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      // 检查事件是否发生在整个组件范围内
      if (!wrapper.contains(e.target as Node)) {
        return;
      }

      // 检查是否在代码区域内
      const codeArea = container.querySelector(".code-area");
      if (codeArea?.contains(e.target as Node)) {
        return; // 允许代码区域正常滚动
      }

      // 检查是否在步骤区域内
      if (stepsArea.contains(e.target as Node)) {
        return; // 允许步骤区域正常滚动
      }

      // 检查是否在 sticky 容器内
      if (container.contains(e.target as Node)) {
        e.preventDefault();

        // 如果正在滚动中，不处理新的滚动
        if (isScrolling) return;

        isScrolling = true;

        // 获取当前选中的 Selectable
        const selectables = stepsArea.querySelectorAll("[data-selectable]");
        const currentIndex = Array.from(selectables).findIndex(
          (el) => (el as HTMLElement).dataset.selected === "true"
        );

        // 计算目标索引
        const targetIndex =
          e.deltaY > 0
            ? Math.min(currentIndex + 1, selectables.length - 1)
            : Math.max(currentIndex - 1, 0);

        // 滚动到目标元素
        (selectables[targetIndex] as HTMLElement)?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });

        // 重置滚动状态
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 10);
      }
      // 其他区域（如顶部空间和中间区域）允许正常滚动
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);

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
    <div ref={wrapperRef} className="min-h-[calc(100vh+4rem)] border">
      <div ref={containerRef} className="sticky top-16 border bg-background">
        <SelectionProvider className="flex gap-4 max-w-[90vw] mx-auto py-8">
          <div
            ref={stepsRef}
            className="flex-1 prose overflow-y-auto max-h-[75vh] steps-area scroll-smooth"
          >
            <div className="min-h-full">
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
          </div>

          {/* 右侧代码区域 */}
          <div className="w-[30vw] rounded-lg code-area">
            <div className="overflow-y-auto max-h-[75vh] rounded-lg">
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
      </div>

      <div className="h-[50vh]" />
    </div>
  );
}
