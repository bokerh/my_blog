import { Block, HighlightedCodeBlock, parseProps } from "codehike/blocks";
import { Pre, HighlightedCode } from "codehike/code";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <Tabs defaultValue={tabs[0]?.meta} className="dark rounded">
      <TabsList className="rounded-t-lg rounded-b-none bg-background">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.meta} value={tab.meta}>
            <span className="text-sm text-gray-400 mr-1"> {tab.meta}</span>
            <CopyButton text={tab.code} />
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, i) => (
        <TabsContent key={tab.meta} value={tab.meta} className="mt-0">
          <Pre
            code={tabs[i]}
            className="p-4 m-0 rounded-none bg-[#1f1f1f] rounded-b-lg"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
