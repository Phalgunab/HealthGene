import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import {
  Activity, ArrowUpRight, Bell, CalendarDays, Camera, ChevronDown, ChevronRight,
  FileText, HeartPulse, Home, Image, LockKeyhole, MoreHorizontal, Plus,
  Search, Settings, ShieldCheck, Sparkles, Upload, Users, X, ArrowLeft, Check, Smartphone, LogOut
} from 'lucide-react';
import './styles.css';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';

const countryCodes = [
  ['India (+91)', '+91'],
  ['Singapore (+65)', '+65'],
];

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const familyMembers = [];
const records = [];

const notifications = [
  { id: 1, title: 'New lab result added', detail: 'Your annual blood work is ready to review.', time: '10 min ago', unread: true },
  { id: 2, title: 'Appointment reminder', detail: 'Dental cleaning scheduled for October 14.', time: '2 hours ago', unread: true },
  { id: 3, title: 'Record saved privately', detail: 'Knee MRI scan was added to Swetha NAYANI’s timeline.', time: 'Yesterday', unread: false },
];

const searchExamples = ['Fever in last month', 'Apollo visit last month', 'Lab reports for Swetha'];

const timelineDate = (record) => {
  if (record.date === 'Today') return new Date();
  const parsed = new Date(`${record.date}, ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const recordKindConfig = {
  Scan: { title: 'Medical scan', source: 'Document scanned', tone: 'blue', icon: Camera },
  Upload: { title: 'Uploaded report', source: 'File uploaded', tone: 'lavender', icon: Upload },
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

const serializeRecord = ({ icon, ...record }) => record;
const hydrateRecord = (id, record) => ({
  id,
  ...record,
  icon: recordKindConfig[record.type]?.icon || (record.kind === 'lab' ? Activity : record.kind === 'image' ? Image : FileText),
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
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('Home');
  const [showAdd, setShowAdd] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsPage, setSettingsPage] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineRecord, setTimelineRecord] = useState(null);
  const [recordDetail, setRecordDetail] = useState(null);
  const [activePerson, setActivePerson] = useState('My profile');
  const [familyList, setFamilyList] = useState([]);
  const [profileDetails, setProfileDetails] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    emergencyContact: '',
    isPrimaryHolder: true,
  });
  const [items, setItems] = useState([]);
  const activeInitials = activePerson.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setAuthenticated(Boolean(user));
    setAuthReady(true);
  }), []);

  useEffect(() => {
    if (!currentUser) return undefined;

    const loadFirestoreData = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const [profileSnapshot, familySnapshot, recordsSnapshot] = await Promise.all([
          getDoc(doc(userRef, 'profile', 'details')),
          getDocs(collection(userRef, 'familyMembers')),
          getDocs(collection(userRef, 'records')),
        ]);

        if (profileSnapshot.exists()) {
          const profile = profileSnapshot.data();
          setProfileDetails(current => ({ ...current, ...profile, isPrimaryHolder: true }));
          if (profile.fullName) setActivePerson(profile.fullName);
        } else {
          if (currentUser.displayName) {
            setProfileDetails(current => ({ ...current, fullName: currentUser.displayName, isPrimaryHolder: true }));
            setActivePerson(currentUser.displayName);
          }
          // First sign-in after registration: send the user straight to their profile details form.
          setTab('Profile');
          setEditProfile(true);
        }
        setFamilyList(familySnapshot.docs.map(snapshot => ({ id: snapshot.id, ...snapshot.data() })));
        setItems(recordsSnapshot.docs.map(snapshot => hydrateRecord(snapshot.id, snapshot.data())));

        if (!profileSnapshot.exists()) await setDoc(doc(userRef, 'profile', 'details'), { fullName: currentUser.displayName || '', isPrimaryHolder: true }, { merge: true });
      } catch (error) {
        console.error('Could not load Firestore data', error);
      }
    };

    loadFirestoreData();
  }, [currentUser]);

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
    if (currentUser) addDoc(collection(db, 'users', currentUser.uid, 'records'), serializeRecord(record)).catch(error => console.error('Could not save record', error));
    setShowAdd(false);
    setShowNotice(true);
    setTimeout(() => setShowNotice(false), 2800);
  };

  const saveProfile = async (details) => {
    const profileWithPrimary = { ...details, isPrimaryHolder: true };
    setProfileDetails(profileWithPrimary);
    setActivePerson(details.fullName);
    setEditProfile(false);
    if (currentUser) await setDoc(doc(db, 'users', currentUser.uid, 'profile', 'details'), profileWithPrimary, { merge: true });
  };

  const addFamilyMember = async (member) => {
    const familyMember = { ...member, isPrimaryHolder: false };
    setFamilyList(current => [...current, familyMember]);
    setActivePerson(member.name);
    setShowAddFamily(false);
    if (currentUser) await setDoc(doc(collection(db, 'users', currentUser.uid, 'familyMembers')), familyMember);
  };

  const updateFamilyMember = async (updatedMember, originalName) => {
    setFamilyList(current => current.map(member => member.name === originalName ? updatedMember : member));
    setActivePerson(updatedMember.name);
    setEditingMember(null);
    if (currentUser && updatedMember.id) await setDoc(doc(db, 'users', currentUser.uid, 'familyMembers', updatedMember.id), updatedMember, { merge: true });
  };

  const deleteFamilyMember = async (member) => {
    const remaining = familyList.filter(item => item.name !== member.name);
    setFamilyList(remaining);
    setActivePerson(remaining[0]?.name || '');
    setEditingMember(null);
    if (currentUser && member.id) await deleteDoc(doc(db, 'users', currentUser.uid, 'familyMembers', member.id));
  };

  if (!authReady) return null;
  if (!authenticated) return <AuthScreen />;

  return <main className="app-shell">
    <section className="mobile-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><HeartPulse size={17}/></span><span>MyFamilyHealth</span></div>
        <div className="top-actions"><button className="icon-button" onClick={() => setShowSearch(open => !open)} aria-label="Search" aria-expanded={showSearch}><Search size={20}/></button><button className="avatar" onClick={() => setTab('Profile')} aria-label={`${activePerson} profile`}>{activeInitials}</button></div>
      </header>

      {showSearch && <SearchPanel searchTerm={searchTerm} setSearchTerm={setSearchTerm} submitSearch={() => { setShowSearch(false); setTab('Records'); }} chooseExample={(example) => { setSearchTerm(example); setShowSearch(false); setTab('Records'); }} />}

      <div className="content">
        {tab === 'Home' && (showTimeline ? <TimelinePage items={items} selectedRecord={timelineRecord} onSelectRecord={setTimelineRecord} onBack={() => { setShowTimeline(false); setTimelineRecord(null); }} /> : recordDetail ? <RecordDetailPage record={recordDetail} onBack={() => setRecordDetail(null)} /> : <HomeScreen activePerson={activePerson} setActivePerson={setActivePerson} familyList={familyList} items={items} onAdd={() => setShowAdd(true)} onViewTimeline={() => setShowTimeline(true)} onOpenRecord={setRecordDetail} showNotifications={showNotifications} toggleNotifications={() => setShowNotifications(open => !open)} />)}
        {tab === 'Records' && (recordDetail ? <RecordDetailPage record={recordDetail} onBack={() => setRecordDetail(null)} /> : <RecordsScreen items={items} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAdd={() => setShowAdd(true)} onOpenRecord={setRecordDetail} />)}
        {tab === 'Family' && (showAddFamily ? <AddFamilyMemberPage onBack={() => setShowAddFamily(false)} onSave={addFamilyMember} /> : editingMember ? <EditFamilyMemberPage member={editingMember} onBack={() => setEditingMember(null)} onSave={(updatedMember) => updateFamilyMember(updatedMember, editingMember.name)} onDelete={() => deleteFamilyMember(editingMember)} /> : <FamilyScreen activePerson={activePerson} setActivePerson={setActivePerson} familyList={familyList} onAddMember={() => setShowAddFamily(true)} onOpenMember={setEditingMember} />)}
        {tab === 'Profile' && (editProfile ? <EditProfilePage details={profileDetails} onBack={() => setEditProfile(false)} onSave={saveProfile} /> : settingsPage ? <SettingsPage page={settingsPage} activePerson={activePerson} familyList={familyList} items={items} onBack={() => setSettingsPage(null)} /> : <ProfileScreen activePerson={activePerson} profileDetails={profileDetails} onLogout={() => signOut(auth)} openSettings={setSettingsPage} openEditProfile={() => setEditProfile(true)} />)}
      </div>

      <nav className="bottom-nav">
        {[['Home', Home], ['Records', FileText], ['Family', Users], ['Profile', Settings]].map(([label, Icon]) => <button key={label} onClick={() => { setSettingsPage(null); setEditProfile(false); setShowAddFamily(false); setEditingMember(null); setShowTimeline(false); setTimelineRecord(null); setRecordDetail(null); setTab(label); }} className={tab === label ? 'nav-active' : ''}><Icon size={20}/><span>{label}</span></button>)}
      </nav>

      {showAdd && <AddSheet close={() => setShowAdd(false)} addRecord={addRecord} />}
      {showNotice && <div className="toast"><ShieldCheck size={18}/>Saved privately to your health timeline</div>}
    </section>
  </main>;
}

function AuthScreen() {
  const [screen, setScreen] = useState('welcome');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryOpen, setCountryOpen] = useState(false);
  const [code, setCode] = useState('');
  const [legalPage, setLegalPage] = useState(null);
  const [authError, setAuthError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const title = screen === 'signup' ? 'Create your account' : 'Welcome back';
  const showAuthError = (error) => {
    const messages = {
      'auth/configuration-not-found': 'Firebase Authentication is not configured for this project. Enable Google and Phone sign-in in Firebase Console.',
      'auth/operation-not-allowed': 'This sign-in method is disabled. Enable it in Firebase Console → Authentication → Sign-in method.',
      'auth/unauthorized-domain': 'This website is not authorized in Firebase. Add phalgunab.github.io under Authentication → Settings → Authorized domains.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/invalid-phone-number': 'Enter a valid phone number with the selected country code.',
      'auth/invalid-verification-code': 'That verification code is invalid or expired. Enter the latest 6-digit code from your SMS, or request a new code.',
    };
    setAuthError(messages[error?.code] || error?.message || 'Authentication failed. Please try again.');
  };
  const loginWithGoogle = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      showAuthError(error);
    }
  };
  const submitPhone = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(auth, `${countryCode}${phone.replace(/\D/g, '')}`, recaptchaRef.current);
      setConfirmationResult(result);
      setScreen('verify');
    } catch (error) {
      showAuthError(error);
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setAuthLoading(false);
    }
  };
  const verifyCode = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await confirmationResult.confirm(code);
    } catch (error) {
      showAuthError(error);
    } finally {
      setAuthLoading(false);
    }
  };

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
    <div className="form-heading"><div className="verification-icon"><Smartphone size={25}/></div><h1>Check your messages</h1><p>We sent a 6-digit code to <b>{phone ? `${countryCode} ${phone}` : `${countryCode} (555) 000-0000`}</b>.</p></div>
    <form onSubmit={verifyCode}><label className="field-label">VERIFICATION CODE</label><input aria-label="Verification code" className="code-input" inputMode="numeric" maxLength="6" placeholder="• • • • • •" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} autoFocus/>
      <button className="auth-primary" type="submit" disabled={authLoading}>{authLoading ? 'Verifying code...' : 'Verify and continue'} {!authLoading && <Check size={18}/>}</button></form>
    {authError && <p className="auth-error">{authError}</p>}
    <button className="resend-button" onClick={() => setCode('')}>Didn't receive a code? <b>Resend</b></button><button className="change-number" onClick={() => setScreen('signup')}>Use a different number</button>
  </section></main>;

  return <main className="auth-shell"><section className="auth-card form-card">
    <button className="back-button" onClick={() => setScreen('welcome')}><ArrowLeft size={20}/></button><AuthBrand compact />
    <div className="form-heading"><p className="eyebrow">{screen === 'signup' ? 'WELCOME TO MYFAMILYHEALTH' : 'YOUR HEALTH SPACE'}</p><h1>{title}</h1><p>{screen === 'signup' ? 'Start building your secure health history.' : 'Sign in to see your health story.'}</p></div>
    <button className="google-button" onClick={loginWithGoogle}><span className="google-mark" aria-hidden="true"/><span>Continue with Google</span></button>
    <div className="divider"><span/>or continue with phone<span/></div>
    <form onSubmit={submitPhone}><label className="field-label" htmlFor="phone">PHONE NUMBER</label><div className="phone-field"><div className={`country-select ${countryOpen ? 'country-open' : ''}`}><button className="country-trigger" type="button" aria-label="Country code" aria-expanded={countryOpen} onClick={() => setCountryOpen(open => !open)}><span>{countryCode}</span><ChevronDown size={14}/></button>{countryOpen && <div className="country-menu" role="listbox">{countryCodes.map(([country, codeValue]) => <button className={countryCode === codeValue ? 'country-option selected' : 'country-option'} type="button" role="option" aria-selected={countryCode === codeValue} key={`${country}-${codeValue}`} onClick={() => { setCountryCode(codeValue); setCountryOpen(false); }}><span>{country}</span>{countryCode === codeValue && <Check size={14}/>}</button>)}</div>}</div><input id="phone" type="tel" inputMode="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} required/></div>
      <button className="auth-primary" type="submit" disabled={authLoading}>{authLoading ? 'Sending code...' : screen === 'signup' ? 'Continue with phone' : 'Send sign-in code'} {!authLoading && <ArrowUpRight size={18}/>}</button></form>
    <p className="terms-copy">By continuing, you agree to our <button type="button" onClick={() => setLegalPage('terms')}>Terms of Use</button> and <button type="button" onClick={() => setLegalPage('privacy')}>Privacy Policy</button>.</p>
    <div className="switch-auth">{screen === 'signup' ? 'Already have an account?' : 'New to MyFamilyHealth?'} <button onClick={() => setScreen(screen === 'signup' ? 'signin' : 'signup')}>{screen === 'signup' ? 'Sign in' : 'Create an account'}</button></div>
    {authError && <p className="auth-error">{authError}</p>}
  </section>{legalPage && <LegalDialog page={legalPage} close={() => setLegalPage(null)} />}<div id="recaptcha-container" /></main>;
}

function AuthBrand({ compact = false }) { return <div className={`auth-brand ${compact ? 'compact' : ''}`}><div className="brand"><span className="brand-mark"><HeartPulse size={17}/></span><span>MyFamilyHealth</span></div>{!compact && <span>MyFamilyHealth v1.0</span>}</div> }

function NotificationPanel() {
  return <section className="notification-panel" aria-label="Notifications">
    <div className="notification-heading"><div><p className="eyebrow">YOUR UPDATES</p><h2>Notifications</h2></div><span>{notifications.filter(notification => notification.unread).length} unread</span></div>
    <div className="notification-list">{notifications.map(notification => <article className={`notification-item ${notification.unread ? 'notification-unread' : ''}`} key={notification.id}><span className="notification-icon"><Bell size={15}/></span><div><h3>{notification.title}</h3><p>{notification.detail}</p><small>{notification.time}</small></div>{notification.unread && <i aria-label="Unread"/>}</article>)}</div>
  </section>;
}

function SearchPanel({ searchTerm, setSearchTerm, submitSearch, chooseExample }) {
  return <section className="search-panel" aria-label="Search health records">
    <form className="search-panel-input" onSubmit={event => { event.preventDefault(); submitSearch(); }}><Search size={17}/><input autoFocus value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search health records" /></form>
    <p className="search-examples-label">TRY A FILTER</p>
    <div className="search-examples">{searchExamples.map(example => <button type="button" key={example} onClick={() => chooseExample(example)}>{example}</button>)}</div>
  </section>;
}

function LegalDialog({ page, close }) {
  const isTerms = page === 'terms';

  return <div className="legal-backdrop" role="presentation" onClick={close}>
    <section className="legal-dialog" role="dialog" aria-modal="true" aria-labelledby="legal-title" onClick={event => event.stopPropagation()}>
      <div className="legal-heading"><div><p className="eyebrow">MYFAMILYHEALTH</p><h2 id="legal-title">{isTerms ? 'Terms of Use' : 'Privacy Policy'}</h2></div><button className="legal-close" type="button" onClick={close} aria-label="Close policy"><X size={18}/></button></div>
      {isTerms ? <>
        <p>By using MyFamilyHealth, you agree to use the service responsibly and provide information that you have the right to store.</p>
        <h3>Your account</h3><p>Keep your sign-in details private. You are responsible for activity performed through your account.</p>
        <h3>Your records</h3><p>MyFamilyHealth helps organize health information. It does not replace advice, diagnosis, or treatment from a qualified professional.</p>
        <h3>Changes</h3><p>We may update these terms as the service evolves. Continued use means you accept the current version.</p>
      </> : <>
        <p>MyFamilyHealth is designed to keep your health information private and under your control.</p>
        <h3>Information you provide</h3><p>Information you enter, upload, or import is used to organize your family health timeline and fill record details.</p>
        <h3>Local processing</h3><p>Document text extraction and image reading are performed in your browser. Your uploaded files are not sent to a MyFamilyHealth server by this app.</p>
        <h3>Your choices</h3><p>You can log out at any time. You control which family profile is selected and what records you add to it.</p>
      </>}
      <button className="legal-done" type="button" onClick={close}>Close</button>
    </section>
  </div>;
}

function HomeScreen({ activePerson, setActivePerson, familyList, items, onAdd, onViewTimeline, onOpenRecord, showNotifications, toggleNotifications }) {
  const [personMenuOpen, setPersonMenuOpen] = useState(false);
  const firstName = (activePerson || 'there').split(' ')[0];
  const initials = activePerson ? activePerson.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() : '?';
  const activeMember = familyList.find(member => member.name === activePerson);
  const isPrimaryHolderActive = !activeMember; // Primary holder is active if not in family list
  const followUp = activeMember?.followUpTitle
    ? [activeMember.followUpTitle, activeMember.followUpDetail || '']
    : ['No follow-up scheduled', 'Add a care plan when needed'];
  
  const today = new Date();
  const dayName = today.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  const monthDate = today.toLocaleString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
  const dateHeader = `${dayName}, ${monthDate}`;

  return <>
    <div className="hello-row"><div><p className="eyebrow">{dateHeader}</p><h1>Good morning, {firstName}</h1></div><button className="bell" onClick={toggleNotifications} aria-label="Notifications" aria-expanded={showNotifications}><Bell size={19}/><i/><span className="notification-count">{notifications.filter(notification => notification.unread).length}</span></button></div>
    {showNotifications && <NotificationPanel />}
    <div className={`person-select ${personMenuOpen ? 'person-open' : ''}`}>
      <button className="person-picker" onClick={() => setPersonMenuOpen(open => !open)} aria-expanded={personMenuOpen} disabled={!familyList.length}><span className="person-mini">{initials}</span><span><b>{activePerson || 'No profile yet'}</b><small>{isPrimaryHolderActive ? 'Personal health space' : 'Family member'}</small></span><ChevronDown size={18}/></button>
      {personMenuOpen && <div className="person-menu" role="listbox">{familyList.map(member => { const memberInitials = member.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase(); return <button className={activePerson === member.name ? 'person-option selected' : 'person-option'} type="button" role="option" aria-selected={activePerson === member.name} key={member.id || member.name} onClick={() => { setActivePerson(member.name); setPersonMenuOpen(false); }}><span className="person-mini">{memberInitials}</span><span><b>{member.name}</b><small>{member.relationship || 'Family member'}</small></span>{activePerson === member.name && <Check size={16}/>}</button>; })}</div>}
    </div>

    <section className="status-card">
      <div className="status-detail"><div className="status-detail-icon medication"><ShieldCheck size={17}/></div><div><p>RUNNING MEDICATION</p><b>No running medication</b><span>Nothing active on this profile</span></div></div>
      <div className="status-detail"><div className="status-detail-icon followup"><CalendarDays size={17}/></div><div><p>IMMEDIATE FOLLOW-UP</p><b>{followUp[0]}</b><span>{followUp[1]}</span></div></div>
    </section>

    {items.length > 0 && <>
      <div className="section-heading"><div><p className="eyebrow">AT A GLANCE</p><h2>Your health snapshot</h2></div><button className="link-button" onClick={onViewTimeline}>See all</button></div>
      <div className="snapshot-grid">
        <div className="snapshot-card"><div className="metric-icon purple"><Activity size={19}/></div><span>Latest checkup</span><b>{items[0]?.title || 'Health record'}</b><small>{items[0]?.date || 'Today'}</small></div>
        <div className="snapshot-card"><div className="metric-icon coral"><CalendarDays size={19}/></div><span>Next reminder</span><b>Check back soon</b><small>Follow your care plan</small></div>
      </div>
    </>}

    <div className="section-heading recent"><div><p className="eyebrow">TIMELINE</p><h2>Recent records</h2></div>{items.length > 0 && <button className="link-button" onClick={onViewTimeline}>View history</button>}</div>
    {items.length > 0 ? <div className="timeline">{items.slice(0,3).map((r, i) => <RecordRow record={r} key={i} onOpen={() => onOpenRecord(r)}/>)}</div> : <div className="empty-search">Start adding health records to see them here.</div>}
    <button className="add-record" onClick={onAdd}><Plus size={21}/><span>Add a health record</span></button>
    <p className="privacy-note"><LockKeyhole size={14}/>Your records are private and encrypted</p>
  </>;
}

function TimelinePage({ items, selectedRecord, onSelectRecord, onBack }) {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const months = [...new Set(items.map(record => timelineDate(record).toLocaleString('en-US', { month: 'short' })))];
  const visibleItems = items.filter(record => selectedMonth === 'All' || timelineDate(record).toLocaleString('en-US', { month: 'short' }) === selectedMonth).sort((a, b) => timelineDate(b) - timelineDate(a));

  if (selectedRecord) return <RecordDetailPage record={selectedRecord} onBack={() => onSelectRecord(null)} />;

  return <div className="timeline-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to home</button><div className="timeline-heading"><p className="eyebrow">YOUR HEALTH STORY</p><h1>Health timeline</h1><p>Move through your care history by month, then open any record for the full visit details.</p></div><div className="timeline-zoom" aria-label="Timeline month filter"><button className={selectedMonth === 'All' ? 'timeline-month active' : 'timeline-month'} onClick={() => setSelectedMonth('All')}>All</button>{months.map(month => <button className={selectedMonth === month ? 'timeline-month active' : 'timeline-month'} key={month} onClick={() => setSelectedMonth(month)}>{month}</button>)}</div><div className="visual-timeline">{visibleItems.length ? visibleItems.map((record, index) => { const date = timelineDate(record); const Icon = record.icon; return <button className="timeline-event" key={`${record.title}-${index}`} onClick={() => onSelectRecord(record)}><span className="timeline-line"/><span className="timeline-dot"/><span className="timeline-date"><b>{date.toLocaleString('en-US', { month: 'short' })}</b><small>{date.getDate()}</small></span><span className="timeline-event-card"><span className={`record-icon ${record.tone}`}><Icon size={17}/></span><span><b>{record.title}</b><small>{record.source}</small></span><ChevronRight size={16}/></span></button>; }) : <div className="empty-search">No records in this month yet.</div>}</div></div>;
}

function RecordDetailPage({ record, onBack }) {
  const date = timelineDate(record);
  const Icon = record.icon;

  return <div className="record-detail-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to timeline</button><div className="record-detail-heading"><span className={`record-icon ${record.tone}`}><Icon size={22}/></span><p className="eyebrow">HEALTH RECORD</p><h1>{record.title}</h1><span>{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span></div><div className="record-detail-card"><DetailField label="Hospital / clinic" value={record.hospital || record.source}/><DetailField label="Doctor / provider" value={record.doctor || 'Not provided'}/><DetailField label="Amount" value={record.amount || 'Not provided'}/><DetailField label="Notes" value={record.notes || 'No notes added'}/></div></div>;
}

function DetailField({ label, value }) { return <div className="detail-field"><p>{label}</p><b>{value}</b></div>; }

function RecordRow({ record, onOpen }) { const Icon = record.icon; return <button className="record-row" onClick={onOpen}><div className={`record-icon ${record.tone}`}><Icon size={19}/></div><div className="record-copy"><b>{record.title}</b><span>{record.source}</span></div><div className="record-date">{record.date}<ChevronRight size={16}/></div></button> }

function RecordsScreen({ items, searchTerm, setSearchTerm, onAdd, onOpenRecord }) {
  const [recordFilter, setRecordFilter] = useState('all');
  const allItems = items;
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const filteredItems = allItems.filter(record => {
    const matchesType = recordFilter === 'all' || record.kind === recordFilter;
    const searchableText = [record.title, record.source, record.owner, record.hospital, record.doctor, record.notes].filter(Boolean).join(' ').toLowerCase();
    return matchesType && (!normalizedSearch || searchableText.includes(normalizedSearch));
  });
  const filters = [['all', 'All records'], ['report', 'Reports'], ['lab', 'Labs'], ['image', 'Images']];

  return <><div className="page-title"><p className="eyebrow">YOUR LIBRARY</p><h1>Health records</h1><span>{allItems.length} records organized in one secure place.</span></div><div className="search-box"><Search size={18}/><input aria-label="Search records" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search records, hospitals, doctors" />{searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')} aria-label="Clear search"><X size={15}/></button>}</div>{searchTerm && <p className="search-result-label">Showing results for “{searchTerm}”</p>}<div className="filter-row">{filters.map(([value, label]) => <button key={value} className={recordFilter === value ? 'selected-filter' : ''} onClick={() => setRecordFilter(value)}>{label}</button>)}</div><div className="record-list">{filteredItems.length ? filteredItems.map((record, index) => <RecordRow record={record} key={index} onOpen={() => onOpenRecord(record)} />) : <div className="empty-search">No matching records yet.</div>}</div><button className="floating-add" onClick={onAdd}><Plus size={21}/>Add record</button></>;
}

function FamilyScreen({ activePerson, setActivePerson, familyList, onAddMember, onOpenMember }) {
  const people = familyList.map(({ name, initial, tone, relationship }) => [initial, name, tone, relationship]);
  const isPrimaryHolderActive = !familyList.find(m => m.name === activePerson);

  return <><div className="page-title family-title"><p className="eyebrow">SHARED CARE</p><h1>Family health</h1><span>Care for the people you love.</span></div><div className="family-tip"><Sparkles size={18}/><span>Keep everyone's care history organized in one place.</span></div>{people.length ? <div className="people-list">{people.map(([initial,name,tone,relationship])=><button onClick={()=>{ setActivePerson(name); onOpenMember(familyList.find(member => member.name === name)); }} className={`person-row ${activePerson===name?'person-selected':''}`} key={name}><span className={`family-avatar ${tone}`}>{initial}</span><span><b>{name}</b><small>{relationship || `${name}'s health records`}</small></span><ChevronRight size={18}/></button>)}</div> : <div className="empty-search">No family members added yet.</div>}<button className="invite-button" onClick={onAddMember}><Plus size={19}/>Add family member</button><p className="family-footnote"><ShieldCheck size={14}/>You control who can view and manage each profile.</p></> }

function AddFamilyMemberPage({ onBack, onSave }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?';

  const submit = (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    onSave({ name: cleanName, initial: initials[0], tone: 'blue', relationship: relationship.trim() || 'Family member' });
  };

  return <div className="add-family-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to family</button><div className="add-family-heading"><span className="large-avatar">{initials}</span><p className="eyebrow">NEW PROFILE</p><h1>Add family member</h1><p>Create a separate health space for someone you care for.</p></div><form className="family-form" onSubmit={submit}><label htmlFor="family-name">FULL NAME</label><input id="family-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Anika Rao" required/><label htmlFor="family-relationship">RELATIONSHIP</label><input id="family-relationship" value={relationship} onChange={event => setRelationship(event.target.value)} placeholder="e.g. Daughter, parent, spouse"/><button className="auth-primary" type="submit"><Check size={18}/>Save family member</button></form></div>;
}

function EditFamilyMemberPage({ member, onBack, onSave, onDelete }) {
  const [name, setName] = useState(member.name);
  const [relationship, setRelationship] = useState(member.relationship || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?';

  const submit = (event) => {
    event.preventDefault();
    onSave({ ...member, name: name.trim(), initial: initials[0], relationship: relationship.trim() || 'Family member' });
  };
  return <><div className="add-family-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to family</button><div className="add-family-heading"><span className="large-avatar">{initials}</span><p className="eyebrow">FAMILY PROFILE</p><h1>Update details</h1><p>Edit this member's profile information.</p></div><form className="family-form" onSubmit={submit}><label htmlFor="edit-family-name">FULL NAME</label><input id="edit-family-name" value={name} onChange={event => setName(event.target.value)} required/><label htmlFor="edit-family-relationship">RELATIONSHIP</label><input id="edit-family-relationship" value={relationship} onChange={event => setRelationship(event.target.value)} placeholder="e.g. Daughter, parent, spouse"/><button className="auth-primary" type="submit"><Check size={18}/>Save changes</button></form><button className="delete-member-button" onClick={() => setShowDeleteConfirm(true)}><LogOut size={16}/>Delete family member</button></div>{showDeleteConfirm && <div className="confirm-backdrop" role="presentation" onClick={() => setShowDeleteConfirm(false)}><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-family-title" onClick={event => event.stopPropagation()}><span className="confirm-icon"><LogOut size={20}/></span><h2 id="delete-family-title">Delete family member?</h2><p>This will remove {member.name}'s profile and family access from this device.</p><div className="confirm-actions"><button className="confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button><button className="confirm-delete" onClick={onDelete}>Delete profile</button></div></section></div>}</>;
}

function ProfileScreen({ activePerson, profileDetails, onLogout, openSettings, openEditProfile }) {
  const displayName = profileDetails.fullName || activePerson;
  const initials = displayName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();

  return <><div className="profile-hero"><span className="large-avatar">{initials}</span><h1>{displayName}</h1><span>Personal health space</span><button onClick={openEditProfile}>Edit profile</button></div><div className="settings-list">{[[ShieldCheck,'Privacy & security','privacy'],[Bell,'Notifications','notifications'],[Users,'Sharing & family access','sharing'],[FileText,'Export my records','export']].map(([Icon,label,page])=><button key={label} onClick={() => openSettings(page)}><span><Icon size={20}/>{label}</span><ChevronRight size={18}/></button>)}</div><button className="logout-button" onClick={onLogout}><LogOut size={16}/>Log out</button><p className="profile-version">MyFamilyHealth v1.0 · Your data stays yours</p></>;
}

function EditProfilePage({ details, onBack, onSave }) {
  const [form, setForm] = useState(details);
  const update = (field) => (event) => setForm(current => ({ ...current, [field]: event.target.value }));

  return <div className="edit-profile-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to profile</button><div className="edit-profile-heading"><span className="large-avatar">{form.fullName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?'}</span><p className="eyebrow">PROFILE DETAILS</p><h1>Edit profile</h1><p>Keep your demographic and basic health information current.</p></div><form className="profile-form" onSubmit={event => { event.preventDefault(); onSave(form); }}><label htmlFor="profile-full-name">FULL NAME</label><input id="profile-full-name" value={form.fullName} onChange={update('fullName')} required/><div className="profile-form-grid"><div><label htmlFor="profile-dob">DATE OF BIRTH</label><input id="profile-dob" type="date" value={form.dateOfBirth} onChange={update('dateOfBirth')} /></div><div><label htmlFor="profile-gender">GENDER</label><select id="profile-gender" value={form.gender} onChange={update('gender')}><option value="">Select</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select></div></div><div className="profile-form-grid"><div><label htmlFor="profile-blood">BLOOD GROUP</label><select id="profile-blood" value={form.bloodGroup} onChange={update('bloodGroup')}><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div><div><label htmlFor="profile-height">HEIGHT</label><input id="profile-height" value={form.height} onChange={update('height')} placeholder="e.g. 170 cm" /></div></div><label htmlFor="profile-weight">WEIGHT</label><input id="profile-weight" value={form.weight} onChange={update('weight')} placeholder="e.g. 68 kg"/><label htmlFor="profile-emergency">EMERGENCY CONTACT</label><input id="profile-emergency" value={form.emergencyContact} onChange={update('emergencyContact')} placeholder="Name and phone number"/><button className="auth-primary" type="submit"><Check size={18}/>Save profile</button></form></div>;
}

function SettingsPage({ page, activePerson, familyList, items, onBack }) {
  const [privateRecords, setPrivateRecords] = useState(true);
  const [updatesEnabled, setUpdatesEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const pageDetails = {
    privacy: { label: 'PRIVACY & SECURITY', title: 'Privacy & security', description: 'Your health information stays under your control.', icon: ShieldCheck },
    notifications: { label: 'YOUR PREFERENCES', title: 'Notifications', description: 'Choose which updates MyFamilyHealth can send you.', icon: Bell },
    sharing: { label: 'FAMILY ACCESS', title: 'Sharing & family access', description: 'Review how your family profiles are organized.', icon: Users },
    export: { label: 'YOUR DATA', title: 'Export my records', description: 'Download a copy of your health timeline.', icon: FileText },
  }[page];
  const Icon = pageDetails.icon;

  const exportRecords = () => {
    const header = 'Title,Source,Date,Hospital,Doctor,Amount,Notes';
    const rows = items.map(record => [record.title, record.source, record.date, record.hospital, record.doctor, record.amount, record.notes].map(value => `"${String(value || '').replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'myfamilyhealth-records.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="settings-page"><button className="settings-back" onClick={onBack}><ArrowLeft size={18}/>Back to profile</button><div className="settings-page-heading"><span className="settings-page-icon"><Icon size={21}/></span><p className="eyebrow">{pageDetails.label}</p><h1>{pageDetails.title}</h1><p>{pageDetails.description}</p></div>{page === 'privacy' && <div className="settings-card"><SettingToggle label="Keep records private" detail="Only you can view your health records." value={privateRecords} onChange={setPrivateRecords}/><SettingRow label="Data processing" detail="Document and image reading happens in your browser." /></div>}{page === 'notifications' && <div className="settings-card"><SettingToggle label="Health updates" detail="New records, results, and care activity." value={updatesEnabled} onChange={setUpdatesEnabled}/><SettingToggle label="Appointment reminders" detail="Get reminders for upcoming care." value={remindersEnabled} onChange={setRemindersEnabled}/></div>}{page === 'sharing' && <div className="settings-card"><SettingRow label={activePerson} detail="Personal health space · Owner" />{familyList.map(member => <SettingRow key={member.id || member.name} label={member.name} detail="Family profile · Private by default" />)}</div>}{page === 'export' && <div className="settings-card export-card"><SettingRow label="Health timeline" detail={`${items.length} records ready to export`} /><button className="export-action" onClick={exportRecords}><FileText size={17}/>Download CSV export</button><p className="settings-note"><ShieldCheck size={14}/>Your export is generated on this device.</p></div>}</div>;
}

function SettingToggle({ label, detail, value, onChange }) { return <div className="setting-row"><span><b>{label}</b><small>{detail}</small></span><button className={`setting-toggle ${value ? 'toggle-on' : ''}`} onClick={() => onChange(!value)} aria-pressed={value} aria-label={`${label}: ${value ? 'on' : 'off'}`}><i/></button></div>; }
function SettingRow({ label, detail }) { return <div className="setting-row"><span><b>{label}</b><small>{detail}</small></span><Check size={17} className="setting-check"/></div>; }

function AddSheet({ close, addRecord }) {
  const [recordType, setRecordType] = useState('Scan');
  const [form, setForm] = useState(createRecordForm('Scan'));
  const [messageText, setMessageText] = useState('');
  const scanInputRef = useRef(null);
  const uploadInputRef = useRef(null);

  const typeMeta = {
    Scan: { label: 'Scan a document', hint: 'Open your camera and capture a document', tone: 'blue', icon: Camera },
    Upload: { label: 'Upload a file', hint: 'Choose a PDF, screenshot, or image', tone: 'lavender', icon: Upload },
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

  const handleFileUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRecordType(type);
    setForm((current) => ({ ...current, type }));
    await handleUploadedDocument(file, setForm);
    event.target.value = '';
  };

  const openInput = (type) => {
    setRecordType(type);
    setForm((current) => ({ ...current, type }));
    (type === 'Scan' ? scanInputRef : uploadInputRef).current?.click();
  };

  return <div className="sheet-backdrop" onClick={close}><div className="add-sheet" onClick={e=>e.stopPropagation()}><div className="sheet-handle"/><div className="sheet-title"><div><p className="eyebrow">KEEP YOUR HISTORY CURRENT</p><h2>Add a record</h2></div><button onClick={close}><X size={20}/></button></div>
    <div className="add-option-grid">{Object.keys(typeMeta).map((type) => {
      const Icon = typeMeta[type].icon;
      return <button key={type} type="button" className={`add-option ${recordType === type ? 'active' : ''}`} onClick={() => openInput(type)}>
        <span className={`option-icon ${typeMeta[type].tone}`}><Icon size={21}/></span>
        <span><b>{typeMeta[type].label}</b><small>{typeMeta[type].hint}</small></span>
        <ChevronRight size={18}/>
      </button>;
    })}</div>
    <input ref={scanInputRef} className="hidden-file-input" type="file" accept="image/*" capture="environment" onChange={(event) => handleFileUpload(event, 'Scan')} />
    <input ref={uploadInputRef} className="hidden-file-input" type="file" accept=".pdf,image/*" onChange={(event) => handleFileUpload(event, 'Upload')} />
    <div className="message-import-box">
      <div className="field-group"><label htmlFor="message-import">Read from messages</label><textarea id="message-import" rows="3" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Example: 'Hospital: Mercy Heart Center. Doctor: Dr. A. Nair. Paid $260 on Sep 03.'" /></div>
      <button className="message-import-button" type="button" onClick={importFromMessage}>Auto-fill from message</button>
    </div>
    <div className="file-import-box">
      <label className="file-import-label" htmlFor="document-upload">Upload PDF or image to auto-fill</label>
      <input id="document-upload" type="file" accept=".pdf,image/*" onChange={(event) => handleFileUpload(event, 'Upload')} />
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
