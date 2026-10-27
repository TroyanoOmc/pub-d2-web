import Link from 'next/link';
import { BookOpen, Clock3, MapPin, Star, ArrowDown, ChevronRight } from 'lucide-react';
import OpeningNow from '@/components/OpeningNow';
import CategoryTile from '@/components/CategoryTile';
import { categories } from '@/lib/site';
export default function Home() {
 return <main>
  <section className="hero" aria-labelledby="hero-title">
   <div className="hero-photo" />
   <div className="hero-shade" />
   <div className="hero-content content-width">
    <div className="hero-symbol" aria-hidden="true"><Star size={50} strokeWidth={1}/></div>
    <span className="overline">SAN FERNANDO · CÁDIZ</span>
    <h1 id="hero-title">PUB <em>D2</em></h1>
    <p>Rock, chupitos, cócteles y buen ambiente. Un pub con personalidad propia.</p>
    <div className="hero-actions">
      <Link className="button button-primary" href="/carta"><BookOpen size={20}/> VER CARTA</Link>
      <Link className="button button-outline" href="/horarios"><Clock3 size={20}/> VER HORARIOS</Link>
    </div>
    <OpeningNow compact/>
   </div>
   <a href="#categorias" className="scroll-hint" aria-label="Ir a las categorías"><ArrowDown size={24}/></a>
  </section>
  <section className="section categories-section" id="categorias">
   <div className="content-width">
    <span className="overline">DESCUBRE QUÉ TE APETECE</span>
    <h2>LA CARTA <span>DE D2</span></h2>
    <p className="section-intro">Elige una categoría y descubre sus bebidas. Sin complicaciones.</p>
    <div className="categories-grid">{categories.map(c=><CategoryTile key={c.slug} category={c}/>)}</div>
    <div className="center-actions"><Link href="/carta" className="button button-primary">CARTA COMPLETA <ChevronRight size={19}/></Link></div>
    <p className="photo-disclaimer">Imágenes ilustrativas de categoría pendientes de sustituir por fotografías autorizadas.</p>
   </div>
  </section>
  <section className="section identity-section">
    <div className="content-width identity-inner">
      <div className="identity-copy"><span className="overline">NUESTRA ESENCIA</span><h2>BUENA MÚSICA.<br/><span>BUEN AMBIENTE.</span></h2><p>Rock, juegos y noches para compartir. Acércate y conoce D2.</p><Link href="/horarios" className="text-link">Consulta cuándo abrimos <ChevronRight size={17}/></Link></div>
      <div className="identity-illustration" aria-label="Espacio reservado para fotografía real de la barra de madera"><span>FOTOGRAFÍA DEL LOCAL<br/><small>Pendiente de autorización</small></span></div>
    </div>
  </section>
  <section className="section contact-section" id="contacto">
   <div className="content-width contact-inner">
    <div><span className="overline">VEN A VERNOS</span><h2>TE ESPERAMOS <span>EN D2</span></h2><p>San Fernando, Cádiz</p></div>
    <div className="contact-actions"><Link href="/horarios" className="button button-primary"><Clock3 size={18}/> CONSULTAR HORARIOS</Link><a className="button button-outline" href="https://www.google.com/maps/search/?api=1&query=Pub+D2+San+Fernando+Cadiz" target="_blank" rel="noopener noreferrer"><MapPin size={18}/> BUSCAR EN MAPS</a></div>
   </div>
   <p className="content-width review-note"><Star size={16}/> El enlace directo para escribir una reseña en Google se activará tras verificar la ficha oficial del local.</p>
  </section>
 </main>;
}
