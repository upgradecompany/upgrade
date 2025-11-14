'use client'

export default function SalesHistory({ rawSalesHistory, psa10SalesHistory }) {
  const formatCurrency = (value) => {
    return `$${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Sales History</h3>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Raw Card Sales */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-700">Raw Card Sales</h4>
            <span className="text-sm text-gray-500">Last 20 Sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Platform</th>
                </tr>
              </thead>
              <tbody>
                {rawSalesHistory.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                      index === 0 ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-sm text-gray-700">
                      {sale.date}
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(sale.price)}
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600 text-right">
                      {sale.platform}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Average Sale Price:</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(
                  rawSalesHistory.reduce((sum, sale) => sum + sale.price, 0) / rawSalesHistory.length
                )}
              </span>
            </div>
          </div>
        </div>

        {/* PSA 10 Sales */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-blue-600">PSA 10 Sales</h4>
            <span className="text-sm text-gray-500">Last 20 Sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-blue-200">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Price</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Platform</th>
                </tr>
              </thead>
              <tbody>
                {psa10SalesHistory.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className={`border-b border-blue-50 hover:bg-blue-50 transition ${
                      index === 0 ? 'bg-blue-100' : ''
                    }`}
                  >
                    <td className="py-3 px-2 text-sm text-gray-700">
                      {sale.date}
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-sm font-semibold text-blue-900 text-right">
                      {formatCurrency(sale.price)}
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600 text-right">
                      {sale.platform}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-700">Average Sale Price:</span>
              <span className="font-bold text-blue-900">
                {formatCurrency(
                  psa10SalesHistory.reduce((sum, sale) => sum + sale.price, 0) / psa10SalesHistory.length
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Sales data shows recent market activity from various platforms including eBay, PWCC, Goldin Auctions,
          Heritage Auctions, and COMC. Prices may vary based on card condition, centering, and market demand.
        </p>
      </div>
    </div>
  )
}
