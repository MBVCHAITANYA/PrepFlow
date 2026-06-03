/* PrepFlow - Core App Module */
const LS={get(k,d){try{return JSON.parse(localStorage.getItem('pf_'+k))||d}catch{return d}},set(k,v){localStorage.setItem('pf_'+k,JSON.stringify(v))}};

const DEFAULT_CATS=[];
const QUOTES=[
  {t:"The only way to do great work is to love what you do.",a:"Steve Jobs"},
  {t:"It does not matter how slowly you go as long as you do not stop.",a:"Confucius"},
  {t:"Success is not final, failure is not fatal: it is the courage to continue that counts.",a:"Winston Churchill"},
  {t:"Believe you can and you're halfway there.",a:"Theodore Roosevelt"},
  {t:"The future belongs to those who believe in the beauty of their dreams.",a:"Eleanor Roosevelt"},
  {t:"Your time is limited, don't waste it living someone else's life.",a:"Steve Jobs"},
  {t:"The secret of getting ahead is getting started.",a:"Mark Twain"},
  {t:"The best time to plant a tree was 20 years ago. The second best time is now.",a:"Chinese Proverb"},
  {t:"Strive not to be a success, but rather to be of value.",a:"Albert Einstein"},
  {t:"Don't watch the clock; do what it does. Keep going.",a:"Sam Levenson"}
];

function todayStr(){return new Date().toISOString().slice(0,10)}
function fmtDate(d){return new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
let _uidC=0;function uid(){return Date.now().toString(36)+'-'+(++_uidC).toString(36)+Math.random().toString(36).slice(2,5)}

/* 12-hour time formatter: converts "14:30" to "2:30 PM" */
function to12h(t){
  if(!t)return'';
  const[h,m]=t.split(':').map(Number);
  const ampm=h>=12?'PM':'AM';
  const h12=h%12||12;
  return h12+':'+(m<10?'0':'')+m+' '+ampm;
}

/* State */
let tasks=LS.get('tasks',[]);
// Data migration: ensure unique IDs + reset future tasks + remove old default tasks
(function migrate(){
  const today=new Date().toISOString().slice(0,10);
  const OLD_DEFAULTS=['Exercise','DSA','Core Subjects','Design','Communication','Projects','Aptitude'];
  const seen=new Set();
  // If user still has the old default categories from v1, remove them
  let cats=LS.get('categories',null);
  if(cats&&Array.isArray(cats)){
    const isOldDefaults=OLD_DEFAULTS.every(c=>cats.includes(c))&&cats.length===OLD_DEFAULTS.length;
    if(isOldDefaults){LS.set('categories',[]);cats=[]}
  }
  // Fix task IDs and future status
  tasks.forEach(t=>{
    while(!t.id||seen.has(t.id))t.id=uid();
    seen.add(t.id);
    if(t.date>today&&t.status==='completed')t.status='pending';
  });
  LS.set('tasks',tasks);
})();
let targets=LS.get('targets',[]);
let categories=LS.get('categories',DEFAULT_CATS.slice());
let prefs=LS.get('prefs',{theme:'dark'});
let currentView='dashboard';
let calView='monthly';
let calDate=new Date();
let editingTaskId=null;
let subtaskParentId=null;

/* Init */
document.addEventListener('DOMContentLoaded',()=>{
  applyTheme(prefs.theme);
  setupNav();
  setupTaskModal();
  setupSubtaskModal();
  setupTargetModal();
  setupSettings();
  setupFilters();
  setupSearch();
  setupCalendarNav();
  setupAI();
  setQuote();
  document.getElementById('dashDate').textContent=fmtDate(todayStr());
  document.getElementById('filterDate').value=todayStr();
  // AI FAB click handler
  document.getElementById('aiFab').addEventListener('click',()=>showView('ai'));
  // Gemini API key load
  const savedKey=LS.get('gemini_key','');
  if(savedKey)document.getElementById('geminiApiKey').value=savedKey;
  showView('dashboard');
});

/* Theme */
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  prefs.theme=t;LS.set('prefs',prefs);
  const ti=document.getElementById('themeIcon');
  if(ti)ti.textContent=t==='dark'?'🌙':'☀️';
  const st=document.getElementById('settingsThemeToggle');
  if(st)st.checked=t==='dark';
  const tl=document.getElementById('themeLabel');
  if(tl)tl.textContent=t==='dark'?'Dark Mode':'Light Mode';
}
function toggleTheme(){applyTheme(prefs.theme==='dark'?'light':'dark')}

/* Navigation */
function setupNav(){
  document.querySelectorAll('.nav-btn,.mob-nav-btn').forEach(b=>{
    b.addEventListener('click',()=>showView(b.dataset.view));
  });
  document.getElementById('themeToggleBtn').addEventListener('click',toggleTheme);
}
function showView(v){
  currentView=v;
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  const vel=document.getElementById('view-'+v);
  if(vel)vel.classList.add('active');
  document.querySelectorAll('.nav-btn,.mob-nav-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.view===v);
  });
  if(v==='dashboard')renderDashboard();
  else if(v==='planner')renderPlanner();
  else if(v==='calendar')renderCalendar();
  else if(v==='analytics')renderAnalytics();
  else if(v==='targets')renderTargets();
  else if(v==='focus')renderFocus();
  else if(v==='settings')renderSettings();
}

/* Toast */
function toast(msg,type='info'){
  const c=document.getElementById('toastContainer');
  const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;
  c.appendChild(t);setTimeout(()=>t.remove(),3000);
}

/* Quote */
function setQuote(){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  document.getElementById('quoteText').textContent='"'+q.t+'"';
  document.getElementById('quoteAuthor').textContent='— '+q.a;
}

/* Greeting */
function getGreeting(){
  const h=new Date().getHours();
  if(h<12)return'Good Morning! ☀️ Start your day strong!';
  if(h<17)return'Good Afternoon! 🚀 Keep up the momentum!';
  return'Good Evening! 🌙 Finish strong!';
}

/* Save helpers */
function saveTasks(){LS.set('tasks',tasks)}
function saveTargets(){LS.set('targets',targets)}
function saveCats(){LS.set('categories',categories)}

/* Populate category selects */
function populateCatSelect(sel,includeCustom){
  sel.innerHTML='';
  if(!categories.length){
    const o=document.createElement('option');o.value='';o.textContent='— No categories (create in Settings)';o.disabled=true;o.selected=true;sel.appendChild(o);
  }
  categories.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)});
  if(includeCustom){const o=document.createElement('option');o.value='__custom__';o.textContent='+ Custom Category';sel.appendChild(o)}
}

/* ========== DASHBOARD ========== */
function renderDashboard(){
  document.getElementById('dashGreeting').textContent=getGreeting();
  const today=todayStr();
  const tt=tasks.filter(t=>t.date===today);
  const done=tt.filter(t=>t.status==='completed');
  const pending=tt.filter(t=>t.status!=='completed');
  const pct=tt.length?Math.round(done.length/tt.length*100):0;
  let planned=0,studied=0;
  tt.forEach(t=>{const d=t.duration||0;planned+=d;if(t.status==='completed')studied+=d});
  document.getElementById('statTotal').textContent=tt.length;
  document.getElementById('statDone').textContent=done.length;
  document.getElementById('statPending').textContent=pending.length;
  document.getElementById('statPct').textContent=pct+'%';
  document.getElementById('statPlanned').textContent=fmtDur(planned);
  document.getElementById('statStudied').textContent=fmtDur(studied);
  document.getElementById('dailyProgressBar').style.width=pct+'%';
  document.getElementById('dailyProgressLabel').textContent=pct+'% complete';
  const celeb=document.getElementById('celebrationCard');
  celeb.classList.toggle('hidden',!(tt.length>0&&pct===100));
  renderDashCategories();
  renderDashTodayTasks(tt);
}

function fmtDur(m){if(m<60)return m+'m';const h=Math.floor(m/60);const r=m%60;return r?h+'h '+r+'m':h+'h'}

function renderDashCategories(){
  const grid=document.getElementById('dashCategoryGrid');grid.innerHTML='';
  const today=todayStr();
  categories.forEach(cat=>{
    const ct=tasks.filter(t=>t.category===cat&&t.date===today);
    if(!ct.length)return;
    const done=ct.filter(t=>t.status==='completed').length;
    const pct=Math.round(done/ct.length*100);
    grid.innerHTML+=`<div class="cat-progress-card"><h4>${cat}<span>${pct}%</span></h4><div class="progress-bar-wrapper"><div class="progress-bar" style="width:${pct}%"></div></div><div class="cat-stats"><span>✅ ${done}</span><span>📋 ${ct.length}</span><span>⏳ ${ct.length-done}</span></div></div>`;
  });
}

function renderDashTodayTasks(tt){
  const cont=document.getElementById('dashTodayTasks');
  if(!tt.length){cont.innerHTML='<div class="empty-state"><div class="empty-icon">📭</div><h3>No tasks for today</h3><p>Your schedule is empty. Create your first task to get started!</p></div>';return}
  cont.innerHTML='';
  tt.sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||'')).forEach(t=>cont.appendChild(createTaskCard(t)));
}

/* ========== TASK CARD ========== */
function createTaskCard(t){
  const div=document.createElement('div');div.className='task-card'+(t.status==='completed'?' completed':'');div.dataset.id=t.id;
  const subs=t.subtasks||[];
  const subDone=subs.filter(s=>s.done).length;
  const subBar=subs.length?`<div class="task-subtask-bar"><div class="progress-bar-wrapper"><div class="progress-bar" style="width:${Math.round(subDone/subs.length*100)}%"></div></div><span>${subDone}/${subs.length}</span></div>`:'';
  const timeStr=t.startTime?(to12h(t.startTime)+(t.endTime?' - '+to12h(t.endTime):'')):''; 
  const durStr=t.duration?fmtDur(t.duration):'';
  div.innerHTML=`
    <div class="task-check${t.status==='completed'?' checked':''}" data-id="${t.id}">${t.status==='completed'?'✓':''}</div>
    <div class="task-body">
      <div class="task-title">${esc(t.title)}</div>
      <div class="task-meta">
        <span class="task-badge badge-cat">${esc(t.category)}</span>
        <span class="task-badge badge-${t.priority}">${t.priority}</span>
        <span class="task-badge badge-${t.status}">${t.status}</span>
        ${timeStr?'<span class="task-time">🕐 '+timeStr+'</span>':''}
        ${durStr?'<span class="task-time">⏱ '+durStr+'</span>':''}
        <span class="task-time">📅 ${t.date}</span>
      </div>
      ${t.notes?'<div class="task-time" style="margin-top:.3rem">📝 '+esc(t.notes)+'</div>':''}
      ${t.source?'<a href="'+esc(t.source)+'" target="_blank" class="task-source" onclick="event.stopPropagation()">🔗 '+new URL(t.source).hostname+'</a>':''}
      ${subBar}
    </div>
    <div class="task-actions">
      <button class="task-action-btn" title="Subtasks" data-act="subtask" data-id="${t.id}">📋</button>
      <button class="task-action-btn" title="Edit" data-act="edit" data-id="${t.id}">✏️</button>
      <button class="task-action-btn" title="Delete" data-act="delete" data-id="${t.id}">🗑️</button>
    </div>`;
  div.querySelector('.task-check').addEventListener('click',()=>toggleTask(t.id));
  div.querySelectorAll('.task-action-btn').forEach(b=>{
    b.addEventListener('click',e=>{
      const act=b.dataset.act,id=b.dataset.id;
      if(act==='edit')openEditTask(id);
      else if(act==='delete')confirmDelete(id);
      else if(act==='subtask')openSubtasks(id);
    });
  });
  return div;
}

function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML}

function toggleTask(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  const today=todayStr();
  // Prevent marking future tasks as completed
  if(t.date>today&&t.status!=='completed'){
    toast('⚠️ Cannot complete a future task. Wait for '+t.date,'error');return;
  }
  t.status=t.status==='completed'?'pending':'completed';
  saveTasks();refreshCurrent();
  toast(t.status==='completed'?'Task completed! 🎉':'Task reopened','success');
}

function confirmDelete(id){
  showConfirm('Delete this task?','This action cannot be undone.',()=>{
    tasks=tasks.filter(t=>t.id!==id);saveTasks();refreshCurrent();toast('Task deleted','error');
  });
}

function refreshCurrent(){showView(currentView)}

/* ========== PLANNER ========== */
function renderPlanner(){
  populateFilterCats();
  // Default to today's date if no filter set
  const dateFilter=document.getElementById('filterDate');
  if(!dateFilter.value)dateFilter.value=todayStr();
  const filtered=getFilteredTasks();
  const cont=document.getElementById('plannerTaskList');
  const empty=document.getElementById('plannerEmpty');
  cont.innerHTML='';
  if(!filtered.length){empty.classList.remove('hidden');cont.classList.add('hidden');return}
  empty.classList.add('hidden');cont.classList.remove('hidden');
  filtered.sort((a,b)=>{const p={high:0,medium:1,low:2};return(p[a.priority]||1)-(p[b.priority]||1)||(a.startTime||'').localeCompare(b.startTime||'')});
  filtered.forEach(t=>cont.appendChild(createTaskCard(t)));
}

function populateFilterCats(){
  const sel=document.getElementById('filterCategory');
  const cur=sel.value;sel.innerHTML='<option value="all">All Categories</option>';
  categories.forEach(c=>{sel.innerHTML+=`<option value="${c}">${c}</option>`});
  sel.value=cur||'all';
}

function getFilteredTasks(){
  const cat=document.getElementById('filterCategory').value;
  const st=document.getElementById('filterStatus').value;
  const pr=document.getElementById('filterPriority').value;
  const dt=document.getElementById('filterDate').value;
  const q=(document.getElementById('globalSearch').value||'').toLowerCase();
  return tasks.filter(t=>{
    if(cat!=='all'&&t.category!==cat)return false;
    if(st!=='all'&&t.status!==st)return false;
    if(pr!=='all'&&t.priority!==pr)return false;
    if(dt&&t.date!==dt)return false;
    if(q&&!t.title.toLowerCase().includes(q)&&!t.category.toLowerCase().includes(q))return false;
    return true;
  });
}

function setupFilters(){
  ['filterCategory','filterStatus','filterPriority','filterDate'].forEach(id=>{
    document.getElementById(id).addEventListener('change',()=>{if(currentView==='planner')renderPlanner()});
  });
  document.getElementById('resetFiltersBtn').addEventListener('click',()=>{
    document.getElementById('filterCategory').value='all';
    document.getElementById('filterStatus').value='all';
    document.getElementById('filterPriority').value='all';
    document.getElementById('filterDate').value='';
    renderPlanner();
  });
}

function setupSearch(){
  document.getElementById('globalSearch').addEventListener('input',()=>{
    if(currentView==='dashboard'){renderDashboard()}
    else if(currentView==='planner'){renderPlanner()}
  });
}

/* ========== TASK MODAL ========== */
function setupTaskModal(){
  const modal=document.getElementById('taskModal');
  const form=document.getElementById('taskForm');
  const catSel=document.getElementById('taskCategory');
  const close=()=>modal.classList.add('hidden');
  document.getElementById('taskModalClose').addEventListener('click',close);
  document.getElementById('taskModalCancel').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.getElementById('addTaskBtn').addEventListener('click',()=>openAddTask());
  document.getElementById('addTaskBtnEmpty').addEventListener('click',()=>openAddTask());
  catSel.addEventListener('change',()=>{
    document.getElementById('customCatGroup').classList.toggle('hidden',catSel.value!=='__custom__');
  });
  // Auto-calculate duration when start/end time changes
  const startInp=document.getElementById('taskStartTime');
  const endInp=document.getElementById('taskEndTime');
  const durInp=document.getElementById('taskDuration');
  function autoCalcDuration(){
    if(startInp.value&&endInp.value){
      const[sh,sm]=startInp.value.split(':').map(Number);
      const[eh,em]=endInp.value.split(':').map(Number);
      const mins=(eh*60+em)-(sh*60+sm);
      if(mins>0){
        durInp.value=mins;
      }else{
        durInp.value='';
        if(endInp.value)toast('⚠️ End time must be after start time','error');
      }
    }
  }
  startInp.addEventListener('change',autoCalcDuration);
  endInp.addEventListener('change',autoCalcDuration);
  form.addEventListener('submit',e=>{
    e.preventDefault();saveTaskForm();close();
  });
}

function openAddTask(){
  editingTaskId=null;
  document.getElementById('taskModalTitle').textContent='Add Task';
  document.getElementById('taskForm').reset();
  document.getElementById('taskDate').value=todayStr();
  document.getElementById('customCatGroup').classList.add('hidden');
  populateCatSelect(document.getElementById('taskCategory'),true);
  document.getElementById('taskModal').classList.remove('hidden');
}

function openEditTask(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  editingTaskId=id;
  document.getElementById('taskModalTitle').textContent='Edit Task';
  populateCatSelect(document.getElementById('taskCategory'),true);
  document.getElementById('taskCategory').value=categories.includes(t.category)?t.category:'__custom__';
  if(!categories.includes(t.category)){document.getElementById('customCatGroup').classList.remove('hidden');document.getElementById('taskCustomCat').value=t.category}
  else{document.getElementById('customCatGroup').classList.add('hidden')}
  document.getElementById('taskTitle').value=t.title;
  document.getElementById('taskDate').value=t.date;
  document.getElementById('taskPriority').value=t.priority;
  document.getElementById('taskStartTime').value=t.startTime||'';
  document.getElementById('taskEndTime').value=t.endTime||'';
  document.getElementById('taskDuration').value=t.duration||'';
  document.getElementById('taskStatus').value=t.status;
  document.getElementById('taskNotes').value=t.notes||'';
  document.getElementById('taskSource').value=t.source||'';
  document.getElementById('taskRepeatDays').value='';
  document.getElementById('taskModal').classList.remove('hidden');
}

function saveTaskForm(){
  let cat=document.getElementById('taskCategory').value;
  if(cat==='__custom__'){
    cat=document.getElementById('taskCustomCat').value.trim();
    if(!cat){toast('Enter a category name','error');return}
    if(!categories.includes(cat)){categories.push(cat);saveCats()}
  }
  const startTime=document.getElementById('taskStartTime').value;
  const endTime=document.getElementById('taskEndTime').value;
  let duration=parseInt(document.getElementById('taskDuration').value)||0;
  // Auto-calculate duration from start/end time
  if(startTime&&endTime&&!duration){
    const[sh,sm]=startTime.split(':').map(Number);
    const[eh,em]=endTime.split(':').map(Number);
    duration=Math.max(0,(eh*60+em)-(sh*60+sm));
  }
  const data={
    title:document.getElementById('taskTitle').value.trim(),
    category:cat,
    date:document.getElementById('taskDate').value,
    priority:document.getElementById('taskPriority').value,
    startTime,endTime,duration,
    status:document.getElementById('taskStatus').value,
    notes:document.getElementById('taskNotes').value.trim(),
    source:document.getElementById('taskSource').value.trim()
  };
  if(!data.title){toast('Enter a task title','error');return}
  // Overlap detection
  if(data.startTime&&data.endTime){
    const overlapping=tasks.filter(t=>t.id!==editingTaskId&&t.date===data.date&&t.startTime&&t.endTime&&
      t.startTime<data.endTime&&t.endTime>data.startTime);
    if(overlapping.length){toast('⚠️ Warning: This task overlaps with "'+overlapping[0].title+'"','error')}
  }
  const repeatDays=parseInt(document.getElementById('taskRepeatDays').value)||1;
  if(editingTaskId){
    const t=tasks.find(x=>x.id===editingTaskId);
    if(t)Object.assign(t,data);
    toast('Task updated ✏️','success');
  }else{
    // Create task for multiple days if repeat > 1
    for(let d=0;d<repeatDays;d++){
      const taskDate=new Date(data.date+'T00:00:00');
      taskDate.setDate(taskDate.getDate()+d);
      const ds=taskDate.getFullYear()+'-'+String(taskDate.getMonth()+1).padStart(2,'0')+'-'+String(taskDate.getDate()).padStart(2,'0');
      const copy={...data,id:uid(),date:ds,subtasks:[],createdAt:new Date().toISOString()};
      tasks.push(copy);
    }
    toast(repeatDays>1?`Task added to ${repeatDays} days ✅`:'Task added ✅','success');
  }
  saveTasks();refreshCurrent();
}

/* ========== SUBTASK MODAL ========== */
function setupSubtaskModal(){
  const modal=document.getElementById('subtaskModal');
  const close=()=>modal.classList.add('hidden');
  document.getElementById('subtaskModalClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.getElementById('addSubtaskBtn').addEventListener('click',addSubtask);
  document.getElementById('newSubtaskInput').addEventListener('keydown',e=>{if(e.key==='Enter')addSubtask()});
  document.getElementById('aiSuggestSubtasksBtn').addEventListener('click',aiSuggestForSubtask);
}

function openSubtasks(id){
  subtaskParentId=id;
  const t=tasks.find(x=>x.id===id);if(!t)return;
  document.getElementById('subtaskModalTitle').textContent='Subtasks: '+t.title;
  document.getElementById('subtaskModal').classList.remove('hidden');
  renderSubtasks();
}

function renderSubtasks(){
  const t=tasks.find(x=>x.id===subtaskParentId);if(!t)return;
  const subs=t.subtasks||[];
  const done=subs.filter(s=>s.done).length;
  const pct=subs.length?Math.round(done/subs.length*100):0;
  document.getElementById('subtaskProgressBar').style.width=pct+'%';
  document.getElementById('subtaskProgressLabel').textContent=done+'/'+subs.length+' completed ('+pct+'%)';
  const ul=document.getElementById('subtaskList');ul.innerHTML='';
  subs.forEach((s,i)=>{
    const li=document.createElement('li');li.className='subtask-item';
    li.innerHTML=`<input type="checkbox" ${s.done?'checked':''}><span class="${s.done?'done':''}">${esc(s.title)}</span><button title="Remove">✕</button>`;
    li.querySelector('input').addEventListener('change',()=>{t.subtasks[i].done=!t.subtasks[i].done;saveTasks();renderSubtasks()});
    li.querySelector('button').addEventListener('click',()=>{t.subtasks.splice(i,1);saveTasks();renderSubtasks()});
    ul.appendChild(li);
  });
}

function addSubtask(){
  const inp=document.getElementById('newSubtaskInput');
  const v=inp.value.trim();if(!v)return;
  const t=tasks.find(x=>x.id===subtaskParentId);if(!t)return;
  if(!t.subtasks)t.subtasks=[];
  t.subtasks.push({title:v,done:false});
  saveTasks();inp.value='';renderSubtasks();
}

/* ========== TARGETS ========== */
function setupTargetModal(){
  const modal=document.getElementById('targetModal');
  const close=()=>modal.classList.add('hidden');
  document.getElementById('targetModalClose').addEventListener('click',close);
  document.getElementById('targetModalCancel').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.getElementById('addTargetBtn').addEventListener('click',()=>{
    populateCatSelect(document.getElementById('targetCategory'),false);
    document.getElementById('targetStartDate').value=todayStr();
    const end=new Date();end.setDate(end.getDate()+14);
    document.getElementById('targetEndDate').value=end.getFullYear()+'-'+String(end.getMonth()+1).padStart(2,'0')+'-'+String(end.getDate()).padStart(2,'0');
    modal.classList.remove('hidden');
  });
  document.getElementById('addTargetBtnEmpty').addEventListener('click',()=>{
    populateCatSelect(document.getElementById('targetCategory'),false);
    document.getElementById('targetStartDate').value=todayStr();
    const end=new Date();end.setDate(end.getDate()+14);
    document.getElementById('targetEndDate').value=end.getFullYear()+'-'+String(end.getMonth()+1).padStart(2,'0')+'-'+String(end.getDate()).padStart(2,'0');
    modal.classList.remove('hidden');
  });
  document.getElementById('targetForm').addEventListener('submit',e=>{
    e.preventDefault();
    const text=document.getElementById('targetText').value.trim();
    const category=document.getElementById('targetCategory').value;
    const startDate=document.getElementById('targetStartDate').value;
    const endDate=document.getElementById('targetEndDate').value;
    const notes=document.getElementById('targetNotes').value.trim();
    if(!text)return;
    targets.push({id:uid(),text,category,startDate,endDate,notes,done:false});
    saveTargets();close();document.getElementById('targetForm').reset();renderTargets();toast('Goal set 🎯','success');
  });
}

function renderTargets(){
  const cont=document.getElementById('targetsList');
  const empty=document.getElementById('targetsEmpty');
  cont.innerHTML='';
  if(!targets.length){empty.classList.remove('hidden');return}
  empty.classList.add('hidden');
  const today=todayStr();
  targets.forEach(t=>{
    const div=document.createElement('div');div.className='target-card';
    const color=getCatColor(t.category);
    const start=t.startDate||t.date||today;
    const end=t.endDate||start;
    const totalDays=Math.max(1,Math.round((new Date(end+'T00:00:00')-new Date(start+'T00:00:00'))/(86400000)));
    const elapsed=Math.max(0,Math.round((new Date(today+'T00:00:00')-new Date(start+'T00:00:00'))/(86400000)));
    const pct=t.done?100:Math.min(100,Math.round(elapsed/totalDays*100));
    const daysLeft=Math.max(0,Math.round((new Date(end+'T00:00:00')-new Date(today+'T00:00:00'))/(86400000)));
    let statusClass='active';let statusText=daysLeft+' days left';
    if(t.done){statusClass='completed';statusText='Completed ✓'}
    else if(today>end){statusClass='overdue';statusText='Overdue!'}
    div.innerHTML=`<div class="target-header">
      <div><div class="target-title">${esc(t.text)}</div>
        <span class="target-category" style="background:${color}22;color:${color}">${esc(t.category||'General')}</span></div>
      <div class="target-actions">
        <span class="target-status ${statusClass}">${statusText}</span>
        <button class="target-del" title="Delete">✕</button>
      </div></div>
      <div class="target-dates"><span>📅 ${start}</span><span>🏁 ${end}</span></div>
      <div class="target-progress">
        <div class="target-progress-label"><span>Progress</span><span>${pct}%</span></div>
        <div class="progress-bar-wrapper"><div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg,${color},${color}88)"></div></div>
      </div>
      ${t.notes?'<div class="target-notes">'+esc(t.notes)+'</div>':''}`;
    const check=document.createElement('div');check.className='task-check'+(t.done?' checked':'');check.textContent=t.done?'✓':'';
    check.style.cssText='position:absolute;top:1rem;right:3rem';
    div.style.position='relative';
    div.insertBefore(check,div.firstChild);
    check.addEventListener('click',()=>{t.done=!t.done;saveTargets();renderTargets()});
    div.querySelector('.target-del').addEventListener('click',()=>{targets=targets.filter(x=>x.id!==t.id);saveTargets();renderTargets()});
    cont.appendChild(div);
  });
}

/* ========== FOCUS MODE ========== */
function renderFocus(){
  const cont=document.getElementById('focusTaskList');
  const empty=document.getElementById('focusEmpty');
  const today=todayStr();
  const tt=tasks.filter(t=>t.date===today&&t.status!=='completed');
  cont.innerHTML='';
  if(!tt.length){
    empty.classList.remove('hidden');
    empty.innerHTML='<div class="empty-icon">🧘</div><h3>No active tasks scheduled</h3><p>Add tasks in the Planner to use Focus Mode.</p>';
    return;
  }
  empty.classList.add('hidden');
  tt.forEach((t,i)=>{
    const div=document.createElement('div');div.className='focus-task'+(i===0?' active-focus':'')+(t.status==='completed'?' completed':'');
    const timeStr=t.startTime?to12h(t.startTime)+(t.endTime?' - '+to12h(t.endTime):''):'';
    div.innerHTML=`<div class="task-check${t.status==='completed'?' checked':''}">${t.status==='completed'?'✓':''}</div><div><div class="focus-task-title" style="font-weight:600">${esc(t.title)}</div><div style="font-size:.8rem;color:var(--text3)">${esc(t.category)} · ${t.priority} priority${timeStr?' · '+timeStr:''}${t.duration?' · '+fmtDur(t.duration):''}</div></div>`;
    div.querySelector('.task-check').addEventListener('click',()=>{toggleTask(t.id);renderFocus()});
    cont.appendChild(div);
  });
  document.getElementById('exitFocusBtn').addEventListener('click',()=>showView('dashboard'));
}

/* ========== CONFIRM MODAL ========== */
let confirmCb=null;
function showConfirm(title,msg,cb){
  document.getElementById('confirmTitle').textContent=title;
  document.getElementById('confirmMessage').textContent=msg;
  document.getElementById('confirmModal').classList.remove('hidden');
  confirmCb=cb;
}
document.addEventListener('DOMContentLoaded',()=>{
  const modal=document.getElementById('confirmModal');
  const close=()=>modal.classList.add('hidden');
  document.getElementById('confirmClose').addEventListener('click',close);
  document.getElementById('confirmNo').addEventListener('click',close);
  document.getElementById('confirmYes').addEventListener('click',()=>{if(confirmCb)confirmCb();close()});
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
});

/* ========== SETTINGS ========== */
function setupSettings(){
  document.getElementById('settingsThemeToggle').addEventListener('change',e=>{applyTheme(e.target.checked?'dark':'light')});
  document.getElementById('addCategoryBtn').addEventListener('click',()=>{
    const inp=document.getElementById('newCategoryInput');
    const v=inp.value.trim();if(!v)return;
    if(categories.includes(v)){toast('Category exists','error');return}
    categories.push(v);saveCats();inp.value='';renderSettings();toast('Category added','success');
  });
  document.getElementById('resetTodayBtn').addEventListener('click',()=>{
    showConfirm('Reset Today?','All tasks for today will be reset to pending.',()=>{
      tasks.filter(t=>t.date===todayStr()).forEach(t=>t.status='pending');saveTasks();refreshCurrent();toast('Today reset','info');
    });
  });
  document.getElementById('clearAllBtn').addEventListener('click',()=>{
    showConfirm('Clear All Data?','This will permanently delete everything.',()=>{
      tasks=[];targets=[];categories=[];saveTasks();saveTargets();saveCats();
      refreshCurrent();toast('All data cleared','error');
    });
  });
  // Save Gemini API Key
  document.getElementById('saveApiKeyBtn').addEventListener('click',()=>{
    const key=document.getElementById('geminiApiKey').value.trim();
    if(key){LS.set('gemini_key',key);toast('API key saved securely 🔑','success')}
    else{toast('Enter a valid API key','error')}
  });
}

function renderSettings(){
  const ul=document.getElementById('categoryList');ul.innerHTML='';
  if(!categories.length){
    ul.innerHTML='<li style="color:var(--text3);font-style:italic;padding:.6rem">No categories yet. Add one above to get started.</li>';
    return;
  }
  categories.forEach((c,i)=>{
    const li=document.createElement('li');
    const color=getCatColor(c);
    li.innerHTML=`<span style="display:flex;align-items:center;gap:.5rem"><span style="width:12px;height:12px;border-radius:50%;background:${color};flex-shrink:0"></span>${esc(c)}</span><button title="Remove">✕</button>`;
    li.querySelector('button').addEventListener('click',()=>{
      showConfirm('Remove "'+c+'"?','Tasks with this category will keep their label.',()=>{
        categories.splice(i,1);saveCats();renderSettings();
      });
    });
    ul.appendChild(li);
  });
}

/* Category colors — dynamically assigned for any user-created category */
const PALETTE=['#3b82f6','#22c55e','#8b5cf6','#f97316','#ec4899','#06b6d4','#eab308','#ef4444','#14b8a6','#a855f7','#f59e0b','#6366f1','#10b981','#e11d48','#0ea5e9'];
const _catColorCache={};
function getCatColor(c){
  if(!c)return'#6366f1';
  if(!_catColorCache[c]){
    const idx=Object.keys(_catColorCache).length%PALETTE.length;
    _catColorCache[c]=PALETTE[idx];
  }
  return _catColorCache[c];
}
