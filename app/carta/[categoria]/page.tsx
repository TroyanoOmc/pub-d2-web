'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft,Star } from 'lucide-react';
import { categories, getCategory,Product,formatMoney } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';

export default function Categoria() {
 const params=useParams<{categoria:string}>();
 const category=getCategory(params.categoria);
 const [products,setProducts]=useState<Product[]>([]);
 const [loaded,setLoaded]=useState(false);
 const [sending,setSending]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 useEffect(()=>{
  let live=true; const db=getSupabase();
  if(!db){setLoaded(true);return;}
  db.from('products').select('id,category,name,price,visible,rating_sum,rating_count').eq('category',params.categoria).eq('visible',true).order('position')
   .then(({data})=>{if(live){setProducts((data||[]) as Product[]);setLoaded(true);}});
  return()=>{live=false;};
 },[params.categoria]);
 async function vote(p:Product,stars:number){
  setSending(p.id);setMessage('');
  try {
   const res=await fetch('/api/ratings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_id:p.id,stars})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||'No ha sido posible guardar tu valoración.');
   const db=getSupabase();
   const result=await db?.from('products').select('id,category,name,price,visible,rating_sum,rating_count').eq('category',params.categoria).eq('visible',true).order('position');
   if(result?.data)setProducts(result.data as Product[]);
   setMessage('Gracias, tu valoración se ha guardado.');
  }catch(err){setMessage(err instanceof Error?err.message:'Error al guardar tu valoración.');}
  finally{setSending(null);}
 }
 if(!category)return <main className="admin-wrap"><h1>Categoría no encontrada</h1><Link href="/carta" className="back-link">Volver a la carta</Link></main>;
 const canRate=category.slug==='chupitos'||category.slug==='cocteles';
 return <main>
 <section className="page-top"><div className="content-width"><Link href="/carta" className="back-link"><ArrowLeft size={16}/> Volver a la carta</Link><div className="overline" style={{marginTop:24}}>PUB D2 · NUESTRA CARTA</div><h1>{category.name}</h1><p>{category.intro}</p></div></section>
 <section className="section"><div className="content-width">
  {!loaded&&<p>Preparando la carta…</p>}
  {loaded&&products.length===0&&<div className="panel"><p className="empty-menu">Todavía no se ha introducido la carta oficial de {category.name.toLowerCase()}. Consulta las demás categorías.</p></div>}
  {message&&<div className="notice" role="status">{message}</div>}
  <ul className="menu-list">{products.map(p=><li key={p.id}>
    <div><strong>{p.name}</strong>
      {canRate&&<div style={{marginTop:8}}>
       <div className="muted" style={{fontSize:'.77rem',marginBottom:5}}>{p.rating_count?((p.rating_sum??0)/p.rating_count).toFixed(1).replace('.',',')+' / 5 · '+p.rating_count+' votos':'Sin valoraciones todavía'}</div>
       <div className="inline-label" aria-label={'Valorar '+p.name} style={{gap:3}}>
        {[1,2,3,4,5].map(n=><button key={n} type="button" disabled={sending===p.id||!getSupabase()} aria-label={n+' estrellas para '+p.name} className="rating-button" onClick={()=>vote(p,n)}><Star size={20}/></button>)}
       </div>
      </div>}
    </div>
    <span className="price">{formatMoney(p.price)}</span>
  </li>)}</ul>
  {canRate&&<p className="photo-disclaimer" style={{textAlign:'left'}}>Puedes valorar cada bebida del 1 al 5 sin registrarte. Los votos se guardan al conectar el servicio. Una nueva valoración desde el mismo navegador sustituye la anterior.</p>}
  <div className="admin-actions">{categories.filter(c=>c.slug!==category.slug).map(c=><Link className="small-button" key={c.slug} href={'/carta/'+c.slug}>{c.name}</Link>)}</div>
 </div></section>
 </main>;
}
