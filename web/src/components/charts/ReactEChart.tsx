import type { EChartsOption, SetOptionOpts } from 'echarts';
import { PieChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import useResize from 'hooks/useResize';

echarts.use([PieChart, GridComponent, CanvasRenderer]);

export interface EchartsEventFunction {
  eventName: echarts.ElementEvent['type'];
  query?: string | object;
  handler: (param: echarts.ECElementEvent) => void;
}

interface Props {
  option: EChartsOption;
  eventFunctions?: EchartsEventFunction[];
  settings?: SetOptionOpts;
  style?: CSSProperties;
  group?: string;
}

function ReactECharts({ option, style, group, settings = {}, eventFunctions }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, height] = useResize(chartRef);
  const [echart, setEchart] = useState<echarts.ECharts | undefined>(undefined);

  useEffect(() => {
    if (chartRef.current && !echart) {
      const chart = echarts.init(chartRef.current, null, { renderer: 'canvas', useDirtyRect: false });
      for (const eventFunc of eventFunctions ?? []) {
        chart.on(eventFunc.eventName, eventFunc.query ?? '', eventFunc.handler);
      }
      chart.getZr().on('dblclick', () => {
        chart.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
      });
      if (group) {
        chart.group = group;
        echarts.connect(group);
      }
      setEchart(chart);
    }

    return () => {
      echart?.dispose();
    };
  }, [echart, group, eventFunctions]);

  useEffect(() => {
    echart?.resize({ width, height });
  }, [echart, height, width]);

  useEffect(() => {
    echart?.setOption(option, {
      ...settings,
      replaceMerge: ['xAxis', 'yAxis', 'series'],
    });
  }, [echart, option, settings]);

  return (
    <div
      ref={chartRef}
      style={{
        height: '100%',
        position: 'relative',
        width: '100%',
        ...style,
      }}
    />
  );
}

export default ReactECharts;
