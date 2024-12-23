"use client";
import { Pre, HighlightedCode } from "codehike/code";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHorizontalScroll, useScrollSelect } from "@/hooks/scroll";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

import { tokenTransitions } from "@/components/annotations/token-transitions";
import { wordWrap } from "@/components/annotations/word-wrap";

const CopyButton = dynamic(
  () => import("../ui/copy-button/copybutton").then((mod) => mod.CopyButton),
  { ssr: false }
);

export function CodeWithTabs({
  tabs,
  selectedTab,
  onTabChange,
  onStepChange,
}: {
  tabs: HighlightedCode[];
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  onStepChange?: () => void;
}) {
  return (
    <CodeTabs
      tabs={tabs}
      selectedTab={selectedTab}
      onTabChange={onTabChange}
      onStepChange={onStepChange}
    />
  );
}

export function CodeTabs({
  tabs,
  selectedTab: externalSelectedTab,
  onTabChange,
  onStepChange,
}: {
  tabs: HighlightedCode[];
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  onStepChange?: () => void;
}) {
  const [internalSelectedTab, setInternalSelectedTab] = useState(tabs[0]?.meta);
  const selectedTab = externalSelectedTab || internalSelectedTab;

  useEffect(() => {
    onStepChange?.();
  }, [tabs, onStepChange]);

  const handleTabChange = (tab: string) => {
    setInternalSelectedTab(tab);
    onTabChange?.(tab);
  };

  const scrollContainerRef = useHorizontalScroll();
  const { handleWheel, handleScroll } = useScrollSelect({
    items: tabs,
    getKey: (tab) => tab.meta,
    initialSelectedKey: tabs[0]?.meta,
    onSelect: (tab) => handleTabChange(tab.meta),
    className: "tab-trigger",
    threshold: 50,
  });

  return (
    <Tabs
      value={selectedTab}
      onValueChange={handleTabChange}
      className="dark rounded"
    >
      <div
        className="w-full relative h-10 overflow-x-scroll"
        style={{ scrollbarWidth: "none" }}
        ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
        onScroll={handleScroll}
        onWheel={handleWheel}
      >
        <TabsList className="rounded-t-lg rounded-b-none bg-background flex absolute h-10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.meta}
              value={tab.meta}
              data-value={tab.meta}
              className="tab-trigger border-double bg-zinc-700/20"
            >
              <span className="text-sm text-gray-400 mr-4">{tab.meta}</span>
              <CopyButton text={tab.code} />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab, i) => (
        <TabsContent
          key={tab.meta}
          value={tab.meta}
          className="mt-0 overflow-x-auto"
        >
          <Pre
            code={tabs[i]}
            className="p-4 m-0 rounded-none bg-[#1f1f1f] rounded-b-lg overflow-auto"
            handlers={[tokenTransitions, wordWrap]}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
