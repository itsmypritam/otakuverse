import { Link, useNavigate } from "react-router-dom"
import { Search, Bookmark, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SITE_NAME, NAV_LINKS } from "@/lib/constants"
import { useState } from "react"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      setSearchOpen(false)
      setOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#252320] bg-[#141413]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cc785c]">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-white">{SITE_NAME}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="px-3 py-2 text-sm font-medium text-[#a09d96] transition-colors hover:text-white rounded-md hover:bg-[#1f1e1b]"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 md:w-64 bg-[#1f1e1b] border-[#252320] text-white placeholder:text-[#6c6a64]"
                autoFocus
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="text-[#a09d96]">
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="hidden md:flex text-[#a09d96] hover:text-white" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Link to="/watchlist">
                <Button variant="ghost" size="icon" className="hidden md:flex text-[#a09d96] hover:text-white">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-[#a09d96]" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#252320] bg-[#141413] md:hidden">
          <nav className="flex flex-col p-4 gap-1">
            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-2">
              <Input
                type="search"
                placeholder="Search anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-[#1f1e1b] border-[#252320] text-white placeholder:text-[#6c6a64]"
              />
              <Button type="submit" size="icon" variant="ghost" className="text-[#a09d96]">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-[#a09d96] hover:text-white rounded-md hover:bg-[#1f1e1b]"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/watchlist" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-[#a09d96] hover:text-white rounded-md hover:bg-[#1f1e1b] flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Watchlist
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
