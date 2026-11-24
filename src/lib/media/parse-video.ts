import { resolveVideoEmbed } from "@/lib/media/video";

export type ParsedVideo = {
  platform: "youtube" | "tiktok";
  watchUrl: string;
  embedUrl: string | null;
};

export function parseVideoUrl(rawUrl: string): ParsedVideo | null {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (
    host === "youtu.be" ||
    host === "youtube.com" ||
    host === "m.youtube.com"
  ) {
    const resolved = resolveVideoEmbed(url.toString(), "youtube");
    if (!resolved.embedUrl) {
      return null;
    }

    return {
      platform: "youtube",
      watchUrl: resolved.watchUrl,
      embedUrl: resolved.embedUrl,
    };
  }

  if (host === "tiktok.com" || host === "vm.tiktok.com") {
    const resolved = resolveVideoEmbed(url.toString(), "tiktok");
    if (!resolved.embedUrl && host === "vm.tiktok.com") {
      return null;
    }

    if (!resolved.embedUrl) {
      return null;
    }

    return {
      platform: "tiktok",
      watchUrl: resolved.watchUrl,
      embedUrl: resolved.embedUrl,
    };
  }

  return null;
}
