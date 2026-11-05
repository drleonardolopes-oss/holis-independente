import assert from 'node:assert/strict';
import {verifyAccess} from '../auth/access.mjs';
const pair=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',pair.publicKey);jwk.kid='key';
const cfg={issuer:'https://holis-test.cloudflareaccess.com',audience:'test'};
const now=Date.now()/1000,base={iss:cfg.issuer,aud:['test'],type:'app',sub:'user',email:'doc@example.test',iat:now,exp:now+60};
const enc=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
async function sign(c,h={alg:'RS256',kid:'key'}){const b=enc(h)+'.'+enc(c);return b+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(b))).toString('base64url');}
const fetcher=async()=>Response.json({keys:[jwk]});
assert.equal((await verifyAccess(await sign(base),cfg,fetcher)).email,base.email);
for(const change of [{exp:now-1},{aud:['wrong']},{iss:'https://evil.test'},{iat:now+1000},{nbf:now+1000},{email:undefined},{sub:''},{type:'service'}])assert.equal(await verifyAccess(await sign({...base,...change}),cfg,fetcher),null);
assert.equal(await verifyAccess(await sign(base,{alg:'none',kid:'key'}),cfg,fetcher),null);
const token=await sign(base),parts=token.split('.');parts[1]=enc({...base,email:'attacker@example.test'});assert.equal(await verifyAccess(parts.join('.'),cfg,fetcher),null);
assert.equal(await verifyAccess(token,{...cfg,issuer:'https://evil.test'},fetcher),null);
assert.equal(await verifyAccess(null,cfg,fetcher),null);
console.log('PASS: assinatura, expiração, emissor, audiência, algoritmo, identidade e adulteração de JWT.');
