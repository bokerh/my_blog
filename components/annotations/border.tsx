import type { AnnotationHandler } from "codehike/code";

export const borderHandler: AnnotationHandler = {
  name: "border",
  Block: ({ annotation, children }) => (
    <div style={{ border: "1px solid red" }}>{children}</div>
  ),
};
