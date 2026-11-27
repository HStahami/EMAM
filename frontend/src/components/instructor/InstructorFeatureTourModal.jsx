import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Users,
  CheckSquare,
  FileText,
  Compass,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'emam_instructor_feature_tour_completed_v1';

export function isFeatureTourCompleted(userId) {
  const key = userId ? `${TOUR_STORAGE_KEY}_${userId}` : TOUR_STORAGE_KEY;
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function markFeatureTourCompleted(userId) {
  const key = userId ? `${TOUR_STORAGE_KEY}_${userId}` : TOUR_STORAGE_KEY;
  try {
    localStorage.setItem(key, 'true');
  } catch (err) {
    console.warn('Failed to save tour status to localStorage:', err);
  }
}

export function resetFeatureTour(userId) {
  const key = userId ? `${TOUR_STORAGE_KEY}_${userId}` : TOUR_STORAGE_KEY;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('Failed to reset tour status in localStorage:', err);
  }
}

const TOUR_SLIDES = [
  {
    id: 'overview',
    badge: 'Overview',
    title: 'Welcome to Emam Faculty Portal',
    subtitle: 'Your dedicated teaching workstation to orchestrate live Arabic classes, mentor cohorts, and evaluate student coursework.',
    icon: Compass,
    features: [
      {
        title: 'Daily Timetable & Slots',
        desc: 'View active class hours, 1-on-1 student schedules, and cohort allocations on your central dashboard.',
      },
      {
        title: 'Centralized Messaging & Alerts',
        desc: 'Receive instant notifications when students submit homework or request slot schedule adjustments.',
      },
      {
        title: 'Operational Teaching Metrics',
        desc: 'Track daily attendance ratios, pending submissions count, and total active students at a glance.',
      },
    ],
    hint: 'Your active timetable and quick-launch buttons are always pinned to the top of your dashboard.',
  },
  {
    id: 'classroom',
    badge: 'Live Classroom',
    title: 'Live WebRTC Smart Classroom',
    subtitle: 'Deliver high-definition interactive classes directly in your browser with our Arabic digital calligraphy whiteboard.',
    icon: Video,
    features: [
      {
        title: 'Browser-Native WebRTC Audio & Video',
        desc: 'Host bidirectional audio/video sessions with zero third-party software or external meeting links required.',
      },
      {
        title: 'Arabic Calligraphy & I\'rab Whiteboard',
        desc: 'Illustrate complex grammar trees, morphology roots, and Tashkeel strokes in real-time for students.',
      },
      {
        title: 'Screen Sharing & Session Archival',
        desc: 'Present curriculum slides, share instructional materials, and record sessions for revision.',
      },
    ],
    hint: 'Launch the live classroom 5 minutes early to test microphone and camera connectivity.',
  },
  {
    id: 'students',
    badge: 'Student Roster',
    title: 'Student Management & Attendance',
    subtitle: 'Review student profiles, mark class attendance registers, and monitor at-risk learners.',
    icon: Users,
    features: [
      {
        title: 'Assigned Student Profiles',
        desc: 'Access student background information, CEFR module tracks, preferred timings, and contact notes.',
      },
      {
        title: 'Daily Attendance Register',
        desc: 'Mark presence, absences, or excused sessions with real-time percentage updates for student records.',
      },
      {
        title: 'At-Risk Student Alerts',
        desc: 'Quickly identify students falling behind in attendance or task submissions for early intervention.',
      },
    ],
    hint: 'Marking attendance accurately ensures students stay on track for CEFR course graduation.',
  },
  {
    id: 'tasks',
    badge: 'Assignments',
    title: 'Coursework & Task Builder',
    subtitle: 'Create structured assignments, upload reference study sheets, and assign deadlines.',
    icon: CheckSquare,
    features: [
      {
        title: 'Modular Homework Assignments',
        desc: 'Publish reading, translation, and grammatical tasks linked directly to syllabus modules.',
      },
      {
        title: 'Reference Material Attachments',
        desc: 'Upload worksheets, practice PDFs, and audio prompts for students to review and complete.',
      },
      {
        title: 'Clear Deadlines & Expectations',
        desc: 'Set submission due dates and clear scoring expectations to keep your cohort on schedule.',
      },
    ],
    hint: 'Students can submit typed textual solutions as well as handwritten scanned PDF documents.',
  },
  {
    id: 'grading',
    badge: 'Submissions & Grading',
    title: 'Submissions & Academic Assessment',
    subtitle: 'Review student homework, evaluate oral recitation recordings, and assign official grades.',
    icon: FileText,
    features: [
      {
        title: 'Comprehensive Submissions Inbox',
        desc: 'Filter submissions by pending review, reviewed, or module to streamline your grading workflow.',
      },
      {
        title: 'Oral Voice & Document Review',
        desc: 'Listen to student Quranic recitation recordings and inspect submitted homework attachments.',
      },
      {
        title: 'Rubric Scores & Voice/Written Feedback',
        desc: 'Assign percentage marks, letter grades (A+, A, B), and write constructive guidance notes.',
      },
    ],
    hint: 'Graded submissions instantly sync with student scorecards and the verified certificate generator.',
  },
];

export function InstructorFeatureTourModal({ isOpen, onClose, onComplete, userId }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFinish = useCallback(() => {
    markFeatureTourCompleted(userId);
    if (onComplete) onComplete();
    if (onClose) onClose();
  }, [userId, onComplete, onClose]);

  const handleNext = useCallback(() => {
    if (currentSlide < TOUR_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentSlide, handleFinish]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleFinish, handleNext, handlePrev]);

  if (!isOpen) return null;

  const slide = TOUR_SLIDES[currentSlide];
  const SlideIcon = slide.icon;
  const isLast = currentSlide === TOUR_SLIDES.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructor-tour-slide-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(20, 3, 7, 0.86)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#2c050d',
          backgroundImage: 'linear-gradient(150deg, #2c050d 0%, #1c0309 50%, #440915 100%)',
          border: '1px solid rgba(241, 163, 42, 0.32)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(241, 163, 42, 0.12)',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(240, 206, 179, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(105, 14, 31, 0.32)',
          }}
        >
          {/* Brand & Step Tag */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
              EMAM FACULTY PORTAL • FEATURE TOUR
            </div>
            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
              Step {currentSlide + 1} of {TOUR_SLIDES.length}
            </div>
          </div>

          {/* Controls: Styled Skip Tour & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleFinish}
              style={{
                backgroundColor: 'rgba(105, 14, 31, 0.45)',
                border: '1px solid rgba(240, 206, 179, 0.28)',
                color: 'var(--color-accent)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.backgroundColor = 'rgba(105, 14, 31, 0.85)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)';
                e.currentTarget.style.backgroundColor = 'rgba(105, 14, 31, 0.45)';
                e.currentTarget.style.borderColor = 'rgba(240, 206, 179, 0.28)';
              }}
            >
              Skip Tour
            </button>

            <button
              type="button"
              onClick={handleFinish}
              aria-label="Close tour"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(240, 206, 179, 0.18)',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(105, 14, 31, 0.65)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Main Slide Title & Icon Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(240, 206, 179, 0.12)',
            }}
          >
            {/* Big Icon Container */}
            <div
              style={{
                width: '64px',
                height: '64px',
                flexShrink: 0,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.65) 0%, rgba(241, 163, 42, 0.22) 100%)',
                border: '1.5px solid rgba(241, 163, 42, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
              }}
            >
              <SlideIcon size={32} />
            </div>

            <div style={{ flex: 1 }}>
              {/* English Badge */}
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(241, 163, 42, 0.15)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(241, 163, 42, 0.3)',
                  marginBottom: '0.45rem',
                }}
              >
                {slide.badge}
              </div>

              {/* English Heading */}
              <h2
                id="instructor-tour-slide-title"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: '0 0 0.4rem 0',
                  lineHeight: 1.3,
                }}
              >
                {slide.title}
              </h2>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#e2e8f0',
                  lineHeight: '1.45',
                  margin: 0,
                }}
              >
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {slide.features.map((feat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(105, 14, 31, 0.28)',
                  border: '1px solid rgba(240, 206, 179, 0.12)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div
                  style={{
                    color: 'var(--color-primary)',
                    marginTop: '2px',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: '0.15rem',
                    }}
                  >
                    {feat.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--color-accent)',
                      lineHeight: '1.4',
                    }}
                  >
                    {feat.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Pro-Tip Box */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(241, 163, 42, 0.08)',
              borderLeft: '3px solid var(--color-primary)',
              fontSize: '0.82rem',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Faculty Tip:</span>
            <span>{slide.hint}</span>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid rgba(240, 206, 179, 0.14)',
            background: 'rgba(105, 14, 31, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Back Button */}
          <div>
            {currentSlide > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(240, 206, 179, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                Quick 5-step walkthrough
              </span>
            )}
          </div>

          {/* Slide Indicator Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {TOUR_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: currentSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === idx ? 'var(--color-primary)' : 'rgba(240, 206, 179, 0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  padding: 0,
                  boxShadow: currentSlide === idx ? '0 0 8px rgba(241, 163, 42, 0.4)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <div>
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#2c050d',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(241, 163, 42, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(241, 163, 42, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(241, 163, 42, 0.25)';
              }}
            >
              <span>{isLast ? 'Enter Faculty Workspace' : 'Next Feature'}</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
