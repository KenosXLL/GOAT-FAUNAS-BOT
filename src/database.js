'use strict';
const {Pool} = require('pg');
const {databaseUrl,pgssl} = require('./config');
const pool = new Pool({connectionString:databaseUrl,max:5,idleTimeoutMillis:30000,connectionTimeoutMillis:10000,ssl:pgssl?{rejectUnauthorized:true}:undefined});
const defaults=()=>({
 tickets:{panelChannelId:null,panelMessageId:null,categoryId:null,staffRoleId:null,logChannelId:null,maxOpen:2,autoCloseHours:0},
 voice:{panelChannelId:null,panelMessageId:null,categoryId:null,defaultLimit:0},
 channels:{announcements:null,updates:null,suggestions:null,reports:null,fanart:null},
 moderation:{enabled:true,logChannelId:null,spamCount:6,spamWindowSec:8,duplicateCount:3,maxMentions:6,blockInvites:true,blockLinks:false,blockCaps:true,badWords:[],ignoredChannels:[],timeoutMinutes:10}
});
function normalize(data){const base=defaults(),v=data||{};for(const key of Object.keys(base))base[key]={...base[key],...(v[key]||{})};return base;}
async function init(){
 await pool.query(`
 CREATE TABLE IF NOT EXISTS guild_config(guild_id TEXT PRIMARY KEY,data JSONB NOT NULL DEFAULT '{}'::jsonb);
 CREATE TABLE IF NOT EXISTS tickets(
  id BIGSERIAL PRIMARY KEY,guild_id TEXT NOT NULL,channel_id TEXT UNIQUE,opener_id TEXT NOT NULL,
  subject TEXT NOT NULL,details TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'open',priority TEXT NOT NULL DEFAULT 'normal',
  category TEXT NOT NULL DEFAULT 'General',claimed_by TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),closed_at TIMESTAMPTZ,closed_by TEXT,
  feedback_rating INTEGER,feedback TEXT);
 CREATE INDEX IF NOT EXISTS tickets_user_idx ON tickets(guild_id,opener_id,status);
 CREATE TABLE IF NOT EXISTS ticket_members(ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,user_id TEXT NOT NULL,PRIMARY KEY(ticket_id,user_id));
 CREATE TABLE IF NOT EXISTS voice_channels(channel_id TEXT PRIMARY KEY,guild_id TEXT NOT NULL,owner_id TEXT NOT NULL,locked BOOLEAN NOT NULL DEFAULT false,hidden BOOLEAN NOT NULL DEFAULT false,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
 CREATE UNIQUE INDEX IF NOT EXISTS voice_one_owner_idx ON voice_channels(guild_id,owner_id);
 CREATE TABLE IF NOT EXISTS warnings(id BIGSERIAL PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,moderator_id TEXT NOT NULL,reason TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE IF NOT EXISTS suggestions(id BIGSERIAL PRIMARY KEY,guild_id TEXT NOT NULL,user_id TEXT NOT NULL,message_id TEXT,channel_id TEXT,content TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS suggestion_votes(suggestion_id BIGINT REFERENCES suggestions(id) ON DELETE CASCADE,user_id TEXT NOT NULL,vote INTEGER NOT NULL,PRIMARY KEY(suggestion_id,user_id));
 CREATE TABLE IF NOT EXISTS polls(id BIGSERIAL PRIMARY KEY,guild_id TEXT NOT NULL,channel_id TEXT,message_id TEXT,question TEXT NOT NULL,options JSONB NOT NULL,author_id TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
 CREATE TABLE IF NOT EXISTS poll_votes(poll_id BIGINT REFERENCES polls(id) ON DELETE CASCADE,user_id TEXT NOT NULL,choice INTEGER NOT NULL,PRIMARY KEY(poll_id,user_id));
 CREATE TABLE IF NOT EXISTS mod_locks(guild_id TEXT NOT NULL,channel_id TEXT NOT NULL,old_state TEXT NOT NULL,PRIMARY KEY(guild_id,channel_id));
 `);
}
const query=(sql,args=[])=>pool.query(sql,args);
async function config(guildId){const r=await query('SELECT data FROM guild_config WHERE guild_id=$1',[guildId]);return normalize(r.rows[0]?.data);}
async function saveConfig(guildId,data){const v=normalize(data);await query('INSERT INTO guild_config(guild_id,data) VALUES ($1,$2::jsonb) ON CONFLICT(guild_id) DO UPDATE SET data=EXCLUDED.data',[guildId,JSON.stringify(v)]);return v;}
async function updateConfig(guildId,fn){const conn=await pool.connect();try{await conn.query('BEGIN');await conn.query('INSERT INTO guild_config(guild_id,data) VALUES ($1,$2::jsonb) ON CONFLICT DO NOTHING',[guildId,'{}']);const r=await conn.query('SELECT data FROM guild_config WHERE guild_id=$1 FOR UPDATE',[guildId]);const data=normalize(r.rows[0].data);await fn(data);await conn.query('UPDATE guild_config SET data=$2::jsonb WHERE guild_id=$1',[guildId,JSON.stringify(data)]);await conn.query('COMMIT');return data;}catch(e){await conn.query('ROLLBACK');throw e;}finally{conn.release();}}
module.exports={pool,init,query,config,saveConfig,updateConfig,defaults};
