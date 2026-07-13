import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AnilistModule } from "./anilist/anilist.module";
import { StreamModule } from "./stream/stream.module";


@Module({
  imports: [PrismaModule, AnilistModule, StreamModule],
  
})
export class AppModule {}
