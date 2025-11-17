import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useStore, { RootState } from '../../Store/store';
import CircularProgress from '../../Components/CircularProgress/CircularProgress';
import socketService from '../../services/__socketService';
import { 
  FaFileAlt, 
  FaChartLine, 
  FaUsers,
  FaShareAlt
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EngagementChartItem {
  date: string | Date;
  value: number;
}

interface SocketUpdateData {
  engagement_chart?: EngagementChartItem[];
  total_engagement?: {
    last_30_days?: number;
  };
}

interface DashboardCardData {
  id: number;
  title: string;
  count: number | string;
  bgColor: string;
  icon: JSX.Element;
}

interface DashboardCountData {
  id: number;
  title: string;
  count: number;
  percentCount: number;
  bgColor: string;
  progressMainColor: string;
  icon: JSX.Element;
}

interface ChartData {
  labels: string[];
  dailyValues: number[];
  cumulativeValues: number[];
}

const Dashboard: React.FC = () => {
  const overview = useStore((state: RootState) => state.overview);
  const isLoadingOverview = useStore((state: RootState) => state.isLoadingOverview);
  const getOverview = useStore((state: RootState) => state.getOverview);
  const updateOverview = useStore((state: RootState) => state.updateOverview);
  const isMountedRef = useRef<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const chartRef = useRef<any>(null);
  
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    // This will only run once per component mount
    if (isMountedRef.current) {
      return;
    }
    
    isMountedRef.current = true;
    getOverview();
  }, [getOverview]);

  // Socket.IO connection and real-time updates
  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect(
      () => {
        setIsSocketConnected(true);
      },
      (reason: string) => {
        setIsSocketConnected(false);
      },
      (error: any) => {
        setIsSocketConnected(false);
      }
    );

    // Subscribe to engagement chart updates
    const handleEngagementChartUpdate = (data: SocketUpdateData): void => {
      // Silently update chart without causing page reload
      if (!data.engagement_chart || !Array.isArray(data.engagement_chart)) {
        return;
      }
      
      // Get current overview from store
      const currentOverview = useStore.getState().overview;
      if (!currentOverview) {
        return;
      }
      
      // Update chart directly using Chart.js instance for smooth, silent update
      // This avoids React re-render and page reload - CRITICAL for smooth UX
      if (chartRef.current) {
        try {
          // Get the Chart.js instance from react-chartjs-2
          // react-chartjs-2 v5+ exposes chart via getChart() method or directly
          let chartInstance: any = null;
          
          if (chartRef.current.getChart) {
            chartInstance = chartRef.current.getChart();
          } else if (chartRef.current.chartInstance) {
            chartInstance = chartRef.current.chartInstance;
          } else if (chartRef.current.chart) {
            chartInstance = chartRef.current.chart;
          } else if (chartRef.current && typeof chartRef.current.update === 'function') {
            chartInstance = chartRef.current;
          }
          
          if (chartInstance && chartInstance.data && chartInstance.data.datasets && chartInstance.data.datasets.length >= 2) {
            // Prepare new chart data silently (same logic as chartData useMemo)
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day
            
            const dataMap = new Map<string, number>();
            data.engagement_chart.forEach((item: EngagementChartItem) => {
              // Handle date parsing - backend sends dates as "YYYY-MM-DD" strings
              let dateKey: string;
              if (item.date instanceof Date) {
                const d = new Date(item.date);
                d.setHours(0, 0, 0, 0);
                dateKey = d.toISOString().split('T')[0];
              } else if (typeof item.date === 'string') {
                // Backend sends "YYYY-MM-DD" format - use it directly
                // If it's already in YYYY-MM-DD format, use it as-is
                if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
                  dateKey = item.date;
                } else {
                  // Try parsing as ISO string
                  const d = new Date(item.date);
                  if (!isNaN(d.getTime())) {
                    d.setHours(0, 0, 0, 0);
                    dateKey = d.toISOString().split('T')[0];
                  } else {
                    return;
                  }
                }
              } else {
                return;
              }
              
              const value = Number(item.value) || 0;
              dataMap.set(dateKey, value);
            });
            
            const allValues: number[] = [];
            const cumulativeValues: number[] = [];
            let cumulativeSum = 0;
            
            // Generate 30 days of data (last 30 days including today)
            // Use UTC dates to match backend format exactly
            const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            
            for (let i = 29; i >= 0; i--) {
              const date = new Date(todayUTC);
              date.setUTCDate(date.getUTCDate() - i);
              // Format as YYYY-MM-DD (same format as backend)
              const year = date.getUTCFullYear();
              const month = String(date.getUTCMonth() + 1).padStart(2, '0');
              const day = String(date.getUTCDate()).padStart(2, '0');
              const dateKey = `${year}-${month}-${day}`;
              
              const value = dataMap.get(dateKey) || 0;
              cumulativeSum += value;
              allValues.push(value);
              cumulativeValues.push(cumulativeSum);
            }
            
            // Update chart datasets - CRITICAL: Update both data arrays
            // Create new arrays to ensure Chart.js detects the change
            chartInstance.data.datasets[0].data = [...allValues];
            chartInstance.data.datasets[1].data = [...cumulativeValues];
            
            // Force Chart.js to completely recalculate and update
            // First stop any ongoing animations
            chartInstance.stop();
            
            // Force a complete update - this ensures tooltips show correct values
            // Using 'none' mode first to stop animations, then 'default' for full update
            chartInstance.update('none');
            chartInstance.update('default');
            
            // Force tooltip recalculation by triggering a resize event
            // This ensures Chart.js recalculates all parsed values for tooltips
            setTimeout(() => {
              if (chartInstance && chartInstance.resize) {
                chartInstance.resize();
              }
            }, 0);
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      // Update only the total_engagement count in store (for the stat card)
      // IMPORTANT: Do NOT update engagement_chart in store to prevent React re-render
      // The chart is updated directly above, so we only need to update the count display
      if (data.total_engagement?.last_30_days !== undefined) {
        // Update only the total_engagement, keep engagement_chart unchanged to avoid re-render
        const updatedOverview = {
          ...currentOverview,
          total_engagement: {
            ...(currentOverview as any).total_engagement,
            last_30_days: data.total_engagement.last_30_days,
          },
          // Keep existing engagement_chart - don't update it to prevent chart reload
          engagement_chart: (currentOverview as any).engagement_chart,
        };
        // Update store - this will only update the count card, not the chart
        useStore.setState({ 
          overview: updatedOverview 
        });
      }
    };

    socketService.on('engagement_chart_update', handleEngagementChartUpdate);

    // Cleanup on unmount
    return () => {
      socketService.off('engagement_chart_update', handleEngagementChartUpdate);
      // Don't disconnect socket here - it might be used by other components
      // socketService.disconnect();
    };
  }, [updateOverview]); // Only depend on updateOverview, not overview
  
  // Helper function to capitalize platform names
  const capitalizePlatform = useCallback((platform: string | null | undefined): string => {
    if (!platform) return '';
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  }, []);
  
  // Extract overview data with safe defaults
  const overviewData = overview as any;
  const { 
    total_posts = {}, 
    total_engagement = {}, 
    average_engagement_rate = 0, 
    best_performing_platform = null, 
    engagement_chart = [], 
    top_5_posts = [], 
    optimal_posting_times = [] 
  } = overviewData || {};
  
  // Dashboard custom data cards (memoized) - must be before early returns
  const dashboardCustomData = useMemo<DashboardCardData[]>(() => [
    {
      id: 1,
      title: 'Total Posts',
      count: (total_posts as any)?.total || 0,
      bgColor: '#0ACF97',
      icon: <FaFileAlt />
    },
    {
      id: 2,
      title: 'Total Engagement',
      count: (total_engagement as any)?.all_time || 0,
      bgColor: '#3DA5F4',
      icon: <FaChartLine />
    },
    {
      id: 3,
      title: 'Avg Engagement Rate',
      count: `${(average_engagement_rate as number)?.toFixed(2) || 0}%`,
      bgColor: '#FF4979',
      icon: <FaUsers />
    },
    {
      id: 4,
      title: 'Best Platform',
      count: best_performing_platform ? capitalizePlatform(best_performing_platform as string) : 'N/A',
      bgColor: '#FDA006',
      icon: <FaShareAlt />
    }
  ], [total_posts, total_engagement, average_engagement_rate, best_performing_platform, capitalizePlatform]);

  // Dashboard count data with progress bars (memoized) - must be before early returns
  const dashboardCountData = useMemo<DashboardCountData[]>(() => [
    {
      id: 1,
      title: 'Published Posts',
      count: (total_posts as any)?.published || 0,
      percentCount: (total_posts as any)?.total > 0 ? Number((((total_posts as any)?.published / (total_posts as any)?.total) * 100).toFixed(0)) : 0,
      bgColor: '#0ACF97',
      progressMainColor: '#95e4ce',
      icon: <FaFileAlt />
    },
    {
      id: 2,
      title: 'Scheduled Posts',
      count: (total_posts as any)?.scheduled || 0,
      percentCount: (total_posts as any)?.total > 0 ? Number((((total_posts as any)?.scheduled / (total_posts as any)?.total) * 100).toFixed(0)) : 0,
      bgColor: '#3DA5F4',
      progressMainColor: '#97cef8',
      icon: <FaFileAlt />
    },
    {
      id: 3,
      title: 'Draft Posts',
      count: (total_posts as any)?.draft || 0,
      percentCount: (total_posts as any)?.total > 0 ? Number((((total_posts as any)?.draft / (total_posts as any)?.total) * 100).toFixed(0)) : 0,
      bgColor: '#FF4979',
      progressMainColor: '#ff97b2',
      icon: <FaFileAlt />
    },
    {
      id: 4,
      title: 'Last 30 Days Engagement',
      count: (total_engagement as any)?.last_30_days || 0,
      percentCount: (total_engagement as any)?.all_time > 0 ? Number((((total_engagement as any)?.last_30_days / (total_engagement as any)?.all_time) * 100).toFixed(0)) : 0,
      bgColor: '#FDA006',
      progressMainColor: '#fdcc7b',
      icon: <FaChartLine />
    }
  ], [total_posts, total_engagement]);

  // Prepare engagement chart data (last 30 days) - REQUIRED by docs
  // Fill in missing dates and sort by date to show proper progression (memoized) - must be before early returns
  const chartData = useMemo<ChartData>(() => {
    
    const prepareEngagementChartData = (): ChartData => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Create a map of existing data by date
      const dataMap = new Map<string, number>();
      ((engagement_chart as any[]) || []).forEach((item: any) => {
        // Handle both string dates and Date objects
        const date = item.date instanceof Date ? item.date : new Date(item.date);
        if (!isNaN(date.getTime())) {
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          dataMap.set(dateKey, item.value || 0);
        }
      });
      
      // Generate all 30 days with engagement data (fill missing with 0)
      const allDates: Date[] = [];
      const allValues: number[] = [];
      const cumulativeValues: number[] = [];
      let cumulativeSum = 0;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        const value = dataMap.get(dateKey) || 0;
        cumulativeSum += value;
        
        allDates.push(date);
        allValues.push(value);
        cumulativeValues.push(cumulativeSum);
      }
      
      return {
        labels: allDates.map(date => 
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
        dailyValues: allValues,
        cumulativeValues: cumulativeValues,
      };
    };
    return prepareEngagementChartData();
  }, [engagement_chart]);

  // Memoize chart data to ensure it updates when engagement_chart changes
  const engagementChartData = useMemo(() => ({
    labels: chartData.labels,
    datasets: [
      {
        label: 'Daily Engagement',
        data: chartData.dailyValues,
        backgroundColor: 'rgba(61, 165, 244, 0.1)',
        borderColor: '#3DA5F4',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3DA5F4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Cumulative Engagement',
        data: chartData.cumulativeValues,
        backgroundColor: 'rgba(10, 207, 151, 0.1)',
        borderColor: '#0ACF97',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ]
  }), [chartData]);

  const engagementChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 15, // Show every other day to avoid crowding
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Engagement',
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        },
        ticks: {
          stepSize: Math.max(100, Math.ceil(Math.max(...(chartData.dailyValues || [1]), 1) / 10)),
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            // Read directly from dataset data to ensure we get the latest values
            // This ensures tooltips show real-time socket data
            const dataIndex = context.dataIndex;
            const dataset = context.dataset;
            const value = dataset.data && dataset.data[dataIndex] !== undefined 
              ? dataset.data[dataIndex] 
              : context.parsed.y;
            
            if (label === 'Cumulative Engagement') {
              return `${label}: ${Number(value).toLocaleString()}`;
            }
            return `${label}: ${Number(value).toLocaleString()}`;
          }
        }
      }
    }
  }), [chartData.dailyValues]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className='flex flex-col gap-4 p-2'>
      {/* Page Header */}
      <div className='flex justify-between dashboardContainerHeader'>
        <div className=''>
          <span className='text-[18px] font-semibold'>Dashboard</span>
        </div>
      </div>

      <div className='flex flex-col gap-5'>
        {/* Top Stats Cards - Colored Background */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-2 lg:gap-3'>
          {dashboardCustomData.map((ele) => (
            <div key={ele.id} className={`p-2 h-[100px] rounded-lg drop-shadow`} style={{background: ele.bgColor}}>
              <div className='flex items-center gap-4 h-full'>
                <div className=''>
                  <span className='flex items-center justify-center w-[40px] h-[40px] rounded-md bg-white' style={{color: ele.bgColor}}>
                    {ele.icon}
                  </span>
                </div>
                <div className='flex-1 flex flex-col items-center text-white text-[12px]'>
                  <span className='text-[18px] font-semibold'>{ele.count}</span>
                  <span className='flex text-center'>{ele.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Cards with Progress Bars */}
        <div className='bg-[#FEFEFE] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-2 lg:gap-3'>
          {dashboardCountData.map((ele) => (
            <motion.button
              whileHover={{ scale: 1.04 }}
              key={ele.id}
            >
              <div className="p-2 h-[100px] rounded-lg drop-shadow bg-white">
                <div className='w-full h-full flex flex-col justify-between p-2'>
                  <div className='w-full flex items-center justify-between'>
                    <div className='flex flex-col items-center text-[#474747]'>
                      <span className='text-[18px] font-semibold'>{ele.count}</span>
                      <span className='text-[12px]'>{ele.title}</span>
                    </div>
                    <div>
                      <span className='text-[35px] text-center' style={{color: ele.bgColor}}>
                        {ele.icon}
                      </span>
                    </div>
                  </div>
                  <div className='border'>
                    <CircularProgress 
                      radius={35} 
                      count={ele.count} 
                      stroke={5} 
                      progress={ele.percentCount} 
                      sColor={ele.bgColor} 
                      progressMainColor={ele.progressMainColor} 
                    />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Engagement Chart Section - REQUIRED by docs (last 7/30 days) */}
        <div className='bg-[#FEFEFE]'>
          <div className="rounded-md drop-shadow h-[400px] flex items-center justify-center py-0 px-4 bg-white">
            <div className='flex flex-col h-full w-full'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-[12px] font-semibold text-black'>Engagement Chart (Last 30 Days)</span>
                  {isSocketConnected && (
                    <span className='text-[10px] text-green-600 flex items-center gap-1'>
                      <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                      Live
                    </span>
                  )}
                </div>
                <div className='h-[360px]'>
                  {engagement_chart && (engagement_chart as any[]).length > 0 ? (
                    <Line 
                      ref={chartRef}
                      data={engagementChartData} 
                      options={{
                        ...engagementChartOptions,
                        animation: {
                          duration: 400, // Smooth, quick animation
                          easing: 'easeInOutQuad' as const,
                        },
                        plugins: {
                          ...engagementChartOptions.plugins,
                          legend: {
                            ...engagementChartOptions.plugins.legend,
                            display: true,
                          },
                        },
                      }}
                      updateMode="active"
                      redraw={false}
                    />
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <span className='text-[#9B9B9B]'>No engagement data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Posts and Optimal Times */}
        <div className='bg-[#FEFEFE] grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <div className="rounded-md drop-shadow flex items-center py-1 px-2 bg-white">
            <div className='h-full w-full p-1'>
              <div className='border-b border-gray-200 px-1 py-2'>
                <span className='text-[#474747] text-[14px] font-semibold'>Top 5 Posts</span>
              </div>
              {top_5_posts && (top_5_posts as any[]).length > 0 ? (
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className="px-1 py-4">
                        <span className="text-[13px] text-[#474747] font-semibold">
                          Content
                        </span>
                      </th>
                      <th className="px-1 py-4">
                        <span className="text-[13px] text-[#474747] font-semibold">
                          Engagement Rate
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(top_5_posts as any[]).slice(0, 5).map((post: any, index: number) => {
                      const isLast = index === (top_5_posts as any[]).slice(0, 5).length - 1;
                      const classes = isLast ? "px-1 py-4" : "px-1 py-4 border-b border-gray-200";
                      return (
                        <tr key={index}>
                          <td className={classes}>
                            <span className="text-[12px] text-[#474747]">
                              {post.content?.substring(0, 50)}...
                            </span>
                          </td>
                          <td className={classes}>
                            <span className="text-[12px] text-[#474747]">
                              {post.engagement_rate?.toFixed(2) || 0}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className='flex justify-center p-3'>
                  <span className='text-[#9B9B9B]'>No posts available</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-md drop-shadow flex items-center py-1 px-2 bg-white">
            <div className='h-full w-full p-1'>
              <div className='border-b border-gray-200 px-1 py-2'>
                <span className='text-[#474747] text-[14px] font-semibold'>Optimal Posting Times</span>
              </div>
              {optimal_posting_times && (optimal_posting_times as any[]).length > 0 ? (
                <table className="w-full min-w-max table-auto text-left">
                  <tbody>
                    {(optimal_posting_times as any[]).slice(0, 5).map((time: any, index: number) => {
                      const isLast = index === (optimal_posting_times as any[]).slice(0, 5).length - 1;
                      const classes = isLast ? "px-1 py-4" : "px-1 py-4 border-b border-gray-200";
                      // Format hour to 12-hour format with AM/PM
                      const hour24 = time.hour || 0;
                      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                      const ampm = hour24 >= 12 ? 'PM' : 'AM';
                      const formattedTime = `${hour12}:00 ${ampm}`;
                      return (
                        <tr key={index}>
                          <td className={classes}>
                            <span className="text-[12px] text-[#474747] font-semibold">
                              {time.day_name || dayNames[time.day_of_week]} at {formattedTime}
                            </span>
                            <span className="text-[10px] text-[#9B9B9B] block">
                              Avg Engagement: {time.average_engagement?.toFixed(0) || 0}
                            </span>
                          </td>
                          <td className={classes}>
                            <span className="text-[12px] text-[#474747]">
                              {((time.confidence_score || 0) * 100)?.toFixed(0) || 0}% confidence
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className='flex justify-center p-3'>
                  <span className='text-[#9B9B9B]'>No optimal times available</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

