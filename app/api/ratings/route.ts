import { NextRequest,NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, randomUUID } from 'node:crypto';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(!origin || origin!==request.nextUrl.origin){
  return NextResponse.json({error:'Solicitud no permitida.'},{status:403});
 }
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const secretKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const cookieSecret=process.env.RATING_COOKIE_SECRET;
 if(!url||!secretKey||!cookieSecret||cookieSecret.length<24){
  return NextResponse.json({error:'Las valoraciones aún no están disponibles.'},{status:503});
 }
 let body:unknown;
 try{body=await request.json();}catch{return NextResponse.json({error:'Datos inválidos.'},{status:400});}
 if(!body || typeof body!=='object')return NextResponse.json({error:'Datos inválidos.'},{status:400});
 const {product_id,stars}=body as {product_id?:unknown;stars?:unknown};
 if(typeof product_id!=='string'||!uuid.test(product_id)||(typeof stars!=='number'||!Number.isInteger(stars))||stars<1||Number(stars)>5){
  return NextResponse.json({error:'Selecciona una valoración válida de 1 a 5 estrellas.'},{status:400});
 }
 const db=createClient(url,secretKey,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data:product,error:productError}=await db.from('products').select('id,category,visible').eq('id',product_id).maybeSingle();
 if(productError||!product||!product.visible||!['chupitos','cocteles'].includes(product.category)){
  return NextResponse.json({error:'Esta bebida no admite valoraciones.'},{status:404});
 }
 const cookie=request.cookies.get('d2_visitor')?.value;
 const visitorId=(cookie && uuid.test(cookie))?cookie:randomUUID();
 const visitorHash=createHmac('sha256',cookieSecret).update(visitorId).digest('hex');
 const {data:old,error:readError}=await db.from('ratings').select('updated_at').eq('product_id',product_id).eq('visitor_hash',visitorHash).maybeSingle();
 if(readError)return NextResponse.json({error:'Error al consultar valoraciones.'},{status:500});
 if(old && Date.now()-new Date(old.updated_at).getTime()<15000){
  return NextResponse.json({error:'Ya has valorado esta bebida. Puedes cambiar tu voto en unos segundos.'},{status:429});
 }
 const {error}=await db.from('ratings').upsert({product_id,visitor_hash:visitorHash,stars,updated_at:new Date().toISOString()},{onConflict:'product_id,visitor_hash'});
 if(error)return NextResponse.json({error:'No se ha podido guardar la valoración.'},{status:500});
 const result=NextResponse.json({ok:true});
 result.cookies.set('d2_visitor',visitorId,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*365});
 return result;
}
