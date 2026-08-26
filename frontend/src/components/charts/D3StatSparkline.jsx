import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const D3StatSparkline = ({
  data = [12, 18, 15, 25, 22, 30, 28, 42, 38, 55],
  color = '#8e6e7d',
  width = 90,
  height = 32,
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const x = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([2, width - 2]);

    const y = d3
      .scaleLinear()
      .domain([d3.min(data) * 0.9, d3.max(data) * 1.1])
      .range([height - 2, 2]);

    const line = d3
      .line()
      .x((d, i) => x(i))
      .y((d) => y(d))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // End pulse dot
    const lastX = x(data.length - 1);
    const lastY = y(data[data.length - 1]);

    svg
      .append('circle')
      .attr('cx', lastX)
      .attr('cy', lastY)
      .attr('r', 3)
      .attr('fill', color);
  }, [data, color, width, height]);

  return <svg ref={svgRef} className="overflow-visible inline-block shrink-0" />;
};

export default D3StatSparkline;
