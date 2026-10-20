import { COLOR_HEX, matchesQuery } from '../../lib/exercises/visualCount';
import type { Shape, ShapeKind, VisualCountExercise } from '../../lib/types';

interface ShapeFieldProps {
  exercise: VisualCountExercise;
  reveal: boolean;
}

function polygonPoints(n: number, r: number, startAngle = -Math.PI / 2): string {
  return Array.from({ length: n }, (_, i) => {
    const a = startAngle + (i * 2 * Math.PI) / n;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');
}

function starPoints(r: number): string {
  const inner = r * 0.46;
  return Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : inner;
    return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
  }).join(' ');
}

function ShapeGlyph({ kind, r }: { kind: ShapeKind; r: number }) {
  switch (kind) {
    case 'circle':
      return <circle r={r * 0.92} />;
    case 'square': {
      const s = r * 0.78;
      return <rect x={-s} y={-s} width={2 * s} height={2 * s} rx={r * 0.12} />;
    }
    case 'triangle':
      return <polygon points={polygonPoints(3, r)} />;
    case 'star':
      return <polygon points={starPoints(r * 1.05)} />;
    case 'diamond':
      return <polygon points={`0,${-r} ${r * 0.68},0 0,${r} ${-r * 0.68},0`} />;
    case 'hexagon':
      return <polygon points={polygonPoints(6, r * 0.95, 0)} />;
  }
}

export function ShapeField({ exercise, reveal }: ShapeFieldProps) {
  const { width, height, shapes, queries } = exercise;
  const matches = (s: Shape) => queries.some((q) => matchesQuery(s, q));
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="no-select h-full w-full"
      role="img"
      aria-label={`${shapes.length} coloured shapes`}
    >
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} rx="6" fill="#ffffff" stroke="#e3e7ed" strokeWidth="0.6" />
      {shapes.map((s) => {
        const hit = reveal && matches(s);
        return (
          <g
            key={s.id}
            transform={`translate(${s.x} ${s.y}) rotate(${s.rotation})`}
            fill={COLOR_HEX[s.color]}
            opacity={reveal && !hit ? 0.16 : 1}
            stroke={hit ? '#141a24' : 'none'}
            strokeWidth={hit ? 1 : 0}
            strokeLinejoin="round"
            style={{ transition: 'opacity 250ms ease' }}
          >
            <ShapeGlyph kind={s.kind} r={s.r} />
          </g>
        );
      })}
    </svg>
  );
}
