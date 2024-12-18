import type { AnnotationHandler, InnerLine } from "codehike/code";

export const bgHandler: AnnotationHandler = {
  name: "bg",
  Inline: ({ annotation, children }) => {
    const background = annotation.query || "#2d26";
    return <span style={{ background }}>{children}</span>;
  },
};
