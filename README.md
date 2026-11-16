# 🐐 GOAT — FAUNAS Discord Bot

**GOAT** is a friendly, configurable, English-language Discord bot for the FAUNAS community. It is written in JavaScript with discord.js v14, uses PostgreSQL for persistent settings, and is designed as **one always-on Railway worker**.

> **Important:** This is a substantial source-code starter, not a claim of Discord production certification. The content-filter tests and JavaScript syntax checks pass locally. Discord commands, permissions, database migrations, live messages, and Railway deployment must still be tested against your actual server and credentials.

## Features

### 🎫 Ticket system

- Staff-controlled support setup with `/setup tickets` and private ticket category.
- Public panel with four buttons: **General Support**, **Report a Bug**, **Appeal**, **Other**.
- Private channels with the opener and staff role, ticket ID, subject and description.
- `/ticket` commands for open, info, close, reopen, delete, claim, priority, category, rename, guest add/remove, transcript, escalate, private note and stats.
- Ticket channel buttons: claim/unclaim, priority, close, transcript, reopen, feedback and delete.
- Inactivity auto-close (disabled until configured), per-person maximum open tickets, ticket activity tracking.
- Text transcripts of the most recent 500 accessible messages, sent to a **private staff logs channel** when tickets close/delete or when exported.
- One-to-five-star feedback saved in PostgreSQL and visible in support stats.
- Ticket and feedback logs must remain in staff-only channels.

### 🔊 Temporary personal voice channels

- `/setup voice` posts a **Create Channel** button in your chosen channel (e.g. `#create-voice`).
- A member gets one personal voice room per server, under the configured category.
- Owner dashboard via `/voice panel`, with buttons for lock, visibility, rename, limits and member tools.
- Owners can allow/deny others, disconnect members, prevent speaking in their room (channel-level **Speak** permission), restore speaking, and transfer ownership.
- Personal voice rooms are auto-deleted after the last member leaves (grace period). Rooms are also recovered/cleaned after restart.
- Ownership can transfer to another remaining member when an owner leaves.
- **This does not grant server-wide mute privileges to room owners.** The `/mod timeout` command is for actual moderators.

### 🛡️ Moderation and AutoMod

- Configurable message flooding, duplicate messages, invites, external links, excessive mentions, blocked words/phrases and ALL CAPS.
- Removes violations, attempts a friendly DM and logs to a staff channel.
- Repeated violations within 10 minutes may result in an automatic timeout (provided GOAT has `Moderate Members` and sufficient role hierarchy).
- Raid-watch **alerts only**, when 10 joins are detected in 20 seconds; it does not auto-ban.
- `/mod warn`, `warnings`, `clear-warnings`, `ban`, `unban`, `bans`, `kick`, `timeout`, `untimeout`, `purge`, `slowmode`, `lock`, `unlock`.
- Lock/unlock remembers the old @everyone send-permission state instead of clearing arbitrary permissions.
- Individual Discord permission checks for destructive moderation operations.

### 📣 Updates, community and fun

- `/setup announcements`: choose announcement and game-update channels.
- `/post announcement` and `/post update`: branded embeds (optional HTTPS image URL).
- `/community suggest`: suggestions with persistent upvotes/downvotes.
- `/community poll`: persistent vote counts, staff-only creation.
- `/community report`: private reports to a restricted staff channel.
- `/info server`, `user`, `avatar`, `bot`.
- `/fun coinflip`, `roll`, `eightball`, `rps`, `choose`, `goatfact`; `/help` and `/ping`.

### 🎨 Existing fan-art behavior (not redesigned)

Configure `/setup fanart channel:#fan-art`. GOAT accepts messages with **one or more valid PNG, JPG, JPEG, WEBP, GIF, MP4, WEBM or MOV attachments** (descriptions are allowed). It deletes messages with only text, files of the wrong type or mixed allowed/disallowed attachments. Attachments must have matching file extensions and Discord-reported MIME types. Edits are checked too. GOAT cannot guarantee that uploaded files are safe or that artwork is actually about FAUNAS.

## Requirements

- **Node.js 24.17+** (Railway Dockerfile uses Node.js 24).
- A Discord application with a **Bot** user.
- A PostgreSQL database (Railway can provision one in your project).
- One bot process / one Railway replica. Multiple replicas can duplicate gateway events, panels and rate limits.
- Keep your token secret: never put a real `.env` on GitHub.

## 1. Create the Discord app

1. Visit https://discord.com/developers/applications and choose **New Application**, name it `GOAT`.
2. Open **Bot** and generate its token.
3. Under **Privileged Gateway Intents**, enable **SERVER MEMBERS INTENT** and **MESSAGE CONTENT INTENT**. The other requested intents are not privileged.
4. Invite the app with scopes **bot** and **applications.commands**.
5. Give the bot these permissions in the guild and relevant channels:
   - View Channels, Send Messages, Embed Links, Attach Files, Read Message History
   - **Manage Channels**, **Manage Roles** (required to manage channel permission overwrites)
   - **Manage Messages** (fan-art, AutoMod and `/mod purge`)
   - **Move Members** (temporary voice features)
   - **Moderate Members** (timeouts)
   - **Kick Members**, **Ban Members** (moderation)
6. Place the GOAT role **above the member and staff roles it must moderate or manage**. It cannot kick, ban or time out the server owner or users above it.
7. Avoid granting `Administrator`: not required for the intended features.

### Important privacy setup

Create a private staff-only log channel (e.g. `#goat-logs`) **before** using `/setup tickets`. Transcripts may contain private user conversations. Likewise, `#player-reports` must be a **private** channel. The setup commands reject log/report channels publicly visible to @everyone.

## 2. Deploy to Railway

1. Upload the unzipped project to a **private or public GitHub repository** (never include `.env`).
2. Open https://railway.com/ → **New Project** → **Deploy from GitHub repo**, select GOAT's repository.
3. In the same Railway project, click **+ New → Database → PostgreSQL**.
4. In the GOAT service, add these Railway **Variables**:

   ```env
   DISCORD_TOKEN=YOUR_REAL_BOT_TOKEN
   CLIENT_ID=YOUR_APPLICATION_ID
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   GUILD_ID=YOUR_TEST_SERVER_ID
   ```

   The database line must be a **Railway reference variable**, not the literal fake example in `.env.example`. If your database service has a different name, choose its `DATABASE_URL` from Railway's variable reference UI.

5. GOAT includes a `Dockerfile`. Railway can build it and automatically start `node src/index.js`.
6. In **Settings → Deploy → Serverless**, **disable Serverless**. Use one replica and configure restarts on failure.
7. GOAT does **not** need a public HTTP domain or health endpoint. Watch **Deployment Logs** for `[Database] Connected`, `[Commands] Registered`, and `[GOAT] Online`.
8. Set `GUILD_ID` during development so commands register fast in your test server. You can remove it for global commands later; global commands may take time to appear.

Railway itself is **not guaranteed free 24/7**: the GOAT worker **and PostgreSQL** consume resources/credits. Review Railway plan limits and cost controls before enabling an always-on worker. Database backups are your responsibility: a running database is not automatically a backup.

**Official reading:** https://docs.railway.com/databases/postgresql · https://docs.railway.com/deployments/serverless

## 3. Run locally (optional)

Install Node 24.17+ and PostgreSQL, create a database, and put valid credentials into `.env` using `.env.example` as the template. Then run:

```bash
npm install
npm start
```

For local checks:

```bash
npm test
npm run check
```

The bot creates its database tables on startup. No separate migration command is needed in this release.

## 4. Configure GOAT in Discord

Use slash commands as a server administrator. Configure channels **by choosing them in Discord**, not by editing source code.

| Command | What it does |
|---|---|
| `/setup tickets channel:#openaticket category:Support staff_role:@Support logs:#goat-logs` | Posts a ticket panel and protects private tickets |
| `/setup voice channel:#create-voice category:Temporary Voice` | Posts the voice room creation panel |
| `/setup announcements announcements:#announcements updates:#game-updates` | Sets official post destinations |
| `/setup community suggestions:#suggestions reports:#player-reports` | Sets community destinations |
| `/setup logs channel:#goat-logs` | Enables AutoMod/moderation audit messages |
| `/setup fanart channel:#fan-art` | Keeps the image/video-only filter |
| `/setup ticket-options max_open:2 auto_close_hours:72` | Configures support limits and inactivity closure |
| `/setup automod enabled:true spam_count:6 max_mentions:6 block_invites:true` | Adjusts moderation behavior |
| `/setup word-add phrase:<your phrase>` | Adds a server-specific blocked phrase |
| `/setup word-remove phrase:<your phrase>` | Removes a blocked phrase |
| `/setup ignore-channel channel:#bot-commands ignored:true` | Excludes a channel from AutoMod |
| `/setup status` | Shows current settings |

If channels don't appear in the slash picker, make sure the bot has **View Channel** permission there. The panel messages are reused on `/setup tickets`/`/setup voice` if the same panel channel is configured; when changing panel channels, the old panel becomes inactive.

## 5. Test these workflows before public launch

1. Create tickets with two different users. Confirm outsiders cannot read ticket channels, staff can view them, closed tickets cannot be chatted in by opener, and the transcript reaches only your private log channel.
2. Open more tickets than the configured per-user limit. Claim, prioritize, escalate, add a guest, reopen, rate and delete one.
3. Create a voice room; check ownership, invite/deny, lock/show/hide, voice limits and automatic cleanup after everyone leaves.
4. Test moderation with a **test account**. Check permission hierarchy, timeout durations, word rules, protected staff roles and logging.
5. Reboot or redeploy GOAT. Check that `/setup status`, votes and ticket history persist.
6. Check AutoMod false positives before enabling more aggressive rules for a large community.
7. Check service usage/billing in Railway and enable database backups if you intend to keep data long-term.

## Notes and limitations

- The bot is **not** an antivirus, AI image classifier, or 100% prevention against spam/raids. Discord's built-in AutoMod can complement GOAT.
- Uploaded content and chat logs are subject to Discord's policies. Protect transcripts and reports with staff-only permissions.
- Transcript export captures the **most recent 500 accessible messages**, not an immutable full audit history. File attachments appear as URLs.
- AutoMod spam counts and cooldowns live in memory and reset on restart; configuration, tickets, warnings, voice ownership, and votes persist in PostgreSQL.
- Temporary voice channels are cleaned on their next empty state or after restart checks, rather than instantly disappearing before Discord voice state settles.
- Channel role overwrites and Discord role hierarchy still apply; members with `Administrator` cannot be blocked by user-level voice permissions.
- REST and gateway events have real rate limits. Do not scale beyond a single replica without reworking shared caching and event distribution.
- This source has **not** been live-tested with your Discord server, token, or Railway account. Syntax/content rule tests passed; conduct live acceptance tests before opening to a public community.

Built for FAUNAS, with a little goat energy. 🐐
