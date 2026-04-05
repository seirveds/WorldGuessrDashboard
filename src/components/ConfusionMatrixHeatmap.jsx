import { useMemo, useState, useRef, useEffect } from 'react'

// Country name to ISO3 code mapping
const COUNTRY_TO_ISO3 = {
  'Afghanistan': 'AFG', 'Albania': 'ALB', 'Algeria': 'DZA', 'Andorra': 'AND', 'Angola': 'AGO',
  'Argentina': 'ARG', 'Armenia': 'ARM', 'Australia': 'AUS', 'Austria': 'AUT', 'Azerbaijan': 'AZE',
  'Bahamas': 'BHS', 'Bangladesh': 'BGD', 'Belarus': 'BLR', 'Belgium': 'BEL', 'Belize': 'BLZ',
  'Benin': 'BEN', 'Bhutan': 'BTN', 'Bolivia': 'BOL', 'Bosnia and Herzegovina': 'BIH', 'Botswana': 'BWA',
  'Brazil': 'BRA', 'Brunei': 'BRN', 'Bulgaria': 'BGR', 'Burkina Faso': 'BFA', 'Cambodia': 'KHM',
  'Cameroon': 'CMR', 'Canada': 'CAN', 'Chad': 'TCD', 'Chile': 'CHL', 'China': 'CHN',
  'Colombia': 'COL', 'Costa Rica': 'CRI', 'Croatia': 'HRV', 'Cuba': 'CUB', 'Cyprus': 'CYP',
  'Czech Republic': 'CZE', 'Denmark': 'DNK', 'Dominican Republic': 'DOM', 'Ecuador': 'ECU', 'Egypt': 'EGY',
  'El Salvador': 'SLV', 'Estonia': 'EST', 'Ethiopia': 'ETH', 'Fiji': 'FJI', 'Finland': 'FIN',
  'France': 'FRA', 'French Polynesia': 'PYF', 'Georgia': 'GEO', 'Germany': 'DEU', 'Ghana': 'GHA',
  'Greece': 'GRC', 'Guatemala': 'GTM', 'Honduras': 'HND', 'Hungary': 'HUN', 'Iceland': 'ISL',
  'India': 'IND', 'Indonesia': 'IDN', 'Iran': 'IRN', 'Iraq': 'IRQ', 'Ireland': 'IRL',
  'Israel': 'ISR', 'Italy': 'ITA', 'Jamaica': 'JAM', 'Japan': 'JPN', 'Jordan': 'JOR',
  'Kazakhstan': 'KAZ', 'Kenya': 'KEN', 'Kosovo': 'XKX', 'Kuwait': 'KWT', 'Kyrgyzstan': 'KGZ',
  'Laos': 'LAO', 'Latvia': 'LVA', 'Lebanon': 'LBN', 'Lesotho': 'LSO', 'Lithuania': 'LTU',
  'Luxembourg': 'LUX', 'Madagascar': 'MDG', 'Malaysia': 'MYS', 'Mali': 'MLI', 'Malta': 'MLT',
  'Mexico': 'MEX', 'Moldova': 'MDA', 'Mongolia': 'MNG', 'Montenegro': 'MNE', 'Morocco': 'MAR',
  'Mozambique': 'MOZ', 'Myanmar': 'MMR', 'Namibia': 'NAM', 'Nepal': 'NPL', 'Netherlands': 'NLD',
  'New Caledonia': 'NCL', 'New Zealand': 'NZL', 'Nicaragua': 'NIC', 'Niger': 'NER', 'Nigeria': 'NGA',
  'North Macedonia': 'MKD', 'Norway': 'NOR', 'Oman': 'OMN', 'Pakistan': 'PAK', 'Palestine': 'PSE',
  'Panama': 'PAN', 'Papua New Guinea': 'PNG', 'Paraguay': 'PRY', 'Peru': 'PER', 'Philippines': 'PHL',
  'Poland': 'POL', 'Portugal': 'PRT', 'Puerto Rico': 'PRI', 'Qatar': 'QAT', 'Romania': 'ROU',
  'Russia': 'RUS', 'Rwanda': 'RWA', 'Samoa': 'WSM', 'Saudi Arabia': 'SAU', 'Senegal': 'SEN',
  'Serbia': 'SRB', 'Singapore': 'SGP', 'Slovakia': 'SVK', 'Slovenia': 'SVN', 'South Africa': 'ZAF',
  'South Korea': 'KOR', 'Spain': 'ESP', 'Sri Lanka': 'LKA', 'Sweden': 'SWE', 'Switzerland': 'CHE',
  'Taiwan': 'TWN', 'Tanzania': 'TZA', 'Thailand': 'THA', 'Tonga': 'TON', 'Tunisia': 'TUN',
  'Turkey': 'TUR', 'Uganda': 'UGA', 'Ukraine': 'UKR', 'United Arab Emirates': 'ARE', 'United Kingdom': 'GBR',
  'United States': 'USA', 'Uruguay': 'URY', 'Uzbekistan': 'UZB', 'Venezuela': 'VEN', 'Vietnam': 'VNM',
  'Yemen': 'YEM', 'Zambia': 'ZMB', 'Zimbabwe': 'ZWE', 'East Timor': 'TLS', 'Albania': 'ALB'
}

function ConfusionMatrixHeatmap({ confusionMatrix, isDark }) {
  const [tooltip, setTooltip] = useState(null)
  const headerScrollRef = useRef(null)
  const contentScrollRef = useRef(null)
  
  const handleHeaderScroll = (e) => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }
  
  const handleContentScroll = (e) => {
    if (headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = e.target.scrollLeft
    }
  }
  
  const { matrixData, actualCountries, guessedCountries, maxValue } = useMemo(() => {
    if (!confusionMatrix || Object.keys(confusionMatrix).length === 0) {
      return { matrixData: [], actualCountries: [], guessedCountries: [], maxValue: 0 }
    }

    // Get all unique countries
    const actualCountriesSet = new Set(Object.keys(confusionMatrix))
    const guessedCountriesSet = new Set()
    
    Object.values(confusionMatrix).forEach(guesses => {
      Object.keys(guesses).forEach(country => guessedCountriesSet.add(country))
    })

    const actualCountries = Array.from(actualCountriesSet).sort()
    const guessedCountries = Array.from(guessedCountriesSet).sort()

    // Calculate totals and percentages
    const matrixData = []
    let maxValue = 0

    actualCountries.forEach(actualCountry => {
      const totalGuesses = Object.values(confusionMatrix[actualCountry] || {}).reduce((sum, count) => sum + count, 0)
      
      guessedCountries.forEach(guessedCountry => {
        const count = confusionMatrix[actualCountry]?.[guessedCountry] || 0
        const percentage = totalGuesses > 0 ? (count / totalGuesses) * 100 : 0
        
        if (percentage > maxValue) maxValue = percentage
        
        matrixData.push({
          actualCountry,
          guessedCountry,
          count,
          percentage: Math.round(percentage)
        })
      })
    })

    return { matrixData, actualCountries, guessedCountries, maxValue }
  }, [confusionMatrix])

  const getColor = (percentage) => {
    const value = parseFloat(percentage)
    if (value === 0) return isDark ? '#1e293b' : '#f1f5f9'
    
    const intensity = Math.min(value / maxValue, 1)
    
    if (isDark) {
      const r = Math.round(59 + (139 - 59) * intensity)
      const g = Math.round(130 + (92 - 130) * intensity)
      const b = Math.round(246 + (246 - 246) * intensity)
      return `rgb(${r}, ${g}, ${b})`
    } else {
      const r = Math.round(239 + (59 - 239) * intensity)
      const g = Math.round(246 + (130 - 246) * intensity)
      const b = Math.round(255 + (246 - 255) * intensity)
      return `rgb(${r}, ${g}, ${b})`
    }
  }

  if (actualCountries.length === 0 || guessedCountries.length === 0) {
    return (
      <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        No confusion matrix data available
      </div>
    )
  }

  const cellSize = 25
  const labelWidth = 120
  const labelHeight = 90

  return (
    <div className="w-full relative">
      {/* Tooltip */}
      {tooltip && (
        <div
          className={`absolute z-20 px-3 py-2 rounded-lg text-xs shadow-xl pointer-events-none ${
            isDark ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'
          }`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
        >
          <div className="font-semibold mb-1">Correct: {tooltip.actualCountry}</div>
          <div>Guessed: {tooltip.guessedCountry}</div>
          <div className="mt-1">Frequency: {tooltip.count} ({tooltip.percentage}%)</div>
        </div>
      )}
      
      {/* Sticky header with column labels */}
      <div 
        className="sticky top-0 z-10 overflow-hidden"
      >
        <div 
          ref={headerScrollRef}
          onScroll={handleHeaderScroll}
          style={{ overflowX: 'auto', overflowY: 'hidden' }}
        >
          <svg 
            width={labelWidth + guessedCountries.length * cellSize + 20} 
            height={labelHeight}
          >
            {/* Column labels (guessed countries) */}
            {guessedCountries.map((country, i) => (
              <text
                key={`col-${i}`}
                x={labelWidth + i * cellSize + cellSize / 2}
                y={labelHeight - 15}
                textAnchor="start"
                transform={`rotate(-45, ${labelWidth + i * cellSize + cellSize / 2}, ${labelHeight - 15})`}
                className={`text-xs ${isDark ? 'fill-slate-300' : 'fill-slate-700'}`}
                style={{ fontSize: '9px', fontWeight: '500' }}
              >
                {COUNTRY_TO_ISO3[country] || country.substring(0, 3).toUpperCase()}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Scrollable content area */}
      <div 
        ref={contentScrollRef}
        onScroll={handleContentScroll}
        style={{ maxHeight: '420px', overflow: 'auto' }}
      >
        <svg 
          width={labelWidth + guessedCountries.length * cellSize + 20} 
          height={actualCountries.length * cellSize + 20}
          style={{ minWidth: '100%' }}
        >
          {/* Row labels (actual countries) */}
          {actualCountries.map((country, i) => (
            <text
              key={`row-${i}`}
              x={labelWidth - 10}
              y={i * cellSize + cellSize / 2 + 4}
              textAnchor="end"
              className={`text-xs ${isDark ? 'fill-slate-300' : 'fill-slate-700'}`}
              style={{ fontSize: '9px' }}
            >
              {country.length > 15 ? country.substring(0, 15) + '...' : country}
            </text>
          ))}

          {/* Heatmap cells */}
          {matrixData.map((cell, idx) => {
            const actualIdx = actualCountries.indexOf(cell.actualCountry)
            const guessedIdx = guessedCountries.indexOf(cell.guessedCountry)
            
            return (
              <g 
                key={idx}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                    actualCountry: cell.actualCountry,
                    guessedCountry: cell.guessedCountry,
                    count: cell.count,
                    percentage: cell.percentage
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={labelWidth + guessedIdx * cellSize}
                  y={actualIdx * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill={getColor(cell.percentage)}
                  stroke={isDark ? '#475569' : '#cbd5e1'}
                  strokeWidth={0.5}
                />
                {cell.percentage > 0 && (
                  <text
                    x={labelWidth + guessedIdx * cellSize + cellSize / 2}
                    y={actualIdx * cellSize + cellSize / 2 + 3}
                    textAnchor="middle"
                    className={`text-xs ${isDark ? 'fill-slate-100' : 'fill-slate-900'}`}
                    style={{ fontSize: '7px', fontWeight: 'bold', pointerEvents: 'none' }}
                  >
                    {cell.percentage}%
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
      
      <div className={`mt-4 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        <p>Vertical axis: Actual location country | Horizontal axis: Guessed country</p>
        <p className="mt-1">Values show the percentage of times each country was guessed for the actual location</p>
      </div>
    </div>
  )
}

export default ConfusionMatrixHeatmap
