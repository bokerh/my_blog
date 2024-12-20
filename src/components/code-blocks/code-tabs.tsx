"use client";
import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { Pre, HighlightedCode } from "codehike/code";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHorizontalScroll } from "@/components/ui/scroll-area";
import dynamic from "next/dynamic";

const Schema = Block.extend({ tabs: z.array(HighlightedCodeBlock) });

const CopyButton = dynamic(
  () => import("../ui/copy-button/copybutton").then((mod) => mod.CopyButton),
  { ssr: false }
);

export function CodeWithTabs(props: unknown) {
  const { tabs } = parseProps(props, Schema);
  return <CodeTabs tabs={tabs} />;
}

export function CodeTabs(props: { tabs: HighlightedCode[] }) {
  const { tabs } = props;

  const scrollContainerRef = useHorizontalScroll();

  return (
    <Tabs defaultValue={tabs[0]?.meta} className="dark rounded">
      <div
        className="w-full relative h-10 overflow-x-scroll"
        style={{ scrollbarWidth: "none" }}
        ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
      >
        <TabsList className="rounded-t-lg rounded-b-none bg-background flex absolute h-10">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.meta}
              value={tab.meta}
              className="border-double bg-zinc-700/20"
            >
              <span className="text-sm text-gray-400 mr-1"> {tab.meta}</span>
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
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
