import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function compile(path,imports){const module={exports:{}};const js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:name=>{if(name in imports)return imports[name];if(name.startsWith('.')){const file=resolve(dirname(path),name);if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));for(const extension of ['.tsx','.ts'])if(existsSync(file+extension))return compile(file+extension,imports);}return require(name);},console,URL,URLSearchParams,process:{env:imports.__env||{}}});return module.exports;}
const site=compile('lib/preview/site.ts',{});
const home=compile('components/marketing/MarketingHome.tsx',{'../../lib/preview/site':site,'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
const html=renderToStaticMarkup(React.createElement(home));
test('the homepage stays focused, with one heading, direct routes and useful disclosures',()=>{
 assert.equal((html.match(/Skip to content/g)||[]).length,1);assert.match(html,/id="main-content" tabindex="-1"/);assert.equal((html.match(/<h1/g)||[]).length,1);
 assert.match(html,/href="\/work"/);assert.match(html,/href="\/preview"/);assert.match(html,/href="\/preview\/start"/);assert.ok(!html.includes('<iframe'));
 assert.equal((html.match(/<details(?:>| )/g)||[]).length,5);
});
test('the offer explains scope, payment timing and optional packages',()=>{
 for(const copy of ['Custom websites for independent businesses','We design and build','A$1,500','A$200 to start','A$1,300 when you approve','Up to 5 custom pages','3 revision rounds','A$199','A$39 / month','A$150'])assert.ok(html.includes(copy),copy);
 assert.match(html,/No account or payment needed/);assert.ok(!html.includes('heatmaps'));
});
test('mobile navigation starts closed and exposes consistent destinations',()=>{
 assert.match(html,/aria-controls="mk-mobile-menu" aria-expanded="false"/);assert.match(html,/id="mk-mobile-menu" hidden=""/);assert.match(html,/Client sign-in/);
});
test('connected customer funnel preserves valid reference and package parameters',()=>{
 const flow=compile('lib/customer-flow.ts',{__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'}});
 assert.equal(flow.startHref(),'/start');assert.equal(flow.startHref({reference:'monolith-hero',package:'first'}),'/start?reference=monolith-hero&package=first');
 const connected=compile('components/marketing/MarketingHome.tsx',{__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'},'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
 const result=renderToStaticMarkup(React.createElement(connected));assert.match(result,/href="\/start"/);assert.match(result,/href="\/start\?package=first"/);assert.match(result,/Save your brief and start when you are ready/);
});
