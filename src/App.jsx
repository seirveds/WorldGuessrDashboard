import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import { Trophy, TrendingUp, Target, Clock, Globe, Award, BarChart3, TrendingDown, Info, Filter, Sun, Moon, Database } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker, Line as MapLine } from 'react-simple-maps'
import { scrapeGamesFromSecret, loadGamesFromCookie, saveGamesToCookie, clearGamesCookie } from './lib/worldguessrScraper'

const CHART_SERIES = {
  dark: {
    primary: '#818cf8',
    secondary: '#38bdf8',
    accent: '#22d3ee',
    trend: '#a78bfa',
    positive: '#34d399',
    negative: '#fb7185',
    frequency: '#60a5fa'
  },
  light: {
    primary: '#4f46e5',
    secondary: '#0284c7',
    accent: '#0d9488',
    trend: '#7c3aed',
    positive: '#059669',
    negative: '#e11d48',
    frequency: '#2563eb'
  }
}

const GEOJSON_TO_COUNTRY_NAME = {
  'United States of America': 'United States',
  'United Kingdom': 'United Kingdom',
  'Russian Federation': 'Russia',
  'South Korea': 'South Korea',
  'Republic of Korea': 'South Korea',
  'North Korea': 'North Korea',
  'Democratic Republic of Korea': 'North Korea',
  'Czech Republic': 'Czech Republic',
  'Czechia': 'Czech Republic',
  'Republic of Serbia': 'Serbia',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Dominican Rep.': 'Dominican Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'Central African Rep.': 'Central African Republic',
  'S. Sudan': 'South Sudan',
  'Dem. Rep. Congo': 'DR Congo',
  'Congo': 'Congo',
  'Republic of the Congo': 'Congo',
  'Côte d\'Ivoire': 'Ivory Coast',
  'eSwatini': 'Eswatini',
  'Swaziland': 'Eswatini',
  'Macedonia': 'North Macedonia',
  'Lao PDR': 'Laos',
  'Timor-Leste': 'East Timor',
  'Palestine': 'Palestine',
  'West Bank': 'Palestine',
  'Falkland Is.': 'Falkland Islands',
  'Fr. S. Antarctic Lands': 'French Southern Territories',
  'W. Sahara': 'Western Sahara',
  'Solomon Is.': 'Solomon Islands',
  'N. Cyprus': 'Cyprus',
  'Somaliland': 'Somalia',
}

const COUNTRY_NAME_TO_ISO3 = {
  'United States': 'USA',
  'United Kingdom': 'GBR',
  'Canada': 'CAN',
  'Australia': 'AUS',
  'Germany': 'DEU',
  'France': 'FRA',
  'Italy': 'ITA',
  'Spain': 'ESP',
  'Netherlands': 'NLD',
  'Belgium': 'BEL',
  'Switzerland': 'CHE',
  'Austria': 'AUT',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Denmark': 'DNK',
  'Finland': 'FIN',
  'Poland': 'POL',
  'Czech Republic': 'CZE',
  'Hungary': 'HUN',
  'Romania': 'ROU',
  'Bulgaria': 'BGR',
  'Greece': 'GRC',
  'Portugal': 'PRT',
  'Ireland': 'IRL',
  'Croatia': 'HRV',
  'Slovenia': 'SVN',
  'Slovakia': 'SVK',
  'Lithuania': 'LTU',
  'Latvia': 'LVA',
  'Estonia': 'EST',
  'Russia': 'RUS',
  'Ukraine': 'UKR',
  'Belarus': 'BLR',
  'Turkey': 'TUR',
  'Israel': 'ISR',
  'Saudi Arabia': 'SAU',
  'UAE': 'ARE',
  'India': 'IND',
  'China': 'CHN',
  'Japan': 'JPN',
  'South Korea': 'KOR',
  'Thailand': 'THA',
  'Vietnam': 'VNM',
  'Indonesia': 'IDN',
  'Malaysia': 'MYS',
  'Singapore': 'SGP',
  'Philippines': 'PHL',
  'Taiwan': 'TWN',
  'Hong Kong': 'HKG',
  'New Zealand': 'NZL',
  'South Africa': 'ZAF',
  'Egypt': 'EGY',
  'Kenya': 'KEN',
  'Nigeria': 'NGA',
  'Morocco': 'MAR',
  'Tunisia': 'TUN',
  'Algeria': 'DZA',
  'Ghana': 'GHA',
  'Brazil': 'BRA',
  'Mexico': 'MEX',
  'Argentina': 'ARG',
  'Chile': 'CHL',
  'Colombia': 'COL',
  'Peru': 'PER',
  'Venezuela': 'VEN',
  'Ecuador': 'ECU',
  'Bolivia': 'BOL',
  'Uruguay': 'URY',
  'Paraguay': 'PRY',
  'Costa Rica': 'CRI',
  'Panama': 'PAN',
  'Guatemala': 'GTM',
  'Cuba': 'CUB',
  'Dominican Republic': 'DOM',
  'Jamaica': 'JAM',
  'Trinidad and Tobago': 'TTO',
  'Iceland': 'ISL',
  'Luxembourg': 'LUX',
  'Malta': 'MLT',
  'Cyprus': 'CYP',
  'Albania': 'ALB',
  'North Macedonia': 'MKD',
  'Serbia': 'SRB',
  'Bosnia and Herzegovina': 'BIH',
  'Montenegro': 'MNE',
  'Moldova': 'MDA',
  'Georgia': 'GEO',
  'Armenia': 'ARM',
  'Azerbaijan': 'AZE',
  'Kazakhstan': 'KAZ',
  'Uzbekistan': 'UZB',
  'Kyrgyzstan': 'KGZ',
  'Tajikistan': 'TJK',
  'Turkmenistan': 'TKM',
  'Mongolia': 'MNG',
  'Bangladesh': 'BGD',
  'Pakistan': 'PAK',
  'Sri Lanka': 'LKA',
  'Nepal': 'NPL',
  'Bhutan': 'BTN',
  'Myanmar': 'MMR',
  'Cambodia': 'KHM',
  'Laos': 'LAO',
  'Brunei': 'BRN',
  'East Timor': 'TLS',
  'Papua New Guinea': 'PNG',
  'Fiji': 'FJI',
  'New Caledonia': 'NCL',
  'French Polynesia': 'PYF',
  'Samoa': 'WSM',
  'Tonga': 'TON',
  'Vanuatu': 'VUT',
  'Solomon Islands': 'SLB',
  'Kiribati': 'KIR',
  'Marshall Islands': 'MHL',
  'Micronesia': 'FSM',
  'Palau': 'PLW',
  'Nauru': 'NRU',
  'Tuvalu': 'TUV',
  'Ethiopia': 'ETH',
  'Uganda': 'UGA',
  'Tanzania': 'TZA',
  'Rwanda': 'RWA',
  'Burundi': 'BDI',
  'Somalia': 'SOM',
  'Djibouti': 'DJI',
  'Eritrea': 'ERI',
  'Sudan': 'SDN',
  'South Sudan': 'SSD',
  'DR Congo': 'COD',
  'Congo': 'COG',
  'Gabon': 'GAB',
  'Equatorial Guinea': 'GNQ',
  'Cameroon': 'CMR',
  'Central African Republic': 'CAF',
  'Chad': 'TCD',
  'Niger': 'NER',
  'Mali': 'MLI',
  'Burkina Faso': 'BFA',
  'Senegal': 'SEN',
  'Gambia': 'GMB',
  'Guinea': 'GIN',
  'Guinea-Bissau': 'GNB',
  'Sierra Leone': 'SLE',
  'Liberia': 'LBR',
  'Ivory Coast': 'CIV',
  'Benin': 'BEN',
  'Togo': 'TGO',
  'Mauritania': 'MRT',
  'Zambia': 'ZMB',
  'Zimbabwe': 'ZWE',
  'Botswana': 'BWA',
  'Namibia': 'NAM',
  'Lesotho': 'LSO',
  'Eswatini': 'SWZ',
  'Mozambique': 'MOZ',
  'Malawi': 'MWI',
  'Madagascar': 'MDG',
  'Mauritius': 'MUS',
  'Seychelles': 'SYC',
  'Comoros': 'COM',
  'Réunion': 'REU',
  'Mayotte': 'MYT',
  'Angola': 'AGO',
  'São Tomé and Príncipe': 'STP',
  'Iraq': 'IRQ',
  'Iran': 'IRN',
  'Syria': 'SYR',
  'Lebanon': 'LBN',
  'Jordan': 'JOR',
  'Palestine': 'PSE',
  'Yemen': 'YEM',
  'Oman': 'OMN',
  'Kuwait': 'KWT',
  'Bahrain': 'BHR',
  'Qatar': 'QAT',
  'Afghanistan': 'AFG',
  'Puerto Rico': 'PRI',
}

const COUNTRY_NAMES = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'GR': 'Greece',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'BY': 'Belarus',
  'TR': 'Turkey',
  'IL': 'Israel',
  'SA': 'Saudi Arabia',
  'AE': 'UAE',
  'IN': 'India',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'South Korea',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'NZ': 'New Zealand',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'KE': 'Kenya',
  'NG': 'Nigeria',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'GH': 'Ghana',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'EC': 'Ecuador',
  'BO': 'Bolivia',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'GT': 'Guatemala',
  'CU': 'Cuba',
  'DO': 'Dominican Republic',
  'JM': 'Jamaica',
  'TT': 'Trinidad and Tobago',
  'IS': 'Iceland',
  'LU': 'Luxembourg',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'AL': 'Albania',
  'MK': 'North Macedonia',
  'RS': 'Serbia',
  'BA': 'Bosnia and Herzegovina',
  'ME': 'Montenegro',
  'MD': 'Moldova',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'MN': 'Mongolia',
  'BD': 'Bangladesh',
  'PK': 'Pakistan',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'MM': 'Myanmar',
  'KH': 'Cambodia',
  'LA': 'Laos',
  'BN': 'Brunei',
  'TL': 'East Timor',
  'PG': 'Papua New Guinea',
  'FJ': 'Fiji',
  'NC': 'New Caledonia',
  'PF': 'French Polynesia',
  'WS': 'Samoa',
  'TO': 'Tonga',
  'VU': 'Vanuatu',
  'SB': 'Solomon Islands',
  'KI': 'Kiribati',
  'MH': 'Marshall Islands',
  'FM': 'Micronesia',
  'PW': 'Palau',
  'NR': 'Nauru',
  'TV': 'Tuvalu',
  'ET': 'Ethiopia',
  'UG': 'Uganda',
  'TZ': 'Tanzania',
  'RW': 'Rwanda',
  'BI': 'Burundi',
  'SO': 'Somalia',
  'DJ': 'Djibouti',
  'ER': 'Eritrea',
  'SD': 'Sudan',
  'SS': 'South Sudan',
  'CD': 'DR Congo',
  'CG': 'Congo',
  'GA': 'Gabon',
  'GQ': 'Equatorial Guinea',
  'CM': 'Cameroon',
  'CF': 'Central African Republic',
  'TD': 'Chad',
  'NE': 'Niger',
  'ML': 'Mali',
  'BF': 'Burkina Faso',
  'SN': 'Senegal',
  'GM': 'Gambia',
  'GN': 'Guinea',
  'GW': 'Guinea-Bissau',
  'SL': 'Sierra Leone',
  'LR': 'Liberia',
  'CI': 'Ivory Coast',
  'BJ': 'Benin',
  'TG': 'Togo',
  'MR': 'Mauritania',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
  'BW': 'Botswana',
  'NA': 'Namibia',
  'LS': 'Lesotho',
  'SZ': 'Eswatini',
  'MZ': 'Mozambique',
  'MW': 'Malawi',
  'MG': 'Madagascar',
  'MU': 'Mauritius',
  'SC': 'Seychelles',
  'KM': 'Comoros',
  'RE': 'Réunion',
  'YT': 'Mayotte',
  'AO': 'Angola',
  'ST': 'São Tomé and Príncipe',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'SY': 'Syria',
  'LB': 'Lebanon',
  'JO': 'Jordan',
  'PS': 'Palestine',
  'YE': 'Yemen',
  'OM': 'Oman',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'QA': 'Qatar',
  'AF': 'Afghanistan',
  'PR': 'Puerto Rico',
}

const COUNTRY_BOUNDARIES = [
  { code: 'US', minLat: 24.5, maxLat: 49.4, minLng: -125, maxLng: -66.9 },
  { code: 'CA', minLat: 41.7, maxLat: 83.1, minLng: -141, maxLng: -52.6 },
  { code: 'MX', minLat: 14.5, maxLat: 32.7, minLng: -118.4, maxLng: -86.7 },
  { code: 'BR', minLat: -33.7, maxLat: 5.3, minLng: -73.9, maxLng: -34.8 },
  { code: 'AR', minLat: -55.1, maxLat: -21.8, minLng: -73.6, maxLng: -53.6 },
  { code: 'CL', minLat: -55.9, maxLat: -17.5, minLng: -109.5, maxLng: -66.4 },
  { code: 'CO', minLat: -4.2, maxLat: 12.5, minLng: -79, maxLng: -66.9 },
  { code: 'PE', minLat: -18.3, maxLat: -0.04, minLng: -81.3, maxLng: -68.7 },
  { code: 'VE', minLat: 0.6, maxLat: 12.2, minLng: -73.4, maxLng: -59.8 },
  { code: 'EC', minLat: -5, maxLat: 1.7, minLng: -92, maxLng: -75.2 },
  { code: 'BO', minLat: -22.9, maxLat: -9.7, minLng: -69.6, maxLng: -57.5 },
  { code: 'UY', minLat: -35, maxLat: -30, minLng: -58.4, maxLng: -53.1 },
  { code: 'PY', minLat: -27.6, maxLat: -19.3, minLng: -62.6, maxLng: -54.3 },
  { code: 'CR', minLat: 8.0, maxLat: 11.2, minLng: -85.9, maxLng: -82.6 },
  { code: 'PA', minLat: 7.2, maxLat: 9.6, minLng: -83, maxLng: -77.2 },
  { code: 'GT', minLat: 13.7, maxLat: 17.8, minLng: -92.2, maxLng: -88.2 },
  { code: 'CU', minLat: 19.8, maxLat: 23.2, minLng: -84.9, maxLng: -74.1 },
  { code: 'DO', minLat: 17.6, maxLat: 19.9, minLng: -72, maxLng: -68.3 },
  { code: 'JM', minLat: 17.7, maxLat: 18.5, minLng: -78.4, maxLng: -76.2 },
  { code: 'GB', minLat: 49.9, maxLat: 60.9, minLng: -8.2, maxLng: 1.8 },
  { code: 'FR', minLat: 41.3, maxLat: 51.1, minLng: -5.1, maxLng: 9.6 },
  { code: 'DE', minLat: 47.3, maxLat: 55.1, minLng: 5.9, maxLng: 15.0 },
  { code: 'IT', minLat: 36.6, maxLat: 47.1, minLng: 6.6, maxLng: 18.5 },
  { code: 'ES', minLat: 36.0, maxLat: 43.8, minLng: -9.3, maxLng: 4.3 },
  { code: 'PT', minLat: 36.9, maxLat: 42.2, minLng: -9.5, maxLng: -6.2 },
  { code: 'NL', minLat: 50.8, maxLat: 53.6, minLng: 3.4, maxLng: 7.2 },
  { code: 'BE', minLat: 49.5, maxLat: 51.5, minLng: 2.5, maxLng: 6.4 },
  { code: 'CH', minLat: 45.8, maxLat: 47.8, minLng: 5.9, maxLng: 10.5 },
  { code: 'AT', minLat: 46.4, maxLat: 49.0, minLng: 9.5, maxLng: 17.2 },
  { code: 'SE', minLat: 55.3, maxLat: 69.1, minLng: 11.1, maxLng: 24.2 },
  { code: 'NO', minLat: 57.9, maxLat: 71.2, minLng: 4.5, maxLng: 31.1 },
  { code: 'DK', minLat: 54.6, maxLat: 57.8, minLng: 8.1, maxLng: 15.2 },
  { code: 'FI', minLat: 59.8, maxLat: 70.1, minLng: 20.5, maxLng: 31.6 },
  { code: 'PL', minLat: 49.0, maxLat: 54.8, minLng: 14.1, maxLng: 24.1 },
  { code: 'CZ', minLat: 48.6, maxLat: 51.1, minLng: 12.1, maxLng: 18.9 },
  { code: 'HU', minLat: 45.7, maxLat: 48.6, minLng: 16.1, maxLng: 22.9 },
  { code: 'RO', minLat: 43.6, maxLat: 48.3, minLng: 20.3, maxLng: 29.7 },
  { code: 'BG', minLat: 41.2, maxLat: 44.2, minLng: 22.4, maxLng: 28.6 },
  { code: 'GR', minLat: 34.8, maxLat: 41.7, minLng: 19.4, maxLng: 28.2 },
  { code: 'IE', minLat: 51.4, maxLat: 55.4, minLng: -10.5, maxLng: -5.4 },
  { code: 'HR', minLat: 42.4, maxLat: 46.5, minLng: 13.5, maxLng: 19.4 },
  { code: 'SI', minLat: 45.4, maxLat: 46.9, minLng: 13.4, maxLng: 16.6 },
  { code: 'SK', minLat: 47.7, maxLat: 49.6, minLng: 16.8, maxLng: 22.6 },
  { code: 'LT', minLat: 53.9, maxLat: 56.5, minLng: 20.9, maxLng: 26.8 },
  { code: 'LV', minLat: 55.7, maxLat: 58.1, minLng: 21.0, maxLng: 28.2 },
  { code: 'EE', minLat: 57.5, maxLat: 59.7, minLng: 21.8, maxLng: 28.2 },
  { code: 'RU', minLat: 41.2, maxLat: 81.9, minLng: 19.6, maxLng: -169 },
  { code: 'UA', minLat: 44.4, maxLat: 52.4, minLng: 22.1, maxLng: 40.2 },
  { code: 'BY', minLat: 51.3, maxLat: 56.2, minLng: 23.2, maxLng: 32.8 },
  { code: 'TR', minLat: 35.8, maxLat: 42.1, minLng: 26.0, maxLng: 44.8 },
  { code: 'IL', minLat: 29.5, maxLat: 33.3, minLng: 34.3, maxLng: 35.9 },
  { code: 'SA', minLat: 16.4, maxLat: 32.2, minLng: 34.5, maxLng: 55.7 },
  { code: 'AE', minLat: 22.6, maxLat: 26.1, minLng: 51.5, maxLng: 56.4 },
  { code: 'IN', minLat: 6.7, maxLat: 35.5, minLng: 68.2, maxLng: 97.4 },
  { code: 'CN', minLat: 18.2, maxLat: 53.6, minLng: 73.5, maxLng: 135.1 },
  { code: 'JP', minLat: 24.0, maxLat: 45.5, minLng: 122.9, maxLng: 153.9 },
  { code: 'KR', minLat: 33.1, maxLat: 38.6, minLng: 124.6, maxLng: 131.9 },
  { code: 'TH', minLat: 5.6, maxLat: 20.5, minLng: 97.3, maxLng: 105.6 },
  { code: 'VN', minLat: 8.6, maxLat: 23.4, minLng: 102.1, maxLng: 109.5 },
  { code: 'ID', minLat: -11.0, maxLat: 6.0, minLng: 95.0, maxLng: 141.0 },
  { code: 'MY', minLat: 0.9, maxLat: 7.4, minLng: 99.6, maxLng: 119.3 },
  { code: 'SG', minLat: 1.2, maxLat: 1.5, minLng: 103.6, maxLng: 104.0 },
  { code: 'PH', minLat: 4.6, maxLat: 21.1, minLng: 116.9, maxLng: 126.6 },
  { code: 'TW', minLat: 21.9, maxLat: 25.3, minLng: 120.0, maxLng: 122.0 },
  { code: 'HK', minLat: 22.2, maxLat: 22.6, minLng: 113.8, maxLng: 114.4 },
  { code: 'AU', minLat: -43.6, maxLat: -10.7, minLng: 113.3, maxLng: 153.6 },
  { code: 'NZ', minLat: -47.3, maxLat: -34.4, minLng: 166.4, maxLng: 178.6 },
  { code: 'ZA', minLat: -34.8, maxLat: -22.1, minLng: 16.5, maxLng: 32.9 },
  { code: 'EG', minLat: 22.0, maxLat: 31.7, minLng: 24.7, maxLng: 36.9 },
  { code: 'KE', minLat: -4.7, maxLat: 5.0, minLng: 33.9, maxLng: 41.9 },
  { code: 'NG', minLat: 4.3, maxLat: 13.9, minLng: 2.7, maxLng: 14.7 },
  { code: 'MA', minLat: 27.7, maxLat: 35.9, minLng: -13.2, maxLng: -1.0 },
  { code: 'TN', minLat: 30.2, maxLat: 37.5, minLng: 7.5, maxLng: 11.6 },
  { code: 'DZ', minLat: 19.0, maxLat: 37.1, minLng: -8.7, maxLng: 12.0 },
  { code: 'GH', minLat: 4.7, maxLat: 11.2, minLng: -3.3, maxLng: 1.2 },
  { code: 'IS', minLat: 63.4, maxLat: 66.5, minLng: -24.5, maxLng: -13.5 },
  { code: 'AL', minLat: 39.6, maxLat: 42.7, minLng: 19.3, maxLng: 21.1 },
  { code: 'MK', minLat: 40.9, maxLat: 42.4, minLng: 20.5, maxLng: 23.0 },
  { code: 'RS', minLat: 42.2, maxLat: 46.2, minLng: 18.8, maxLng: 23.0 },
  { code: 'BA', minLat: 42.6, maxLat: 45.3, minLng: 15.7, maxLng: 19.6 },
  { code: 'ME', minLat: 41.9, maxLat: 43.6, minLng: 18.4, maxLng: 20.4 },
  { code: 'MD', minLat: 45.5, maxLat: 48.5, minLng: 26.6, maxLng: 30.1 },
  { code: 'GE', minLat: 41.0, maxLat: 43.6, minLng: 40.0, maxLng: 46.7 },
  { code: 'AM', minLat: 38.8, maxLat: 41.3, minLng: 43.4, maxLng: 46.6 },
  { code: 'AZ', minLat: 38.4, maxLat: 41.9, minLng: 44.8, maxLng: 50.4 },
  { code: 'KZ', minLat: 40.6, maxLat: 55.4, minLng: 46.5, maxLng: 87.3 },
  { code: 'UZ', minLat: 37.2, maxLat: 45.6, minLng: 55.9, maxLng: 73.1 },
  { code: 'KG', minLat: 39.2, maxLat: 43.2, minLng: 69.3, maxLng: 80.3 },
  { code: 'TJ', minLat: 36.7, maxLat: 41.0, minLng: 67.4, maxLng: 75.1 },
  { code: 'TM', minLat: 35.1, maxLat: 42.8, minLng: 52.4, maxLng: 66.7 },
  { code: 'MN', minLat: 41.6, maxLat: 52.2, minLng: 87.7, maxLng: 119.9 },
  { code: 'BD', minLat: 20.7, maxLat: 26.6, minLng: 88.0, maxLng: 92.7 },
  { code: 'PK', minLat: 23.7, maxLat: 37.1, minLng: 60.9, maxLng: 77.8 },
  { code: 'LK', minLat: 5.9, maxLat: 9.8, minLng: 79.7, maxLng: 81.9 },
  { code: 'NP', minLat: 26.3, maxLat: 30.4, minLng: 80.1, maxLng: 88.2 },
  { code: 'BT', minLat: 26.7, maxLat: 28.3, minLng: 88.8, maxLng: 92.1 },
  { code: 'MM', minLat: 9.8, maxLat: 28.5, minLng: 92.2, maxLng: 101.2 },
  { code: 'KH', minLat: 10.4, maxLat: 14.7, minLng: 102.3, maxLng: 107.6 },
  { code: 'LA', minLat: 13.9, maxLat: 22.5, minLng: 100.1, maxLng: 107.7 },
  { code: 'ET', minLat: 3.4, maxLat: 14.9, minLng: 33.0, maxLng: 48.0 },
  { code: 'UG', minLat: -1.5, maxLat: 4.2, minLng: 29.6, maxLng: 35.0 },
  { code: 'TZ', minLat: -11.7, maxLat: -1.0, minLng: 29.3, maxLng: 40.5 },
  { code: 'SO', minLat: -1.7, maxLat: 11.9, minLng: 40.9, maxLng: 51.4 },
  { code: 'SD', minLat: 8.7, maxLat: 22.0, minLng: 21.8, maxLng: 38.6 },
  { code: 'CD', minLat: -13.5, maxLat: 5.4, minLng: 12.2, maxLng: 31.3 },
  { code: 'AO', minLat: -18.0, maxLat: -4.4, minLng: 11.7, maxLng: 24.1 },
  { code: 'ZM', minLat: -18.1, maxLat: -8.2, minLng: 21.9, maxLng: 33.7 },
  { code: 'ZW', minLat: -22.4, maxLat: -15.6, minLng: 25.2, maxLng: 33.1 },
  { code: 'BW', minLat: -26.9, maxLat: -17.8, minLng: 19.9, maxLng: 29.4 },
  { code: 'NA', minLat: -28.9, maxLat: -16.9, minLng: 11.7, maxLng: 25.3 },
  { code: 'MZ', minLat: -26.9, maxLat: -10.5, minLng: 30.2, maxLng: 40.8 },
  { code: 'MG', minLat: -25.6, maxLat: -12.0, minLng: 43.2, maxLng: 50.5 },
  { code: 'IQ', minLat: 29.1, maxLat: 37.4, minLng: 38.8, maxLng: 48.6 },
  { code: 'IR', minLat: 25.1, maxLat: 39.8, minLng: 44.0, maxLng: 63.3 },
  { code: 'SY', minLat: 32.3, maxLat: 37.3, minLng: 35.7, maxLng: 42.4 },
  { code: 'LB', minLat: 33.1, maxLat: 34.7, minLng: 35.1, maxLng: 36.6 },
  { code: 'JO', minLat: 29.2, maxLat: 33.4, minLng: 34.9, maxLng: 39.3 },
  { code: 'YE', minLat: 12.1, maxLat: 19.0, minLng: 42.5, maxLng: 54.5 },
  { code: 'OM', minLat: 16.6, maxLat: 26.4, minLng: 51.8, maxLng: 59.8 },
  { code: 'KW', minLat: 28.5, maxLat: 30.1, minLng: 46.6, maxLng: 48.5 },
  { code: 'QA', minLat: 24.5, maxLat: 26.2, minLng: 50.7, maxLng: 51.6 },
  { code: 'BH', minLat: 25.8, maxLat: 26.3, minLng: 50.4, maxLng: 50.8 },
  { code: 'AF', minLat: 29.4, maxLat: 38.5, minLng: 60.5, maxLng: 74.9 },
  { code: 'PR', minLat: 17.9, maxLat: 18.5, minLng: -67.3, maxLng: -65.2 },
]

const getCountryFromCoordinates = (lat, lng) => {
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  for (const boundary of COUNTRY_BOUNDARIES) {
    if (lat >= boundary.minLat && lat <= boundary.maxLat) {
      if (boundary.minLng < boundary.maxLng) {
        if (lng >= boundary.minLng && lng <= boundary.maxLng) {
          return boundary.code
        }
      } else {
        if (lng >= boundary.minLng || lng <= boundary.maxLng) {
          return boundary.code
        }
      }
    }
  }

  return null
}

const truncateText = (text, maxLength = 18) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getGameTimePerRound = (game) => {
  const roundTime = game?.game?.settings?.timePerRound ?? game?.settings?.timePerRound
  return Number(roundTime) || 0
}

const matchesRoundTypeFilter = (game, roundTypeFilter) => {
  if (roundTypeFilter === 'all') return true

  const timePerRound = getGameTimePerRound(game)
  if (roundTypeFilter === 'shootout') return timePerRound <= 20000
  if (roundTypeFilter === 'standard') return timePerRound > 20000

  return true
}

function App() {
  const [stats, setStats] = useState(null)
  const [gameData, setGameData] = useState([])
  const [excludedUsers, setExcludedUsers] = useState([])
  const [roundTypeFilter, setRoundTypeFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('my')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isDataOpen, setIsDataOpen] = useState(false)
  const [myUsernameInput, setMyUsernameInput] = useState(() => localStorage.getItem('wg-username') || '')
  const [secretInput, setSecretInput] = useState('')
  const [isScraping, setIsScraping] = useState(false)
  const [scrapeStatus, setScrapeStatus] = useState('')
  const [dataError, setDataError] = useState('')
  const headerMenuRef = useRef(null)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('wg-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const filteredGames = useMemo(
    () => gameData.filter(game => matchesRoundTypeFilter(game, roundTypeFilter)),
    [gameData, roundTypeFilter]
  )

  const knownUsernames = useMemo(() => {
    const usernames = new Set()

    gameData.forEach(game => {
      if (game?.userPlayer?.username) usernames.add(game.userPlayer.username)
      game.game?.rounds?.forEach(round => {
        round.allGuesses?.forEach(guess => {
          if (guess.username) usernames.add(guess.username)
        })
      })
    })

    return Array.from(usernames)
  }, [gameData])

  const currentUsername = useMemo(() => {
    const preferredUsername = myUsernameInput.trim()
    if (preferredUsername) {
      const exactMatch = knownUsernames.find(username => username === preferredUsername)
      if (exactMatch) return exactMatch

      const caseInsensitiveMatch = knownUsernames.find(
        username => username.toLowerCase() === preferredUsername.toLowerCase()
      )
      if (caseInsensitiveMatch) return caseInsensitiveMatch

      return preferredUsername
    }

    const usernames = gameData
      .map(game => game?.userPlayer?.username)
      .filter(Boolean)

    if (usernames.length === 0) return ''

    const counts = usernames.reduce((acc, username) => {
      acc[username] = (acc[username] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  }, [gameData, knownUsernames, myUsernameInput])

  const currentPlayerId = useMemo(() => {
    const playerIds = gameData
      .map(game => game?.userPlayer?.playerId)
      .filter(Boolean)

    if (playerIds.length === 0) return ''

    const counts = playerIds.reduce((acc, playerId) => {
      acc[playerId] = (acc[playerId] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  }, [gameData])

  const allUsers = useMemo(() => {
    const usernames = new Set()
    filteredGames.forEach(game => {
      game.game?.rounds?.forEach(round => {
        round.allGuesses?.forEach(guess => {
          if (guess.username) usernames.add(guess.username)
        })
      })
    })
    return Array.from(usernames).sort((a, b) => a.localeCompare(b))
  }, [filteredGames])

  const activeExcludedUsers = useMemo(() => {
    if (activeTab !== 'my' || !currentUsername || !allUsers.includes(currentUsername)) {
      return excludedUsers
    }

    return allUsers.filter(username => username !== currentUsername)
  }, [activeTab, allUsers, currentUsername, excludedUsers])

  const myRoundDensityData = useMemo(() => {
    if (!currentUsername && !currentPlayerId) return []

    const BIN_SIZE = 250
    const MAX_POINTS = 5000
    const totalBins = Math.ceil(MAX_POINTS / BIN_SIZE)
    const bins = Array.from({ length: totalBins }, (_, index) => ({
      binStart: index * BIN_SIZE,
      binEnd: (index + 1) * BIN_SIZE,
      rounds: 0
    }))

    let totalRounds = 0

    filteredGames.forEach(game => {
      game.game?.rounds?.forEach(round => {
        const myGuess = round.allGuesses?.find(guess => {
          if (currentPlayerId && guess.playerId === currentPlayerId) return true
          if (currentUsername && guess.username === currentUsername) return true
          return false
        })
        if (!myGuess) return

        const points = Number(myGuess.points)
        if (!Number.isFinite(points)) return

        const safePoints = Math.min(MAX_POINTS - 1, Math.max(0, points))
        const binIndex = Math.floor(safePoints / BIN_SIZE)
        if (!bins[binIndex]) return

        bins[binIndex].rounds += 1
        totalRounds += 1
      })
    })

    return bins
      .filter(bin => bin.rounds > 0)
      .map(bin => ({
        range: `${bin.binStart}-${bin.binEnd}`,
        density: totalRounds > 0 ? Number(((bin.rounds / totalRounds) * 100).toFixed(2)) : 0,
        rounds: bin.rounds
      }))
  }, [filteredGames, currentPlayerId, currentUsername])

  const toggleUserExclusion = (username) => {
    setExcludedUsers(prev =>
      prev.includes(username)
        ? prev.filter(user => user !== username)
        : [...prev, username]
    )
  }

  useEffect(() => {
    const cookieData = loadGamesFromCookie()
    setGameData(cookieData)
    if (cookieData.length === 0) {
      setScrapeStatus('No cookie data found. Paste your secret and click Update Data.')
    }
  }, [])

  useEffect(() => {
    processGameData()
  }, [activeExcludedUsers, filteredGames])

  useEffect(() => {
    setExcludedUsers(prev => prev.filter(user => allUsers.includes(user)))
  }, [allUsers])

  useEffect(() => {
    localStorage.setItem('wg-theme', theme)
  }, [theme])

  useEffect(() => {
    const username = myUsernameInput.trim()
    if (username) {
      localStorage.setItem('wg-username', username)
    } else {
      localStorage.removeItem('wg-username')
    }
  }, [myUsernameInput])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!headerMenuRef.current) return
      if (!headerMenuRef.current.contains(event.target)) {
        setIsDataOpen(false)
        setIsFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleScrapeData = async () => {
    const username = myUsernameInput.trim()
    const secret = secretInput.trim()
    if (!username) {
      setDataError('Please enter your username first.')
      return
    }
    if (!secret) {
      setDataError('Please enter your WorldGuessr secret first.')
      return
    }

    setDataError('')
    setIsScraping(true)
    setScrapeStatus('Starting scrape...')

    try {
      const games = await scrapeGamesFromSecret(secret, setScrapeStatus)
      const saved = saveGamesToCookie(games)
      if (!saved) {
        setDataError('Scrape worked, but dataset is too large for cookie storage. Try fewer games.')
      }
      setGameData(games)
      setExcludedUsers([])
    } catch (error) {
      setDataError(error.message || 'Failed to scrape game data.')
    } finally {
      setIsScraping(false)
    }
  }

  const handleClearCookieData = () => {
    clearGamesCookie()
    setGameData([])
    setExcludedUsers([])
    setScrapeStatus('Stored cookie data cleared.')
  }

  const handleOpenRawJson = () => {
    if (gameData.length === 0) {
      setDataError('No game data available to view yet.')
      return
    }

    setDataError('')
    const jsonString = JSON.stringify(gameData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const opened = window.open(url, '_blank', 'noopener,noreferrer')

    if (!opened) {
      setDataError('Unable to open new tab. Please allow popups for this site.')
      URL.revokeObjectURL(url)
      return
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  const processGameData = () => {
    if (!gameData.length) {
      setStats({
        playerRankings: [],
        allCountries: [],
        topCountries: [],
        worstCountries: [],
        mostOccurringCountries: [],
        performanceOverTime: [],
        totalGames: 0,
        totalPlayers: 0
      })
      return
    }

    const playerStats = {}
    const gamesByDate = {}
    const countryPerformance = {}
    const excludedUsersSet = new Set(activeExcludedUsers)
    let totalIncludedGames = 0
    
    filteredGames.forEach(game => {
      if (!game.game?.rounds) return
      
      const date = new Date(game.startedAt).toLocaleDateString()
      const playersInGame = new Set()
      let hasIncludedRounds = false

      game.game.rounds.forEach(round => {
        if (!round.allGuesses) return

        const includedGuesses = round.allGuesses.filter(
          guess => !excludedUsersSet.has(guess.username)
        )
        if (includedGuesses.length === 0) return
        
        let countryCode = round.location.country
        if (!countryCode && round.location.lat != null && round.location.long != null) {
          countryCode = getCountryFromCoordinates(round.location.lat, round.location.long)
        }
        const country = COUNTRY_NAMES[countryCode] || countryCode || 'Unknown'
        if (!countryPerformance[country]) {
          countryPerformance[country] = { total: 0, count: 0, country }
        }

        let roundPointsTotal = 0
        let roundGuessCount = 0

        includedGuesses.forEach(guess => {
          if (!playerStats[guess.username]) {
            playerStats[guess.username] = {
              username: guess.username,
              totalPoints: 0,
              totalGames: 0,
              totalRounds: 0,
              wins: 0,
              avgPoints: 0,
              avgTime: 0,
              bestRound: 0,
              worstRound: 5000,
              countries: new Set()
            }
          }
          
          const player = playerStats[guess.username]
          player.totalPoints += guess.points
          player.totalRounds++
          player.avgTime += guess.timeTaken
          player.bestRound = Math.max(player.bestRound, guess.points)
          player.worstRound = Math.min(player.worstRound, guess.points)
          player.countries.add(country)
          playersInGame.add(guess.username)

          roundPointsTotal += guess.points
          roundGuessCount++
        })

        if (roundGuessCount > 0) {
          if (!gamesByDate[date]) {
            gamesByDate[date] = { totalRoundPoints: 0, totalRounds: 0, games: 0 }
          }

          const roundAverage = roundPointsTotal / roundGuessCount
          countryPerformance[country].total += roundPointsTotal / roundGuessCount
          countryPerformance[country].count++
          gamesByDate[date].totalRoundPoints += roundAverage
          gamesByDate[date].totalRounds++
          hasIncludedRounds = true
        }
      })

      playersInGame.forEach(username => {
        if (playerStats[username]) {
          playerStats[username].totalGames++
        }
      })

      if (hasIncludedRounds && gamesByDate[date]) {
        gamesByDate[date].games++
        totalIncludedGames++
      }

      if (game.result?.winner) {
        const winnerGuess = game.game.rounds[0]?.allGuesses?.find(g => g.playerId === game.result.winner)
        if (winnerGuess && !excludedUsersSet.has(winnerGuess.username) && playerStats[winnerGuess.username]) {
          playerStats[winnerGuess.username].wins++
        }
      }
    })

    Object.values(playerStats).forEach(player => {
      player.avgPoints = player.totalRounds > 0 ? Math.round(player.totalPoints / player.totalRounds) : 0
      player.avgTime = player.totalRounds > 0 ? Math.round(player.avgTime / player.totalRounds) : 0
      player.winRate = player.totalGames > 0 ? ((player.wins / player.totalGames) * 100).toFixed(1) : '0.0'
      player.countriesPlayed = player.countries.size
      delete player.countries
    })

    const allCountries = Object.values(countryPerformance)
      .filter(c => c.count > 0)
      .map(c => ({ 
        ...c, 
        avgPoints: Math.round(c.total / c.count)
      }))
      .sort((a, b) => b.avgPoints - a.avgPoints)
    
    const topCountries = allCountries.slice(0, 10).map(c => ({
      ...c,
      country: truncateText(c.country, 18)
    }))
    const worstCountries = allCountries.slice(-10).reverse().map(c => ({
      ...c,
      country: truncateText(c.country, 18)
    }))
    const mostOccurringCountries = [...allCountries]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const playerRankings = Object.values(playerStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)

    const performanceOverTime = Object.entries(gamesByDate)
      .map(([date, dayStats]) => ({
        date,
        avgPoints: dayStats.totalRounds > 0 ? Math.round(dayStats.totalRoundPoints / dayStats.totalRounds) : 0,
        games: dayStats.games
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    setStats({
      playerRankings,
      allCountries,
      topCountries,
      worstCountries,
      mostOccurringCountries,
      performanceOverTime,
      totalGames: totalIncludedGames,
      totalPlayers: Object.keys(playerStats).length
    })
  }

  if (!stats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  const topPlayer = stats.playerRankings[0]
  const myPlayer = currentUsername
    ? stats.playerRankings.find(player => player.username === currentUsername) || stats.playerRankings[0]
    : stats.playerRankings[0]
  const displayedRows = activeTab === 'my'
    ? (currentUsername
      ? stats.playerRankings.filter(player => player.username === currentUsername)
      : stats.playerRankings)
    : stats.playerRankings
  const isDark = theme === 'dark'
  const pageClass = isDark
    ? 'bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_40%,_#020617_100%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top,_#e2e8f0_0%,_#f8fafc_45%,_#eef2ff_100%)] text-slate-900'
  const surfaceClass = isDark
    ? 'bg-slate-900/60 border border-slate-700/60 shadow-2xl shadow-slate-950/40'
    : 'bg-white/85 border border-slate-200 shadow-xl shadow-slate-300/40'
  const textMutedClass = isDark ? 'text-slate-300' : 'text-slate-600'
  const tooltipTheme = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
    borderRadius: '10px',
    boxShadow: isDark ? '0 10px 30px rgba(2,6,23,0.4)' : '0 10px 30px rgba(15,23,42,0.08)'
  }
  const tooltipLabelTheme = { color: isDark ? '#e2e8f0' : '#0f172a' }
  const chartGridColor = isDark ? '#33415566' : '#94a3b84d'
  const chartAxisColor = isDark ? '#cbd5e1' : '#334155'
  const chartSeries = isDark ? CHART_SERIES.dark : CHART_SERIES.light

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageClass}`}>
      <header className={`sticky top-0 z-40 backdrop-blur-xl transition-colors duration-300 ${isDark ? 'border-b border-slate-700/70 bg-slate-950/80' : 'border-b border-slate-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-bold">WorldGuesser Dashboard</h1>
          </div>
          <div ref={headerMenuRef} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDataOpen(prev => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              aria-label="Toggle data scraping"
            >
              <Database className="w-4 h-4" />
              <span>Data</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              aria-label="Toggle light and dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFilterOpen(prev => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isDark
                  ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              aria-label="Toggle player filter"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            {isDataOpen && (
              <div className={`absolute right-0 top-full mt-2 w-96 rounded-xl p-3 text-left backdrop-blur ${surfaceClass}`}>
                <p className="text-sm font-semibold">Update Game Data</p>
                <p className={`mt-1 text-xs ${textMutedClass}`}>Paste your WorldGuessr secret and fetch fresh data into cookie storage.</p>
                <input
                  type="text"
                  value={myUsernameInput}
                  onChange={(event) => setMyUsernameInput(event.target.value)}
                  placeholder="Enter your username"
                  className={`mt-3 w-full rounded-md border px-3 py-2 text-sm outline-none ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-slate-500'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                  }`}
                />
                <input
                  type="password"
                  value={secretInput}
                  onChange={(event) => setSecretInput(event.target.value)}
                  placeholder="Enter your secret"
                  className={`mt-3 w-full rounded-md border px-3 py-2 text-sm outline-none ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-500 focus:border-slate-500'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                  }`}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleScrapeData}
                    disabled={isScraping || !myUsernameInput.trim()}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                      isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-800' : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300'
                    }`}
                  >
                    {isScraping ? 'Updating...' : 'Update Data'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCookieData}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    Clear Cookie Data
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenRawJson}
                    className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    View Raw JSON
                  </button>
                </div>
                {scrapeStatus && <p className={`mt-2 text-xs ${textMutedClass}`}>{scrapeStatus}</p>}
                {dataError && <p className="mt-1 text-xs text-rose-500">{dataError}</p>}
              </div>
            )}
            {isFilterOpen && (
              <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl p-3 text-left backdrop-blur ${surfaceClass}`}>
                <p className="text-sm font-semibold">Game Type</p>
                <p className={`mt-1 text-xs ${textMutedClass}`}>Filter by round time mode.</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'shootout', label: 'Shootout' },
                    { key: 'standard', label: 'Standard' }
                  ].map(option => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setRoundTypeFilter(option.key)}
                      className={`rounded-md px-2 py-1.5 text-xs transition-colors ${
                        roundTypeFilter === option.key
                          ? isDark
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-600 text-white'
                          : isDark
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'competitive' ? (
                  <>
                    <div className={`my-3 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <p className="text-sm font-semibold">Players</p>
                    <p className={`mt-1 text-xs ${textMutedClass}`}>Uncheck players to remove them from all statistics.</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExcludedUsers([])}
                        className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcludedUsers(allUsers)}
                        className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                          isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        Exclude All
                      </button>
                    </div>
                    <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1">
                      {allUsers.map(username => {
                        const isIncluded = !excludedUsers.includes(username)
                        return (
                          <label
                            key={username}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors ${
                              isDark ? 'bg-slate-800/80 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => toggleUserExclusion(username)}
                              className="accent-emerald-500"
                            />
                            <span className="truncate">{username}</span>
                          </label>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`my-3 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    <p className="text-sm font-semibold">Players</p>
                    <p className={`mt-1 text-xs ${textMutedClass}`}>
                      My Stats is automatically filtered to `{currentUsername || 'your profile'}`.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-4 sm:p-8">

        {gameData.length === 0 && (
          <div className={`mb-8 rounded-2xl p-4 ${surfaceClass}`}>
            <p className="text-sm font-medium">No game data loaded yet.</p>
            <p className={`mt-1 text-xs ${textMutedClass}`}>Open the `Data` menu in the header, paste your secret, and click `Update Data`.</p>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center gap-2">
          {[
            { key: 'my', label: 'My Stats' },
            { key: 'competitive', label: 'Competitive Stats' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setIsFilterOpen(false)
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          {activeTab === 'my' && currentUsername && (
            <span className={`text-xs ${textMutedClass}`}>
              Auto-filtering to `{currentUsername}`
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            title="Total Games"
            value={stats.totalGames}
            color="bg-purple-500"
            tooltip="This is how many games are in your data."
            isDark={isDark}
          />
          {activeTab === 'my' ? (
            <>
              <StatCard
                icon={<Target className="w-8 h-8" />}
                title="My Avg Points"
                value={myPlayer ? myPlayer.avgPoints : '-'}
                color="bg-emerald-500"
                tooltip="Your average points per round."
                isDark={isDark}
              />
              <StatCard
                icon={<Award className="w-8 h-8" />}
                title="My Win Rate"
                value={myPlayer ? `${myPlayer.winRate}%` : '-'}
                color="bg-amber-500"
                tooltip="Your win percentage in included games."
                isDark={isDark}
              />
            </>
          ) : (
            <>
              <StatCard
                icon={<Award className="w-8 h-8" />}
                title="Top Player"
                value={topPlayer?.username || 'N/A'}
                color="bg-amber-500"
                tooltip="The player with the most points overall."
                isDark={isDark}
              />
              <StatCard
                icon={<Target className="w-8 h-8" />}
                title="Top Score"
                value={topPlayer ? topPlayer.totalPoints.toLocaleString() : '-'}
                color="bg-emerald-500"
                tooltip="The highest total points reached by any player."
                isDark={isDark}
              />
            </>
          )}
        </div>

        {activeTab === 'competitive' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ChartCard
              title="Player Rankings"
              icon={<BarChart3 />}
              tooltip="Compares players by their total points, from highest to lowest."
              isDark={isDark}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.playerRankings}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="username" stroke={chartAxisColor} />
                  <YAxis stroke={chartAxisColor} />
                  <Tooltip 
                    contentStyle={tooltipTheme}
                    labelStyle={tooltipLabelTheme}
                  />
                  <Legend />
                  <Bar dataKey="totalPoints" fill={chartSeries.primary} name="Total Points" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Win Rate Comparison"
              icon={<Trophy />}
              tooltip="Shows how often each player wins their games."
              isDark={isDark}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.playerRankings}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="username" stroke={chartAxisColor} />
                  <YAxis stroke={chartAxisColor} />
                  <Tooltip 
                    contentStyle={tooltipTheme}
                    labelStyle={tooltipLabelTheme}
                  />
                  <Legend />
                  <Bar dataKey="winRate" fill={chartSeries.secondary} name="Win Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title={activeTab === 'my' ? 'My Round Score Density' : 'Average Points per Round'}
            icon={<TrendingUp />}
            tooltip={activeTab === 'my' ? 'Shows how often your round scores fall into each point range.' : 'Shows each player\'s usual points in a round.'}
            isDark={isDark}
          >
            <ResponsiveContainer width="100%" height={300}>
              {activeTab === 'my' ? (
                <AreaChart data={myRoundDensityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="range" stroke={chartAxisColor} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis stroke={chartAxisColor} unit="%" />
                  <Tooltip
                    contentStyle={tooltipTheme}
                    labelStyle={tooltipLabelTheme}
                    formatter={(value, name, payload) => {
                      if (name === 'density') return [`${value}%`, 'Density']
                      if (name === 'rounds') return [value, 'Rounds']
                      return [value, payload?.name || 'Value']
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="density" stroke={chartSeries.accent} fill={chartSeries.accent} fillOpacity={0.28} name="Density" />
                </AreaChart>
              ) : (
                <BarChart data={stats.playerRankings} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis dataKey="username" stroke={chartAxisColor} />
                  <YAxis stroke={chartAxisColor} />
                  <Tooltip 
                    contentStyle={tooltipTheme}
                    labelStyle={tooltipLabelTheme}
                  />
                  <Legend />
                  <Bar dataKey="avgPoints" fill={chartSeries.accent} name="Avg Points" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Performance Over Time"
            icon={<Clock />}
            tooltip="Shows your average points per round for each day."
            isDark={isDark}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartAxisColor} />
                <YAxis stroke={chartAxisColor} />
                <Tooltip 
                  contentStyle={tooltipTheme}
                  labelStyle={tooltipLabelTheme}
                />
                <Legend />
                <Line type="monotone" dataKey="avgPoints" stroke={chartSeries.trend} strokeWidth={3} name="Avg Points" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="mb-8">
          <ChartCard
            title="Country Performance Map"
            icon={<Globe />}
            tooltip="World map showing country performance by color gradient. Red indicates worst performance, yellow is average, and green is best performance. Hover over countries to see detailed statistics."
            isDark={isDark}
          >
            <WorldChoroplethMap 
              countryData={stats.allCountries} 
              gameData={filteredGames}
              isDark={isDark} 
            />
          </ChartCard>
        </div>

        <div className="mb-8">
          <ChartCard
            title="Top 5 Most Played Countries"
            icon={<Globe />}
            tooltip="Shows the 5 countries that appeared most often, ordered by occurrence."
            isDark={isDark}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.mostOccurringCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" stroke={chartAxisColor} />
                <YAxis type="category" dataKey="country" stroke={chartAxisColor} width={140} interval={0} />
                <Tooltip content={<CountryBarTooltip isDark={isDark} />} />
                <Legend />
                <Bar dataKey="avgPoints" fill={chartSeries.frequency} name="Avg Points" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {activeTab === 'competitive' && (
          <div className={`backdrop-blur-lg rounded-2xl p-6 ${surfaceClass}`}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Detailed Player Statistics
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Player</th>
                    <th className="text-right p-3">Total Points</th>
                    <th className="text-right p-3">Avg Points</th>
                    <th className="text-right p-3">Games</th>
                    <th className="text-right p-3">Wins</th>
                    <th className="text-right p-3">Win Rate</th>
                    <th className="text-right p-3">Best Round</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((player, index) => (
                    <tr
                      key={player.username}
                      className={`transition-colors ${isDark ? 'border-b border-slate-800 hover:bg-slate-800/60' : 'border-b border-slate-100 hover:bg-slate-100/70'}`}
                    >
                      <td className="p-3">
                        <span className={`font-bold ${index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : ''}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{player.username}</td>
                      <td className="text-right p-3">{player.totalPoints.toLocaleString()}</td>
                      <td className="text-right p-3">{player.avgPoints}</td>
                      <td className="text-right p-3">{player.totalGames}</td>
                      <td className="text-right p-3">{player.wins}</td>
                      <td className="text-right p-3">{player.winRate}%</td>
                      <td className="text-right p-3 text-emerald-400">{player.bestRound}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WorldChoroplethMap({ countryData, gameData, isDark }) {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState([0, 0])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [hoveredLocation, setHoveredLocation] = useState(null)

  const countryDataMap = useMemo(() => {
    const map = {}
    countryData.forEach(item => {
      const iso3 = COUNTRY_NAME_TO_ISO3[item.country]
      if (iso3) {
        map[iso3] = item
      }
      map[item.country] = item
    })
    
    Object.entries(GEOJSON_TO_COUNTRY_NAME).forEach(([geoName, ourName]) => {
      const data = countryData.find(c => c.country === ourName)
      if (data) {
        map[geoName] = data
      }
    })
    
    return map
  }, [countryData])

  const minPoints = useMemo(() => {
    if (countryData.length === 0) return 0
    return Math.min(...countryData.map(c => c.avgPoints))
  }, [countryData])

  const maxPoints = useMemo(() => {
    if (countryData.length === 0) return 5000
    return Math.max(...countryData.map(c => c.avgPoints))
  }, [countryData])

  const countryLocations = useMemo(() => {
    const locations = {}
    
    console.log('Building countryLocations...')
    console.log('gameData:', gameData)
    console.log('gameData is array?', Array.isArray(gameData))
    console.log('gameData length:', gameData?.length)
    
    if (!gameData || !Array.isArray(gameData)) {
      console.log('gameData is invalid, returning empty locations')
      return locations
    }
    
    let totalRounds = 0
    let processedRounds = 0
    
    gameData.forEach((game, gameIdx) => {
      if (game.game?.rounds) {
        totalRounds += game.game.rounds.length
        game.game.rounds.forEach((round, roundIdx) => {
          if (!round.location) {
            console.log(`Game ${gameIdx}, Round ${roundIdx}: No location`)
            return
          }
          
          let countryCode = round.location.country
          if (!countryCode && round.location.lat != null && round.location.long != null) {
            countryCode = getCountryFromCoordinates(round.location.lat, round.location.long)
          }
          const country = COUNTRY_NAMES[countryCode] || countryCode
          
          if (!country || country === 'Unknown') {
            console.log(`Game ${gameIdx}, Round ${roundIdx}: Unknown country (code: ${countryCode})`)
            return
          }
          
          if (!locations[country]) {
            locations[country] = []
          }
          
          if (round.location.lat != null && round.location.long != null) {
            locations[country].push({
              lat: round.location.lat,
              lng: round.location.long
            })
            processedRounds++
          }
        })
      }
    })
    
    console.log(`Processed ${processedRounds} out of ${totalRounds} rounds`)
    console.log('Final countryLocations:', locations)
    console.log('Countries found:', Object.keys(locations))
    
    return locations
  }, [gameData])

  const locationGuesses = useMemo(() => {
    const guesses = {}
    
    if (!gameData || !Array.isArray(gameData)) {
      return guesses
    }
    
    console.log('Building locationGuesses...')
    let totalGuesses = 0
    
    gameData.forEach((game, gameIdx) => {
      game.game?.rounds?.forEach((round, roundIdx) => {
        if (!round.location) return
        
        let countryCode = round.location.country
        if (!countryCode && round.location.lat != null && round.location.long != null) {
          countryCode = getCountryFromCoordinates(round.location.lat, round.location.long)
        }
        const country = COUNTRY_NAMES[countryCode] || countryCode
        if (!country || country === 'Unknown') return
        
        if (round.location.lat != null && round.location.long != null) {
          const locationKey = `${round.location.lat},${round.location.long}`
          
          if (!guesses[locationKey]) {
            guesses[locationKey] = {
              actualLat: round.location.lat,
              actualLng: round.location.long,
              country: country,
              guesses: []
            }
          }
          
          const guessesArray = round.allGuesses || []
          
          guessesArray.forEach((guess) => {
            if (guess.guessLat != null && guess.guessLong != null) {
              guesses[locationKey].guesses.push({
                lat: guess.guessLat,
                lng: guess.guessLong,
                player: guess.username || 'Unknown'
              })
              totalGuesses++
            }
          })
        }
      })
    })
    
    console.log(`Total guesses extracted: ${totalGuesses}`)
    console.log('locationGuesses:', guesses)
    console.log('Sample location keys:', Object.keys(guesses).slice(0, 5))
    
    return guesses
  }, [gameData])

  const getCountryBounds = (countryName) => {
    const locations = countryLocations[countryName]
    if (!locations || locations.length === 0) return null
    
    const lats = locations.map(l => l.lat)
    const lngs = locations.map(l => l.lng)
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
      centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    }
  }

  const getColorForPoints = (points) => {
    if (points == null) return isDark ? '#1e293b' : '#e2e8f0'
    
    const normalized = (points - minPoints) / (maxPoints - minPoints)
    
    const red = { r: 239, g: 68, b: 68 }
    const yellow = { r: 250, g: 204, b: 21 }
    const green = { r: 34, g: 197, b: 94 }
    
    let r, g, b
    if (normalized < 0.5) {
      const t = normalized * 2
      r = Math.round(red.r + (yellow.r - red.r) * t)
      g = Math.round(red.g + (yellow.g - red.g) * t)
      b = Math.round(red.b + (yellow.b - red.b) * t)
    } else {
      const t = (normalized - 0.5) * 2
      r = Math.round(yellow.r + (green.r - yellow.r) * t)
      g = Math.round(yellow.g + (green.g - yellow.g) * t)
      b = Math.round(yellow.b + (green.b - yellow.b) * t)
    }
    
    return `rgb(${r}, ${g}, ${b})`
  }

  const handleMouseMove = (event) => {
    const tooltipWidth = 200
    const tooltipHeight = 80
    const offset = 5
    
    let x = event.clientX + offset
    let y = event.clientY + offset
    
    if (x + tooltipWidth > window.innerWidth) {
      x = event.clientX - tooltipWidth - offset
    }
    
    if (y + tooltipHeight > window.innerHeight) {
      y = event.clientY - tooltipHeight - offset
    }
    
    setTooltipPosition({ x, y })
  }

  const handleZoomIn = () => {
    setZoom(z => Math.min(z * 1.5, 8))
  }

  const handleZoomOut = () => {
    setZoom(z => Math.max(z / 1.5, 1))
  }

  const handleMoveEnd = (position) => {
    setCenter(position.coordinates)
    setZoom(position.zoom)
  }

  const handleCountryClick = (countryInfo) => {
    if (!countryInfo) return
    
    console.log('Clicked country:', countryInfo.country)
    console.log('All countryLocations:', countryLocations)
    console.log('Countries with locations:', Object.keys(countryLocations))
    console.log('Number of countries with locations:', Object.keys(countryLocations).length)
    
    const bounds = getCountryBounds(countryInfo.country)
    if (!bounds) {
      console.log(`No locations found for ${countryInfo.country}`)
      return
    }
    
    setSelectedCountry(countryInfo.country)
    setCenter([bounds.centerLng, bounds.centerLat])
    setZoom(5)
  }

  const handleReset = () => {
    setSelectedCountry(null)
    setCenter([0, 0])
    setZoom(1)
  }

  const handleLocationClick = (lat, lng) => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {selectedCountry && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`rounded-lg px-4 py-3 text-sm shadow-lg ${
            isDark ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'
          }`}>
            <p className="font-bold text-base mb-1">{selectedCountry}</p>
            <p className="text-xs mb-3">{countryLocations[selectedCountry]?.length || 0} locations visited</p>
            <button
              onClick={handleReset}
              className={`w-full rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              ← Back to World Map
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className={`w-8 h-8 rounded flex items-center justify-center font-bold transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300'
          }`}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className={`w-8 h-8 rounded flex items-center justify-center font-bold transition-colors ${
            isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-100' : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-300'
          }`}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120
        }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties?.name || geo.id
                const countryInfo = countryDataMap[geo.id] || countryDataMap[geoName]
                const fillColor = countryInfo 
                  ? getColorForPoints(countryInfo.avgPoints)
                  : (isDark ? '#1e293b' : '#e2e8f0')
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke={isDark ? '#475569' : '#cbd5e1'}
                    strokeWidth={0.5}
                    style={{
                      default: { 
                        outline: 'none', 
                        cursor: countryInfo ? 'pointer' : 'default',
                        pointerEvents: 'all'
                      },
                      hover: { 
                        fill: countryInfo ? fillColor : (isDark ? '#334155' : '#cbd5e1'),
                        outline: 'none',
                        opacity: 0.8,
                        cursor: countryInfo ? 'pointer' : 'default',
                        pointerEvents: 'all'
                      },
                      pressed: { 
                        outline: 'none',
                        pointerEvents: 'all'
                      }
                    }}
                    onMouseEnter={() => {
                      if (countryInfo) {
                        setHoveredCountry(countryInfo)
                      }
                    }}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => {
                      console.log('Country clicked:', countryInfo?.country)
                      handleCountryClick(countryInfo)
                    }}
                  />
                )
              })
            }
          </Geographies>
          
          {selectedCountry && hoveredLocation && locationGuesses[hoveredLocation] && (
            <>
              {locationGuesses[hoveredLocation].guesses.map((guess, idx) => (
                <MapLine
                  key={`line-${idx}`}
                  from={[locationGuesses[hoveredLocation].actualLng, locationGuesses[hoveredLocation].actualLat]}
                  to={[guess.lng, guess.lat]}
                  stroke={isDark ? '#60a5fa' : '#3b82f6'}
                  strokeWidth={0.5}
                  strokeOpacity={0.8}
                  strokeLinecap="round"
                />
              ))}
              {locationGuesses[hoveredLocation].guesses.map((guess, idx) => (
                <Marker key={`marker-${idx}`} coordinates={[guess.lng, guess.lat]}>
                  <g>
                    <circle
                      r={0.5}
                      fill={isDark ? '#60a5fa' : '#3b82f6'}
                      stroke="none"
                    />
                    <text
                      textAnchor="middle"
                      y={-1.5}
                      style={{
                        fontFamily: 'system-ui',
                        fontSize: '3px',
                        fill: isDark ? '#e0e7ff' : '#1e3a8a',
                        fontWeight: 'bold',
                        pointerEvents: 'none'
                      }}
                    >
                      {guess.player}
                    </text>
                  </g>
                </Marker>
              ))}
            </>
          )}
          
          {selectedCountry && countryLocations[selectedCountry] && (
            countryLocations[selectedCountry].map((location, idx) => (
              <Marker 
                key={idx} 
                coordinates={[location.lng, location.lat]}
                onClick={() => handleLocationClick(location.lat, location.lng)}
              >
                <g 
                  className="cursor-pointer" 
                  style={{ pointerEvents: 'all' }}
                  onMouseEnter={() => {
                    const key = `${location.lat},${location.lng}`
                    console.log('Hovering over location:', key)
                    console.log('locationGuesses for this key:', locationGuesses[key])
                    setHoveredLocation(key)
                  }}
                  onMouseLeave={() => {
                    console.log('Mouse left location')
                    setHoveredLocation(null)
                  }}
                >
                  <circle
                    r={0.75}
                    fill="#ef4444"
                    stroke="none"
                    className="transition-all hover:r-6"
                  />
                  <circle
                    r={4}
                    fill="transparent"
                    className="cursor-pointer"
                  />
                </g>
              </Marker>
            ))
          )}
        </ZoomableGroup>
      </ComposableMap>

      {hoveredCountry && (
        <div
          className={`fixed z-50 pointer-events-none rounded-lg px-3 py-2 text-sm shadow-xl ${
            isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'
          }`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`
          }}
        >
          <p className="font-semibold mb-1">{hoveredCountry.country}</p>
          <p>Avg Points: {hoveredCountry.avgPoints}</p>
          <p>Rounds Seen: {hoveredCountry.count.toLocaleString()}</p>
        </div>
      )}

      <div className={`mt-4 flex items-center justify-center gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span>Worst</span>
        <div className="flex items-center gap-1">
          <div className="w-8 h-4 rounded" style={{ background: 'rgb(239, 68, 68)' }}></div>
          <div className="w-8 h-4 rounded" style={{ background: 'rgb(250, 204, 21)' }}></div>
          <div className="w-8 h-4 rounded" style={{ background: 'rgb(34, 197, 94)' }}></div>
        </div>
        <span>Best</span>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color, tooltip, isDark }) {
  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-900/60 border border-slate-700/60 shadow-2xl shadow-slate-950/40' : 'bg-white/85 border border-slate-200 shadow-xl shadow-slate-300/40'}`}>
      <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <h3 className={`text-sm font-medium mb-1 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span>{title}</span>
        {tooltip && (
          <span className="relative group inline-flex items-center">
            <Info className={`w-4 h-4 cursor-help ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg px-3 py-2 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'}`}>
              {tooltip}
            </span>
          </span>
        )}
      </h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function CountryBarTooltip({ active, payload, isDark }) {
  if (!active || !payload || payload.length === 0) return null

  const countryData = payload[0]?.payload
  if (!countryData) return null

  return (
    <div className={`rounded-lg px-3 py-2 text-xs shadow-xl ${isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'}`}>
      <p className="font-semibold mb-1">{countryData.country}</p>
      <p>Avg Points: {countryData.avgPoints}</p>
      <p>Rounds Seen: {countryData.count.toLocaleString()}</p>
    </div>
  )
}

function ChartCard({ title, icon, tooltip, children, isDark }) {
  return (
    <div className={`backdrop-blur-lg rounded-2xl p-6 ${isDark ? 'bg-slate-900/60 border border-slate-700/60 shadow-2xl shadow-slate-950/40' : 'bg-white/85 border border-slate-200 shadow-xl shadow-slate-300/40'}`}>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        {icon}
        <span>{title}</span>
        {tooltip && (
          <span className="relative group inline-flex items-center">
            <Info className={`w-4 h-4 cursor-help ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg px-3 py-2 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-200'}`}>
              {tooltip}
            </span>
          </span>
        )}
      </h2>
      {children}
    </div>
  )
}

export default App
