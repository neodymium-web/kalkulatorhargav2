// Review-only fixture; this module is never imported by Next or Vercel routing.
exports.validate= (rules,targets)=>{
 const source=new Set()
 for(const r of rules){if(!r.source.startsWith('/')||r.source.startsWith('//')||r.source.includes('?')||source.has(r.source))throw Error('Invalid or duplicate source');source.add(r.source)}
 for(const r of rules){if(r.status!==301||!targets.has(r.destination)||source.has(r.destination)||r.source===r.destination)throw Error('Only one-hop 301 to existing target is allowed')}
 return rules
}
