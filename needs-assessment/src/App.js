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
  { val: "all", label: "All of the above — our work touches students at multiple lifecycle stages" },
];

const TRAINING_OPTIONS = [
  { val: "formal", label: "Formal training or courses" },
  { val: "peer", label: "Learning from colleagues" },
  { val: "trial", label: "Trial and error — mostly self-taught" },
  { val: "vendor", label: "Vendor support or documentation" },
  { val: "none", label: "No structured approach" },
];

function FormView({ onSubmitSuccess }) {
  const emptyForm = {
    name: "", unit: "",
    reportingReality: "", unusedReports: "",
    blindspot: "",
    confidence: 0, distrustSource: "",
    urgentPeriods: "",
    magicWand: "",
    literacyLevel: "", trainingMethods: [], underusedTools: "",
    lifecycleRole: "", lifecycleData: "",
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
        lifecycle_role: form.lifecycleRole,
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
        <div className="section">
          <div className="q-num">01</div>
          <label className="q-text">What reports or data does your team currently rely on — and what does a typical reporting week or month look like for you?</label>
          <p className="q-hint">Include the systems you pull from, how often, and who the reports are for. Don't worry about being exhaustive — just describe what's most central to your work.</p>
          <textarea className="textarea" rows={4} placeholder="e.g. We pull weekly enrollment reports from Salesforce and share them with our director on Mondays. Most of it is manual — exported to Excel and formatted by hand…" value={form.reportingReality} onChange={e => update("reportingReality", e.target.value)} />
          <label className="field-label" style={{marginTop: 16}}>Are there reports your team produces that you're not sure anyone actually uses?</label>
          <input className="input" placeholder="Optional —
