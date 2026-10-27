import { DaySchedule, ScheduleException, weeklySchedule, weekdayNames } from './site';

export type OpeningStatus = { isOpen: boolean; todayText: string; headline: string; nextText: string };
function madridParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const get = (type:string) => Number(parts.find(p=>p.type===type)?.value ?? 0);
  return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour'),minute:get('minute')};
}
const two=(n:number)=>String(n).padStart(2,'0');
const offsetDate=(iso:string, delta:number)=> { const [y,m,d]=iso.split('-').map(Number); const x=new Date(Date.UTC(y,m-1,d+delta)); return x.toISOString().slice(0,10); };
const dayOf=(iso:string)=> { const [y,m,d]=iso.split('-').map(Number); return new Date(Date.UTC(y,m-1,d)).getUTCDay(); };
const mins=(h:string)=> {const [hh,mm]=h.split(':').map(Number);return hh*60+mm;};
function getHours(date:string,weekly:DaySchedule[], exceptions:ScheduleException[]) {
  const exception=exceptions.find(e=>e.date===date);
  if(exception?.kind==='closed') return null;
  if(exception?.kind==='special') return exception.opens && exception.closes?{opens:exception.opens,closes:exception.closes}:null;
  const weekday=weekly.find(w=>w.weekday===dayOf(date));
  return weekday?.open && weekday.opens && weekday.closes?{opens:weekday.opens,closes:weekday.closes}:null;
}
export function getOpeningStatus(now:Date=new Date(),weekly:DaySchedule[]=weeklySchedule,exceptions:ScheduleException[]=[]):OpeningStatus {
  const p=madridParts(now), date=`${p.year}-${two(p.month)}-${two(p.day)}`, t=p.hour*60+p.minute;
  const current=getHours(date,weekly,exceptions), prior=getHours(offsetDate(date,-1),weekly,exceptions);
  const inHours=(h:{opens:string;closes:string},previous=false)=>{
    const a=mins(h.opens), b=mins(h.closes), overnight=b<=a;
    return previous ? overnight && t<b : (overnight?t>=a:(t>=a&&t<b));
  };
  const open=!!(current&&inHours(current))||!!(prior&&inHours(prior,true));
  const todayText=current?`${current.opens} – ${current.closes}`:'Cerrado';
  let nextText='Próxima apertura sin confirmar';
  if(open) nextText='Estamos abiertos ahora';
  else for(let step=0;step<15;step++) {
    const d=offsetDate(date,step), h=getHours(d,weekly,exceptions);
    if(h&&(step!==0 || t<mins(h.opens))) {const wd=weekdayNames[dayOf(d)];nextText=`${step===0?'Hoy':step===1?'Mañana':wd} a las ${h.opens}`;break;}
  }
  return {isOpen:open,todayText,headline:open?'Abierto ahora':'Cerrado ahora',nextText};
}
