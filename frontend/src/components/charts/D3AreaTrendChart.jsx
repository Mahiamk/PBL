import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3AreaTrendChart = ({
  data = [],
  xKey = 'date',
  yKey = 'total',
  color = '#8e6e7d',
  gradientFrom = '#f5edf0',
  gradientTo = '#ffffff00',
  height = 240,
  currency = 'RM',
  title = 'Revenue & Activity Trend',
  subtitle = 'Real-time performance analytics',
}) => {
  const containerRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    // Clear previous render
    d3.select(containerRef.current).select('svg').remove();

    const containerWidth = containerRef.current.clientWidth || 500;
    const margin = { top: 20, right: 20, bottom: 35, left: 45 };
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

    // Gradient Definitions
    const defs = svg.append('defs');
    const gradId = `d3-area-grad-${Math.random().toString(36).substr(2, 9)}`;
    const gradient = defs
      .append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.28);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.0);

    // Scales
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d[xKey]))
      .range([0, width])
      .padding(0.1);

    const yMax = d3.max(data, (d) => Number(d[yKey]) || 0) || 100;
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

    // Area generator
    const area = d3
      .area()
      .x((d) => x(d[xKey]))
      .y0(chartHeight)
      .y1((d) => y(Number(d[yKey]) || 0))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Line generator
    const line = d3
      .line()
      .x((d) => x(d[xKey]))
      .y((d) => y(Number(d[yKey]) || 0))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Append Area with animation
    const areaPath = g
      .append('path')
      .datum(data)
      .attr('fill', `url(#${gradId})`)
      .attr('d', area);

    // Append Line
    const linePath = g
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Path Animation
    const totalLength = linePath.node().getTotalLength();
    linePath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // Hover overlay elements
    const focus = g.append('g').style('display', 'none');

    const verticalLine = focus
      .append('line')
      .attr('stroke', '#dfd5da')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', chartHeight);

    const focusCircle = focus
      .append('circle')
      .attr('r', 5.5)
      .attr('fill', '#1d1d1f')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))');

    // Invisible mouse tracking overlay
    const overlay = g
      .append('rect')
      .attr('width', width)
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        setHoveredPoint(null);
      })
      .on('mousemove', (event) => {
        const [xm] = d3.pointer(event);
        // Find nearest point
        const domain = x.domain();
        const range = x.range();
        const eachBand = (range[1] - range[0]) / (domain.length - 1 || 1);
        const index = Math.round(xm / eachBand);
        const clampedIndex = Math.max(0, Math.min(domain.length - 1, index));
        const selectedData = data[clampedIndex];

        if (selectedData) {
          const posX = x(selectedData[xKey]);
          const posY = y(Number(selectedData[yKey]) || 0);

          verticalLine.attr('x1', posX).attr('x2', posX);
          focusCircle.attr('cx', posX).attr('cy', posY);

          setHoveredPoint({
            x: posX + margin.left,
            y: posY + margin.top,
            data: selectedData,
          });
        }
      });

    // Resize handler
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth - margin.left - margin.right;
        x.range([0, Math.max(newWidth, 100)]);
        overlay.attr('width', Math.max(newWidth, 100));
        verticalLine.attr('y2', chartHeight);
        areaPath.attr('d', area);
        linePath.attr('d', line);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, xKey, yKey, color, height]);

  return (
    <div className="bg-white rounded-3xl border border-[#e8e8ed] p-5 sm:p-6 shadow-xs relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e6e7d] block">
            {subtitle}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight">
            {title}
          </h3>
        </div>

        {/* Hover readout badge */}
        {hoveredPoint ? (
          <div className="inline-flex items-center space-x-2 bg-[#f5edf0] border border-[#e6dadf] px-3 py-1 rounded-full text-xs font-bold text-[#594951] animate-in fade-in duration-150">
            <span>{hoveredPoint.data[xKey]}:</span>
            <span className="text-[#1d1d1f]">
              {currency} {Number(hoveredPoint.data[yKey] || 0).toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-1.5 text-xs text-[#86868b]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live D3 Feed</span>
          </div>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div ref={containerRef} className="w-full relative min-h-[180px]" />
    </div>
  );
};

export default D3AreaTrendChart;
