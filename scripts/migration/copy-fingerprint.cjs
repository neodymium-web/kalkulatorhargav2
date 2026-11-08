const ts=require('typescript'),crypto=require('node:crypto')
exports.fingerprint=source=>{
 const sf=ts.createSourceFile('copy.ts',source,ts.ScriptTarget.Latest,true),edits=[]
 function visit(n){if(ts.isStringLiteral(n))edits.push({start:n.getStart(sf),end:n.end,value:JSON.stringify(n.text.replace(/\s/g,''))});ts.forEachChild(n,visit)}visit(sf)
 for(const e of edits.reverse())source=source.slice(0,e.start)+e.value+source.slice(e.end)
 const scan=ts.createScanner(ts.ScriptTarget.Latest,true,ts.LanguageVariant.Standard,source),tokens=[]
 while(true){const kind=scan.scan();if(kind===ts.SyntaxKind.EndOfFileToken)break;tokens.push([kind,kind===ts.SyntaxKind.StringLiteral?scan.getTokenValue().replace(/\s/g,''):scan.getTokenText()])}
 return crypto.createHash('sha256').update(JSON.stringify(tokens)).digest('hex')
}
