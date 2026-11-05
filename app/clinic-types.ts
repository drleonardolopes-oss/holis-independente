export type ClinicBrand={id:string,slug:string,name:string,primaryColor:string,logo:string,contact:string,legalName:string,taxId:string,address:string};
export const NOTICE_VERSION='2026-11-04-v2';
export function validColor(v:unknown):v is string{return typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)}
export function validLogo(v:unknown):v is string{return typeof v==='string'&&(v===''||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v))&&v.length<400000}
export function subscriptionActive(c:{plan:string,planUntil:string|null}){return c.plan==='active'||c.plan==='trial'&&!!c.planUntil&&c.planUntil>new Date().toISOString()}
export function patientOwns(ownerId:string,sessionId:string){return ownerId==='guest:'+sessionId}
