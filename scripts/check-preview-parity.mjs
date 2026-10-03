import {readFile,readdir} from "node:fs/promises";
import assert from "node:assert/strict";
await import("./ensure-brand-font.mjs");
const portal=new URL("../apps/portal/public/",import.meta.url),marketing=new URL("../apps/marketing/public/portal-preview/",import.meta.url);
let count=0;for(const name of await readdir(portal)){if(name==="index.html"||name.startsWith("portal-")){assert.deepEqual(await readFile(new URL(name,portal)),await readFile(new URL(name,marketing)),`Shared preview differs: ${name}`);count++;}}
console.log(`${count} shared preview files are identical.`);
assert.deepEqual(await readFile(new URL("../shared/portal-atmosphere.css",import.meta.url)),await readFile(new URL("portal-atmosphere.css",portal)),"Brand atmosphere must match the connected portal and both previews.");

for(const name of ["bellefair.woff","bellefair-LICENSE.txt"]){const master=await readFile(new URL("../shared/fonts/"+name,import.meta.url));for(const target of [new URL("fonts/"+name,portal),new URL("fonts/"+name,marketing),new URL("../apps/marketing/public/fonts/"+name,import.meta.url)])assert.deepEqual(await readFile(target),master,"Shared Bellefair differs: "+name);}

for(const name of ["schibsted-grotesk","archivo"]){for(const extension of [".woff2","-LICENSE.txt"]){const brand=await readFile(new URL("../shared/fonts/"+name+extension,import.meta.url));for(const target of [new URL("fonts/"+name+extension,portal),new URL("fonts/"+name+extension,marketing),new URL("../apps/marketing/public/fonts/"+name+extension,import.meta.url)])assert.deepEqual(await readFile(target),brand,"Shared font differs: "+name+extension);}}
