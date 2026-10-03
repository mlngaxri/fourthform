import {readFile,readdir} from "node:fs/promises";
import assert from "node:assert/strict";
const portal=new URL("../apps/portal/public/",import.meta.url),marketing=new URL("../apps/marketing/public/portal-preview/",import.meta.url);
let count=0;for(const name of await readdir(portal)){if(name==="index.html"||name.startsWith("portal-")){assert.deepEqual(await readFile(new URL(name,portal)),await readFile(new URL(name,marketing)),`Shared preview differs: ${name}`);count++;}}
console.log(`${count} shared preview files are identical.`);
assert.deepEqual(await readFile(new URL("../shared/portal-atmosphere.css",import.meta.url)),await readFile(new URL("portal-atmosphere.css",portal)),"Brand atmosphere must match the connected portal and both previews.");
