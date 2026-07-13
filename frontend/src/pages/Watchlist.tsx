import { useEffect, useState } from "react"
import { Bookmark, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

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

export function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(getWatchlist())
    setLoading(false)
  }, [])

  const handleRemove = (anilistId: number) => {
    const updated = items.filter((i) => i.anilistId !== anilistId)
    setItems(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-medium text-white tracking-tight">My Watchlist</h1>
          <p className="mt-2 text-[#6c6a64]">Anime you've saved to watch later</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#252320] border-t-[#cc785c]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Bookmark className="h-12 w-12 text-[#6c6a64] mb-4" />
            <h3 className="text-lg font-medium text-white">Your watchlist is empty</h3>
            <p className="text-sm text-[#6c6a64] mt-1">Browse anime and hit the bookmark button to save them here</p>
            <Link to="/browse" className="mt-4">
              <Button variant="dark">Browse Anime</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <div key={item.anilistId} className="group relative">
                <Link to={`/anime/${item.anilistId}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#1f1e1b]">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl font-bold text-[#252320]">{item.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-white line-clamp-2">{item.title}</h3>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(item.anilistId)}
                  className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
