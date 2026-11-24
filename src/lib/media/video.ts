const YOUTUBE_ID = /^[a-zA-Z0-9_-]{6,}$/;

export function resolveVideoEmbed(
  rawUrl: string,
  platform: "youtube" | "tiktok",
): { watchUrl: string; embedUrl: string | null } {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return { watchUrl: rawUrl, embedUrl: null };
  }

  const host = url.hostname.replace(/^www\./, "");

  if (platform === "youtube") {
    const id = youtubeId(host, url);
    if (!id) {
      return { watchUrl: rawUrl, embedUrl: null };
    }

    return {
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  const tiktokId = url.pathname.match(/\/video\/(\d+)/)?.[1];
  if (!tiktokId) {
    return { watchUrl: rawUrl, embedUrl: null };
  }

  return {
    watchUrl: rawUrl,
    embedUrl: `https://www.tiktok.com/embed/v2/${tiktokId}`,
  };
}

function youtubeId(host: string, url: URL) {
  if (host === "youtu.be") {
    return validYoutubeId(url.pathname.split("/").filter(Boolean)[0]);
  }

  if (host !== "youtube.com" && host !== "m.youtube.com") {
    return null;
  }

  if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
    return validYoutubeId(url.pathname.split("/")[2]);
  }

  return validYoutubeId(url.searchParams.get("v"));
}

function validYoutubeId(value: string | null | undefined) {
  if (!value || !YOUTUBE_ID.test(value)) {
    return null;
  }

  return value;
}
