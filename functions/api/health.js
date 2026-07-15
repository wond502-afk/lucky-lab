export function onRequestGet() {
  return Response.json({
    ok: true,
    service: "lucky-lab",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  }, {
    headers: { "cache-control": "no-store" }
  });
}
