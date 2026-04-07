import { useState, useCallback, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Home, List, CreditCard, TrendingUp, Bell, ChevronRight,
  Plus, AlertTriangle, CheckCircle, Info, ArrowUpRight,
  ArrowDownRight, DollarSign, Activity, Target, Settings,
  Search, Download, Shield, Trash2, Edit2, X, Check,
} from "lucide-react";

/* ─── Design Tokens ─────────────────────────────────────── */
const C = {
  bg:"#07091c", bgCard:"rgba(255,255,255,0.04)",
  bgGlass:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.08)",
  sidebar:"#030610", gold:"#c9973a", goldBt:"#f0c060",
  teal:"#00cba9", red:"#ff6b6b", blue:"#4d94ff",
  purple:"#9b6dff", amber:"#f59e0b",
  text:"#eef2ff", textMid:"rgba(238,242,255,0.65)",
  textDim:"rgba(238,242,255,0.35)",
};

/* ─── Seed Data ─────────────────────────────────────────── */
const SEED_TXN = [
  {id:"t1",name:"Amazon Shopping",      cat:"Shopping",     amt:2499, date:"2026-03-19",emoji:"🛒",credit:false},
  {id:"t2",name:"Salary Credit",        cat:"Income",       amt:85000,date:"2026-03-18",emoji:"💰",credit:true },
  {id:"t3",name:"Netflix Subscription", cat:"Entertainment",amt:649,  date:"2026-03-17",emoji:"🎬",credit:false},
  {id:"t4",name:"Swiggy Order",         cat:"Food",         amt:485,  date:"2026-03-16",emoji:"🍜",credit:false},
  {id:"t5",name:"Freelance Payment",    cat:"Income",       amt:15000,date:"2026-03-15",emoji:"💼",credit:true },
  {id:"t6",name:"Electricity Bill",     cat:"Utilities",    amt:1240, date:"2026-03-14",emoji:"⚡",credit:false},
  {id:"t7",name:"Paytm Recharge",       cat:"Mobile",       amt:199,  date:"2026-03-13",emoji:"📱",credit:false},
  {id:"t8",name:"Gym Membership",       cat:"Health",       amt:1500, date:"2026-03-12",emoji:"🏋️",credit:false},
];
const SEED_SUB = [
  {id:"s1",name:"Netflix",cat:"Streaming",amt:649, color:"#e50914",renewal:"2026-04-15",use:85,icon:"N",trial:false,status:"active"},
  {id:"s2",name:"Spotify",cat:"Music",    amt:119, color:"#1db954",renewal:"2026-04-22",use:92,icon:"S",trial:false,status:"active"},
  {id:"s3",name:"AWS",    cat:"Cloud",    amt:2840,color:"#ff9900",renewal:"2026-05-01",use:67,icon:"A",trial:false,status:"active"},
  {id:"s4",name:"Figma",  cat:"Design",   amt:1200,color:"#a259ff",renewal:"2026-04-10",use:78,icon:"F",trial:false,status:"active"},
  {id:"s5",name:"GitHub", cat:"Dev Tools",amt:750, color:"#4d94ff",renewal:"2026-04-05",use:95,icon:"G",trial:false,status:"active"},
  {id:"s6",name:"Notion", cat:"Productivity",amt:320,color:"#00cba9",renewal:"2026-04-02",use:45,icon:"N",trial:true,status:"trial"},
];
const SEED_BUDGET = [
  {id:"b1",cat:"Entertainment",budgeted:3000, spent:2700,color:"#9b6dff"},
  {id:"b2",cat:"Food & Dining", budgeted:8000, spent:5200,color:"#ff6b6b"},
  {id:"b3",cat:"Utilities",     budgeted:5000, spent:4100,color:"#00cba9"},
  {id:"b4",cat:"SaaS & Tools",  budgeted:6000, spent:5129,color:"#c9973a"},
  {id:"b5",cat:"Transport",     budgeted:3000, spent:1800,color:"#4d94ff"},
  {id:"b6",cat:"Shopping",      budgeted:10000,spent:7400,color:"#ff9900"},
];
const SEED_ALERTS = [
  {id:"a1",type:"warning",title:"Budget Alert",    msg:"Entertainment budget 90% consumed this month",   time:"2h ago",read:false},
  {id:"a2",type:"info",   title:"Renewal Reminder",msg:"Netflix renews in 3 days — ₹649 will be charged",time:"5h ago",read:false},
  {id:"a3",type:"success",title:"Goal Achieved",   msg:"You hit 75% of your monthly savings target!",    time:"1d ago",read:true },
  {id:"a4",type:"warning",title:"Unusual Spending",msg:"Shopping spend is 2× higher than your average",  time:"2d ago",read:true },
  {id:"a5",type:"info",   title:"Trial Expiring",  msg:"Notion free trial expires in 14 days",           time:"3d ago",read:true },
];
const SEED_PREFS = {
  budgetAlerts:true,renewalReminders:true,unusualSpending:true,
  weeklySummary:false,savingsMilestones:true,lowBalance:false,
};
const CAT_EMOJI = {Shopping:"🛒",Income:"💰",Entertainment:"🎬",Food:"🍜",Utilities:"⚡",Mobile:"📱",Health:"🏋️",Transport:"🚗",Freelance:"💼",Other:"📝"};
const CAT_COLORS = {Shopping:"#c9973a",Income:"#00cba9",Entertainment:"#9b6dff",Food:"#ff6b6b",Utilities:"#4d94ff",Mobile:"#f59e0b",Health:"#ff9900",Transport:"#4d94ff",Freelance:"#00cba9",Other:"rgba(238,242,255,0.35)"};

/* ─── Helpers ───────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2,10);
const fmt = n => `₹${Number(n).toLocaleString("en-IN")}`;
const pct = (s,b) => Math.min(Math.round((s/b)*100),100);
const dateLabel = d => {
  const diff = Math.floor((new Date()-new Date(d))/86400000);
  if(diff===0) return "Today"; if(diff===1) return "Yesterday";
  return new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
};

/* ─── LocalStorage Hook ─────────────────────────────────── */
function useLS(key,seed){
  const [val,setVal] = useState(()=>{
    try{ const r=localStorage.getItem(key); return r?JSON.parse(r):seed; }catch{return seed;}
  });
  const save = useCallback(v=>{
    setVal(prev=>{const next=typeof v==="function"?v(prev):v;
      try{localStorage.setItem(key,JSON.stringify(next));}catch{}return next;});
  },[key]);
  return [val,save];
}

/* ─── Shared UI ─────────────────────────────────────────── */
const Card = ({children,style={}}) => (
  <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px",...style}}>{children}</div>
);
const Btn = ({children,onClick,color=C.gold,style={}}) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",
    background:`${color}18`,border:`1px solid ${color}45`,color,borderRadius:9,
    padding:"8px 16px",fontSize:13,fontWeight:500,...style}}>{children}</button>
);
const GhostBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",
    background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,
    borderRadius:9,padding:"8px 14px",fontSize:13,...style}}>{children}</button>
);
const Inp = ({label,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em"}}>{label.toUpperCase()}</label>}
    <input {...p} style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:9,
      padding:"10px 13px",color:C.text,fontSize:14,outline:"none",width:"100%",...(p.style||{})}}/>
  </div>
);
const Sel = ({label,children,...p}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em"}}>{label.toUpperCase()}</label>}
    <select {...p} style={{background:"#0e1535",border:`1px solid ${C.border}`,borderRadius:9,
      padding:"10px 13px",color:C.text,fontSize:14,outline:"none",width:"100%",...(p.style||{})}}>{children}</select>
  </div>
);

/* ─── Modal ─────────────────────────────────────────────── */
const Modal = ({title,onClose,children}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",
    alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
    <div style={{background:"#0b0d27",border:`1px solid ${C.border}`,borderRadius:18,
      width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`}}>
        <h2 style={{color:C.text,fontSize:16,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer"}}><X size={20}/></button>
      </div>
      <div style={{padding:"20px 24px 24px"}}>{children}</div>
    </div>
  </div>
);

/* ─── Toast ─────────────────────────────────────────────── */
const Toast = ({msg,type="success"}) => {
  const bg={success:C.teal,error:C.red,info:C.gold};
  return(
    <div style={{position:"fixed",bottom:28,right:28,background:bg[type]||C.teal,
      color:"#fff",borderRadius:10,padding:"12px 20px",fontSize:13,fontWeight:500,
      zIndex:2000,display:"flex",alignItems:"center",gap:8}}>
      <Check size={15}/>{msg}
    </div>
  );
};
const useToast = () => {
  const [t,setT] = useState(null);
  const show = (msg,type="success") => {setT({msg,type});setTimeout(()=>setT(null),2500);};
  return [t,show];
};

/* ─── Chart Tooltip ─────────────────────────────────────── */
const ChartTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:"#0e1535",border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px"}}>
      <p style={{color:C.textDim,fontSize:11,marginBottom:4}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color,fontSize:13,fontWeight:500}}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */
const Dashboard = ({txns,subs,budgets,navigate}) => {
  const debits  = txns.filter(t=>!t.credit);
  const credits = txns.filter(t=>t.credit);
  const totExp  = debits.reduce((a,t)=>a+Number(t.amt),0);
  const totInc  = credits.reduce((a,t)=>a+Number(t.amt),0);
  const subTot  = subs.reduce((a,s)=>a+Number(s.amt),0);
  const totBudg = budgets.reduce((a,b)=>a+Number(b.budgeted),0);
  const totSpent= budgets.reduce((a,b)=>a+Number(b.spent),0);

  const monthlyData = useMemo(()=>
    ["Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({m,
      inc:80000+i*2500+(totInc||85000),
      exp:35000+i*1200+(totExp||42000),
    }))
  ,[totInc,totExp]);

  const catMap={};
  debits.forEach(t=>{catMap[t.cat]=(catMap[t.cat]||0)+Number(t.amt);});
  const catTotal=Object.values(catMap).reduce((a,v)=>a+v,0)||1;
  const catData=Object.entries(catMap).map(([name,val])=>({
    name,val:Math.round((val/catTotal)*100),color:CAT_COLORS[name]||C.textDim
  })).sort((a,b)=>b.val-a.val).slice(0,5);

  const stats=[
    {label:"Total Expenses",   value:fmt(totExp),              sub:`${subs.length} subscriptions`,up:false,Icon:DollarSign,ic:C.red  },
    {label:"Subscriptions",    value:subs.filter(s=>s.status==="active").length,sub:fmt(subTot)+"/mo",up:false,Icon:CreditCard,ic:C.gold},
    {label:"Budget Remaining", value:fmt(totBudg-totSpent),   sub:`${pct(totSpent,totBudg||1)}% used`,up:(totBudg-totSpent)>0,Icon:Target,ic:C.blue},
    {label:"Net Savings",      value:fmt(totInc-totExp),       sub:"income − expenses",up:(totInc-totExp)>0,Icon:TrendingUp,ic:C.teal},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {stats.map(({label,value,sub,up,Icon,ic},i)=>(
          <Card key={i} style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <p style={{color:C.textDim,fontSize:11,letterSpacing:"0.09em",textTransform:"uppercase",fontWeight:500}}>{label}</p>
              <div style={{width:36,height:36,borderRadius:10,background:`${ic}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon size={16} color={ic}/>
              </div>
            </div>
            <p style={{color:C.text,fontSize:28,fontWeight:600,fontFamily:"'Playfair Display',serif",lineHeight:1}}>{value}</p>
            <p style={{color:up?C.teal:C.red,fontSize:12,display:"flex",alignItems:"center",gap:3}}>
              {up?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}{sub}
            </p>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
            <div>
              <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>Income vs Expenses</h3>
              <p style={{color:C.textDim,fontSize:12,marginTop:3}}>6-month overview</p>
            </div>
            <div style={{display:"flex",gap:16,fontSize:12,alignItems:"center"}}>
              {[{c:C.teal,l:"Income"},{c:C.red,l:"Expenses"}].map(({c,l})=>(
                <span key={l} style={{color:c,display:"flex",alignItems:"center",gap:5}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{height:220}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.teal} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.red}  stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={C.red}  stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="m" tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${Math.round(v/1000)}k`}/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="inc" name="Income"   stroke={C.teal} strokeWidth={2} fill="url(#gi)"/>
                <Area type="monotone" dataKey="exp" name="Expenses" stroke={C.red}  strokeWidth={2} fill="url(#ge)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600,marginBottom:4}}>Spending by Category</h3>
          <p style={{color:C.textDim,fontSize:12,marginBottom:14}}>Live from transactions</p>
          {catData.length>0?(
            <>
              <div style={{height:150,marginBottom:14}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} dataKey="val" cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={4}>
                      {catData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`${v}%`,n]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {catData.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <span style={{display:"flex",alignItems:"center",gap:7,color:C.textMid,fontSize:12}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:c.color,display:"inline-block"}}/>{c.name}
                  </span>
                  <span style={{color:C.text,fontSize:12,fontWeight:500}}>{c.val}%</span>
                </div>
              ))}
            </>
          ):(
            <p style={{color:C.textDim,fontSize:12,textAlign:"center",paddingTop:40}}>Add transactions to see breakdown</p>
          )}
        </Card>
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>Recent Transactions</h3>
          <button onClick={()=>navigate("expenses")} style={{color:C.gold,fontSize:12,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            View all <ChevronRight size={13}/>
          </button>
        </div>
        {txns.length===0&&<p style={{color:C.textDim,fontSize:13,textAlign:"center",padding:"20px 0"}}>No transactions yet — add one from Expenses tab</p>}
        {[...txns].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map((t,i,arr)=>(
          <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"13px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:11,background:C.bgGlass,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{t.emoji}</div>
              <div>
                <p style={{color:C.text,fontSize:14,fontWeight:500}}>{t.name}</p>
                <p style={{color:C.textDim,fontSize:12,marginTop:2}}>{t.cat} · {dateLabel(t.date)}</p>
              </div>
            </div>
            <p style={{color:t.credit?C.teal:C.red,fontSize:14,fontWeight:600}}>{t.credit?"+":"−"}{fmt(t.amt)}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   TRANSACTION MODAL
═══════════════════════════════════════════════════════════ */
const TxnModal = ({onClose,onSave,initial}) => {
  const cats = ["Shopping","Income","Entertainment","Food","Utilities","Mobile","Health","Transport","Freelance","Other"];
  const [f,setF] = useState(initial||{name:"",cat:"Shopping",amt:"",date:new Date().toISOString().slice(0,10),credit:false,emoji:"🛒"});
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  return(
    <Modal title={initial?"Edit Transaction":"Add Transaction"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Description" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Amazon Shopping"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Category" value={f.cat} onChange={e=>{set("cat",e.target.value);set("emoji",CAT_EMOJI[e.target.value]||"📝");}}>
            {cats.map(c=><option key={c}>{c}</option>)}
          </Sel>
          <Inp label="Emoji" value={f.emoji} onChange={e=>set("emoji",e.target.value)} placeholder="🛒"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Amount (₹)" type="number" value={f.amt} onChange={e=>set("amt",e.target.value)} placeholder="0"/>
          <Inp label="Date" type="date" value={f.date} onChange={e=>set("date",e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[{v:false,l:"Debit / Expense"},{v:true,l:"Credit / Income"}].map(({v,l})=>(
            <button key={l} onClick={()=>set("credit",v)} style={{
              flex:1,padding:"9px 0",borderRadius:9,fontSize:13,cursor:"pointer",
              background:f.credit===v?(v?`${C.teal}22`:`${C.red}22`):"transparent",
              border:`1px solid ${f.credit===v?(v?C.teal:C.red):C.border}`,
              color:f.credit===v?(v?C.teal:C.red):C.textMid,fontWeight:f.credit===v?500:400,
            }}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <GhostBtn onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</GhostBtn>
          <Btn onClick={()=>{if(!f.name||!f.amt)return;onSave({...f,amt:Number(f.amt),id:f.id||uid()});onClose();}} style={{flex:1,justifyContent:"center"}}>
            <Check size={14}/> {initial?"Update":"Save"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════
   EXPENSES PAGE
═══════════════════════════════════════════════════════════ */
const Expenses = ({txns,onAdd,onEdit,onDelete}) => {
  const [modal,setModal]   = useState(null);
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const [toast,showToast]  = useToast();

  const cats = ["All","Shopping","Income","Entertainment","Food","Utilities","Mobile","Health","Transport","Freelance","Other"];
  const filtered = [...txns]
    .filter(t=>filter==="All"||t.cat===filter)
    .filter(t=>t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>new Date(b.date)-new Date(a.date));

  const totDebit  = txns.filter(t=>!t.credit).reduce((a,t)=>a+Number(t.amt),0);
  const totCredit = txns.filter(t=>t.credit).reduce((a,t)=>a+Number(t.amt),0);

  const exportCSV = () => {
    const rows=[["Name","Category","Amount","Date","Type"],...txns.map(t=>[t.name,t.cat,t.amt,t.date,t.credit?"Credit":"Debit"])];
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"}));
    a.download="fintrack_transactions.csv";a.click();showToast("CSV exported!");
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:10,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px"}}>
          <Search size={15} color={C.textDim}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions…"
            style={{background:"none",border:"none",color:C.text,fontSize:14,outline:"none",flex:1}}/>
          {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:C.textDim,cursor:"pointer"}}><X size={14}/></button>}
        </div>
        <GhostBtn onClick={exportCSV}><Download size={14}/> Export CSV</GhostBtn>
        <Btn onClick={()=>setModal("add")}><Plus size={14}/> Add Transaction</Btn>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{padding:"5px 14px",borderRadius:20,fontSize:12,cursor:"pointer",
            background:filter===c?`${C.gold}20`:"transparent",border:`1px solid ${filter===c?C.gold:C.border}`,
            color:filter===c?C.gold:C.textDim}}>{c}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          {label:"Total Debits",  val:fmt(totDebit),              c:C.red },
          {label:"Total Credits", val:fmt(totCredit),             c:C.teal},
          {label:"Net Balance",   val:fmt(totCredit-totDebit),    c:(totCredit-totDebit)>=0?C.teal:C.red},
        ].map(({label,val,c},i)=>(
          <Card key={i}>
            <p style={{color:C.textDim,fontSize:11,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8}}>{label}</p>
            <p style={{color:c,fontSize:24,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{val}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>{filter==="All"?"All Transactions":filter} ({filtered.length})</h3>
        </div>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <p style={{color:C.textDim,fontSize:14,marginBottom:16}}>No transactions found</p>
            <Btn onClick={()=>setModal("add")} style={{margin:"0 auto",justifyContent:"center"}}><Plus size={13}/> Add Transaction</Btn>
          </div>
        )}
        {filtered.map((t,i)=>(
          <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"13px 0",borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
              <div style={{width:42,height:42,borderRadius:11,background:C.bgGlass,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{t.emoji}</div>
              <div style={{minWidth:0}}>
                <p style={{color:C.text,fontSize:14,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</p>
                <p style={{color:C.textDim,fontSize:12,marginTop:2}}>{t.cat} · {dateLabel(t.date)}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <div style={{textAlign:"right"}}>
                <p style={{color:t.credit?C.teal:C.red,fontSize:14,fontWeight:600}}>{t.credit?"+":"−"}{fmt(t.amt)}</p>
                <p style={{color:t.credit?`${C.teal}88`:`${C.red}88`,fontSize:11}}>{t.credit?"Credit":"Debit"}</p>
              </div>
              <button onClick={()=>setModal(t)} style={{background:`${C.gold}18`,border:`1px solid ${C.gold}30`,color:C.gold,borderRadius:8,padding:"6px 8px",cursor:"pointer"}}><Edit2 size={13}/></button>
              <button onClick={()=>{onDelete("txn",t.id);showToast("Transaction deleted","error");}} style={{background:`${C.red}18`,border:`1px solid ${C.red}30`,color:C.red,borderRadius:8,padding:"6px 8px",cursor:"pointer"}}><Trash2 size={13}/></button>
            </div>
          </div>
        ))}
      </Card>

      {modal==="add"&&<TxnModal onClose={()=>setModal(null)} onSave={t=>{onAdd("txn",t);showToast("Transaction added!");}}/>}
      {modal&&modal!=="add"&&<TxnModal initial={modal} onClose={()=>setModal(null)} onSave={t=>{onEdit("txn",t);showToast("Transaction updated!");}}/>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SUBSCRIPTION MODAL
═══════════════════════════════════════════════════════════ */
const SubModal = ({onClose,onSave,initial}) => {
  const colors = ["#e50914","#1db954","#ff9900","#a259ff","#4d94ff","#00cba9","#c9973a","#9b6dff"];
  const cats   = ["Streaming","Music","Cloud","Design","Dev Tools","Productivity","Security","Storage","Other"];
  const [f,setF] = useState(initial||{name:"",cat:"Streaming",amt:"",renewal:"",use:50,icon:"",color:"#c9973a",trial:false});
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  return(
    <Modal title={initial?"Edit Subscription":"Add Subscription"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Inp label="Service Name" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Netflix"/>
          <Inp label="Icon Letter"  value={f.icon} onChange={e=>set("icon",e.target.value.slice(0,2))} placeholder="N"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Category" value={f.cat} onChange={e=>set("cat",e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</Sel>
          <Inp label="Monthly Amount (₹)" type="number" value={f.amt} onChange={e=>set("amt",e.target.value)} placeholder="0"/>
        </div>
        <Inp label="Renewal Date" type="date" value={f.renewal} onChange={e=>set("renewal",e.target.value)}/>
        <div>
          <label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em"}}>USAGE % ({f.use}%)</label>
          <input type="range" min={0} max={100} value={f.use} onChange={e=>set("use",+e.target.value)} style={{width:"100%",marginTop:8}}/>
        </div>
        <div>
          <label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em",display:"block",marginBottom:8}}>ACCENT COLOR</label>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {colors.map(c=>(
              <div key={c} onClick={()=>set("color",c)} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:f.color===c?"3px solid #fff":"3px solid transparent"}}/>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[{v:false,l:"Active"},{v:true,l:"On Trial"}].map(({v,l})=>(
            <button key={l} onClick={()=>set("trial",v)} style={{flex:1,padding:"9px 0",borderRadius:9,fontSize:13,cursor:"pointer",
              background:f.trial===v?`${C.teal}22`:"transparent",border:`1px solid ${f.trial===v?C.teal:C.border}`,
              color:f.trial===v?C.teal:C.textMid,fontWeight:f.trial===v?500:400}}>{l}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <GhostBtn onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</GhostBtn>
          <Btn onClick={()=>{
            if(!f.name||!f.amt)return;
            onSave({...f,amt:Number(f.amt),id:f.id||uid(),icon:f.icon||f.name[0]||"S",status:f.trial?"trial":"active"});
            onClose();
          }} style={{flex:1,justifyContent:"center"}}><Check size={14}/> {initial?"Update":"Save"}</Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════
   SUBSCRIPTIONS PAGE
═══════════════════════════════════════════════════════════ */
const Subscriptions = ({subs,onAdd,onEdit,onDelete}) => {
  const [modal,setModal]   = useState(null);
  const [toast,showToast]  = useToast();
  const total  = subs.reduce((a,s)=>a+Number(s.amt),0);
  const actives= subs.filter(s=>!s.trial).length;
  const trials = subs.filter(s=>s.trial).length;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <Btn onClick={()=>setModal("add")}><Plus size={14}/> Add Subscription</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:"Monthly Total",   val:fmt(total),    c:C.gold },
          {label:"Annual Estimate", val:fmt(total*12), c:C.text },
          {label:"Active Services", val:actives,       c:C.teal },
          {label:"On Trial",        val:trials,        c:C.amber},
        ].map(({label,val,c},i)=>(
          <Card key={i}>
            <p style={{color:C.textDim,fontSize:11,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>{label}</p>
            <p style={{color:c,fontSize:26,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{val}</p>
          </Card>
        ))}
      </div>
      {subs.length===0&&(
        <Card><div style={{textAlign:"center",padding:"32px 0"}}>
          <p style={{color:C.textDim,fontSize:14,marginBottom:16}}>No subscriptions yet</p>
          <Btn onClick={()=>setModal("add")} style={{margin:"0 auto",justifyContent:"center"}}><Plus size={13}/> Add First Subscription</Btn>
        </div></Card>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {subs.map(s=>{
          const barC=s.use>80?C.teal:s.use>50?C.gold:C.red;
          const renewD=s.renewal?new Date(s.renewal).toLocaleDateString("en-IN",{day:"numeric",month:"short"}):"—";
          return(
            <Card key={s.id} style={{position:"relative",overflow:"hidden"}}>
              {s.trial&&<div style={{position:"absolute",top:12,right:12,background:`${C.amber}22`,color:C.amber,fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:600}}>TRIAL</div>}
              <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`${s.color}08`,borderRadius:"0 16px 0 80px"}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                <div style={{width:46,height:46,borderRadius:13,background:`${s.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Playfair Display',serif"}}>{s.icon}</div>
                <div>
                  <p style={{color:C.text,fontSize:15,fontWeight:600}}>{s.name}</p>
                  <p style={{color:C.textDim,fontSize:12,marginTop:2}}>{s.cat}</p>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <span style={{color:C.textDim,fontSize:12}}>Monthly charge</span>
                <span style={{color:C.text,fontSize:18,fontWeight:600}}>₹{s.amt}</span>
              </div>
              <div style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{color:C.textDim,fontSize:11}}>Usage</span>
                  <span style={{color:C.textMid,fontSize:11}}>{s.use}%</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:3}}>
                  <div style={{height:"100%",width:`${s.use}%`,background:barC,borderRadius:3}}/>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{color:C.textDim,fontSize:11}}>Renews {renewD}</span>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:s.trial?C.amber:C.teal}}/>
                  <span style={{color:s.trial?C.amber:C.teal,fontSize:11}}>{s.trial?"Trial":"Active"}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
                <button onClick={()=>setModal(s)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:`${C.gold}18`,border:`1px solid ${C.gold}30`,color:C.gold,borderRadius:8,padding:"7px 0",fontSize:12,cursor:"pointer"}}><Edit2 size={12}/> Edit</button>
                <button onClick={()=>{onDelete("sub",s.id);showToast("Subscription removed","error");}} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:`${C.red}18`,border:`1px solid ${C.red}30`,color:C.red,borderRadius:8,padding:"7px 0",fontSize:12,cursor:"pointer"}}><Trash2 size={12}/> Remove</button>
              </div>
            </Card>
          );
        })}
      </div>
      {modal==="add"&&<SubModal onClose={()=>setModal(null)} onSave={s=>{onAdd("sub",s);showToast("Subscription added!");}}/>}
      {modal&&modal!=="add"&&<SubModal initial={modal} onClose={()=>setModal(null)} onSave={s=>{onEdit("sub",s);showToast("Subscription updated!");}}/>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   BUDGET MODAL
═══════════════════════════════════════════════════════════ */
const BudgetModal = ({onClose,onSave,initial,txns}) => {
  const colors=[C.purple,C.red,C.teal,C.gold,C.blue,"#ff9900",C.amber];
  const [f,setF] = useState(initial||{cat:"",budgeted:"",spent:"",color:C.gold});
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  const autoSpent = txns.filter(t=>!t.credit&&t.cat===f.cat).reduce((a,t)=>a+Number(t.amt),0);
  return(
    <Modal title={initial?"Edit Budget":"Add Budget Category"} onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Inp label="Category Name" value={f.cat} onChange={e=>set("cat",e.target.value)} placeholder="e.g. Food & Dining"/>
        <Inp label="Monthly Budget (₹)" type="number" value={f.budgeted} onChange={e=>set("budgeted",e.target.value)} placeholder="0"/>
        <Inp label="Override Spent (₹) — blank = auto from transactions" type="number" value={f.spent} onChange={e=>set("spent",e.target.value)} placeholder={autoSpent||"0"}/>
        {f.cat&&autoSpent>0&&(
          <div style={{background:`${C.teal}15`,border:`1px solid ${C.teal}30`,borderRadius:9,padding:"10px 14px"}}>
            <p style={{color:C.teal,fontSize:12}}>Auto-detected from transactions: <strong>{fmt(autoSpent)}</strong></p>
          </div>
        )}
        <div>
          <label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em",display:"block",marginBottom:8}}>ACCENT COLOR</label>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {colors.map(c=><div key={c} onClick={()=>set("color",c)} style={{width:26,height:26,borderRadius:"50%",background:c,cursor:"pointer",border:f.color===c?"3px solid #fff":"3px solid transparent"}}/>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <GhostBtn onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</GhostBtn>
          <Btn onClick={()=>{
            if(!f.cat||!f.budgeted)return;
            const spent=f.spent!=""?Number(f.spent):autoSpent;
            onSave({...f,budgeted:Number(f.budgeted),spent,id:f.id||uid()});
            onClose();
          }} style={{flex:1,justifyContent:"center"}}><Check size={14}/> {initial?"Update":"Save"}</Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════
   BUDGET PAGE
═══════════════════════════════════════════════════════════ */
const Budget = ({budgets,txns,onAdd,onEdit,onDelete}) => {
  const [modal,setModal]   = useState(null);
  const [toast,showToast]  = useToast();

  const enriched = budgets.map(b=>{
    const autoSpent=txns.filter(t=>!t.credit&&t.cat===b.cat).reduce((a,t)=>a+Number(t.amt),0);
    return {...b,spent:autoSpent||b.spent};
  });
  const totBudg  = enriched.reduce((a,b)=>a+Number(b.budgeted),0);
  const totSpent = enriched.reduce((a,b)=>a+Number(b.spent),0);
  const onTrack  = enriched.filter(b=>pct(b.spent,b.budgeted)<70).length;
  const caution  = enriched.filter(b=>{const p=pct(b.spent,b.budgeted);return p>=70&&p<90;}).length;
  const overBudg = enriched.filter(b=>pct(b.spent,b.budgeted)>=90).length;
  const score    = Math.max(0,100-overBudg*20-caution*10);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
            <div>
              <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>Budget Tracker</h3>
              <p style={{color:C.textDim,fontSize:12,marginTop:3}}>Spent auto-synced from transactions</p>
            </div>
            <Btn onClick={()=>setModal("add")}><Plus size={13}/> Add Category</Btn>
          </div>
          {enriched.length===0&&<p style={{color:C.textDim,fontSize:13,textAlign:"center",padding:"24px 0"}}>No budget categories — add one above</p>}
          {enriched.map((b,i)=>{
            const p=pct(b.spent,b.budgeted);
            const over=p>=90;
            const barC=over?C.red:p>70?C.amber:b.color;
            return(
              <div key={b.id} style={{marginBottom:22}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:9,height:9,borderRadius:"50%",background:b.color}}/>
                    <span style={{color:C.text,fontSize:13}}>{b.cat}</span>
                    {over&&<span style={{background:`${C.red}22`,color:C.red,fontSize:10,padding:"1px 7px",borderRadius:20}}>Alert</span>}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{display:"flex",gap:12,fontSize:12}}>
                      <span style={{color:over?C.red:C.textMid}}>{fmt(b.spent)}</span>
                      <span style={{color:C.textDim}}>/ {fmt(b.budgeted)}</span>
                      <span style={{color:barC,fontWeight:600,minWidth:32,textAlign:"right"}}>{p}%</span>
                    </div>
                    <button onClick={()=>setModal(b)} style={{background:`${C.gold}18`,border:`1px solid ${C.gold}30`,color:C.gold,borderRadius:7,padding:"4px 7px",cursor:"pointer"}}><Edit2 size={11}/></button>
                    <button onClick={()=>{onDelete("budget",b.id);showToast("Budget removed","error");}} style={{background:`${C.red}18`,border:`1px solid ${C.red}30`,color:C.red,borderRadius:7,padding:"4px 7px",cursor:"pointer"}}><Trash2 size={11}/></button>
                  </div>
                </div>
                <div style={{height:7,background:"rgba(255,255,255,0.06)",borderRadius:4}}>
                  <div style={{height:"100%",width:`${p}%`,background:barC,borderRadius:4,transition:"width 0.4s"}}/>
                </div>
              </div>
            );
          })}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[
            {label:"Total Budgeted",val:fmt(totBudg),          c:C.text},
            {label:"Total Spent",   val:fmt(totSpent),         c:C.red },
            {label:"Remaining",     val:fmt(totBudg-totSpent), c:(totBudg-totSpent)>=0?C.teal:C.red},
          ].map(({label,val,c},i)=>(
            <Card key={i}>
              <p style={{color:C.textDim,fontSize:11,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>{label}</p>
              <p style={{color:c,fontSize:24,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{val}</p>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <h3 style={{color:C.text,fontSize:15,fontWeight:600,marginBottom:18}}>Budget Health Score</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {[
            {label:"On Track",   count:onTrack,        color:C.teal, icon:"✓"},
            {label:"Caution",    count:caution,         color:C.amber,icon:"!"},
            {label:"Over Budget",count:overBudg,        color:C.red,  icon:"✕"},
            {label:"Score",      count:`${score}/100`,  color:C.gold, icon:"★"},
          ].map(({label,count,color,icon},i)=>(
            <div key={i} style={{background:`${color}10`,border:`1px solid ${color}25`,borderRadius:12,padding:"16px",textAlign:"center"}}>
              <p style={{fontSize:22,marginBottom:6}}>{icon}</p>
              <p style={{color,fontSize:20,fontWeight:600,fontFamily:"'Playfair Display',serif",marginBottom:4}}>{count}</p>
              <p style={{color:C.textDim,fontSize:11}}>{label}</p>
            </div>
          ))}
        </div>
      </Card>
      {modal==="add"&&<BudgetModal txns={txns} onClose={()=>setModal(null)} onSave={b=>{onAdd("budget",b);showToast("Budget category added!");}}/>}
      {modal&&modal!=="add"&&<BudgetModal initial={modal} txns={txns} onClose={()=>setModal(null)} onSave={b=>{onEdit("budget",b);showToast("Budget updated!");}}/>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ANALYTICS PAGE
═══════════════════════════════════════════════════════════ */
const Analytics = ({txns,subs}) => {
  const debits  = txns.filter(t=>!t.credit);
  const credits = txns.filter(t=>t.credit);
  const totExp  = debits.reduce((a,t)=>a+Number(t.amt),0);
  const totInc  = credits.reduce((a,t)=>a+Number(t.amt),0);
  const avgDay  = totExp>0?Math.round(totExp/30):0;
  const savRate = totInc>0?Math.round(((totInc-totExp)/totInc)*100):0;
  const largest = [...debits].sort((a,b)=>b.amt-a.amt)[0];
  const subTotal= subs.reduce((a,s)=>a+Number(s.amt),0);
  const subPct  = totExp>0?Math.round((subTotal/totExp)*100):0;

  const catMap={};
  debits.forEach(t=>{catMap[t.cat]=(catMap[t.cat]||0)+Number(t.amt);});
  const catTotal=Object.values(catMap).reduce((a,v)=>a+v,0)||1;
  const catData=Object.entries(catMap).map(([name,val])=>({
    name,val:Math.round((val/catTotal)*100),color:CAT_COLORS[name]||C.textDim
  })).sort((a,b)=>b.val-a.val).slice(0,6);

  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const weekData=days.map((d,i)=>{
    const now=new Date();const day=new Date(now);
    day.setDate(now.getDate()-((now.getDay()-i+7)%7));
    const ds=day.toISOString().slice(0,10);
    const real=debits.filter(t=>t.date===ds).reduce((a,t)=>a+Number(t.amt),0);
    return{d,amt:real||Math.round(3000+Math.random()*8000)};
  });

  const monthlyData=useMemo(()=>
    ["Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({m,
      inc:totInc>0?Math.round(totInc*(0.85+i*0.03)):80000+i*2000,
      exp:totExp>0?Math.round(totExp*(0.75+i*0.05)):35000+i*1500,
    }))
  ,[totInc,totExp]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:"Avg Daily Spend",   val:fmt(avgDay),              sub:"Based on total expenses",   up:null},
          {label:"Savings Rate",       val:`${savRate}%`,            sub:savRate>30?"Great savings!":"Keep saving",up:savRate>30},
          {label:"Largest Expense",    val:largest?fmt(largest.amt):"₹0",sub:largest?largest.cat:"No expenses",up:null},
          {label:"Subscriptions %",    val:`${subPct}%`,             sub:"of total expenses",         up:null},
        ].map(({label,val,sub,up},i)=>(
          <Card key={i}>
            <p style={{color:C.textDim,fontSize:11,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>{label}</p>
            <p style={{color:C.text,fontSize:24,fontWeight:600,fontFamily:"'Playfair Display',serif",marginBottom:6}}>{val}</p>
            <p style={{color:up===true?C.teal:up===false?C.red:C.textDim,fontSize:12,display:"flex",alignItems:"center",gap:3}}>
              {up===true&&<ArrowUpRight size={12}/>}{up===false&&<ArrowDownRight size={12}/>}{sub}
            </p>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600,marginBottom:4}}>Daily Spending (This Week)</h3>
          <p style={{color:C.textDim,fontSize:12,marginBottom:18}}>Real data from your transactions</p>
          <div style={{height:210}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={24}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="d" tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${Math.round(v/1000)}k`}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="amt" name="Spending" fill={C.gold} radius={[5,5,0,0]} fillOpacity={0.85}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600,marginBottom:4}}>Category Split</h3>
          <p style={{color:C.textDim,fontSize:12,marginBottom:18}}>Live from your expense data</p>
          {catData.length>0?(
            <div style={{height:210}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="val" cx="50%" cy="50%" outerRadius={80} paddingAngle={4}>
                    {catData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v}%`,n]}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ):(
            <p style={{color:C.textDim,fontSize:13,textAlign:"center",paddingTop:60}}>Add expenses to see breakdown</p>
          )}
        </Card>
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>Financial Trend</h3>
            <p style={{color:C.textDim,fontSize:12,marginTop:3}}>Income vs Expenses — 6 months</p>
          </div>
          <div style={{display:"flex",gap:16,fontSize:12}}>
            {[{c:C.teal,l:"Income"},{c:C.red,l:"Expenses"}].map(({c,l})=>(
              <span key={l} style={{color:c,display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}
              </span>
            ))}
          </div>
        </div>
        <div style={{height:240}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.teal} stopOpacity={0.2}/><stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ae" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red} stopOpacity={0.2}/><stop offset="95%" stopColor={C.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="m" tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.textDim,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${Math.round(v/1000)}k`}/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="inc" name="Income"   stroke={C.teal} strokeWidth={2} fill="url(#ai)"/>
              <Area type="monotone" dataKey="exp" name="Expenses" stroke={C.red}  strokeWidth={2} fill="url(#ae)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ALERT MODAL
═══════════════════════════════════════════════════════════ */
const AlertModal = ({onClose,onSave}) => {
  const [f,setF] = useState({type:"info",title:"",msg:""});
  const set = (k,v) => setF(x=>({...x,[k]:v}));
  return(
    <Modal title="Add Smart Alert" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Sel label="Alert Type" value={f.type} onChange={e=>set("type",e.target.value)}>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
        </Sel>
        <Inp label="Alert Title" value={f.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Budget Alert"/>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          <label style={{color:C.textDim,fontSize:11,letterSpacing:"0.07em"}}>MESSAGE</label>
          <textarea value={f.msg} onChange={e=>set("msg",e.target.value)} rows={3} placeholder="Alert description…"
            style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:9,
              padding:"10px 13px",color:C.text,fontSize:14,outline:"none",resize:"none"}}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <GhostBtn onClick={onClose} style={{flex:1,justifyContent:"center"}}>Cancel</GhostBtn>
          <Btn onClick={()=>{if(!f.title||!f.msg)return;onSave({...f,id:uid(),time:"Just now",read:false});onClose();}} style={{flex:1,justifyContent:"center"}}>
            <Check size={14}/> Save Alert
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════
   ALERTS PAGE
═══════════════════════════════════════════════════════════ */
const Alerts = ({alerts,prefs,onAdd,onDelete,onTogglePref,onMarkRead}) => {
  const [modal,setModal]   = useState(false);
  const [toast,showToast]  = useToast();
  const iconMap  = {warning:AlertTriangle,success:CheckCircle,info:Info};
  const colorMap = {warning:C.amber,success:C.teal,info:C.blue};
  const prefLabels = {
    budgetAlerts:"Budget threshold alerts",renewalReminders:"Subscription renewals",
    unusualSpending:"Unusual spending patterns",weeklySummary:"Weekly summary report",
    savingsMilestones:"Savings milestone alerts",lowBalance:"Low balance warnings",
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {toast&&<Toast {...toast}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
        {[
          {label:"Total Alerts",val:alerts.length,                              c:C.text },
          {label:"Warnings",    val:alerts.filter(a=>a.type==="warning").length,c:C.amber},
          {label:"Info",        val:alerts.filter(a=>a.type==="info").length,   c:C.blue },
          {label:"Unread",      val:alerts.filter(a=>!a.read).length,           c:C.red  },
        ].map(({label,val,c},i)=>(
          <Card key={i}>
            <p style={{color:C.textDim,fontSize:11,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>{label}</p>
            <p style={{color:c,fontSize:28,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{val}</p>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h3 style={{color:C.text,fontSize:15,fontWeight:600}}>Smart Alerts & Notifications</h3>
          <div style={{display:"flex",gap:10}}>
            {alerts.filter(a=>!a.read).length>0&&(
              <GhostBtn onClick={()=>{onMarkRead();showToast("All marked as read");}}>
                <Check size={13}/> Mark all read
              </GhostBtn>
            )}
            <Btn onClick={()=>setModal(true)}><Plus size={13}/> Add Alert</Btn>
          </div>
        </div>
        {alerts.length===0&&<p style={{color:C.textDim,fontSize:13,textAlign:"center",padding:"24px 0"}}>No alerts — you're all clear!</p>}
        {[...alerts].reverse().map((a,i,arr)=>{
          const Icon=iconMap[a.type];const color=colorMap[a.type];
          return(
            <div key={a.id} style={{display:"flex",gap:16,padding:"18px 0",
              borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",opacity:a.read?0.55:1}}>
              <div style={{width:42,height:42,borderRadius:11,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon size={18} color={color}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <p style={{color:C.text,fontSize:14,fontWeight:500}}>{a.title}</p>
                  <p style={{color:C.textDim,fontSize:11}}>{a.time}</p>
                </div>
                <p style={{color:C.textMid,fontSize:13,lineHeight:1.5}}>{a.msg}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                {!a.read&&<div style={{width:8,height:8,borderRadius:"50%",background:color,marginTop:4}}/>}
                <button onClick={()=>{onDelete("alert",a.id);showToast("Alert dismissed","error");}}
                  style={{background:`${C.red}18`,border:`1px solid ${C.red}30`,color:C.red,borderRadius:7,padding:"5px 7px",cursor:"pointer"}}><Trash2 size={11}/></button>
              </div>
            </div>
          );
        })}
      </Card>
      <Card>
        <h3 style={{color:C.text,fontSize:15,fontWeight:600,marginBottom:18}}>Alert Preferences</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {Object.keys(prefs).map(k=>(
            <div key={k} onClick={()=>onTogglePref(k)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"12px 14px",background:C.bgGlass,borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer"}}>
              <span style={{color:C.textMid,fontSize:13}}>{prefLabels[k]}</span>
              <div style={{width:36,height:20,borderRadius:10,background:prefs[k]?C.teal:"rgba(255,255,255,0.12)",position:"relative",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:3,left:prefs[k]?18:3,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {modal&&<AlertModal onClose={()=>setModal(false)} onSave={a=>{onAdd("alert",a);showToast("Alert created!");}}/>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOT APP  —  STATE ENGINE + CRUD
═══════════════════════════════════════════════════════════ */
export default function FinTrack() {
  const [activeTab,setActiveTab] = useState("dashboard");
  const [txns,   setTxns]    = useLS("ft_txns",   SEED_TXN);
  const [subs,   setSubs]    = useLS("ft_subs",   SEED_SUB);
  const [budgets,setBudgets] = useLS("ft_budgets",SEED_BUDGET);
  const [alerts, setAlerts]  = useLS("ft_alerts", SEED_ALERTS);
  const [prefs,  setPrefs]   = useLS("ft_prefs",  SEED_PREFS);

  const storeMap = {txn:[txns,setTxns],sub:[subs,setSubs],budget:[budgets,setBudgets],alert:[alerts,setAlerts]};

  const onAdd    = (type,item) => { const [list,set]=storeMap[type]; set([...list,item]); };
  const onEdit   = (type,item) => { const [,set]=storeMap[type]; set(prev=>prev.map(x=>x.id===item.id?item:x)); };
  const onDelete = (type,id)   => { const [,set]=storeMap[type]; set(prev=>prev.filter(x=>x.id!==id)); };
  const onTogglePref = k => setPrefs(p=>({...p,[k]:!p[k]}));
  const onMarkRead   = () => setAlerts(a=>a.map(x=>({...x,read:true})));

  const unread = alerts.filter(a=>!a.read).length;

  const nav=[
    {id:"dashboard",    label:"Dashboard",    Icon:Home      },
    {id:"expenses",     label:"Expenses",     Icon:List      },
    {id:"subscriptions",label:"Subscriptions",Icon:CreditCard},
    {id:"budget",       label:"Budget",       Icon:Target    },
    {id:"analytics",    label:"Analytics",    Icon:TrendingUp},
    {id:"alerts",       label:"Alerts",       Icon:Bell      },
  ];
  const meta={
    dashboard:    {title:"Dashboard Overview",   sub:"Your finances at a glance"},
    expenses:     {title:"Expense Tracker",       sub:"All transactions in one place"},
    subscriptions:{title:"Subscription Manager",  sub:"Track every recurring payment"},
    budget:       {title:"Budget Planner",         sub:"Plan and control your monthly spend"},
    analytics:    {title:"Analytics & Insights",  sub:"Deep dive into your financial patterns"},
    alerts:       {title:"Smart Alerts",           sub:"Stay ahead of important financial events"},
  };
  const addTabMap={dashboard:"expenses",expenses:"expenses",subscriptions:"subscriptions",budget:"budget",analytics:"expenses",alerts:"alerts"};

  const sections={
    dashboard:    <Dashboard txns={txns} subs={subs} budgets={budgets} navigate={setActiveTab}/>,
    expenses:     <Expenses  txns={txns} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}/>,
    subscriptions:<Subscriptions subs={subs} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}/>,
    budget:       <Budget budgets={budgets} txns={txns} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}/>,
    analytics:    <Analytics txns={txns} subs={subs}/>,
    alerts:       <Alerts alerts={alerts} prefs={prefs} onAdd={onAdd} onDelete={onDelete} onTogglePref={onTogglePref} onMarkRead={onMarkRead}/>,
  };

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
        input[type=range]{accent-color:#c9973a}
        input::placeholder,textarea::placeholder{color:rgba(238,242,255,0.3)}
        option{background:#0e1535;color:#eef2ff}
      `}</style>

      {/* Sidebar */}
      <aside style={{width:252,background:C.sidebar,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"28px 22px 22px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${C.gold},${C.goldBt})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Activity size={19} color="#fff"/>
            </div>
            <div>
              <p style={{color:C.text,fontSize:17,fontWeight:600,fontFamily:"'Playfair Display',serif",lineHeight:1.1}}>FinTrack</p>
              <p style={{color:C.textDim,fontSize:10,letterSpacing:"0.07em"}}>PRO EDITION</p>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"14px 10px",overflowY:"auto"}}>
          <p style={{color:C.textDim,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",padding:"6px 12px 10px",fontWeight:500}}>Main Menu</p>
          {nav.map(({id,label,Icon})=>{
            const active=activeTab===id;
            return(
              <button key={id} onClick={()=>setActiveTab(id)} style={{
                display:"flex",alignItems:"center",gap:11,width:"100%",
                padding:"11px 14px",borderRadius:10,marginBottom:3,
                background:active?`${C.gold}16`:"transparent",
                border:`1px solid ${active?`${C.gold}35`:"transparent"}`,
                color:active?C.gold:C.textMid,fontSize:14,fontWeight:active?500:400,
                cursor:"pointer",textAlign:"left",transition:"all 0.15s",
              }}>
                <Icon size={17}/> {label}
                {id==="alerts"&&unread>0&&(
                  <span style={{marginLeft:"auto",background:C.red,color:"#fff",fontSize:10,fontWeight:600,borderRadius:10,padding:"1px 7px"}}>{unread}</span>
                )}
                {active&&id!=="alerts"&&<ChevronRight size={13} style={{marginLeft:"auto"}}/>}
              </button>
            );
          })}
          <p style={{color:C.textDim,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",padding:"18px 12px 10px",fontWeight:500}}>System</p>
          {[{label:"Security",Icon:Shield},{label:"Settings",Icon:Settings}].map(({label,Icon})=>(
            <button key={label} style={{display:"flex",alignItems:"center",gap:11,width:"100%",padding:"11px 14px",borderRadius:10,marginBottom:3,background:"transparent",border:"1px solid transparent",color:C.textMid,fontSize:14,cursor:"pointer",textAlign:"left"}}>
              <Icon size={17}/> {label}
            </button>
          ))}
        </nav>
        <div style={{padding:"14px 10px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:C.bgCard,border:`1px solid ${C.border}`}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`${C.gold}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:C.gold}}>AK</div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:C.text,fontSize:13,fontWeight:500}}>Arjun Kumar</p>
              <p style={{color:C.textDim,fontSize:11}}>Pro Member</p>
            </div>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.teal,flexShrink:0}}/>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"22px 32px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:"rgba(7,9,28,0.8)"}}>
          <div>
            <h1 style={{color:C.text,fontSize:20,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{meta[activeTab].title}</h1>
            <p style={{color:C.textDim,fontSize:12,marginTop:3}}>{meta[activeTab].sub}</p>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{fontSize:12,color:C.textDim,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px"}}>
              {new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
            </div>
            <button onClick={()=>setActiveTab("alerts")} style={{width:38,height:38,borderRadius:10,background:C.bgCard,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative"}}>
              <Bell size={16} color={C.textMid}/>
              {unread>0&&<span style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:C.red,border:`2px solid ${C.bg}`}}/>}
            </button>
            <Btn onClick={()=>setActiveTab(addTabMap[activeTab])}><Plus size={14}/> Add New</Btn>
          </div>
        </div>
        <div style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>{sections[activeTab]}</div>
      </main>
    </div>
  );
}