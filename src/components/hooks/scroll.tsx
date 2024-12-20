import { useState } from "react";

/**
 * useScrollSelect Hook - 用于处理滚动选择功能
 *
 * @param items - 可选项数组
 * @returns 包含选中值、设置选中值函数和滚动处理函数的对象
 */
export function useScrollSelect(items: unknown[]) {
  // 初始化选中值为数组第一项
  const [selectedValue, setSelectedValue] = useState(items[0]);

  /**
   * 处理滚动事件的函数
   * 根据滚动位置自动选中最接近容器中心的元素
   */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // 获取滚动容器元素
    const container = e.currentTarget;
    // 获取所有带有 scroll-select-item 类名的可选项元素
    const elements = container.getElementsByClassName("scroll-select-item");

    // 计算容器的中心点位置
    // scrollLeft: 已滚动的距离
    // clientWidth: 容器可视宽度
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    // 用于记录最接近中心的元素
    let closestElement: HTMLElement | null = null;
    // 记录最小距离，初始化为无穷大
    let minDistance = Infinity;

    // 遍历所有可选项元素
    Array.from(elements).forEach((el) => {
      const element = el as HTMLElement;
      // 计算元素的中心点位置
      const elementCenter = element.offsetLeft + element.offsetWidth / 2;
      // 计算元素中心点到容器中心点的距离
      const distance = Math.abs(containerCenter - elementCenter);

      // 如果找到距离更小的元素，更新记录
      if (distance < minDistance) {
        minDistance = distance;
        closestElement = element;
      }
    });

    // 如果找到最接近的元素，更新选中值
    if (closestElement) {
      // 从元素的 data-value 属性获取值
      const value = (closestElement as HTMLElement).getAttribute("data-value");
      if (value) setSelectedValue(value);
    }
  };

  // 返回包含状态和处理函数的对象
  return {
    selectedValue, // 当前选中的值
    setSelectedValue, // 设置选中值的函数
    handleScroll, // 滚动处理函数
  };
}
