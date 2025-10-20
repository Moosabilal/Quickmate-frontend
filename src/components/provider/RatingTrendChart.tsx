import React, { useState, useEffect, useRef } from 'react';
import { RatingTrendChartProps } from '../../util/interface/IProvider';

export const RatingTrendChart: React.FC<RatingTrendChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; month: string; value: number } | null>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [data]);

    const chartHeight = 160;
    const chartWidth = 500;
    const maxRating = 5;

    const points = data.map((trend, index) => {
        const x = index * (chartWidth / (data.length - 1 || 1));
        const y = chartHeight - (trend.value / maxRating) * chartHeight;
        return { x, y, ...trend };
    });

    const pathD = points.reduce((acc, point, i, arr) => {
        if (i === 0) {
            return `M ${point.x},${point.y}`;
        }
        const prevPoint = arr[i - 1];
        const cp1x = (prevPoint.x + point.x) / 2;
        const cp1y = prevPoint.y;
        const cp2x = (prevPoint.x + point.x) / 2;
        const cp2y = point.y;
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
    }, "");

    const areaPathD = `${pathD} V ${chartHeight} H ${points[0].x} Z`;

    return (
        <div className="relative h-40 md:h-48 pt-4">
            {tooltip && (
                <div
                    className="absolute z-10 p-2 text-xs font-bold text-white bg-gray-900 rounded-md shadow-lg transition-transform pointer-events-none"
                    style={{
                        left: `${tooltip.x}px`,
                        top: `${tooltip.y}px`,
                        transform: `translate(-50%, -120%)`
                    }}
                >
                    {tooltip.month}: {tooltip.value.toFixed(1)} ★
                </div>
            )}
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#c4b5fd" />
                    </filter>
                </defs>
                <style>
                    {`
                        @keyframes draw {
                            from { stroke-dashoffset: ${pathLength}; }
                            to { stroke-dashoffset: 0; }
                        }
                        .animated-path {
                            stroke-dasharray: ${pathLength};
                            stroke-dashoffset: ${pathLength};
                            animation: draw 1.5s ease-out forwards;
                        }
                    `}
                </style>
                <path d={areaPathD} fill="url(#areaGradient)" style={{ filter: 'url(#glow)' }} />
                <path
                    ref={pathRef}
                    d={pathD}
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animated-path"
                />
                
                {points.map((point, index) => (
                    <g key={index}>
                        <circle cx={point.x} cy={point.y} r={tooltip?.month === point.month ? 6 : 0} fill="#c4b5fd" className="transition-all" />
                        <rect x={point.x - 15} y={0} width="30" height={chartHeight} fill="transparent" onMouseEnter={() => setTooltip(point)} onMouseLeave={() => setTooltip(null)} />
                    </g>
                ))}
            </svg>
            <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-2 text-xs text-gray-500 font-medium">
                {data.map((trend) => (
                    <span key={trend.month} className="flex-1 text-center">
                        {trend.month}
                    </span>
                ))}
            </div>
        </div>
    );
};