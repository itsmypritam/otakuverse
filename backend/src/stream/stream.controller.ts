import { Controller, Get, Query, Res, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

const CONSUMET_BASE = "https://kawai.digiti.tech/api/consumet";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

@Controller("stream")
export class StreamController {

  /** Proxy Consumet search */
  @Get("search")
  async search(@Query("q") q: string) {
    if (!q) throw new HttpException("q is required", HttpStatus.BAD_REQUEST);
    const res = await fetch(`${CONSUMET_BASE}/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new HttpException("Consumet search failed", res.status);
    return res.json();
  }

  /** Proxy Consumet info (episode list) */
  @Get("info")
  async info(@Query("id") id: string, @Query("lang") lang = "sub") {
    if (!id) throw new HttpException("id is required", HttpStatus.BAD_REQUEST);
    const res = await fetch(`${CONSUMET_BASE}/info?id=${encodeURIComponent(id)}&lang=${lang}`);
    if (!res.ok) throw new HttpException("Consumet info failed", res.status);
    return res.json();
  }

  /** Proxy Consumet watch — tries multiple servers with automatic fallback */
  @Get("watch")
  async watch(
    @Query("episodeId") episodeId: string,
    @Query("lang") lang = "sub",
    @Query("server") server = "0",
  ) {
    if (!episodeId) throw new HttpException("episodeId is required", HttpStatus.BAD_REQUEST);

    const serverPriority = this.getServerOrder(Number(server));

    for (const srv of serverPriority) {
      try {
        const res = await fetch(
          `${CONSUMET_BASE}/watch?episodeId=${encodeURIComponent(episodeId)}&lang=${lang}&server=${srv}`,
          { signal: AbortSignal.timeout(8000) },
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.sources?.length) {
          return { ...data, activeServer: srv };
        }
      } catch {
        continue;
      }
    }

    throw new HttpException("All servers failed — no playable source found", HttpStatus.BAD_GATEWAY);
  }

  private getServerOrder(preferred: number): number[] {
    const all = [0, 3, 1, 2];
    const ordered = [preferred, ...all.filter((s) => s !== preferred)];
    return ordered;
  }

  /**
   * Proxy M3U8 master playlist — rewrites segment URLs so they also go through this proxy.
   * This solves CORS: the browser only talks to localhost:4000, never to vivibebe.site directly.
   */
  @Get("m3u8")
  async m3u8(
    @Query("url") url: string,
    @Res() res: Response,
  ) {
    if (!url) throw new HttpException("url is required", HttpStatus.BAD_REQUEST);

    if (!url.startsWith("https://")) {
      throw new HttpException("Only HTTPS URLs are allowed", HttpStatus.BAD_REQUEST);
    }

    try {
      const origin = new URL(url).origin + "/";
      const upstream = await fetch(url, {
        headers: {
          "Referer": origin,
          "Origin": origin,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!upstream.ok) {
        throw new HttpException(`Upstream error: ${upstream.status}`, HttpStatus.BAD_GATEWAY);
      }

      const contentType = upstream.headers.get("content-type") || "application/x-mpegURL";
      const text = await upstream.text();

      const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
      const proxyBase = `${BACKEND_URL}/api/stream/segment?url=`;

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
            return `${proxyBase}${encodeURIComponent(trimmed)}`;
          }
          return `${proxyBase}${encodeURIComponent(baseUrl + trimmed)}`;
        })
        .join("\n");

      res.set({
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      });
      res.send(rewritten);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException("Failed to fetch stream", HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Proxy individual TS segments / sub-playlists — browser fetches these as part of HLS.
   */
  @Get("segment")
  async segment(
    @Query("url") url: string,
    @Res() res: Response,
  ) {
    if (!url || !url.startsWith("https://")) {
      throw new HttpException("Invalid URL", HttpStatus.BAD_REQUEST);
    }

    try {
      const origin = new URL(url).origin + "/";
      const upstream = await fetch(url, {
        headers: {
          "Referer": origin,
          "Origin": origin,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!upstream.ok) {
        throw new HttpException(`Upstream ${upstream.status}`, HttpStatus.BAD_GATEWAY);
      }

      const contentType = upstream.headers.get("content-type") || "video/MP2T";

      // Sub-playlists (.m3u8) also need URL rewriting
      if (contentType.includes("mpegURL") || contentType.includes("m3u8") || url.includes(".m3u8")) {
        const text = await upstream.text();
        const baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
        const proxyBase = `${BACKEND_URL}/api/stream/segment?url=`;

        const rewritten = text
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return line;
            if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
              return `${proxyBase}${encodeURIComponent(trimmed)}`;
            }
            return `${proxyBase}${encodeURIComponent(baseUrl + trimmed)}`;
          })
          .join("\n");

        res.set({
          "Content-Type": "application/x-mpegURL",
          "Cache-Control": "no-cache",
        });
        return res.send(rewritten);
      }

      // Binary segment — stream directly
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.set({
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      });
      res.send(buffer);
    } catch (err: any) {
      if (err instanceof HttpException) throw err;
      throw new HttpException("Segment fetch failed", HttpStatus.BAD_GATEWAY);
    }
  }
}
