"use client";

import { AnnotationHandler, InnerToken } from "codehike/code";
import { CustomPreProps, InnerPre, getPreRef } from "codehike/code";
import { useTokenTransitions } from "@/hooks/useTokenTransitions";

function SmoothPre(props: CustomPreProps) {
  const ref = getPreRef(props);
  const tabKey = (props.children as { key?: string })?.key || "default";

  useTokenTransitions(ref, tabKey);

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
