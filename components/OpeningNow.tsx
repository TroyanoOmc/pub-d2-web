'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { getOpeningStatus } from '@/lib/schedule';
import { weeklySchedule, DaySchedule, ScheduleException } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';
export default function OpeningNow({compact=false}:{compact?:boolean}) {
 const [status,setStatus]=useState<ReturnType<typeof getOpeningStatus>|null>(null);
 useEffect(()=>{
  let active=true;
  let weekly:DaySchedule[]=weeklySchedule, exceptions:ScheduleException[]=[];
  const update=()=>{if(active)setStatus(getOpeningStatus(new Date(),weekly,exceptions));};
  update();
  async function load(){
    const db=getSupabase();
    if(!db)return;
    const [w,e]=await Promise.all([db.from('weekly_schedule').select('weekday,open,opens,closes'), db.from('schedule_exceptions').select('date,kind,opens,closes,note')]);
    if(!active)return;
    if(!w.error && w.data?.length===7) weekly=w.data as DaySchedule[];
    if(!e.error && e.data) exceptions=e.data as ScheduleException[];
    update();
  }
  load();
  const ticker=setInterval(update,60000);
  return ()=>{active=false;clearInterval(ticker);};
 },[]);
 return <Link href="/horarios" className={'open-status '+(compact?'status-compact':'')}>
  <Clock3 size={18} aria-hidden="true"/>
  <span className={'status-dot '+(status?.isOpen?'status-open':'')}/>
  <span><strong>{status?.headline??'Consultar horario'}</strong>{!compact&&<small>{status?.nextText??'Consulta los horarios habituales'}</small>}</span>
 </Link>;
}
