import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function compile(path,imports){const module={exports:{}};const js=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:name=>{if(name in imports)return imports[name];if(name.startsWith('.')){const file=resolve(dirname(path),name);if(file.endsWith('.json'))return JSON.parse(readFileSync(file,'utf8'));for(const extension of ['.tsx','.ts'])if(existsSync(file+extension))return compile(file+extension,imports);}return require(name);},console,URL,URLSearchParams,process:{env:imports.__env||{}}});return module.exports;}
const site=compile('lib/preview/site.ts',{});
const navigation={'next/navigation':{usePathname:()=> '/',useRouter:()=>({push(){},prefetch(){}})}};
const home=compile('components/marketing/MarketingHome.tsx',{...navigation,'../../lib/preview/site':site,'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
const html=renderToStaticMarkup(React.createElement(home));
const pricing=compile('components/marketing/Pricing.tsx',{...navigation,'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
const offer=renderToStaticMarkup(React.createElement(pricing));
test('the homepage has one screen and three deliberate navigation destinations',()=>{
 assert.equal((html.match(/Skip to content/g)||[]).length,1);assert.match(html,/id="main-content" tabindex="-1"/);assert.equal((html.match(/<h1/g)||[]).length,1);
 assert.match(html,/href="\/work"/);assert.match(html,/href="\/how-we-work"/);assert.match(html,/href="\/pricing"/);assert.match(html,/href="\/preview\/start"/);assert.ok(!html.includes('<iframe'));
 assert.equal((html.match(/<details(?:>| )/g)||[]).length,0);assert.equal((html.match(/<section/g)||[]).length,1);assert.ok(!html.includes('A$1,500'));assert.ok(!html.includes('Previous'));
});
test('the offer explains scope, payment timing and optional packages',()=>{
 for(const copy of ['A$1,500','A$200 to start','A$1,300 when you approve','Up to 5 custom pages','3 revision rounds','A$199','A$39 / month','A$150'])assert.ok(offer.includes(copy),copy);
 assert.ok(!offer.includes('heatmaps'));assert.equal((offer.match(/<details(?:>| )/g)||[]).length,5);
});
test('mobile navigation starts closed and exposes consistent destinations',()=>{
 assert.match(html,/aria-controls="mk-mobile-menu" aria-expanded="false"/);assert.match(html,/id="mk-mobile-menu" hidden=""/);assert.match(html,/Client sign-in/);
});
test('connected customer funnel preserves valid reference and package parameters',()=>{
 const flow=compile('lib/customer-flow.ts',{__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'}});
 assert.equal(flow.startHref(),'/start');assert.equal(flow.startHref({reference:'monolith-hero',package:'first'}),'/start?reference=monolith-hero&package=first');
 const connected=compile('components/marketing/MarketingHome.tsx',{...navigation,__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'},'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
 const result=renderToStaticMarkup(React.createElement(connected));assert.match(result,/href="\/start"/);const connectedPricing=compile('components/marketing/Pricing.tsx',{...navigation,__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'},'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;assert.match(renderToStaticMarkup(React.createElement(connectedPricing)),/href="\/start\?package=first"/);
});
