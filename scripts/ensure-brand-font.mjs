import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

// Obtain the unmodified font directly from its foundry. Do not redistribute it in Git.
const source="https://cdn.fontshare.com/wf/LHQJ5KSAL7VGAEIDSTEXCCOIUKFLT2I6/GW57XUEG4ZBVMLZZTQZTGYPROITRRQ5W/JA3IZUEMJ2J6WWT2OQVJOAWDXO3YL4YG.woff2";
const expected="49d3fbd2f1bcc9850d8d939cabf107d6ade508ce08419fca466b06879e4a0a8e";
const app=process.cwd();
const pkg=JSON.parse(await readFile(resolve(app,"package.json"),"utf8"));
if(!["fourthform-marketing","fourthform-client-portal"].includes(pkg.name))throw new Error("Run the font setup from a Fourthform app directory.");
const repo=resolve(app,"../..");
const targets=[resolve(repo,"apps/marketing/public/fonts/general-sans.woff2"),resolve(repo,"apps/marketing/public/portal-preview/fonts/general-sans.woff2"),resolve(repo,"apps/portal/public/fonts/general-sans.woff2")];
const valid=data=>createHash("sha256").update(data).digest("hex")===expected;
let font=await readFile(targets[0]).catch(()=>null);
if(!font||!valid(font)){
  const response=await fetch(source,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Fontshare returned ${response.status}. The brand font could not be prepared.`);
  font=Buffer.from(await response.arrayBuffer());
  if(!valid(font))throw new Error("The General Sans download changed. Review the foundry file before updating the checksum.");
}
for(const target of targets){await mkdir(resolve(target,".."),{recursive:true});await writeFile(target,font);}
console.log("General Sans is ready for local hosting.");
