import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_CONFIG } from './supabase-config.js';
import { ADMIN_USERNAME, ADMIN_AUTH_EMAIL } from './admin-config.js';

const $ = (selector) => document.querySelector(selector);
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const state = { client: null, doctors: [], rows: [], channel: null };
const escapeHtml = (value='') => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock = (value) => value ? new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date(`1970-01-01T${value}`)) : '—';
function setConnection(text, connected=false) { $('#connection-state').textContent=text; $('#connection-state').classList.toggle('connected',connected); }
function showLogin(message='') { $('#login-panel').hidden=false; $('#admin-workspace').hidden=true; $('#sign-out').hidden=true; if(message) $('#login-error').textContent=message; }
function renderRows() {
  const body=$('#availability-rows');
  if(!state.rows.length){body.innerHTML='<tr><td colspan="6"><div class="empty-state"><strong>No schedules yet</strong>Use the form above to add the first doctor schedule.</div></td></tr>';$('#schedule-count').textContent='0 schedules';return;}
  body.innerHTML=state.rows.map(row=>`<tr><td>${escapeHtml(row.doctors.full_name)}</td><td>${escapeHtml(row.doctors.department)}</td><td>${DAYS[row.day_of_week]}</td><td>${clock(row.start_time)} – ${clock(row.end_time)}</td><td><span class="status ${row.status==='Unavailable'?'unavailable':''}">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.note||'—')}</td></tr>`).join('');
  $('#schedule-count').textContent=`${state.rows.length} weekly schedules`;
}
async function loadData() {
  const [doctors, schedules]=await Promise.all([
    state.client.from('doctors').select('id,full_name,department,specialty').eq('is_active',true).order('full_name'),
    state.client.from('doctor_availability').select('id,doctor_id,day_of_week,start_time,end_time,status,note,doctors(full_name,department)').order('day_of_week').order('start_time')
  ]);
  if(doctors.error) throw doctors.error;
  if(schedules.error) throw schedules.error;
  state.doctors=doctors.data||[];state.rows=schedules.data||[];
  const select=$('#doctor-select');
  const previous=select.value;
  select.innerHTML=state.doctors.map(d=>`<option value="${d.id}">${escapeHtml(d.full_name)} · ${escapeHtml(d.department)}</option>`).join('');
  if(previous) select.value=previous;
  renderRows();
}
function subscribe() {
  if(state.channel) state.client.removeChannel(state.channel);
  state.channel=state.client.channel('doctor-availability-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'doctor_availability'},()=>loadData().catch(showError))
    .on('postgres_changes',{event:'*',schema:'public',table:'doctors'},()=>loadData().catch(showError))
    .subscribe((status)=>{if(status==='SUBSCRIBED'){$('#realtime-state').textContent='Live updates on';$('#realtime-state').classList.add('connected');}});
}
function showError(error) { const message=error?.message||String(error);setConnection('Connection issue');$('#availability-error').textContent=message; }
async function activate(session) {
  const userEmail=session?.user?.email?.toLowerCase();
  if(!userEmail||userEmail!==ADMIN_AUTH_EMAIL.toLowerCase()) { await state.client.auth.signOut();showLogin('This account is not configured as the hospital administrator.');setConnection('Admin access required');return; }
  $('#login-panel').hidden=true;$('#admin-workspace').hidden=false;$('#sign-out').hidden=false;setConnection('Admin signed in',true);
  try { await loadData();subscribe(); } catch(error) { showError(error); }
}
if(!SUPABASE_CONFIG.url||!SUPABASE_CONFIG.key||!ADMIN_AUTH_EMAIL) { setConnection('Setup required');showLogin('Admin authentication is not configured yet.'); }
else {
  state.client=createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.key);
  state.client.auth.getSession().then(({data,error})=>{if(error)throw error;if(data.session)activate(data.session);else setConnection('Sign in required');}).catch(showError);
  state.client.auth.onAuthStateChange((_event,session)=>{if(session)activate(session);else showLogin();});
}
$('#login-form').addEventListener('submit',async event=>{
  event.preventDefault();$('#login-error').textContent='';
  const form=new FormData(event.currentTarget),username=String(form.get('username')).trim(),password=String(form.get('password'));
  if(username!==ADMIN_USERNAME){$('#login-error').textContent='Username or password is incorrect.';return;}
  if(!state.client){$('#login-error').textContent='Admin sign-in setup is incomplete.';return;}
  const button=$('#login-button');button.disabled=true;button.classList.add('loading');
  const {error}=await state.client.auth.signInWithPassword({email:ADMIN_AUTH_EMAIL,password});
  button.disabled=false;button.classList.remove('loading');
  if(error)$('#login-error').textContent='Username or password is incorrect.';
});
$('#availability-form').addEventListener('submit',async event=>{
  event.preventDefault();$('#availability-error').textContent='';
  const form=new FormData(event.currentTarget),record=Object.fromEntries(form.entries());
  if(!record.doctor_id){$('#availability-error').textContent='Add a doctor record before setting availability.';return;}
  if(record.status==='Available'&&record.end_time<=record.start_time){$('#availability-error').textContent='End time must be later than start time.';return;}
  record.day_of_week=Number(record.day_of_week);record.updated_at=new Date().toISOString();record.updated_by=(await state.client.auth.getUser()).data.user.id;
  const button=$('#save-availability');button.disabled=true;button.classList.add('loading');
  const {error}=await state.client.from('doctor_availability').upsert(record,{onConflict:'doctor_id,day_of_week'});
  button.disabled=false;button.classList.remove('loading');
  if(error){showError(error);return;}
  $('#availability-error').textContent='Saved. Other signed-in users will see the change shortly.';await loadData();
});
$('#refresh-schedule').addEventListener('click',()=>loadData().catch(showError));
$('#sign-out').addEventListener('click',async()=>{await state.client?.auth.signOut();setConnection('Signed out');});
