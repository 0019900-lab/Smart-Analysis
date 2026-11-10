// ينسخ ملفات تطبيق الويب إلى desktop/app ويزامن رقم الإصدار:  node prepare.mjs
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.join(here,'..'),out=path.join(here,'app');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const okExt=/\.(html|js|css|png|jpg|svg|webmanifest)$/i,skip=/(\.test\.|^sw\.js$|^v\d+_.*\.png$|^package\.json$)/;
for(const f of fs.readdirSync(root,{withFileTypes:true})){
 if(f.isFile()&&okExt.test(f.name)&&!skip.test(f.name))fs.copyFileSync(path.join(root,f.name),path.join(out,f.name));
 else if(f.isDirectory()&&['assets','vendor'].includes(f.name))fs.cpSync(path.join(root,f.name),path.join(out,f.name),{recursive:true})}
const v=/VERSION='([^']+)'/.exec(fs.readFileSync(path.join(root,'version.js'),'utf8'))[1];
const pj=path.join(here,'package.json'),j=JSON.parse(fs.readFileSync(pj,'utf8'));j.version=v;fs.writeFileSync(pj,JSON.stringify(j,null,2)+'\n');
console.log('app prepared, version',v,'files',fs.readdirSync(out).length);
