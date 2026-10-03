export const previewSpaces=[
 {id:'design',number:'01',title:'Review the design',view:'review',copy:'Follow the build and leave feedback beside the page you want to change.',features:['Brief','Build','Review'],label:'Design & feedback'},
 {id:'content',number:'02',title:'Update your content',view:'pages',copy:'Change words and images, then try scheduling different content for later.',features:['Pages','Scheduled content'],label:'Content updates'},
 {id:'insight',number:'03',title:'See how visitors use it',view:'analytics',copy:'Explore sample traffic, search information and website connections.',features:['Analytics','Search','Connections'],label:'Visitors & search'},
 {id:'launch',number:'04',title:'Prepare for launch',view:'launch',copy:'Try the launch checks, domain setup and billing with example data.',features:['Launch','Domains','Billing','Settings'],label:'Launch & account'},
] as const;
export function findSpace(id:unknown){return previewSpaces.find(space=>space.id===id);}
