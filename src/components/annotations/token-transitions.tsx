"use client";

import { AnnotationHandler, InnerToken } from "codehike/code";
import { CustomPreProps, InnerPre, getPreRef } from "codehike/code";
import {
  TokenTransitionsSnapshot,
  getStartingSnapshot,
} from "codehike/utils/token-transitions";
import React, { useEffect } from "react";

// 动画配置
const ANIMATION_CONFIG = {
  duration: 300,
  staggerDelay: 10,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

// 缓存
const contentCache = new Map<string, string>();
const snapshotCache = new Map<string, TokenTransitionsSnapshot>();

interface AnimationConfig {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

// 工具函数
function findNearestTokenPosition(
  token: string,
  currentIndex: number,
  prevTokens: string[]
): number | null {
  const positions = prevTokens
    .map((t, i) => ({ token: t, index: i }))
    .filter((p) => p.token === token);

  if (positions.length === 0) return null;

  return positions.reduce((nearest, pos) => {
    const currentDist = Math.abs(pos.index - currentIndex);
    const nearestDist = Math.abs(nearest - currentIndex);
    return currentDist < nearestDist ? pos.index : nearest;
  }, positions[0].index);
}

function createTransitionAnimation(
  prevSnap: TokenTransitionsSnapshot[0],
  currentSnap: TokenTransitionsSnapshot[0],
  index: number
): AnimationConfig {
  const dx = prevSnap.x - currentSnap.x;
  const dy = prevSnap.y - currentSnap.y;

  return {
    keyframes: [
      {
        transform: `translate(${dx}px, ${dy}px)`,
        color: prevSnap.color,
        opacity: 1,
      },
      {
        transform: "translate(0, 0)",
        color: currentSnap.color,
        opacity: 1,
      },
    ],
    options: {
      duration: ANIMATION_CONFIG.duration,
      delay: index * ANIMATION_CONFIG.staggerDelay,
      easing: ANIMATION_CONFIG.easing,
      fill: "both",
    },
  };
}

function createFadeAnimation(index: number): AnimationConfig {
  return {
    keyframes: [
      { opacity: 0, transform: "scale(0.95)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    options: {
      duration: ANIMATION_CONFIG.duration,
      delay: index * ANIMATION_CONFIG.staggerDelay,
      easing: ANIMATION_CONFIG.easing,
      fill: "both",
    },
  };
}

function SmoothPre(props: CustomPreProps) {
  const ref = getPreRef(props);
  const tabKey = (props.children as { key?: string })?.key || "default";

  // 初始化快照
  useEffect(() => {
    if (!ref.current) return;

    const snapshot = getStartingSnapshot(ref.current, {
      selector: "span[data-ch-token]",
    });

    if (!snapshotCache.has(tabKey)) {
      snapshotCache.set(tabKey, snapshot);
      contentCache.set(tabKey, ref.current.textContent || "");
    }
  }, [ref, tabKey]);

  // 处理动画
  useEffect(() => {
    if (!ref.current || !snapshotCache.has(tabKey)) return;

    requestAnimationFrame(() => {
      if (!ref.current) return;

      const currentText = ref.current.textContent || "";
      const cachedText = contentCache.get(tabKey) || "";
      const prevSnapshot = snapshotCache.get(tabKey) || [];

      // 内容没变，跳过
      if (currentText === cachedText) return;

      const elements = Array.from(
        ref.current.querySelectorAll<HTMLElement>("span[data-ch-token]")
      );

      const currentSnapshot = getStartingSnapshot(ref.current, {
        selector: "span[data-ch-token]",
      });

      // 获取 token 内容
      const prevTokens = prevSnapshot
        .map((s) => s.content)
        .filter((s): s is string => s !== null);
      const currentTokens = currentSnapshot
        .map((s) => s.content)
        .filter((s): s is string => s !== null);

      // 处理每个 token 的动画
      elements.forEach((element, currentIndex) => {
        const currentToken = currentTokens[currentIndex];
        const currentSnap = currentSnapshot[currentIndex];
        if (!currentToken || !currentSnap) return;

        // 检查是否需要动画
        const prevSnap = prevSnapshot[currentIndex];
        if (prevSnap?.content === currentToken) return;

        // 查找最近的相同 token
        const nearestIndex = findNearestTokenPosition(
          currentToken,
          currentIndex,
          prevTokens
        );

        // 创建并应用动画
        const animation =
          nearestIndex !== null && prevSnapshot[nearestIndex]
            ? createTransitionAnimation(
                prevSnapshot[nearestIndex],
                currentSnap,
                currentIndex
              )
            : createFadeAnimation(currentIndex);

        element.animate(animation.keyframes, animation.options);
      });

      // 更新缓存
      snapshotCache.set(tabKey, currentSnapshot);
      contentCache.set(tabKey, currentText);
    });
  }, [props.children, ref, tabKey]);

  return (
    <InnerPre
      merge={props}
      style={{
        position: "relative",
        willChange: "transform",
        transformStyle: "preserve-3d",
        minHeight: "100px",
      }}
    />
  );
}

export const tokenTransitions: AnnotationHandler = {
  name: "token-transitions",
  PreWithRef: SmoothPre,
  Token: (props) => (
    <InnerToken
      merge={props}
      style={{
        display: "inline-block",
        willChange: "transform, opacity",
        position: "relative",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      data-ch-token="true"
    />
  ),
};
