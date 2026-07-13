# OtakuVerse - System Architecture Diagram
# Paste this into https://app.eraser.io/workspace/ZBoEo7EJjZ7zrUUcFFTJ

# ── User ──
user [icon: user, color: coral] "End User"

# ── Frontend (React SPA) ──
frontend [icon: browser, color: blue] "Frontend\nReact 19 + Vite\nPort 5173"

# Frontend Pages
home [icon: file, color: lightblue] "Home Page\nTrending/Airing/Upcoming"
browse [icon: file, color: lightblue] "Browse Page\nFilters + Search"
detail [icon: file, color: lightblue] "Anime Detail\nInfo + Characters"
search [icon: file, color: lightblue] "Search Page\nResults Grid"
watchlist [icon: file, color: lightblue] "Watchlist\nlocalStorage"
watch [icon: file, color: lightblue] "Watch Page\nVideo Player"

# Frontend Hooks
hook_anilist [icon: code, color: lightblue] "useAniList Hooks\nuseAniListTrending\nuseAniListTop\nuseAniListAiring\nuseAniListSearch\nuseAniListMedia"
hook_consumet [icon: code, color: lightblue] "useConsumet Hooks\nuseResolveSlug\nuseConsumetEpisodes\nuseConsumetWatch"

# Frontend Components
video_player [icon: play, color: lightblue] "VideoPlayer\nvideo.js + HLS"
ui_components [icon: layout, color: lightblue] "UI Components\nButton/Badge/Card/Input\nAvatar/Separator"

# ── Backend (NestJS) ──
backend [icon: server, color: green] "Backend API\nNestJS 11\nPort 4000"

# Backend Modules
anilist_module [icon: code, color: lightgreen] "AniList Module\nAniListController\nAniListService"
stream_module [icon: code, color: lightgreen] "Stream Module\nStreamController\nM3U8 Proxy\nSegment Proxy"
prisma_module [icon: database, color: lightgreen] "Prisma Module\nPrismaService\n(Global)"

# ── Database ──
database [icon: database, color: purple] "PostgreSQL\nNeon Serverless\n(No models yet)"

# ── External APIs ──
anilist_api [icon: cloud, color: orange] "AniList GraphQL API\ngraphql.anilist.co\nAnime Metadata"
consumet_api [icon: cloud, color: orange] "Consumet API\nkawai.digiti.tech\nStream Sources"
cdn [icon: cloud, color: orange] "Video CDN\nHLS .ts Segments\nM3U8 Playlists"

# ── Connections ──

# User -> Frontend
user -> frontend : "HTTP"

# Frontend -> Pages
frontend -> home
frontend -> browse
frontend -> detail
frontend -> search
frontend -> watchlist
frontend -> watch

# Pages -> Hooks
home -> hook_anilist
browse -> hook_anilist
browse -> hook_consumet
detail -> hook_anilist
detail -> hook_consumet
search -> hook_anilist
watch -> hook_anilist
watch -> hook_consumet
watch -> video_player

# Hooks -> Backend API
hook_anilist -> backend : "/api/anilist/*"
hook_consumet -> stream_module : "/api/stream/*"
video_player -> stream_module : "/api/stream/m3u8\n/api/stream/segment"

# Backend Modules
backend -> anilist_module
backend -> stream_module
backend -> prisma_module

# Backend -> Database
prisma_module -> database : "Prisma ORM"

# Backend -> External APIs
anilist_module -> anilist_api : "GraphQL POST\nAnime metadata queries"
stream_module -> consumet_api : "REST GET\nSearch/Info/Watch"
stream_module -> cdn : "Fetch .ts segments\nFetch M3U8 playlists"
