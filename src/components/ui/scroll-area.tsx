import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

// ScrollToSelectedListItem 组件用于在列表项被选中时自动滚动到视图中
// 接收两个props:
// - isChosen: 布尔值,表示该项是否被选中
// - children: React节点,要渲染的子组件内容
const ScrollToSelectedListItem = ({
  isChosen,
  children,
  scrollTo = "start",
}: {
  isChosen: boolean;
  children: React.ReactNode;
  scrollTo?: "start" | "center" | "end";
}) => {
  // 创建一个ref引用,用于获取span元素的DOM节点
  const listItemRef = useRef<HTMLSpanElement>(null);

  // 使用useEffect监听isChosen的变化
  useEffect(() => {
    // 当项目被选中且ref已挂载时
    if (isChosen && listItemRef.current) {
      // 调用scrollIntoView方法使元素滚动到视图中
      // - behavior: "smooth" 使用平滑滚动动画
      // - block: "start" 将元素对齐到视图顶部
      listItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: scrollTo,
      });
    }
  }, [isChosen, scrollTo]); // 依赖项数组中包含isChosen,当其变化时重新执行effect

  // 返回一个带ref的span元素包裹children
  return <span ref={listItemRef}>{children}</span>;
};

// ScrollToSelectListItem 组件用于在列表项滚动到视图中时自动选中
// 接收两个props:
// - onSelect: 回调函数，当元素进入视图时触发
// - children: React节点，要渲染的子组件内容
const ScrollToSelectListItem = ({
  onSelect,
  children,
  threshold = 0.5,
}: {
  onSelect: () => void;
  children: React.ReactNode;
  threshold?: number;
}) => {
  const listItemRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 当元素进入视图时触发 onSelect
        if (entries[0].isIntersecting) {
          onSelect();
        }
      },
      {
        threshold: threshold, // 设置触发阈值，0.5 表示元素至少有 50% 在视图中
      }
    );

    if (listItemRef.current) {
      observer.observe(listItemRef.current);
    }

    return () => observer.disconnect();
  }, [onSelect, threshold]);

  return <span ref={listItemRef}>{children}</span>;
};

function useHorizontalScroll<T extends HTMLElement>() {
  const elRef = useRef<T>(null);
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        e.preventDefault();

        // 根据是否按住 Shift 键调整滚动速度
        const scrollMultiplier = e.shiftKey ? 2 : 1;
        // 使用较小的滚动步长使移动更平滑
        const scrollDelta = (e.deltaY * scrollMultiplier) / 2;

        // 移除 smooth 行为，改用直接设置
        el.scrollLeft += scrollDelta;

        // 确保滚动不超出边界
        if (el.scrollLeft < 0) {
          el.scrollLeft = 0;
        } else if (el.scrollLeft > el.scrollWidth - el.clientWidth) {
          el.scrollLeft = el.scrollWidth - el.clientWidth;
        }
      };

      // 添加 passive: false 用于阻止默认行为，以提高性能
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);
  return elRef;
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export {
  ScrollArea,
  ScrollBar,
  useHorizontalScroll,
  ScrollToSelectedListItem,
  ScrollToSelectListItem,
};
