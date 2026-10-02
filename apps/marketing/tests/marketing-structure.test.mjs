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
test('marketing has one focusable skip target and seven native FAQ disclosures',()=>{assert.equal((html.match(/Skip to content/g)||[]).length,1);assert.match(html,/id="main-content" tabindex="-1"/);assert.equal((html.match(/<details>/g)||[]).length,7);assert.equal((html.match(/<summary>/g)||[]).length,7);});
test('marketing retains onboarding and same-origin embedded preview routes',()=>{assert.match(html,/href="\/preview\/start"/);assert.match(html,/href="\/preview\/start\?package=first"/);assert.match(html,/src="\/portal-preview\/index.html\?space=design&amp;view=review&amp;embed=1"/);assert.match(html,/A\$200/);assert.match(html,/A\$1,300/);});

test('marketing includes an accessible closed mobile navigation',()=>{assert.match(html,/aria-controls="mk-mobile-menu" aria-expanded="false"/);assert.match(html,/id="mk-mobile-menu" hidden=""/);assert.match(html,/href="#questions"/);});

test('the offer, audience, product terms and pricing are explained in rendered content',()=>{
 for(const copy of ['Custom websites for independent businesses','We design and build','A Direction is your input','Fourthform Site','Fourthform First','A$199','A$39 / month','A$150','content updates, basic analytics, search details and domain management','Direction','Build','Review','Launch'])assert.ok(html.includes(copy),copy);
 assert.match(html,/Example data/);assert.match(html,/design studies/);
 assert.equal((html.match(/data-preview-space=/g)||[]).length,4);
 assert.equal((html.match(/data-preview-task=/g)||[]).length,3);
 assert.ok(!html.includes('heatmaps'),'unrepresented capabilities are not sold as demonstrated features');
});

test('connected customer funnel preserves valid reference and package parameters',()=>{
 const flow=compile('lib/customer-flow.ts',{__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'}});
 assert.equal(flow.startHref(),'/start');
 assert.equal(flow.startHref({reference:'monolith-hero',package:'first'}),'/start?reference=monolith-hero&package=first');
 const connected=compile('components/marketing/MarketingHome.tsx',{__env:{NEXT_PUBLIC_CONNECTED_PORTAL:'true'},'../../lib/preview/site':site,'next/link':{default:({children,...props})=>React.createElement('a',props,children),__esModule:true}}).default;
 const result=renderToStaticMarkup(React.createElement(connected));
 assert.match(result,/href="\/start"/);assert.match(result,/href="\/start\?package=first"/);assert.match(result,/Create your account, save your brief/);assert.match(result,/Sending, payments and launch are simulated/);
});
