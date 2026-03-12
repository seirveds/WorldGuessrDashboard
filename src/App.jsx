import { useState, useEffect } from 'react'
import { Trophy, TrendingUp, Target, Clock, Globe, Users, Award, BarChart3, TrendingDown } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import gameData from '../worldguesser_data.json'

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

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
  'AF': 'Afghanistan'
}

const truncateText = (text, maxLength = 18) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

function App() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    processGameData()
  }, [])

  const processGameData = () => {
    const playerStats = {}
    const gamesByDate = {}
    const countryPerformance = {}
    
    gameData.forEach(game => {
      if (!game.game?.rounds) return
      
      const date = new Date(game.startedAt).toLocaleDateString()
      if (!gamesByDate[date]) gamesByDate[date] = []
      gamesByDate[date].push(game)

      game.game.rounds.forEach(round => {
        if (!round.allGuesses) return
        
        const countryCode = round.location.country
        const country = COUNTRY_NAMES[countryCode] || countryCode
        if (!countryPerformance[country]) {
          countryPerformance[country] = { total: 0, count: 0, country }
        }

        round.allGuesses.forEach(guess => {
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

          if (guess.username === game.userStats?.username || 
              (round.allGuesses[0]?.username === guess.username && round.allGuesses[0]?.points === Math.max(...round.allGuesses.map(g => g.points)))) {
            countryPerformance[country].total += guess.points
            countryPerformance[country].count++
          }
        })
      })

      Object.values(playerStats).forEach(player => {
        player.totalGames++
      })

      if (game.result?.winner) {
        const winnerGuess = game.game.rounds[0]?.allGuesses?.find(g => g.playerId === game.result.winner)
        if (winnerGuess && playerStats[winnerGuess.username]) {
          playerStats[winnerGuess.username].wins++
        }
      }
    })

    Object.values(playerStats).forEach(player => {
      player.avgPoints = Math.round(player.totalPoints / player.totalRounds)
      player.avgTime = Math.round(player.avgTime / player.totalRounds)
      player.winRate = ((player.wins / player.totalGames) * 100).toFixed(1)
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

    const playerRankings = Object.values(playerStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)

    const performanceOverTime = Object.entries(gamesByDate)
      .map(([date, games]) => ({
        date,
        avgPoints: Math.round(games.reduce((sum, g) => sum + (g.userStats?.totalPoints || 0), 0) / games.length),
        games: games.length
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    setStats({
      playerRankings,
      topCountries,
      worstCountries,
      performanceOverTime,
      totalGames: gameData.length,
      totalPlayers: Object.keys(playerStats).length
    })
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  const topPlayer = stats.playerRankings[0]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold text-white">WorldGuesser Dashboard</h1>
          </div>
          <p className="text-white/80 text-lg">Competitive Performance Analytics</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            title="Total Games"
            value={stats.totalGames}
            color="bg-purple-500"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            title="Total Players"
            value={stats.totalPlayers}
            color="bg-pink-500"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            title="Top Player"
            value={topPlayer.username}
            color="bg-amber-500"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="Top Score"
            value={topPlayer.totalPoints.toLocaleString()}
            color="bg-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Player Rankings" icon={<BarChart3 />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.playerRankings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="username" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="totalPoints" fill="#8b5cf6" name="Total Points" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Win Rate Comparison" icon={<Trophy />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.playerRankings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="username" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="winRate" fill="#ec4899" name="Win Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Average Points per Round" icon={<TrendingUp />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.playerRankings} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="username" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgPoints" fill="#10b981" name="Avg Points" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Performance Over Time" icon={<Clock />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.performanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="avgPoints" stroke="#f59e0b" strokeWidth={3} name="Avg Points" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Top Countries by Performance" icon={<TrendingUp />}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.topCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis type="number" stroke="#fff" />
                <YAxis type="category" dataKey="country" stroke="#fff" width={120} interval={0} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgPoints" fill="#10b981" name="Avg Points" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Worst Countries by Performance" icon={<TrendingDown />}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.worstCountries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis type="number" stroke="#fff" />
                <YAxis type="category" dataKey="country" stroke="#fff" width={120} interval={0} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgPoints" fill="#ef4444" name="Avg Points" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Detailed Player Statistics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
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
                {stats.playerRankings.map((player, index) => (
                  <tr key={player.username} className="border-b border-white/10 hover:bg-white/5 transition-colors">
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
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl hover:scale-105 transition-transform">
      <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-white/70 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  )
}

function ChartCard({ title, icon, children }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

export default App
