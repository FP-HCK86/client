import React, { useState, useEffect } from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Loader2, AlertTriangle, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { radarChartAPI } from '../api/radarChart';

/**
 * RadarChart Component for Content Style Analysis
 * @desc Displays content distribution by contentStyle from personas using MUI X Charts
 * Note: Since MUI X Charts doesn't have native radar charts, we'll use a combination of bar and pie charts
 * @param {Object} props - Component props
 * @param {number} props.height - Height of the chart (default: 300)
 * @param {boolean} props.showLegend - Whether to show legend (default: true)
 * @param {string} props.variant - Chart variant: 'user' or 'global' (default: 'user')
 * @param {string} props.chartType - Type of chart: 'bar' or 'pie' (default: 'bar')
 */
const RadarChart = ({ 
  height = 300, 
  showLegend = true,
  variant = 'user',
  chartType = 'bar'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [currentChartType, setCurrentChartType] = useState(chartType);

  useEffect(() => {
    const fetchRadarData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`=== RADAR CHART: Fetching ${variant} data ===`);
        
        // Choose API method based on variant
        const apiMethod = variant === 'global' 
          ? radarChartAPI.getGlobalData 
          : radarChartAPI.getCombinedData;
          
        const response = await apiMethod();
        
        if (response && response.radarChart) {
          const { labels, datasets } = response.radarChart;
          const dataset = datasets[0];
          
          // Prepare data for both bar and pie charts
          const data = labels.map((label, index) => ({
            label: label,
            value: dataset.data[index],
            id: index,
          })).filter(item => item.value > 0); // Only show non-zero values

          // Generate soft pastel colors for the chart
          const colors = [
            '#E8BBE7',  // Soft lavender
            '#B8E6D3',  // Soft mint
            '#FFE4B5',  // Soft peach
            '#F0E68C',  // Soft khaki
            '#DDA0DD',  // Soft plum
            '#98D8C8',  // Soft seafoam
            '#F7DC6F',  // Soft yellow
            '#F1948A'   // Soft coral
          ];

          setChartData({
            data,
            colors: colors.slice(0, data.length),
            rawData: dataset.data,
            labels
          });
          
          setSummary(response.summary);
          
          console.log('=== RADAR CHART: Data processed successfully ===', {
            dataPoints: data.length,
            totalContent: response.summary?.totalPostedSchedules || 0,
            nonZeroCategories: data.length
          });
          
        } else {
          throw new Error('Invalid radar chart data format');
        }
        
      } catch (error) {
        console.error('Error fetching radar chart data:', error);
        setError(error.message || 'Failed to load radar chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchRadarData();
  }, [variant]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-gray-500">Loading content analysis...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600 text-center max-w-sm">
          {error}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Please check your connection and try again
        </p>
      </div>
    );
  }

  // No data state
  if (!chartData || !summary || summary.totalPostedSchedules === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
        <TrendingUp className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500 text-center">
          No analyzed content yet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Chart will appear when you have posted content with personas
        </p>
      </div>
    );
  }

  // Render chart based on type
  const renderChart = () => {
    if (currentChartType === 'pie') {
      return (
        <PieChart
          series={[
            {
              data: chartData.data,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            },
          ]}
          height={height}
          slotProps={{
            legend: showLegend ? {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
            } : { hidden: true },
          }}
        />
      );
    } else {
      return (
        <BarChart
          dataset={chartData.data}
          xAxis={[{ 
            scaleType: 'band', 
            dataKey: 'label',
            tickLabelStyle: {
              angle: -45,
              textAnchor: 'end',
              fontSize: 10,
            }
          }]}
          series={[
            {
              dataKey: 'value',
              label: 'Posted Content',
              color: '#B8E6D3', // Soft mint color
            },
          ]}
          height={height}
          slotProps={{
            legend: showLegend ? {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
            } : { hidden: true },
          }}
        />
      );
    }
  };

  return (
    <div className="w-full">
      {/* Header with Chart Type Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <span>
            <strong>{summary.totalPostedSchedules}</strong> analyzed posts
          </span>
          <span>
            <strong>{summary.matchedWithPersonas || 0}</strong> with personas
          </span>
          {variant === 'global' && summary.totalUsers && (
            <span>
              <strong>{summary.totalUsers}</strong> users
            </span>
          )}
        </div>
        
        {/* Chart Type Toggle */}
        <div className="flex gap-1 border rounded-lg p-1">
          <button
            onClick={() => setCurrentChartType('bar')}
            className={`p-1.5 rounded ${
              currentChartType === 'bar' 
                ? 'bg-black text-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Bar Chart"
          >
            <BarChart3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => setCurrentChartType('pie')}
            className={`p-1.5 rounded ${
              currentChartType === 'pie' 
                ? 'bg-black text-white' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Pie Chart"
          >
            <PieChartIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ height: `${height}px` }} className="w-full">
        {renderChart()}
      </div>

      {/* Content Style Breakdown */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Content Distribution</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {Object.entries(summary.contentStyleBreakdown || {})
            .filter(([_, count]) => count > 0)
            .map(([style, count]) => (
            <div key={style} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600 capitalize">
                {style.replace(/_/g, ' ')}
              </span>
              <span className="font-medium text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
