'use strict';
const {EmbedBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const COLOR = 0x4598f4, SUCCESS = 0x59c18b, WARNING=0xf4b253, ERROR=0xed6c72;
const embed=(title,description,color=COLOR)=>{const e=new EmbedBuilder().setColor(color).setTitle(title).setFooter({text:'GOAT • FAUNAS'}).setTimestamp();if(description)e.setDescription(description);return e;};
const success=(title,desc)=>embed(`✅ ${title}`,desc,SUCCESS);
const fail=(title,desc)=>embed(`⚠️ ${title}`,desc,ERROR);
const notice=(title,desc)=>embed(title,desc,WARNING);
const row=(...components)=>new ActionRowBuilder().addComponents(...components);
const btn=(id,label,style=ButtonStyle.Secondary,emoji)=>{const b=new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);if(emoji)b.setEmoji(emoji);return b;};
const field=(id,label,style=TextInputStyle.Short,required=true,max=1000)=>new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required).setMaxLength(max);
const modal=(id,title,fields)=>new ModalBuilder().setCustomId(id).setTitle(title).addComponents(...fields.map(f=>row(f)));
const short=(str,max=100)=>String(str || '').trim().slice(0,max);
const clean=(str,max=1000)=>short(str,max).replace(/@/g,'@\u200b').replace(/<(?=[@#])/g,'<\u200b');
const isStaff=(member,cfg)=>Boolean(member?.permissions?.has?.(PermissionFlagsBits.ManageGuild) || member?.roles?.cache?.has?.(cfg.tickets.staffRoleId));
const isAdmin=(member)=>Boolean(member?.permissions?.has?.(PermissionFlagsBits.ManageGuild));
const canMod=(member)=>Boolean(member?.permissions?.has?.(PermissionFlagsBits.ModerateMembers) || member?.permissions?.has?.(PermissionFlagsBits.ManageMessages));
async function reply(i,payload){const data={allowedMentions:{parse:[]},...payload};if(!i.deferred && !i.replied)return i.reply({flags:MessageFlags.Ephemeral,...data});return i.followUp({flags:MessageFlags.Ephemeral,...data});}
const errorReply=(i,msg)=>reply(i,{embeds:[fail('Not quite!',msg)]});
async function audit(guild,cfg,description,extra={}){const id=cfg.moderation.logChannelId || cfg.tickets.logChannelId;if(!id)return;try{const ch=await guild.channels.fetch(id).catch(()=>null);if(ch?.isTextBased())await ch.send({embeds:[embed('🛡️ GOAT activity',clean(description,3800))],allowedMentions:{parse:[]},...extra});}catch(e){console.error('[Audit]',e.message);}}
const seconds = {minute:60*1000,hour:60*60*1000,day:24*60*60*1000};
module.exports={COLOR,SUCCESS,WARNING,ERROR,embed,success,fail,notice,row,btn,field,modal,short,clean,isStaff,isAdmin,canMod,reply,errorReply,audit,seconds};
