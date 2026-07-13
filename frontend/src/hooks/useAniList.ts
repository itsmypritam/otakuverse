import { useState, useEffect } from "react"
import { api, type AniListMedia } from "@/lib/api"

export function useAniListTrending(perPage = 20, page = 1) {
  const [media, setMedia] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // perPage * page gives us a simple client-side window — fetch enough and slice
    api.anilist.trending(perPage * page)
      .then((all) => setMedia(all.slice((page - 1) * perPage, page * perPage)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [perPage, page])

  return { media, loading }
}

export function useAniListTop(sort = "POPULARITY_DESC", perPage = 20, page = 1) {
  const [media, setMedia] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.anilist.top(sort, perPage * page)
      .then((all) => setMedia(all.slice((page - 1) * perPage, page * perPage)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sort, perPage, page])

  return { media, loading }
}

export function useAniListAiring(perPage = 20, page = 1) {
  const [media, setMedia] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.anilist.airing(perPage * page)
      .then((all) => setMedia(all.slice((page - 1) * perPage, page * perPage)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [perPage, page])

  return { media, loading }
}

export function useAniListUpcoming(perPage = 20, page = 1) {
  const [media, setMedia] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.anilist.upcoming(perPage * page)
      .then((all) => setMedia(all.slice((page - 1) * perPage, page * perPage)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [perPage, page])

  return { media, loading }
}

export function useAniListSearch(query: string, perPage = 20) {
  const [results, setResults] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) { setResults([]); return }
    setLoading(true)
    api.anilist.search(query, perPage)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query, perPage])

  return { results, loading }
}

export function useAniListMedia(id: number | null) {
  const [media, setMedia] = useState<AniListMedia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.anilist.byId(id)
      .then(setMedia)
      .catch(() => setMedia(null))
      .finally(() => setLoading(false))
  }, [id])

  return { media, loading }
}
