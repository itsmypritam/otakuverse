import { Module } from "@nestjs/common";
import { AnilistController } from "./anilist.controller";
import { AnilistService } from "./anilist.service";

@Module({
  controllers: [AnilistController],
  providers: [AnilistService],
})
export class AnilistModule {}
