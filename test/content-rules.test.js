'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {allowedFanArt,badWordFound,staticReason,normalize}=require('../src/content-rules');
const make=(text,settings={})=>({content:text,mentions:{users:new Map(),roles:new Map()},...settings});
const cfg={moderation:{blockInvites:true,blockLinks:false,maxMentions:6,badWords:['bad phrase'],blockCaps:true}};
test('the original fan-art filter accepts attached images and videos',()=>{
 for(const [name,contentType] of [['goat.PNG','image/png'],['art.jpg','image/jpeg'],['fanart.webp','image/webp'],['loop.gif','image/gif'],['clip.MP4','video/mp4'],['movie.webm','video/webm'],['edit.mov','video/quicktime']])assert.equal(allowedFanArt({name,contentType}),true,name);
});
test('rejects invalid or mismatched attachments',()=>{
 for(const [name,contentType] of [['document.pdf','application/pdf'],['code.zip','application/zip'],['fake.jpg','application/pdf'],['pic.gif',undefined],['script.exe','image/png']])assert.equal(allowedFanArt({name,contentType}),false,name);
});
test('matches words without triggering inside other words',()=>{assert.equal(badWordFound('not grass',['ass']),false);assert.equal(badWordFound('the ASS!',['ass']),true);assert.equal(badWordFound('example bad phrase indeed',['bad phrase']),true);});
test('invites and caps are detected; ordinary content is allowed',()=>{
 assert.equal(staticReason(make('https://discord.gg/abcdef'),cfg),'Discord invite link');
 assert.equal(staticReason(make('THIS IS A VERY LONG SHOUTING MESSAGE'),cfg),'Excessive CAPS');
 assert.equal(staticReason(make('Look at my goat drawing :D'),cfg),null);
});
test('mentions and blocked phrases are detected',()=>{
 const m=make('hello',{mentions:{users:new Map(Array.from({length:7},(_,i)=>[String(i),{}])),roles:new Map()}});assert.equal(staticReason(m,cfg),'Too many mentions');assert.equal(staticReason(make('that bad phrase is blocked'),cfg),'Blocked language');
});
test('normalized text collapses whitespace',()=>assert.equal(normalize('  HEY   GOAT\nBYE  '),'hey goat bye'));
