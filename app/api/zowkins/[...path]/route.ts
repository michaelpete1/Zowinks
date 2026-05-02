import { NextRequest } from "next/server";

const UPSTREAM_BASE = process.env.ZOWKINS_UPSTREAM_API_BASE || "https://zowkins-api.onrender.com/v1";

async function proxy(request: NextRequest, pathSegments: string[]) {
  const upstreamSegments = pathSegments[0] === "v1" ? pathSegments.slice(1) : pathSegments;
  const upstreamUrl = new URL(`${UPSTREAM_BASE.replace(/\/$/, "")}/${upstreamSegments.join("/")}`);
  upstreamUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "follow",
    signal: controller.signal,
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, init);
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

    return new Response(await upstreamResponse.text(), {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Upstream API error", details: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
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
