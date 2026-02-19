import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const UNITS = ["Admissions","Business Services","Center for Pre-College Programs","Financial Aid","One-Stop","Registrar"];

const CONFIDENCE_LABELS = {
  1: "We're flying blind",
  2: "It's rough — we question a lot of what we see",
  3: "Functional but we have doubts",
  4: "Pretty solid — we trust it mostly",
  5: "We trust our data fully",
};
const CONFIDENCE_EMOJI = { 1: "😬", 2: "😟", 3: "😐", 4: "🙂", 5: "✅" };

const LITERACY_LEVELS = [
  { val: "1", label: "Needs significant support — most staff avoid data tools without help" },
  { val: "2", label: "Can read reports but struggles to interpret or act on them independently" },
  { val: "3", label: "Functional — team uses existing reports but rarely explores beyond them" },
  { val: "4", label: "Confident — most staff can use dashboards and tools independently" },
  { val: "5", label: "Advanced — some staff build their own queries or extend existing tools" },
];

const LIFECYCLE_OPTIONS = [
  { val: "pre_college", label: "Before students apply — working with middle and high school students (grades 7–12) through the Center for Pre-College Programs who may one day enroll at RU-N" },
  { val: "pre_enroll", label: "During the application and admission process — recruitment, admission, or early engagement with prospective students" },
  { val: "transition", label: "At key transition points — deposit, orientation, first registration" },
  { val: "year_round", label: "Year-round — ongoing support that directly affects whether students stay enrolled" },
  { val: "return", label: "At re-enrollment — when students decide whether to come back each term" },
];

const TRAINING_OPTIONS = [
  { val: "formal", label: "Formal training or courses" },
  { val: "peer", label: "Learning from colleagues" },
  { val: "trial", label: "Trial and error — mostly self-taught" },
  { val: "vendor", label: "Vendor support or documentation" },
  { val: "none", label: "No structured approach" },
];

// ─── FORM ────────────────────────────────────────────────────────────────────

function FormView({ onSubmitSuccess }) {
  const emptyForm = {
    name: "", unit: "",
    reportingReality: "", unusedReports: "",
    blindspot: "",
    confidence: 0, distrustSource: "",
    urgentPeriods: "",
    magicWand: "",
    literacyLevel: "", trainingMethods: [], underusedTools: "",
    lifecycleRoles: [], lifecycleData: "",
    dataContact: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [intro, setIntro] = useState(true);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  const handleSubmit = async () => {
    if (!form.name || !form.unit) {
      setError("Please enter your name and unit before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { error: dbError } = await supabase.from("responses").insert([{
        name: form.name,
        unit: form.unit,
        reporting_reality: form.reportingReality,
        unused_reports: form.unusedReports,
        blindspot: form.blindspot,
        confidence: form.confidence || null,
        distrust_source: form.distrustSource,
        urgent_periods: form.urgentPeriods,
        magic_wand: form.magicWand,
        literacy_level: form.literacyLevel || null,
        training_methods: form.trainingMethods,
        underused_tools: form.underusedTools,
        lifecycle_role: form.lifecycleRoles,
        lifecycle_data: form.lifecycleData,
        data_contact: form.dataContact,
        submitted_at: new Date().toISOString(),
      }]);
      if (dbError) throw dbError;
      onSubmitSuccess(form.name, form.unit);
    } catch (e) {
      console.error(e);
      setError("Something went wrong saving your response. Please try again.");
    }
    setSubmitting(false);
  };

  if (intro) return (
    <div className="screen-dark">
      <style>{css}</style>
      <div className="intro-card">
        <div className="tag">ENROLLMENT MANAGEMENT · DATA & ANALYTICS</div>
        <h1 className="display-title">Before We Meet</h1>
        <p className="display-sub">A thought starter from your Director of Data Analytics</p>
        <div className="rule" />
        <p className="prose">I'm meeting with each director across the division to understand how your team uses data today and where analytics support can make the biggest difference for you. Your answers here shape our conversation — no prep, no reports to pull, just your honest perspective.</p>
        <p className="prose">This takes <strong>6–8 minutes</strong> and covers seven areas. Your responses are shared only with me and used only to prepare for our one-on-one.</p>
        <button className="btn-primary" onClick={() => setIntro(false)}>Get Started →</button>
        <p className="fine-print">7 questions · 6–8 minutes · no wrong answers</p>
      </div>
    </div>
  );

  return (
    <div className="screen-light">
      <style>{css}</style>
      <div className="form-wrap">

        <div className="form-header">
          <div className="tag">ENROLLMENT MANAGEMENT · DATA NEEDS ASSESSMENT</div>
          <h2 className="form-title">Pre-Meeting Thought Starter</h2>
          <p className="form-sub">Responses are shared only with the Director of Data Analytics to prepare for your conversation.</p>
        </div>

        {/* Who you are */}
        <div className="section">
          <div className="section-label">About You</div>
          <div className="field-row">
            <div className="field">
              <label className="field-label">Your Name</label>
              <input className="input" placeholder="First and last name" value={form.name} onChange={e => update("name", e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Your Unit</label>
              <select className="input" value={form.unit} onChange={e => update("unit", e.target.value)}>
                <option value="">Select your unit…</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Q1 */}
        <div className="section">
          <div className="q-num">01</div>
          <label className="q-text">What reports or data does your team currently rely on — and what does a typical reporting week or month look like for you?</label>
          <p className="q-hint">Include the systems you pull from, how often, and who the reports are for. Don't worry about being exhaustive — just describe what's most central to your work.</p>
          <textarea className="textarea" rows={4} placeholder="e.g. We pull weekly enrollment reports from Salesforce and share them with our director on Mondays. Most of it is manual — exported to Excel and formatted by hand…" value={form.reportingReality} onChange={e => update("reportingReality", e.target.value)} />
          <label className="field-label" style={{marginTop: 16}}>Are there reports your team produces that you're not sure anyone actually uses?</label>
          <input className="input" placeholder="Optional — describe if relevant" value={form.unusedReports} onChange={e => update("unusedReports", e.target.value)} />
        </div>

        {/* Q2 */}
        <div className="section">
          <div className="q-num">02</div>
          <label className="q-text">Think about a moment when your team had to make a decision without the data you needed. What were you missing — and what did you end up doing?</label>
          <p className="q-hint">This is the most important question in the form. Be as specific or as general as you'd like — there's no wrong answer here.</p>
          <textarea className="textarea" rows={4} placeholder="e.g. During peak registration we had no real-time view of which students had outstanding holds that would block them from enrolling. We were making calls based on last week's list and some students fell through the cracks…" value={form.blindspot} onChange={e => update("blindspot", e.target.value)} />
        </div>

        {/* Q3 */}
        <div className="section">
          <div className="q-num">03</div>
          <label className="q-text">How confident is your team in the accuracy and reliability of the data you currently work with?</label>
          <p className="q-hint">Be honest — this is one of the most useful signals I can have before we meet.</p>
          <div className="rating-row">
            {[1,2,3,4,5].map(n => (
              <button key={n} className={`rating-btn ${form.confidence === n ? "rating-active" : ""}`} onClick={() => update("confidence", n)}>
                <span className="rating-num">{n}</span>
              </button>
            ))}
          </div>
          {form.confidence > 0 && (
            <div className="rating-label">
              <span>{CONFIDENCE_EMOJI[form.confidence]}</span>
              <span>{CONFIDENCE_LABELS[form.confidence]}</span>
            </div>
          )}
          <div className="rating-ends"><span>1 = Flying blind</span><span>5 = Fully confident</span></div>
          <label className="field-label" style={{marginTop: 16}}>Is there a specific system, source, or report your team is skeptical of — or that has led you in the wrong direction before?</label>
          <input className="input" placeholder="Optional — name the system or describe the situation" value={form.distrustSource} onChange={e => update("distrustSource", e.target.value)} />
        </div>

        {/* Q4 */}
        <div className="section">
          <div className="q-num">04</div>
          <label className="q-text">When in the year does your team need data most urgently — and are there moments when a report that arrives even one week late becomes useless?</label>
          <p className="q-hint">Think about enrollment cycles, compliance deadlines, registration windows, re-enrollment periods — any moment when timing really matters.</p>
          <textarea className="textarea" rows={3} placeholder="e.g. Our most critical window is October through December when students are deciding whether to return in the spring. If we don't have re-enrollment data by mid-October we can't intervene in time…" value={form.urgentPeriods} onChange={e => update("urgentPeriods", e.target.value)} />
        </div>

        {/* Q5 */}
        <div className="section">
          <div className="q-num">05</div>
          <label className="q-text">If you could wave a magic wand and have one report or dashboard that doesn't exist today — what would it show you, and who on your team would use it most?</label>
          <p className="q-hint">Dream big. This is exactly the kind of thing I want to know about before we meet.</p>
          <textarea className="textarea" rows={3} placeholder="e.g. A live view of every student with an outstanding balance hold broken down by school, residency status, and aid type — something my team could check each morning during registration season and act on same day…" value={form.magicWand} onChange={e => update("magicWand", e.target.value)} />
        </div>

        {/* Q6 */}
        <div className="section">
          <div className="q-num">06</div>
          <label className="q-text">How would you describe your team's current comfort level with data — their ability to access, read, and act on it independently?</label>
          <p className="q-hint">Choose the option that best describes where most of your team is today — not your most advanced person or your least experienced.</p>
          <div className="option-stack">
            {LITERACY_LEVELS.map(o => (
              <button key={o.val} className={`option-btn ${form.literacyLevel === o.val ? "option-active" : ""}`} onClick={() => update("literacyLevel", o.val)}>
                <span className="option-num">{o.val}</span>
                <span className="option-label">{o.label}</span>
              </button>
            ))}
          </div>
          <label className="field-label" style={{marginTop: 20}}>How does your team currently build data skills? Select all that apply.</label>
          <div className="check-row">
            {TRAINING_OPTIONS.map(o => (
              <button key={o.val} className={`check-btn ${form.trainingMethods.includes(o.val) ? "check-active" : ""}`} onClick={() => toggleArr("trainingMethods", o.val)}>
                {o.label}
              </button>
            ))}
          </div>
          <label className="field-label" style={{marginTop: 16}}>Are there tools your team has access to but isn't fully using — because people aren't sure how?</label>
          <input className="input" placeholder="e.g. Salesforce dashboards, Othot, Banner reporting…" value={form.underusedTools} onChange={e => update("underusedTools", e.target.value)} />
        </div>

        {/* Q7 */}
        <div className="section section-lifecycle">
          <div className="q-num lifecycle-num">07</div>
          <label className="q-text">How would you describe where your unit's work shows up in students' enrollment journey — from their first connection with RU-N through graduation and return?</label>
          <p className="q-hint">Select all that apply. There's no right answer — this helps me understand how your team thinks about your role in student outcomes.</p>
          <div className="check-row" style={{flexDirection:'column', gap: 8}}>
            {LIFECYCLE_OPTIONS.map(o => (
              <button key={o.val} className={`check-btn lifecycle-check ${form.lifecycleRoles.includes(o.val) ? "check-active lifecycle-check-active" : ""}`} onClick={() => toggleArr("lifecycleRoles", o.val)}>
                <span className="lifecycle-check-box">{form.lifecycleRoles.includes(o.val) ? "✓" : ""}</span>
                {o.label}
              </button>
            ))}
          </div>
          <label className="field-label" style={{marginTop: 20}}>Is there a specific data point or metric in your unit's work that you think directly affects whether students enroll, stay, or return — even if that connection isn't always visible to the rest of the division?</label>
          <textarea className="textarea" rows={3} placeholder="e.g. Our hold resolution time directly affects whether students re-enroll in the spring — but Admissions doesn't see that data and neither does anyone else in the division. We're sitting on an early warning signal that no one is using…" value={form.lifecycleData} onChange={e => update("lifecycleData", e.target.value)} />
        </div>

        {/* Optional */}
        <div className="section section-optional">
          <div className="optional-tag">OPTIONAL</div>
          <label className="q-text">Who on your team is the go-to person when data questions come up? Feel free to share their name and title.</label>
          <input className="input" placeholder="Name and title" value={form.dataContact} onChange={e => update("dataContact", e.target.value)} />
        </div>

        {error && <div className="error-bar">{error}</div>}

        <div className="submit-row">
          <p className="submit-note">Your response is shared only with the Associate Director of Analytics and used only to prepare for your scheduled conversation.</p>
          <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit My Responses →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── THANK YOU ───────────────────────────────────────────────────────────────

function ThankYouView({ name, unit }) {
  return (
    <div className="screen-dark">
      <style>{css}</style>
      <div className="intro-card">
        <div className="check-circle">✓</div>
        <h1 className="display-title">You're all set, {name.split(" ")[0]}.</h1>
        <p className="display-sub">{unit} · Response received</p>
        <div className="rule" />
        <p className="prose">Your answers have been saved and I'll review them before we meet. Looking forward to our conversation. If anything else comes to mind in the meantime, reach out directly.</p>
        <p className="prose" style={{color:"#CC0033",fontWeight:600}}>— Director of Data Analytics, Enrollment Management</p>
      </div>
    </div>
  );
}


// ─── ANALYTICS DASHBOARD ─────────────────────────────────────────────────────

function AnalyticsDashboard({ responses }) {
  const confColor = n => n <= 2 ? '#CC0033' : n === 3 ? '#E07800' : '#1A7A3C';
  const confBg    = n => n <= 2 ? '#FFF0F2' : n === 3 ? '#FFF8F0' : '#F0FAF4';

  // ── Confidence by unit ──────────────────────────────────────────────
  const confByUnit = UNITS.map(u => {
    const r = responses.find(x => x.unit === u);
    return { unit: u, score: r?.confidence || null };
  });
  const maxConf = 5;

  // ── Literacy distribution ───────────────────────────────────────────
  const litCounts = [1,2,3,4,5].map(l => ({
    level: l,
    units: responses.filter(r => String(r.literacy_level) === String(l)).map(r => r.unit),
  }));
  const litColors = ['#CC0033','#E07800','#E8B84B','#1565A0','#1A7A3C'];
  const litLabels = ['Needs support','Can read reports','Functional','Confident','Advanced'];

  // ── Lifecycle overlap ───────────────────────────────────────────────
  const lifecycleShort = [
    { val:'pre_college', label:'Pre-College' },
    { val:'pre_enroll',  label:'Application' },
    { val:'transition',  label:'Transitions' },
    { val:'year_round',  label:'Year-Round'  },
    { val:'return',      label:'Re-Enroll'   },
  ];
  const lifecycleCounts = lifecycleShort.map(o => ({
    ...o,
    units: responses.filter(r => Array.isArray(r.lifecycle_role) && r.lifecycle_role.includes(o.val)).map(r => r.unit),
  }));

  // ── Cross-unit signals ──────────────────────────────────────────────
  const signals = [
    { label:'Low data trust (1–2)',       units: responses.filter(r=>r.confidence<=2 && r.confidence>0).map(r=>r.unit),                                       color:'#CC0033', bg:'#FFF0F2' },
    { label:'Low literacy (L1–2)',         units: responses.filter(r=>['1','2'].includes(String(r.literacy_level))).map(r=>r.unit),                             color:'#E07800', bg:'#FFF8F0' },
    { label:'Year-round support role',     units: responses.filter(r=>Array.isArray(r.lifecycle_role)&&r.lifecycle_role.includes('year_round')).map(r=>r.unit), color:'#1565A0', bg:'#EEF4FB' },
    { label:'Underused tools flagged',     units: responses.filter(r=>r.underused_tools?.trim()).map(r=>r.unit),                                               color:'#6A1B9A', bg:'#F8F4FF' },
    { label:'Has magic wand request',      units: responses.filter(r=>r.magic_wand?.trim()).map(r=>r.unit),                                                    color:'#1A7A3C', bg:'#F0FAF4' },
    { label:'Distrust a specific source',  units: responses.filter(r=>r.distrust_source?.trim()).map(r=>r.unit),                                               color:'#CC0033', bg:'#FFF0F2' },
  ];

  const avgConf = responses.filter(r=>r.confidence).length > 0
    ? (responses.filter(r=>r.confidence).reduce((a,r)=>a+r.confidence,0) / responses.filter(r=>r.confidence).length)
    : null;

  return (
    <div style={{marginTop:24}}>

      {/* ── Section header ── */}
      <div style={{fontSize:10,letterSpacing:2,fontWeight:600,color:'#CC0033',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>
        DIVISION ANALYTICS
      </div>

      {/* ── Row 1: Confidence bar chart + avg stat ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 200px',gap:12,marginBottom:12}}>
        <div style={{background:'#fff',border:'1px solid #E8E3DD',borderRadius:2,padding:'20px 24px'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#666',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Data Confidence by Unit</div>
          {confByUnit.map(({unit,score}) => (
            <div key={unit} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:12,color:'#444',fontFamily:"'DM Sans',sans-serif",maxWidth:200,lineHeight:1.3}}>{unit}</span>
                <span style={{fontSize:12,fontWeight:700,color:score?confColor(score):'#CCC',fontFamily:"'DM Sans',sans-serif",minWidth:40,textAlign:'right'}}>
                  {score ?  : 'Pending'}
                </span>
              </div>
              <div style={{background:'#F5F0EB',borderRadius:2,height:10,overflow:'hidden'}}>
                <div style={{width:,height:'100%',background:score?confColor(score):'transparent',borderRadius:2,transition:'width .4s ease'}} />
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'#0D0D0D',borderRadius:2,padding:'20px 16px',flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:48,color:avgConf?confColor(Math.round(avgConf)):'#555',lineHeight:1}}>
              {avgConf ? avgConf.toFixed(1) : '—'}
            </div>
            <div style={{fontSize:10,color:'#666',fontFamily:"'DM Sans',sans-serif",marginTop:8,letterSpacing:1,textTransform:'uppercase'}}>Avg Confidence</div>
          </div>
          <div style={{background:'#0D0D0D',borderRadius:2,padding:'16px',flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:48,color:'#CC0033',lineHeight:1}}>
              {UNITS.filter(u=>!responses.find(r=>r.unit===u)).length}
            </div>
            <div style={{fontSize:10,color:'#666',fontFamily:"'DM Sans',sans-serif",marginTop:8,letterSpacing:1,textTransform:'uppercase'}}>Still Pending</div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Literacy + Lifecycle side by side ── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>

        {/* Literacy */}
        <div style={{background:'#fff',border:'1px solid #E8E3DD',borderRadius:2,padding:'20px 24px'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#666',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Data Literacy Levels</div>
          {litCounts.map(({level,units},i) => (
            <div key={level} style={{marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <div style={{background:litColors[i],color:'#fff',fontSize:10,fontWeight:700,borderRadius:2,padding:'2px 7px',fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>L{level}</div>
                <span style={{fontSize:11,color:'#888',fontFamily:"'DM Sans',sans-serif"}}>{litLabels[i]}</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {units.length > 0
                  ? units.map(u => <span key={u} style={{fontSize:11,background:litColors[i]+'22',color:litColors[i],border:,borderRadius:2,padding:'2px 8px',fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{u}</span>)
                  : <span style={{fontSize:11,color:'#CCC',fontFamily:"'DM Sans',sans-serif"}}>No responses yet</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Lifecycle overlap */}
        <div style={{background:'#F8F4FF',border:'1px solid #DDD0EE',borderRadius:2,padding:'20px 24px'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#6A1B9A',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Lifecycle Stage Overlap</div>
          {lifecycleCounts.map(({val,label,units}) => (
            <div key={val} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                <span style={{fontSize:12,color:'#444',fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
                <span style={{fontSize:11,fontWeight:700,color:'#6A1B9A',fontFamily:"'DM Sans',sans-serif"}}>{units.length}/{responses.length}</span>
              </div>
              <div style={{background:'#E8D5F5',borderRadius:2,height:8,overflow:'hidden',marginBottom:3}}>
                <div style={{width:responses.length>0?:'0%',height:'100%',background:'#6A1B9A',borderRadius:2,transition:'width .4s ease'}} />
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                {units.map(u=><span key={u} style={{fontSize:10,color:'#6A1B9A',background:'#F3E5FF',border:'1px solid #DDD0EE',borderRadius:2,padding:'1px 6px',fontFamily:"'DM Sans',sans-serif"}}>{u}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 3: Cross-unit signals ── */}
      <div style={{background:'#0D0D0D',borderRadius:2,padding:'20px 24px',marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:600,color:'#666',letterSpacing:2,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Cross-Unit Signals</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {signals.map((s,i) => (
            <div key={i} style={{background:'#1A1A1A',borderRadius:2,padding:'14px 16px',borderLeft:}}>
              <div style={{fontSize:10,color:'#888',fontFamily:"'DM Sans',sans-serif",marginBottom:8,lineHeight:1.4}}>{s.label}</div>
              {s.units.length > 0
                ? s.units.map(u=><div key={u} style={{fontSize:12,color:'#fff',fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{u}</div>)
                : <div style={{fontSize:12,color:'#444',fontFamily:"'DM Sans',sans-serif"}}>None yet</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 4: Priority signals — magic wand requests ── */}
      {responses.some(r=>r.magic_wand?.trim()) && (
        <div style={{background:'#fff',border:'1px solid #E8E3DD',borderRadius:2,padding:'20px 24px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:600,color:'#666',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Magic Wand Requests — What Directors Want Built</div>
          {responses.filter(r=>r.magic_wand?.trim()).map((r,i)=>(
            <div key={i} style={{borderLeft:'3px solid #1565A0',paddingLeft:12,marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:'#1565A0',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>{r.unit}</div>
              <div style={{fontSize:13,color:'#333',fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{r.magic_wand}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Row 5: Blind spots ── */}
      {responses.some(r=>r.blindspot?.trim()) && (
        <div style={{background:'#fff',border:'1px solid #E8E3DD',borderRadius:2,padding:'20px 24px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:600,color:'#666',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>Blind Spots & Data Gaps — What Directors Are Missing</div>
          {responses.filter(r=>r.blindspot?.trim()).map((r,i)=>(
            <div key={i} style={{borderLeft:'3px solid #CC0033',paddingLeft:12,marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:700,color:'#CC0033',letterSpacing:1,textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>{r.unit}</div>
              <div style={{fontSize:13,color:'#333',fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{r.blindspot}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────

function AdminView({ onBack }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("responses")
          .select("*")
          .order("submitted_at", { ascending: false });
        if (error) throw error;
        setResponses(data || []);
      } catch (e) {
        console.error(e);
        setResponses([]);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "All" ? responses : responses.filter(r => r.unit === filter);
  const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  const confColor = n => n <= 2 ? "#CC0033" : n === 3 ? "#E07800" : "#1A7A3C";
  const litLabel = v => LITERACY_LEVELS.find(l => l.val === String(v))?.label || "—";
  const lifecycleLabel = arr => {
    if (!arr || arr.length === 0) return "—";
    return arr.map(v => LIFECYCLE_OPTIONS.find(l => l.val === v)?.label).filter(Boolean).join(" · ");
  };
  const trainingLabel = arr => (arr || []).map(v => TRAINING_OPTIONS.find(o => o.val === v)?.label).filter(Boolean).join(", ") || "—";
  const pending = UNITS.filter(u => !responses.find(r => r.unit === u));
  const avgConf = responses.filter(r => r.confidence).length > 0
    ? (responses.filter(r => r.confidence).reduce((a,r) => a + r.confidence, 0) / responses.filter(r => r.confidence).length).toFixed(1)
    : "—";

  return (
    <div className="screen-light">
      <style>{css}</style>
      <div className="admin-wrap">
        <div className="admin-header">
          <div>
            <div className="tag">ADMIN VIEW · DATA NEEDS ASSESSMENT</div>
            <h2 className="form-title" style={{marginTop:8}}>Director Responses</h2>
          </div>
          <button className="back-btn" onClick={onBack}>← Back to Form</button>
        </div>

        {responses.length > 0 && (
          <div className="summary-bar">
            <div className="sum-stat"><span className="sum-num">{responses.length}</span><span className="sum-lbl">Responses</span></div>
            <div className="sum-stat"><span className="sum-num">{new Set(responses.map(r=>r.unit)).size}</span><span className="sum-lbl">Units In</span></div>
            <div className="sum-stat">
              <span className="sum-num" style={{color: confColor(Math.round(parseFloat(avgConf)))}}>{avgConf}</span>
              <span className="sum-lbl">Avg. Confidence</span>
            </div>
            <div className="sum-stat">
              <span className="sum-num" style={{color:"#CC0033"}}>{pending.length}</span>
              <span className="sum-lbl">Still Pending</span>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="pending-bar">
            <span className="pending-label">Awaiting responses from:</span>
            {pending.map(u => <span key={u} className="pending-tag">{u}</span>)}
          </div>
        )}

        <div className="filter-bar">
          {["All", ...UNITS].map(u => (
            <button key={u} className={`filter-btn ${filter===u?"filter-active":""}`} onClick={() => setFilter(u)}>
              {u} {u !== "All" && <span className="filter-count">{responses.filter(r=>r.unit===u).length}</span>}
            </button>
          ))}
        </div>

        {loading && <div className="empty">Loading responses…</div>}
        {!loading && filtered.length === 0 && <div className="empty">No responses yet{filter !== "All" ? ` from ${filter}` : ""}.</div>}

        <div className="response-list">
          {filtered.map((r, i) => (
            <div key={r.id || i} className={`r-card ${selected===i?"r-card-open":""}`} onClick={() => setSelected(selected===i?null:i)}>
              <div className="r-card-top">
                <div className="r-meta">
                  <span className="r-name">{r.name}</span>
                  <span className="r-unit-tag">{r.unit}</span>
                  {r.confidence > 0 && <span className="r-conf" style={{color:confColor(r.confidence)}}>Confidence {r.confidence}/5</span>}
                  {r.literacy_level && <span className="r-lit">Literacy L{r.literacy_level}</span>}
                </div>
                <div className="r-right">
                  <span className="r-date">{fmtDate(r.submitted_at)}</span>
                  <span className="r-arrow">{selected===i?"▲":"▼"}</span>
                </div>
              </div>
              {selected === i && (
                <div className="r-body">
                  {r.reporting_reality && <div className="r-field"><div className="r-field-label">Reporting Reality</div><div className="r-field-val">{r.reporting_reality}</div></div>}
                  {r.unused_reports && <div className="r-field"><div className="r-field-label">Reports No One Uses</div><div className="r-field-val">{r.unused_reports}</div></div>}
                  {r.blindspot && <div className="r-field"><div className="r-field-label">Blind Spot / Data Gap</div><div className="r-field-val">{r.blindspot}</div></div>}
                  {r.distrust_source && <div className="r-field"><div className="r-field-label">Data They Distrust</div><div className="r-field-val">{r.distrust_source}</div></div>}
                  {r.urgent_periods && <div className="r-field"><div className="r-field-label">Critical Data Windows</div><div className="r-field-val">{r.urgent_periods}</div></div>}
                  {r.magic_wand && <div className="r-field"><div className="r-field-label">Magic Wand Report</div><div className="r-field-val">{r.magic_wand}</div></div>}
                  <div className="r-field">
                    <div className="r-field-label">Data Literacy Level</div>
                    <div className="r-field-val">{r.literacy_level ? `Level ${r.literacy_level} — ${litLabel(r.literacy_level)}` : "—"}</div>
                  </div>
                  {r.training_methods?.length > 0 && <div className="r-field"><div className="r-field-label">How They Build Data Skills</div><div className="r-field-val">{trainingLabel(r.training_methods)}</div></div>}
                  {r.underused_tools && <div className="r-field"><div className="r-field-label">Underused Tools</div><div className="r-field-val">{r.underused_tools}</div></div>}
                  <div className="r-field lifecycle-field">
                    <div className="r-field-label">Student Lifecycle Stages</div>
                    <div className="r-field-val">{lifecycleLabel(r.lifecycle_role)}</div>
                  </div>
                  {r.lifecycle_data && <div className="r-field lifecycle-field"><div className="r-field-label">Hidden Enrollment Signal They Own</div><div className="r-field-val">{r.lifecycle_data}</div></div>}
                  {r.data_contact && <div className="r-field"><div className="r-field-label">Unit Data Contact</div><div className="r-field-val">{r.data_contact}</div></div>}
                </div>
              )}
            </div>
          ))}
        </div>

        {responses.length >= 1 && <AnalyticsDashboard responses={responses} />}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("form");
  const [dName, setDName] = useState("");
  const [dUnit, setDUnit] = useState("");

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setView(v => v === "admin" ? "form" : "admin");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (view === "admin") return <AdminView onBack={() => setView("form")} />;
  if (view === "thankyou") return <ThankYouView name={dName} unit={dUnit} />;
  return <FormView onSubmitSuccess={(n,u) => { setDName(n); setDUnit(u); setView("thankyou"); }} />;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .screen-dark { min-height: 100vh; background: #0D0D0D; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
  .screen-light { min-height: 100vh; background: #F7F4F1; padding: 40px 20px 80px; }
  .intro-card { background: #fff; max-width: 560px; width: 100%; border-radius: 2px; padding: 56px 48px; border-top: 5px solid #CC0033; animation: fadeUp .6s ease both; }
  .check-circle { width: 64px; height: 64px; background: #CC0033; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; margin: 0 auto 24px; }
  .tag { font-size: 10px; letter-spacing: 2.5px; font-weight: 600; color: #CC0033; text-transform: uppercase; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; }
  .display-title { font-family: 'DM Serif Display', serif; font-size: 40px; color: #0D0D0D; line-height: 1.1; margin-bottom: 8px; }
  .display-sub { font-size: 14px; color: #888; margin-bottom: 28px; font-family: 'DM Sans', sans-serif; }
  .rule { height: 1px; background: #E8E3DD; margin-bottom: 28px; }
  .prose { font-size: 15px; color: #444; line-height: 1.7; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; }
  .btn-primary { display: block; width: 100%; background: #CC0033; color: #fff; border: none; border-radius: 2px; padding: 16px 24px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 32px; transition: background .2s; }
  .btn-primary:hover { background: #A8002A; }
  .fine-print { text-align: center; font-size: 12px; color: #AAA; margin-top: 14px; font-family: 'DM Sans', sans-serif; }
  .form-wrap { max-width: 700px; margin: 0 auto; animation: fadeUp .5s ease both; }
  .form-header { background: #0D0D0D; border-top: 5px solid #CC0033; padding: 36px 40px 32px; border-radius: 2px 2px 0 0; }
  .form-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; margin-bottom: 10px; margin-top: 12px; }
  .form-sub { font-size: 13px; color: #888; line-height: 1.6; font-family: 'DM Sans', sans-serif; }
  .section { background: #fff; border-left: 1px solid #E8E3DD; border-right: 1px solid #E8E3DD; border-bottom: 1px solid #E8E3DD; padding: 32px 40px; position: relative; }
  .section-lifecycle { background: #F8F4FF; border-left: 3px solid #6A1B9A; }
  .section-optional { background: #FAFAF8; }
  .section-label { font-size: 10px; letter-spacing: 2px; font-weight: 600; color: #CC0033; text-transform: uppercase; margin-bottom: 20px; font-family: 'DM Sans', sans-serif; }
  .optional-tag { display: inline-block; font-size: 10px; letter-spacing: 2px; font-weight: 600; color: #888; text-transform: uppercase; border: 1px solid #DDD; border-radius: 2px; padding: 3px 8px; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; }
  .q-num { font-family: 'DM Serif Display', serif; font-size: 48px; color: #EEE8E2; position: absolute; top: 20px; right: 24px; line-height: 1; user-select: none; pointer-events: none; z-index: 0; }
  .lifecycle-num { color: #E8D5F5; }
  .q-text { display: block; font-size: 15px; color: #1A1A1A; line-height: 1.6; font-weight: 500; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; max-width: calc(100% - 64px); position: relative; z-index: 1; }
  .q-hint { font-size: 12.5px; color: #999; line-height: 1.5; margin-bottom: 16px; font-style: italic; font-family: 'DM Sans', sans-serif; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { display: flex; flex-direction: column; }
  .field-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #666; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; }
  .input { border: 1.5px solid #DDD; border-radius: 2px; padding: 12px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A1A; background: #FAFAF8; transition: border-color .15s; outline: none; width: 100%; }
  .input:focus { border-color: #CC0033; background: #fff; }
  .textarea { border: 1.5px solid #DDD; border-radius: 2px; padding: 14px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1A1A1A; background: #FAFAF8; resize: vertical; transition: border-color .15s; outline: none; width: 100%; line-height: 1.6; }
  .textarea:focus { border-color: #CC0033; background: #fff; }
  .rating-row { display: flex; gap: 10px; margin-bottom: 12px; }
  .rating-btn { flex: 1; max-width: 56px; aspect-ratio: 1; border: 1.5px solid #DDD; border-radius: 2px; background: #FAFAF8; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
  .rating-btn:hover { border-color: #CC0033; }
  .rating-active { background: #CC0033; border-color: #CC0033; }
  .rating-active .rating-num { color: #fff; }
  .rating-num { font-family: 'DM Serif Display', serif; font-size: 20px; color: #666; }
  .rating-label { font-size: 14px; color: #444; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; font-family: 'DM Sans', sans-serif; animation: fadeIn .2s ease; }
  .rating-ends { display: flex; justify-content: space-between; font-size: 11px; color: #AAA; font-family: 'DM Sans', sans-serif; }
  .option-stack { display: flex; flex-direction: column; gap: 8px; }
  .option-btn { display: flex; align-items: flex-start; gap: 12px; border: 1.5px solid #DDD; border-radius: 2px; padding: 12px 16px; background: #FAFAF8; cursor: pointer; text-align: left; transition: all .15s; font-family: 'DM Sans', sans-serif; }
  .option-btn:hover { border-color: #1565A0; }
  .option-active { background: #EEF4FB; border-color: #1565A0; }
  .lifecycle-active { background: #F3E5FF; border-color: #6A1B9A; }
  .option-num { font-family: 'DM Serif Display', serif; font-size: 20px; color: #1565A0; min-width: 24px; line-height: 1.2; }
  .option-label { font-size: 14px; color: #333; line-height: 1.5; padding-left: 4px; }
  .check-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .check-btn { border: 1.5px solid #DDD; border-radius: 2px; padding: 8px 14px; background: #FAFAF8; cursor: pointer; font-size: 13px; color: #555; font-family: 'DM Sans', sans-serif; transition: all .15s; }
  .check-btn:hover { border-color: #CC0033; }
  .check-active { background: #FFF0F2; border-color: #CC0033; color: #CC0033; font-weight: 600; }
  .error-bar { background: #FFF0F2; border-left: 3px solid #CC0033; padding: 14px 40px; font-size: 13px; color: #CC0033; font-family: 'DM Sans', sans-serif; border-right: 1px solid #E8E3DD; }
  .submit-row { background: #0D0D0D; border-radius: 0 0 2px 2px; padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
  .submit-note { font-size: 12px; color: #666; line-height: 1.5; max-width: 300px; font-family: 'DM Sans', sans-serif; }
  .btn-submit { background: #CC0033; color: #fff; border: none; border-radius: 2px; padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .2s; }
  .btn-submit:hover:not(:disabled) { background: #A8002A; }
  .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
  .admin-wrap { max-width: 820px; margin: 0 auto; }
  .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .back-btn { background: #fff; border: 1.5px solid #DDD; border-radius: 2px; padding: 8px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #444; cursor: pointer; transition: border-color .15s; }
  .back-btn:hover { border-color: #CC0033; color: #CC0033; }
  .summary-bar { background: #0D0D0D; border-radius: 2px; padding: 20px 28px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; margin-bottom: 16px; }
  .sum-stat { display: flex; flex-direction: column; gap: 4px; }
  .sum-num { font-family: 'DM Serif Display', serif; font-size: 32px; color: #fff; line-height: 1; }
  .sum-lbl { font-size: 11px; color: #666; font-family: 'DM Sans', sans-serif; }
  .pending-bar { background: #FFF8F0; border: 1px solid #FFDDB0; border-radius: 2px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .pending-label { font-size: 12px; color: #888; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .pending-tag { background: #FFE8CC; color: #E07800; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 2px; font-family: 'DM Sans', sans-serif; }
  .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .filter-btn { background: #fff; border: 1.5px solid #DDD; border-radius: 2px; padding: 6px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; color: #666; cursor: pointer; transition: all .15s; display: flex; align-items: center; gap: 6px; }
  .filter-btn:hover { border-color: #CC0033; color: #CC0033; }
  .filter-active { background: #CC0033; border-color: #CC0033; color: #fff; }
  .filter-count { background: rgba(255,255,255,.25); border-radius: 10px; padding: 1px 6px; font-size: 11px; }
  .empty { background: #fff; border: 1px solid #E8E3DD; border-radius: 2px; padding: 40px; text-align: center; color: #888; font-size: 14px; font-family: 'DM Sans', sans-serif; }
  .response-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
  .r-card { background: #fff; border: 1.5px solid #E8E3DD; border-radius: 2px; overflow: hidden; cursor: pointer; transition: border-color .15s; }
  .r-card:hover { border-color: #CC0033; }
  .r-card-open { border-color: #CC0033; border-top: 3px solid #CC0033; }
  .r-card-top { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; gap: 12px; flex-wrap: wrap; }
  .r-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .r-name { font-size: 15px; font-weight: 600; color: #1A1A1A; font-family: 'DM Sans', sans-serif; }
  .r-unit-tag { font-size: 11px; letter-spacing: 1px; font-weight: 600; text-transform: uppercase; color: #CC0033; background: #FFF0F2; padding: 3px 8px; border-radius: 2px; font-family: 'DM Sans', sans-serif; }
  .r-conf { font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
  .r-lit { font-size: 12px; color: #1565A0; font-weight: 600; background: #EEF4FB; padding: 2px 8px; border-radius: 2px; font-family: 'DM Sans', sans-serif; }
  .r-right { display: flex; align-items: center; gap: 12px; }
  .r-date { font-size: 12px; color: #AAA; font-family: 'DM Sans', sans-serif; }
  .r-arrow { font-size: 10px; color: #CCC; }
  .r-body { border-top: 1px solid #F0EBE5; padding: 20px; display: flex; flex-direction: column; gap: 16px; animation: fadeIn .2s ease; }
  .r-field { display: flex; flex-direction: column; gap: 4px; }
  .r-field-label { font-size: 10px; letter-spacing: 1.5px; font-weight: 600; text-transform: uppercase; color: #999; font-family: 'DM Sans', sans-serif; }
  .r-field-val { font-size: 14px; color: #333; line-height: 1.65; font-family: 'DM Sans', sans-serif; }
  .lifecycle-field .r-field-label { color: #6A1B9A; }
  .lifecycle-check { display: flex; align-items: flex-start; gap: 10px; text-align: left; padding: 12px 16px; font-size: 14px; color: #333; line-height: 1.5; width: 100%; }
  .lifecycle-check-active { background: #F3E5FF; border-color: #6A1B9A; color: #4A0080; font-weight: 500; }
  .lifecycle-check:hover { border-color: #6A1B9A; }
  .lifecycle-check-box { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 18px; border: 1.5px solid #CCC; border-radius: 2px; font-size: 11px; font-weight: 700; color: #6A1B9A; margin-top: 1px; flex-shrink: 0; background: #fff; }
  .lifecycle-check-active .lifecycle-check-box { background: #6A1B9A; border-color: #6A1B9A; color: #fff; }
  .themes-panel { background: #0D0D0D; border-radius: 2px; padding: 24px 28px; }
  .themes-title { font-size: 11px; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 16px; font-family: 'DM Sans', sans-serif; }
  .themes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .theme-card { background: #1A1A1A; border-radius: 2px; padding: 14px 16px; }
  .theme-label { font-size: 11px; color: #888; margin-bottom: 6px; font-family: 'DM Sans', sans-serif; line-height: 1.4; }
  .theme-val { font-size: 14px; color: #fff; font-weight: 600; font-family: 'DM Sans', sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @media (max-width: 560px) {
    .intro-card { padding: 36px 24px; }
    .section { padding: 24px 20px; }
    .form-header { padding: 28px 20px; }
    .field-row { grid-template-columns: 1fr; }
    .submit-row { flex-direction: column; align-items: stretch; }
    .summary-bar { grid-template-columns: repeat(2, 1fr); }
    .themes-grid { grid-template-columns: 1fr; }
    .admin-header { flex-direction: column; align-items: flex-start; }
  }
`;
