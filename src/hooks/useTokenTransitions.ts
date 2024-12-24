import { useEffect } from "react";
import {
  TokenTransitionsSnapshot,
  getStartingSnapshot,
} from "codehike/utils/token-transitions";

// 基础类型定义
type Token = TokenTransitionsSnapshot[0];
type TokenContent = string;
type TokenIndex = number;
type TokenMap = Map<string, TokenTransitionsSnapshot>;
type ContentMap = Map<string, string>;

// 动画配置接口
interface AnimationConfig {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

// Token 状态接口
interface TokenState {
  elements: HTMLElement[]; // DOM 元素列表
  currentSnapshot: TokenTransitionsSnapshot; // 当前快照
  prevSnapshot: TokenTransitionsSnapshot; // 上一个快照
  currentTokens: TokenContent[]; // 当前 token 内容
  prevTokens: TokenContent[]; // 上一个 token 内容
}

// Token 动画配置
const TOKEN_CONFIG = {
  selector: "span[data-ch-token]", // token 选择器
  duration: 300, // 动画持续时间
  staggerDelay: 3, // 动画延迟间隔
  easing: "cubic-bezier(0.4, 0, 0.2, 1)", // 缓动函数
} as const;

// 缓存 token 状态和内容
const contentCache: ContentMap = new Map();
const snapshotCache: TokenMap = new Map();

// 计算两个位置之间的距离
const getDistance = (a: number, b: number): number => Math.abs(a - b);

// 查找最近的相同 token 位置
const findNearestPosition = (
  token: TokenContent,
  currentIndex: TokenIndex,
  tokens: TokenContent[]
): TokenIndex | null => {
  // 找出所有相同内容的 token 位置
  const positions = tokens
    .map((t, i) => ({ token: t, index: i }))
    .filter((p) => p.token === token);

  // 返回距离当前位置最近的 token 索引
  return positions.length === 0
    ? null
    : positions.reduce(
        (nearest, pos) =>
          getDistance(pos.index, currentIndex) <
          getDistance(nearest, currentIndex)
            ? pos.index
            : nearest,
        positions[0].index
      );
};

// 创建过渡或淡入动画配置
const createAnimationConfig = (
  prev: Token,
  current: Token,
  index: TokenIndex,
  isTransition: boolean
): AnimationConfig => ({
  // 根据类型生成关键帧
  keyframes: isTransition
    ? [
        {
          transform: `translate(${prev.x - current.x}px, ${
            prev.y - current.y
          }px)`,
          color: prev.color,
          opacity: 1,
        },
        {
          transform: "translate(0, 0)",
          color: current.color,
          opacity: 1,
        },
      ]
    : [
        { opacity: 0, transform: "scale(0.95)" },
        { opacity: 1, transform: "scale(1)" },
      ],
  options: {
    duration: TOKEN_CONFIG.duration,
    delay: index * TOKEN_CONFIG.staggerDelay,
    easing: TOKEN_CONFIG.easing,
    fill: "both",
  },
});

// 提取有效的 token 内容
const getTokenContents = (snapshot: TokenTransitionsSnapshot): TokenContent[] =>
  snapshot.map((s) => s.content).filter((s): s is string => s !== null);

// 初始化 token 状态
const initializeTokenState = (
  container: HTMLElement,
  prevSnapshot: TokenTransitionsSnapshot
): TokenState => {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(TOKEN_CONFIG.selector)
  );
  const currentSnapshot = getStartingSnapshot(container, {
    selector: TOKEN_CONFIG.selector,
  });

  return {
    elements,
    currentSnapshot,
    prevSnapshot,
    currentTokens: getTokenContents(currentSnapshot),
    prevTokens: getTokenContents(prevSnapshot),
  };
};

// 将动画应用到元素
const applyAnimation = (
  element: HTMLElement,
  animation: AnimationConfig
): void => {
  element.animate(animation.keyframes, animation.options);
};

// 处理单个 token 的动画逻辑
const processTokenAnimation = (
  state: TokenState,
  element: HTMLElement,
  currentIndex: TokenIndex
): void => {
  const { currentSnapshot, prevSnapshot, currentTokens, prevTokens } = state;
  const currentToken = currentTokens[currentIndex];
  const currentSnap = currentSnapshot[currentIndex];

  // 跳过无效的 token
  if (!currentToken || !currentSnap) return;

  // 如果内容没变，跳过动画
  const prevSnap = prevSnapshot[currentIndex];
  if (prevSnap?.content === currentToken) return;

  // 查找最近的相同 token 并创建相应的动画
  const nearestIndex = findNearestPosition(
    currentToken,
    currentIndex,
    prevTokens
  );
  const animation = createAnimationConfig(
    nearestIndex !== null ? prevSnapshot[nearestIndex] : currentSnap,
    currentSnap,
    currentIndex,
    nearestIndex !== null
  );

  applyAnimation(element, animation);
};

/**
 * Token 过渡动画 Hook
 * @param containerRef - 容器元素引用
 * @param tabKey - 缓存键
 */
export function useTokenTransitions(
  containerRef: React.RefObject<HTMLElement>,
  tabKey: string
): void {
  // 初始化 token 快照
  useEffect(() => {
    if (!containerRef.current) return;

    const snapshot = getStartingSnapshot(containerRef.current, {
      selector: TOKEN_CONFIG.selector,
    });

    // 首次加载时缓存快照
    if (!snapshotCache.has(tabKey)) {
      snapshotCache.set(tabKey, snapshot);
      contentCache.set(tabKey, containerRef.current.textContent || "");
    }
  }, [containerRef, tabKey]);

  // 监听变化并应用动画
  useEffect(() => {
    if (!containerRef.current || !snapshotCache.has(tabKey)) return;

    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const currentText = containerRef.current.textContent || "";
      const cachedText = contentCache.get(tabKey) || "";
      const prevSnapshot = snapshotCache.get(tabKey) || [];

      // 内容没变化时跳过
      if (currentText === cachedText) return;

      // 初始化状态并处理每个 token 的动画
      const state = initializeTokenState(containerRef.current, prevSnapshot);
      state.elements.forEach((element, index) =>
        processTokenAnimation(state, element, index)
      );

      // 更新缓存
      snapshotCache.set(tabKey, state.currentSnapshot);
      contentCache.set(tabKey, currentText);
    });
  }, [containerRef, tabKey]);
}
