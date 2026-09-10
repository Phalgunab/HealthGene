import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import {
  Activity, ArrowUpRight, Bell, CalendarDays, Camera, ChevronDown, ChevronRight,
  FileText, HeartPulse, Home, Image, LockKeyhole, MoreHorizontal, Plus,
  Search, Settings, ShieldCheck, Sparkles, Upload, Users, X, ArrowLeft, Check, Smartphone
} from 'lucide-react';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const familyMembers = [
  { name: 'Phalguna Rao BAMMIDI', initial: 'P', tone: 'purple' },
  { name: 'Swetha NAYANI', initial: 'S', tone: 'blue' },
  { name: 'Vinay Kumar DURGAM', initial: 'V', tone: 'coral' },
];

const records = [
  { kind: 'lab', title: 'Annual blood work', source: 'Cedar Health Lab', date: 'Today', tone: 'lavender', icon: Activity, owner: 'Phalguna Rao BAMMIDI', hospital: 'Cedar Health Lab', doctor: 'Dr. Sofia Ramos', amount: '$180', notes: 'Routine lab work completed; no critical changes reported.' },
  { kind: 'report', title: 'Dermatology visit', source: 'Dr. Sofia Ramos', date: 'Aug 24', tone: 'peach', icon: FileText, owner: 'Phalguna Rao BAMMIDI', hospital: 'Northside Dermatology', doctor: 'Dr. Sofia Ramos', amount: '$120', notes: 'Skin checkup and treatment follow-up plan.' },
  { kind: 'image', title: 'Knee MRI scan', source: 'Riverview Imaging', date: 'Aug 12', tone: 'blue', icon: Image, owner: 'Swetha NAYANI', hospital: 'Riverview Imaging', doctor: 'Dr. K. Mehta', amount: '$440', notes: 'Knee MRI reviewed for pain management and recovery plan.' },
  { kind: 'report', title: 'Cardiology consultation', source: 'Mercy Heart Center', date: 'Sep 03', tone: 'mint', icon: ShieldCheck, owner: 'Swetha NAYANI', hospital: 'Mercy Heart Center', doctor: 'Dr. A. Nair', amount: '$260', notes: 'Blood pressure reviewed; continued monitoring advised.' },
  { kind: 'lab', title: 'Routine CBC panel', source: 'CityCare Diagnostics', date: 'Sep 08', tone: 'lavender', icon: Activity, owner: 'Vinay Kumar DURGAM', hospital: 'CityCare Diagnostics', doctor: 'Dr. L. Chowdary', amount: '$95', notes: 'Complete blood count normal; no follow-up needed.' },
  { kind: 'report', title: 'Orthopedic appointment', source: 'Greenfield Orthopedic Clinic', date: 'Sep 01', tone: 'peach', icon: FileText, owner: 'Vinay Kumar DURGAM', hospital: 'Greenfield Orthopedic Clinic', doctor: 'Dr. R. Singh', amount: '$175', notes: 'Mobility assessment and rehab exercise recommendations.' },
];

const recordKindConfig = {
  Scan: { title: 'Medical scan', source: 'Document scanned', tone: 'blue', icon: Camera },
  Upload: { title: 'Uploaded report', source: 'File uploaded', tone: 'lavender', icon: Upload },
  Photo: { title: 'Health photo', source: 'Photo captured', tone: 'peach', icon: Image },
};

const createRecordForm = (type = 'Scan') => ({
  type,
  title: recordKindConfig[type]?.title ?? 'New health record',
  visitDate: new Date().toISOString().slice(0, 10),
  hospital: '',
  doctor: '',
  amount: '',
  notes: '',
});

const parseIncomingMessage = (message = '') => {
  const text = message.trim();
  if (!text) return {};

  const clean = text.replace(/\s+/g, ' ').trim();
  const amountMatch = clean.match(/(?:amount|paid|bill|charge|payment|cost|total)[^\d]{0,20}\$?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i)
    || clean.match(/\$\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i)
    || clean.match(/(?:rs|inr|usd|usd\s*)\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i);

  const dateMatch = clean.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[-/ ]\d{1,2}[-/ ]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\d,]{1,10}\d{2,4})/i);
  const hospitalMatch = clean.match(/(?:hospital|clinic|medical center|center|facility)[^\n:]{0,30}[:\-]\s*([^\n.]+)/i)
    || clean.match(/(?:at|in)\s+([A-Z][A-Za-z0-9. &'-]+(?:Hospital|Clinic|Center|Medical Center|Care|Diagnostics|Institute))/i);
  const doctorMatch = clean.match(/(?:doctor|provider|physician|consultant|dr\.?|with)[^\n:]{0,25}[:\-]?\s*([A-Z][A-Za-z. '-]+(?:\s+[A-Z][A-Za-z. '-]+)*)/i);

  const title = clean.match(/(?:appointment|visit|consultation|checkup|procedure|lab|scan|test|follow-up)[^\n:]{0,25}[:\-]?\s*([^\n]+)/i)?.[1]?.trim()
    || 'Hospital visit';

  const value = amountMatch ? amountMatch[1].replace(/,/g, '') : '';
  const hospital = hospitalMatch ? hospitalMatch[1].replace(/[.\n]+$/g, '').trim() : '';
  const doctor = doctorMatch ? doctorMatch[1].replace(/^(?:dr\.?|doctor|provider|physician|consultant)\s+/i, '').replace(/[.\n]+$/g, '').trim() : '';
  const visitDate = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);

  return {
    title: title.length > 60 ? title.slice(0, 60).trim() : title,
    hospital: hospital || 'Hospital visit',
    doctor: doctor || 'Provider confirmed',
    amount: value ? `$${Number(value).toFixed(2).replace(/\.00$/, '')}` : '',
    visitDate: visitDate,
    notes: clean,
  };
};

const parseFileText = (text = '') => {
  if (!text) return {};
  const normalized = text.replace(/\s+/g, ' ').trim();
  return parseIncomingMessage(normalized);
};

const readPdfText = async (file) => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let extracted = '';

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    extracted += content.items.map((item) => item.str).join(' ') + '\n';
  }

  return extracted;
};

const handleUploadedDocument = async (file, setForm) => {
  if (!file) return;

  try {
    let text = '';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      text = await readPdfText(file);
    } else if (file.type.startsWith('image/')) {
      const { data } = await Tesseract.recognize(file, 'eng', { logger: () => {} });
      text = data?.text || '';
    }

    const parsed = parseFileText(text);
    if (Object.keys(parsed).length === 0) {
      setForm((current) => ({ ...current, notes: `Imported file: ${file.name}` }));
      return;
    }

    setForm((current) => ({
      ...current,
      ...parsed,
      title: parsed.title || current.title,
      hospital: parsed.hospital || current.hospital,
      doctor: parsed.doctor || current.doctor,
      amount: parsed.amount || current.amount,
      visitDate: parsed.visitDate || current.visitDate,
      notes: parsed.notes || current.notes,
    }));
  } catch (error) {
    console.error('Could not parse uploaded file', error);
  }
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState('Home');
  const [showAdd, setShowAdd] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [activePerson, setActivePerson] = useState('Phalguna Rao BAMMIDI');
  const [items, setItems] = useState(records);

  const addRecord = (type, details) => {
    const config = recordKindConfig[type] ?? recordKindConfig.Scan;
    const record = {
      kind: type.toLowerCase(),
      title: details?.title?.trim() || config.title,
      source: details?.hospital?.trim() || config.source,
      date: details?.visitDate || 'Just now',
      tone: config.tone,
      icon: config.icon,
      hospital: details?.hospital?.trim() || '',
      doctor: details?.doctor?.trim() || '',
      amount: details?.amount?.trim() || '',
      notes: details?.notes?.trim() || '',
    };

    setItems([record, ...items]);
    setShowAdd(false);
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 2800);
  };

  if (!authenticated) return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;

  return <main className="app-shell">
    <section className="mobile-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><HeartPulse size={17}/></span><span>FamilyHealth</span></div>
        <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={20}/></button><button className="avatar" onClick={() => setTab('Profile')} aria-label="Profile">MP</button></div>
      </header>

      <div className="content">
        {tab === 'Home' && <HomeScreen activePerson={activePerson} setActivePerson={setActivePerson} items={items} onAdd={() => setShowAdd(true)} />}
        {tab === 'Records' && <RecordsScreen items={items} onAdd={() => setShowAdd(true)} />}
        {tab === 'Family' && <FamilyScreen activePerson={activePerson} setActivePerson={setActivePerson} />}
        {tab === 'Profile' && <ProfileScreen />}
      </div>

      <nav className="bottom-nav">
        {[['Home', Home], ['Records', FileText], ['Family', Users], ['Profile', Settings]].map(([label, Icon]) => <button key={label} onClick={() => setTab(label)} className={tab === label ? 'nav-active' : ''}><Icon size={20}/><span>{label}</span></button>)}
      </nav>

      {showAdd && <AddSheet close={() => setShowAdd(false)} addRecord={addRecord} />}
      {showNotice && <div className="toast"><ShieldCheck size={18}/>Saved privately to your health timeline</div>}
    </section>
  </main>;
}

function AuthScreen({ onAuthenticated }) {
  const [screen, setScreen] = useState('welcome');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const title = screen === 'signup' ? 'Create your account' : 'Welcome back';
  const submitPhone = (event) => { event.preventDefault(); setScreen('verify'); };

  if (screen === 'welcome') return <main className="auth-shell"><section className="auth-card welcome-card">
    <AuthBrand />
    <div className="welcome-art"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><div className="welcome-heart"><HeartPulse size={43}/></div><span className="art-pill pill-a"/><span className="art-pill pill-b"/><span className="art-plus">+</span></div>
    <div className="welcome-copy"><p className="eyebrow">YOUR HEALTH, TOGETHER</p><h1>Every health moment,<br/>in one safe place.</h1><p>Bring your records, results, and family care into a story you can always understand.</p></div>
    <button className="auth-primary" onClick={() => setScreen('signup')}>Get started <ArrowUpRight size={18}/></button>
    <button className="auth-secondary" onClick={() => setScreen('signin')}>I already have an account</button>
    <p className="auth-privacy"><LockKeyhole size={14}/>Private, encrypted, and always yours</p>
  </section></main>;

  if (screen === 'verify') return <main className="auth-shell"><section className="auth-card form-card verify-card">
    <button className="back-button" onClick={() => setScreen('signup')}><ArrowLeft size={20}/></button><AuthBrand compact />
    <div className="form-heading"><div className="verification-icon"><Smartphone size={25}/></div><h1>Check your messages</h1><p>We sent a 6-digit code to <b>{phone || '+1 (555) 000-0000'}</b>.</p></div>
    <form onSubmit={(e) => { e.preventDefault(); onAuthenticated(); }}><label className="field-label">VERIFICATION CODE</label><input aria-label="Verification code" className="code-input" inputMode="numeric" maxLength="6" placeholder="• • • • • •" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} autoFocus/>
      <button className="auth-primary" type="submit">Verify and continue <Check size={18}/></button></form>
    <button className="resend-button" onClick={() => setCode('')}>Didn't receive a code? <b>Resend</b></button><button className="change-number" onClick={() => setScreen('signup')}>Use a different number</button>
  </section></main>;

  return <main className="auth-shell"><section className="auth-card form-card">
    <button className="back-button" onClick={() => setScreen('welcome')}><ArrowLeft size={20}/></button><AuthBrand compact />
    <div className="form-heading"><p className="eyebrow">{screen === 'signup' ? 'WELCOME TO FAMILYHEALTH' : 'YOUR HEALTH SPACE'}</p><h1>{title}</h1><p>{screen === 'signup' ? 'Start building your secure health history.' : 'Sign in to see your health story.'}</p></div>
    <button className="google-button" onClick={onAuthenticated}><span className="google-mark">G</span><span>Continue with Google</span></button>
    <div className="divider"><span/>or continue with phone<span/></div>
    <form onSubmit={submitPhone}><label className="field-label" htmlFor="phone">PHONE NUMBER</label><div className="phone-field"><span>+1</span><input id="phone" type="tel" inputMode="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} required/></div>
      <button className="auth-primary" type="submit">{screen === 'signup' ? 'Continue with phone' : 'Send sign-in code'} <ArrowUpRight size={18}/></button></form>
    <p className="terms-copy">By continuing, you agree to our <button>Terms of Use</button> and <button>Privacy Policy</button>.</p>
    <div className="switch-auth">{screen === 'signup' ? 'Already have an account?' : 'New to FamilyHealth?'} <button onClick={() => setScreen(screen === 'signup' ? 'signin' : 'signup')}>{screen === 'signup' ? 'Sign in' : 'Create an account'}</button></div>
  </section></main>;
}

function AuthBrand({ compact = false }) { return <div className={`auth-brand ${compact ? 'compact' : ''}`}><div className="brand"><span className="brand-mark"><HeartPulse size={17}/></span><span>FamilyHealth</span></div>{!compact && <span>Family health</span>}</div> }

function HomeScreen({ activePerson, setActivePerson, items, onAdd }) {
  const personCycle = ['Phalguna Rao BAMMIDI', 'Swetha NAYANI', 'Vinay Kumar DURGAM'];
  const currentIndex = personCycle.indexOf(activePerson);
  const nextPerson = personCycle[(currentIndex + 1) % personCycle.length];
  const firstName = activePerson.split(' ')[0];
  const initials = activePerson.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  return <>
    <div className="hello-row"><div><p className="eyebrow">TUESDAY, SEPTEMBER 9</p><h1>Good morning, {firstName}</h1></div><button className="bell"><Bell size={19}/><i/></button></div>
    <button className="person-picker" onClick={() => setActivePerson(nextPerson)}><span className="person-mini">{initials}</span><span><b>{activePerson}</b><small>Personal health space</small></span><ChevronDown size={18}/></button>

    <section className="status-card">
      <div className="status-icon"><ShieldCheck size={22}/></div>
      <div><p>YOUR RECORD IS</p><h2>Up to date</h2><span>Last reviewed today</span></div><div className="status-check">✓</div>
    </section>

    <div className="section-heading"><div><p className="eyebrow">AT A GLANCE</p><h2>Your health snapshot</h2></div><button className="link-button">See all</button></div>
    <div className="snapshot-grid">
      <div className="snapshot-card"><div className="metric-icon purple"><Activity size={19}/></div><span>Latest checkup</span><b>Blood work</b><small>Today</small></div>
      <div className="snapshot-card"><div className="metric-icon coral"><CalendarDays size={19}/></div><span>Next reminder</span><b>Dental cleaning</b><small>Oct 14</small></div>
    </div>

    <div className="section-heading recent"><div><p className="eyebrow">TIMELINE</p><h2>Recent records</h2></div><button className="link-button">View history</button></div>
    <div className="timeline">{items.slice(0,3).map((r, i) => <RecordRow record={r} key={i}/>)}</div>
    <button className="add-record" onClick={onAdd}><Plus size={21}/><span>Add a health record</span></button>
    <p className="privacy-note"><LockKeyhole size={14}/>Your records are private and encrypted</p>
  </>;
}

function RecordRow({ record }) { const Icon = record.icon; return <button className="record-row"><div className={`record-icon ${record.tone}`}><Icon size={19}/></div><div className="record-copy"><b>{record.title}</b><span>{record.source}</span></div><div className="record-date">{record.date}<ChevronRight size={16}/></div></button> }

function RecordsScreen({ items, onAdd }) { return <><div className="page-title"><p className="eyebrow">YOUR LIBRARY</p><h1>Health records</h1><span>Everything, in one secure place.</span></div><div className="search-box"><Search size={18}/><span>Search records</span></div><div className="filter-row"><button className="selected-filter">All records</button><button>Reports</button><button>Labs</button><button>Images</button></div><div className="record-list">{items.concat([{title:'COVID-19 vaccination', source:'Central Medical Centre', date:'Jul 28', tone:'mint', icon: ShieldCheck}]).map((r,i)=><RecordRow record={r} key={i}/>)}</div><button className="floating-add" onClick={onAdd}><Plus size={21}/>Add record</button></> }

function FamilyScreen({ activePerson, setActivePerson }) {
  const people = familyMembers.map(({ name, initial, tone }) => [initial, name, tone]);

  return <><div className="page-title family-title"><p className="eyebrow">SHARED CARE</p><h1>Family health</h1><span>Care for the people you love.</span></div><div className="family-tip"><Sparkles size={18}/><span>Keep everyone's care history organized in one place.</span></div><div className="people-list">{people.map(([initial,name,tone])=><button onClick={()=>setActivePerson(name)} className={`person-row ${activePerson===name?'person-selected':''}`} key={name}><span className={`family-avatar ${tone}`}>{initial}</span><span><b>{name}</b><small>{name === 'Phalguna Rao BAMMIDI' ? 'Your personal health space' : `${name}'s health records`}</small></span>{activePerson===name?<span className="active-dot">✓</span>:<ChevronRight size={18}/>}</button>)}</div><button className="invite-button"><Plus size={19}/>Add family member</button><p className="family-footnote"><ShieldCheck size={14}/>You control who can view and manage each profile.</p></> }

function ProfileScreen() { return <><div className="profile-hero"><span className="large-avatar">MP</span><h1>Maya Patel</h1><span>maya.patel@email.com</span><button>Edit profile</button></div><div className="settings-list">{[[ShieldCheck,'Privacy & security'],[Bell,'Notifications'],[Users,'Sharing & family access'],[FileText,'Export my records']].map(([Icon,label])=><button key={label}><span><Icon size={20}/>{label}</span><ChevronRight size={18}/></button>)}</div><p className="profile-version">FamilyHealth v1.0 · Your data stays yours</p></> }

function AddSheet({ close, addRecord }) {
  const [recordType, setRecordType] = useState('Scan');
  const [form, setForm] = useState(createRecordForm('Scan'));
  const [messageText, setMessageText] = useState('');

  const typeMeta = {
    Scan: { label: 'Scan a document', hint: 'Use your camera for reports or results', tone: 'blue', icon: Camera },
    Upload: { label: 'Upload a file', hint: 'PDFs, screenshots, or images', tone: 'lavender', icon: Upload },
    Photo: { label: 'Take a health photo', hint: 'Track changes over time', tone: 'peach', icon: Image },
  };

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleTypeChange = (type) => {
    setRecordType(type);
    setForm((current) => ({ ...createRecordForm(type), ...current, type }));
  };

  const importFromMessage = () => {
    const parsed = parseIncomingMessage(messageText);
    if (Object.keys(parsed).length === 0) return;

    setForm((current) => ({
      ...current,
      ...parsed,
      title: parsed.title || current.title,
      hospital: parsed.hospital || current.hospital,
      doctor: parsed.doctor || current.doctor,
      amount: parsed.amount || current.amount,
      visitDate: parsed.visitDate || current.visitDate,
      notes: parsed.notes || current.notes,
    }));
    setMessageText('');
  };

  const saveRecord = () => {
    addRecord(recordType, form);
    setForm(createRecordForm(recordType));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    await handleUploadedDocument(file, setForm);
    event.target.value = '';
  };

  return <div className="sheet-backdrop" onClick={close}><div className="add-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-title"><div><p className="eyebrow">KEEP YOUR HISTORY CURRENT</p><h2>Add a record</h2></div><button onClick={close}><X size={20}/></button></div>
    <div className="add-option-grid">{Object.keys(typeMeta).map((type) => {
      const Icon = typeMeta[type].icon;
      return <button key={type} type="button" className={`add-option ${recordType === type ? 'active' : ''}`} onClick={() => handleTypeChange(type)}>
        <span className={`option-icon ${typeMeta[type].tone}`}><Icon size={21}/></span>
        <span><b>{typeMeta[type].label}</b><small>{typeMeta[type].hint}</small></span>
        <ChevronRight size={18}/>
      </button>;
    })}</div>
    <div className="message-import-box">
      <div className="field-group"><label htmlFor="message-import">Read from messages</label><textarea id="message-import" rows="3" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Example: 'Hospital: Mercy Heart Center. Doctor: Dr. A. Nair. Paid $260 on Sep 03.'" /></div>
      <button className="message-import-button" type="button" onClick={importFromMessage}>Auto-fill from message</button>
    </div>
    <div className="file-import-box">
      <label className="file-import-label" htmlFor="document-upload">Upload PDF or image to auto-fill</label>
      <input id="document-upload" type="file" accept=".pdf,image/*" onChange={handleFileUpload} />
    </div>
    <div className="record-form">
      <div className="field-group"><label htmlFor="record-title">Title</label><input id="record-title" value={form.title} onChange={setField('title')} placeholder="Annual checkup" /></div>
      <div className="field-row">
        <div className="field-group"><label htmlFor="visit-date">Visit date</label><input id="visit-date" type="date" value={form.visitDate} onChange={setField('visitDate')} /></div>
        <div className="field-group"><label htmlFor="amount">Amount</label><input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={setField('amount')} placeholder="0.00" /></div>
      </div>
      <div className="field-group"><label htmlFor="hospital">Hospital / clinic</label><input id="hospital" value={form.hospital} onChange={setField('hospital')} placeholder="Memorial Hospital" /></div>
      <div className="field-group"><label htmlFor="doctor">Doctor / provider</label><input id="doctor" value={form.doctor} onChange={setField('doctor')} placeholder="Dr. Maya Chen" /></div>
      <div className="field-group"><label htmlFor="notes">Notes</label><textarea id="notes" rows="3" value={form.notes} onChange={setField('notes')} placeholder="Symptoms, treatment plan, or follow-up details" /></div>
    </div>
    <div className="sheet-actions"><button className="sheet-secondary" type="button" onClick={close}>Cancel</button><button className="auth-primary" type="button" onClick={saveRecord}>Save record <Check size={18}/></button></div>
    <p className="sheet-security"><LockKeyhole size={14}/>Encrypted and private by design</p></div></div> }

createRoot(document.getElementById('root')).render(<App />);
