import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {mkdir,writeFile} from 'node:fs/promises';
const suites=['release-check','concepts-and-spaces','preview-check','details-check','review-check','integration-check','audit-check','content-check','portfolio-check','motion-check','visual-tour'];
const results=[];
for(const suite of suites){
 console.log(`Running ${suite}`);
 const code=await new Promise(resolve=>{
  const child=spawn(process.execPath,[`tests/browser/${suite}.mjs`],{stdio:['ignore','pipe','inherit']});
  // Image evidence is uploaded as files. Keep diagnostic logs readable.
  const lines=createInterface({input:child.stdout});lines.on('line',line=>{if(!line.startsWith('FF_'))console.log(line);});
  child.once('error',error=>{console.error(error.message);resolve(1);});child.once('exit',code=>resolve(code??1));
 });
 results.push({suite,result:code===0?'pass':'fail',exitCode:code});
}
await mkdir('docs/preview-evidence',{recursive:true});await writeFile('docs/preview-evidence/browser-suite-results.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));if(results.some(result=>result.result==='fail'))process.exitCode=1;
