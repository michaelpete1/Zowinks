import { NextRequest } from "next/server";
import { getSiteUrl } from "../../../../lib/site-url";

const UPSTREAM_BASE = process.env.ZOWKINS_UPSTREAM_API_BASE || "https://zowkins-api.onrender.com/v1";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const getFetchErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  if (!("cause" in error)) return undefined;

  const cause = (error as { cause?: unknown }).cause;
  if (!cause || typeof cause !== "object") return undefined;
  if (!("code" in cause)) return undefined;

  const code = (cause as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
};

const isRetriableFetchError = (error: unknown): boolean => {
  const code = getFetchErrorCode(error);
  return (
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "ECONNRESET" ||
    code === "EAI_AGAIN" ||
    code === "ENOTFOUND"
  );
};

async function proxy(request: NextRequest, pathSegments: string[]) {
  const upstreamSegments = pathSegments[0] === "v1" ? pathSegments.slice(1) : pathSegments;
  const upstreamUrl = new URL(`${UPSTREAM_BASE.replace(/\/$/, "")}/${upstreamSegments.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("accept-encoding");

  // Help the backend identify the site URL for building email links
  const siteUrl = getSiteUrl();
  headers.set("Origin", siteUrl);
  headers.set("Referer", siteUrl + "/");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (2 minutes)

  const init = {
    method: request.method,
    headers,
    redirect: "follow",
    signal: controller.signal,
    duplex: request.body ? "half" : undefined,
  } as RequestInit & { duplex?: "half" | "full" };

  if (!["GET", "HEAD"].includes(request.method) && request.body) {
    init.body = request.body;
  }

  try {
    const isIdempotent = ["GET", "HEAD", "OPTIONS"].includes(request.method);
    const maxAttempts = isIdempotent ? 3 : 1;

    let upstreamResponse: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        upstreamResponse = await fetch(upstreamUrl, init);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;

        if (
          attempt < maxAttempts &&
          !controller.signal.aborted &&
          isRetriableFetchError(error)
        ) {
          await sleep(600 * attempt);
          continue;
        }

        throw error;
      }
    }

    if (!upstreamResponse) {
      throw lastError ?? new Error("Upstream response was not received.");
    }

    clearTimeout(timeoutId);

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    const cacheControl = upstreamResponse.headers.get("cache-control");
    if (cacheControl) {
      responseHeaders.set("cache-control", cacheControl);
    }

    const setCookie = upstreamResponse.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
    }

    const bodyText = await upstreamResponse.text();
    if (
      upstreamResponse.status >= 500 &&
      contentType?.includes("html")
    ) {
      return new Response(
        JSON.stringify({
          error: "Upstream API error",
          details: "Upstream returned an HTML error page.",
          upstreamStatus: upstreamResponse.status,
          upstreamBody: bodyText.slice(0, 512),
        }),
        {
          status: upstreamResponse.status,
          headers: { "content-type": "application/json" },
        },
      );
    }

    return new Response(
      [204, 205, 304].includes(upstreamResponse.status) ? null : bodyText,
      {
        status: upstreamResponse.status,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Proxy error:", error);

    const isAbort =
      error instanceof Error &&
      (error.name === "AbortError" || error.message === "The user aborted a request.");

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = getFetchErrorCode(error);
    const isConnectTimeout =
      errorMessage === "fetch failed" && errorCode === "UND_ERR_CONNECT_TIMEOUT";
    let errorDetails = isAbort
      ? "The request timed out while waiting for the upstream API."
      : "An error occurred while proxying to the upstream API.";

    if (errorMessage === "fetch failed") {
      errorDetails = `Failed to connect to the upstream API at ${upstreamUrl.hostname}. The service may be down, sleeping (Render free tier), or unreachable from this network.`;
    }

    return new Response(
      JSON.stringify({
        error: "Upstream API error",
        message: errorMessage,
        details: errorDetails,
        upstreamUrl: upstreamUrl.toString(),
        upstreamCode: errorCode,
      }),
      {
        status: isAbort || isConnectTimeout ? 504 : 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}


export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  const { path } = context.params;
  return proxy(request, path);
}
