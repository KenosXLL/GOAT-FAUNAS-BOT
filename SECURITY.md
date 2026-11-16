# GOAT • Security & Privacy

## Secrets
- Never commit the Discord bot token, PostgreSQL password, `.env`, or Railway project credentials.
- Put secrets in Railway Variables. If leaked, immediately rotate the token in Discord Developer Portal and change the database password.
- Protect the Discord application with a strong password and 2FA.

## Permission model
- Discord permission hierarchy is enforced separately by Discord. GOAT cannot moderate users above its role or the guild owner.
- Setup is restricted to members with **Manage Server**.
- Ticket-management commands are restricted to the configured staff role or server managers. Only ticket owners/staff can close; only staff can reopen/delete.
- Temporary voice controls are scoped to the recorded room owner or staff. They do not grant server-wide mute rights.
- Use private category/channel permissions for support tickets, reports and logs. GOAT verifies that @everyone cannot view the selected report and log channels at setup time, but administrators must also audit other role overwrites.

## Data & retention
- PostgreSQL stores server configuration, ticket subjects and details, ticket history, user IDs, warnings, votes, ratings and voice room metadata.
- Ticket message content is **not** stored continuously in the database. Exported transcripts are placed in the configured private Discord logs channel and can contain user text and attachment URLs.
- No automatic transcript deletion policy is implemented. Server moderators should delete old logs and handle deletion/privacy requests appropriately.
- Ticket IDs and warning IDs are sequence IDs. They are not passwords or private authorization tokens.

## Abuse and availability
- GOAT deletes detected spam and may time out repeat offenders. Check for false positives before enabling aggressive filters.
- Bot operations depend on Discord API rate limits and gateway availability. This code has not been live-tested on your server.
- Run one replica; in-memory cooldowns do not coordinate across multiple replicas.
- Back up PostgreSQL separately; a database service without backups is not disaster recovery.
- Discord's native AutoMod can provide additional pre-send protections.
