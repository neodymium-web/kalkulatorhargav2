// Draft-only host routing model; this file is not imported by the application.
function draft(canonicalHost) {
  if (!['kalkulatorharga.com','www.kalkulatorharga.com'].includes(canonicalHost)) throw Error('Unknown host')
  return [{from:canonicalHost==='kalkulatorharga.com'?'www.kalkulatorharga.com':'kalkulatorharga.com',to:canonicalHost,status:301,approved:false}]
}
function trace(host,path,rules) {
  const seen=new Set(),hops=[]
  while(rules.some(r=>r.from===host)) {
    if(seen.has(host))throw Error('Host redirect loop')
    seen.add(host);const r=rules.find(r=>r.from===host);host=r.to;hops.push({host,path,status:r.status})
  }
  return hops
}
module.exports={draft,trace}
