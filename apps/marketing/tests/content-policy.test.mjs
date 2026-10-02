import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdir,readFile} from 'node:fs/promises';
async function sources(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())out.push(...await sources(path));else if(/\.(tsx?|js|css|html|json|md)$/.test(path))out.push(path);}return out;}
test('marketing, onboarding and embedded portal copy contain no em dashes',async()=>{const files=(await Promise.all(['app','components','lib','public/portal-preview','docs/MESSAGING.md'].map(async path=>path.endsWith('.md')?[path]:sources(path)))).flat();for(const file of files){const text=await readFile(file,'utf8');assert.ok(!/[\u2014]|&mdash;|&#(?:8212|x2014);|\\u2014/i.test(text),file);}});
