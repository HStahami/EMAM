import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Video,
  Keyboard,
  FileText,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Compass,
  Mic,
  BookOpen,
} from 'lucide-react';

const TOUR_STORAGE_KEY = 'emam_student_feature_tour_completed_v1';

export function isFeatureTourCompleted() {
  try {
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markFeatureTourCompleted() {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  } catch (err) {
    console.warn('Failed to save tour status to localStorage:', err);
  }
}

export function resetFeatureTour() {
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to reset tour status in localStorage:', err);
  }
}

const TOUR_SLIDES = [
  {
    id: 'welcome',
    badge: 'Welcome • جولة تعريفية',
    arabicTitle: 'أهلاً وسهلاً بك في منصة إمام لتعليم العربية',
    title: 'Welcome to Emam Arabic LMS',
    subtitle: 'Your dedicated online sanctuary for mastering Classical and Modern Standard Arabic through CEFR-aligned pedagogy.',
    icon: Compass,
    accentColor: '#f1a32a',
    features: [
      {
        title: 'Structured CEFR Curriculum',
        desc: 'Progress from foundational A1 grammar to B2 advanced fluency with native certified Asatidha.',
      },
      {
        title: 'Personalized 1-on-1 Learning',
        desc: 'Interactive schedule slots and custom-paced syllabus designed around your availability.',
      },
      {
        title: 'All-In-One Modern Workspace',
        desc: 'Live classrooms, homework submissions, touch-typing drills, and notes in one unified portal.',
      },
    ],
    hint: 'Use the sidebar navigation anytime to switch between classes, typing lab, and assignments.',
  },
  {
    id: 'classroom',
    badge: 'Live Classroom • الفصل الذكي',
    arabicTitle: 'الفصل الذكي التفاعلي المباشر',
    title: 'Live WebRTC Smart Classroom',
    subtitle: 'Experience seamless bidirectional HD video classes directly inside your browser without installing third-party apps.',
    icon: Video,
    accentColor: '#f1a32a',
    features: [
      {
        title: 'Browser-Native WebRTC Audio & Video',
        desc: 'High-definition, low-latency communication with zero software installations required.',
      },
      {
        title: 'Real-Time Arabic Digital Whiteboard',
        desc: 'Ustadh illustrates calligraphy, grammatical roots (I\'rab), and live morphology diagrams.',
      },
      {
        title: 'Automatic Session Archive',
        desc: 'Past recordings and whiteboards are automatically synced with your Class Notes for instant revision.',
      },
    ],
    hint: 'Check your Class Timetable on the dashboard to see when your next live session goes active.',
  },
  {
    id: 'typing_lab',
    badge: 'Typing Lab • مهارة الطباعة',
    arabicTitle: 'مختبر الطباعة باللمس للغة العربية',
    title: '200-Level Arabic Touch-Typing Lab',
    subtitle: 'Build swift 10-finger muscle memory in Arabic with our dedicated 200-stage typing gymnasium.',
    icon: Keyboard,
    accentColor: '#f1a32a',
    features: [
      {
        title: '200 Progressive Drill Levels',
        desc: 'Start with home row letters and advance toward complete classical prose, poetry, and syntax.',
      },
      {
        title: 'Real-Time WPM & Accuracy Metrics',
        desc: 'Instant speed tracking, error penalization, and precision scoring to build true muscle memory.',
      },
      {
        title: 'Complete Tashkeel Diacritics Support',
        desc: 'Master Arabic Harakat (Fathah, Dammah, Kasrah, Sukun, Tanween) with visual keyboard guides.',
      },
    ],
    hint: 'Practice 10 minutes a day in the Typing Lab to double your Arabic typing speed within two weeks.',
  },
  {
    id: 'tasks_homework',
    badge: 'Assignments • الواجبات والتقييم',
    arabicTitle: 'المهام الدراسية وتسجيلات النطق',
    title: 'Course Tasks & Audio Recitations',
    subtitle: 'Solidify your learning with modular assignments, vocabulary quizzes, and voice recording homework.',
    icon: FileText,
    accentColor: '#f1a32a',
    features: [
      {
        title: 'In-Browser Studio Voice Recorder',
        desc: 'Record and submit your oral reading, Tajweed, and conversational Arabic with one click.',
      },
      {
        title: 'Structured Modular Lessons',
        desc: 'Submit written homework, take reading quizzes, and review comprehensive lesson materials.',
      },
      {
        title: 'Personalized Teacher Feedback',
        desc: 'Receive rubric grades, line-by-line grammar notes, and Ustadh audio feedback on every submission.',
      },
    ],
    hint: 'Upcoming deadlines and pending homework are always highlighted on your main dashboard.',
  },
  {
    id: 'notes_certificates',
    badge: 'Achievements • الدفتر والشهادة',
    arabicTitle: 'الدفتر الذكي والشهادة المعتمدة',
    title: 'Smart Notebook & Verified Certification',
    subtitle: 'Organize your Arabic vocabulary, monitor your attendance, and graduate with a verifiable credential.',
    icon: Award,
    accentColor: '#f1a32a',
    features: [
      {
        title: 'Smart Arabic Notebook',
        desc: 'Store lesson vocabulary with built-in vocalization tools and quick search capabilities.',
      },
      {
        title: 'Automated Attendance & Progress',
        desc: 'Transparent tracking of your live class presence, average quiz scores, and course milestones.',
      },
      {
        title: 'Tamper-Proof QR Certificate',
        desc: 'Earn a cryptographically verifiable CEFR certificate with a unique public QR verification link.',
      },
    ],
    hint: 'You are now ready to begin your journey with Emam Arabic LMS!',
  },
];

export function StudentFeatureTourModal({ isOpen, onClose, onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleFinish = useCallback(() => {
    markFeatureTourCompleted();
    if (onComplete) onComplete();
    if (onClose) onClose();
  }, [onComplete, onClose]);

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
      aria-labelledby="tour-slide-title"
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(241, 163, 42, 0.14)',
                border: '1px solid rgba(241, 163, 42, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.04em' }}>
                EMAM ARABIC LMS • FEATURE TOUR
              </div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                Step {currentSlide + 1} of {TOUR_SLIDES.length}
              </div>
            </div>
          </div>

          {/* Quick Skip / Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleFinish}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.82rem',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-white)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Skip Tour
            </button>
            <button
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
              {/* Badge */}
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

              {/* Arabic Subtitle */}
              <div
                dir="rtl"
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-accent)',
                  fontFamily: 'serif',
                  marginBottom: '0.2rem',
                  fontWeight: 600,
                }}
              >
                {slide.arabicTitle}
              </div>

              {/* English Heading */}
              <h2
                id="tour-slide-title"
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
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Pro Tip:</span>
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
              <span>{isLast ? 'Start Learning Portal' : 'Next Feature'}</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
