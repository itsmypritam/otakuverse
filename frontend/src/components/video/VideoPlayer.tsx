import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import Plyr from "plyr"
import "plyr/dist/plyr.css"
import { cn } from "@/lib/utils"
import { Film, Loader2, AlertCircle, ExternalLink } from "lucide-react"

interface VideoPlayerProps {
  videoUrl?: string
  poster?: string
  loading?: boolean
  embedUrl?: string
  className?: string
}

export function VideoPlayer({ videoUrl, poster, loading, embedUrl, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const plyrRef = useRef<Plyr | null>(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useEmbed, setUseEmbed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || useEmbed) return

    setError(null)
    setPlayerReady(false)

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    if (plyrRef.current) { plyrRef.current.destroy(); plyrRef.current = null }
    container.innerHTML = ""

    if (!videoUrl) return

    const video = document.createElement("video")
    video.className = "w-full h-full"
    video.playsInline = true
    video.crossOrigin = "anonymous"
    if (poster) video.poster = poster
    container.appendChild(video)

    const plyr = new Plyr(video, {
      controls: ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "settings", "pip", "fullscreen"],
      autoplay: true,
      muted: true,
    })
    plyrRef.current = plyr

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      })
      hlsRef.current = hls

      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlayerReady(true)
        video.play().catch(() => {})
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad()
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError()
          } else {
            setError("Stream source unavailable")
            if (embedUrl) setUseEmbed(true)
          }
        }
      })
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl
      video.addEventListener("loadedmetadata", () => {
        setPlayerReady(true)
        video.play().catch(() => {})
      })
      video.addEventListener("error", () => {
        setError("Stream source unavailable")
        if (embedUrl) setUseEmbed(true)
      })
    } else {
      setError("HLS not supported in this browser")
      if (embedUrl) setUseEmbed(true)
    }

    return () => {}
  }, [videoUrl, poster, useEmbed, embedUrl])

  useEffect(() => {
    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
      if (plyrRef.current) { plyrRef.current.destroy(); plyrRef.current = null }
    }
  }, [])

  return (
    <div className={cn("relative aspect-video w-full rounded-lg overflow-hidden bg-[#181715]", className)}>
      <div ref={containerRef} className="absolute inset-0 [&_video]:w-full [&_video]:h-full" data-vjs-player />

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#181715]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#cc785c]" />
            <p className="text-xs text-[#6c6a64]">Finding stream source...</p>
          </div>
        </div>
      )}

      {!loading && !videoUrl && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#181715]">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#252320]">
              <Film className="h-8 w-8 text-[#6c6a64]" />
            </div>
            <p className="text-sm font-medium text-white">Episode not available</p>
            <p className="mt-1 text-xs text-[#6c6a64]">No playable stream was found for this episode</p>
          </div>
        </div>
      )}

      {useEmbed && embedUrl && (
        <iframe
          src={embedUrl}
          className="absolute inset-0 z-10 w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {!loading && error && !useEmbed && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#181715]/90 backdrop-blur-sm">
          <div className="text-center px-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-sm font-medium text-white">Stream error</p>
            <p className="mt-1 text-xs text-[#6c6a64]">{error}</p>
            {embedUrl && (
              <button
                onClick={() => setUseEmbed(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#cc785c] px-4 py-2 text-sm font-medium text-white hover:bg-[#a9583e] transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Try embedded player
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
