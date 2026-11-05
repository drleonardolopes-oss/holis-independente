import {notFound} from 'next/navigation';import {findClinic,brand,ensureInstallation} from '../../clinic-server';import PatientEntry from '../../patient-entry';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(slug==='minha-clinica')await ensureInstallation();const c=await findClinic(slug);if(!c)notFound();return <PatientEntry clinic={brand(c)}/>}
