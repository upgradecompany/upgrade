'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function PriceChart({ rawPriceHistory, psa10PriceHistory }) {
  // Combine the two data sets for the chart
  const chartData = rawPriceHistory.map((item, index) => ({
    month: item.month,
    rawPrice: item.price,
    psa10Price: psa10PriceHistory[index].price,
  }))

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">90-Day Price Movement</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
            stroke="#6b7280"
          />
          <Tooltip
            formatter={formatCurrency}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="rawPrice"
            stroke="#6b7280"
            strokeWidth={2}
            name="Raw Card"
            dot={{ fill: '#6b7280', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="psa10Price"
            stroke="#2563eb"
            strokeWidth={2}
            name="PSA 10"
            dot={{ fill: '#2563eb', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
