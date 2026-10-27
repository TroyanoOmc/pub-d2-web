'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft,CalendarDays,Clock3 } from 'lucide-react';
import { getOpeningStatus } from '@/lib/schedule';
import { weeklySchedule,weekdayNames,DaySchedule,ScheduleException } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';
export default function Horarios() {
 const [weekly,setWeekly]=useState<DaySchedule[]>(weeklySchedule);
 const [exceptions,setExceptions]=useState<ScheduleException[]>([]);
 const [status,setStatus]=useState<ReturnType<typeof getOpeningStatus>|null>(null);
 useEffect(()=>{
   let active=true;let w=weeklySchedule,e:ScheduleException[]=[];
   const update=()=>{if(active){setWeekly(w);setExceptions(e);setStatus(getOpeningStatus(new Date(),w,e));}};
   update();const db=getSupabase();
   if(db)Promise.all([db.from('weekly_schedule').select('weekday,open,opens,closes'),db.from('schedule_exceptions').select('date,kind,opens,closes,note')])
    .then(([wr,er])=>{if(wr.data?.length===7)w=wr.data as DaySchedule[];if(er.data)e=er.data as ScheduleException[];update();});
   const i=setInterval(update,60000);return()=>{active=false;clearInterval(i);};
 },[]);
 const fmt=(d:DaySchedule)=>d.open?`${d.opens} – ${d.closes}`:'Cerrado';
 const upcoming=exceptions.filter(x=>x.date>=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8);
 return <main>
  <section className="page-top"><div className="content-width"><Link className="back-link" href="/"><ArrowLeft size={16}/> Volver al inicio</Link><div className="overline" style={{marginTop:24}}>CONSULTA NUESTRA APERTURA</div><h1>HORARIOS</h1><p>Consulta nuestro horario habitual y posibles cambios especiales antes de venir.</p></div></section>
  <section className="section"><div className="content-width" style={{maxWidth:820}}>
   <div className="panel"><div className="current-hours"><Clock3 size={27} color="var(--gold)"/><div><span className="overline">ESTADO DEL LOCAL</span><h3 style={{margin:'6px 0'}}>{status?.headline??'Consultando horario...'}</h3><p style={{margin:0}}>{status?.nextText}</p></div></div><p className="muted" style={{fontSize:'.83rem',marginBottom:0}}>El estado es orientativo según los horarios publicados por el establecimiento.</p></div>
   <div className="panel"><h3>HORARIO HABITUAL</h3><table className="schedule-table"><tbody>{weekly.map(day=><tr key={day.weekday}><td>{weekdayNames[day.weekday]}</td><td>{fmt(day)}</td></tr>)}</tbody></table><p className="muted" style={{fontSize:'.77rem',marginTop:16,marginBottom:0}}>Los cierres de las 03:00 y 04:00 son en la madrugada del día siguiente. El lunes hasta las 03:00 puede seguir abierto por el turno del domingo.</p></div>
   {upcoming.length>0&&<div className="panel"><h3><CalendarDays size={22} style={{display:'inline'}}/> CAMBIOS ESPECIALES</h3><ul className="menu-list">{upcoming.map(item=><li key={item.date}><div><strong>{new Date(item.date+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'})}</strong>{item.note&&<div className="muted">{item.note}</div>}</div><span className="price">{item.kind==='closed'?'Cerrado':item.opens+' – '+item.closes}</span></li>)}</ul></div>}
   <Link className="button button-outline" href="/carta">VER CARTA</Link>
  </div></section>
 </main>;
}
