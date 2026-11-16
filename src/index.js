'use strict';
const {Client,GatewayIntentBits,Partials,Events,MessageFlags,ActivityType}=require('discord.js');
const conf=require('./config'),db=require('./database');
const {register}=require('./commands');
const tickets=require('./tickets'),voice=require('./voice'),automod=require('./automod'),mod=require('./moderation'),community=require('./community'),setup=require('./setup');
const {errorReply}=require('./utils');
const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildVoiceStates],partials:[Partials.Message,Partials.Channel,Partials.GuildMember]});
client.once(Events.ClientReady,async c=>{console.log(`[GOAT] Online as ${c.user.tag} • ${c.guilds.cache.size} servers`);c.user.setPresence({activities:[{name:'FAUNAS 🐐 | /help',type:ActivityType.Watching}],status:'online'});setTimeout(()=>voice.startupSweep(c).catch(e=>console.error('[Voice startup]',e)),45000).unref?.();setInterval(()=>tickets.autoClose(c).catch(e=>console.error('[Ticket sweep]',e)),3600000).unref?.();setInterval(()=>automod.sweep(),180000).unref?.();});
client.on(Events.InteractionCreate,async i=>{if(!i.inGuild())return;try{
 if(i.isChatInputCommand()){const n=i.commandName;if(n==='setup')return await setup.execute(i);if(n==='ticket')return await tickets.execute(i);if(n==='voice')return await voice.execute(i);if(n==='mod')return await mod.execute(i);if(n==='post')return await community.post(i);if(n==='community')return await community.execute(i);if(n==='info')return await community.info(i);if(n==='fun')return await community.fun(i);if(n==='help')return await community.help(i);if(n==='ping')return await community.ping(i);}
 if(i.isButton()&&i.customId.startsWith('goat:')){if(i.customId.startsWith('goat:ticket:'))return await tickets.button(i);if(i.customId.startsWith('goat:voice:'))return await voice.button(i);if(i.customId.startsWith('goat:community:'))return await community.button(i);}
 if(i.isUserSelectMenu()&&i.customId.startsWith('goat:voice:select:'))return await voice.select(i);
 if(i.isModalSubmit()){if(i.customId.startsWith('goat:ticket:'))return await tickets.modalSubmit(i);if(i.customId.startsWith('goat:voice:'))return await voice.modalSubmit(i);}
 }catch(e){console.error(`[Interaction ${i.customId||i.commandName}]`,e);try{await errorReply(i,'Something went wrong while handling that action. Please try again, and check my permissions if it keeps happening.');}catch{}}});
client.on(Events.MessageCreate,async m=>{await automod.scan(m);await tickets.trackMessage(m).catch(e=>console.error('[Ticket activity]',e.message));});
client.on(Events.MessageUpdate,async(_,m)=>automod.scan(m,{edited:true}));
client.on(Events.VoiceStateUpdate,(a,b)=>voice.voiceState(a,b).catch(e=>console.error('[VoiceState]',e)));
client.on(Events.GuildMemberAdd,m=>automod.memberJoin(m).catch(e=>console.error('[Raid watch]',e)));
client.on(Events.Error,e=>console.error('[Discord]',e));
process.on('unhandledRejection',e=>console.error('[Unhandled rejection]',e));
process.on('uncaughtException',e=>{console.error('[Fatal]',e);process.exit(1);});
async function start(){await db.init();console.log('[Database] Connected, tables ready');await register();await client.login(conf.token);}
start().catch(e=>{console.error('[Startup failed]',e.message);process.exit(1);});
async function shutdown(){console.log('[GOAT] Shutting down...');client.destroy();await db.pool.end().catch(()=>{});process.exit(0);}
process.once('SIGINT',shutdown);process.once('SIGTERM',shutdown);
