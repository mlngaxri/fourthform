import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve} from "node:path";

// OFL-licensed Google Fonts have checked local masters. Builds need no font CDN.
const fonts=[
 {name:"schibsted-grotesk",checksum:"4c8b93f431d462c696e12b9d6a033feb3394d36e66e781357c496b95d8a75e05"},
 {name:"archivo",checksum:"e3a28eade21a900c7155a247757f4b2834c07bb7ef07ad7efa55cebaac1e8f5e"},
];
const app=process.cwd();
const pkg=JSON.parse(await readFile(resolve(app,"package.json"),"utf8"));
if(!["fourthform-marketing","fourthform-client-portal"].includes(pkg.name))throw new Error("Run the font setup from a Fourthform app directory.");
const repo=resolve(app,"../..");
const destinations=["apps/marketing/public/fonts","apps/marketing/public/portal-preview/fonts","apps/portal/public/fonts"];
for(const font of fonts){
 const data=await readFile(resolve(repo,`shared/fonts/${font.name}.woff2`));
 if(createHash("sha256").update(data).digest("hex")!==font.checksum)throw new Error(`Review the changed ${font.name} font before updating its checksum.`);
 const license=await readFile(resolve(repo,`shared/fonts/${font.name}-LICENSE.txt`));
 for(const destination of destinations){
  await mkdir(resolve(repo,destination),{recursive:true});
  await writeFile(resolve(repo,destination,`${font.name}.woff2`),data);
  await writeFile(resolve(repo,destination,`${font.name}-LICENSE.txt`),license);
 }
}
console.log("Fourthform fonts are ready for local hosting.");
