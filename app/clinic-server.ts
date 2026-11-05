import {cookies} from 'next/headers';
import {getDb} from '@/db';
import {clinics,members,assessments,submissions,patientSessions,auditEvents} from '@/db/schema';
import {eq,and,isNull} from 'drizzle-orm';
import {getChatGPTUser} from './chatgpt-auth';
import {ClinicBrand} from './clinic-types';import {PLATFORM_OWNER} from './installation-config';
export async function ensureInstallation(){
 if(!PLATFORM_OWNER)throw new Error('Responsável da instalação não configurado.');
 const db=getDb();await db.insert(clinics).values({id:'minha-clinica',slug:'minha-clinica',name:'Minha clínica',ownerEmail:PLATFORM_OWNER,contact:PLATFORM_OWNER,legalName:'',plan:'active',created:new Date().toISOString()}).onConflictDoNothing();
 await db.insert(members).values({id:'installation-owner',clinicId:'minha-clinica',email:PLATFORM_OWNER,role:'owner'}).onConflictDoNothing();
}
export function brand(c:typeof clinics.$inferSelect):ClinicBrand{return {id:c.id,slug:c.slug,name:c.name,primaryColor:c.primaryColor,logo:c.logo,contact:c.contact,legalName:c.legalName,taxId:c.taxId,address:c.address}}
export async function findClinic(slug:string){return getDb().select().from(clinics).where(eq(clinics.slug,slug)).get()}
export async function staffContext(slug?:string){const u=await getChatGPTUser();if(!u)return null;const email=u.email.toLowerCase();if(email===PLATFORM_OWNER)await ensureInstallation();const grants=await getDb().select().from(members).where(eq(members.email,email));let clinic:typeof clinics.$inferSelect|undefined;if(slug){clinic=await findClinic(slug)}else if(grants[0])clinic=await getDb().select().from(clinics).where(eq(clinics.id,grants[0].clinicId)).get();const grant=grants.find(m=>m.clinicId===clinic?.id);return clinic&&grant?{user:u,clinic,role:grant.role}:null;}
export async function hashToken(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function patientContext(slug:string){const c=await findClinic(slug);if(!c)return null;const token=(await cookies()).get('holis-patient-'+c.id)?.value;if(!token||!/^\w{64}$/.test(token))return null;const id=await hashToken(token);const session=await getDb().select().from(patientSessions).where(and(eq(patientSessions.id,id),eq(patientSessions.clinicId,c.id))).get();return session&&session.expires>new Date().toISOString()?{clinic:c,session}:null}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}
export async function audit(clinicId:string,actor:string,action:string,recordId?:string){await getDb().insert(auditEvents).values({id:crypto.randomUUID(),clinicId,actor,action,recordId,created:new Date().toISOString()})}
export async function rateLimit(key:string,max:number){const {requestLimits}=await import('@/db/schema');const {sql,lt}=await import('drizzle-orm');const minute=Math.floor(Date.now()/60000);const id=key+':'+minute;const db=getDb();await db.delete(requestLimits).where(lt(requestLimits.expires,new Date().toISOString()));const row=await db.insert(requestLimits).values({id,count:1,expires:new Date(Date.now()+120000).toISOString()}).onConflictDoUpdate({target:requestLimits.id,set:{count:sql`${requestLimits.count}+1`}}).returning().get();return row.count<=max}
