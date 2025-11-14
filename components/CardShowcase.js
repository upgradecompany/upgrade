'use client'

export default function CardShowcase() {
  const sampleCard = {
    name: 'Tom Brady',
    year: '2000',
    brand: 'Topps Chrome',
    cardNumber: '156',
    rawPrice: 2500.00,
    psa10Price: 25000.00,
  }

  const upgrade = sampleCard.psa10Price - sampleCard.rawPrice
  const upgradePercent = ((upgrade / sampleCard.rawPrice) * 100).toFixed(0)

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Card Image Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-12 flex items-center justify-center relative">
          {/* Mock Trading Card */}
          <div className="relative">
            <div className="w-64 h-96 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              {/* Card Design */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-4 border-2 border-white rounded"></div>
              </div>

              {/* Player Section */}
              <div className="relative p-6">
                <div className="text-white text-center">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2">
                    {sampleCard.brand}
                  </div>

                  {/* Player Photo Placeholder */}
                  <div className="w-40 h-40 mx-auto bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-6xl shadow-lg">
                    🏈
                  </div>

                  <div className="text-2xl font-bold mb-1">{sampleCard.name}</div>
                  <div className="text-sm opacity-90 mb-4">Quarterback</div>

                  {/* Stats Box */}
                  <div className="bg-white/20 backdrop-blur rounded p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Year:</span>
                      <span className="font-bold">{sampleCard.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Card #:</span>
                      <span className="font-bold">#{sampleCard.cardNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="text-white text-xs font-bold opacity-70">
                  ROOKIE CARD
                </div>
              </div>
            </div>

            {/* PSA 10 Badge */}
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg border-4 border-white">
              PSA 10
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">{sampleCard.name}</h3>
            <p className="text-gray-600">{sampleCard.year} {sampleCard.brand} #{sampleCard.cardNumber}</p>
          </div>

          <div className="space-y-6">
            {/* Raw Price */}
            <div className="border-l-4 border-gray-300 pl-4">
              <div className="text-sm text-gray-500 uppercase font-semibold mb-1">Raw Card Value</div>
              <div className="text-3xl font-bold text-gray-900">
                ${sampleCard.rawPrice.toLocaleString()}
              </div>
            </div>

            {/* PSA 10 Price */}
            <div className="border-l-4 border-blue-600 pl-4">
              <div className="text-sm text-blue-600 uppercase font-semibold mb-1">PSA 10 Value</div>
              <div className="text-3xl font-bold text-blue-600">
                ${sampleCard.psa10Price.toLocaleString()}
              </div>
            </div>

            {/* Upgrade Value */}
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700 uppercase font-semibold">Potential UpGrade</span>
                <span className="text-sm text-green-600 font-bold bg-green-200 px-3 py-1 rounded-full">
                  +{upgradePercent}%
                </span>
              </div>
              <div className="text-4xl font-bold text-green-600">
                +${upgrade.toLocaleString()}
              </div>
              <p className="text-xs text-green-700 mt-2">
                If graded PSA 10 Gem Mint
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Smart Insight:</strong> This card shows a {upgradePercent}% potential value increase.
              Grading costs ~$50-150. ROI could be significant!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
