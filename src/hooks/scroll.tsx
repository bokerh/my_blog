import { useState, useEffect, useRef, useCallback } from "react";

interface ScrollSelectOptions<T> {
  /** 要选择的列表项数组 */
  items: T[];
  /** 获取列表项唯一标识的函数 */
  getKey: (item: T) => string | number;
  /** 初始选中项的标识,可选 */
  initialSelectedKey?: string | number;
  /** 选中项改变时的回调函数,可选 */
  onSelect?: (item: T) => void;
  /** 用于查找子元素的CSS类名,可选 */
  className?: string;
  /** 是否启用循环滚动,可选 */
  cyclic?: boolean;
  /** 判定元素居中的阈值,可选 */
  threshold?: number;
  /** 自定义元素选择器函数,可选 */
  getElementSelector?: (key: string | number) => string;
}

/**
 * 通用的滚动选择Hook,用于实现列表项的滚动选择功能
 * @param options 配置选项,包含列表项、键值获取等参数
 * @returns 返回选中状态和事件处理函数
 */
function useScrollSelect<T>({
  items,
  getKey,
  initialSelectedKey,
  onSelect,
  className = "scroll-item",
  cyclic = true,
  threshold = 0,
  getElementSelector = (key) => `[data-value="${key}"]`,
}: ScrollSelectOptions<T>) {
  /** 当前选中项的标识 */
  const [selectedKey, setSelectedKey] = useState<string | number>(
    initialSelectedKey ?? getKey(items[0])
  );

  /**
   * 滚动到选中元素的处理函数
   * @param key 要滚动到的元素标识
   */
  const scrollToSelected = useCallback(
    (key: string | number) => {
      requestAnimationFrame(() => {
        const selector = getElementSelector(key);
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });
        }
      });
    },
    [getElementSelector]
  );
  /**
   * 处理鼠标滚轮事件
   * @param e 滚轮事件对象
   */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const currentIndex = items.findIndex(
        (item) => getKey(item) === selectedKey
      );
      let nextIndex;

      if (e.deltaY > 0) {
        nextIndex = cyclic
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
      } else {
        nextIndex = cyclic
          ? (currentIndex - 1 + items.length) % items.length
          : Math.max(currentIndex - 1, 0);
      }

      const nextItem = items[nextIndex];
      const nextKey = getKey(nextItem);
      setSelectedKey(nextKey);
      onSelect?.(nextItem);
      scrollToSelected(nextKey);
    },
    [items, selectedKey, cyclic, getKey, onSelect, scrollToSelected]
  );

  /**
   * 处理滚动事件,根据元素位置判断最近的选中项
   * @param e 滚动事件对象
   */
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const elements = container.getElementsByClassName(className);

      let closestElement = null;
      let minDistance = Infinity;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;

      Array.from(elements).forEach((element) => {
        const el = element as HTMLElement;
        const elementCenter = el.offsetLeft + el.offsetWidth / 2;
        const distance = Math.abs(containerCenter - elementCenter);

        if (distance < minDistance && distance <= threshold) {
          minDistance = distance;
          closestElement = el;
        }
      });
      if (closestElement) {
        const key = (closestElement as HTMLElement).dataset.key;
        if (key && key !== String(selectedKey)) {
          const selectedItem = items.find(
            (item) => String(getKey(item)) === key
          );
          if (selectedItem) {
            setSelectedKey(getKey(selectedItem));
            onSelect?.(selectedItem);
          }
        }
      }
    },
    [items, selectedKey, className, threshold, getKey, onSelect]
  );

  return {
    selectedKey,
    setSelectedKey,
    handleWheel,
    handleScroll,
  };
}

// ScrollToSelectedListItem 组件用于在列表项被选中时自动滚动到视图中
// 接收两个props:
// - isChosen: 布尔值,表示该项是否被选中
// - children: React节点,要渲染的子组件内容
const useSelectToScrollListItem = ({
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

export { useHorizontalScroll, useSelectToScrollListItem, useScrollSelect };
