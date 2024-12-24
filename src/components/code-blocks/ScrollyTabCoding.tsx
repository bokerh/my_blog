import { z } from "zod";
import {
  Selection,
  Selectable,
  SelectionProvider,
  useSelectedIndex,
} from "codehike/utils/selection";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { CodeWithTabs } from "./CodeTabs";
import { useState, useRef, useEffect } from "react";
import type { HighlightedCode } from "codehike/code";

const Schema = Block.extend({
  steps: z.array(Block.extend({ tabs: z.array(HighlightedCodeBlock) })),
});

export function ScrollTabCoding(props: unknown) {
  const { steps } = parseProps(props, Schema);
  const [selectedTab, setSelectedTab] = useState(steps[0]?.tabs[0]?.meta);
  const stepsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setShouldStick] = useState(true);
  const [selectedIndex] = useSelectedIndex();
  const [isVisible, setIsVisible] = useState(true);

  // 监听组件是否在视图中
  useEffect(() => {
    if (!containerRef.current) return;

    const checkVisibility = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const windowHeight = window.innerHeight;
      const middlePoint = windowHeight / 2;

      // 检查组件是否在视图中间区域
      const isInMiddle = rect.top < middlePoint && rect.bottom > middlePoint;
      setIsVisible(isInMiddle);
    };

    // 初始检查
    checkVisibility();

    // 添加滚动监听
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  // 监听选中状态变化
  useEffect(() => {
    if (selectedIndex === 0 || selectedIndex === steps.length - 1) {
      setShouldStick(false);
    } else {
      setShouldStick(true);
    }
  }, [selectedIndex, steps.length]);

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

  // 处理右侧代码区域的滚动
  const handleCodeScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // 当滚动到顶部或底部时
    if (scrollTop === 0 || scrollTop + clientHeight >= scrollHeight) {
      // 将滚动事件传递给左侧区域
      if (stepsRef.current) {
        const scrollAmount = scrollTop === 0 ? -100 : 100; // 滚动步长
        stepsRef.current.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ minHeight: "100px" }} // 确保有足够高度被观察
    >
      <SelectionProvider className="flex gap-8 max-w-[90vw] mx-auto py-4">
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
                    onStepChange={() => handleTabChange(selectedTab, step.tabs)}
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
