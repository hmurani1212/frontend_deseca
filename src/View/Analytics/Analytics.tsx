import React, { useEffect, useState, useMemo, useRef, ChangeEvent } from 'react';
import { Input, Select, Option, Button } from '@material-tailwind/react';
import useStore, { RootState } from '../../Store/store';
import { showToast } from '../../Components/Toaster/Toaster';
import { FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TrendsParams {
  period: string;
  granularity: 'hourly' | 'daily' | 'weekly';
  metric: string;
}

const Analytics: React.FC = () => {
  const optimalTimes = useStore((state: RootState) => state.optimalTimes);
  const trends = useStore((state: RootState) => state.trends);
  const platformPerformance = useStore((state: RootState) => state.platformPerformance);
  const topPosts = useStore((state: RootState) => state.topPosts);
  const performanceComparison = useStore((state: RootState) => state.performanceComparison);
  
  const isLoadingOptimalTimes = useStore((state: RootState) => state.isLoadingOptimalTimes);
  const isLoadingTrends = useStore((state: RootState) => state.isLoadingTrends);
  const isLoadingPlatformPerformance = useStore((state: RootState) => state.isLoadingPlatformPerformance);
  const isLoadingTopPosts = useStore((state: RootState) => state.isLoadingTopPosts);
  const isLoadingComparison = useStore((state: RootState) => state.isLoadingComparison);
  
  const getOptimalTimes = useStore((state: RootState) => state.getOptimalTimes);
  const getTrends = useStore((state: RootState) => state.getTrends);
  const getPlatformPerformance = useStore((state: RootState) => state.getPlatformPerformance);
  const getTopPosts = useStore((state: RootState) => state.getTopPosts);
  const getPerformanceComparison = useStore((state: RootState) => state.getPerformanceComparison);
  
  // Date range state
  const [useCustomDateRange, setUseCustomDateRange] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Platform filter state
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  
  const [trendsParams, setTrendsParams] = useState<TrendsParams>({
    period: '30d',
    granularity: 'daily',
    metric: 'engagement',
  });
  
  // CRITICAL: Prevent duplicate API calls in React StrictMode
  const isMountedRef = useRef<boolean>(false);
  const optimalTimesRequestInProgress = useRef<boolean>(false);
  const trendsRequestInProgress = useRef<boolean>(false);
  const platformRequestInProgress = useRef<boolean>(false);
  const topPostsRequestInProgress = useRef<boolean>(false);
  const comparisonRequestInProgress = useRef<boolean>(false);
  const lastTrendsParamsRef = useRef<TrendsParams | null>(null);
  
  // Initialize dates (default to last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);
  
  // Initial load - only run once
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (isMountedRef.current) {
      return;
    }
    
    isMountedRef.current = true;
    
    // Load all analytics data
    const loadAnalytics = async (): Promise<void> => {
      // Load optimal times
      if (!optimalTimesRequestInProgress.current) {
        optimalTimesRequestInProgress.current = true;
        try {
          await getOptimalTimes();
        } finally {
          optimalTimesRequestInProgress.current = false;
        }
      }
      
      // Load trends
      if (!trendsRequestInProgress.current) {
        trendsRequestInProgress.current = true;
        lastTrendsParamsRef.current = trendsParams;
        try {
          await getTrends(trendsParams);
        } finally {
          trendsRequestInProgress.current = false;
        }
      }
      
      // Load platform performance
      if (!platformRequestInProgress.current) {
        platformRequestInProgress.current = true;
        try {
          await getPlatformPerformance();
        } finally {
          platformRequestInProgress.current = false;
        }
      }
      
      // Load top posts
      if (!topPostsRequestInProgress.current) {
        topPostsRequestInProgress.current = true;
        try {
          await getTopPosts({ limit: 10 });
        } finally {
          topPostsRequestInProgress.current = false;
        }
      }
      
      // Load performance comparison
      if (!comparisonRequestInProgress.current) {
        comparisonRequestInProgress.current = true;
        try {
          await getPerformanceComparison();
        } finally {
          comparisonRequestInProgress.current = false;
        }
      }
    };
    
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
  
  // Handle trends params change - only call if params actually changed
  useEffect(() => {
    // Skip if not mounted yet (initial load handled above)
    if (!isMountedRef.current) {
      return;
    }
    
    // Skip if params haven't changed
    const paramsString = JSON.stringify(trendsParams);
    const lastParamsString = JSON.stringify(lastTrendsParamsRef.current);
    if (paramsString === lastParamsString) {
      return;
    }
    
    // Skip if request already in progress
    if (trendsRequestInProgress.current) {
      return;
    }
    
    trendsRequestInProgress.current = true;
    lastTrendsParamsRef.current = trendsParams;
    
    const loadTrends = async (): Promise<void> => {
      try {
        await getTrends(trendsParams);
      } finally {
        trendsRequestInProgress.current = false;
      }
    };
    
    loadTrends();
  }, [trendsParams, getTrends]);
  
  // Apply filters when they change
  useEffect(() => {
    // Skip if not mounted yet
    if (!isMountedRef.current) {
      return;
    }
    
    // Skip if request already in progress
    if (trendsRequestInProgress.current) {
      return;
    }
    
    if (useCustomDateRange && startDate && endDate) {
      // Calculate days difference for period
      const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0 && daysDiff <= 90) {
        const newPeriod = `${daysDiff}d`;
        const newParams: TrendsParams = { period: newPeriod, granularity: trendsParams.granularity, metric: trendsParams.metric };
        
        // Only update if period actually changed
        if (trendsParams.period !== newPeriod) {
          setTrendsParams(prev => ({ ...prev, period: newPeriod }));
        }
      }
    } else if (!useCustomDateRange) {
      // When switching back to period selector, only fetch if params changed
      const paramsString = JSON.stringify(trendsParams);
      const lastParamsString = JSON.stringify(lastTrendsParamsRef.current);
      if (paramsString !== lastParamsString) {
        trendsRequestInProgress.current = true;
        lastTrendsParamsRef.current = trendsParams;
        
        const loadTrends = async (): Promise<void> => {
          try {
            await getTrends(trendsParams);
          } finally {
            trendsRequestInProgress.current = false;
          }
        };
        
        loadTrends();
      }
    }
  }, [useCustomDateRange, startDate, endDate, trendsParams, getTrends]);
  
  // Filter platform performance based on selected platform (memoized)
  const filteredPlatformPerformance = useMemo(() => {
    const platforms = platformPerformance as any[];
    return selectedPlatform
      ? platforms.filter((p: any) => p.platform === selectedPlatform)
      : platforms;
  }, [selectedPlatform, platformPerformance]);
  
  // Export data to PDF function
  const handleExportData = (): void => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      
      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number = 20): boolean => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Analytics Report', margin, yPosition);
      yPosition += 10;
      
      // Export date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 10;
      
      // Trends Summary
      const trendsData = trends as any;
      if (trendsData && trendsData.summary) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Engagement Trends Summary', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Engagement: ${(trendsData.summary.total || 0).toLocaleString()}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Average: ${((trendsData.summary.average || 0) as number).toFixed(2)}`, margin, yPosition);
        yPosition += lineHeight;
        doc.text(`Growth: ${((trendsData.summary.growth || 0) as number).toFixed(2)}%`, margin, yPosition);
        yPosition += lineHeight;
        if (trendsData.summary.peak) {
          doc.text(`Peak: ${(trendsData.summary.peak.value || 0).toLocaleString()} on ${trendsData.summary.peak.date || 'N/A'}`, margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += 5;
      }
      
      // Platform Performance Table
      if (filteredPlatformPerformance && filteredPlatformPerformance.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Platform Performance', margin, yPosition);
        yPosition += 8;
        
        // Table headers
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('#', margin, yPosition);
        doc.text('Platform', margin + 10, yPosition);
        doc.text('Total Engagement', margin + 50, yPosition);
        doc.text('Avg Rate', margin + 100, yPosition);
        doc.text('Total Posts', margin + 140, yPosition);
        yPosition += lineHeight;
        
        // Table rows
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        filteredPlatformPerformance.forEach((platform: any, index: number) => {
          checkPageBreak(10);
          doc.text((index + 1).toString(), margin, yPosition);
          doc.text(platform.platform || 'N/A', margin + 10, yPosition);
          doc.text((platform.total_engagement || 0).toLocaleString(), margin + 50, yPosition);
          doc.text(((platform.avg_engagement_rate || 0) as number).toFixed(2) + '%', margin + 100, yPosition);
          doc.text((platform.total_posts || 0).toString(), margin + 140, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 5;
      }
      
      // Top Posts Table
      const topPostsData = topPosts as any[];
      if (topPostsData && topPostsData.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Top Performing Posts', margin, yPosition);
        yPosition += 8;
        
        // Table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('#', margin, yPosition);
        doc.text('Post ID', margin + 8, yPosition);
        doc.text('Engagement', margin + 40, yPosition);
        doc.text('Impressions', margin + 70, yPosition);
        doc.text('Clicks', margin + 100, yPosition);
        doc.text('Rate', margin + 130, yPosition);
        yPosition += lineHeight;
        
        // Table rows
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        topPostsData.slice(0, 10).forEach((post: any, index: number) => {
          checkPageBreak(10);
          doc.text((index + 1).toString(), margin, yPosition);
          doc.text((post.post_id || 'N/A').substring(0, 10) + '...', margin + 8, yPosition);
          doc.text((post.total_engagement || 0).toLocaleString(), margin + 40, yPosition);
          doc.text((post.total_impressions || 0).toLocaleString(), margin + 70, yPosition);
          doc.text((post.total_clicks || 0).toLocaleString(), margin + 100, yPosition);
          doc.text(((post.engagement_rate || 0) as number).toFixed(2) + '%', margin + 130, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 5;
      }
      
      // Optimal Posting Times
      const optimalTimesData = optimalTimes as any[];
      if (optimalTimesData && optimalTimesData.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Optimal Posting Times', margin, yPosition);
        yPosition += 8;
        
        // Table headers
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('#', margin, yPosition);
        doc.text('Day', margin + 10, yPosition);
        doc.text('Time', margin + 50, yPosition);
        doc.text('Avg Engagement', margin + 80, yPosition);
        doc.text('Confidence', margin + 130, yPosition);
        yPosition += lineHeight;
        
        // Table rows
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        optimalTimesData.forEach((time: any, index: number) => {
          checkPageBreak(10);
          doc.text((index + 1).toString(), margin, yPosition);
          doc.text(dayNames[time.day_of_week] || 'N/A', margin + 10, yPosition);
          doc.text(`${time.hour}:00`, margin + 50, yPosition);
          doc.text((time.average_engagement || 0).toFixed(0), margin + 80, yPosition);
          doc.text(((time.confidence_score || 0) * 100).toFixed(0) + '%', margin + 130, yPosition);
          yPosition += lineHeight;
        });
        yPosition += 5;
      }
      
      // Performance Comparison
      const comparisonData = performanceComparison as any;
      if (comparisonData) {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Comparison', margin, yPosition);
        yPosition += 8;
        
        let hasData = false;
        
        // Platform Comparison Summary
        if (comparisonData.platforms && Array.isArray(comparisonData.platforms) && comparisonData.platforms.length > 0) {
          hasData = true;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text('Platform Comparison', margin, yPosition);
          yPosition += 6;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          comparisonData.platforms.forEach((platform: any) => {
            checkPageBreak(8);
            doc.text(`${platform.platform || 'N/A'}: ${((platform.avg_engagement_rate || 0) as number).toFixed(2)}% avg rate | ${(platform.total_engagement || 0).toLocaleString()} total engagement`, margin + 5, yPosition);
            yPosition += lineHeight;
          });
          yPosition += 3;
        }
        
        // Top Posts Summary (already shown above, but add a note)
        if (comparisonData.top_posts && Array.isArray(comparisonData.top_posts) && comparisonData.top_posts.length > 0) {
          hasData = true;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Top Performing Posts: ${comparisonData.top_posts.length} posts (see Top Performing Posts section above)`, margin, yPosition);
          yPosition += lineHeight + 3;
        }
        
        // Underperforming Posts Table
        if (comparisonData.underperforming_posts && Array.isArray(comparisonData.underperforming_posts) && comparisonData.underperforming_posts.length > 0) {
          hasData = true;
          checkPageBreak(40);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`Underperforming Posts (${comparisonData.underperforming_posts.length})`, margin, yPosition);
          yPosition += 6;
          
          // Table headers
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('#', margin, yPosition);
          doc.text('Post ID', margin + 8, yPosition);
          doc.text('Engagement', margin + 40, yPosition);
          doc.text('Impressions', margin + 70, yPosition);
          doc.text('Rate', margin + 100, yPosition);
          yPosition += lineHeight;
          
          // Table rows
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          comparisonData.underperforming_posts.slice(0, 15).forEach((post: any, index: number) => {
            checkPageBreak(10);
            doc.text((index + 1).toString(), margin, yPosition);
            doc.text((post.post_id || 'N/A').substring(0, 10) + '...', margin + 8, yPosition);
            doc.text((post.total_engagement || 0).toLocaleString(), margin + 40, yPosition);
            doc.text((post.total_impressions || 0).toLocaleString(), margin + 70, yPosition);
            doc.text(((post.engagement_rate || 0) as number).toFixed(2) + '%', margin + 100, yPosition);
            yPosition += lineHeight;
          });
          
          if (comparisonData.underperforming_posts.length > 15) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`... and ${comparisonData.underperforming_posts.length - 15} more`, margin, yPosition);
            yPosition += lineHeight;
          }
          yPosition += 5;
        } else if (hasData) {
          // Only show "No underperforming posts" if we have other data
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('No underperforming posts found.', margin, yPosition);
          yPosition += lineHeight + 5;
        }
        
        // If no data at all, show a message
        if (!hasData) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('Performance comparison data is not available.', margin, yPosition);
          yPosition += lineHeight + 5;
        }
      } else {
        // If performanceComparison is null/undefined
        checkPageBreak(20);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Performance Comparison', margin, yPosition);
        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Performance comparison data is not available.', margin, yPosition);
        yPosition += lineHeight + 5;
      }
      
      // Save PDF
      const filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      showToast('PDF exported successfully!', 'success');
    } catch (error) {
      // console.error('PDF export error:', error);
      showToast('Failed to export PDF', 'error');
    }
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  
  const trendsData = trends as any;
  const optimalTimesData = optimalTimes as any[];
  const topPostsData = topPosts as any[];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Comprehensive analytics and insights</p>
        </div>
        <Button
          onClick={handleExportData}
          color="blue"
          className="flex items-center gap-2"
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
        >
          <FiDownload size={18} />
          Export Data
        </Button>
      </div>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={useCustomDateRange}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUseCustomDateRange(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">Use custom date range</span>
            </div>
            {useCustomDateRange ? (
              <div className="flex gap-2">
                <Input
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                  color="blue"
                  className="!h-11"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
                <Input
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                  color="blue"
                  className="!h-11"
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                />
              </div>
            ) : (
              <Select
                label="Period"
                color="blue"
                className="!h-11 !rounded-6"
                value={trendsParams.period}
                onChange={(value) => setTrendsParams({ ...trendsParams, period: value as string })}
                placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}
                onResize={undefined}
                onResizeCapture={undefined}
              >
                <Option value="7d">Last 7 days</Option>
                <Option value="30d">Last 30 days</Option>
                <Option value="90d">Last 90 days</Option>
              </Select>
            )}
          </div>
          
          {/* Platform Filter */}
          <div>
            <Select
              label="Platform"
              color="blue"
              className="!h-11 !rounded-6"
              value={selectedPlatform}
              onChange={(value) => setSelectedPlatform(value as string)}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <Option value="">All Platforms</Option>
              <Option value="twitter">Twitter</Option>
              <Option value="facebook">Facebook</Option>
              <Option value="instagram">Instagram</Option>
              <Option value="linkedin">LinkedIn</Option>
            </Select>
          </div>
          
          {/* Granularity */}
          <div>
            <Select
              label="Granularity"
              color="blue"
              className="!h-11 !rounded-6"
              value={trendsParams.granularity}
              onChange={(value) => setTrendsParams({ ...trendsParams, granularity: value as 'hourly' | 'daily' | 'weekly' })}
              placeholder={undefined}
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              onResize={undefined}
              onResizeCapture={undefined}
            >
              <Option value="hourly">Hourly</Option>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Trends Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Engagement Trends</h2>
        </div>
        
        {isLoadingTrends ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : trendsData && trendsData.data ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendsData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" name="Engagement" />
                {trendsData.data[0]?.moving_avg !== undefined && (
                  <Line type="monotone" dataKey="moving_avg" stroke="#10B981" name="Moving Average" />
                )}
              </LineChart>
            </ResponsiveContainer>
            
            {trendsData.summary && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{(trendsData.summary.total || 0).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-gray-900">{((trendsData.summary.average || 0) as number).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Growth</p>
                  <p className={`text-2xl font-bold ${(trendsData.summary.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {((trendsData.summary.growth || 0) as number).toFixed(2)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Peak</p>
                  <p className="text-2xl font-bold text-gray-900">{(trendsData.summary.peak?.value || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{trendsData.summary.peak?.date || ''}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No trends data available</p>
        )}
      </div>
      
      {/* Platform Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Performance</h2>
          {isLoadingPlatformPerformance ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredPlatformPerformance && filteredPlatformPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredPlatformPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_engagement" fill="#4F46E5" name="Total Engagement" />
                <Bar dataKey="avg_engagement_rate" fill="#10B981" name="Avg Engagement Rate" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No platform data available</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Distribution</h2>
          {isLoadingPlatformPerformance ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredPlatformPerformance && filteredPlatformPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredPlatformPerformance}
                  dataKey="total_engagement"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {filteredPlatformPerformance.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No platform data available</p>
          )}
        </div>
      </div>
      
      {/* Optimal Posting Times */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Optimal Posting Times</h2>
        {isLoadingOptimalTimes ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : optimalTimesData && optimalTimesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {optimalTimesData.map((time: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">
                  {dayNames[time.day_of_week]}
                </p>
                <p className="text-2xl font-bold text-indigo-600 mt-2">
                  {time.hour}:00
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Avg Engagement: {(time.average_engagement || 0).toFixed(0)}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  {((time.confidence_score || 0) * 100).toFixed(0)}% confidence
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No optimal times data available</p>
        )}
      </div>
      
      {/* Top Posts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Posts</h2>
        {isLoadingTopPosts ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : topPostsData && topPostsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPostsData.map((post: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.post_id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(post.total_engagement || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(post.total_impressions || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(post.total_clicks || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((post.engagement_rate || 0) as number).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No top posts data available</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;

