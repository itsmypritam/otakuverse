import { useParams, Link } from "react-router-dom"
import { Star, Clock, Play, ChevronLeft, Calendar, BookmarkPlus, BookmarkCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getImageUrl, getScore, getTitle, getStatusLabel, getStatusColor } from "@/lib/constants"
import { useAniListMedia } from "@/hooks/useAniList"

const STORAGE_KEY = "otakuverse_watchlist"

interface WatchlistItem {
  anilistId: number
  title: string
  coverImage?: string
}

function getWatchlist(): WatchlistItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function setWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function AnimeDetailPage() {
  const { id: animeId } = useParams<{ id: string }>()
  const id = animeId ? parseInt(animeId) : null
  const { media: anime, loading } = useAniListMedia(id)

  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (!id) return
    const items = getWatchlist()
    setInWatchlist(items.some((i) => i.anilistId === id))
  }, [id])

  const toggleWatchlist = () => {
    if (!anime) return
    const items = getWatchlist()
    if (inWatchlist) {
      setWatchlist(items.filter((i) => i.anilistId !== anime.id))
      setInWatchlist(false)
    } else {
      setWatchlist([...items, {
        anilistId: anime.id,
        title: getTitle(anime),
        coverImage: anime.coverImage?.extraLarge || anime.coverImage?.large,
      }])
      setInWatchlist(true)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141413]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#252320] border-t-[#cc785c]" />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#141413]">
        <p className="text-lg font-medium text-white">Anime not found</p>
        <Link to="/browse"><Button variant="dark">Browse Anime</Button></Link>
      </div>
    )
  }

  const title = getTitle(anime)

  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="relative bg-[#181715]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(anime)}
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link to="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-[#6c6a64] hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Browse
          </Link>

          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full md:w-72 shrink-0">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#1f1e1b]">
                <img src={getImageUrl(anime)} alt={title} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {anime.genres?.slice(0, 4).map((g) => (
                  <Badge key={g} variant="dark" className="text-xs">{g}</Badge>
                ))}
              </div>
              <h1 className="font-serif text-4xl font-medium text-white tracking-tight">
                {title}
              </h1>
              {anime.title?.native && (
                <p className="mt-1 text-sm text-[#6c6a64]">{anime.title.native}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#6c6a64]">
                <span className="flex items-center gap-1 text-white">
                  <Star className="h-4 w-4 fill-[#cc785c] text-[#cc785c]" />
                  {getScore(anime)}
                </span>
                <span>{anime.format || "TV"}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{anime.seasonYear || "?"}</span>
                <span>{anime.episodes ? `${anime.episodes} episodes` : "?"}</span>
                {anime.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{anime.duration} min</span>}
                {anime.status && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(anime.status)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    {getStatusLabel(anime.status)}
                  </span>
                )}
              </div>

              {anime.description && (
                <p className="mt-6 text-base leading-relaxed text-[#a09d96]">{anime.description.replace(/<[^>]+>/g, "")}</p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <Link to={`/watch/${anime.id}/1`}>
                  <Button size="lg" className="gap-2 bg-[#cc785c] hover:bg-[#a9583e] text-white">
                    <Play className="h-5 w-5 fill-white" />
                    Start Watching
                  </Button>
                </Link>
                <Button
                  variant="dark"
                  size="lg"
                  className={`gap-2 border border-[#252320] transition-colors ${inWatchlist ? "text-[#cc785c] border-[#cc785c]/40" : ""}`}
                  onClick={toggleWatchlist}
                >
                  {inWatchlist
                    ? <BookmarkCheck className="h-5 w-5" />
                    : <BookmarkPlus className="h-5 w-5" />}
                  {inWatchlist ? "Saved" : "Add to Watchlist"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-6 font-serif text-2xl font-medium text-white tracking-tight">Watch Online</h2>
            <p className="text-sm text-[#a09d96] mb-4">
              Stream all episodes directly in the player. Episode sources are resolved automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/watch/${anime.id}/1`}>
                <Button size="lg" className="gap-2 bg-[#cc785c] hover:bg-[#a9583e] text-white">
                  <Play className="h-5 w-5 fill-white" />
                  Start Watching
                </Button>
              </Link>
              {anime.episodes && anime.episodes > 1 && (
                <p className="self-center text-sm text-[#6c6a64]">
                  {anime.episodes} episodes available
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-[#252320] bg-[#1f1e1b] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Information</h3>
              <Separator className="mb-4 bg-[#252320]" />
              <dl className="space-y-3 text-sm">
                {anime.studios?.nodes?.[0] && (
                  <div className="flex justify-between"><dt className="text-[#6c6a64]">Studio</dt><dd className="font-medium text-white">{anime.studios.nodes[0].name}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-[#6c6a64]">Status</dt><dd className="font-medium text-white">{getStatusLabel(anime.status)}</dd></div>
                {anime.season && anime.seasonYear && (
                  <div className="flex justify-between"><dt className="text-[#6c6a64]">Season</dt><dd className="font-medium text-white capitalize">{anime.season.toLowerCase()} {anime.seasonYear}</dd></div>
                )}
                <div className="flex justify-between"><dt className="text-[#6c6a64]">Episodes</dt><dd className="font-medium text-white">{anime.episodes || "?"}</dd></div>
                {anime.duration && <div className="flex justify-between"><dt className="text-[#6c6a64]">Duration</dt><dd className="font-medium text-white">{anime.duration} min</dd></div>}
                {anime.source && <div className="flex justify-between"><dt className="text-[#6c6a64]">Source</dt><dd className="font-medium text-white">{anime.source.replace(/_/g, " ")}</dd></div>}
                {anime.format && <div className="flex justify-between"><dt className="text-[#6c6a64]">Format</dt><dd className="font-medium text-white">{anime.format}</dd></div>}
                {anime.popularity && <div className="flex justify-between"><dt className="text-[#6c6a64]">Popularity</dt><dd className="font-medium text-white">#{anime.popularity.toLocaleString()}</dd></div>}
                {anime.favourites && <div className="flex justify-between"><dt className="text-[#6c6a64]">Favorites</dt><dd className="font-medium text-white">{anime.favourites.toLocaleString()}</dd></div>}
              </dl>
            </div>

            {anime.characters?.edges && anime.characters.edges.length > 0 && (
              <div className="rounded-xl border border-[#252320] bg-[#1f1e1b] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">Characters</h3>
                <Separator className="mb-4 bg-[#252320]" />
                <div className="space-y-3">
                  {anime.characters.edges.slice(0, 6).map((c) => (
                    <div key={c.node.id} className="flex items-center gap-3">
                      <img
                        src={c.node.image.large}
                        alt={c.node.name.full}
                        className="h-10 w-10 rounded-full object-cover bg-[#252320]"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{c.node.name.full}</p>
                        <p className="text-xs text-[#6c6a64]">{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
