const BASE_URL = 'https://api.worldguessr.com/api/'
const DEFAULT_HEADERS = {
  accept: '*/*',
  'content-type': 'application/json'
}

const COOKIE_KEY = 'wg_dashboard_data'
const COOKIE_STORAGE_MODE_KEY = 'wg_dashboard_storage_mode'
const LOCAL_STORAGE_KEY = 'wg_dashboard_data_local'
const COOKIE_CHUNK_SIZE = 1700
const MAX_COOKIE_CHUNKS = 2
const COOKIE_DAYS = 7

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const postJson = async (endpoint, payload) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`WorldGuessr API request failed (${response.status})`)
  }

  return response.json()
}

const getCookie = (name) => {
  const prefix = `${name}=`
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(prefix))
    ?.slice(prefix.length)
}

const setCookie = (name, value, days = COOKIE_DAYS) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
}

export const clearGamesCookie = () => {
  const cookieNames = document.cookie
    .split(';')
    .map(c => c.trim().split('=')[0])
    .filter(Boolean)

  cookieNames
    .filter(name => name.startsWith(`${COOKIE_KEY}_`))
    .forEach(name => deleteCookie(name))

  deleteCookie(`${COOKIE_KEY}_count`)
  deleteCookie(COOKIE_STORAGE_MODE_KEY)
  localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export const saveGamesToCookie = (games) => {
  const serialized = encodeURIComponent(JSON.stringify(games))
  const chunks = []

  for (let i = 0; i < serialized.length; i += COOKIE_CHUNK_SIZE) {
    chunks.push(serialized.slice(i, i + COOKIE_CHUNK_SIZE))
  }

  if (chunks.length <= MAX_COOKIE_CHUNKS) {
    clearGamesCookie()
    setCookie(COOKIE_STORAGE_MODE_KEY, 'cookie')
    setCookie(`${COOKIE_KEY}_count`, String(chunks.length))
    chunks.forEach((chunk, index) => {
      setCookie(`${COOKIE_KEY}_${index}`, chunk)
    })

    return true
  }

  try {
    clearGamesCookie()
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(games))
    setCookie(COOKIE_STORAGE_MODE_KEY, 'local')
    return true
  } catch {
    return false
  }
}

export const loadGamesFromCookie = () => {
  const storageMode = getCookie(COOKIE_STORAGE_MODE_KEY)

  if (storageMode === 'local') {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  const count = Number(getCookie(`${COOKIE_KEY}_count`) || 0)
  if (!count) {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }

  let combined = ''
  for (let i = 0; i < count; i++) {
    const chunk = getCookie(`${COOKIE_KEY}_${i}`)
    if (!chunk) return []
    combined += chunk
  }

  try {
    return JSON.parse(decodeURIComponent(combined))
  } catch {
    return []
  }
}

export const scrapeGamesFromSecret = async (secret, onProgress) => {
  if (!secret) {
    throw new Error('Secret is required')
  }

  const allGames = []
  let page = 1

  while (true) {
    onProgress?.(`Loading game history page ${page}...`)
    const historyResponse = await postJson('gameHistory', { secret, page, limit: 50 })
    const games = historyResponse?.games || []

    if (games.length === 0) {
      break
    }

    for (let index = 0; index < games.length; index++) {
      const game = games[index]
      onProgress?.(`Fetching game ${allGames.length + 1} details...`)
      const detailsResponse = await postJson('gameDetails', {
        gameId: game.gameId,
        secret
      })

      game.game = detailsResponse?.game || null
      allGames.push(game)
      await delay(250)
    }

    page += 1
    await delay(800)
  }

  onProgress?.(`Finished: ${allGames.length} games loaded.`)
  return allGames
}
