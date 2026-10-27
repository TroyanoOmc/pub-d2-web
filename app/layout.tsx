import type { Metadata, Viewport } from 'next';
import './globals.css';
import PublicHeader from '@/components/PublicHeader';
export const metadata:Metadata={
 title:{default:'Pub D2 | San Fernando',template:'%s | Pub D2'},
 description:'Descubre la carta y consulta los horarios de Pub D2 en San Fernando, Cádiz. Vista previa no oficial.',
 robots:{index:false,follow:false},
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#1a1918'};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="es"><body><PublicHeader/>{children}<footer className="footer"><div className="content-width"><strong>PUB D2</strong><span>San Fernando · Cádiz</span><p>Vista previa comercial no oficial. Fotografías y carta pendientes de validación por el establecimiento.</p></div></footer></body></html>;
}
