'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Star } from 'lucide-react';

const links = [
 {label:'Inicio',href:'/'},
 {label:'Carta completa',href:'/carta'},
 {label:'Horarios',href:'/horarios'},
 {label:'Chupitos',href:'/carta/chupitos'},
 {label:'Cócteles',href:'/carta/cocteles'},
 {label:'Cervezas',href:'/carta/cervezas'},
 {label:'Cubatas',href:'/carta/cubatas'},
 {label:'Refrescos',href:'/carta/refrescos'},
 {label:'Vinos',href:'/carta/vinos'},
 {label:'Dónde estamos',href:'/#contacto'}
];
export default function PublicHeader() {
 const [open,setOpen]=useState(false);
 return <>
  <header className="site-header">
   <Link className="brand" href="/" onClick={()=>setOpen(false)} aria-label="Pub D2, volver al inicio">
    <Star size={23} strokeWidth={1.5} aria-hidden="true"/><span>PUB <strong>D2</strong></span>
   </Link>
   <button className="menu-button" type="button" aria-label={open?'Cerrar menú':'Abrir menú'} aria-expanded={open} aria-controls="navigation" onClick={()=>setOpen(!open)}>
    {open?<X size={28}/>:<Menu size={28}/>}
   </button>
  </header>
  {open && <div className="drawer-backdrop" onClick={()=>setOpen(false)} />}
  <nav id="navigation" aria-label="Menú principal" className={'drawer '+(open?'drawer-open':'')} inert={!open}>
   <span className="overline">EXPLORA D2</span>
   {links.map((link)=><Link key={link.href} href={link.href} onClick={()=>setOpen(false)}>{link.label}</Link>)}
   <small>San Fernando · Cádiz</small>
  </nav>
 </>;
}
