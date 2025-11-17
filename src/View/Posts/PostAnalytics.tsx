import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore, { RootState } from '../../Store/store';
import { FiArrowLeft, FiHeart, FiMessageCircle, FiShare2, FiMousePointer, FiEye } from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface EngagementData {
  date: string;
  engagement: number;
  cumulative: number;
}

interface MetricData {
  name: string;
  value: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bgColor: string;
}

interface ChartData {
  name: string;
  value: number;
}

const PostAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postAnalytics = useStore((state: RootState) => state.postAnalytics);
  const isLoadingAnalytics = useStore((state: RootState) => state.isLoadingAnalytics);
  const getPostAnalytics = useStore((state: RootState) => state.getPostAnalytics);
  const getTrends = useStore((state: RootState) => state.getTrends);
  const trends = useStore((state: RootState) => state.trends);
  
  const [engagementOverTime, setEngagementOverTime] = useState<EngagementData[]>([]);
  
  useEffect(() => {
    if (id) {
      getPostAnalytics(id);
      // Fetch engagement trends for this post (we'll use general trends for now)
      // In a real scenario, you'd have a specific endpoint for post engagement over time
      getTrends({ period: '30d', granularity: 'daily', metric: 'engagement' });
    }
  }, [id, getPostAnalytics, getTrends]);
  
  // Transform trends data for engagement over time chart
  useEffect(() => {
    if (trends && (trends as any).data) {
      // For now, we'll use the general trends data
      // In production, you'd fetch post-specific engagement over time
      const trendData = (trends as any).data;
      const transformedData: EngagementData[] = trendData.map((item: any, index: number) => ({
        date: item.date,
        engagement: item.value,
        cumulative: item.cumulative || 0,
      }));
      setEngagementOverTime(transformedData);
    }
  }, [trends]);
  
  if (isLoadingAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!postAnalytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
        <button
          onClick={() => navigate('/posts')}
          className="mt-4 text-indigo-600 hover:text-indigo-700"
        >
          Back to Posts
        </button>
      </div>
    );
  }
  
  const analytics = postAnalytics as any;
  
  const metricsData: MetricData[] = [
    {
      name: 'Likes',
      value: analytics.total_likes || 0,
      icon: FiHeart,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Comments',
      value: analytics.total_comments || 0,
      icon: FiMessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Shares',
      value: analytics.total_shares || 0,
      icon: FiShare2,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Clicks',
      value: analytics.total_clicks || 0,
      icon: FiMousePointer,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Impressions',
      value: analytics.total_impressions || 0,
      icon: FiEye,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
    },
  ];
  
  const chartData: ChartData[] = [
    {
      name: 'Engagement',
      value: analytics.total_engagement || 0,
    },
    {
      name: 'Impressions',
      value: analytics.total_impressions || 0,
    },
    {
      name: 'Clicks',
      value: analytics.total_clicks || 0,
    },
  ];
  
  // Calculate performance score percentage (assuming max score is 100)
  const performanceScore = analytics.performance_score || 0;
  const performancePercentage = Math.min(100, (performanceScore / 100) * 100);
  
  // Performance score color based on value
  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getPerformanceBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/posts')}
          className="text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post Analytics</h1>
          <p className="mt-2 text-gray-600">Detailed performance metrics</p>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {metric.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 ${metric.bgColor} rounded-full`}>
                  <Icon className={metric.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Rate</h3>
          <p className="text-4xl font-bold text-indigo-600">
            {((analytics.engagement_rate || 0) as number).toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Total Engagement: {(analytics.total_engagement || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Click-Through Rate</h3>
          <p className="text-4xl font-bold text-green-600">
            {((analytics.click_through_rate || 0) as number).toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Clicks: {(analytics.total_clicks || 0).toLocaleString()}
          </p>
        </div>
        
        {/* Performance Score with Visualization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Score</h3>
          <div className="flex items-center justify-center">
            {/* Circular Progress Visualization */}
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - performancePercentage / 100)}`}
                  className={getPerformanceColor(performanceScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getPerformanceColor(performanceScore)}`}>
                    {performanceScore.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">out of 100</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg ${getPerformanceBgColor(performanceScore)}`}>
            <p className="text-sm text-gray-700 text-center">
              {performanceScore >= 80 ? 'Excellent' : 
               performanceScore >= 60 ? 'Good' : 
               performanceScore >= 40 ? 'Average' : 'Needs Improvement'}
          </p>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Avg per hour: {((analytics.average_engagement_per_hour || 0) as number).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Engagement Over Time Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Over Time</h2>
        {engagementOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#4F46E5" 
                name="Daily Engagement"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10B981" 
                name="Cumulative Engagement"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No engagement data available over time</p>
          </div>
        )}
      </div>
      
      {/* Performance Overview Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PostAnalytics;

