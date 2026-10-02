import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

// Obtain the unmodified font directly from its foundry. Do not redistribute it in Git.
const source="https://cdn.fontshare.com/wf/J2PZYZURCR7HNQKXCZ4VXYA3K5FFCCLT/PZSZLWHMBCE7FFGOUYDEU33FAESUMA3X/JFDL5FBAQ2WMYL3LGKSCZKAIFCS2UQ63.woff2";
const expected="8d5d1213c3913508dcf8b2c76c8c0a91a559529736fab33ad89a5c7030a1d8d9";
const app=process.cwd();
const pkg=JSON.parse(await readFile(resolve(app,"package.json"),"utf8"));
if(!["fourthform-marketing","fourthform-client-portal"].includes(pkg.name))throw new Error("Run the font setup from a Fourthform app directory.");
const targets=[resolve(app,"public/fonts/cabinet-grotesk.woff2")];
if(pkg.name==="fourthform-marketing")targets.push(resolve(app,"public/portal-preview/fonts/cabinet-grotesk.woff2"));
const valid=data=>createHash("sha256").update(data).digest("hex")===expected;
let font=await readFile(targets[0]).catch(()=>null);
if(!font||!valid(font)){
  const response=await fetch(source,{signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw new Error(`Fontshare returned ${response.status}. The brand font could not be prepared.`);
  font=Buffer.from(await response.arrayBuffer());
  if(!valid(font))throw new Error("The Cabinet Grotesk download changed. Review the foundry file before updating the checksum.");
}
for(const target of targets){await mkdir(resolve(target,".."),{recursive:true});await writeFile(target,font);}
console.log("Cabinet Grotesk is ready for local hosting.");
