'use client'

import { useState, useMemo, memo } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import { countryByCode } from '@/lib/countries'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ISO 3166-1 numeric to alpha-2 code mapping for common countries
const numericToAlpha2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '020': 'AD', '024': 'AO', '028': 'AG', '032': 'AR', '036': 'AU',
  '040': 'AT', '031': 'AZ', '044': 'BS', '048': 'BH', '050': 'BD', '051': 'AM', '052': 'BB', '056': 'BE',
  '060': 'BM', '064': 'BT', '068': 'BO', '070': 'BA', '072': 'BW', '076': 'BR', '084': 'BZ', '090': 'SB',
  '092': 'VG', '096': 'BN', '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH', '120': 'CM',
  '124': 'CA', '132': 'CV', '140': 'CF', '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN', '158': 'TW',
  '170': 'CO', '174': 'KM', '178': 'CG', '180': 'CD', '184': 'CK', '188': 'CR', '191': 'HR', '192': 'CU',
  '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM', '214': 'DO', '218': 'EC', '222': 'SV',
  '226': 'GQ', '231': 'ET', '232': 'ER', '233': 'EE', '234': 'FO', '238': 'FK', '242': 'FJ', '246': 'FI',
  '250': 'FR', '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE', '288': 'GH',
  '292': 'GI', '296': 'KI', '300': 'GR', '304': 'GL', '308': 'GD', '316': 'GU', '320': 'GT', '324': 'GN',
  '328': 'GY', '332': 'HT', '336': 'VA', '340': 'HN', '344': 'HK', '348': 'HU', '352': 'IS', '356': 'IN',
  '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM',
  '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG',
  '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY', '438': 'LI', '440': 'LT',
  '442': 'LU', '446': 'MO', '450': 'MG', '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML', '470': 'MT',
  '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME', '504': 'MA',
  '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR', '524': 'NP', '528': 'NL', '540': 'NC', '548': 'VU',
  '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG', '570': 'NU', '574': 'NF', '578': 'NO', '580': 'MP',
  '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK', '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE',
  '608': 'PH', '612': 'PN', '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
  '642': 'RO', '643': 'RU', '646': 'RW', '654': 'SH', '659': 'KN', '660': 'AI', '662': 'LC', '666': 'PM',
  '670': 'VC', '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC', '694': 'SL',
  '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES',
  '728': 'SS', '729': 'SD', '732': 'EH', '740': 'SR', '744': 'SJ', '748': 'SZ', '752': 'SE', '756': 'CH',
  '760': 'SY', '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK', '776': 'TO', '780': 'TT', '784': 'AE',
  '788': 'TN', '792': 'TR', '795': 'TM', '796': 'TC', '798': 'TV', '800': 'UG', '804': 'UA', '807': 'MK',
  '818': 'EG', '826': 'GB', '831': 'GG', '832': 'JE', '833': 'IM', '834': 'TZ', '840': 'US', '850': 'VI',
  '854': 'BF', '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS', '887': 'YE', '894': 'ZM',
}

interface WorldMapProps {
  countryData: Record<string, number>
  userCountry?: string
  hasRecitedTonight?: boolean
}

function WorldMapComponent({ countryData, userCountry, hasRecitedTonight }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState<{ name: string; count: number } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Get max count for color scaling
  const maxCount = useMemo(() => {
    const counts = Object.values(countryData)
    return counts.length > 0 ? Math.max(...counts, 1) : 1
  }, [countryData])

  // Get color for a country based on count
  const getCountryColor = (geoId: string) => {
    const alpha2 = numericToAlpha2[geoId]
    const count = alpha2 ? countryData[alpha2] || 0 : 0
    
    // Check if this is the user's country
    if (alpha2 === userCountry) {
      if (hasRecitedTonight) {
        return '#4ade80' // Bright green if recited
      }
      return '#166534' // Dark green if not recited yet
    }
    
    if (count === 0) {
      return '#1a1a1a' // Dark background for no check-ins
    }
    
    // Scale from dark green to bright green based on count
    const intensity = Math.min(count / Math.max(maxCount, 1), 1)
    const colors = ['#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80']
    const colorIndex = Math.floor(intensity * (colors.length - 1))
    return colors[colorIndex]
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseEnter = (geo: { id?: string; properties?: { name?: string } }) => {
    const geoId = geo.id?.toString() || ''
    const alpha2 = numericToAlpha2[geoId]
    const countryInfo = alpha2 ? countryByCode.get(alpha2) : null
    const name = countryInfo?.name || geo.properties?.name || 'Unknown'
    const count = alpha2 ? countryData[alpha2] || 0 : 0
    setTooltipContent({ name, count })
  }

  const handleMouseLeave = () => {
    setTooltipContent(null)
  }

  return (
    <div className="relative w-full" onMouseMove={handleMouseMove}>
      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 pointer-events-none bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 shadow-xl"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
          }}
        >
          <div className="font-medium text-white text-sm">{tooltipContent.name}</div>
          <div className="text-[#4ade80] font-mono text-xs">
            {tooltipContent.count} {tooltipContent.count === 1 ? 'person' : 'people'}
          </div>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
          center: [20, 20],
        }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => handleMouseEnter(geo)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: getCountryColor(geo.id?.toString() || ''),
                      stroke: '#333',
                      strokeWidth: 0.3,
                      outline: 'none',
                    },
                    hover: {
                      fill: '#4ade80',
                      stroke: '#4ade80',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: '#22c55e',
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs text-[#555] font-mono">0</span>
        <div className="flex h-2 rounded-full overflow-hidden">
          {['#1a1a1a', '#14532d', '#166534', '#15803d', '#16a34a', '#22c55e', '#4ade80'].map((color, i) => (
            <div key={i} className="w-6 h-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <span className="text-xs text-[#555] font-mono">{maxCount}+</span>
      </div>
    </div>
  )
}

export const WorldMap = memo(WorldMapComponent)
