const STORAGE_KEY = "paisatrack-v1";
const DEFAULT_DATA = {
  transactions: [
    {id:1,type:"income",amount:32000,category:"Salary",description:"Monthly allowance",date:dateOffset(0)},
    {id:2,type:"expense",amount:4500,category:"Food",description:"Groceries & meals",date:dateOffset(0)},
    {id:3,type:"expense",amount:1200,category:"Transport",description:"Travel expenses",date:dateOffset(-1)},
    {id:4,type:"expense",amount:899,category:"Shopping",description:"Daily essentials",date:dateOffset(-2)},
    {id:5,type:"income",amount:2500,category:"Other",description:"Freelance project",date:dateOffset(-4)}
  ],
  budget:15000,
  goals:[
    {id:1,name:"Emergency fund",target:25000,saved:8500},
    {id:2,name:"New laptop",target:60000,saved:18000}
  ]
};
let data = loadData();
let currentType = "expense";
let showAll = false;
let toastTimer;

function dateOffset(days){const d=new Date();d.setDate(d.getDate()+days);return localDate(d)}
function localDate(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return `${y}-${m}-${day}`}
function loadData(){try{const saved=localStorage.getItem(STORAGE_KEY);return saved?JSON.parse(saved):structuredClone(DEFAULT_DATA)}catch(e){return structuredClone(DEFAULT_DATA)}}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n||0)}
function parseDate(s){return new Date(`${s}T12:00:00`)}
function monthKey(s){return s.slice(0,7)}
function currentMonth(){return localDate(new Date()).slice(0,7)}
function monthTransactions(){return data.transactions.filter(t=>monthKey(t.date)===currentMonth())}
function totals(){const list=monthTransactions();const income=list.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);const expense=list.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);return {income,expense,savings:income-expense,balance:data.transactions.reduce((a,t)=>a+(t.type==="income"?t.amount:-t.amount),0)}}
function iconFor(category){return ({Food:"◒",Transport:"↗",Shopping:"◇",Bills:"▤",Health:"✚",Education:"▧",Entertainment:"♫",Salary:"↙",Business:"⌘",Other:"✦"})[category]||"•"}
function render(){
  const t=totals();$("totalBalance").textContent=money(t.balance);$("totalIncome").textContent=money(t.income);$("totalExpense").textContent=money(t.expense);$("monthlySavings").textContent=money(t.savings);
  $("budgetSpent").textContent=money(t.expense);$("budgetLimit").textContent=money(data.budget);
  const pct=data.budget>0?Math.min(100,t.expense/data.budget*100):0;
  $("budgetProgress").style.width=pct+"%";$("budgetProgress").style.background=pct>=100?"#e18c7e":"linear-gradient(90deg,#3caa70,#8de0aa)";
  $("budgetPercent").textContent=Math.round(pct)+"% used";$("budgetRemaining").textContent=money(Math.max(0,data.budget-t.expense))+" left";
  $("budgetMessage").textContent=pct>=100?"You’ve reached your budget limit. Review your spending.":pct>=80?"You’re close to your budget limit. Spend thoughtfully.":"You’re off to a good start. Keep tracking your expenses.";
  renderTransactions();renderGoals();drawChart();
}
function $(id){return document.getElementById(id)}
function renderTransactions(){
  const list=$("transactionList"),empty=$("emptyTransactions");
  const sorted=[...data.transactions].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  const shown=showAll?sorted:sorted.slice(0,5);list.innerHTML="";
  empty.hidden=shown.length>0;
  shown.forEach(t=>{
    const row=document.createElement("div");row.className="transaction-row";
    const icon=document.createElement("div");icon.className=`transaction-icon ${t.type}`;icon.textContent=iconFor(t.category);
    const info=document.createElement("div");const name=document.createElement("div");name.className="transaction-name";name.textContent=t.description;
    const meta=document.createElement("div");meta.className="transaction-meta";meta.textContent=`${t.category} · ${parseDate(t.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;info.append(name,meta);
    const right=document.createElement("div");const amount=document.createElement("div");amount.className=`transaction-amount ${t.type}`;amount.textContent=(t.type==="income"?"+":"−")+money(t.amount);const del=document.createElement("button");del.className="transaction-delete";del.textContent="Delete";del.setAttribute("aria-label","Delete "+t.description);del.onclick=()=>deleteTransaction(t.id);right.append(amount,del);row.append(icon,info,right);list.append(row);
  });
  $("viewAll").textContent=showAll?"Show recent ↑":"View all →";
}
function renderGoals(){
  const root=$("goalsList");root.innerHTML="";
  if(!data.goals.length){root.innerHTML='<div class="empty-state"><strong>No savings goals yet</strong><p>Create a goal to track your progress.</p></div>';return}
  data.goals.forEach(g=>{
    const pct=Math.min(100,g.target?g.saved/g.target*100:0);const item=document.createElement("div");item.className="goal-item";
    const top=document.createElement("div");top.className="goal-top";const name=document.createElement("strong");name.textContent=g.name;const amount=document.createElement("span");amount.textContent=Math.round(pct)+"%";top.append(name,amount);
    const track=document.createElement("div");track.className="goal-progress";const fill=document.createElement("span");fill.style.width=pct+"%";track.append(fill);
    const bottom=document.createElement("div");bottom.className="goal-bottom";const saved=document.createElement("span");saved.textContent=`${money(g.saved)} of ${money(g.target)}`;const remove=document.createElement("button");remove.textContent="Remove";remove.onclick=()=>{data.goals=data.goals.filter(x=>x.id!==g.id);saveData();render();notify("Savings goal removed")};bottom.append(saved,remove);item.append(top,track,bottom);root.append(item);
  });
}
function deleteTransaction(id){data.transactions=data.transactions.filter(t=>t.id!==id);saveData();render();notify("Transaction deleted")}
function notify(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300)}
function openModal(id){$(id).showModal()}
function closeModal(id){$(id).close()}
function setType(type){currentType=type;document.querySelectorAll(".type-option").forEach(b=>b.classList.toggle("selected",b.dataset.type===type));populateCategories()}
function populateCategories(){
  const options=currentType==="income"?["Salary","Business","Other"]:["Food","Transport","Shopping","Bills","Health","Education","Entertainment","Other"];
  $("category").innerHTML=options.map(x=>`<option value="${x}">${x}</option>`).join("");
}
function addTransaction(e){
  e.preventDefault();const amount=Number($("amount").value);if(!Number.isFinite(amount)||amount<=0){notify("Enter a valid amount");return}
  data.transactions.push({id:Date.now(),type:currentType,amount,category:$("category").value,description:$("description").value.trim(),date:$("date").value});
  saveData();render();closeModal("transactionModal");$("transactionForm").reset();$("date").value=localDate(new Date());notify("Transaction saved successfully");
}
function drawChart(){
  const canvas=$("cashflowChart");const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const dpr=window.devicePixelRatio||1;canvas.width=rect.width*dpr;canvas.height=rect.height*dpr;
  const ctx=canvas.getContext("2d");ctx.scale(dpr,dpr);const w=rect.width,h=rect.height;
  const months=[];const now=new Date();for(let i=5;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);months.push({key:localDate(d).slice(0,7),label:d.toLocaleDateString("en-IN",{month:"short"})})}
  const vals=months.map(m=>{const ts=data.transactions.filter(t=>monthKey(t.date)===m.key);return {income:ts.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0),expense:ts.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0)}});
  const max=Math.max(1000,...vals.flatMap(v=>[v.income,v.expense]))*1.18;const left=34,right=8,top=10,bottom=25;const cw=w-left-right,ch=h-top-bottom;
  ctx.font="9px DM Sans, sans-serif";ctx.textAlign="right";ctx.fillStyle="#718078";ctx.strokeStyle="#26342c";ctx.lineWidth=1;
  for(let i=0;i<4;i++){const y=top+ch*i/3;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(w-right,y);ctx.stroke();const value=Math.round(max*(1-i/3));ctx.fillText(value>=100000?(value/100000).toFixed(1)+"L":value>=1000?(value/1000).toFixed(0)+"k":value.toString(),left-7,y+3)}
  const group=cw/months.length,barW=Math.min(13,group*.23);
  vals.forEach((v,i)=>{const center=left+group*(i+.5);const hi=v.income/max*ch,he=v.expense/max*ch;ctx.fillStyle="#72d59a";roundRect(ctx,center-barW-2,top+ch-hi,barW,hi,4);ctx.fillStyle="#c6a66d";roundRect(ctx,center+2,top+ch-he,barW,he,4);ctx.fillStyle="#819087";ctx.textAlign="center";ctx.fillText(months[i].label,center,h-6)});
}
function roundRect(ctx,x,y,w,h,r){if(h<1)return;ctx.beginPath();ctx.roundRect(x,y,w,Math.max(h,2),[r,r,0,0]);ctx.fill()}
function init(){
  $("todayLabel").textContent=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});$("year").textContent=new Date().getFullYear();$("date").value=localDate(new Date());
  $("openTransaction").onclick=()=>openModal("transactionModal");$("emptyAdd").onclick=()=>openModal("transactionModal");
  document.querySelectorAll(".type-option").forEach(b=>b.onclick=()=>setType(b.dataset.type));
  $("transactionForm").addEventListener("submit",addTransaction);
  $("viewAll").onclick=e=>{e.preventDefault();showAll=!showAll;renderTransactions()};
  $("editBudget").onclick=()=>{$("budgetInput").value=data.budget;openModal("budgetModal")};
  $("budgetForm").onsubmit=e=>{e.preventDefault();const n=Number($("budgetInput").value);if(n<=0)return;data.budget=n;saveData();render();closeModal("budgetModal");notify("Budget updated")};
  $("addGoal").onclick=()=>openModal("goalModal");
  $("goalForm").onsubmit=e=>{e.preventDefault();const target=Number($("goalTarget").value),saved=Number($("goalSaved").value);if(target<=0||saved<0)return;data.goals.push({id:Date.now(),name:$("goalName").value.trim(),target,saved});saveData();render();closeModal("goalModal");$("goalForm").reset();notify("Savings goal created")};
  document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
  $("menuToggle").onclick=()=>$("sidebar").classList.toggle("open");
  document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>$("sidebar").classList.remove("open")));
  window.addEventListener("resize",drawChart);
  populateCategories();render();
}
document.addEventListener("DOMContentLoaded",init);
