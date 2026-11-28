import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Award, FileText, ChevronRight, X, ExternalLink } from 'lucide-react';
import { submissionsApi } from '../../api';

export function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submissionsApi.getAll();
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading student submissions:', err);
      setError('Failed to load submission history.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (filter === 'reviewed') return s.status === 'reviewed';
    if (filter === 'pending') return s.status === 'submitted';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
          My Submissions & Feedback
        </h1>
        <p style={{ color: 'rgba(241,163,42,0.55)', fontSize: '0.95rem', marginTop: '0.4rem', marginBottom: 0 }}>
          Complete history of your submitted assignments, instructor reviews, and academic grades.
        </p>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' }}>
        {[
          { key: 'all', label: `All Submissions (${submissions.length})` },
          { key: 'reviewed', label: `Graded & Reviewed (${submissions.filter((s) => s.status === 'reviewed').length})` },
          { key: 'pending', label: `Pending Review (${submissions.filter((s) => s.status === 'submitted').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              color: filter === tab.key ? 'var(--color-primary)' : 'rgba(241,163,42,0.55)',
              fontWeight: filter === tab.key ? 700 : 500,
              fontSize: '0.9rem',
              borderBottom: filter === tab.key ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions Table / Cards */}
      {loading ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'rgba(241,163,42,0.55)' }}>
          Loading your submission history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'rgba(241,163,42,0.55)' }}>No Submissions Found</div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Submissions Found</h3>
          <p style={{ color: 'rgba(241,163,42,0.55)', margin: 0 }}>
            {filter === 'reviewed'
              ? 'No reviewed submissions yet. Your instructor will grade your work soon.'
              : 'You have not submitted any coursework assignments yet.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filtered.map((sub) => {
            const isReviewed = sub.status === 'reviewed';
            return (
              <div
                key={sub.id}
                className="glass-panel"
                style={{
                  padding: '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderRadius: '14px',
                  borderTop: isReviewed ? '3px solid var(--color-primary)' : '3px solid rgba(241, 163, 42, 0.45)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  {/* Card Header: Status pill and Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        backgroundColor: isReviewed ? 'rgba(241, 163, 42, 0.14)' : 'rgba(251, 191, 36, 0.14)',
                        color: isReviewed ? 'var(--color-primary)' : '#b45309',
                        border: isReviewed ? '1px solid rgba(241, 163, 42, 0.25)' : '1px solid rgba(251, 191, 36, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isReviewed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{isReviewed ? 'Reviewed' : 'Awaiting Review'}</span>
                    </span>

                    <span style={{ fontSize: '0.78rem', color: 'rgba(241, 163, 42, 0.65)', fontWeight: 500 }}>
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* Task & Module Title */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--color-white)', lineHeight: 1.35 }}>
                    {sub.task_title}
                  </h3>
                  {sub.module_title && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {sub.module_title}
                    </div>
                  )}

                  {/* Score & Grade Display */}
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: isReviewed ? 'rgba(241, 163, 42, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(241, 163, 42, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: 'rgba(241, 163, 42, 0.7)', fontWeight: 500 }}>
                      {isReviewed ? 'Achieved Grade:' : 'Status:'}
                    </span>
                    {isReviewed && sub.grade ? (
                      <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={14} />
                        <span>Grade: {sub.grade} ({sub.score}%)</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                        In Evaluation Queue
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSub(sub)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                    }}
                  >
                    <span>View Feedback & Details</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission & Feedback Modal */}
      {selectedSub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel admin-modal-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: 'rgba(44, 5, 13, 0.92)',
              border: '1px solid rgba(241, 163, 42, 0.25)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'rgba(241,163,42,0.55)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Submission Details
                </span>
                <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: '0.2rem 0 0 0', fontWeight: 700 }}>
                  {selectedSub.task_title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(241,163,42,0.65)', cursor: 'pointer', padding: '4px' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Submitted */}
            <div style={{ marginBottom: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(241, 163, 42, 0.12)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(241,163,42,0.55)', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 600 }}>
                Your Submitted Text
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                {selectedSub.content || 'No text content provided.'}
              </p>

              {selectedSub.attachment_urls && selectedSub.attachment_urls.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(241,163,42,0.55)', fontWeight: 600 }}>Your Attachments:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                    {selectedSub.attachment_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={12} />
                        <span>File {i + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Feedback */}
            {selectedSub.status === 'reviewed' ? (
              <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(241, 163, 42, 0.12)', border: '1px solid rgba(241, 163, 42, 0.22)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                    Instructor Feedback
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Grade: {selectedSub.grade} ({selectedSub.score}%)
                  </span>
                </div>
                {selectedSub.feedback ? (
                  <p style={{ color: '#e2e8f0', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                    "{selectedSub.feedback}"
                  </p>
                ) : (
                  <p style={{ color: 'rgba(241,163,42,0.55)', fontSize: '0.85rem', margin: 0 }}>
                    No written notes provided.
                  </p>
                )}
              </div>
            ) : (
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#b45309', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                This submission is queued for grading by your instructor.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSelectedSub(null)} className="btn-primary" style={{ padding: '0.6rem 1.4rem', border: 'none', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
