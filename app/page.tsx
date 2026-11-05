import App from './ui';import {requireChatGPTUser} from './chatgpt-auth';import {staffContext,brand} from './clinic-server';import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{clinic?:string}>}){const {clinic}=await searchParams;await requireChatGPTUser('/'+(clinic?'?clinic='+encodeURIComponent(clinic):''));const c=await staffContext(clinic);if(!c)redirect('/clinicas');return <App clinician clinic={brand(c.clinic)}/>}
