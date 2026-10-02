export const previewSpaces=[
 {id:'design',number:'01',title:'Shape the website',view:'review',copy:'Bring your ideas, follow the build and leave feedback on the working design.',features:['Direction','Build','Review'],label:'Design & feedback'},
 {id:'content',number:'02',title:'Make it your own',view:'pages',copy:'Edit a page, change an image or create content for a different moment.',features:['Pages','States'],label:'Content & States'},
 {id:'insight',number:'03',title:'Understand the audience',view:'analytics',copy:'Explore visitor patterns, search details and the connections behind the website.',features:['Analytics','Search','Connections'],label:'Audience & search'},
 {id:'launch',number:'04',title:'Bring it into the world',view:'launch',copy:'Try the final checks, explore your domain and see how the account fits together.',features:['Launch','Domains','Billing','Settings'],label:'Launch & account'},
] as const;
export function findSpace(id:unknown){return previewSpaces.find(space=>space.id===id);}
