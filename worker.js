/**
 * AI Chat Update Server - Cloudflare Worker
 * 
 * 功能：
 * - 提供版本检查API
 * - 支持CORS跨域请求
 * - 返回JSON格式的版本信息
 */

const DEFAULT_RESPONSE = {
  version: "1.6.2",
  exe_version: "16",
  download_url: "https://pan.huang1111.cn/s/BGWjYF6?path=%2FAI-Chat",
  release_date: "2025-12-25",
  changelog: {
    "1.6.2": "兼容更新服务器",
    "1.6.1": "提升代码质量",
  }
};

const ALLOWED_ORIGINS = [
  "https://*.cloudflare.com",
  "http://localhost:*",
  "http://127.0.0.1:*"
];

function getCorsHeaders(origin) {
  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (allowed.endsWith(":*")) {
      return origin && origin.startsWith(allowed.slice(0, -2));
    }
    return origin === allowed;
  });

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const origin = request.headers.get("Origin");
  const isHttps = request.url.startsWith("https://");

  if (!isHttps && method !== "OPTIONS") {
    const httpsUrl = `https://${url.host}${url.pathname}${url.search}`;
    return Response.redirect(httpsUrl, 301);
  }

  const corsHeaders = getCorsHeaders(request, origin);

  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block"
      }
    });
  }

  if (method !== "GET") {
    return new Response(JSON.stringify({
      error: "Method not allowed",
      message: "只支持GET请求"
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
      }
    });
  }

  const responseData = {
    ...DEFAULT_RESPONSE,
    last_check: new Date().toISOString(),
    request_path: path,
    request_ip: request.headers.get("CF-Connecting-IP") || "unknown"
  };

  if (path === "/" || path === "/version" || path === "/api/version") {
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }

  if (path === "/health" || path === "/ping") {
    return new Response(JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      worker: "ai-chat-update-server"
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
      }
    });
  }

  if (path === "/info") {
    return new Response(JSON.stringify({
      name: "AI Chat Update Server",
      version: "1.0.0",
      description: "提供AI Chat应用的版本检查服务",
      endpoints: {
        "/": "获取版本信息",
        "/version": "获取版本信息（API）",
        "/health": "健康检查",
        "/info": "服务器信息"
      }
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
      }
    });
  }

  return new Response(JSON.stringify({
    error: "Not found",
    message: "请求的路径不存在",
    available_paths: ["/", "/version", "/health", "/info"]
  }), {
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
    }
  });
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

console.log("AI Chat Update Server initialized");
