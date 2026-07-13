import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { HomePage } from "@/pages/Home"
import { BrowsePage } from "@/pages/Browse"
import { AnimeDetailPage } from "@/pages/AnimeDetail"
import { WatchPage } from "@/pages/Watch"
import { SearchPage } from "@/pages/Search"
import { WatchlistPage } from "@/pages/Watchlist"

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/browse", element: <BrowsePage /> },
      { path: "/anime/:id", element: <AnimeDetailPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/watchlist", element: <WatchlistPage /> },
    ],
  },
  {
    path: "/watch/:id/:episodeNumber",
    element: <WatchPage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
