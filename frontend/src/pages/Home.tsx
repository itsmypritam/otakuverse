import { Link } from "react-router-dom"
import { Play, Info, ChevronRight, ChevronLeft, Star, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { api, type AniListMedia } from "@/lib/api"
import { getImageUrl, getBannerImage, getScore, getTitle } from "@/lib/constants"

function AnimeCard({ anime }: { anime: AniListMedia }) {
  const src = getImageUrl(anime)
  const title = getTitle(anime)
  return (
    <Link to={`/anime/${anime.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#1f1e1b]">
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl font-bold text-[#252320]">{title?.charAt(0) || "?"}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button size="sm" variant="secondary" className="w-full text-xs h-8 bg-white/20 text-white border-0 hover:bg-white/30">
            <Play className="h-3 w-3 mr-1" /> Watch
          </Button>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium text-white line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2 text-xs text-[#6c6a64]">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#cc785c] text-[#cc785c]" />
            {getScore(anime)}
          </span>
          <span>{anime.episodes ? `${anime.episodes} eps` : "?"}</span>
          {anime.genres?.slice(0, 1).map((g) => <span key={g}>{g}</span>)}
        </div>
      </div>
    </Link>
  )
}

function AnimeRow({ title, anime, icon }: { title: string; anime: AniListMedia[]; icon?: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.6
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  if (!anime.length) return null

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-serif text-2xl font-medium text-white tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll("left")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => scroll("right")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {anime.map((a) => (
            <div key={a.id} className="min-w-[160px] w-[160px] sm:min-w-[180px] sm:w-[180px] flex-shrink-0 snap-start">
              <AnimeCard anime={a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroSection({ anime }: { anime: AniListMedia }) {
  const bgSrc = getBannerImage(anime)
  const title = getTitle(anime)

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden bg-[#141413]">
      <div className="absolute inset-0">
        {bgSrc && (
          <img
            src={bgSrc}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413/60] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#cc785c]/30 bg-[#cc785c]/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#cc785c] animate-pulse" />
            <span className="text-xs font-medium text-[#cc785c]">Featured</span>
          </div>

          <h1 className="font-serif text-5xl font-medium text-white tracking-tight sm:text-6xl lg:text-7xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-[#a09d96]">
            <span className="flex items-center gap-1 text-white/80">
              <Star className="h-4 w-4 fill-[#cc785c] text-[#cc785c]" />
              {getScore(anime)}
            </span>
            <span>{anime.format || "TV"}</span>
            <span>{anime.episodes ? `${anime.episodes} eps` : "?"}</span>
            {anime.genres?.slice(0, 2).map((g) => (
              <Badge key={g} variant="dark" className="text-xs">{g}</Badge>
            ))}
          </div>

          {anime.description && (
            <p className="mt-4 text-base text-[#a09d96] leading-relaxed line-clamp-3 max-w-xl">
              {anime.description.replace(/<[^>]+>/g, "")}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={`/anime/${anime.id}`}>
              <Button size="lg" className="gap-2 bg-[#cc785c] hover:bg-[#a9583e] text-white text-base px-8 h-12">
                <Play className="h-5 w-5 fill-white" />
                Start Watching
              </Button>
            </Link>
            <Link to={`/anime/${anime.id}`}>
              <Button variant="secondary" size="lg" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 text-base h-12 px-8">
                <Info className="h-5 w-5" />
                Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141413] to-transparent" />
    </section>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="h-[85vh] min-h-[600px] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#252320] border-t-[#cc785c]" />
      </div>
    </div>
  )
}

export function HomePage() {
  const [featured, setFeatured] = useState<AniListMedia | null>(null)
  const [trending, setTrending] = useState<AniListMedia[]>([])
  const [airing, setAiring] = useState<AniListMedia[]>([])
  const [loading, setLoading] = useState(true)
  const featuredSet = useRef(false)

  useEffect(() => {
    Promise.allSettled([
      api.anilist.trending(10),
      api.anilist.airing(10),
      api.anilist.byId(101922), // Kimetsu no Yaiba — Demon Slayer
    ]).then(([t, a, d]) => {
      if (t.status === "fulfilled") setTrending(t.value)
      if (a.status === "fulfilled") setAiring(a.value)
      if (d.status === "fulfilled" && !featuredSet.current) {
        setFeatured(d.value)
        featuredSet.current = true
      }
      if (!featuredSet.current) {
        if (t.status === "fulfilled" && t.value.length > 0) {
          setFeatured(t.value[0])
          featuredSet.current = true
        } else if (a.status === "fulfilled" && a.value.length > 0) {
          setFeatured(a.value[0])
          featuredSet.current = true
        }
      }
      setLoading(false)
    })
  }, [])

  if (loading) return <LoadingSkeleton />

  if (!featured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141413]">
        <p className="text-[#6c6a64]">No data from AniList.</p>
      </div>
    )
  }

  const rows = [
    { title: "Trending Now", anime: trending, icon: <TrendingUp className="h-5 w-5 text-[#cc785c]" /> },
    { title: "Popular This Season", anime: airing, icon: <Sparkles className="h-5 w-5 text-[#cc785c]" /> },
  ]

  return (
    <div className="min-h-screen bg-[#141413]">
      <HeroSection anime={featured} />

      <div className="pb-12">
        {rows.map((row) => (
          <AnimeRow key={row.title} title={row.title} anime={row.anime} icon={row.icon} />
        ))}
      </div>
    </div>
  )
}
