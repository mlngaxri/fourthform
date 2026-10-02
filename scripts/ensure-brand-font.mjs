import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

// Obtain the unmodified font directly from its foundry. Do not redistribute it in Git.
const source="https://cdn.fontshare.com/wf/DK2FOA46SRWJ5HXWWU5TK4N4CMHYD236/FPEAXZZSH5L2K5MTJFRIWD2MC32IJMN3/THOOS4VOCKT7H2XEB27NQDYM2NYS4AAR.woff2";
const expected="e0ec5644c93b04de82f06a076beabfd0e3688ff89655affecf17c92e2747a45d";
const app=process.cwd();
const pkg=JSON.parse(await readFile(resolve(app,"package.json"),"utf8"));
if(!["fourthform-marketing","fourthform-client-portal"].includes(pkg.name))throw new Error("Run the font setup from a Fourthform app directory.");
const targets=[resolve(app,"public/fonts/clash-display.woff2")];
if(pkg.name==="fourthform-marketing")targets.push(resolve(app,"public/portal-preview/fonts/clash-display.woff2"));
const valid=data=>createHash("sha256").update(data).digest("hex")===expected;
let font=await readFile(targets[0]).catch(()=>null);
if(!font||!valid(font)){
  const response=await fetch(source,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Fontshare returned ${response.status}. The brand font could not be prepared.`);
  font=Buffer.from(await response.arrayBuffer());
  if(!valid(font))throw new Error("The Clash Display download changed. Review the foundry file before updating the checksum.");
}
for(const target of targets){await mkdir(resolve(target,".."),{recursive:true});await writeFile(target,font);}
console.log("Clash Display is ready for local hosting.");
