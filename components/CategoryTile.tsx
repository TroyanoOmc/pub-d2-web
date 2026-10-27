import Link from 'next/link';
import type { Category } from '@/lib/site';
export default function CategoryTile({category}:{category:Category}) {
 return <Link className={'category-tile category-'+category.slug} href={'/carta/'+category.slug} aria-label={'Ver carta de '+category.name}>
   <span className="tile-photo" aria-hidden="true" style={{backgroundImage:`linear-gradient(150deg,transparent,rgba(10,9,8,.48)),url("${category.image}")`}} />
   <span className="tile-fallback" aria-hidden="true">{category.icon}</span>
   <span className="tile-copy"><strong>{category.name}</strong><small>VER CARTA ↗</small></span>
 </Link>;
}
