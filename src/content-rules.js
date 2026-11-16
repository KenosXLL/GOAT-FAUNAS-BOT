'use strict';
const allowedImage=new Set(['png','jpg','jpeg','webp','gif']),allowedVideo=new Set(['mp4','webm','mov']);
const validMimeImg=new Set(['image/png','image/jpeg','image/webp','image/gif']);
const validMimeVid=new Set(['video/mp4','video/webm','video/quicktime']);
function allowedFanArt(a){const ext=a.name?.split('.').pop()?.toLowerCase(),mime=a.contentType?.split(';')[0]?.toLowerCase();if(!ext||!mime)return false;return (allowedImage.has(ext)&&validMimeImg.has(mime))||(allowedVideo.has(ext)&&validMimeVid.has(mime));}
const normalize=s=>String(s).toLowerCase().replace(/\s+/g,' ').trim();
function badWordFound(content,badWords){const lower=content.toLowerCase();return badWords.some(w=>{const x=w.toLowerCase().trim();if(!x)return false;if(x.includes(' '))return lower.includes(x);const escaped=x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`,'iu').test(lower);});}
function staticReason(m,cfg){const text=m.content||'',mod=cfg.moderation;
 if(mod.blockInvites&&/(?:discord\.gg|discord(?:app)?\.com\/invite)\/\S+/i.test(text))return 'Discord invite link';
 if(mod.blockLinks&&/https?:\/\/[^\s]+/i.test(text))return 'External link';
 if(mod.maxMentions>0&&new Set([...m.mentions.users.keys(),...m.mentions.roles.keys()]).size>mod.maxMentions)return 'Too many mentions';
 if(mod.badWords?.length&&badWordFound(text,mod.badWords))return 'Blocked language';
 if(mod.blockCaps){const letters=[...text].filter(c=>/\p{L}/u.test(c)).join('');if(letters.length>=18){const uppercase=[...letters].filter(c=>c===c.toUpperCase()&&c!==c.toLowerCase()).length;if(uppercase/letters.length>=.86)return 'Excessive CAPS';}}
 if(text.length>1200&&/(.)\1{20,}/s.test(text))return 'Flooding repeated characters';
 return null;}
module.exports={allowedFanArt,normalize,badWordFound,staticReason};
