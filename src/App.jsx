import { useState, useEffect, useMemo, useRef } from 'react'
import { Trophy, TrendingUp, Target, Clock, Globe, Award, BarChart3, TrendingDown, Info, Filter, Sun, Moon, Database } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
        
        const countryCode = round.location.country
        const country = COUNTRY_NAMES[countryCode] || countryCode
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
        avgPoints: Math.round(c.total / c.count),
        country: truncateText(c.country, 18)
      }))
      .sort((a, b) => b.avgPoints - a.avgPoints)
    
    const topCountries = allCountries.slice(0, 10)
    const worstCountries = allCountries.slice(-10).reverse()
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard
            title="Top Countries by Performance"
            icon={<TrendingUp />}
            tooltip="Countries with the highest average points."
            isDark={isDark}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" stroke={chartAxisColor} />
                <YAxis type="category" dataKey="country" stroke={chartAxisColor} width={120} interval={0} />
                <Tooltip content={<CountryBarTooltip isDark={isDark} />} />
                <Legend />
                <Bar dataKey="avgPoints" fill={chartSeries.positive} name="Avg Points" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Worst Countries by Performance"
            icon={<TrendingDown />}
            tooltip="Countries with the lowest average points."
            isDark={isDark}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.worstCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" stroke={chartAxisColor} />
                <YAxis type="category" dataKey="country" stroke={chartAxisColor} width={120} interval={0} />
                <Tooltip content={<CountryBarTooltip isDark={isDark} />} />
                <Legend />
                <Bar dataKey="avgPoints" fill={chartSeries.negative} name="Avg Points" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
