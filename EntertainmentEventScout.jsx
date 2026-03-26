import { useState, useMemo, useCallback, useRef } from "react";
import { Search, Calendar, MapPin, Users, Star, Filter, ChevronLeft, ChevronRight, ExternalLink, Clock, UserCheck, X, Eye, Layers, Upload, Settings, Database, Zap } from "lucide-react";

// ─── BUILT-IN EVENTS ──────────────────────────────────────────────
const BUILTIN = [
  { id:1, name:"Advanced Industry Workshop — 2-Week Intensive", venue:"One on One NYC", address:"34 W 27th St, 11th Fl, New York, NY", lat:40.7448, lng:-73.9895, dateStart:"2026-04-08", dateEnd:"2026-04-17", time:"10:00 AM – 6:00 PM", category:"Acting", type:"Workshop", url:"https://www.oneononenyc.com/special-programs/advanced-industry-workshop/", speakers:["Calleri Jensen Davis Casting","McCorkle Casting","Keller Casting","Jim Carnahan Casting"], description:"2-week intensive for advanced actors with top-tier NYC Casting Directors, Theater Pros & Filmmakers. Past participants called in for VO roles the next week.", tags:["casting directors","theater","film","voiceover"], priority:"high" },
  { id:2, name:"NYC Super Showcase: Musical Theater & TV/Film", venue:"One on One NYC", address:"34 W 27th St, 11th Fl, New York, NY", lat:40.7448, lng:-73.9895, dateStart:"2026-03-17", dateEnd:"2026-03-19", time:"Various", category:"Acting", type:"Showcase", url:"https://www.oneononenyc.com/special-programs/nyc-showcase/", speakers:["Industry Panel Guests","NYC Casting Directors","Talent Agents"], description:"Showcase for actors breaking into NYC TV/Film. Meet casting directors and agents in a performance setting.", tags:["showcase","musical theater","tv/film","agents"], priority:"high" },
  { id:3, name:"NY Connection 3-Day Showcase", venue:"Actors Connection", address:"630 9th Ave, Suite 1410, New York, NY", lat:40.7598, lng:-73.9916, dateStart:"2026-05-12", dateEnd:"2026-05-14", time:"6:00 PM – 10:00 PM", category:"Acting", type:"Showcase", url:"https://www.actorsconnection.com/ny-connection/", speakers:["Top NYC Casting Directors","LA Casting Directors","Talent Agents","Personal Managers"], description:"3-Day SHOWCASE with GUARANTEED INDUSTRY GUESTS. Running since 1991.", tags:["showcase","agents","managers","casting directors"], priority:"high" },
  { id:4, name:"That's Voiceover! Career Expo 2026", venue:"TBD NYC", address:"New York, NY", lat:40.7549, lng:-73.9840, dateStart:"2026-06-15", dateEnd:"2026-06-17", time:"9:00 AM – 6:00 PM", category:"Voice Acting", type:"Conference", url:"https://sovas.org/tvo-schedule-2026/", speakers:["SiriusXM Reps","Deluxe Casting","Penguin Random House","Deyan Audio","Roundabout Theatre"], description:"16th year of the premier VO conference. 1-on-1 connections with agents, producers, casting directors.", tags:["voiceover","agents","audiobook","commercial","animation"], priority:"high" },
  { id:5, name:"New Directors/New Films — 55th Edition", venue:"Lincoln Center / MoMA", address:"165 W 65th St, New York, NY", lat:40.7736, lng:-73.9835, dateStart:"2026-04-08", dateEnd:"2026-04-19", time:"Various", category:"Film", type:"Festival", url:"https://www.filmlinc.org/", speakers:["Emerging Film Directors","Lincoln Center Programmers","MoMA Film Curators"], description:"Films by emerging directors. Filmmakers attend in person — great networking.", tags:["film festival","indie film","directors"], priority:"medium" },
  { id:6, name:"SAG-AFTRA NY Conservatory — Spring", venue:"SAG-AFTRA New York", address:"1900 Broadway, 5th Fl, New York, NY", lat:40.7710, lng:-73.9820, dateStart:"2026-03-01", dateEnd:"2026-06-30", time:"9:30 AM – 5:30 PM", category:"Acting", type:"Workshop", url:"https://www.sagaftra.org/new-york/local-programs/new-york-conservatory", speakers:["SAG-AFTRA Instructors","Industry Guest Speakers","Casting Directors"], description:"Craft & business workshops. $49/season. Auditions, self-tapes, reels, finding representation, branding.", tags:["SAG-AFTRA","workshops","branding"], priority:"high" },
  { id:7, name:"SAG-AFTRA Foundation — VO & Agent Q&A", venue:"SAG-AFTRA Foundation", address:"247 W 54th St, New York, NY", lat:40.7643, lng:-73.9833, dateStart:"2026-04-22", dateEnd:"2026-04-22", time:"2:00 PM – 5:00 PM", category:"Voice Acting", type:"Panel", url:"https://sagaftra.foundation/our-programs/", speakers:["Talent Agents (VO Division)","Video Game Casting Directors","Sound Designers"], description:"Q&A with VO agents. Video game voiceover, sound design, actor branding.", tags:["voiceover","video games","agents"], priority:"high" },
  { id:8, name:"NYC Actors/Directors/Writers Networking", venue:"Various NYC Venues", address:"Rotating, New York, NY", lat:40.7505, lng:-73.9934, dateStart:"2026-04-05", dateEnd:"2026-04-05", time:"7:00 PM – 10:00 PM", category:"Acting", type:"Networking", url:"https://www.meetup.com/nyc-networking-for-actors-directors-and-writers/", speakers:["Fellow Actors","Independent Directors","Screenwriters"], description:"Monthly Meetup for actors, directors, writers. Low-key grassroots networking.", tags:["meetup","networking","actors","directors"], priority:"medium" },
  { id:9, name:"New York Theater Festival — Spring 2026", venue:"Multiple NYC Theaters", address:"Various, New York, NY", lat:40.7590, lng:-73.9845, dateStart:"2026-05-01", dateEnd:"2026-05-31", time:"Various", category:"Theater", type:"Festival", url:"https://newyorktheaterfestival.com/", speakers:["Theater Directors","Playwrights","Theater Producers"], description:"Plays and musicals. Meet theater directors, producers, and performers.", tags:["theater","plays","musicals"], priority:"medium" },
  { id:10, name:"Actors Connection — Weekly CD Seminars", venue:"Actors Connection", address:"630 9th Ave, Suite 1410, New York, NY", lat:40.7598, lng:-73.9916, dateStart:"2026-03-30", dateEnd:"2026-03-30", time:"7:00 PM – 9:30 PM", category:"Acting", type:"Seminar", url:"https://www.actorsconnection.com/", speakers:["Rotating NYC Casting Directors"], description:"Seminars every night. Meet CDs and showcase to industry guests.", tags:["casting directors","seminar","recurring"], priority:"high" },
  { id:11, name:"Festival of Cinema NYC", venue:"Regal Union Square", address:"850 Broadway, New York, NY", lat:40.7339, lng:-73.9910, dateStart:"2026-05-20", dateEnd:"2026-05-24", time:"Various", category:"Film", type:"Festival", url:"https://festivalofcinemanyc.com/", speakers:["Independent Filmmakers","Film Producers","Distributors"], description:"Indie filmmakers showcase. Q&As, networking receptions, panels.", tags:["independent film","filmmakers","Q&A"], priority:"medium" },
  { id:12, name:"Runway Model of the Year — NYC Casting", venue:"NYC Fashion Venue", address:"Midtown, New York, NY", lat:40.7549, lng:-73.9900, dateStart:"2026-04-25", dateEnd:"2026-04-25", time:"12:00 PM – 6:00 PM", category:"Modeling", type:"Casting", url:"https://www.eventbrite.com/d/ny--new-york/model-casting/", speakers:["Modeling Agents","Fashion Directors","Runway Coaches"], description:"Open casting for runway model competition. Meet modeling agents.", tags:["modeling","runway","casting","agents"], priority:"medium" },
  { id:13, name:"NYFW Pre-Season Model Bootcamp", venue:"Fashion District", address:"Fashion District, New York, NY", lat:40.7527, lng:-73.9930, dateStart:"2026-06-10", dateEnd:"2026-06-12", time:"10:00 AM – 5:00 PM", category:"Modeling", type:"Workshop", url:"https://www.eventbrite.com/d/ny--new-york/casting-modeling/", speakers:["NYFW Casting Directors","Modeling Agency Reps","Runway Coaches"], description:"Pre-NYFW bootcamp with casting sessions and runway training.", tags:["NYFW","modeling","bootcamp","agencies"], priority:"medium" },
  { id:14, name:"NEVO-CON — Voiceover Conference", venue:"Mohegan Sun", address:"1 Mohegan Sun Blvd, Uncasville, CT", lat:41.4932, lng:-72.0894, dateStart:"2026-05-08", dateEnd:"2026-05-10", time:"All Day", category:"Voice Acting", type:"Conference", url:"https://www.nevo-con.com/home", speakers:["VO Agents","Audiobook Producers","Commercial Casting Directors","Animation Directors"], description:"Regional VO conference near NYC. Workshops, panels, 1-on-1 agent meetings.", tags:["voiceover","agents","audiobook","commercial"], priority:"medium" },
  { id:15, name:"VO Resource Guide — NYC Mixer", venue:"TBD NYC Venue", address:"Midtown, New York, NY", lat:40.7614, lng:-73.9776, dateStart:"2026-04-15", dateEnd:"2026-04-15", time:"6:00 PM – 9:00 PM", category:"Voice Acting", type:"Networking", url:"https://voiceoverresourceguide.com/conferences-and-events/", speakers:["VO Community","Studio Owners","Agents"], description:"Casual networking mixer for voiceover community.", tags:["voiceover","networking","mixer"], priority:"medium" },
  { id:16, name:"DOC NYC — Industry Events", venue:"IFC Center / SVA", address:"323 6th Ave, New York, NY", lat:40.7324, lng:-73.9997, dateStart:"2026-11-10", dateEnd:"2026-11-19", time:"Various", category:"Film", type:"Festival", url:"https://www.docnyc.net/", speakers:["Documentary Filmmakers","Producers","Narration Directors"], description:"Documentary festival. Great for VO narration work connections.", tags:["documentary","narration","producers"], priority:"low" },
  { id:17, name:"Art House Cinema Week NYC", venue:"Citywide", address:"Citywide, New York, NY", lat:40.7580, lng:-73.9855, dateStart:"2026-03-20", dateEnd:"2026-03-26", time:"Various", category:"Film", type:"Festival", url:"https://www.filmlinc.org/", speakers:["NYC Media Office","Indie Cinema Owners","Film Programmers"], description:"Citywide art house cinema celebration.", tags:["art house","indie film","networking"], priority:"medium" },
];

const CATS = { "Acting":{c:"#3B82F6",i:"🎭"}, "Voice Acting":{c:"#8B5CF6",i:"🎙️"}, "Film":{c:"#EF4444",i:"🎬"}, "Theater":{c:"#F59E0B",i:"🎪"}, "Modeling":{c:"#EC4899",i:"📸"} };
const TYPES = ["All","Workshop","Showcase","Conference","Festival","Panel","Networking","Seminar","Casting","Event"];
const PRI = { high:{c:"#DC2626",l:"High Value"}, medium:{c:"#F59E0B",l:"Medium"}, low:{c:"#9CA3AF",l:"Lower"} };

const pD=s=>new Date(s+"T00:00:00"), fD=s=>pD(s).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
  fDF=s=>pD(s).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"}),
  isSame=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(),
  inR=(d,s,e)=>d>=pD(s)&&d<=pD(e), dim=(y,m)=>new Date(y,m+1,0).getDate(), fdm=(y,m)=>new Date(y,m,1).getDay();

function fuzzy(a,b){
  const x=a.toLowerCase().trim(),y=b.toLowerCase().trim();
  if(!x||!y)return false;
  if(y.includes(x)||x.includes(y))return true;
  return x.split(/\s+/).some(w=>w.length>3&&y.split(/\s+/).some(v=>v.length>3&&(v.includes(w)||w.includes(v))));
}
function gM(ev,ct){
  if(!ct.length)return[];
  return ct.filter(c=>ev.speakers.some(s=>fuzzy(c.org||"",s)||fuzzy(c.name||"",s)||fuzzy(`${c.name} ${c.lastHint||""}`,s)));
}

const B=(a)=>({padding:"7px 12px",background:a?"#3B82F6":"#1E293B",border:a?"1px solid #3B82F6":"1px solid #475569",borderRadius:7,color:a?"#FFF":"#94A3B8",cursor:"pointer",fontSize:12,fontWeight:500,display:"flex",alignItems:"center",gap:5,transition:"all .15s"});
const TG=(c)=>({fontSize:10,padding:"2px 7px",borderRadius:4,background:`${c}20`,color:c,fontWeight:600});

export default function App(){
  const[view,setView]=useState("calendar");
  const[search,setSrch]=useState("");
  const[sCat,setSCat]=useState("All");
  const[sType,setSType]=useState("All");
  const[sel,setSel]=useState(null);
  const[cM,setCM]=useState(2);
  const[cY,setCY]=useState(2026);
  const[filt,setFilt]=useState(false);
  const[hiP,setHiP]=useState(false);
  const[mO,setMO]=useState(false);
  const[sett,setSett]=useState(false);
  const[cts,setCts]=useState([]);
  const[impEv,setImpEv]=useState([]);
  const[att,setAtt]=useState({});
  const fR=useRef(null),eR=useRef(null);

  const allEv=useMemo(()=>[...BUILTIN,...impEv],[impEv]);
  const fe=useMemo(()=>allEv.filter(e=>{
    if(sCat!=="All"&&e.category!==sCat)return false;
    if(sType!=="All"&&e.type!==sType)return false;
    if(hiP&&e.priority!=="high")return false;
    if(mO&&gM(e,cts).length===0)return false;
    if(search){const q=search.toLowerCase();return e.name.toLowerCase().includes(q)||e.venue.toLowerCase().includes(q)||e.description.toLowerCase().includes(q)||(e.tags||[]).some(t=>t.includes(q))||e.speakers.some(s=>s.toLowerCase().includes(q));}
    return true;
  }),[allEv,search,sCat,sType,hiP,mO,cts]);

  const st=useMemo(()=>({t:fe.length,h:fe.filter(e=>e.priority==="high").length,m:fe.filter(e=>gM(e,cts).length>0).length}),[fe,cts]);

  const hCI=useCallback(e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);setCts(Array.isArray(d)?d:[]);}catch{alert("Invalid JSON");}};r.readAsText(f);},[]);
  const hEI=useCallback(e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);const evts=d.events||d;if(Array.isArray(evts))setImpEv(evts.map((x,i)=>({...x,id:2000+i,priority:x.priority||"medium"})));}catch{alert("Invalid JSON");}};r.readAsText(f);},[]);

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",background:"#0F172A",color:"#E2E8F0",minHeight:"100vh"}}>
      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#1E293B,#0F172A)",borderBottom:"1px solid #334155",padding:"14px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div>
            <h1 style={{margin:0,fontSize:19,fontWeight:700,color:"#F8FAFC"}}>🎯 Entertainment Event Scout</h1>
            <p style={{margin:"2px 0 0",fontSize:11,color:"#94A3B8"}}>NYC Industry Events • Apollo Cross-Reference • Jack Savage Pipeline</p>
          </div>
          <div style={{display:"flex",gap:5}}>
            {[{id:"calendar",ic:<Calendar size={14}/>,l:"Calendar"},{id:"map",ic:<MapPin size={14}/>,l:"Map"},{id:"list",ic:<Layers size={14}/>,l:"List"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={B(view===v.id)}>{v.ic} {v.l}</button>
            ))}
            <button onClick={()=>setSett(!sett)} style={{...B(sett),marginLeft:6}}><Settings size={14}/> Data</button>
          </div>
        </div>
        <div style={{marginTop:10,display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{position:"relative",flex:"1 1 240px"}}>
            <Search size={14} style={{position:"absolute",left:9,top:8,color:"#64748B"}}/>
            <input value={search} onChange={e=>setSrch(e.target.value)} placeholder="Search events, venues, speakers..."
              style={{width:"100%",padding:"7px 9px 7px 30px",background:"#1E293B",border:"1px solid #334155",borderRadius:7,color:"#E2E8F0",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <button onClick={()=>setFilt(!filt)} style={B(filt)}><Filter size={13}/> Filters</button>
        </div>
        {filt&&(
          <div style={{marginTop:8,background:"#1E293B",borderRadius:8,border:"1px solid #334155",padding:12,display:"flex",flexWrap:"wrap",gap:12}}>
            <div>
              <div style={{fontSize:9,color:"#64748B",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Category</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                {["All",...Object.keys(CATS)].map(c=>(
                  <button key={c} onClick={()=>setSCat(c)} style={{padding:"3px 9px",borderRadius:5,border:"none",cursor:"pointer",fontSize:10,fontWeight:500,background:sCat===c?(c==="All"?"#3B82F6":CATS[c]?.c):"#334155",color:sCat===c?"#FFF":"#94A3B8"}}>{c!=="All"&&CATS[c]?.i} {c}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:9,color:"#64748B",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Type</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                {TYPES.map(t=><button key={t} onClick={()=>setSType(t)} style={{padding:"3px 9px",borderRadius:5,border:"none",cursor:"pointer",fontSize:10,background:sType===t?"#3B82F6":"#334155",color:sType===t?"#FFF":"#94A3B8"}}>{t}</button>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#94A3B8",cursor:"pointer"}}><input type="checkbox" checked={hiP} onChange={()=>setHiP(!hiP)}/> High-value only</label>
              <label style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:"#94A3B8",cursor:"pointer"}}><input type="checkbox" checked={mO} onChange={()=>setMO(!mO)}/> Apollo matches only</label>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:7,marginTop:8,flexWrap:"wrap"}}>
          <Ch l="Events" v={st.t} c="#3B82F6"/><Ch l="High Value" v={st.h} c="#DC2626"/><Ch l="Apollo Matches" v={st.m} c="#10B981"/>
          <Ch l="Contacts" v={cts.length} c="#8B5CF6"/>
          {impEv.length>0&&<Ch l="Imported" v={impEv.length} c="#F59E0B"/>}
        </div>
      </div>

      {/* SETTINGS */}
      {sett&&(
        <div style={{padding:14,borderBottom:"1px solid #334155",background:"#162035"}}>
          <h3 style={{margin:"0 0 10px",fontSize:14,color:"#F8FAFC",display:"flex",alignItems:"center",gap:5}}><Database size={15}/> Data Sources & Import</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
            <div style={{background:"#1E293B",borderRadius:8,border:"1px solid #334155",padding:12}}>
              <h4 style={{margin:"0 0 6px",fontSize:12,color:"#8B5CF6",display:"flex",alignItems:"center",gap:4}}><UserCheck size={13}/> Apollo Contacts</h4>
              <p style={{fontSize:10,color:"#64748B",margin:"0 0 8px"}}>Import <code style={{background:"#334155",padding:"1px 3px",borderRadius:2,fontSize:10}}>apollo_contacts.json</code> for cross-referencing.</p>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <button onClick={()=>fR.current?.click()} style={{...B(false),background:"#8B5CF615",borderColor:"#8B5CF650",color:"#A78BFA",padding:"6px 10px",fontSize:11}}><Upload size={12}/> Import JSON</button>
                <input ref={fR} type="file" accept=".json" onChange={hCI} style={{display:"none"}}/>
                {cts.length>0&&<span style={{fontSize:10,color:"#10B981"}}>✓ {cts.length} loaded</span>}
              </div>
            </div>
            <div style={{background:"#1E293B",borderRadius:8,border:"1px solid #334155",padding:12}}>
              <h4 style={{margin:"0 0 6px",fontSize:12,color:"#F59E0B",display:"flex",alignItems:"center",gap:4}}><Zap size={13}/> Import API Events</h4>
              <p style={{fontSize:10,color:"#64748B",margin:"0 0 8px"}}>Run <code style={{background:"#334155",padding:"1px 3px",borderRadius:2,fontSize:10}}>python event_fetcher.py</code> then import output.</p>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <button onClick={()=>eR.current?.click()} style={{...B(false),background:"#F59E0B15",borderColor:"#F59E0B50",color:"#FCD34D",padding:"6px 10px",fontSize:11}}><Upload size={12}/> Import Events</button>
                <input ref={eR} type="file" accept=".json" onChange={hEI} style={{display:"none"}}/>
                {impEv.length>0&&<span style={{fontSize:10,color:"#10B981"}}>✓ {impEv.length} events</span>}
              </div>
            </div>
            <div style={{background:"#1E293B",borderRadius:8,border:"1px solid #334155",padding:12}}>
              <h4 style={{margin:"0 0 6px",fontSize:12,color:"#10B981",display:"flex",alignItems:"center",gap:4}}><ExternalLink size={13}/> Get API Keys</h4>
              <div style={{fontSize:10,color:"#94A3B8",lineHeight:2}}>
                <div><b style={{color:"#E2E8F0"}}>Eventbrite:</b> <a href="https://www.eventbrite.com/platform/api-keys" target="_blank" rel="noopener" style={{color:"#60A5FA"}}>Free API key →</a></div>
                <div><b style={{color:"#E2E8F0"}}>Luma:</b> <a href="https://help.luma.com/p/luma-api" target="_blank" rel="noopener" style={{color:"#60A5FA"}}>Luma Plus required →</a></div>
                <div><b style={{color:"#E2E8F0"}}>Meetup:</b> <a href="https://rapidapi.com" target="_blank" rel="noopener" style={{color:"#60A5FA"}}>Via RapidAPI →</a></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{display:"flex",minHeight:"calc(100vh - 230px)"}}>
        <div style={{flex:1,padding:14,overflow:"auto"}}>
          {view==="calendar"&&<CalV ev={fe} m={cM} y={cY} cts={cts} att={att}
            onP={()=>{if(cM===0){setCM(11);setCY(cY-1)}else setCM(cM-1)}}
            onN={()=>{if(cM===11){setCM(0);setCY(cY+1)}else setCM(cM+1)}}
            onS={setSel}/>}
          {view==="map"&&<MapV ev={fe} cts={cts} att={att} onS={setSel}/>}
          {view==="list"&&<LstV ev={fe} cts={cts} att={att} onS={setSel}/>}
        </div>
        {sel&&(
          <div style={{width:340,borderLeft:"1px solid #334155",background:"#1E293B",overflow:"auto",padding:14,position:"relative"}}>
            <button onClick={()=>setSel(null)} style={{position:"absolute",top:8,right:8,background:"none",border:"none",color:"#64748B",cursor:"pointer"}}><X size={15}/></button>
            <Det ev={sel} cts={cts} isA={att[sel.id]} onA={()=>setAtt(p=>({...p,[sel.id]:!p[sel.id]}))}/>
          </div>
        )}
      </div>
    </div>
  );
}

function Ch({l,v,c}){return<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:`${c}12`,borderRadius:7,border:`1px solid ${c}25`}}><span style={{fontSize:13,fontWeight:700,color:c}}>{v}</span><span style={{fontSize:10,color:"#94A3B8"}}>{l}</span></div>}

// ─── CALENDAR ─────────────────────────────────────────────────────
function CalV({ev,m,y,cts,att,onP,onN,onS}){
  const ds=[],fd=fdm(y,m);
  for(let i=0;i<fd;i++)ds.push(null);
  for(let d=1;d<=dim(y,m);d++)ds.push(d);
  const mn=new Date(y,m).toLocaleString("en-US",{month:"long",year:"numeric"});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <button onClick={onP} style={{background:"#334155",border:"none",borderRadius:7,padding:"5px 9px",color:"#E2E8F0",cursor:"pointer"}}><ChevronLeft size={15}/></button>
        <h2 style={{margin:0,fontSize:17,fontWeight:600,color:"#F8FAFC"}}>{mn}</h2>
        <button onClick={onN} style={{background:"#334155",border:"none",borderRadius:7,padding:"5px 9px",color:"#E2E8F0",cursor:"pointer"}}><ChevronRight size={15}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{padding:"5px 2px",textAlign:"center",fontSize:9,color:"#64748B",fontWeight:600}}>{d}</div>)}
        {ds.map((day,i)=>{
          if(!day)return<div key={`e${i}`} style={{minHeight:75}}/>;
          const dt=new Date(y,m,day),de=ev.filter(e=>inR(dt,e.dateStart,e.dateEnd)),td=isSame(dt,new Date());
          return(
            <div key={i} style={{minHeight:75,padding:3,background:td?"#1E3A5F":"#1E293B",borderRadius:4,border:td?"1px solid #3B82F6":"1px solid #253044"}}>
              <span style={{fontSize:10,fontWeight:td?700:400,color:td?"#60A5FA":"#94A3B8"}}>{day}</span>
              <div style={{marginTop:1}}>
                {de.slice(0,3).map(e=>{const ct=CATS[e.category]||CATS.Acting,hm=gM(e,cts).length>0;
                  return(<div key={e.id} onClick={()=>onS(e)} style={{fontSize:8,padding:"1px 2px",marginBottom:1,borderRadius:2,background:`${ct.c}22`,color:ct.c,cursor:"pointer",borderLeft:`2px solid ${ct.c}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {hm&&<span style={{color:"#10B981"}}>●</span>}{att[e.id]&&<span style={{color:"#FCD34D"}}>★</span>}{e.name.slice(0,18)}{e.name.length>18?"…":""}
                  </div>);
                })}
                {de.length>3&&<div style={{fontSize:8,color:"#64748B"}}>+{de.length-3}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
        {Object.entries(CATS).map(([n,c])=><span key={n} style={{fontSize:9,color:"#64748B",display:"flex",alignItems:"center",gap:2}}><span style={{width:7,height:7,borderRadius:2,background:c.c,display:"inline-block"}}/>{n}</span>)}
        <span style={{fontSize:9,color:"#10B981"}}>● Match</span><span style={{fontSize:9,color:"#FCD34D"}}>★ Attending</span>
      </div>
    </div>
  );
}

// ─── MAP ──────────────────────────────────────────────────────────
function MapV({ev,cts,att,onS}){
  const mL=40.70,ML=40.80,mg=-74.02,MG=-73.93;
  const tX=g=>((g-mg)/(MG-mg))*100, tY=l=>(1-(l-mL)/(ML-mL))*100;
  const nyc=ev.filter(e=>e.lat>=mL-0.02&&e.lat<=ML+0.02&&e.lng>=mg-0.02&&e.lng<=MG+0.02);
  const out=ev.filter(e=>e.lat<mL-0.02||e.lat>ML+0.02||e.lng<mg-0.02||e.lng>MG+0.02);
  return(
    <div>
      <h2 style={{margin:"0 0 8px",fontSize:15,fontWeight:600,color:"#F8FAFC"}}><MapPin size={15} style={{verticalAlign:"middle",marginRight:4}}/>NYC Event Map</h2>
      <div style={{position:"relative",width:"100%",paddingBottom:"65%",background:"linear-gradient(180deg,#1a2744,#162035)",borderRadius:10,border:"1px solid #334155",overflow:"hidden"}}>
        {[20,40,60,80].map(p=><div key={`h${p}`} style={{position:"absolute",left:0,right:0,top:`${p}%`,height:1,background:"#ffffff05"}}/>)}
        {[20,40,60,80].map(p=><div key={`v${p}`} style={{position:"absolute",top:0,bottom:0,left:`${p}%`,width:1,background:"#ffffff05"}}/>)}
        <div style={{position:"absolute",left:"45%",top:"8%",width:"22%",height:"32%",background:"#16653415",border:"1px solid #16653425",borderRadius:4}}/>
        {[{l:"Central Park",x:55,y:15},{l:"Midtown",x:36,y:38},{l:"Times Sq",x:32,y:43},{l:"Chelsea",x:32,y:56},{l:"Greenwich",x:40,y:68}].map(p=>(
          <div key={p.l} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,fontSize:8,color:"#47556980",fontStyle:"italic",pointerEvents:"none"}}>{p.l}</div>
        ))}
        {nyc.map(e=>{const x=tX(e.lng),y_=tY(e.lat),ct=CATS[e.category]||CATS.Acting,hm=gM(e,cts).length>0;
          return(
            <div key={e.id} onClick={()=>onS(e)} style={{position:"absolute",left:`${x}%`,top:`${y_}%`,transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:10,textAlign:"center"}}>
              <div style={{width:hm?24:18,height:hm?24:18,borderRadius:"50%",background:ct.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:hm?12:10,border:att[e.id]?"2px solid #FCD34D":hm?"2px solid #10B981":"2px solid #0F172A",boxShadow:`0 0 8px ${ct.c}40`}}>{ct.i}</div>
              <div style={{fontSize:7,color:"#CBD5E1",marginTop:1,background:"#0F172ACC",padding:"0 2px",borderRadius:2,maxWidth:65,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name.split("—")[0].trim().slice(0,14)}</div>
            </div>
          );
        })}
      </div>
      {out.length>0&&(<div style={{marginTop:10}}><h3 style={{fontSize:12,color:"#94A3B8",margin:"0 0 5px"}}>Outside NYC</h3>
        {out.map(e=><div key={e.id} onClick={()=>onS(e)} style={{padding:"5px 8px",background:"#1E293B",borderRadius:6,border:"1px solid #334155",marginBottom:3,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          <span>{(CATS[e.category]||CATS.Acting).i}</span><div><div style={{fontSize:11,fontWeight:500,color:"#E2E8F0"}}>{e.name}</div><div style={{fontSize:9,color:"#64748B"}}>{e.address}•{fD(e.dateStart)}</div></div>
        </div>)}
      </div>)}
    </div>
  );
}

// ─── LIST ─────────────────────────────────────────────────────────
function LstV({ev,cts,att,onS}){
  const s=[...ev].sort((a,b)=>pD(a.dateStart)-pD(b.dateStart));
  return(
    <div>
      <h2 style={{margin:"0 0 10px",fontSize:15,fontWeight:600,color:"#F8FAFC"}}>All Events ({s.length})</h2>
      {s.map(e=>{const ct=CATS[e.category]||CATS.Acting,ms=gM(e,cts),pr=PRI[e.priority]||PRI.medium;
        return(
          <div key={e.id} onClick={()=>onS(e)} style={{padding:12,background:"#1E293B",borderRadius:7,border:att[e.id]?"1px solid #FCD34D35":"1px solid #334155",borderLeft:`3px solid ${ct.c}`,cursor:"pointer",marginBottom:5}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                  <span style={{fontSize:15}}>{ct.i}</span>
                  <h3 style={{margin:0,fontSize:13,fontWeight:600,color:"#F8FAFC"}}>{e.name}</h3>
                  {att[e.id]&&<span style={{...TG("#FCD34D"),fontSize:9}}>★ Attending</span>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:3}}>
                  <span style={{fontSize:10,color:"#94A3B8",display:"flex",alignItems:"center",gap:2}}><Calendar size={10}/> {fD(e.dateStart)}{e.dateStart!==e.dateEnd?` – ${fD(e.dateEnd)}`:""}</span>
                  <span style={{fontSize:10,color:"#94A3B8",display:"flex",alignItems:"center",gap:2}}><MapPin size={10}/> {e.venue}</span>
                  {e.source&&<span style={{fontSize:9,padding:"1px 5px",background:"#334155",borderRadius:3,color:"#64748B"}}>{e.source}</span>}
                </div>
                <p style={{margin:"4px 0 0",fontSize:10,color:"#64748B",lineHeight:1.4}}>{e.description.slice(0,110)}...</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
                <span style={TG(pr.c)}>{pr.l}</span>
                <span style={TG(ct.c)}>{e.type}</span>
                {ms.length>0&&<span style={{...TG("#10B981"),display:"flex",alignItems:"center",gap:2}}><UserCheck size={9}/>{ms.length}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DETAIL ───────────────────────────────────────────────────────
function Det({ev,cts,isA,onA}){
  const ct=CATS[ev.category]||CATS.Acting,ms=gM(ev,cts),pr=PRI[ev.priority]||PRI.medium;
  return(
    <div>
      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
        <span style={{fontSize:22}}>{ct.i}</span><span style={TG(ct.c)}>{ev.category}</span><span style={TG(pr.c)}>{pr.l}</span>
        {ev.source&&<span style={{fontSize:9,padding:"2px 6px",background:"#334155",borderRadius:3,color:"#64748B"}}>via {ev.source}</span>}
      </div>
      <h2 style={{margin:"0 0 8px",fontSize:15,fontWeight:700,color:"#F8FAFC",lineHeight:1.3}}>{ev.name}</h2>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#CBD5E1"}}><Calendar size={12} style={{color:"#64748B"}}/>{fDF(ev.dateStart)}{ev.dateStart!==ev.dateEnd?` – ${fDF(ev.dateEnd)}`:""}</div>
        <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#CBD5E1"}}><Clock size={12} style={{color:"#64748B"}}/>{ev.time}</div>
        <div style={{display:"flex",alignItems:"flex-start",gap:5,fontSize:11,color:"#CBD5E1"}}><MapPin size={12} style={{color:"#64748B",marginTop:1,flexShrink:0}}/><div><div style={{fontWeight:500}}>{ev.venue}</div><div style={{fontSize:9,color:"#64748B"}}>{ev.address}</div></div></div>
      </div>
      <p style={{fontSize:11,color:"#94A3B8",lineHeight:1.5,margin:"0 0 12px"}}>{ev.description}</p>

      <div style={{marginBottom:12}}>
        <h3 style={{fontSize:11,fontWeight:600,color:"#E2E8F0",margin:"0 0 5px",display:"flex",alignItems:"center",gap:3}}><Users size={12}/> Speakers / Featured</h3>
        {ev.speakers.map((s,i)=>{const isM=ms.some(mc=>fuzzy(mc.org||"",s)||fuzzy(mc.name||"",s));
          return(<div key={i} style={{padding:"4px 7px",marginBottom:2,borderRadius:4,background:isM?"#10B98110":"#0F172A",border:isM?"1px solid #10B98120":"1px solid #253044",fontSize:10,color:isM?"#10B981":"#94A3B8",display:"flex",alignItems:"center",gap:3}}>
            {isM&&<UserCheck size={10}/>}{s}{isM&&<span style={{marginLeft:"auto",fontSize:8,color:"#10B981",opacity:.7}}>MATCH</span>}
          </div>);
        })}
      </div>

      {ms.length>0&&(
        <div style={{marginBottom:12,padding:8,background:"#10B9810A",borderRadius:7,border:"1px solid #10B98118"}}>
          <h3 style={{fontSize:11,fontWeight:600,color:"#10B981",margin:"0 0 5px",display:"flex",alignItems:"center",gap:3}}><Star size={12}/> Apollo Matches ({ms.length})</h3>
          <p style={{fontSize:9,color:"#6EE7B7",margin:"0 0 5px"}}>Pipeline contacts at this event!</p>
          {ms.slice(0,6).map((mc,i)=>(
            <div key={i} style={{padding:"5px 7px",background:"#0F172A",borderRadius:4,marginBottom:2,border:"1px solid #253044"}}>
              <div style={{fontSize:10,fontWeight:600,color:"#E2E8F0"}}>{mc.name} {mc.lastHint||""}</div>
              <div style={{fontSize:9,color:"#64748B"}}>{mc.title}•{mc.org}</div>
              <span style={{fontSize:8,padding:"1px 4px",background:"#334155",borderRadius:2,color:"#94A3B8"}}>{mc.tier}</span>
            </div>
          ))}
          {ms.length>6&&<div style={{fontSize:9,color:"#64748B"}}>+{ms.length-6} more</div>}
        </div>
      )}

      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:12}}>
        {(ev.tags||[]).map(t=><span key={t} style={{fontSize:9,padding:"2px 5px",background:"#334155",borderRadius:3,color:"#94A3B8"}}>{t}</span>)}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {ev.url&&<a href={ev.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"8px 12px",background:"#3B82F6",borderRadius:7,color:"#FFF",textDecoration:"none",fontSize:11,fontWeight:500}}><ExternalLink size={12}/>View Event Page</a>}
        <button onClick={onA} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"8px 12px",background:isA?"#FCD34D18":"#334155",border:isA?"1px solid #FCD34D":"1px solid #475569",borderRadius:7,color:isA?"#FCD34D":"#E2E8F0",fontSize:11,cursor:"pointer",fontWeight:500}}>
          {isA?<><Star size={12}/>Attending ★</>:<><Eye size={12}/>Mark Attending</>}
        </button>
      </div>
    </div>
  );
}