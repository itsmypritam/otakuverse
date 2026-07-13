import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  app.setGlobalPrefix("api");

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
