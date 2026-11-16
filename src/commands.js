'use strict';
const {SlashCommandBuilder,ChannelType,PermissionFlagsBits,REST,Routes}=require('discord.js');
const {clientId,guildId,token}=require('./config');
const channel=(sub,name,desc,types=[ChannelType.GuildText])=>sub.addChannelOption(o=>o.setName(name).setDescription(desc).setRequired(true).addChannelTypes(...types));
const user=(sub,name='user',req=true)=>sub.addUserOption(o=>o.setName(name).setDescription('Discord member').setRequired(req));
const reason=(sub,req=false)=>sub.addStringOption(o=>o.setName('reason').setDescription('Short explanation').setRequired(req).setMaxLength(500));
const setup=new SlashCommandBuilder().setName('setup').setDescription('Configure GOAT for your server').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
.addSubcommand(s=>channel(s.setName('tickets').setDescription('Ticket panel location and support team'),'channel','Where the ticket button goes').addChannelOption(o=>o.setName('category').setDescription('Private ticket category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)).addRoleOption(o=>o.setName('staff_role').setDescription('Support team role').setRequired(true)).addChannelOption(o=>o.setName('logs').setDescription('Private staff transcript/log channel').addChannelTypes(ChannelType.GuildText).setRequired(true)))
.addSubcommand(s=>channel(s.setName('voice').setDescription('Create-your-own voice channel panel'),'channel','Where the Create Channel button goes').addChannelOption(o=>o.setName('category').setDescription('Where generated voice channels go').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
.addSubcommand(s=>channel(s.setName('announcements').setDescription('Announcement and game update channels'),'announcements','Public announcements channel').addChannelOption(o=>o.setName('updates').setDescription('Game updates channel').addChannelTypes(ChannelType.GuildText).setRequired(true)))
.addSubcommand(s=>channel(s.setName('community').setDescription('Suggestion and report destinations'),'suggestions','Suggestion voting channel').addChannelOption(o=>o.setName('reports').setDescription('Private staff report channel').addChannelTypes(ChannelType.GuildText).setRequired(true)))
.addSubcommand(s=>channel(s.setName('logs').setDescription('Staff-only moderation logs'),'channel','Mod actions and AutoMod logs'))
.addSubcommand(s=>channel(s.setName('fanart').setDescription('Enable the original image/video-only filter'),'channel','Fan art channel'))
.addSubcommand(s=>s.setName('ticket-options').setDescription('Ticket limits and inactivity settings').addIntegerOption(o=>o.setName('max_open').setDescription('Maximum open tickets per member (1-5)').setMinValue(1).setMaxValue(5)).addIntegerOption(o=>o.setName('auto_close_hours').setDescription('Close inactive tickets after X hours (0 disables)').setMinValue(0).setMaxValue(720)))
.addSubcommand(s=>s.setName('automod').setDescription('Fine tune anti-spam rules').addBooleanOption(o=>o.setName('enabled').setDescription('Enable GOAT AutoMod')).addIntegerOption(o=>o.setName('spam_count').setDescription('Messages allowed per 8 seconds (3-20)').setMinValue(3).setMaxValue(20)).addIntegerOption(o=>o.setName('max_mentions').setDescription('Maximum mentions in one message (2-20)').setMinValue(2).setMaxValue(20)).addBooleanOption(o=>o.setName('block_invites').setDescription('Block Discord invite links')).addBooleanOption(o=>o.setName('block_links').setDescription('Block all links (off by default)')).addBooleanOption(o=>o.setName('block_caps').setDescription('Block excessive ALL CAPS')).addIntegerOption(o=>o.setName('timeout_minutes').setDescription('Escalation timeout duration (1-60 minutes)').setMinValue(1).setMaxValue(60)))
.addSubcommand(s=>s.setName('word-add').setDescription('Block a word or phrase').addStringOption(o=>o.setName('phrase').setDescription('Case-insensitive phrase').setRequired(true).setMinLength(2).setMaxLength(80)))
.addSubcommand(s=>s.setName('word-remove').setDescription('Remove a blocked word').addStringOption(o=>o.setName('phrase').setDescription('Case-insensitive phrase').setRequired(true)))
.addSubcommand(s=>channel(s.setName('ignore-channel').setDescription('Exclude a channel from AutoMod'),'channel','Channel to exclude').addBooleanOption(o=>o.setName('ignored').setDescription('True to ignore, false to restore').setRequired(true)))
.addSubcommand(s=>s.setName('status').setDescription('See currently configured GOAT features'));
const ticket=new SlashCommandBuilder().setName('ticket').setDescription('Support ticket tools')
.addSubcommand(s=>s.setName('open').setDescription('Open a new support ticket'))
.addSubcommand(s=>s.setName('panel').setDescription('Repost the support panel (staff only)'))
.addSubcommand(s=>s.setName('close').setDescription('Close the current ticket').addStringOption(o=>o.setName('reason').setDescription('Reason for closing').setMaxLength(300)))
.addSubcommand(s=>s.setName('reopen').setDescription('Reopen a closed ticket (staff)'))
.addSubcommand(s=>s.setName('delete').setDescription('Permanently remove the ticket channel (staff)'))
.addSubcommand(s=>s.setName('claim').setDescription('Claim or unclaim a ticket (staff)'))
.addSubcommand(s=>s.setName('priority').setDescription('Set ticket priority (staff)').addStringOption(o=>o.setName('level').setDescription('Priority').setRequired(true).addChoices({name:'Low',value:'low'},{name:'Normal',value:'normal'},{name:'High',value:'high'},{name:'Urgent',value:'urgent'})))
.addSubcommand(s=>s.setName('category').setDescription('Change the type of ticket (staff)').addStringOption(o=>o.setName('type').setDescription('Ticket topic').setRequired(true).addChoices({name:'General',value:'General'},{name:'Bug Report',value:'Bug Report'},{name:'Appeal',value:'Appeal'},{name:'Partnership',value:'Partnership'},{name:'Other',value:'Other'})))
.addSubcommand(s=>s.setName('escalate').setDescription('Flag an urgent ticket for staff'))
.addSubcommand(s=>s.setName('note').setDescription('Add a private support note to logs').addStringOption(o=>o.setName('text').setDescription('Internal support note').setRequired(true).setMaxLength(1000)))
.addSubcommand(s=>s.setName('stats').setDescription('Support desk stats (staff)'))
.addSubcommand(s=>user(s.setName('add').setDescription('Give a user access (staff)')))
.addSubcommand(s=>user(s.setName('remove').setDescription('Remove a guest from this ticket (staff)')))
.addSubcommand(s=>s.setName('rename').setDescription('Rename ticket (staff)').addStringOption(o=>o.setName('name').setDescription('New ticket channel name').setRequired(true).setMaxLength(60)))
.addSubcommand(s=>s.setName('transcript').setDescription('Export the last 500 ticket messages (staff)'))
.addSubcommand(s=>s.setName('info').setDescription('Show ticket details'));
const voice=new SlashCommandBuilder().setName('voice').setDescription('Manage your personal voice channel')
.addSubcommand(s=>s.setName('create').setDescription('Create your own voice channel'))
.addSubcommand(s=>s.setName('panel').setDescription('Open your voice channel control panel'))
.addSubcommand(s=>s.setName('info').setDescription('See your voice channel settings'))
.addSubcommand(s=>s.setName('rename').setDescription('Rename your channel').addStringOption(o=>o.setName('name').setDescription('New name').setRequired(true).setMaxLength(70)))
.addSubcommand(s=>s.setName('limit').setDescription('Set max number of people').addIntegerOption(o=>o.setName('users').setDescription('0 means unlimited').setRequired(true).setMinValue(0).setMaxValue(99)))
.addSubcommand(s=>s.setName('lock').setDescription('Lock or unlock voice joining').addBooleanOption(o=>o.setName('locked').setDescription('True = lock').setRequired(true)))
.addSubcommand(s=>s.setName('hide').setDescription('Hide or show voice channel').addBooleanOption(o=>o.setName('hidden').setDescription('True = hidden').setRequired(true)))
.addSubcommand(s=>user(s.setName('allow').setDescription('Let someone join your private channel')))
.addSubcommand(s=>user(s.setName('deny').setDescription('Block someone from joining')))
.addSubcommand(s=>user(s.setName('kick').setDescription('Disconnect someone from your channel')))
.addSubcommand(s=>user(s.setName('silence').setDescription('Prevent someone from speaking in your channel')))
.addSubcommand(s=>user(s.setName('unsilence').setDescription('Restore speaking permission')))
.addSubcommand(s=>user(s.setName('transfer').setDescription('Give ownership to someone inside your channel')))
.addSubcommand(s=>s.setName('delete').setDescription('Delete your own empty voice channel'));
const mod=new SlashCommandBuilder().setName('mod').setDescription('Moderation toolkit')
.addSubcommand(s=>reason(user(s.setName('warn').setDescription('Warn a user')),true))
.addSubcommand(s=>user(s.setName('warnings').setDescription('Show recent warnings')))
.addSubcommand(s=>user(s.setName('clear-warnings').setDescription('Remove warnings for a user')))
.addSubcommand(s=>reason(user(s.setName('ban').setDescription('Ban a user')),true))
.addSubcommand(s=>reason(user(s.setName('kick').setDescription('Kick a member')),true))
.addSubcommand(s=>s.setName('unban').setDescription('Unban by user ID').addStringOption(o=>o.setName('user_id').setDescription('Discord user ID').setRequired(true)).addStringOption(o=>o.setName('reason').setDescription('Reason')))
.addSubcommand(s=>s.setName('bans').setDescription('View latest bans'))
.addSubcommand(s=>reason(user(s.setName('timeout').setDescription('Timeout a member')).addIntegerOption(o=>o.setName('minutes').setDescription('1–40320 minutes').setMinValue(1).setMaxValue(40320).setRequired(true)),true))
.addSubcommand(s=>user(s.setName('untimeout').setDescription('Remove timeout')))
.addSubcommand(s=>s.setName('purge').setDescription('Bulk delete recent messages').addIntegerOption(o=>o.setName('amount').setDescription('2–100 recent messages').setMinValue(2).setMaxValue(100).setRequired(true)))
.addSubcommand(s=>s.setName('slowmode').setDescription('Configure channel slowmode').addIntegerOption(o=>o.setName('seconds').setDescription('0–21600 seconds').setMinValue(0).setMaxValue(21600).setRequired(true)))
.addSubcommand(s=>s.setName('lock').setDescription('Lock the current text channel'))
.addSubcommand(s=>s.setName('unlock').setDescription('Restore its original send permission'));
const post=new SlashCommandBuilder().setName('post').setDescription('Publish official FAUNAS messages').setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
.addSubcommand(s=>s.setName('announcement').setDescription('Post a public announcement').addStringOption(o=>o.setName('title').setDescription('Headline').setRequired(true).setMaxLength(200)).addStringOption(o=>o.setName('message').setDescription('Announcement body').setRequired(true).setMaxLength(3900)).addStringOption(o=>o.setName('image_url').setDescription('Optional https:// image URL')))
.addSubcommand(s=>s.setName('update').setDescription('Post FAUNAS game patch notes').addStringOption(o=>o.setName('version').setDescription('e.g. VB1.2.0').setRequired(true).setMaxLength(40)).addStringOption(o=>o.setName('changes').setDescription('Patch notes').setRequired(true).setMaxLength(3900)).addStringOption(o=>o.setName('image_url').setDescription('Optional https:// image URL')));
const community=new SlashCommandBuilder().setName('community').setDescription('Community suggestions, polls and reports')
.addSubcommand(s=>s.setName('suggest').setDescription('Post an idea with voting').addStringOption(o=>o.setName('idea').setDescription('Your idea for FAUNAS').setRequired(true).setMinLength(10).setMaxLength(1500)))
.addSubcommand(s=>s.setName('report').setDescription('Send a private report to the mod team').addUserOption(o=>o.setName('user').setDescription('Member to report').setRequired(true)).addStringOption(o=>o.setName('details').setDescription('What happened?').setRequired(true).setMaxLength(1500)))
.addSubcommand(s=>s.setName('poll').setDescription('Create a community poll (staff)').addStringOption(o=>o.setName('question').setDescription('Poll question').setRequired(true).setMaxLength(200)).addStringOption(o=>o.setName('option_1').setDescription('First option').setRequired(true).setMaxLength(75)).addStringOption(o=>o.setName('option_2').setDescription('Second option').setRequired(true).setMaxLength(75)).addStringOption(o=>o.setName('option_3').setDescription('Optional third option').setMaxLength(75)).addStringOption(o=>o.setName('option_4').setDescription('Optional fourth option').setMaxLength(75)));
const info=new SlashCommandBuilder().setName('info').setDescription('Useful FAUNAS server information')
.addSubcommand(s=>s.setName('server').setDescription('Server statistics'))
.addSubcommand(s=>user(s.setName('user').setDescription('User profile'),'user',false))
.addSubcommand(s=>user(s.setName('avatar').setDescription('View avatar'),'user',false))
.addSubcommand(s=>s.setName('bot').setDescription('About GOAT'));
const fun=new SlashCommandBuilder().setName('fun').setDescription('Take a little break with GOAT!')
.addSubcommand(s=>s.setName('coinflip').setDescription('Flip a coin'))
.addSubcommand(s=>s.setName('roll').setDescription('Roll a die').addIntegerOption(o=>o.setName('sides').setDescription('2–1000 sides').setMinValue(2).setMaxValue(1000)))
.addSubcommand(s=>s.setName('eightball').setDescription('Ask the magical goat').addStringOption(o=>o.setName('question').setDescription('Your question').setRequired(true).setMaxLength(250)))
.addSubcommand(s=>s.setName('rps').setDescription('Rock paper scissors').addStringOption(o=>o.setName('move').setDescription('Your move').setRequired(true).addChoices({name:'Rock',value:'rock'},{name:'Paper',value:'paper'},{name:'Scissors',value:'scissors'})))
.addSubcommand(s=>s.setName('choose').setDescription('Let GOAT choose').addStringOption(o=>o.setName('options').setDescription('Separate choices with commas').setRequired(true).setMaxLength(500)))
.addSubcommand(s=>s.setName('goatfact').setDescription('A certified goat fact'));
const defs=[setup,ticket,voice,mod,post,community,info,fun,new SlashCommandBuilder().setName('help').setDescription('Explore everything GOAT can do'),new SlashCommandBuilder().setName('ping').setDescription('Check GOAT latency')];
async function register(){const rest=new REST({version:'10'}).setToken(token);const target=guildId?Routes.applicationGuildCommands(clientId,guildId):Routes.applicationCommands(clientId);await rest.put(target,{body:defs.map(x=>x.toJSON())});console.log(`[Commands] Registered ${defs.length} slash commands ${guildId?'for development guild':'globally'}`);}
module.exports={defs,register};
