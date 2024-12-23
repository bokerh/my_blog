"use client";

import { AnnotationHandler, InnerToken } from "codehike/code";
import { CustomPreProps, InnerPre, getPreRef } from "codehike/code";
import {
  TokenTransitionsSnapshot,
  getStartingSnapshot,
} from "codehike/utils/token-transitions";
import React, { useEffect } from "react";

const ANIMATION_CONFIG = {
  duration: 400,
  staggerDelay: 20,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

// 用于存储每个 tab 的内容和快照
const contentCache = new Map<string, string>();
const snapshotCache = new Map<string, TokenTransitionsSnapshot>();

// 找出相同的 token 并计算最佳匹配

function SmoothPre(props: CustomPreProps) {
  const ref = getPreRef(props);
  const tabKey = (props.children as { key?: string })?.key || "default";

  useEffect(() => {
    if (!ref.current) return;

    const snapshot = getStartingSnapshot(ref.current, {
      selector: "span[data-ch-token]",
    });

    // 如果这个 tab 还没有初始化
    if (!snapshotCache.has(tabKey)) {
      snapshotCache.set(tabKey, snapshot);
      contentCache.set(tabKey, ref.current.textContent || "");
      return;
    }
  }, [ref, tabKey]);

  useEffect(() => {
    if (!ref.current || !snapshotCache.has(tabKey)) return;

    requestAnimationFrame(() => {
      if (!ref.current) return;

      const currentText = ref.current.textContent || "";
      const cachedText = contentCache.get(tabKey) || "";
      const prevSnapshot = snapshotCache.get(tabKey) || [];

      // 如果内容没有变化，不需要处理
      if (currentText === cachedText) {
        return;
      }

      const elements = Array.from(
        ref.current.querySelectorAll<HTMLElement>("span[data-ch-token]")
      );

      const currentSnapshot = getStartingSnapshot(ref.current, {
        selector: "span[data-ch-token]",
      });

      // 获取前后内容
      const prevTokens = prevSnapshot
        .map((s) => s.content)
        .filter((s): s is string => s !== null);
      const currentTokens = currentSnapshot
        .map((s) => s.content)
        .filter((s): s is string => s !== null);

      console.log("Token content comparison:", {
        prev: prevTokens,
        current: currentTokens,
      });

      // 处理所有 token 的移动
      elements.forEach((element, currentIndex) => {
        const currentToken = currentTokens[currentIndex];
        const currentSnap = currentSnapshot[currentIndex];
        if (!currentToken || !currentSnap) return;

        // 检查这个位置上的 token 是否发生了变化
        const prevSnap = prevSnapshot[currentIndex];

        if (prevSnap && prevSnap.content === currentToken) {
          // 位置和内容都没变，不需要动画
          return;
        }

        // 在之前的内容中查找相同的 token
        const prevIndices = prevTokens
          .map((token, index) => ({ token, index }))
          .filter(({ token }) => token === currentToken)
          .map(({ index }) => index);

        if (prevIndices.length > 0) {
          // 找到了相同的 token，从最近的位置平移
          const nearestIndex = prevIndices.reduce((nearest, index) => {
            const currentDist = Math.abs(index - currentIndex);
            const nearestDist = Math.abs(nearest - currentIndex);
            return currentDist < nearestDist ? index : nearest;
          }, prevIndices[0]);

          const prevSnap = prevSnapshot[nearestIndex];
          if (prevSnap) {
            // 从最近的相同 token 位置平移
            const dx = prevSnap.x - currentSnap.x;
            const dy = prevSnap.y - currentSnap.y;

            element.animate(
              [
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
              {
                duration: ANIMATION_CONFIG.duration,
                delay: currentIndex * ANIMATION_CONFIG.staggerDelay,
                easing: ANIMATION_CONFIG.easing,
                fill: "both",
              }
            );
          }
        } else {
          // 新的 token 或内容变化的 token，使用淡入效果
          element.animate(
            [
              { opacity: 0, transform: "scale(0.95)" },
              { opacity: 1, transform: "scale(1)" },
            ],
            {
              duration: ANIMATION_CONFIG.duration,
              delay: currentIndex * ANIMATION_CONFIG.staggerDelay,
              easing: ANIMATION_CONFIG.easing,
              fill: "both",
            }
          );
        }
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
