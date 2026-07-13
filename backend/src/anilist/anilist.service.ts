import { Injectable } from "@nestjs/common";

@Injectable()
export class AnilistService {
  private readonly endpoint = "https://graphql.anilist.co";

  private async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`AniList API error ${res.status}: ${text}`)
    }
    const json = await res.json()
    if (json.errors) {
      throw new Error(json.errors[0]?.message || "AniList error")
    }
    return json.data
  }

  private readonly mediaFragment = `
    id
    idMal
    title { romaji english native }
    coverImage { extraLarge large medium color }
    bannerImage
    genres
    tags { name rank }
    averageScore
    meanScore
    popularity
    favourites
    episodes
    duration
    status
    format
    season
    seasonYear
    source
    studios { nodes { name } }
    trailer { id site thumbnail }
    streamingEpisodes { title thumbnail url site }
    nextAiringEpisode { airingAt timeUntilAiring episode }
  `

  async trending(perPage = 20) {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(sort: TRENDING_DESC, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { perPage })
    return data.Page.media
  }

  async top(sort: string = "POPULARITY_DESC", perPage = 20) {
    const query = `
      query ($sort: [MediaSort], $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(sort: $sort, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { sort: [sort], perPage })
    return data.Page.media
  }

  async airing(perPage = 20) {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(status: RELEASING, sort: POPULARITY_DESC, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { perPage })
    return data.Page.media
  }

  async upcoming(perPage = 20) {
    const query = `
      query ($perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { perPage })
    return data.Page.media
  }

  async seasonal(season: string, year: number, perPage = 20) {
    const query = `
      query ($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(season: $season, seasonYear: $seasonYear, sort: POPULARITY_DESC, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { season, seasonYear: year, perPage })
    return data.Page.media
  }

  async search(q: string, perPage = 20) {
    const query = `
      query ($search: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(search: $search, type: ANIME) {
            ${this.mediaFragment}
          }
        }
      }
    `
    const data = await this.query<{ Page: { media: any[] } }>(query, { search: q, perPage })
    return data.Page.media
  }

  async mediaById(id: number) {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${this.mediaFragment}
          characters(role: MAIN, perPage: 20) {
            edges {
              role
              node { id name { full native } image { large medium } }
              voiceActors(language: JAPANESE) { id name { full } image { large medium } language }
            }
          }
          recommendations(perPage: 10, sort: RATING_DESC) {
            edges {
              node { mediaRecommendation { id title { romaji english } coverImage { large medium } } }
            }
          }
        }
      }
    `
    const data = await this.query<{ Media: any }>(query, { id })
    return data.Media
  }
}
