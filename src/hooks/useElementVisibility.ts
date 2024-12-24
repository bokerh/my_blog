import { useEffect, useState } from "react";

/**
 * 视口位置类型
 * - top: 元素在视口顶部
 * - bottom: 元素在视口底部
 * - left: 元素在视口左侧
 * - right: 元素在视口右侧
 * - center: 元素在视口中心点附近(水平+垂直)
 * - center-vertical: 元素在视口垂直中线附近
 * - center-horizontal: 元素在视口水平中线附近
 */
type ScreenPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "center-vertical"
  | "center-horizontal";

/**
 * 可见性检测配置选项
 * @property position - 检测的视口位置
 * @property offset - 额外的判定范围，单位为像素。正值会扩大判定范围，负值会缩小
 * @property threshold - 判定阈值(0-1)，表示视口尺寸的百分比
 *
 * @example
 * // 在视口垂直中线 ±200px 的范围内判定为可见
 * { position: "center-vertical", offset: 200, threshold: 0 }
 *
 * // 在视口顶部 40% 的范围内，且允许超出顶部 100px 时判定为可见
 * { position: "top", offset: 100, threshold: 0.4 }
 *
 * // 在视口中心点周围，水平和垂直方向各 30% 的范围内判定为可见
 * { position: "center", offset: 0, threshold: 0.3 }
 */
interface VisibilityOptions {
  position?: ScreenPosition;
  offset?: number;
  threshold?: number;
}

/**
 * 检测元素是否在视口指定位置的 hook
 *
 * @param elementRef - 要检测的元素引用
 * @param options - 检测配置选项
 * @returns 元素是否在指定位置可见
 *
 * @example
 * ```tsx
 * // 基础用法
 * const elementRef = useRef<HTMLDivElement>(null);
 * const isVisible = useElementVisibility(elementRef);
 *
 * // 自定义检测位置和范围
 * const isVisible = useElementVisibility(elementRef, {
 *   position: "center-vertical", // 检测元素是否在视口垂直中线附近
 *   offset: 100,                // 允许偏离中线 ±100px
 *   threshold: 0.3              // 再加上视口高度 30% 的判定范围
 * });
 *
 * // 实际判定范围 = offset + (视口尺寸 * threshold)
 * // 例如: 视口高度1000px，offset=100，threshold=0.3
 * // 则判定范围为: 100 + (1000 * 0.3) = 400px
 * ```
 */
export function useElementVisibility(
  elementRef: React.RefObject<HTMLElement>,
  options: VisibilityOptions = {}
) {
  const { position = "center", offset = 0, threshold = 0.5 } = options;

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!elementRef.current) return;

    const checkVisibility = () => {
      const rect = elementRef.current?.getBoundingClientRect();
      if (!rect) return;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const centerX = windowWidth / 2;
      const centerY = windowHeight / 2;

      // 计算元素的中心点
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;

      // 根据不同位置计算可见性
      let visible = false;
      switch (position) {
        case "top":
          visible =
            rect.top >= 0 - offset && rect.top <= windowHeight * threshold;
          break;
        case "bottom":
          visible =
            rect.bottom <= windowHeight + offset &&
            rect.bottom >= windowHeight * (1 - threshold);
          break;
        case "left":
          visible =
            rect.left >= 0 - offset && rect.left <= windowWidth * threshold;
          break;
        case "right":
          visible =
            rect.right <= windowWidth + offset &&
            rect.right >= windowWidth * (1 - threshold);
          break;
        case "center":
          visible =
            Math.abs(elementCenterX - centerX) <=
              offset + windowWidth * threshold &&
            Math.abs(elementCenterY - centerY) <=
              offset + windowHeight * threshold;
          break;
        case "center-vertical":
          visible =
            Math.abs(elementCenterY - centerY) <=
            offset + windowHeight * threshold;
          break;
        case "center-horizontal":
          visible =
            Math.abs(elementCenterX - centerX) <=
            offset + windowWidth * threshold;
          break;
      }

      setIsVisible(visible);
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [elementRef, position, offset, threshold]);

  return isVisible;
}
