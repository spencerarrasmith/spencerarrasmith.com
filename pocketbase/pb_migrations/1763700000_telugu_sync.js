migrate((app) => {
  const users = app.findCollectionByNameOrId("users");
  users.passwordAuth.enabled = false;      // OAuth2 + one-time codes only
  users.otp.enabled  = true;
  users.otp.length   = 6;
  users.otp.duration = 600;                // 10 minutes
  users.oauth2.enabled = true;             // providers and secrets go in the admin UI, never in git
  users.authToken.duration = 30 * 86400;   // stay signed in for a month (refreshed on every visit)
  app.save(users);

  const own = "user = @request.auth.id";
  app.save(new Collection({
    type: "base", name: "progress",
    listRule: own, viewRule: own, deleteRule: own,
    createRule: "@request.auth.id != '' && @request.body.user = @request.auth.id",
    updateRule: own + " && (@request.body.user:isset = false || @request.body.user = @request.auth.id)",
    fields: [
      { type: "relation", name: "user", collectionId: users.id, maxSelect: 1, required: true, cascadeDelete: true },
      { type: "json",     name: "data", maxSize: 262144 },      // ~256 KB; a full store is well under that
      { type: "autodate", name: "updated", onCreate: true, onUpdate: true },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_progress_user ON progress (user)"],   // one row per user
  }));

  const s = app.settings();
  s.meta.appName = "Telugu Telusu";
  s.meta.appURL  = "https://spencerarrasmith.com";
  s.trustedProxy.headers = ["X-Forwarded-For"];   // real client IPs behind Caddy, for rate limits and logs
  s.rateLimits.enabled = true;
  app.save(s);
}, (app) => {
  app.delete(app.findCollectionByNameOrId("progress"));
});
