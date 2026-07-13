export const SITE_NAME = "OtakuVerse"
export const SITE_TAGLINE = "Stream the Best Anime"

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Trending", href: "/browse?filter=trending" },
  { label: "Watchlist", href: "/watchlist" },
] as const

export function getImageUrl(media: { coverImage?: { extraLarge?: string; large?: string; medium?: string } }, size: "large" | "medium" = "large"): string {
  if (size === "large" && media.coverImage?.extraLarge) return media.coverImage.extraLarge
  if (media.coverImage?.large) return media.coverImage.large
  if (media.coverImage?.medium) return media.coverImage.medium
  return ""
}

export function getBannerImage(media: { bannerImage?: string; coverImage?: { extraLarge?: string; large?: string; medium?: string } }): string {
  if (media.bannerImage) return media.bannerImage
  return getImageUrl(media)
}

export function getStatusColor(status?: string): string {
  switch (status) {
    case "RELEASING": return "bg-green-500"
    case "FINISHED": return "bg-[#6c6a64]"
    case "NOT_YET_RELEASED": return "bg-[#cc785c]"
    case "CANCELLED": return "bg-red-500"
    case "HIATUS": return "bg-yellow-500"
    default: return "bg-[#6c6a64]"
  }
}

export function getStatusLabel(status?: string): string {
  switch (status) {
    case "RELEASING": return "Airing"
    case "FINISHED": return "Finished"
    case "NOT_YET_RELEASED": return "Upcoming"
    case "CANCELLED": return "Cancelled"
    case "HIATUS": return "Hiatus"
    default: return status || "Unknown"
  }
}

export function getScore(media: { averageScore?: number; meanScore?: number }): string {
  if (media.averageScore) return (media.averageScore / 10).toFixed(1)
  if (media.meanScore) return (media.meanScore / 10).toFixed(1)
  return "?"
}

export function getTitle(media: { title?: { english?: string; romaji?: string; native?: string } }): string {
  return media.title?.english || media.title?.romaji || media.title?.native || "Untitled"
}
