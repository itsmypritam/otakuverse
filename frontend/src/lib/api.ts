const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "API error" }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

async function fetchStream<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/stream${path}`)
  if (!res.ok) throw new Error(`Stream API error: ${res.status}`)
  return res.json()
}

export function proxyM3u8(rawUrl: string): string {
  return `${API_BASE}/stream/m3u8?url=${encodeURIComponent(rawUrl)}`
}

export interface AniListTitle {
  romaji?: string
  english?: string
  native?: string
}

export interface AniListCoverImage {
  extraLarge?: string
  large?: string
  medium?: string
  color?: string
}

export interface AniListStreamingEpisode {
  title: string
  thumbnail: string
  url: string
  site: string
}

export interface AniListCharacterEdge {
  role: string
  node: {
    id: number
    name: { full: string; native?: string }
    image: { large: string; medium: string }
  }
  voiceActors?: {
    id: number
    name: { full: string }
    image: { large: string; medium: string }
    language: string
  }[]
}

export interface AniListMedia {
  id: number
  idMal?: number
  title: AniListTitle
  description?: string
  coverImage: AniListCoverImage
  bannerImage?: string
  genres?: string[]
  tags?: { name: string; rank: number }[]
  season?: string
  seasonYear?: number
  episodes?: number
  duration?: number
  status?: string
  averageScore?: number
  meanScore?: number
  popularity?: number
  favourites?: number
  format?: string
  source?: string
  studios?: { nodes: { name: string }[] }
  trailer?: { id: string; site: string; thumbnail: string }
  characters?: { edges: AniListCharacterEdge[] }
  streamingEpisodes?: AniListStreamingEpisode[]
  nextAiringEpisode?: { airingAt: number; timeUntilAiring: number; episode: number }
}

export interface ConsumetSearchResult {
  id: string
  title: string
  coverImage: string
}

export interface ConsumetEpisode {
  id: string
  number: number
  title: string
}

export interface ConsumetSource {
  url: string
  quality: string
  isM3U8: boolean
}

export interface ConsumetSubtitle {
  url: string
  lang: string
}

export interface ConsumetWatchData {
  sources: ConsumetSource[]
  subtitles: ConsumetSubtitle[]
  servers: { url: string; label: string }[]
  selectedServer: number
}

export interface ConsumetInfoData {
  episodes: ConsumetEpisode[]
}

export interface ConsumetSearchData {
  results: ConsumetSearchResult[]
}

export const api = {
  anilist: {
    trending: (perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/trending?perPage=${perPage}`),
    top: (sort = "POPULARITY_DESC", perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/top?sort=${sort}&perPage=${perPage}`),
    airing: (perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/airing?perPage=${perPage}`),
    upcoming: (perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/upcoming?perPage=${perPage}`),
    seasonal: (season: string, year: number, perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/seasonal?season=${season}&year=${year}&perPage=${perPage}`),
    search: (q: string, perPage = 20) =>
      fetchApi<AniListMedia[]>(`/anilist/search?q=${encodeURIComponent(q)}&perPage=${perPage}`),
    byId: (id: number) =>
      fetchApi<AniListMedia>(`/anilist/media/${id}`),
  },

  consumet: {
    search: (q: string) =>
      fetchStream<ConsumetSearchData>(`/search?q=${encodeURIComponent(q)}`),
    info: (id: string, lang = "sub") =>
      fetchStream<ConsumetInfoData>(`/info?id=${encodeURIComponent(id)}&lang=${lang}`),
    watch: (episodeId: string, lang = "sub") =>
      fetchStream<ConsumetWatchData>(`/watch?episodeId=${encodeURIComponent(episodeId)}&lang=${lang}`),
  },
}
