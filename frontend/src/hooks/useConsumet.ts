import { useState, useEffect, useRef } from "react"
import { api, type ConsumetEpisode, type ConsumetWatchData, type ConsumetSearchResult, type AniListMedia } from "@/lib/api"

function slugify(title: string): string {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function titleVariations(title: string): string[] {
  const results: string[] = [slugify(title)]
  const seasonMatch = title.match(/^(.+?)\s*Season\s*(\d+)$/i)
  if (seasonMatch) {
    const [, base, num] = seasonMatch
    results.push(`${slugify(base)}-${num}`)
    results.push(`${slugify(base)}-season-${num}`)
  }
  const romanMatch = title.match(/^(.+?)\s*(IV|III|II|I)$/i)
  if (romanMatch) {
    const map: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4" }
    results.push(`${slugify(romanMatch[1])}-${map[romanMatch[2].toLowerCase()]}`)
  }
  return [...new Set(results)]
}

function findBestMatch(searchResults: ConsumetSearchResult[], titles: string[]): string | null {
  if (!searchResults.length) return null
  const lowerTitles = titles.map((t) => t.toLowerCase().trim())

  for (const t of lowerTitles) {
    const exact = searchResults.find((r) => r.title.toLowerCase().trim() === t)
    if (exact) return exact.id
  }

  const nonSpecial = searchResults.filter(
    (r) => !/movie|ova|film|special|recap/i.test(r.id)
  )
  if (!nonSpecial.length) return searchResults[0].id

  for (const t of lowerTitles) {
    const starts = nonSpecial.find(
      (r) => r.title.toLowerCase().trim().startsWith(t) || t.startsWith(r.title.toLowerCase().trim())
    )
    if (starts) return starts.id
  }

  return nonSpecial[0].id
}

export function useConsumetEpisodes(slug: string | null) {
  const [episodes, setEpisodes] = useState<ConsumetEpisode[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) { setEpisodes([]); return }
    let cancelled = false
    setLoading(true)
    api.consumet.info(slug).then((data) => {
      if (!cancelled) {
        setEpisodes((data.episodes || []).sort((a, b) => a.number - b.number))
        setLoading(false)
      }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  return { episodes, loading }
}

export function useConsumetWatch(episodeId: string | null) {
  const [watchData, setWatchData] = useState<ConsumetWatchData & { activeServer?: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!episodeId) { setWatchData(null); return }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let cancelled = false
    setLoading(true)
    setWatchData(null)

    api.consumet.watch(episodeId).then((data) => {
      if (!cancelled && !controller.signal.aborted) {
        setWatchData(data)
        setLoading(false)
      }
    }).catch(() => {
      if (!cancelled && !controller.signal.aborted) setLoading(false)
    })

    return () => { cancelled = true; controller.abort() }
  }, [episodeId])

  return { watchData, loading }
}

export function useResolveSlug(anime: AniListMedia | null): {
  slug: string | null
  slugLoading: boolean
} {
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Depend only on anime.id — avoids re-resolving on every object reference change
  const animeId = anime?.id ?? null

  useEffect(() => {
    if (!anime || !animeId) { setSlug(null); return }

    const titles = [
      anime.title?.english,
      anime.title?.romaji,
      anime.title?.native,
    ].filter((t): t is string => !!t)

    if (!titles.length) { setSlug(null); return }

    let cancelled = false
    setLoading(true)

    const resolve = async () => {
      for (const title of titles) {
        try {
          const searchData = await api.consumet.search(title)
          if (cancelled) return
          if (searchData.results?.length) {
            const best = findBestMatch(searchData.results, titles)
            if (best) { setSlug(best); setLoading(false); return }
          }
        } catch { }
      }

      for (const title of titles) {
        const variations = titleVariations(title)
        for (const v of variations) {
          try {
            const info = await api.consumet.info(v)
            if (cancelled) return
            if (info.episodes?.length) { setSlug(v); setLoading(false); return }
          } catch { }
        }
      }

      if (!cancelled) { setSlug(null); setLoading(false) }
    }

    resolve()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId])

  return { slug, slugLoading: loading }
}
