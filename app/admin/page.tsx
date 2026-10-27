'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole,Plus,Clock3,BookOpen,Image as ImageIcon,LogOut,CheckCircle2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { categories,weekdayNames,weeklySchedule,DaySchedule,ScheduleException,Product,formatMoney } from '@/lib/site';
type AdminState='checking'|'setup'|'login'|'denied'|'ready';
const initialDate=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export default function Admin(){
 const router=useRouter();
 const [access,setAccess]=useState<AdminState>('checking');
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [section,setSection]=useState<'horarios'|'carta'|'fotos'>('horarios');
 const [weekly,setWeekly]=useState<DaySchedule[]>(weeklySchedule);
 const [exceptions,setExceptions]=useState<ScheduleException[]>([]);
 const [products,setProducts]=useState<Product[]>([]);
 const [cat,setCat]=useState('chupitos');
 const [date,setDate]=useState(initialDate());
 const [action,setAction]=useState<'normal'|'closed'|'special'>('closed');
 const [opening,setOpening]=useState('21:30'),[closing,setClosing]=useState('03:00');
 const [editing,setEditing]=useState<string|null>(null);
 const [name,setName]=useState(''),[price,setPrice]=useState('');
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const db=getSupabase();
 async function load(){
  const client=getSupabase();if(!client)return;
  const [w,e,p]=await Promise.all([
   client.from('weekly_schedule').select('weekday,open,opens,closes'),
   client.from('schedule_exceptions').select('date,kind,opens,closes,note').order('date'),
   client.from('products').select('id,category,name,price,visible,rating_sum,rating_count,position').order('position')
  ]);
  if(w.data?.length===7)setWeekly(w.data as DaySchedule[]);
  if(e.data)setExceptions(e.data as ScheduleException[]);
  if(p.data)setProducts(p.data as Product[]);
 }
 useEffect(()=>{
  let active=true;
  async function check(){
   const client=getSupabase();
   if(!client){if(active)setAccess('setup');return;}
   const {data:{user}}=await client.auth.getUser();
   if(!user){if(active)setAccess('login');return;}
   const {data,error}=await client.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
   if(!active)return;
   if(error||!data){setAccess('denied');return;}
   setAccess('ready');await load();
  }
  check();return()=>{active=false;};
 },[]);
 async function login(ev:React.FormEvent){
  ev.preventDefault();if(!db)return;setBusy(true);setNotice('');
  const {data,error}=await db.auth.signInWithPassword({email,password});
  if(error){setNotice(error.message);setBusy(false);return;}
  const {data:membership}=await db.from('admin_users').select('user_id').eq('user_id',data.user.id).maybeSingle();
  if(!membership){setAccess('denied');setNotice('Esta cuenta no tiene permiso de administración.');}
  else {setAccess('ready');await load();}
  setBusy(false);setPassword('');
 }
 const ok=(message:string)=>setNotice(message);
 const fail=(e:unknown)=>setNotice(e instanceof Error?e.message:String(e));
 async function saveWeekly(){
  if(!db)return;setBusy(true);
  const {error}=await db.from('weekly_schedule').upsert(weekly);
  if(error)fail(error.message);else ok('Horario semanal guardado correctamente.');
  setBusy(false);router.refresh();
 }
 async function saveException(){
  if(!db)return;setBusy(true);
  try {
   if(action==='normal') {
    const {error}=await db.from('schedule_exceptions').delete().eq('date',date);
    if(error)throw error;
    ok('Se aplicará el horario habitual en esa fecha.');
   } else {
    if(action==='special'&&opening===closing)throw new Error('La hora de apertura y la de cierre no pueden ser iguales.');
    const {error}=await db.from('schedule_exceptions').upsert({date,kind:action,opens:action==='special'?opening:null,closes:action==='special'?closing:null});
    if(error)throw error;
    ok(action==='closed'?'Cierre excepcional guardado.':'Horario especial guardado.');
   }
   await load();
  } catch(e){fail(e);}
  setBusy(false);
 }
 async function removeException(day:string){
  if(!db)return;setBusy(true);
  const {error}=await db.from('schedule_exceptions').delete().eq('date',day);
  if(error)fail(error.message);else {ok('Cambio especial eliminado.');await load();}
  setBusy(false);
 }
 async function saveProduct(ev:React.FormEvent){
  ev.preventDefault();if(!db)return;
  const numeric=Number(price.replace(',','.'));
  if(!name.trim()||!Number.isFinite(numeric)||numeric<0){setNotice('Introduce un nombre y un precio válido.');return;}
  setBusy(true);
  const payload={name:name.trim(),price:Math.round(numeric*100)/100,category:cat};
  const {error}=editing?
   await db.from('products').update(payload).eq('id',editing):
   await db.from('products').insert({...payload,visible:true,position:products.filter(p=>p.category===cat).length});
  if(error)fail(error.message);
  else {ok(editing?'Bebida actualizada.':'Bebida añadida a la carta.');setEditing(null);setName('');setPrice('');await load();}
  setBusy(false);
 }
 async function toggleProduct(p:Product){
  if(!db)return;setBusy(true);
  const {error}=await db.from('products').update({visible:!p.visible}).eq('id',p.id);
  if(error)fail(error.message);else {ok(p.visible?'Bebida oculta: ya no aparece a los clientes.':'Bebida visible de nuevo.');await load();}
  setBusy(false);
 }
 async function deleteProduct(p:Product){
  if(!db||!window.confirm('¿Eliminar definitivamente '+p.name+'? Si solo se ha agotado, pulsa Ocultar.'))return;
  setBusy(true);const {error}=await db.from('products').delete().eq('id',p.id);
  if(error)fail(error.message);else {ok('Bebida eliminada.');await load();}
  setBusy(false);
 }
 const changeDay=(index:number,patch:Partial<DaySchedule>)=>setWeekly(items=>items.map((d,i)=>i===index?{...d,...patch}:d));
 return <main className="admin-wrap">
  <div className="inline-label"><LockKeyhole color="var(--gold)"/><span className="overline">ZONA PRIVADA</span></div>
  <h1>PANEL D2</h1>
  {access==='checking'&&<p>Comprobando acceso…</p>}
  {access==='setup'&&<div className="panel"><h3>Activar administración</h3><p>Falta conectar un proyecto propio de Supabase para D2. Esta web no solicita ni almacena contraseñas hasta configurar la conexión segura.</p></div>}
  {access==='login'&&<div className="panel" style={{maxWidth:440}}><h3>Entrar como administrador</h3><form onSubmit={login}>
    <label className="form-field">Correo electrónico<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="form-field">Contraseña<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <button className="button button-primary" disabled={busy} type="submit">ENTRAR</button>
   </form></div>}
  {access==='denied'&&<div className="panel"><h3>Acceso no autorizado</h3><p>Tu cuenta no está habilitada como administradora de D2.</p><button className="small-button" onClick={async()=>{await db?.auth.signOut();setAccess('login');}}>Salir</button></div>}
  {notice&&<div className={'notice '+(/error|no tiene|válido|igual|permiso/i.test(notice)?'error':'success')} role="status">{notice}</div>}
  {access==='ready'&&<>
   <div className="admin-actions"><button className={section==='horarios'?'selected':''} onClick={()=>{setSection('horarios');setNotice('');}}><Clock3 size={16}/> Horarios</button><button className={section==='carta'?'selected':''} onClick={()=>{setSection('carta');setNotice('');}}><BookOpen size={16}/> Carta</button><button className={section==='fotos'?'selected':''} onClick={()=>{setSection('fotos');setNotice('');}}><ImageIcon size={16}/> Fotos</button><button onClick={async()=>{await db?.auth.signOut();setAccess('login');}}><LogOut size={16}/> Salir</button></div>
   {section==='horarios'&&<>
    <div className="panel"><h3>1. HORARIO DE SIEMPRE</h3><p className="muted">Estos horarios se repiten cada semana. Solo cámbialos si cambia el horario habitual del pub.</p>
     {weekly.map((d,i)=><div className="admin-row" key={d.weekday}><strong>{weekdayNames[d.weekday]}</strong><div className="admin-controls">
      <label className="inline-label"><input type="checkbox" checked={d.open} onChange={e=>changeDay(i,{open:e.target.checked})}/> Abre</label>
      {d.open&&<><input aria-label={'Apertura '+weekdayNames[d.weekday]} type="time" value={d.opens||'21:30'} onChange={e=>changeDay(i,{opens:e.target.value})}/><span className="muted">a</span><input aria-label={'Cierre '+weekdayNames[d.weekday]} type="time" value={d.closes||'03:00'} onChange={e=>changeDay(i,{closes:e.target.value})}/></>}
     </div></div>)}
     <div className="form-actions"><button className="button button-primary" disabled={busy} onClick={saveWeekly}><CheckCircle2 size={18}/> GUARDAR HORARIO HABITUAL</button></div>
    </div>
    <div className="panel"><h3>2. CAMBIAR UN SOLO DÍA</h3><p className="muted">Si no puedes abrir, o quieres abrir/cerrar a otra hora, cámbialo aquí. Los demás días seguirán con su horario normal.</p>
     <label className="form-field">¿Qué día quieres cambiar?<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
     <label className="form-field">¿Qué quieres hacer?<select value={action} onChange={e=>setAction(e.target.value as typeof action)}><option value="closed">Este día estará cerrado</option><option value="special">Abrir o cambiar las horas este día</option><option value="normal">Volver al horario normal de ese día</option></select></label>
     {action==='special'&&<div className="admin-grid"><label className="form-field">Hora de apertura<input type="time" value={opening} onChange={e=>setOpening(e.target.value)}/></label><label className="form-field">Hora de cierre<input type="time" value={closing} onChange={e=>setClosing(e.target.value)}/></label></div>}
     <button className="button button-primary" onClick={saveException} disabled={busy||!date}><CheckCircle2 size={18}/> GUARDAR CAMBIO</button>
    </div>
    {exceptions.length>0&&<div className="panel"><h3>CAMBIOS GUARDADOS</h3>{exceptions.map(e=><div className="admin-row" key={e.date}><span><strong>{e.date}</strong><br/><span className="muted">{e.kind==='closed'?'Cerrado':e.opens+' – '+e.closes}</span></span><button className="small-button" disabled={busy} onClick={()=>removeException(e.date)}>Volver al horario normal</button></div>)}</div>}
   </>}
   {section==='carta'&&<div className="panel"><h3>GESTIONAR LA CARTA</h3><p className="muted">Añade el nombre y el precio. Si se agota algo, pulsa «Ocultar» y desaparecerá de la carta del cliente sin perder el producto.</p>
    <label className="form-field">Apartado de la carta<select value={cat} onChange={e=>{setCat(e.target.value);setEditing(null);setName('');setPrice('');}}>{categories.map(c=><option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
    {products.filter(p=>p.category===cat).map(p=><div className="admin-row" key={p.id}><span><strong>{p.name}</strong> · {formatMoney(p.price)}<br/><small className="muted">{p.visible?'Visible a los clientes':'Oculto — no aparece en la web'}</small></span><div className="admin-controls">
      <button className="small-button" disabled={busy} onClick={()=>toggleProduct(p)}>{p.visible?'Ocultar':'Mostrar'}</button>
      <button className="small-button" onClick={()=>{setEditing(p.id);setName(p.name);setPrice(String(p.price));}}>Editar</button>
      <button className="small-button danger-button" onClick={()=>deleteProduct(p)}>Eliminar</button>
     </div></div>)}
    <form onSubmit={saveProduct} style={{marginTop:28}}><h3>{editing?'EDITAR BEBIDA':'AÑADIR BEBIDA'}</h3><div className="admin-grid">
      <label className="form-field">Nombre<input placeholder="Nombre de la bebida" value={name} required onChange={e=>setName(e.target.value)}/></label>
      <label className="form-field">Precio en euros<input placeholder="2,50" inputMode="decimal" value={price} required onChange={e=>setPrice(e.target.value)}/></label>
     </div><div className="form-actions"><button className="button button-primary" type="submit" disabled={busy}><Plus size={18}/>{editing?'GUARDAR CAMBIOS':'AÑADIR BEBIDA'}</button>{editing&&<button type="button" className="small-button" onClick={()=>{setEditing(null);setName('');setPrice('');}}>Cancelar</button>}</div>
    </form>
   </div>}
   {section==='fotos'&&<div className="panel"><h3>FOTOGRAFÍAS DEL LOCAL</h3><p>En esta primera versión solo se utilizará una imagen principal y una por categoría. La subida de fotografías se activará cuando tengamos imágenes autorizadas por el propietario.</p><p className="muted">No es necesaria una galería extensa.</p></div>}
  </>}
 </main>;
}
