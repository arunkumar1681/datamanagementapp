import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardData {
  activeCustomers: number;
  inactiveCustomers: number;
  churnLastMonth: number;
  newSalesLastMonth: number;
  newUpsellsLastMonth: number;
  negativeChurnLastMonth: number;
  chartData: Array<{
    month: string;
    newCustomers: number;
    active: number;
    inactive: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/dashboard/stats');
      const result = await response.json();
      
      if (response.ok) {
        // Mock chart data since the API doesn't provide it yet
        const chartData = [
          { month: 'Jan', newCustomers: 12, active: 45, inactive: 5 },
          { month: 'Feb', newCustomers: 19, active: 52, inactive: 8 },
          { month: 'Mar', newCustomers: 15, active: 48, inactive: 12 },
          { month: 'Apr', newCustomers: 22, active: 58, inactive: 7 },
          { month: 'May', newCustomers: 18, active: 55, inactive: 9 },
          { month: 'Jun', newCustomers: 25, active: 62, inactive: 6 }
        ];
        
        setData({
          ...result,
          chartData
        });
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error || 'No data available'}</div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Active Customers',
      value: data.activeCustomers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Inactive Customers',
      value: data.inactiveCustomers,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Churn Last Month',
      value: data.churnLastMonth,
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'New Sales Last Month',
      value: data.newSalesLastMonth,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'New Upsells Last Month',
      value: data.newUpsellsLastMonth,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Negative Churn Last Month',
      value: data.negativeChurnLastMonth,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Growth Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newCustomers"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="New Customers"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Active"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#10B981" name="Active" />
                <Bar dataKey="inactive" fill="#EF4444" name="Inactive" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};