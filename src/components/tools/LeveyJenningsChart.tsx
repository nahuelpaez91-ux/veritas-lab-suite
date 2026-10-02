'use client';

import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartTick, chartTooltip, figCaption, figTag } from './chartStyle';

export type LjDatum = { run: string } & Record<string, number | string>;

type DotProps = { cx?: number; cy?: number; index?: number };

function marker(shape: 'circle' | 'square', color: string) {
  return function Dot({ cx, cy, index }: DotProps) {
    if (typeof cx !== 'number' || typeof cy !== 'number') return <g key={index} />;
    return shape === 'circle' ? (
      <circle key={index} cx={cx} cy={cy} r={3.4} fill="var(--color-surface)" stroke={color} strokeWidth={1.6} />
    ) : (
      <rect key={index} x={cx - 3} y={cy - 3} width={6} height={6} fill={color} />
    );
  };
}

// N1: tinta con círculo hueco · N2: lacre con cuadrado lleno (se distinguen también sin color).
const SERIES = [
  { color: 'var(--color-ink)', legend: 'circle', dot: marker('circle', 'var(--color-ink)') },
  { color: 'var(--color-accent)', legend: 'square', dot: marker('square', 'var(--color-accent)') },
] as const;


export function LeveyJenningsChart({
  data,
  levels,
  title,
  offScaleLabel,
}: {
  data: LjDatum[];
  levels: string[];
  title: string;
  offScaleLabel: string;
}) {
  return (
    <figure className="w-full">
      <figcaption className={figCaption}>
        <b className={figTag}>Fig. 2-a</b>
        {title}
      </figcaption>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -16 }}>
            <ReferenceArea y1={-1} y2={1} fill="var(--color-bg)" fillOpacity={1} stroke="none" ifOverflow="hidden" />
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="1 3" vertical={false} />
            <XAxis dataKey="run" tick={chartTick} stroke="var(--color-line)" tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[-4, 4]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={chartTick} stroke="var(--color-line)" tickLine={false} />
            <ReferenceLine y={3} stroke="var(--color-danger)" strokeWidth={1.2} />
            <ReferenceLine y={-3} stroke="var(--color-danger)" strokeWidth={1.2} />
            <ReferenceLine y={2} stroke="var(--color-warn)" strokeDasharray="4 3" />
            <ReferenceLine y={-2} stroke="var(--color-warn)" strokeDasharray="4 3" />
            <ReferenceLine y={0} stroke="var(--color-ink)" strokeWidth={1} />
            <Tooltip
              {...chartTooltip}
              formatter={(value, name, item) => {
                const payload = item?.payload as LjDatum | undefined;
                const key = typeof item?.dataKey === 'string' ? item.dataKey : typeof name === 'string' ? name : undefined;
                const real = payload && key ? payload[`${key}_real`] : undefined;
                const shown = typeof real === 'number' ? real : value;
                const text = typeof shown === 'number' ? shown.toFixed(2) : String(shown ?? '');
                const clamped = typeof real === 'number' && typeof value === 'number' && real !== value;
                return clamped ? `${text}${offScaleLabel}` : text;
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} iconSize={10} />
            {levels.map((level, i) => {
              const series = SERIES[i % SERIES.length];
              return (
                <Line
                  key={level}
                  type="linear"
                  dataKey={level}
                  stroke={series.color}
                  strokeWidth={1.4}
                  legendType={series.legend}
                  dot={series.dot}
                  activeDot={{ r: 5, stroke: series.color, fill: 'var(--color-surface)' }}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
