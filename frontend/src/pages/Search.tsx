import { useSearchParams, Link } from "react-router-dom"
import { Search as SearchIcon, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getImageUrl, getScore, getTitle } from "@/lib/constants"
import { useAniListSearch } from "@/hooks/useAniList"

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get("q") || ""
  const { results, loading } = useAniListSearch(query)

  return (
    <div className="min-h-screen bg-[#141413]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-white tracking-tight">Search Results</h1>
          {query && <p className="mt-2 text-[#6c6a64]">{results.length} result{results.length !== 1 ? "s" : ""} for "<strong className="text-white">{query}</strong>"</p>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#252320] border-t-[#cc785c]" />
          </div>
        ) : !query ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchIcon className="h-12 w-12 text-[#6c6a64] mb-4" />
            <h3 className="text-lg font-medium text-white">Enter a search term</h3>
            <Link to="/browse" className="mt-4 text-sm font-medium text-[#cc785c] hover:text-[#a9583e]">Browse all anime</Link>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <SearchIcon className="h-12 w-12 text-[#6c6a64] mb-4" />
            <h3 className="text-lg font-medium text-white">No results found</h3>
            <p className="text-sm text-[#6c6a64]">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((a) => (
              <Link key={a.id} to={`/anime/${a.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#1f1e1b]">
                  <img src={getImageUrl(a)} alt={getTitle(a)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="coral" className="text-[10px] px-1.5 py-0">
                      <Star className="h-2.5 w-2.5 fill-white mr-0.5" />{getScore(a)}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{getTitle(a)}</h3>
                  <p className="text-xs text-[#6c6a64]">{a.episodes || "?"} eps</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
