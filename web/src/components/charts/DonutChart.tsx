import { useMemo } from 'react';
import ReactECharts from 'components/charts/ReactEChart';
import type { EChartsOption, PieSeriesOption } from 'echarts';

interface Props {
  data: PieSeriesOption['data'];
}

function DonutChart({ data }: Props) {
  const option: EChartsOption = useMemo(() => {
    return {
      series: [
        {
          type: 'pie',
          selectedMode: 'single',
          radius: ['80%', '95%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}', position: 'inside', fontSize: 20 },
          data,
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} settings={{ notMerge: true }} />;
}

export default DonutChart;
