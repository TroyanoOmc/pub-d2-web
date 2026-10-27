export type Category = { slug: string; name: string; icon: string; image: string; intro: string };
export type Product = { id: string; category: string; name: string; price: number; visible: boolean; rating_sum?: number; rating_count?: number };
export type DaySchedule = { weekday: number; opens: string | null; closes: string | null; open: boolean };
export type ScheduleException = { date: string; kind: 'closed' | 'special'; opens: string | null; closes: string | null; note?: string | null };

export const categories: Category[] = [
  { slug: 'chupitos', name: 'Chupitos', icon: '🥃', image: '/categorias/chupitos.jpg', intro: 'Descubre nuestros chupitos' },
  { slug: 'cocteles', name: 'Cócteles', icon: '🍹', image: '/categorias/cocteles.jpg', intro: 'Cócteles para cada ocasión' },
  { slug: 'cervezas', name: 'Cervezas', icon: '🍺', image: '/categorias/cervezas.jpg', intro: 'Encuentra tu cerveza' },
  { slug: 'cubatas', name: 'Cubatas', icon: '🥤', image: '/categorias/cubatas.jpg', intro: 'Clásicos para la noche' },
  { slug: 'refrescos', name: 'Refrescos', icon: '🧊', image: '/categorias/refrescos.jpg', intro: 'Algo para refrescarse' },
  { slug: 'vinos', name: 'Vinos', icon: '🍷', image: '/categorias/vinos.jpg', intro: 'Nuestra selección de vinos' },
];

export const weeklySchedule: DaySchedule[] = [
  { weekday: 1, open: false, opens: null, closes: null },
  { weekday: 2, open: false, opens: null, closes: null },
  { weekday: 3, open: false, opens: null, closes: null },
  { weekday: 4, open: true, opens: '21:30', closes: '03:00' },
  { weekday: 5, open: true, opens: '21:30', closes: '04:00' },
  { weekday: 6, open: true, opens: '21:30', closes: '04:00' },
  { weekday: 0, open: true, opens: '21:30', closes: '03:00' },
];
export const weekdayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export const formatMoney = (n: number) => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR'}).format(n);
export const getCategory = (slug: string) => categories.find(c => c.slug === slug);
