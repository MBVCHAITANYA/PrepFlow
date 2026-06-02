/* PrepFlow - Features Module: Calendar, Analytics, AI */
function localDateStr(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}

/* ========== AI SUBTASK SUGGESTIONS ========== */
const AI_SUBTASKS={
  'dynamic programming':['Introduction to DP','Memoization','Tabulation','Fibonacci','0/1 Knapsack','Longest Common Subsequence','Longest Increasing Subsequence','DP on Grids','DP on Trees','DP Practice Problems'],
  'operating system':['Process Management','Threads','CPU Scheduling','Process Synchronization','Deadlocks','Memory Management','Paging','Segmentation','Virtual Memory','File Systems','Disk Scheduling','I/O Systems'],
  'os':['Process Management','Threads','CPU Scheduling','Deadlocks','Memory Management','Paging','Virtual Memory','File Systems'],
  'dbms':['ER Model','Relational Model','SQL Basics','Joins','Normalization','Transactions','ACID Properties','Indexing','B+ Trees','Concurrency Control','Recovery'],
  'oops':['Classes & Objects','Encapsulation','Inheritance','Polymorphism','Abstraction','Interfaces','Design Patterns','SOLID Principles'],
  'system design':['Scalability Basics','Load Balancing','Caching','Database Sharding','CAP Theorem','Microservices','Message Queues','CDN','URL Shortener Design','Chat System Design'],
  'arrays':['Two Pointer','Sliding Window','Prefix Sum','Kadane\'s Algorithm','Sorting Problems','Binary Search on Array'],
  'graphs':['BFS','DFS','Dijkstra','Bellman Ford','Floyd Warshall','Topological Sort','Minimum Spanning Tree','Cycle Detection','Bipartite Check'],
  'trees':['Tree Traversals','Binary Search Tree','AVL Tree','Segment Tree','Fenwick Tree','Trie','Lowest Common Ancestor'],
  'linked list':['Singly Linked List','Doubly Linked List','Reverse Linked List','Detect Cycle','Merge Two Lists','LRU Cache'],
  'sorting':['Bubble Sort','Selection Sort','Insertion Sort','Merge Sort','Quick Sort','Heap Sort','Counting Sort','Radix Sort'],
  'recursion':['Base Cases','Recursive Thinking','Backtracking','N-Queens','Subset Sum','Permutations','Combinations'],
  'stack':['Stack Implementation','Balanced Parentheses','Next Greater Element','Min Stack','Infix to Postfix','Stock Span'],
  'queue':['Queue Implementation','Circular Queue','Deque','Priority Queue','BFS using Queue','Sliding Window Maximum'],
  'strings':['String Matching','KMP Algorithm','Rabin-Karp','Longest Palindromic Substring','Anagram Problems','String Hashing'],
  'dsa':['Arrays','Strings','Linked Lists','Stacks','Queues','Trees','Graphs','Dynamic Programming','Greedy','Backtracking','Bit Manipulation'],
  'exercise':['Warm-up Stretching','Cardio Session','Basketball Practice','Strength Training','Cool-down','Yoga Session','Running','Skipping Rope'],
  'basketball':['Dribbling Drills','Shooting Practice','Layup Training','Free Throw Practice','Defensive Drills','Game Simulation'],
  'core subjects':['Operating Systems','DBMS','Computer Networks','Theory of Computation','Compiler Design','Digital Logic'],
  'computer networks':['OSI Model','TCP/IP','HTTP/HTTPS','DNS','Routing','Subnetting','TCP vs UDP','Network Security','Sockets','REST APIs'],
  'design':['UI/UX Basics','Figma Practice','Color Theory','Typography','Wireframing','Prototyping','OOP Design Patterns','SOLID Principles','System Design','Low Level Design','High Level Design'],
  'ui design':['Figma Basics','Color Palette Design','Component Design','Responsive Layouts','Design Systems','Accessibility'],
  'communication':['Self Introduction','Tell Me About Yourself','Strengths & Weaknesses','Why This Company','Behavioral Questions','STAR Method','Body Language','Email Writing','Mock Interview Prep'],
  'mock interview':['Self Introduction','Technical Questions','Behavioral Questions','System Design Round','HR Round','Feedback Analysis'],
  'aptitude':['Number System','Percentages','Profit & Loss','Time & Work','Time & Distance','Probability','Permutation & Combination','Logical Reasoning','Data Interpretation','Verbal Reasoning'],
  'projects':['Requirements Analysis','UI Mockup','Frontend Setup','API Design','Database Schema','Authentication Module','Testing','Deployment','Documentation']
};

const MOTIVATION_TIPS=[
  "💡 Focus on understanding concepts, not just solving problems. Pattern recognition comes from deep understanding.",
  "🎯 Set a target of solving at least 2-3 problems daily. Consistency beats intensity.",
  "📚 Revise previously solved problems every week. Spaced repetition improves retention.",
  "🏃 Don't compare your pace with others. Your journey is unique.",
  "⏰ Study in focused blocks of 45-90 minutes with short breaks. Your brain needs rest to consolidate.",
  "📝 Maintain a problem-solving journal. Write down approaches and learnings.",
  "🤝 Explain concepts to someone else. Teaching is the best way to learn.",
  "🔄 If stuck on a problem for 30+ minutes, look at the hint/approach, then solve it yourself.",
  "🎪 Mock interviews are crucial. Practice under timed conditions at least twice a week.",
  "💪 Remember: Every expert was once a beginner. Trust the process and keep showing up."
];

function aiSuggestForSubtask(){
  const t=tasks.find(x=>x.id===subtaskParentId);if(!t)return;
  const title=t.title.toLowerCase();
  let suggestions=null;
  for(const[key,subs]of Object.entries(AI_SUBTASKS)){
    if(title.includes(key)){suggestions=subs;break}
  }
  if(!suggestions){toast('No suggestions found for this topic. Add subtasks manually.','info');return}
  if(!t.subtasks)t.subtasks=[];
  const existing=t.subtasks.map(s=>s.title.toLowerCase());
  let added=0;
  suggestions.forEach(s=>{
    if(!existing.includes(s.toLowerCase())){t.subtasks.push({title:s,done:false});added++}
  });
  saveTasks();renderSubtasks();
  toast(added?`Added ${added} suggested subtasks! 🤖`:'All suggestions already added.','success');
}

function setupAI(){
  document.getElementById('aiSubtaskBtn').addEventListener('click',()=>{
    const inp=document.getElementById('aiSubtaskInput').value.trim().toLowerCase();
    if(!inp){toast('Enter a topic','error');return}
    let subs=null;
    for(const[key,val]of Object.entries(AI_SUBTASKS)){if(inp.includes(key)||key.includes(inp)){subs=val;break}}
    const res=document.getElementById('aiSubtaskResult');
    if(subs){
      res.innerHTML='<strong>Suggested subtasks:</strong><ul>'+subs.map(s=>`<li>${s}</li>`).join('')+'</ul>';
    }else{
      res.innerHTML='<p>No specific suggestions found. Try describing a topic like: Project Planning, Fitness, Study, etc.</p>';
    }
  });

  document.getElementById('aiScheduleBtn').addEventListener('click',()=>{
    const hrs=parseInt(document.getElementById('aiScheduleHours').value)||8;
    const userCats=categories.length?categories:['General'];
    const blocks=userCats.map(cat=>({cat,pct:1/userCats.length}));
    let start=7,html='<strong>Suggested Schedule ('+hrs+'h):</strong><ul>';
    blocks.forEach(b=>{
      const dur=Math.round(hrs*b.pct*60);
      if(dur<15)return;
      const end=start+dur/60;
      html+=`<li>${fmtHour(start)} – ${fmtHour(end)} → <strong>${b.cat}</strong> (${fmtDur(dur)})</li>`;
      start=end+.25;
    });
    html+='</ul>';
    document.getElementById('aiScheduleResult').innerHTML=html;
  });

  document.getElementById('aiFocusBtn').addEventListener('click',()=>{
    const catCounts={};
    categories.forEach(c=>{
      const total=tasks.filter(t=>t.category===c).length;
      const done=tasks.filter(t=>t.category===c&&t.status==='completed').length;
      catCounts[c]={total,done,pct:total?Math.round(done/total*100):100};
    });
    const sorted=Object.entries(catCounts).filter(([,v])=>v.total>0).sort((a,b)=>a[1].pct-b[1].pct);
    const res=document.getElementById('aiFocusResult');
    if(!sorted.length){res.innerHTML='<p>No tasks yet. Add tasks to get focus suggestions.</p>';return}
    let html='<strong>Focus Priority (lowest completion first):</strong><ol>';
    sorted.slice(0,5).forEach(([cat,v])=>{
      html+=`<li><strong>${cat}</strong> — ${v.pct}% (${v.done}/${v.total})</li>`;
    });
    html+='</ol>';
    res.innerHTML=html;
  });

  document.getElementById('aiMotivationBtn').addEventListener('click',()=>{
    const tip=MOTIVATION_TIPS[Math.floor(Math.random()*MOTIVATION_TIPS.length)];
    document.getElementById('aiMotivationResult').innerHTML='<p>'+tip+'</p>';
  });

  // Gemini AI Planner
  document.getElementById('aiGeminiBtn').addEventListener('click',async()=>{
    const apiKey=LS.get('gemini_key','');
    const prompt=document.getElementById('aiGeminiInput').value.trim();
    const scope=document.getElementById('aiGeminiScope').value;
    const hours=document.getElementById('aiGeminiHours').value||8;
    const res=document.getElementById('aiGeminiResult');
    if(!prompt){toast('Describe what you want to plan','error');return}
    if(!apiKey){
      res.innerHTML='<p style="color:var(--danger)">⚠️ Please add your Gemini API key in <strong>Settings → AI Integration</strong> first.</p>';
      return;
    }
    res.innerHTML='<p>⏳ Planning with AI...</p>';
    const today=todayStr();
    const userCats=categories.length?categories.join(', '):'General';
    const systemPrompt=`You are a smart task planner assistant. The user wants to plan their day.
Categories available: ${userCats}.
Scope: ${scope}. Hours available per day: ${hours}. Today's date: ${today}.
Return ONLY a JSON array of task objects. Each task must have: title, category (from the categories listed above), startTime (HH:MM 24h format), endTime (HH:MM 24h format), priority (high/medium/low), date (YYYY-MM-DD format).
${scope==='today'?'Plan for today only.':scope==='week'?'Plan for 7 days starting from today.':'Plan for 30 days starting from today.'}
User request: ${prompt}`;
    try{
      // Retry logic for rate limits (429)
      let response=null;const maxRetries=3;const delays=[3000,6000,12000];
      for(let attempt=0;attempt<=maxRetries;attempt++){
        response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({contents:[{parts:[{text:systemPrompt}]}],generationConfig:{temperature:0.7}})
        });
        if(response.status===429&&attempt<maxRetries){
          const waitSec=delays[attempt]/1000;
          res.innerHTML=`<p>⏳ Rate limited by Google. Retrying in ${waitSec}s... (attempt ${attempt+2}/${maxRetries+1})</p>`;
          await new Promise(r=>setTimeout(r,delays[attempt]));
          continue;
        }
        break;
      }
      if(!response.ok){
        if(response.status===429)throw new Error('Rate limit exceeded. Google\'s free tier allows ~15 requests/min. Please wait a minute and try again.');
        if(response.status===400)throw new Error('Invalid API key. Please check your key in Settings → AI Integration.');
        throw new Error('API error: '+response.status);
      }
      const data=await response.json();
      const text=data.candidates?.[0]?.content?.parts?.[0]?.text||'';
      // Extract JSON from response
      const jsonMatch=text.match(/\[[\s\S]*\]/);
      if(!jsonMatch)throw new Error('Could not parse AI response. Try rephrasing your request.');
      const aiTasks=JSON.parse(jsonMatch[0]);
      let html='<strong>✨ AI Generated Plan ('+aiTasks.length+' tasks):</strong>';
      aiTasks.forEach((t,i)=>{
        const color=getCatColor(t.category);
        html+=`<div class="ai-plan-task"><div><strong>${t.title}</strong><br><span style="font-size:.75rem;color:var(--text3)">${t.category} · ${t.startTime}–${t.endTime} · ${t.date} · ${t.priority}</span></div></div>`;
      });
      html+=`<button class="ai-add-plan-btn" id="addAiPlanBtn">✅ Add All ${aiTasks.length} Tasks to Planner</button>`;
      res.innerHTML=html;
      document.getElementById('addAiPlanBtn').addEventListener('click',()=>{
        aiTasks.forEach(t=>{
          const[sh,sm]=(t.startTime||'08:00').split(':').map(Number);
          const[eh,em]=(t.endTime||'09:00').split(':').map(Number);
          tasks.push({
            id:uid(),title:t.title,category:t.category||categories[0]||'General',date:t.date||today,
            priority:t.priority||'medium',startTime:t.startTime||'',endTime:t.endTime||'',
            duration:Math.max(0,(eh*60+em)-(sh*60+sm)),status:'pending',notes:'Generated by AI',
            source:'',subtasks:[],createdAt:new Date().toISOString()
          });
        });
        saveTasks();toast(`Added ${aiTasks.length} tasks to planner! 🚀`,'success');
        document.getElementById('addAiPlanBtn').textContent='✅ Added!';
        document.getElementById('addAiPlanBtn').disabled=true;
      });
    }catch(err){
      res.innerHTML=`<p style="color:var(--danger)">❌ ${err.message}</p><p style="font-size:.82rem;color:var(--text3)">💡 Tip: Wait ~60 seconds between requests on the free tier, or upgrade to a paid plan at <a href="https://aistudio.google.com" target="_blank">Google AI Studio</a>.</p>`;
    }
  });
}

function fmtHour(h){
  const hr=Math.floor(h);const mn=Math.round((h-hr)*60);
  const ampm=hr>=12?'PM':'AM';const h12=hr>12?hr-12:(hr===0?12:hr);
  return h12+':'+(mn<10?'0':'')+mn+' '+ampm;
}

/* ========== CALENDAR ========== */
function setupCalendarNav(){
  document.querySelectorAll('[data-calview]').forEach(b=>{
    b.addEventListener('click',()=>{
      calView=b.dataset.calview;
      document.querySelectorAll('[data-calview]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      renderCalendar();
    });
  });
  document.getElementById('calPrev').addEventListener('click',()=>{navCal(-1)});
  document.getElementById('calNext').addEventListener('click',()=>{navCal(1)});
  document.getElementById('calToday').addEventListener('click',()=>{calDate=new Date();renderCalendar()});
}

function navCal(dir){
  if(calView==='daily')calDate.setDate(calDate.getDate()+dir);
  else if(calView==='weekly')calDate.setDate(calDate.getDate()+dir*7);
  else calDate.setMonth(calDate.getMonth()+dir);
  renderCalendar();
}

function renderCalendar(){
  const title=document.getElementById('calTitle');
  if(calView==='monthly'){
    title.textContent=calDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    renderMonthly();
  }else if(calView==='weekly'){
    title.textContent='Week of '+calDate.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    renderWeekly();
  }else{
    title.textContent=calDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    renderDaily();
  }
}

function renderMonthly(){
  const cont=document.getElementById('calendarContent');
  const y=calDate.getFullYear(),m=calDate.getMonth();
  const first=new Date(y,m,1),last=new Date(y,m+1,0);
  const startDay=first.getDay();
  const today=todayStr();
  let html='<div class="cal-month-grid">';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{html+=`<div class="cal-day-header">${d}</div>`});
  for(let i=0;i<startDay;i++){
    const d=new Date(y,m,0-startDay+i+1);
    html+=`<div class="cal-day other-month"><div class="cal-day-num">${d.getDate()}</div></div>`;
  }
  for(let d=1;d<=last.getDate();d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dt=tasks.filter(t=>t.date===ds);
    const done=dt.filter(t=>t.status==='completed').length;
    const isToday=ds===today;
    html+=`<div class="cal-day${isToday?' today':''}" data-date="${ds}">
      <div class="cal-day-num">${d}</div>
      ${dt.length?`<div class="cal-day-count">${done}/${dt.length} <span class="cal-day-done">✓</span></div>`:''}
    </div>`;
  }
  html+='</div>';
  cont.innerHTML=html;
  cont.querySelectorAll('.cal-day[data-date]').forEach(el=>{
    el.addEventListener('click',()=>{calDate=new Date(el.dataset.date+'T00:00:00');calView='daily';
      document.querySelectorAll('[data-calview]').forEach(x=>x.classList.remove('active'));
      document.querySelector('[data-calview="daily"]').classList.add('active');
      renderCalendar();
    });
  });
}

function renderWeekly(){
  const cont=document.getElementById('calendarContent');
  const d=new Date(calDate);d.setDate(d.getDate()-d.getDay());
  const today=todayStr();
  let html='<div class="cal-week-row">';
  for(let i=0;i<7;i++){
    const day=new Date(d);day.setDate(d.getDate()+i);
    const ds=localDateStr(day);
    const dt=tasks.filter(t=>t.date===ds);
    const isToday=ds===today;
    const dayName=day.toLocaleDateString('en-US',{weekday:'short'});
    html+=`<div class="cal-week-day${isToday?' today-col':''}">
      <h4>${dayName} <span class="cal-week-date">${day.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></h4>
      <div class="cal-timeline">`;
    if(dt.length){
      dt.sort((a,b)=>(a.startTime||'').localeCompare(b.startTime||'')).forEach(t=>{
        const time=t.startTime||'--:--';
        html+=`<div class="cal-timeline-item"><span class="cal-timeline-time">${to12h(time)}</span>
          <span class="task-badge badge-cat" style="background:${getCatColor(t.category)}22;color:${getCatColor(t.category)}">${esc(t.category)}</span>
          <span>${esc(t.title)}</span>
          <span class="task-badge badge-${t.status}" style="margin-left:auto">${t.status==='completed'?'✓':t.status}</span></div>`;
      });
    }else{html+='<div style="color:var(--text3);font-size:.85rem;padding:.3rem">No tasks</div>'}
    html+='</div></div>';
  }
  html+='</div>';
  cont.innerHTML=html;
}

/* ========== DAILY TIMELINE (Google Calendar Style) ========== */
function renderDaily(){
  const cont=document.getElementById('calendarContent');
  const ds=localDateStr(calDate);
  const dt=tasks.filter(t=>t.date===ds);
  const now=new Date();
  const isToday=ds===todayStr();
  const nowMins=now.getHours()*60+now.getMinutes();

  const START_HOUR=6,END_HOUR=23,HOUR_H=60; // px per hour
  const totalH=(END_HOUR-START_HOUR)*HOUR_H;

  // Build hour grid
  let html=`<div class="timeline-wrapper" style="position:relative;height:${totalH}px;margin-top:1rem">`;

  // Hour lines
  for(let h=START_HOUR;h<END_HOUR;h++){
    const top=(h-START_HOUR)*HOUR_H;
    const label=h===0?'12 AM':h<12?h+' AM':(h===12?'12 PM':(h-12)+' PM');
    html+=`<div class="tl-hour" style="top:${top}px"><span class="tl-hour-label">${label}</span><div class="tl-hour-line"></div></div>`;
  }

  // Current time indicator
  if(isToday&&nowMins>=START_HOUR*60&&nowMins<END_HOUR*60){
    const top=(nowMins-START_HOUR*60)/(END_HOUR-START_HOUR)/60*totalH;
    html+=`<div class="tl-now" style="top:${top}px"><div class="tl-now-dot"></div><div class="tl-now-line"></div></div>`;
  }

  // Task blocks
  dt.forEach(t=>{
    if(!t.startTime)return;
    const[sh,sm]=t.startTime.split(':').map(Number);
    let eh,em;
    if(t.endTime){[eh,em]=t.endTime.split(':').map(Number)}
    else{const dur=t.duration||60;eh=sh+Math.floor((sm+dur)/60);em=(sm+dur)%60}
    const startMin=sh*60+sm;
    const endMin=eh*60+em;
    const top=Math.max(0,(startMin-START_HOUR*60)/(END_HOUR-START_HOUR)/60*totalH);
    const height=Math.max(20,(endMin-startMin)/(END_HOUR-START_HOUR)/60*totalH);
    const color=getCatColor(t.category);
    const isActive=isToday&&nowMins>=startMin&&nowMins<endMin;
    const isDone=t.status==='completed';
    html+=`<div class="tl-block${isActive?' tl-active':''}${isDone?' tl-done':''}" style="top:${top}px;height:${height}px;--cat-color:${color}" data-id="${t.id}">
      <div class="tl-block-title">${esc(t.title)}</div>
      <div class="tl-block-meta">${to12h(t.startTime)}${t.endTime?' – '+to12h(t.endTime):''} · ${esc(t.category)}</div>
    </div>`;
  });

  html+='</div>';

  // Upcoming tasks & free slots
  if(isToday){
    const upcoming=dt.filter(t=>t.startTime&&t.startTime>String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'));
    if(upcoming.length){
      html+='<h4 style="margin-top:1rem">⏰ Upcoming</h4><div class="cal-timeline">';
      upcoming.sort((a,b)=>a.startTime.localeCompare(b.startTime)).forEach(t=>{
        html+=`<div class="cal-timeline-item"><span class="cal-timeline-time">${to12h(t.startTime)}</span><span>${esc(t.title)}</span></div>`;
      });
      html+='</div>';
    }

    // Free slots
    const scheduled=dt.filter(t=>t.startTime&&t.endTime).map(t=>({s:t.startTime,e:t.endTime})).sort((a,b)=>a.s.localeCompare(b.s));
    if(scheduled.length){
      html+='<h4 style="margin-top:1rem">🟢 Free Slots</h4><div class="cal-timeline">';
      let cursor='06:00';
      scheduled.forEach(sl=>{
        if(sl.s>cursor)html+=`<div class="cal-timeline-item" style="background:var(--success-bg)"><span class="cal-timeline-time">${to12h(cursor)} – ${to12h(sl.s)}</span><span>Free</span></div>`;
        if(sl.e>cursor)cursor=sl.e;
      });
      if(cursor<'23:00')html+=`<div class="cal-timeline-item" style="background:var(--success-bg)"><span class="cal-timeline-time">${to12h(cursor)} – 11:00 PM</span><span>Free</span></div>`;
      html+='</div>';
    }
  }

  // Unscheduled tasks
  const unscheduled=dt.filter(t=>!t.startTime);
  if(unscheduled.length){
    html+='<h4 style="margin-top:1rem">📌 Unscheduled Tasks</h4><div class="task-list">';
    cont.innerHTML=html+'</div>';
    const list=cont.querySelector('.task-list:last-child');
    unscheduled.forEach(t=>list.appendChild(createTaskCard(t)));
  }else{
    cont.innerHTML=html;
  }

  // Click on timeline blocks
  cont.querySelectorAll('.tl-block').forEach(el=>{
    el.addEventListener('click',()=>{openEditTask(el.dataset.id)});
  });
}

/* ========== ANALYTICS ========== */
function renderAnalytics(){
  const today=todayStr();
  const todayD=new Date(today+'T00:00:00');

  // Daily rate
  const dayTasks=tasks.filter(t=>t.date===today);
  const dayDone=dayTasks.filter(t=>t.status==='completed').length;
  const dayPct=dayTasks.length?Math.round(dayDone/dayTasks.length*100):0;
  setRing('rateDaily',dayPct);

  // Weekly rate
  const weekStart=new Date(todayD);weekStart.setDate(weekStart.getDate()-weekStart.getDay());
  let weekTotal=0,weekDone=0;
  for(let i=0;i<7;i++){
    const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);
    const ds=localDateStr(d);
    const dt=tasks.filter(t=>t.date===ds);
    weekTotal+=dt.length;weekDone+=dt.filter(t=>t.status==='completed').length;
  }
  setRing('rateWeekly',weekTotal?Math.round(weekDone/weekTotal*100):0);

  // Monthly rate
  const monthTasks=tasks.filter(t=>t.date&&t.date.slice(0,7)===today.slice(0,7));
  const monthDone=monthTasks.filter(t=>t.status==='completed').length;
  setRing('rateMonthly',monthTasks.length?Math.round(monthDone/monthTasks.length*100):0);

  // Category grid
  const grid=document.getElementById('analyticsCategoryGrid');grid.innerHTML='';
  categories.forEach(cat=>{
    const ct=tasks.filter(t=>t.category===cat);
    if(!ct.length)return;
    const done=ct.filter(t=>t.status==='completed').length;
    const pct=Math.round(done/ct.length*100);
    const mCt=monthTasks.filter(t=>t.category===cat);
    const mDone=mCt.filter(t=>t.status==='completed').length;
    const mPct=mCt.length?Math.round(mDone/mCt.length*100):0;
    grid.innerHTML+=`<div class="cat-progress-card">
      <h4>${cat}<span>${pct}%</span></h4>
      <div class="progress-bar-wrapper"><div class="progress-bar" style="width:${pct}%;background:linear-gradient(90deg,${getCatColor(cat)},${getCatColor(cat)}88)"></div></div>
      <div class="cat-stats"><span>✅ ${done}/${ct.length}</span><span>⏳ ${ct.length-done}</span></div>
      <div class="cat-stats" style="margin-top:.3rem"><span>📅 This month: ${mDone}/${mCt.length} (${mPct}%)</span></div>
    </div>`;
  });

  // 7-day completion chart
  renderCompletionChart();
  // Category bar chart
  renderCategoryBarChart();
}

function setRing(id,pct){
  const el=document.getElementById(id);
  const color=pct>=70?'var(--success)':pct>=40?'var(--warning)':'var(--danger)';
  el.style.borderColor=`${color} var(--bg3) var(--bg3) var(--bg3)`;
  if(pct>=25)el.style.borderColor=`${color} ${color} var(--bg3) var(--bg3)`;
  if(pct>=50)el.style.borderColor=`${color} ${color} ${color} var(--bg3)`;
  if(pct>=75)el.style.borderColor=color;
  el.querySelector('span').textContent=pct+'%';
}

function renderCompletionChart(){
  const cont=document.getElementById('completionChart');
  const today=new Date();
  let html='<div class="chart-bars">';
  let maxVal=1;
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date(today);d.setDate(today.getDate()-i);
    const ds=localDateStr(d);
    const done=tasks.filter(t=>t.date===ds&&t.status==='completed').length;
    const total=tasks.filter(t=>t.date===ds).length;
    if(total>maxVal)maxVal=total;
    days.push({label:d.toLocaleDateString('en-US',{weekday:'short'}),done,total});
  }
  days.forEach(d=>{
    const h=d.total?Math.round(d.done/maxVal*150):4;
    html+=`<div class="chart-bar-group"><div class="chart-bar-value">${d.done}/${d.total}</div><div class="chart-bar" style="height:${h}px"></div><div class="chart-bar-label">${d.label}</div></div>`;
  });
  html+='</div>';
  cont.innerHTML=html;
}

function renderCategoryBarChart(){
  const cont=document.getElementById('categoryBarChart');
  let html='<div class="chart-bars">';
  let maxVal=1;
  const data=[];
  categories.forEach(cat=>{
    const total=tasks.filter(t=>t.category===cat).length;
    const done=tasks.filter(t=>t.category===cat&&t.status==='completed').length;
    if(total>0){data.push({cat,total,done});if(total>maxVal)maxVal=total}
  });
  data.forEach(d=>{
    const h=Math.round(d.total/maxVal*150);
    html+=`<div class="chart-bar-group"><div class="chart-bar-value">${d.done}/${d.total}</div><div class="chart-bar" style="height:${h}px;background:linear-gradient(180deg,${getCatColor(d.cat)},${getCatColor(d.cat)}88)"></div><div class="chart-bar-label">${d.cat}</div></div>`;
  });
  html+='</div>';
  if(!data.length)html='<div class="empty-state"><div class="empty-icon">📊</div><h3>No data yet</h3><p>Complete tasks to see analytics.</p></div>';
  cont.innerHTML=html;
}
