import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { modulesApi, instructorsApi, contactApi } from '../../api';
import { getAvatarUrl } from '../../api/client';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function Home() {
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [modulesError, setModulesError] = useState(null);

  const [instructors, setInstructors] = useState([]);
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [instructorsError, setInstructorsError] = useState(null);

  // Pricing Billing Cycle (Monthly / Annual)
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Active Audience Tab in Platform Overview
  const [activeAudience, setActiveAudience] = useState('student');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Institute Onboarding / Demo Modal State
  const [instituteModalOpen, setInstituteModalOpen] = useState(false);
  const [instituteForm, setInstituteForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    plan: 'Institute Campus License',
    requirements: ''
  });
  const [instituteSubmitting, setInstituteSubmitting] = useState(false);
  const [instituteSubmitted, setInstituteSubmitted] = useState(false);

  // Faculty Application Modal State
  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: 'Arabic Grammar (Nahw & Sarf)',
    qualification: "Master's in Arabic Linguistics",
    experience_years: '3',
    about: '',
    preferred_schedule: 'Weekday Evenings & Weekend Cohorts'
  });
  const [facultyCvFile, setFacultyCvFile] = useState(null);
  const [facultySubmitting, setFacultySubmitting] = useState(false);
  const [facultySubmitted, setFacultySubmitted] = useState(false);
  const [facultyError, setFacultyError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      setLoadingModules(true);
      setModulesError(null);
      try {
        const data = await modulesApi.getAll();
        setModules(data);
      } catch (err) {
        console.error(err);
        setModulesError("Unable to load academic modules. Please try again later.");
      } finally {
        setLoadingModules(false);
      }
    };

    const fetchInstructors = async () => {
      setLoadingInstructors(true);
      setInstructorsError(null);
      try {
        const data = await instructorsApi.getAll();
        setInstructors(data);
      } catch (err) {
        console.error(err);
        setInstructorsError("Unable to load faculty members right now.");
      } finally {
        setLoadingInstructors(false);
      }
    };

    void fetchModules();
    void fetchInstructors();
  }, []);

  const [startIndex, setStartIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scroll = (direction) => {
    if (direction === 'left') {
      setStartIndex(Math.max(0, startIndex - 1));
    } else {
      setStartIndex(Math.min(Math.max(0, instructors.length - itemsToShow), startIndex + 1));
    }
  };

  const visibleInstructors = instructors.slice(startIndex, startIndex + itemsToShow);

  const handleInstituteSubmit = async (e) => {
    e.preventDefault();
    if (!instituteForm.name || !instituteForm.email) {
      alert('Please provide your full name and official email address.');
      return;
    }
    setInstituteSubmitting(true);
    try {
      await contactApi.submit({
        first_name: instituteForm.name.split(' ')[0] || instituteForm.name,
        last_name: instituteForm.name.split(' ').slice(1).join(' ') || (instituteForm.organization ? `(${instituteForm.organization})` : 'Institution Head'),
        email: instituteForm.email,
        phone: instituteForm.phone || '+44 0000 000000',
        subject: `Institutional SaaS Provisioning Request — ${instituteForm.organization || 'Academy / School'}`,
        message: `Plan Selected: ${instituteForm.plan}\nOrganization: ${instituteForm.organization || 'Not specified'}\nPhone/WhatsApp: ${instituteForm.phone || 'Not specified'}\nRequirements & Deployment Notes:\n${instituteForm.requirements || 'Requested an isolated institutional tenant setup on Emam Arabic LMS.'}`
      });
      setInstituteSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Unable to submit your request at this moment. Please reach out via our contact page.');
    } finally {
      setInstituteSubmitting(false);
    }
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setFacultyError(null);
    if (!facultyForm.first_name || !facultyForm.last_name || !facultyForm.email) {
      setFacultyError('Please fill in your name and valid email address.');
      return;
    }
    if (!facultyCvFile) {
      setFacultyError('Please upload your CV / Resume or qualification document (PDF or Word).');
      return;
    }
    setFacultySubmitting(true);
    try {
      const formData = new FormData();
      formData.append('first_name', facultyForm.first_name);
      formData.append('last_name', facultyForm.last_name);
      formData.append('email', facultyForm.email);
      formData.append('phone', facultyForm.phone);
      formData.append('specialization', facultyForm.specialization);
      formData.append('qualification', facultyForm.qualification);
      formData.append('experience_years', Number.parseInt(facultyForm.experience_years, 10) || 0);
      formData.append('about', facultyForm.about || '');
      formData.append('preferred_schedule', facultyForm.preferred_schedule);
      formData.append('cv_file', facultyCvFile);

      await instructorsApi.applyFaculty(formData);
      setFacultySubmitted(true);
    } catch (err) {
      console.error(err);
      setFacultyError(err.message || 'Unable to submit faculty application right now. Please try again.');
    } finally {
      setFacultySubmitting(false);
    }
  };

  const audiencePillars = [
    {
      id: 'student',
      label: 'For Students',
      title: 'Accelerated Arabic Learning & Certification',
      subtitle: 'Complete student workspace engineered for syntax, morphology, and keyboard mastery.',
      points: [
        'Structured A1 to B2 progressive curriculum with CEFR alignment',
        '200-level Touch-Typing Lab with real-time accuracy & WPM engine',
        'Live virtual smart classroom with integrated digital whiteboard notes',
        'Auto-saved personal Smart Notebook with one-click PDF export',
        'Cryptographically verifiable digital completion certificate'
      ],
      actionLabel: 'Enroll as Student',
      actionLink: '/admission'
    },
    {
      id: 'instructor',
      label: 'For Certified Faculty',
      title: 'Join Emam Certified Arabic Faculty',
      subtitle: 'Teach enrolled Emam students in live virtual classrooms with our accredited curriculum.',
      points: [
        'Appointed teaching status across enrolled Emam student cohorts',
        'Integrated WebRTC virtual smart classroom with Arabic dual-canvas whiteboard',
        'Centralized student attendance, auto-saved smart class notes, and grading suite',
        'Automated assignment distribution and student consultation channel',
        'Accredited faculty profile featured in the public Emam faculty directory'
      ],
      actionLabel: 'Apply as Instructor',
      actionModal: 'faculty'
    },
    {
      id: 'institute',
      label: 'For Institutes & Academies',
      title: 'Multi-Tenant Institutional SaaS Environment',
      subtitle: 'Isolated institutional tenant space provisioned and governed by Emam Super Admin.',
      points: [
        'Fully dedicated Institute Administrator Dashboard with zero data cross-over',
        'Automated applicant pipeline with custom sequential student IDs (EMAM-YYYY-XXXX)',
        'Real-time fee verification, payment proof auditing, and automated receipt notifications',
        'Comprehensive institutional reports, attendance analytics, and academic audit logs',
        'Super Admin technical support, institutional onboarding, and custom domain options'
      ],
      actionLabel: 'Request Institute Provisioning',
      actionModal: 'institute'
    }
  ];

  const pricingTiers = [
    {
      id: 'student',
      name: 'Student License',
      badge: 'Individual Learners',
      priceMonthly: '£19',
      priceAnnual: '£15',
      period: '/ month',
      description: 'Complete Arabic fluency, grammar syntax, and certified touch-typing.',
      features: [
        'Complete CEFR A1–B2 Arabic Curriculum',
        '200-Level Arabic Touch-Typing Lab',
        'Live WebRTC Smart Classroom & Archive',
        'Verified Digital Course Certificate'
      ],
      ctaText: 'Start Learning',
      ctaLink: '/admission',
      isPopular: false
    },
    {
      id: 'instructor',
      name: 'Emam Certified Faculty',
      badge: 'Faculty Appointment',
      priceMonthly: 'Accredited',
      priceAnnual: 'Accredited',
      period: '',
      description: 'Teach official enrolled Emam student cohorts with institutional tools.',
      features: [
        'Official Certified Faculty Appointment',
        'Assigned Student Cohorts & Direct Messaging',
        'Smart Classroom with Arabic Whiteboard',
        'Digital Homework Grading & Attendance'
      ],
      ctaText: 'Apply to Join Faculty',
      actionModal: 'faculty',
      isPopular: false
    },
    {
      id: 'institute',
      name: 'Institute Campus SaaS',
      badge: 'Most Comprehensive',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      period: '',
      description: 'Dedicated multi-tenant cloud ERP for Arabic academies and schools.',
      features: [
        'Dedicated Multi-Tenant Academy Portal',
        'Unlimited Instructors & Student Enrollment',
        'Automated Admissions & Fee Approval Ledger',
        'Complete Data Isolation & Priority SLA'
      ],
      ctaText: 'Request Institute Demo',
      actionModal: 'institute',
      isPopular: true
    }
  ];

  const faqs = [
    {
      q: 'What is Emam Arabic LMS and how does the SaaS model work?',
      a: 'Emam is a specialized cloud learning management system (LMS) and administrative ERP built specifically for Arabic language education. We support individual students, independent tutors, and educational institutes. For institutes, Emam Super Admin provisions a dedicated, private tenant space where the institute administrator manages their own teachers, students, admissions, and financial records in full isolation.'
    },
    {
      q: 'How does an institute or academy get onboarded?',
      a: 'School and academy leaders can request an Institute Campus License through our demo request form. Emam Super Admin reviews the institutional requirements and provisions a dedicated administrative account with tailored seat allocations, student code sequences, and customized course modules.'
    },
    {
      q: 'What makes the Emam Arabic Touch-Typing Lab unique?',
      a: 'Our typing lab features 200 progressive difficulty levels mapped to the standard Arabic 101 keyboard. It includes automatic transliteration for QWERTY keyboards, real-time WPM and accuracy metrics, and awards an official verifiable digital certificate upon completing the curriculum.'
    },
    {
      q: 'How are instructors selected and assigned to students on Emam?',
      a: 'Instructors on Emam are certified academic faculty members appointed through our formal application and verification process. Students enrolled through Emam admissions are assigned to our certified faculty cohorts. We do not operate as an unvetted marketplace of independent tutors.'
    },
    {
      q: 'How are certificates verified on Emam?',
      a: 'Every completion certificate issued through Emam carries a unique cryptographically generated serial ID. Anyone can instantly verify the authenticity, issue date, and grade through our public verification portal at /verify-certificate.'
    }
  ];

  const reviews = [
    { id: 1, student: 'Dr. Tariq Al-Hashimi', role: 'Academy Director, London', text: 'Deploying Emam across our weekend school simplified student tracking and fee verification. The dedicated administrative dashboard gives us total visibility without operational friction.', rating: 5 },
    { id: 2, student: 'Sarah M.', role: 'Intermediate Arabic Student', text: 'The combination of live classes and the 200-level typing lab helped me achieve fluency and keyboard proficiency in months. The smart notebook feature is exceptional.', rating: 5 },
    { id: 3, student: 'Ustadh Omar Farooq', role: 'Classical Arabic Instructor', text: 'The virtual smart classroom with the Arabic digital whiteboard provides everything an instructor needs. Attendance, grading, and lecturing are completely unified.', rating: 5 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: 'easeOut' } 
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minWidth: 0, overflowX: 'hidden' }}>
      {/* Dedicated Clean Top Header Bar (No Overlap with Hero) */}
      <header style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1.25rem clamp(1rem, 4vw, 2.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 20, boxSizing: 'border-box' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src="/emam_logo.png" alt="Emam Logo" style={{ height: '38px', width: '38px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.5px' }} className="gradient-text">Emam</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* ======================================================== */}
      {/* 1. ENTERPRISE HERO SECTION                               */}
      {/* ======================================================== */}
      <section style={{ minHeight: 'calc(100vh - 85px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem clamp(1rem, 4vw, 2rem) 3.5rem clamp(1rem, 4vw, 2rem)', position: 'relative', overflow: 'hidden' }}>

        {/* Ambient Radial Glows (Burgundy & Gold) */}
        <motion.div
          className="ambient-glow-1"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '5%', left: '8%', width: '380px', height: '380px', background: 'var(--color-glow)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 0 }}
        />
        <motion.div
          className="ambient-glow-2"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, -25, 0],
            y: [0, 25, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: '5%', right: '8%', width: '450px', height: '450px', background: 'rgba(105, 14, 31, 0.45)', borderRadius: '50%', filter: 'blur(140px)', zIndex: 0 }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
          {/* Main Headline (Mobile Optimized) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: 'clamp(1.75rem, 5.2vw, 3.2rem)', fontWeight: '800', lineHeight: '1.25', marginBottom: '1rem', color: 'var(--color-white)', letterSpacing: '-0.5px', padding: '0 0.5rem' }}
          >
            The Cloud Learning &amp;
            <br />
            <span className="gradient-text glow-text">Institutional Management Platform</span>
          </motion.h1>

          {/* Subtitle (Mobile Optimized) */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ fontSize: 'clamp(0.9rem, 2.6vw, 1.05rem)', color: '#f0ceb3', maxWidth: '740px', margin: '0 auto 1.8rem auto', lineHeight: '1.65', padding: '0 0.75rem' }}
          >
            A unified multi-tenant SaaS engineered for ambitious students, professional Arabic tutors, and language academies. Delivering CEFR-aligned curriculum, 200-level typing certification, virtual smart classrooms, and institutional management.
          </motion.p>

          {/* Dual Action CTAs (Mobile Responsive) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem', width: '100%', maxWidth: '520px', margin: '0 auto 2.5rem auto' }}
          >
            <a
              href="#pricing"
              className="btn-primary hero-cta-btn"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '13px 26px', fontSize: '0.96rem', textDecoration: 'none', flex: '1 1 200px', boxSizing: 'border-box' }}
            >
              Explore Pricing &amp; Plans
            </a>

            <button
              onClick={() => {
                setInstituteSubmitted(false);
                setInstituteModalOpen(true);
              }}
              className="hero-outline-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '13px 24px',
                fontSize: '0.96rem',
                borderRadius: '30px',
                background: 'rgba(105, 14, 31, 0.45)',
                border: '1px solid rgba(241, 163, 42, 0.35)',
                color: 'var(--color-primary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-sans)',
                flex: '1 1 200px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(241, 163, 42, 0.15)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(105, 14, 31, 0.45)';
                e.currentTarget.style.borderColor = 'rgba(241, 163, 42, 0.35)';
              }}
            >
              Request Institute Onboarding
            </button>
          </motion.div>

          {/* Metrics Trust Bar (4 Proof Points) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', width: '100%', maxWidth: '940px', margin: '0 auto' }}
          >
            {/* Card 1 — CEFR Curriculum */}
            <div className="glass-panel trust-card" style={{ padding: '1.1rem 0.9rem 0.9rem', textAlign: 'center', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ marginBottom: '0.55rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="52" height="38" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Open book pages */}
                  <rect x="2" y="6" width="23" height="28" rx="3" fill="rgba(105,14,31,0.7)" stroke="rgba(241,163,42,0.5)" strokeWidth="1.2"/>
                  <rect x="27" y="6" width="23" height="28" rx="3" fill="rgba(105,14,31,0.7)" stroke="rgba(241,163,42,0.5)" strokeWidth="1.2"/>
                  {/* Spine line */}
                  <line x1="26" y1="5" x2="26" y2="35" stroke="#f1a32a" strokeWidth="1.6"/>
                  {/* Left page lines */}
                  <line x1="7" y1="13" x2="20" y2="13" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="7" y1="17" x2="20" y2="17" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="7" y1="21" x2="20" y2="21" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="7" y1="25" x2="16" y2="25" stroke="rgba(241,163,42,0.3)" strokeWidth="1"/>
                  {/* Right page lines */}
                  <line x1="32" y1="13" x2="45" y2="13" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="32" y1="17" x2="45" y2="17" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="32" y1="21" x2="45" y2="21" stroke="rgba(241,163,42,0.4)" strokeWidth="1"/>
                  <line x1="32" y1="25" x2="41" y2="25" stroke="rgba(241,163,42,0.3)" strokeWidth="1"/>
                  {/* Arabic letter alif hint on right page top */}
                  <text x="38" y="12" fontSize="8" fill="rgba(241,163,42,0.7)" fontFamily="serif" textAnchor="middle">ا</text>
                </svg>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.18rem', letterSpacing: '-0.3px' }}>A1 – B2</div>
              <div style={{ fontSize: '0.78rem', color: '#f0ceb3', fontWeight: '500', lineHeight: '1.4' }}>CEFR Aligned Arabic Curriculum</div>
            </div>

            {/* Card 2 — Typing Lab */}
            <div className="glass-panel trust-card" style={{ padding: '1.1rem 0.9rem 0.9rem', textAlign: 'center', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ marginBottom: '0.55rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="52" height="38" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Keyboard base */}
                  <rect x="3" y="10" width="46" height="22" rx="4" fill="rgba(105,14,31,0.7)" stroke="rgba(241,163,42,0.5)" strokeWidth="1.2"/>
                  {/* Key row 1 */}
                  <rect x="7" y="14" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.25)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.8"/>
                  <rect x="15" y="14" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.25)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.8"/>
                  <rect x="23" y="14" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.25)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.8"/>
                  <rect x="31" y="14" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.25)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.8"/>
                  <rect x="39" y="14" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.25)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.8"/>
                  {/* Key row 2 */}
                  <rect x="9" y="20" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.2)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.8"/>
                  <rect x="17" y="20" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.2)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.8"/>
                  {/* Space bar highlighted gold */}
                  <rect x="17" y="26" width="18" height="4" rx="1.5" fill="rgba(241,163,42,0.45)" stroke="#f1a32a" strokeWidth="0.9"/>
                  <rect x="25" y="20" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.2)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.8"/>
                  <rect x="33" y="20" width="6" height="4" rx="1.2" fill="rgba(241,163,42,0.2)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.8"/>
                  {/* Arabic letter on center key */}
                  <text x="28" y="23.5" fontSize="6" fill="rgba(241,163,42,0.9)" fontFamily="serif" textAnchor="middle">ب</text>
                </svg>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.18rem', letterSpacing: '-0.3px' }}>200 Levels</div>
              <div style={{ fontSize: '0.78rem', color: '#f0ceb3', fontWeight: '500', lineHeight: '1.4' }}>Progressive Touch-Typing Lab</div>
            </div>

            {/* Card 3 — Virtual Classroom */}
            <div className="glass-panel trust-card" style={{ padding: '1.1rem 0.9rem 0.9rem', textAlign: 'center', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ marginBottom: '0.55rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="52" height="38" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Monitor screen */}
                  <rect x="4" y="4" width="44" height="26" rx="3.5" fill="rgba(105,14,31,0.7)" stroke="rgba(241,163,42,0.5)" strokeWidth="1.2"/>
                  {/* Screen content — whiteboard area */}
                  <rect x="8" y="7" width="36" height="20" rx="2" fill="rgba(44,5,13,0.8)"/>
                  {/* Whiteboard line strokes — Arabic writing simulation */}
                  <path d="M12 14 Q18 11 22 14 Q26 17 30 13" stroke="#f1a32a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
                  <path d="M12 19 Q16 17 20 19" stroke="rgba(241,163,42,0.5)" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
                  {/* Camera dot top-right of screen */}
                  <circle cx="40" cy="8.5" r="1.4" fill="rgba(241,163,42,0.6)"/>
                  {/* Monitor stand */}
                  <rect x="23" y="30" width="6" height="3" rx="1" fill="rgba(241,163,42,0.3)"/>
                  <rect x="19" y="33" width="14" height="2" rx="1" fill="rgba(241,163,42,0.25)"/>
                  {/* Two small attendee boxes bottom of screen */}
                  <rect x="10" y="22" width="7" height="4" rx="1" fill="rgba(241,163,42,0.15)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.7"/>
                  <rect x="19" y="22" width="7" height="4" rx="1" fill="rgba(241,163,42,0.15)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.7"/>
                  <rect x="28" y="22" width="7" height="4" rx="1" fill="rgba(241,163,42,0.15)" stroke="rgba(241,163,42,0.3)" strokeWidth="0.7"/>
                </svg>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.18rem', letterSpacing: '-0.3px' }}>1-on-1 &amp; Cohort</div>
              <div style={{ fontSize: '0.78rem', color: '#f0ceb3', fontWeight: '500', lineHeight: '1.4' }}>Virtual Smart Classroom Studio</div>
            </div>

            {/* Card 4 — Multi-Tenant */}
            <div className="glass-panel trust-card" style={{ padding: '1.1rem 0.9rem 0.9rem', textAlign: 'center', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ marginBottom: '0.55rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="52" height="38" viewBox="0 0 52 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Three layered building shapes = multi-tenant spaces */}
                  {/* Back building */}
                  <rect x="30" y="8" width="18" height="26" rx="2.5" fill="rgba(105,14,31,0.5)" stroke="rgba(241,163,42,0.3)" strokeWidth="1"/>
                  {/* Back windows */}
                  <rect x="33" y="12" width="4" height="3" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  <rect x="39" y="12" width="4" height="3" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  <rect x="33" y="17" width="4" height="3" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  <rect x="39" y="17" width="4" height="3" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  {/* Front main building */}
                  <rect x="4" y="12" width="26" height="22" rx="2.5" fill="rgba(105,14,31,0.75)" stroke="rgba(241,163,42,0.55)" strokeWidth="1.2"/>
                  {/* Front windows */}
                  <rect x="8" y="16" width="5" height="4" rx="0.8" fill="rgba(241,163,42,0.3)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.6"/>
                  <rect x="15" y="16" width="5" height="4" rx="0.8" fill="rgba(241,163,42,0.3)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.6"/>
                  <rect x="22" y="16" width="5" height="4" rx="0.8" fill="rgba(241,163,42,0.3)" stroke="rgba(241,163,42,0.4)" strokeWidth="0.6"/>
                  <rect x="8" y="23" width="5" height="4" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  <rect x="15" y="23" width="5" height="4" rx="0.8" fill="rgba(241,163,42,0.2)"/>
                  {/* Front door */}
                  <rect x="12" y="28" width="8" height="6" rx="1" fill="rgba(241,163,42,0.4)" stroke="#f1a32a" strokeWidth="0.8"/>
                  {/* Roof accent line */}
                  <line x1="4" y1="12" x2="30" y2="12" stroke="rgba(241,163,42,0.6)" strokeWidth="1.2"/>
                </svg>
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '0.18rem', letterSpacing: '-0.3px' }}>Multi-Tenant</div>
              <div style={{ fontSize: '0.78rem', color: '#f0ceb3', fontWeight: '500', lineHeight: '1.4' }}>Dedicated Institutional Spaces</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PLATFORM ARCHITECTURE FOR 3 AUDIENCES                 */}
      {/* ======================================================== */}
      <section id="architecture" style={{ padding: '5.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.9rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Engineered for Three Distinct Stakeholders
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '720px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
            From independent learners and private tutors to multi-branch Islamic academies, Emam provides dedicated workspaces tailored to each role.
          </p>
        </motion.div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {audiencePillars.map((p) => {
            const active = activeAudience === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveAudience(p.id)}
                className={`emam-tab-pill ${active ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 24px',
                  borderRadius: '30px',
                  border: active ? '1px solid var(--color-primary)' : '1px solid rgba(241, 163, 42, 0.2)',
                  background: active ? 'var(--color-primary)' : 'rgba(105, 14, 31, 0.25)',
                  color: active ? '#2c050d' : '#f0ceb3',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Audience Content Display */}
        {(() => {
          const current = audiencePillars.find((p) => p.id === activeAudience) || audiencePillars[0];
          return (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-panel"
              style={{
                padding: '2.75rem',
                borderRadius: '24px',
                border: '1px solid rgba(241, 163, 42, 0.28)',
                background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.55), rgba(44, 5, 13, 0.85))'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <div style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.6rem' }}>
                    Workspace Specification
                  </div>
                  <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: '800', color: 'var(--color-white)', marginBottom: '0.6rem' }}>
                    {current.title}
                  </h3>
                  <p style={{ color: '#f0ceb3', fontSize: '1.05rem', marginBottom: '1.75rem', lineHeight: '1.6' }}>
                    {current.subtitle}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.9rem' }}>
                    {current.points.map((pt, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.94rem', lineHeight: '1.5' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end', justifyContent: 'center' }}>
                  {current.actionModal === 'faculty' ? (
                    <button
                      onClick={() => { setFacultySubmitted(false); setFacultyCvFile(null); setFacultyError(null); setFacultyModalOpen(true); }}
                      className="btn-primary"
                      style={{ padding: '14px 30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}
                    >
                      {current.actionLabel}
                    </button>
                  ) : current.actionModal === 'institute' ? (
                    <button
                      onClick={() => { setInstituteSubmitted(false); setInstituteModalOpen(true); }}
                      className="btn-primary"
                      style={{ padding: '14px 30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}
                    >
                      {current.actionLabel}
                    </button>
                  ) : (
                    <Link
                      to={current.actionLink}
                      className="btn-primary"
                      style={{ padding: '14px 30px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}
                    >
                      {current.actionLabel}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </section>

      {/* ======================================================== */}
      {/* 3. TRAINING DELIVERY FORMATS                             */}
      {/* ======================================================== */}
      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Flexible Delivery Formats
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Structured learning schedules tailored for individual focus, collaborative cohort interaction, or independent self-study.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Card 1: Weekday 1 on 1 */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            className="glass-panel"
            style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(241, 163, 42, 0.22)', background: 'rgba(105, 14, 31, 0.22)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Weekday Format
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-white)', marginBottom: '0.4rem' }}>
                Monday to Friday
              </h3>
              <p style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '1.2rem' }}>
                1 on 1 Private Tutoring
              </p>
              <p style={{ color: '#e0d0c8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                Intensive one-on-one sessions offering undivided instructor focus, customized pacing, and targeted conversational practice.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>100% individual mentor engagement</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>Customizable weekly time slots</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>Rapid correction and spoken fluency drills</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Weekend Cohorts */}
          <motion.div
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
            className="glass-panel"
            style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(241, 163, 42, 0.22)', background: 'rgba(105, 14, 31, 0.22)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                Weekend Format
              </div>

              <h3 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-white)', marginBottom: '0.4rem' }}>
                Saturday &amp; Sunday
              </h3>
              <p style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '1.2rem' }}>
                Collaborative Cohorts + 1 on 1
              </p>
              <p style={{ color: '#e0d0c8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                Interactive small group discussions paired with individual consultations, perfectly structured for working professionals and weekend learners.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>Interactive peer discussions &amp; group exercises</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>Flexible weekend consultation hours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#fdfdfd', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                  <span>Ideal for professionals balancing full-time work</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. DYNAMIC COURSE MODULES (/api/modules)                 */}
      {/* ======================================================== */}
      <section id="courses" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Curriculum Levels
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Progression paths built according to global language standards, guiding students from foundational literacy to advanced linguistic mastery.
          </p>
        </motion.div>

        {loadingModules ? (
          <p style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '3rem', fontSize: '1.15rem' }}>Loading academic modules...</p>
        ) : modulesError ? (
          <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>{modulesError}</p>
        ) : modules.length === 0 ? (
          <p style={{ color: '#f0ceb3', textAlign: 'center', fontSize: '1.1rem', padding: '3rem' }}>No modules available at the moment.</p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' }}
          >
            {modules.map((mod) => {
              const modTitle = mod.name || mod.title || 'Module';
              return (
                <motion.div
                  key={mod._id || mod.id || modTitle}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
                  className="glass-panel"
                  style={{ padding: '2rem 1.5rem', textAlign: 'center', border: '1px solid rgba(241, 163, 42, 0.2)', background: 'rgba(105, 14, 31, 0.22)', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '18px' }}
                >
                  {mod.image ? (
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.2rem', border: '1px solid var(--color-primary)' }}>
                      <img src={getAvatarUrl(mod.image, modTitle)} alt={modTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #690e1f, #8b152b)', border: '1px solid rgba(241, 163, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#ffffff', fontWeight: '800', fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(105, 14, 31, 0.35)' }}>
                      {modTitle}
                    </div>
                  )}
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--color-white)', fontWeight: '700', marginBottom: '0.6rem' }}>
                    Level {modTitle}
                  </h3>
                  <p style={{ color: '#e0d0c8', fontSize: '0.92rem', lineHeight: '1.55', flexGrow: 1, marginBottom: '1.25rem' }}>
                    {mod.description || 'Comprehensive curriculum covering syntax, morphology, oral fluency, and reading comprehension.'}
                  </p>
                  <Link
                    to="/admission"
                    style={{ color: 'var(--color-primary)', fontSize: '0.88rem', fontWeight: '700', textDecoration: 'none' }}
                  >
                    Apply for Level
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. DYNAMIC FACULTY DIRECTORY (/api/instructors)          */}
      {/* ======================================================== */}
      <section id="faculty" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Learn from Verified Arabic Instructors
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Our vetted educators bring years of academic experience in classical Arabic, grammatical syntax (Nahw), morphology (Sarf), and spoken proficiency.
          </p>
        </motion.div>

        {loadingInstructors ? (
          <p style={{ color: 'var(--color-primary)', textAlign: 'center', padding: '3rem', fontSize: '1.15rem' }}>Loading certified faculty...</p>
        ) : instructorsError ? (
          <p style={{ color: '#ff6b6b', textAlign: 'center', padding: '3rem', fontSize: '1.1rem' }}>{instructorsError}</p>
        ) : instructors.length === 0 ? (
          <p style={{ color: '#f0ceb3', textAlign: 'center', fontSize: '1.1rem', padding: '3rem' }}>No faculty profiles available at the moment.</p>
        ) : (
          <div style={{ position: 'relative', padding: '0 2.5rem' }}>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll('left')}
              disabled={startIndex === 0}
              className="glass-panel"
              style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: startIndex === 0 ? 'not-allowed' : 'pointer', border: '1px solid var(--color-primary)', background: 'var(--color-bg-dark)', opacity: startIndex === 0 ? 0.3 : 1 }}
            >
              <span style={{ color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: '700', lineHeight: '1' }}>&larr;</span>
            </motion.button>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itemsToShow}, 1fr)`, gap: '2rem', paddingBottom: '2rem' }}>
              <AnimatePresence mode="popLayout">
                {visibleInstructors.map((instructor) => (
                  <motion.div
                    key={instructor._id || instructor.id || instructor.name}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -50 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
                    className="glass-panel"
                    style={{ padding: '2.25rem 1.75rem', textAlign: 'center', border: '1px solid rgba(241, 163, 42, 0.2)', background: 'rgba(105, 14, 31, 0.22)', borderRadius: '20px' }}
                  >
                    <div className="faculty-avatar-ring" style={{ display: 'inline-block', padding: '3px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', marginBottom: '1rem' }}>
                      <img
                        src={getAvatarUrl(instructor.avatar, instructor.name)}
                        alt={instructor.name}
                        className="faculty-avatar-img"
                        style={{ width: '84px', height: '84px', borderRadius: '50%', display: 'block', background: 'var(--color-bg-dark)', objectFit: 'cover' }}
                      />
                    </div>

                    <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: 'var(--color-white)', fontWeight: '700' }}>{instructor.name}</h3>
                    <p style={{ color: 'var(--color-primary)', fontSize: '0.92rem', fontWeight: '600', marginBottom: instructor.about ? '0.75rem' : '0' }}>
                      {instructor.specialty || 'Classical Arabic & Syntax'}
                    </p>
                    {instructor.about && (
                      <p style={{ color: '#e0d0c8', fontSize: '0.88rem', lineHeight: '1.5' }}>{instructor.about}</p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll('right')}
              disabled={startIndex >= Math.max(0, instructors.length - itemsToShow)}
              className="glass-panel"
              style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: startIndex >= Math.max(0, instructors.length - itemsToShow) ? 'not-allowed' : 'pointer', border: '1px solid var(--color-primary)', background: 'var(--color-bg-dark)', opacity: startIndex >= Math.max(0, instructors.length - itemsToShow) ? 0.3 : 1 }}
            >
              <span style={{ color: 'var(--color-primary)', fontSize: '1.4rem', fontWeight: '700', lineHeight: '1' }}>&rarr;</span>
            </motion.button>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 6. SAAS PRICING & SUBSCRIPTION TIERS (3 OPTIONS)         */}
      {/* ======================================================== */}
      <section id="pricing" style={{ padding: '5.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2.1rem, 3.8vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Subscription Plans for Every Stage
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '720px', margin: '0 auto 2rem auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Choose the dedicated license tailored for individual learning, private tutor workspaces, or complete institutional academy provisioning.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="billing-cycle-container" style={{ display: 'inline-flex', alignItems: 'center', padding: '4px', borderRadius: '30px', background: 'rgba(105, 14, 31, 0.35)', border: '1px solid rgba(241, 163, 42, 0.25)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`billing-cycle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'monthly' ? '#2c050d' : '#f0ceb3',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`billing-cycle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: 'none',
                background: billingCycle === 'annual' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'annual' ? '#2c050d' : '#f0ceb3',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </motion.div>

        {/* 3 Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {pricingTiers.map((tier) => {
            const price = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
            return (
              <motion.div
                key={tier.id}
                whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)' }}
                className="glass-panel"
                style={{
                  padding: '2.5rem 1.85rem',
                  borderRadius: '24px',
                  border: tier.isPopular ? '2px solid var(--color-primary)' : '1px solid rgba(241, 163, 42, 0.22)',
                  background: tier.isPopular ? 'linear-gradient(135deg, rgba(105, 14, 31, 0.45), rgba(44, 5, 13, 0.85))' : 'rgba(105, 14, 31, 0.22)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxSizing: 'border-box',
                  position: 'relative'
                }}
              >
                <div style={{ flex: '1 0 auto' }}>
                  {/* Top Identifier */}
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: tier.isPopular ? 'var(--color-primary)' : '#f0ceb3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                    {tier.badge}
                  </div>

                  <h3 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--color-white)', marginBottom: '0.45rem', lineHeight: '1.25' }}>
                    {tier.name}
                  </h3>
                  <p style={{ color: '#e0d0c8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.5rem', minHeight: '42px' }}>
                    {tier.description}
                  </p>

                  {/* Price Block */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid rgba(241, 163, 42, 0.15)', paddingBottom: '1.25rem', minHeight: '56px' }}>
                    <span style={{ fontSize: '2.6rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {price}
                    </span>
                    {tier.period && (
                      <span className="pricing-period-label">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  {/* Features List (4 Clean Points) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.9rem', color: '#fdfdfd', lineHeight: '1.45' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: '700', flexShrink: 0 }}>—</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Action - Standardized Identical Button Sizing & Baseline Alignment */}
                <div style={{ marginTop: 'auto', paddingTop: '1.25rem', width: '100%' }}>
                  {tier.actionModal === 'faculty' ? (
                    <button
                      onClick={() => { setFacultySubmitted(false); setFacultyCvFile(null); setFacultyError(null); setFacultyModalOpen(true); }}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        height: '52px',
                        padding: '0 1.5rem',
                        fontSize: '0.96rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '30px',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {tier.ctaText}
                    </button>
                  ) : tier.actionModal === 'institute' ? (
                    <button
                      onClick={() => {
                        setInstituteForm({ ...instituteForm, plan: tier.name });
                        setInstituteSubmitted(false);
                        setInstituteModalOpen(true);
                      }}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        height: '52px',
                        padding: '0 1.5rem',
                        fontSize: '0.96rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '30px',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {tier.ctaText}
                    </button>
                  ) : (
                    <Link
                      to={tier.ctaLink}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        height: '52px',
                        padding: '0 1.5rem',
                        fontSize: '0.96rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '30px',
                        textDecoration: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {tier.ctaText}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. INSTITUTIONAL MULTI-TENANT PROVISIONING SPOTLIGHT     */}
      {/* ======================================================== */}
      <section style={{ padding: '4.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div
          className="glass-panel architecture-spotlight-panel"
          style={{
            padding: '3.5rem 2.5rem',
            borderRadius: '24px',
            border: '1px solid rgba(241, 163, 42, 0.3)',
            background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.65), rgba(44, 5, 13, 0.95))'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>

              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: '800', color: 'var(--color-white)', marginBottom: '1rem', lineHeight: '1.2' }}>
                How Emam Multi-Tenant Architecture Protects Your Academy
              </h2>
              <p style={{ color: '#f0ceb3', fontSize: '1.02rem', lineHeight: '1.65', marginBottom: '1.8rem' }}>
                When an institute joins Emam, our Super Admin provisions a dedicated tenant partition. Your academy maintains independent administrative control over student records, fee approvals, instructor assignments, and academic reports.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '1.1rem', flexShrink: 0, lineHeight: '1.2' }}>—</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>Isolated Student Lifecycle</strong>
                    <p style={{ color: '#e0d0c8', fontSize: '0.88rem', margin: '2px 0 0 0' }}>Sequential student IDs (EMAM-YYYY-XXXX), private enrollment records, and dedicated admission forms.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '1.1rem', flexShrink: 0, lineHeight: '1.2' }}>—</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>Financial &amp; Fee Verification Engine</strong>
                    <p style={{ color: '#e0d0c8', fontSize: '0.88rem', margin: '2px 0 0 0' }}>Institutional bank account reconciliation, proof verification, and automated email receipts.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '1.1rem', flexShrink: 0, lineHeight: '1.2' }}>—</span>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '1rem' }}>Centralized Super Admin Oversight</strong>
                    <p style={{ color: '#e0d0c8', fontSize: '0.88rem', margin: '2px 0 0 0' }}>Emam guarantees 99.9% platform availability, server security hardening, and regular feature updates.</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="architecture-proposal-card"
              style={{
                textAlign: 'center',
                padding: '2.5rem 2rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #690e1f, #2c050d)',
                border: '1px solid rgba(241, 163, 42, 0.35)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: '700', marginBottom: '0.6rem' }}>
                Deploy Emam for Your Academy
              </h3>
              <p style={{ color: '#f0ceb3', fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '1.75rem' }}>
                Connect with our Super Admin team to evaluate student volume, faculty seats, and obtain a tailored campus deployment proposal.
              </p>
              <button
                onClick={() => {
                  setInstituteForm({ ...instituteForm, plan: 'Institute Campus License' });
                  setInstituteSubmitted(false);
                  setInstituteModalOpen(true);
                }}
                className="btn-primary architecture-walkthrough-btn"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '30px',
                  cursor: 'pointer'
                }}
              >
                Schedule Institutional Walkthrough
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. TESTIMONIALS & FAQ ACCORDION                          */}
      {/* ======================================================== */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', marginBottom: '1rem' }} className="gradient-text">
            Frequently Asked Questions
          </h2>
          <p style={{ color: '#f0ceb3', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
            Clear insights into our multi-tenant SaaS architecture, curriculum standards, and user licensing.
          </p>
        </motion.div>

        <div style={{ maxWidth: '850px', margin: '0 auto 4.5rem auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  borderRadius: '16px',
                  border: isOpen ? '1px solid var(--color-primary)' : '1px solid rgba(241, 163, 42, 0.2)',
                  background: 'rgba(105, 14, 31, 0.22)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="faq-question-btn"
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-white)',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    gap: '1rem'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: 'var(--color-primary)', fontSize: '1.3rem', fontWeight: '400', flexShrink: 0 }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="faq-answer-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ padding: '0 1.5rem 1.35rem 1.5rem', color: '#f0ceb3', fontSize: '0.95rem', lineHeight: '1.65' }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Client & Student Reviews */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={containerVariants}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="glass-panel"
              style={{ padding: '2.25rem 1.75rem', border: '1px solid rgba(241, 163, 42, 0.2)', background: 'rgba(105, 14, 31, 0.22)', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '18px' }}
            >
              <div style={{ color: 'var(--color-primary)', fontSize: '1rem', letterSpacing: '3px' }}>
                ★★★★★
              </div>
              <p style={{ color: '#fdfdfd', fontStyle: 'italic', flexGrow: 1, fontSize: '0.94rem', lineHeight: '1.6' }}>
                "{review.text}"
              </p>
              <div>
                <h4 style={{ color: 'var(--color-white)', fontWeight: '700', fontSize: '1rem', margin: '0 0 2px 0' }}>
                  {review.student}
                </h4>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                  {review.role}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      

      {/* ======================================================== */}
      {/* 10. INSTITUTE ONBOARDING / PROVISIONING MODAL            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {instituteModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(26, 0, 8, 0.88)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-panel modal-glass-container"
              style={{
                width: '100%',
                maxWidth: '580px',
                borderRadius: '24px',
                border: '1px solid rgba(241, 163, 42, 0.35)',
                background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.96), rgba(44, 5, 13, 0.98))',
                padding: '2.5rem',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setInstituteModalOpen(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: '1' }}>&times;</span>
              </button>

              {instituteSubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2ecc71' }}>✓</span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: '700', marginBottom: '0.75rem' }}>
                    Institutional Request Received
                  </h3>
                  <p style={{ color: '#f0ceb3', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Thank you. Emam Super Admin has received your institutional onboarding request. Our team will contact you within 24 business hours to finalize your dedicated tenant space and provision your administrative credentials.
                  </p>
                  <button
                    onClick={() => setInstituteModalOpen(false)}
                    className="btn-primary"
                    style={{ padding: '12px 32px' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInstituteSubmit}>
                  <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                    Multi-Tenant Institutional Provisioning
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--color-white)', fontWeight: '800', marginBottom: '0.4rem' }}>
                    Request Dedicated Institute Space
                  </h3>
                  <p style={{ color: '#f0ceb3', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                    Empower your school or academy with an isolated Emam tenant, custom student IDs, and automated administration.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label htmlFor="institute-rep-name" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Authorized Representative Name *</label>
                      <input
                        id="institute-rep-name"
                        type="text"
                        required
                        value={instituteForm.name}
                        onChange={(e) => setInstituteForm({ ...instituteForm, name: e.target.value })}
                        placeholder="e.g. Dr. Haris Mahmood"
                        className="emam-form-input"
                      />
                    </div>

                    <div>
                      <label htmlFor="institute-org-name" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Academy / Madrasah / School Name</label>
                      <input
                        id="institute-org-name"
                        type="text"
                        value={instituteForm.organization}
                        onChange={(e) => setInstituteForm({ ...instituteForm, organization: e.target.value })}
                        placeholder="e.g. Al-Noor Islamic Academy"
                        className="emam-form-input"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="institute-email" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Official Email *</label>
                        <input
                          id="institute-email"
                          type="email"
                          required
                          value={instituteForm.email}
                          onChange={(e) => setInstituteForm({ ...instituteForm, email: e.target.value })}
                          placeholder="admin@academy.edu"
                          className="emam-form-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="institute-phone" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Phone / WhatsApp</label>
                        <input
                          id="institute-phone"
                          type="text"
                          value={instituteForm.phone}
                          onChange={(e) => setInstituteForm({ ...instituteForm, phone: e.target.value })}
                          placeholder="+44 20 7946 0991"
                          className="emam-form-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="institute-requirements" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Estimated Student Volume &amp; Requirements</label>
                      <textarea
                        id="institute-requirements"
                        rows={3}
                        value={instituteForm.requirements}
                        onChange={(e) => setInstituteForm({ ...instituteForm, requirements: e.target.value })}
                        placeholder="Estimated number of students, teachers, custom branding, or specific curriculum needs..."
                        className="emam-form-input" style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={instituteSubmitting}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: instituteSubmitting ? 0.7 : 1 }}
                  >
                    {instituteSubmitting ? 'Submitting Request...' : 'Submit Institutional Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 11. FACULTY APPLICATION MODAL                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {facultyModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(26, 0, 8, 0.88)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: '24px',
                border: '1px solid rgba(241, 163, 42, 0.35)',
                background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.97), rgba(44, 5, 13, 0.99))',
                padding: '2.5rem',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
              }}
            >
              {/* Close */}
              <button
                onClick={() => setFacultyModalOpen(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: '1' }}>&times;</span>
              </button>

              {facultySubmitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <span style={{ fontSize: '1.8rem', color: '#2ecc71' }}>✓</span>
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: '700', marginBottom: '0.75rem' }}>Application Submitted</h3>
                  <p style={{ color: '#f0ceb3', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Your faculty application has been received. Emam Super Admin will review your application and contact you via email with the outcome and next steps.
                  </p>
                  <button onClick={() => setFacultyModalOpen(false)} className="btn-primary" style={{ padding: '12px 32px' }}>Close</button>
                </div>
              ) : (
                <form onSubmit={handleFacultySubmit}>
                  <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                    Emam Certified Faculty Application
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--color-white)', fontWeight: '800', marginBottom: '0.4rem' }}>Apply to Teach at Emam</h3>
                  <p style={{ color: '#f0ceb3', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
                    Join Emam&apos;s certified Arabic faculty. Your application will be reviewed by Super Admin. Approved faculty receive a secure portal account and are listed in the public faculty directory.
                  </p>

                  {facultyError && (
                    <div style={{ background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.4)', borderRadius: '10px', padding: '10px 14px', color: '#e74c3c', fontSize: '0.88rem', marginBottom: '1rem' }}>
                      {facultyError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="faculty-first-name" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>First Name *</label>
                        <input id="faculty-first-name" type="text" required value={facultyForm.first_name} onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })} placeholder="e.g. Abdullah" className="emam-form-input" />
                      </div>
                      <div>
                        <label htmlFor="faculty-last-name" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Last Name *</label>
                        <input id="faculty-last-name" type="text" required value={facultyForm.last_name} onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })} placeholder="e.g. Al-Farouq" className="emam-form-input" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="faculty-email" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Email Address *</label>
                        <input id="faculty-email" type="email" required value={facultyForm.email} onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} placeholder="ustadh@example.com" className="emam-form-input" />
                      </div>
                      <div>
                        <label htmlFor="faculty-phone" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Phone / WhatsApp</label>
                        <input id="faculty-phone" type="text" value={facultyForm.phone} onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })} placeholder="+44 7700 900000" className="emam-form-input" />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="faculty-specialization" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Area of Specialization</label>
                        <select id="faculty-specialization" value={facultyForm.specialization} onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(241,163,42,0.25)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                          <option value="Arabic Grammar (Nahw & Sarf)">Arabic Grammar (Nahw &amp; Sarf)</option>
                          <option value="Quranic Arabic & Tafsir">Quranic Arabic &amp; Tafsir</option>
                          <option value="Classical Arabic Literature">Classical Arabic Literature</option>
                          <option value="Modern Standard Arabic (MSA)">Modern Standard Arabic (MSA)</option>
                          <option value="Arabic Morphology & Linguistics">Arabic Morphology &amp; Linguistics</option>
                          <option value="Arabic Touch-Typing & Keyboard">Arabic Touch-Typing &amp; Keyboard</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="faculty-experience" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Years of Experience</label>
                        <select id="faculty-experience" value={facultyForm.experience_years} onChange={(e) => setFacultyForm({ ...facultyForm, experience_years: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(241,163,42,0.25)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                          <option value="1">1 year</option>
                          <option value="2">2 years</option>
                          <option value="3">3 years</option>
                          <option value="5">5 years</option>
                          <option value="8">8+ years</option>
                          <option value="12">12+ years</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="faculty-qualification" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Academic Qualification</label>
                      <input id="faculty-qualification" type="text" value={facultyForm.qualification} onChange={(e) => setFacultyForm({ ...facultyForm, qualification: e.target.value })} placeholder="e.g. M.A. Arabic Linguistics, Al-Azhar University" className="emam-form-input" />
                    </div>

                    <div>
                      <label htmlFor="faculty-schedule" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>Preferred Teaching Schedule</label>
                      <select id="faculty-schedule" value={facultyForm.preferred_schedule} onChange={(e) => setFacultyForm({ ...facultyForm, preferred_schedule: e.target.value })} style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(241,163,42,0.25)', color: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                        <option value="Weekday Evenings & Weekend Cohorts">Weekday Evenings &amp; Weekend Cohorts</option>
                        <option value="Weekday Mornings (1-on-1)">Weekday Mornings (1-on-1)</option>
                        <option value="Weekend Group Sessions Only">Weekend Group Sessions Only</option>
                        <option value="Flexible / As Assigned">Flexible / As Assigned</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="faculty-cv" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>
                        Curriculum Vitae / Ijazah Document * (PDF, DOCX - Max 10MB)
                      </label>
                      <input
                        id="faculty-cv"
                        type="file"
                        required
                        accept=".pdf,.docx,.doc,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              setFacultyError('File size exceeds the 10MB limit. Please upload a smaller document.');
                              return;
                            }
                            setFacultyCvFile(file);
                            setFacultyError(null);
                          }
                        }}
                        className="emam-form-input"
                        style={{ padding: '8px 12px' }}
                      />
                      {facultyCvFile && (
                        <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--color-primary, #f1a32a)' }}>
                          Selected: {facultyCvFile.name} ({(facultyCvFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="faculty-about" style={{ display: 'block', fontSize: '0.85rem', color: '#f0ceb3', fontWeight: '600', marginBottom: '0.35rem' }}>About You / Teaching Philosophy</label>
                      <textarea id="faculty-about" rows={3} value={facultyForm.about} onChange={(e) => setFacultyForm({ ...facultyForm, about: e.target.value })} placeholder="Briefly describe your teaching background, methodology, and why you wish to join Emam faculty..." className="emam-form-input" style={{ resize: 'vertical' }} />
                    </div>
                  </div>

                  <button type="submit" disabled={facultySubmitting} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: facultySubmitting ? 0.7 : 1 }}>
                    {facultySubmitting ? 'Submitting Application...' : 'Submit Faculty Application'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
