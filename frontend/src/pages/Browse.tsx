import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getScore, getTitle } from "@/lib/constants"
import { useAniListTop, useAniListSearch, useAniListAiring, useAniListUpcoming } from "@/hooks/useAniList"

const PER_PAGE = 20
const MAX_FETCH = 50 // AniList hard limit per query

const FILTERS = [
  { label: "Popular", value: "popular" },
  { label: "Airing", value: "airing" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Top Rated", value: "top_rated" },
] as const

export function BrowsePage() {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("popular")
  const [page, setPage] = useState(1)

  // Cap fetch at AniList max (50). Page 1 = items 0-19, page 2 = items 20-39, page 3+ unavailable
  const safePage = Math.min(page, Math.floor(MAX_FETCH / PER_PAGE))
  const { media: popular, loading: loadingPopular } = useAniListTop("POPULARITY_DESC", PER_PAGE, safePage)
  const { media: airing, loading: loadingAiring } = useAniListAiring(PER_PAGE, safePage)
  const { media: upcoming, loading: loadingUpcoming } = useAniListUpcoming(PER_PAGE, safePage)
  const { media: topRated, loading: loadingTop } = useAniListTop("SCORE_DESC", PER_PAGE, safePage)
  const { results: searchResults, loading: searchLoading } = useAniListSearch(search)

  const filterMap: Record<string, { media: typeof popular; loading: boolean }> = {
    popular: { media: popular, loading: loadingPopular },
    airing: { media: airing, loading: loadingAiring },
    upcoming: { media: upcoming, loading: loadingUpcoming },
    top_rated: { media: topRated, loading: loadingTop },
  }

  const displayMedia = search ? searchResults : filterMap[activeFilter]?.media || []
  const loading = search ? searchLoading : filterMap[activeFilter]?.loading || false

  const handleFilterChange = (value: string) => {
    setActiveFilter(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-medium text-white tracking-tight">Browse Anime</h1>
          <p className="mt-2 text-[#6c6a64]">Discover your next favorite series</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c6a64]" />
            <Input
              placeholder="Search anime..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 bg-[#1f1e1b] border-[#252320] text-white placeholder:text-[#6c6a64] focus:ring-[#cc785c]"
            />
          </div>
        </div>

        {!search && (
          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? "bg-[#cc785c] text-white"
                    : "bg-[#1f1e1b] text-[#a09d96] hover:bg-[#252320] hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#252320] border-t-[#cc785c]" />
          </div>
        ) : displayMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="h-12 w-12 text-[#6c6a64] mb-4" />
            <h3 className="text-lg font-medium text-white">No results found</h3>
            <p className="text-sm text-[#6c6a64] mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {displayMedia.map((a) => (
                <Link key={a.id} to={`/anime/${a.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#1f1e1b]">
                    <img
                      src={getImageUrl(a)}
                      alt={getTitle(a)}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="coral" className="text-[10px] px-1.5 py-0">
                        <Star className="h-2.5 w-2.5 fill-white mr-0.5" />
                        {getScore(a)}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <h3 className="text-sm font-medium text-white line-clamp-1">{getTitle(a)}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#6c6a64]">
                      <span>{a.episodes ? `${a.episodes} eps` : "?"}</span>
                      {a.format && <span>{a.format}</span>}
                      {a.genres?.slice(0, 1).map((g) => (
                        <Badge key={g} variant="outline" className="text-[10px] px-1.5 py-0 border-[#252320] text-[#6c6a64]">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!search && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="dark"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#6c6a64]">Page {page}</span>
                <Button
                  variant="dark"
                  disabled={loading || page >= Math.floor(MAX_FETCH / PER_PAGE)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
