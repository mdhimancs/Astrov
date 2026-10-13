import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PlanetPosition } from '../types';

interface InteractionChartProps {
  transitPlanets: PlanetPosition[];
  natalPlanets: PlanetPosition[];
}

export const TransitNatalInteractionChart: React.FC<InteractionChartProps> = ({ transitPlanets, natalPlanets }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 30, left: 40 };

    interface InteractionPoint {
      natalPlanet: string;
      count: number;
    }

    // Simple interaction logic: count transiting planets in the same sign as natal planets
    const interactionData: InteractionPoint[] = natalPlanets.map((np) => {
      const transitingInSign = transitPlanets.filter((tp) => tp.rasiNumber === np.rasiNumber && tp.name !== 'Lagna');
      return {
        natalPlanet: np.name,
        count: transitingInSign.length,
      };
    }).filter(d => d.count > 0);

    const x = d3.scaleBand()
      .domain(interactionData.map(d => d.natalPlanet))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const maxCount = d3.max(interactionData, (d: InteractionPoint) => d.count) ?? 1;
    const y = d3.scaleLinear()
      .domain([0, Number(maxCount) + 1])
      .range([height - margin.bottom, margin.top]);

    svg.append('g')
      .selectAll<SVGRectElement, InteractionPoint>('rect')
      .data(interactionData)
      .enter()
      .append('rect')
      .attr('x', (d: InteractionPoint) => x(d.natalPlanet)!)
      .attr('y', (d: InteractionPoint) => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', (d: InteractionPoint) => height - margin.bottom - y(d.count))
      .attr('fill', '#d97706'); // amber-600

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(3));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Transiting Planets Interacting with Natal Planets');

  }, [transitPlanets, natalPlanets]);

  return <svg ref={svgRef} viewBox="0 0 400 300" className="w-full h-auto bg-white rounded-lg border border-stone-200" />;
};
