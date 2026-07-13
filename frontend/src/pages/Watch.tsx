import { useParams, Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video/VideoPlayer"
import { getImageUrl, getTitle } from "@/lib/constants"
import { useAniListMedia } from "@/hooks/useAniList"
import { useResolveSlug, useConsumetEpisodes, useConsumetWatch } from "@/hooks/useConsumet"
import { proxyM3u8 } from "@/lib/api"

export function WatchPage() {
  const { id: animeId, episodeNumber } = useParams<{ id: string; episodeNumber: string }>()
  const id = animeId ? parseInt(animeId) : null
  const epNum = episodeNumber ? parseInt(episodeNumber) : 1
  const { media: anime, loading: animeLoading } = useAniListMedia(id)

  const { slug, slugLoading } = useResolveSlug(anime)
  const { episodes, loading: epsLoading } = useConsumetEpisodes(slug)

  const currentEpisode = episodes.find((ep) => ep.number === epNum)
  const { watchData, loading: watchLoading } = useConsumetWatch(currentEpisode?.id || null)

  const streamResolved = !slugLoading && !epsLoading
  const hasConsumetVideo = streamResolved && slug && episodes.length > 0
  const rawVideoUrl = watchData?.sources?.find((s) => s.isM3U8)?.url
  const videoUrl = rawVideoUrl ? proxyM3u8(rawVideoUrl) : undefined
  const embedUrl = watchData?.servers?.[0]?.url

  const showExternalLinks = streamResolved && !hasConsumetVideo &&
    !!(anime?.streamingEpisodes && anime.streamingEpisodes.length > 0)

  const loading = animeLoading || slugLoading || epsLoading

  if (loading && !anime) {
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

  const prevEp = epNum > 1
  const nextEp = epNum < (episodes.length || anime.episodes || 0)
  const title = getTitle(anime)

  const externalSites = showExternalLinks
    ? [...new Map(
        anime.streamingEpisodes!
          .filter((ep) => ep.url.startsWith("https://"))
          .map((ep) => [ep.site, ep])
      ).values()]
    : []

  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="border-b border-[#252320] bg-[#1f1e1b]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to={`/anime/${anime.id}`}
              className="flex items-center gap-2 text-sm text-[#a09d96] hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              {prevEp && (
                <Link to={`/watch/${anime.id}/${epNum - 1}`}>
                  <Button variant="dark" size="sm" className="gap-1 h-8 text-xs">
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </Button>
                </Link>
              )}
              <Badge variant="coral" className="text-xs">EP {epNum}</Badge>
              {nextEp && (
                <Link to={`/watch/${anime.id}/${epNum + 1}`}>
                  <Button variant="dark" size="sm" className="gap-1 h-8 text-xs">
                    Next <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">

          <div className="lg:col-span-2">

            <VideoPlayer
              videoUrl={videoUrl}
              poster={getImageUrl(anime)}
              loading={watchLoading && !watchData}
              embedUrl={embedUrl}
            />

            <div className="mt-4">
              <h2 className="font-serif text-2xl font-medium text-white tracking-tight">
                {currentEpisode?.title || `Episode ${epNum}`}
              </h2>

              <div className="mt-2 flex items-center gap-3 text-xs text-[#6c6a64]">
                {watchLoading && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading video...
                  </span>
                )}
                {streamResolved && !hasConsumetVideo && (
                  <span className="text-yellow-500/80">Direct stream unavailable for this title</span>
                )}
                {streamResolved && hasConsumetVideo && !videoUrl && !watchLoading && (
                  <span className="text-yellow-500/80">No playable source found for this episode</span>
                )}
              </div>
            </div>

            {showExternalLinks && (
              <div className="mt-6 rounded-xl border border-[#252320] bg-[#1f1e1b] p-5">
                <p className="mb-1 text-sm font-semibold text-white">Watch on an official platform</p>
                <p className="mb-4 text-xs text-[#6c6a64]">
                  Direct streaming is unavailable for this title. These links open third-party sites.
                </p>
                <div className="flex flex-wrap gap-2">
                  {externalSites.map((ep) => (
                    <a
                      key={ep.site}
                      href={ep.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#252320] bg-[#252320] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#353330] transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 text-[#cc785c]" />
                      {ep.site}
                      <span className="text-[10px] text-[#6c6a64]">(opens externally)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 border-t border-[#252320] pt-6">
              <h3 className="text-lg font-semibold text-white">About {title}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {anime.genres?.map((g) => (
                  <Badge key={g} variant="dark" className="text-xs">{g}</Badge>
                ))}
              </div>
              {anime.description && (
                <p className="mt-3 text-sm leading-relaxed text-[#a09d96] line-clamp-3">
                  {anime.description.replace(/<[^>]+>/g, "")}
                </p>
              )}
              <Link
                to={`/anime/${anime.id}`}
                className="mt-3 inline-block text-sm font-medium text-[#cc785c] hover:text-[#a9583e]"
              >
                View Details
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[#252320] bg-[#1f1e1b] p-4">
              <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
                Episodes
                {epsLoading && <Loader2 className="h-3 w-3 animate-spin text-[#6c6a64]" />}
                {streamResolved && !slug && (
                  <span className="text-[10px] font-normal text-[#6c6a64]">(unavailable)</span>
                )}
              </h3>

              {streamResolved && !slug ? (
                anime.episodes ? (
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: anime.episodes }, (_, i) => i + 1).map((n) => (
                      <Link
                        key={n}
                        to={`/watch/${anime.id}/${n}`}
                        className={`flex h-9 items-center justify-center rounded text-xs font-medium transition-colors ${
                          n === epNum
                            ? "bg-[#cc785c] text-white"
                            : "bg-[#252320] text-[#6c6a64] hover:bg-[#353330] hover:text-white"
                        }`}
                      >
                        {n}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6c6a64] px-1">
                    Episode count unavailable. Use Prev / Next buttons to navigate.
                  </p>
                )
              ) : (
                <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                  {episodes.map((ep) => (
                    <Link
                      key={ep.id}
                      to={`/watch/${anime.id}/${ep.number}`}
                      className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                        ep.number === epNum
                          ? "bg-[#cc785c]/10 border border-[#cc785c]/30"
                          : "hover:bg-[#252320]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[#252320] overflow-hidden">
                        {ep.number === epNum ? (
                          <Play className="h-4 w-4 text-[#cc785c]" />
                        ) : (
                          <span className="text-xs font-medium text-[#6c6a64]">{ep.number}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-white truncate">
                          {ep.title || `Episode ${ep.number}`}
                        </p>
                        <p className="text-[10px] text-[#6c6a64]">EP {ep.number}</p>
                      </div>
                    </Link>
                  ))}
                  {epsLoading && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-[#6c6a64]" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
