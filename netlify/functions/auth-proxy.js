const DEFAULT_TARGET = "http://stinis.ddns.net:8081";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

exports.handler = async (event) => {
  const method = (event.httpMethod || "GET").toUpperCase();
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: "",
    };
  }

  const targetBase = (process.env.AUTH_PROXY_TARGET || DEFAULT_TARGET).replace(/\/+$/, "");
  const suffix = (event.path || "").replace(/^\/auth\/?/, "");
  const query = event.rawQuery || "";
  const targetUrl = `${targetBase}/auth/${suffix}${query ? `?${query}` : ""}`;

  const requestHeaders = { ...event.headers };
  delete requestHeaders.host;
  delete requestHeaders.Host;
  requestHeaders["x-forwarded-host"] = event.headers?.host || "";
  requestHeaders["x-forwarded-proto"] = "https";

  try {
    const upstream = await fetch(targetUrl, {
      method,
      headers: requestHeaders,
      body: method === "GET" || method === "HEAD" ? undefined : event.body,
    });

    const body = await upstream.text();
    const headers = {
      ...corsHeaders(),
      "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
    };
    return {
      statusCode: upstream.status,
      headers,
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: {
        ...corsHeaders(),
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        error: "auth_proxy_upstream_failed",
        message: String(err && err.message ? err.message : err),
      }),
    };
  }
};
