import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes,pbkdf2Sync,createCipheriv} from 'node:crypto';

const password=process.env.LIBRARY_PASSWORD;
if(!password)throw new Error('LIBRARY_PASSWORD secret is required; refusing to publish an unlocked library.');
const result=await build({entryPoints:['src/library.js'],bundle:true,format:'iife',minify:true,write:false,outfile:'library.js'});
const html=await readFile('library.html','utf8');
const body=html.match(/<body>([\s\S]*?)<\/body>/i)[1].replace(/<script[\s\S]*?<\/script>/gi,'');
const payload=JSON.stringify({body,js:result.outputFiles.find(f=>f.path.endsWith('.js')).text,css:result.outputFiles.find(f=>f.path.endsWith('.css')).text});
const salt=randomBytes(16),iv=randomBytes(12),iterations=600000;
const key=pbkdf2Sync(password,salt,iterations,32,'sha256'),cipher=createCipheriv('aes-256-gcm',key,iv);
const ciphertext=Buffer.concat([cipher.update(payload,'utf8'),cipher.final(),cipher.getAuthTag()]);
await writeFile('dist/library.enc.json',JSON.stringify({salt:salt.toString('base64'),iv:iv.toString('base64'),iterations,ciphertext:ciphertext.toString('base64')}));
await writeFile('dist/library.html',await readFile('scripts/library-gate.html','utf8'));
console.log('Product library encrypted; public navigation remains available.');
