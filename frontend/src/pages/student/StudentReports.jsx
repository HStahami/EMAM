import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export function StudentReports() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    void loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApi.getMyReport();
      setReport(data);
    } catch (err) {
      console.error('Error loading student progress report:', err);
      setError('Failed to compute your academic progress report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(241,163,42,0.55)' }}>
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'rgba(241,163,42,0.55)' }}>Progress Report</div>
        <p style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Computing your dynamic progress report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
        <p>{error || 'Report data currently unavailable.'}</p>
        <button onClick={loadReport} className="btn-primary" style={{ border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const tasks = report.tasks || {};
  const attendance = report.attendance || {};
  const assessments = report.assessments || {};
  const overallProgress = report.overall_progress_score || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Print Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
            Academic Progress & Evaluation
          </h1>
          <p style={{ color: 'rgba(241,163,42,0.55)', fontSize: '0.95rem', marginTop: '0.4rem', marginBottom: 0 }}>
            Real-time analytics across coursework completion, session attendance, and assessment grades.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-primary"
          style={{
            padding: '0.6rem 1.4rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Print Academic Report
        </button>
      </div>

      {/* Main Overall Progress Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(105, 14, 31, 0.45) 0%, rgba(44, 5, 13, 0.85) 100%)',
          borderLeft: '4px solid var(--color-primary)',
          border: '1px solid rgba(241, 163, 42, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(241,163,42,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Academic Progress Score
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0.25rem 0 0.75rem 0' }}>
            {overallProgress}%
          </div>

          <div style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden', maxWidth: '480px' }}>
            <div
              style={{
                width: `${overallProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #690e1f 0%, #f1a32a 100%)',
              }}
            />
          </div>

          <p style={{ color: '#f0ceb3', fontSize: '0.85rem', marginTop: '0.75rem', marginBottom: 0 }}>
            Calculated dynamically based on 50% task completion, 30% attendance punctuality, and 20% assessment scores.
          </p>
        </div>

        {/* Student Dossier Badge */}
        <div style={{ padding: '1rem 1.5rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(241, 163, 42, 0.18)', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(241,163,42,0.55)' }}>Student ID</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            {user?.student_code || 'N/A'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fff', marginTop: '0.2rem' }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* 3 Analytics Pillar Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* 1. Tasks Completion */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>
              Coursework Completion
            </h3>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {tasks.completion_rate || 0}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Total Tasks Assigned:</span>
              <strong style={{ color: '#fff' }}>{tasks.total_assigned || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Submitted by You:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{tasks.total_submitted || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Pending Tasks:</span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {(tasks.total_assigned || 0) - (tasks.total_submitted || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Attendance Standing */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>
              Attendance Punctuality
            </h3>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {attendance.attendance_rate ?? 100}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Total Sessions Logged:</span>
              <strong style={{ color: '#fff' }}>{attendance.total_sessions || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Present:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{attendance.present || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Late / Excused:</span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {(attendance.late || 0) + (attendance.excused || 0)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Absent:</span>
              <strong style={{ color: '#f87171' }}>{attendance.absent || 0}</strong>
            </div>
          </div>
        </div>

        {/* 3. Academic Assessments */}
        <div className="glass-panel" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 600 }}>
              Assessment Grades
            </h3>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {assessments.average_score != null ? `${assessments.average_score}%` : 'N/A'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Graded Submissions:</span>
              <strong style={{ color: '#fff' }}>{assessments.total_graded || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
              <span>Average Grade Score:</span>
              <strong style={{ color: 'var(--color-primary)' }}>
                {assessments.average_score != null ? `${assessments.average_score}%` : 'No scores yet'}
              </strong>
            </div>
            {assessments.grades_recorded && assessments.grades_recorded.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f0ceb3' }}>
                <span>Grades Earned:</span>
                <span style={{ color: '#fff' }}>
                  {assessments.grades_recorded.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
