import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3BarComparisonChart = ({
  data = [],
  xKey = 'label',
  yKey = 'value',
  color = '#1d1d1f',
  height = 240,
  title = 'Performance Comparison',
  subtitle = 'Daily volume & orders',
  unit = '',
}) => {
  const containerRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    d3.select(containerRef.current).select('svg').remove();

    const containerWidth = containerRef.current.clientWidth || 500;
    const margin = { top: 20, right: 20, bottom: 35, left: 40 };
    const width = containerWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`)
      .attr('class', 'overflow-visible');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d[xKey]))
      .range([0, width])
      .padding(0.35);

    // Y Scale
    const yMax = d3.max(data, (d) => Number(d[yKey]) || 0) || 10;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .range([chartHeight, 0])
      .nice();

    // Horizontal Grid Lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-width)
          .tickFormat('')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke', '#e8e8ed')
          .attr('stroke-dasharray', '3,3')
      );

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .call((g) => g.select('.domain').attr('stroke', '#e8e8ed'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#86868b')
          .attr('font-size', '10px')
          .attr('font-family', 'inherit')
      );

    // Y Axis
    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(0)
          .tickPadding(8)
          .tickFormat((d) => `${d >= 1000 ? `${(d / 1000).toFixed(1)}k` : d}`)
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#86868b')
          .attr('font-size', '10px')
          .attr('font-family', 'inherit')
      );

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar cursor-pointer transition-all duration-200')
      .attr('x', (d) => x(d[xKey]))
      .attr('width', x.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', (d, i) => (i === data.length - 1 ? color : '#e8e8ed'))
      .on('mouseover', function (event, d) {
        d3.select(this).attr('fill', '#8e6e7d');
        setHoveredBar(d);
      })
      .on('mouseout', function (event, d) {
        const i = data.indexOf(d);
        d3.select(this).attr('fill', i === data.length - 1 ? color : '#e8e8ed');
        setHoveredBar(null);
      })
      .transition()
      .duration(750)
      .delay((d, i) => i * 40)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => y(Number(d[yKey]) || 0))
      .attr('height', (d) => chartHeight - y(Number(d[yKey]) || 0));

  }, [data, xKey, yKey, color, height]);

  return (
    <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 sm:p-6 shadow-xs relative flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
            {subtitle}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight">
            {title}
          </h3>
        </div>

        {hoveredBar ? (
          <div className="inline-flex items-center space-x-2 bg-[#f5edf0] border border-[#e6dadf] px-3 py-1 rounded-full text-xs font-bold text-[#594951]">
            <span>{hoveredBar[xKey]}:</span>
            <span className="text-[#1d1d1f]">
              {Number(hoveredBar[yKey] || 0).toLocaleString()} {unit}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[#86868b] font-medium">Weekly summary</span>
        )}
      </div>

      <div ref={containerRef} className="w-full relative min-h-[180px]" />
    </div>
  );
};

export default D3BarComparisonChart;
