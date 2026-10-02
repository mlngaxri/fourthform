import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const originals=JSON.parse(readFileSync('lib/portfolio/original-assets.json','utf8'));
const projects=JSON.parse(readFileSync('lib/portfolio/selection.json','utf8'));
test('all portfolio images and titles match the restored original collection',()=>{
 assert.equal(originals.length,20);assert.equal(projects.length,20);assert.equal(new Set(projects.map(project=>project.id)).size,20);
 for(const original of originals){const project=projects.find(project=>project.id===original.id);assert.equal(project.title,original.title);assert.equal(project.width,original.width);assert.equal(project.height,original.height);assert.equal(createHash('sha256').update(readFileSync(`public/work/${original.id}.webp`)).digest('hex'),original.sha256);}
});
