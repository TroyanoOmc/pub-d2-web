'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import CategoryTile from '@/components/CategoryTile';
import { categories, Product,formatMoney } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';

export default function Carta() {
 const [products,setProducts]=useState<Product[]>([]);
 const [connected,setConnected]=useState(false);
 useEffect(()=>{
  let active=true;
  async function load(){const db=getSupabase();if(!db)return;const {data,error}=await db.from('products').select('id,category,name,price,visible,rating_sum,rating_count').eq('visible',true).order('position');if(active&&!error&&data){setProducts(data as Product[]);setConnected(true);}}
  load();return()=>{active=false;};
 },[]);
 return <main>
   <section className="page-top"><div className="content-width"><span className="overline">PUB D2 · SAN FERNANDO</span><h1>NUESTRA CARTA</h1><p>Explora las categorías y descubre lo que más te apetece. Aquí no necesitas buscar: solo elegir.</p></div></section>
   <section className="section"><div className="content-width">
    <h2>ELIGE <span>QUÉ TOMAR</span></h2>
    <div className="categories-grid">{categories.map(c=><CategoryTile key={c.slug} category={c}/>)}</div>
    <div className="center-actions"><a href="#completa" className="button button-primary">VER CARTA COMPLETA <ChevronRight size={18}/></a></div>
   </div></section>
   <section className="section identity-section" id="completa"><div className="content-width">
    <span className="overline">TODAS LAS BEBIDAS</span><h2>CARTA <span>COMPLETA</span></h2>
    {!connected&&<p className="disclaimer">La carta oficial y sus precios aún no se han facilitado. Esta demostración no muestra productos inventados.</p>}
    {categories.map(c=><section key={c.slug} className="panel" id={c.slug} aria-labelledby={'heading-'+c.slug}>
      <h3 id={'heading-'+c.slug}>{c.name}</h3>
      <ul className="menu-list">{products.filter(p=>p.category===c.slug).map(p=><li key={p.id}>
       <div><strong>{p.name}</strong>{(c.slug==='chupitos'||c.slug==='cocteles')&&(p.rating_count??0)>0&&<div className="muted" style={{fontSize:'.77rem'}}><Star size={13} fill="currentColor" style={{display:'inline',color:'var(--gold)'}}/> {((p.rating_sum??0)/(p.rating_count??1)).toFixed(1).replace('.',',')} · {p.rating_count} valoraciones</div>}</div>
       <span className="price">{formatMoney(p.price)}</span>
      </li>)}</ul>
      {!products.some(p=>p.category===c.slug)&&<p className="empty-menu">Carta pendiente de completar.</p>}
      <Link href={'/carta/'+c.slug} className="text-link">Ver sección de {c.name.toLowerCase()} <ChevronRight size={17}/></Link>
    </section>)}
   </div></section>
 </main>;
}
