const fs=require('node:fs')
exports.readCsv=path=>{
 const input=fs.readFileSync(path,'utf8'),rows=[];let row=[],field='',quoted=false
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}else field+=c}
 if(quoted)throw Error('Unclosed CSV field');if(field||row.length){row.push(field);rows.push(row)}const [header,...body]=rows;return body.filter(r=>r.some(Boolean)).map(r=>{if(r.length!==header.length)throw Error('CSV column count mismatch');return Object.fromEntries(header.map((h,i)=>[h,r[i]]))})
}
