import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3DonutBreakdownChart = ({
  data = [],
  labelKey = 'label',
  valueKey = 'value',
  height = 240,
  title = 'Category & Store Distribution',
  subtitle = 'Breakdown of campus commerce activity',
}) => {
  const containerRef = useRef(null);
  const [activeSlice, setActiveSlice] = useState(null);

  const colors = [
    '#1d1d1f',
    '#8e6e7d',
    '#594951',
    '#bfa3af',
    '#86868b',
    '#d1c2c9',
    '#333336',
  ];

  const totalValue = data.reduce((acc, d) => acc + (Number(d[valueKey]) || 0), 0);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    d3.select(containerRef.current).select('svg').remove();

    const width = containerRef.current.clientWidth || 280;
    const chartHeight = height;
    const radius = Math.min(width, chartHeight) / 2 - 15;
    const innerRadius = radius * 0.65;

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', chartHeight)
      .attr('viewBox', `0 0 ${width} ${chartHeight}`)
      .attr('class', 'overflow-visible');

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${chartHeight / 2})`);

    const colorScale = d3
      .scaleOrdinal()
      .domain(data.map((d) => d[labelKey]))
      .range(colors);

    const pie = d3
      .pie()
      .value((d) => Number(d[valueKey]) || 0)
      .sort(null)
      .padAngle(0.03);

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius).cornerRadius(4);
    const arcHover = d3.arc().innerRadius(innerRadius).outerRadius(radius + 6).cornerRadius(6);

    const arcs = g
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc cursor-pointer');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colors[i % colors.length])
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover)
          .attr('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.12))');
        setActiveSlice(d.data);
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .attr('filter', 'none');
        setActiveSlice(null);
      })
      .transition()
      .duration(750)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t));
        };
      });

  }, [data, labelKey, valueKey, height]);

  return (
    <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
          {subtitle}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight mb-2">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 my-auto py-2">
        {/* Donut SVG */}
        <div className="sm:col-span-7 relative flex items-center justify-center">
          <div ref={containerRef} className="w-full flex items-center justify-center" />
          
          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSlice ? (
              <>
                <span className="text-[10px] text-[#86868b] uppercase font-bold truncate max-w-[90px]">
                  {activeSlice[labelKey]}
                </span>
                <span className="text-sm font-extrabold text-[#1d1d1f]">
                  {Number(activeSlice[valueKey]).toLocaleString()}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9px] text-[#86868b] uppercase font-bold tracking-widest">
                  Total
                </span>
                <span className="text-base font-black text-[#1d1d1f]">
                  {totalValue.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="sm:col-span-5 space-y-2">
          {data.slice(0, 5).map((item, idx) => {
            const pct = totalValue > 0 ? Math.round((item[valueKey] / totalValue) * 100) : 0;
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1 border-b border-[#f5f5f7] last:border-0"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  />
                  <span className="text-[#1d1d1f] font-medium truncate">{item[labelKey]}</span>
                </div>
                <span className="text-[#86868b] font-bold text-[11px] shrink-0 ml-2">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default D3DonutBreakdownChart;
