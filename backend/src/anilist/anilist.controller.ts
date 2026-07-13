import { Controller, Get, Query, Param, ParseIntPipe, DefaultValuePipe } from "@nestjs/common";
import { AnilistService } from "./anilist.service";

@Controller("anilist")
export class AnilistController {
  constructor(private readonly anilistService: AnilistService) {}

  @Get("trending")
  async getTrending(@Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage: number) {
    return this.anilistService.trending(perPage);
  }

  @Get("top")
  async getTop(
    @Query("sort") sort?: string,
    @Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage?: number
  ) {
    return this.anilistService.top(sort, perPage);
  }

  @Get("airing")
  async getAiring(@Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage: number) {
    return this.anilistService.airing(perPage);
  }

  @Get("upcoming")
  async getUpcoming(@Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage: number) {
    return this.anilistService.upcoming(perPage);
  }

  @Get("seasonal")
  async getSeasonal(
    @Query("season") season: string,
    @Query("year", ParseIntPipe) year: number,
    @Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage?: number
  ) {
    return this.anilistService.seasonal(season, year, perPage);
  }

  @Get("search")
  async search(
    @Query("q") q: string,
    @Query("perPage", new DefaultValuePipe(20), ParseIntPipe) perPage?: number
  ) {
    return this.anilistService.search(q, perPage);
  }

  @Get("media/:id")
  async getMediaById(@Param("id", ParseIntPipe) id: number) {
    return this.anilistService.mediaById(id);
  }
}
