'use strict';
require('dotenv').config();
const required = ['DISCORD_TOKEN','CLIENT_ID','DATABASE_URL'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  databaseUrl: process.env.DATABASE_URL,
  pgssl: process.env.PGSSL === 'true'
};
