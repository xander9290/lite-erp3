"use client";

export function WidgetCellRow({
  children,
  content = "start",
}: {
  children: React.ReactNode;
  content?: "start" | "center" | "end";
}) {
  return (
    <div
      className={`d-flex flex-row gap-1 align-items-end justify-content-${content}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
