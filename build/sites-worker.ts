import handler from 'vinext/server/fetch-handler';
import {installationStatus,installationPage} from './installation.mjs';
export default {
 async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
  const path = new URL(request.url).pathname;
  const state=installationStatus(env);
  if(path==='/instalacao'||!state.ready){
   if(request.method!=='GET'&&request.method!=='HEAD')return Response.json({error:'Instalação incompleta.'},{status:503,headers:{'Cache-Control':'no-store'}});
   return new Response(request.method==='HEAD'?null:installationPage(state),{status:state.ready?200:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'no-referrer'}});
  }
  if (env.CLINICAL_INTAKE_ENABLED !== 'true' && request.method === 'POST' && ['/api/assessments','/api/patient-session'].includes(path)) {
   return Response.json({error:'Instalação em validação. O recebimento de anamneses ainda não foi liberado.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
  const response = await handler.fetch(request, env, ctx);
  const secured = new Response(response.body, response);
  secured.headers.set('Cache-Control','private, no-store');
  secured.headers.set('X-Content-Type-Options','nosniff');
  secured.headers.set('Referrer-Policy','no-referrer');
  secured.headers.set('X-Frame-Options','DENY');
  secured.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  return secured;
 }
};
