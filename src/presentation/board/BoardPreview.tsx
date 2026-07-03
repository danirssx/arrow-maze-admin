import { useMemo } from "react";
import { toBoardPreview } from "@/application/board/toBoardPreview";

interface BoardPreviewProps {
  /** Raw (parsed-from-JSON) level value; invalid input degrades to a fallback. */
  source: unknown;
  cellSize?: number;
}

function pointsAttr(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

/**
 * MVVM view — read-only SVG board preview. Dumb: it renders geometry computed by the
 * application `toBoardPreview` and never throws on bad input (shows a fallback instead).
 * Reusable by the JSON creator (AD-05) and level detail.
 */
export function BoardPreview({ source, cellSize }: BoardPreviewProps) {
  const geometry = useMemo(() => toBoardPreview(source, cellSize), [source, cellSize]);

  if (geometry === null) {
    return (
      <div
        data-testid="board-preview-invalid"
        className="rounded-xl border border-border-soft bg-background-soft px-4 py-6 text-center text-sm text-text-secondary"
      >
        Invalid level definition
      </div>
    );
  }

  return (
    <svg
      data-testid="board-preview"
      role="img"
      aria-label="Level board preview"
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className="h-auto w-full max-w-md rounded-xl bg-background-card"
    >
      {geometry.cells.map((cell, index) => (
        <rect
          key={`cell-${index}`}
          x={cell.x}
          y={cell.y}
          width={cell.size}
          height={cell.size}
          className="fill-background-soft stroke-border-soft"
          strokeWidth={1}
        />
      ))}
      {geometry.arrows.map((arrow) => (
        <g key={arrow.id} data-testid={`arrow-${arrow.id}`}>
          {arrow.points.length > 1 ? (
            <polyline
              points={pointsAttr(arrow.points)}
              fill="none"
              stroke={arrow.color}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          <polygon points={pointsAttr(arrow.head)} fill={arrow.color} />
        </g>
      ))}
    </svg>
  );
}
