"use client";

import { AnnotationHandler, InnerToken } from "codehike/code";
import { CustomPreProps, InnerPre, getPreRef } from "codehike/code";
import {
  TokenTransitionsSnapshot,
  getStartingSnapshot,
} from "codehike/utils/token-transitions";
import React, { useEffect, useRef } from "react";

const ANIMATION_CONFIG = {
  duration: 400,
  staggerDelay: 20,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

function SmoothPre(props: CustomPreProps) {
  const ref = getPreRef(props);
  const prevSnapshotRef = useRef<TokenTransitionsSnapshot>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!ref.current) return;

    const snapshot = getStartingSnapshot(ref.current, {
      selector: "span[data-ch-token]",
    });

    if (isFirstRender.current) {
      prevSnapshotRef.current = snapshot;
      isFirstRender.current = false;
    }
  }, [ref]);

  useEffect(() => {
    if (!ref.current || isFirstRender.current) return;

    requestAnimationFrame(() => {
      if (!ref.current) return;

      const elements = Array.from(
        ref.current.querySelectorAll<HTMLElement>("span[data-ch-token]")
      );

      const currentSnapshot = getStartingSnapshot(ref.current, {
        selector: "span[data-ch-token]",
      });

      // 获取前后内容
      const prevContent = prevSnapshotRef.current.map((s) => s.content);
      const currentContent = currentSnapshot.map((s) => s.content);

      console.log("Token content comparison:", {
        prev: prevContent,
        current: currentContent,
      });

      // 手动找出变化的 token
      const changes: Array<[number, number]> = [];
      const removedIndices: number[] = [];
      const addedIndices: number[] = [];

      // 找出修改和删除的 token
      prevContent.forEach((content, prevIndex) => {
        const currentIndex = currentContent.indexOf(content);
        if (currentIndex === -1) {
          // Token 被删除了
          removedIndices.push(prevIndex);
        } else if (currentIndex !== prevIndex) {
          // Token 位置发生变化
          changes.push([prevIndex, currentIndex]);
        }
      });

      // 找出新增的 token
      currentContent.forEach((content, currentIndex) => {
        if (!prevContent.includes(content)) {
          addedIndices.push(currentIndex);
        }
      });

      console.log("Changes detected:", {
        modified: changes,
        removed: removedIndices,
        added: addedIndices,
      });

      // 处理变化的 token
      changes.forEach(([prevIndex, currentIndex], index) => {
        const prevToken = prevSnapshotRef.current[prevIndex];
        const currentToken = currentSnapshot[currentIndex];
        const element = elements[currentIndex];

        if (!prevToken || !currentToken || !element) return;

        const dx = prevToken.x - currentToken.x;
        const dy = prevToken.y - currentToken.y;

        element.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px)`,
              color: prevToken.color,
              opacity: 1,
            },
            {
              transform: "translate(0, 0)",
              color: currentToken.color,
              opacity: 1,
            },
          ],
          {
            duration: ANIMATION_CONFIG.duration,
            delay: index * ANIMATION_CONFIG.staggerDelay,
            easing: ANIMATION_CONFIG.easing,
            fill: "both",
          }
        );
      });

      // 处理新增的 token
      addedIndices.forEach((index, i) => {
        const element = elements[index];
        if (!element) return;

        element.animate(
          [
            { opacity: 0, transform: "scale(0.95)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          {
            duration: ANIMATION_CONFIG.duration,
            delay: (changes.length + i) * ANIMATION_CONFIG.staggerDelay,
            easing: ANIMATION_CONFIG.easing,
            fill: "both",
          }
        );
      });

      prevSnapshotRef.current = currentSnapshot;
    });
  }, [props.children, ref]);

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
