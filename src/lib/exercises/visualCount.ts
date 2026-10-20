import { shapesParams } from '../difficulty';
import { pick, randInt, shuffle, uid, type Rng } from '../random';
import type { ColorName, Shape, ShapeKind, ShapeQuery, VisualCountExercise } from '../types';

/** Introduction order: the first few are the easiest to tell apart. */
export const SHAPE_KINDS: readonly ShapeKind[] = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon'];
export const COLOR_ORDER: readonly ColorName[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'teal'];

export const COLOR_HEX: Record<ColorName, string> = {
  red: '#e5484d',
  blue: '#3e63dd',
  green: '#30a46c',
  yellow: '#f0b429',
  purple: '#8e4ec6',
  orange: '#f76b15',
  pink: '#e93d82',
  teal: '#12a594',
};

const PLURAL: Record<ShapeKind, string> = {
  circle: 'circles',
  square: 'squares',
  triangle: 'triangles',
  star: 'stars',
  diamond: 'diamonds',
  hexagon: 'hexagons',
};

export const FIELD_W = 100;
export const FIELD_H = 118;

export function matchesQuery(shape: Pick<Shape, 'color' | 'kind'>, q: ShapeQuery): boolean {
  return (!q.color || shape.color === q.color) && (!q.kind || shape.kind === q.kind);
}

export function describeQuery(q: ShapeQuery): string {
  if (q.color && q.kind) return `${q.color} ${PLURAL[q.kind]}`;
  if (q.kind) return PLURAL[q.kind];
  if (q.color) return `${q.color} shapes`;
  return 'shapes';
}

function sameQuery(a: ShapeQuery, b: ShapeQuery): boolean {
  return a.color === b.color && a.kind === b.kind;
}

interface Spec {
  color: ColorName;
  kind: ShapeKind;
}

export function generateVisualCount(level: number, rng: Rng): VisualCountExercise {
  const p = shapesParams(level);
  const colors = COLOR_ORDER.slice(0, p.colors);
  const kinds = SHAPE_KINDS.slice(0, p.kinds);
  const singleAttribute = level <= 2;

  // 1. Queries.
  const queries: ShapeQuery[] = [];
  let guard = 0;
  while (queries.length < p.queries && guard++ < 100) {
    const q: ShapeQuery = singleAttribute
      ? rng() < 0.5
        ? { kind: pick(rng, kinds) }
        : { color: pick(rng, colors) }
      : { color: pick(rng, colors), kind: pick(rng, kinds) };
    if (!queries.some((e) => sameQuery(e, q))) queries.push(q);
  }

  // 2. How many shapes match each query.
  const maxPer = Math.max(3, Math.min(14, Math.round((p.count * (singleAttribute ? 0.45 : 0.3)) / queries.length)));
  const minPer = level >= 5 ? 1 : 2;
  const answers = queries.map(() => (p.allowZero && rng() < 0.15 ? 0 : randInt(rng, minPer, maxPer)));

  const matchesAny = (s: Spec) => queries.some((q) => matchesQuery(s, q));
  const specs: Spec[] = [];

  queries.forEach((q, i) => {
    for (let k = 0; k < answers[i]!; k++) {
      specs.push({ color: q.color ?? pick(rng, colors), kind: q.kind ?? pick(rng, kinds) });
    }
  });

  // 3. Distractors: shapes that share one attribute with a query, then random
  //    shapes that match nothing.
  const remaining = Math.max(0, p.count - specs.length);
  const nPartial = Math.round(remaining * p.distractorRatio);
  const randomNonMatching = (): Spec | null => {
    for (let t = 0; t < 40; t++) {
      const s = { color: pick(rng, colors), kind: pick(rng, kinds) };
      if (!matchesAny(s)) return s;
    }
    return null;
  };
  for (let i = 0; i < remaining; i++) {
    let spec: Spec | null = null;
    if (i < nPartial) {
      const q = pick(rng, queries);
      if (q.color && q.kind) {
        for (let t = 0; t < 20 && !spec; t++) {
          const candidate =
            rng() < 0.5
              ? { color: q.color, kind: pick(rng, kinds.filter((k) => k !== q.kind)) }
              : { color: pick(rng, colors.filter((c) => c !== q.color)), kind: q.kind };
          if (!matchesAny(candidate)) spec = candidate;
        }
      }
    }
    spec = spec ?? randomNonMatching();
    if (spec) specs.push(spec);
  }

  // 4. Layout.
  const ordered = shuffle(rng, specs);
  const base = Math.sqrt((FIELD_W * FIELD_H) / ordered.length) * 0.28;
  const shapes: Shape[] = [];
  const place = (r: number) => {
    const margin = r + 1.5;
    let best = { x: FIELD_W / 2, y: FIELD_H / 2, gap: -Infinity };
    for (let t = 0; t < 300; t++) {
      const x = margin + rng() * (FIELD_W - 2 * margin);
      const y = margin + rng() * (FIELD_H - 2 * margin);
      let gap = Infinity;
      for (const o of shapes) {
        const d = Math.hypot(o.x - x, o.y - y) - (o.r + r) * (1.15 - p.overlap);
        if (d < gap) gap = d;
      }
      if (gap > best.gap) best = { x, y, gap };
      if (gap >= 0) break;
    }
    return best;
  };
  ordered.forEach((spec, id) => {
    let r = Math.max(2.4, base * (1 + (rng() * 2 - 1) * p.sizeVariance));
    let best = place(r);
    // When overlap is not allowed, shrink the shape rather than let it touch.
    for (let shrink = 0; shrink < 4 && best.gap < 0 && p.overlap === 0; shrink++) {
      r = Math.max(2.4, r * 0.85);
      best = place(r);
    }
    shapes.push({
      id,
      kind: spec.kind,
      color: spec.color,
      x: Math.round(best.x * 10) / 10,
      y: Math.round(best.y * 10) / 10,
      r: Math.round(r * 10) / 10,
      rotation: p.rotate ? randInt(rng, -14, 14) : 0,
    });
  });

  const slots = queries.map((q, i) => ({
    id: `q${i}`,
    label: describeQuery(q),
    answer: answers[i]!,
    color: q.color ? COLOR_HEX[q.color] : undefined,
  }));

  return {
    id: uid(),
    type: 'shapes',
    level,
    prompt: queries.length === 1 ? `How many ${describeQuery(queries[0]!)}?` : 'How many of each?',
    hint: queries.length === 1 ? 'Size does not matter.' : 'Count both. Size does not matter.',
    slots,
    parMs: Math.round(shapes.length * 350 * (0.6 + 0.4 * queries.length)),
    shapes,
    width: FIELD_W,
    height: FIELD_H,
    queries,
  };
}
