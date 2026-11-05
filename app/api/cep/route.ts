export async function GET(request:Request){
 const cep=new URL(request.url).searchParams.get('cep')||'';
 if(!/^\d{8}$/.test(cep))return Response.json({error:'CEP inválido'},{status:400});
 try{const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const data=await response.json();return Response.json(data)}catch{return Response.json({error:'Busca indisponível'},{status:502})}
}
