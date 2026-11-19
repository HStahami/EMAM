import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Decorative borders on cover page
            self.saveState()
            self.setStrokeColor(colors.HexColor("#690E1F"))
            self.setLineWidth(3)
            self.rect(28, 28, letter[0] - 56, letter[1] - 56)
            self.setStrokeColor(colors.HexColor("#F1A32A"))
            self.setLineWidth(1)
            self.rect(32, 32, letter[0] - 64, letter[1] - 64)
            self.restoreState()
            return

        self.saveState()
        # Top Running Header
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#690E1F"))
        self.drawString(54, letter[1] - 36, "EMAM ARABIC LMS")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7A6A6E"))
        self.drawString(145, letter[1] - 36, "|   Comprehensive Platform Architecture & Scaling Roadmap")
        
        # Header thin gold line
        self.setStrokeColor(colors.HexColor("#F1A32A"))
        self.setLineWidth(0.75)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

        # Footer thin burgundy line
        self.setStrokeColor(colors.HexColor("#E5D7D0"))
        self.setLineWidth(0.5)
        self.line(54, 45, letter[0] - 54, 45)
        
        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#7A6A6E"))
        self.drawString(54, 32, "Confidential • Emam Multi-Tenant Cloud Ecosystem")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_str)
        self.restoreState()

def build_pdf(filename="Emam_LMS_Comprehensive_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    c_primary = colors.HexColor("#690E1F")   # Royal Burgundy
    c_dark = colors.HexColor("#2C050D")      # Deep Wine
    c_gold = colors.HexColor("#D48B1E")      # Rich Gold
    c_gold_light = colors.HexColor("#FDF6E9")
    c_body = colors.HexColor("#2C1E21")      # High contrast dark text
    c_muted = colors.HexColor("#5C4D51")
    c_border = colors.HexColor("#E2D3CA")
    c_soft_bg = colors.HexColor("#FBF8F3")

    # Custom Paragraph Styles
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_primary,
        alignment=1,
        spaceAfter=10
    )

    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_muted,
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_dark,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'DocH3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13.5,
        textColor=c_gold,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.2,
        leading=13,
        textColor=c_body,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12.5,
        textColor=c_dark
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=11.5,
        textColor=colors.white,
        alignment=0
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11,
        textColor=c_body
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )

    story = []

    # ========================================================
    # COVER PAGE
    # ========================================================
    story.append(Spacer(1, 40))
    logo_path = os.path.abspath("frontend/public/emam_logo.png")
    if os.path.exists(logo_path):
        story.append(Image(logo_path, width=72, height=72))
        story.append(Spacer(1, 15))

    story.append(Paragraph("EMAM ARABIC LMS &amp; INSTITUTIONAL ERP", cover_title_style))
    story.append(Paragraph("The Unified Multi-Tenant Cloud Ecosystem for Arabic Language Academies,<br/>Professional Tutors, and Global Learners", cover_subtitle_style))
    
    story.append(HRFlowable(width="80%", thickness=2, color=c_gold, spaceBefore=4, spaceAfter=22))

    cover_desc = (
        "<b>Executive Whitepaper, Architecture Blueprint &amp; Strategic Scaling Roadmap</b><br/><br/>"
        "This official documentation outlines the business vision, pedagogical problem space, "
        "and technical architecture of Emam Arabic LMS. Engineered for both technical and non-technical stakeholders, "
        "it covers four-tier multi-tenancy, digital Arabic literacy mechanics (such as the Touch-Typing Lab and Smart Notebook), "
        "automated admissions pipelines, and future scaling milestones including payment gateway integrations, "
        "enterprise white-labeling, AI speech analysis, and native mobile apps."
    )
    story.append(Paragraph(cover_desc, ParagraphStyle('CoverDesc', parent=body_style, alignment=1, fontSize=9.8, leading=14.5, textColor=c_muted)))
    
    story.append(Spacer(1, 35))

    # Metadata Table
    meta_data = [
        [Paragraph("<b>Document Classification:</b>", table_cell_bold), Paragraph("Official System Whitepaper &amp; Strategic Blueprint", table_cell_style)],
        [Paragraph("<b>Target Audience:</b>", table_cell_bold), Paragraph("Executive Directors, Academy Deans, Product Managers, Investors, Software Architects", table_cell_style)],
        [Paragraph("<b>Platform Version:</b>", table_cell_bold), Paragraph("v2.4 (Production Ready)", table_cell_style)],
        [Paragraph("<b>Architecture Model:</b>", table_cell_bold), Paragraph("Multi-Tenant Cloud SaaS (Partitioned Institutes &amp; Super Admin)", table_cell_style)],
        [Paragraph("<b>Primary Tech Stack:</b>", table_cell_bold), Paragraph("React 18 + Vite, Node.js / Express, PostgreSQL / SQLite, REST APIs", table_cell_style)],
        [Paragraph("<b>Release Date:</b>", table_cell_bold), Paragraph("November 2026", table_cell_style)],
    ]
    t_meta = Table(meta_data, colWidths=[150, 320])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_soft_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(t_meta)

    story.append(PageBreak())

    # ========================================================
    # SECTION 1: EXECUTIVE SUMMARY
    # ========================================================
    story.append(Paragraph("1. Executive Summary &amp; Platform Vision", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "<b>Emam Arabic LMS</b> is a specialized, multi-tenant Cloud Learning Management System and Institutional ERP "
        "engineered exclusively for Arabic language education. While general-purpose platforms (such as Canvas, Moodle, "
        "or Teachable) provide generic course repositories, they completely overlook the acute linguistic, orthographic, "
        "and operational demands unique to Arabic academia.",
        body_style
    ))
    story.append(Paragraph(
        "Arabic education requires nuanced Right-to-Left (RTL) typography, native Arabic keyboard typing proficiency, "
        "CEFR-aligned curriculum structures (A1 to B2), rigorous attendance verification, and dedicated administrative "
        "mechanisms for language academies. Emam unites all these requirements into a modern, high-speed single platform.",
        body_style
    ))

    # Callout Box
    callout_data = [[
        Paragraph(
            "<b>The Core Premise:</b> Emam bridges the divide between <i>Pedagogical Depth</i> and <i>Institutional Automation</i>. "
            "Whether serving an individual independent tutor or a large Arabic language academy with hundreds of students, "
            "Emam delivers data isolation, unified academic reporting, automated admissions, and an interactive digital classroom.",
            callout_style
        )
    ]]
    t_callout = Table(callout_data, colWidths=[490])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_gold_light),
        ('BOX', (0, 0), (-1, -1), 1, c_gold),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 11),
        ('RIGHTPADDING', (0, 0), (-1, -1), 11),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 8))

    # ========================================================
    # SECTION 2: PROBLEMS SOLVED BY EMAM LMS
    # ========================================================
    story.append(Paragraph("2. Problems Solved: Bridging Critical Industry Gaps", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Traditional Arabic teaching models and existing LMS products suffer from significant structural bottlenecks. "
        "Below are the primary problems Emam identifies and systematically solves:",
        body_style
    ))

    problems = [
        ("Problem 1: The Arabic Typing & Orthographic Barrier",
         "<b>Current Reality:</b> In traditional remote classes, students listen to lectures passively or submit photos of handwritten notes. Students never develop rapid Arabic keyboard skills, severely hampering their career readiness and digital fluency.<br/>"
         "<b>Emam Solution:</b> Built-in <b>Arabic Touch-Typing Lab</b> with live virtual keyboard visualization, real-time WPM (Words Per Minute), Accuracy percentages, sequential difficulty tiers, and instant cryptographically verifiable certificates upon module completion."),
        
        ("Problem 2: The Chaos of WhatsApp, Zoom Links & Spreadsheets",
         "<b>Current Reality:</b> Independent academies operate across fragmented tools: Zoom links shared in WhatsApp groups, homework emailed as PDFs, student fee receipts stored in personal bank apps, and class attendance kept in messy Excel sheets.<br/>"
         "<b>Emam Solution:</b> A consolidated <b>All-in-One Cloud Portal</b>. Timetables, smart classroom notes, homework submissions, attendance tracking, and reschedule requests all live within a single role-gated environment."),

        ("Problem 3: Multi-Tenancy & Data Leakage in Generic Platforms",
         "<b>Current Reality:</b> Generic platforms either force academies into expensive single-tenant installations (requiring dedicated DevOps staff) or mingle student and financial records across an insecure shared database.<br/>"
         "<b>Emam Solution:</b> Native <b>Multi-Tenant Architecture</b>. Each language institute gets an isolated administrative partition where its student records, fee approvals, instructor salaries, and gradebooks are completely insulated from other institutions, yet overseen globally by Super Admin."),

        ("Problem 4: Manual Admission Verification & Sequential Student IDs",
         "<b>Current Reality:</b> When students apply, admissions officers waste countless hours verifying bank transaction proofs, assigning manual roll numbers, and emailing login credentials manually.<br/>"
         "<b>Emam Solution:</b> Automated <b>Admissions Pipeline</b>. Students submit structured admission forms with payment proof upload. Administrators approve applicants with one click, generating standard institutional IDs (e.g. <code>EMAM-2026-0042</code>) and automated account credentials."),

        ("Problem 5: Inability to Detect At-Risk Students Early",
         "<b>Current Reality:</b> Academy directors only realize a student has abandoned a course when they fail exams or stop paying tuition fees.<br/>"
         "<b>Emam Solution:</b> Proactive <b>'Students at Risk' Predictive Analytics</b>. The system monitors low task completion rates, missed attendance, and lagging touch-typing progress, immediately alerting the instructor and admin to intervene before dropout happens.")
    ]

    for p_title, p_desc in problems:
        story.append(Paragraph(f"• <b>{p_title}</b>", h2_style))
        story.append(Paragraph(p_desc, bullet_style))
        story.append(Spacer(1, 3))

    # Comparison Matrix Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("Comparison Matrix: Generic LMS vs. Emam Arabic LMS", h2_style))
    matrix_data = [
        [Paragraph("Feature / Capability", table_header_style), Paragraph("Generic LMS (Moodle/Canvas)", table_header_style), Paragraph("Emam Arabic LMS", table_header_style)],
        [Paragraph("<b>Arabic Orthography &amp; RTL</b>", table_cell_bold), Paragraph("Basic RTL CSS flip, clunky fonts", table_cell_style), Paragraph("Native Arabic typography (Amiri/Cairo), full RTL", table_cell_style)],
        [Paragraph("<b>Arabic Touch-Typing Lab</b>", table_cell_bold), Paragraph("None (External 3rd-party required)", table_cell_style), Paragraph("Built-in with live keyboard, WPM &amp; Certificate", table_cell_style)],
        [Paragraph("<b>Multi-Tenant Academy ERP</b>", table_cell_bold), Paragraph("Requires separate server installs", table_cell_style), Paragraph("Native multi-tenant isolation out-of-the-box", table_cell_style)],
        [Paragraph("<b>Admission &amp; Fee Verification</b>", table_cell_bold), Paragraph("External plugins or manual workflows", table_cell_style), Paragraph("Integrated proof verification &amp; sequential ID engine", table_cell_style)],
        [Paragraph("<b>CEFR-Aligned Progression</b>", table_cell_bold), Paragraph("Generic unstructured courses", table_cell_style), Paragraph("A1, A2, B1, B2 structured milestones &amp; modules", table_cell_style)],
        [Paragraph("<b>At-Risk Student Alerts</b>", table_cell_bold), Paragraph("Requires complex enterprise add-ons", table_cell_style), Paragraph("Automated dashboard cards flagging lagging students", table_cell_style)]
    ]
    t_matrix = Table(matrix_data, colWidths=[130, 175, 175])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_soft_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_matrix)

    story.append(PageBreak())

    # ========================================================
    # SECTION 3: SYSTEM ARCHITECTURE & USER ROLES
    # ========================================================
    story.append(Paragraph("3. System Architecture &amp; User Ecosystem", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Emam LMS is engineered around four distinct user personas, ensuring clear segregation of duties, "
        "data security, and operational efficiency across the entire educational lifecycle:",
        body_style
    ))

    roles = [
        ("1. Super Admin Portal (Global Governance)",
         "Super Admin sits at the apex of the multi-tenant architecture. Responsibilities include provisioning new language institutes, monitoring global platform health, reviewing faculty applications from the landing page, and ensuring system-wide security, database integrity, and feature deployments."),
        
        ("2. Institute Admin Portal (Academy Operations ERP)",
         "Each subscribed academy operates within its own dedicated partition. The Institute Admin manages instructor onboarding, student admissions review, fee proof approvals, timetable creation, cohort assignments, and overall institutional revenue performance."),

        ("3. Instructor Portal (Academic Delivery & Classroom Management)",
         "Designed for native Arabic tutors and grammar specialists. Instructors manage their assigned cohorts, launch live smart classrooms, track daily attendance, assign homework and quizzes, grade submissions with personalized feedback, and communicate directly with students."),

        ("4. Student Portal (Interactive Learner Experience)",
         "Students enjoy a modern, responsive learning environment. Features include curriculum progression tracking (A1 to B2), the Arabic Touch-Typing Lab, Smart Notebook with instant Arabic notes, homework submission portal, timetable calendar, and automated downloadable certificates.")
    ]

    for r_title, r_desc in roles:
        story.append(Paragraph(r_title, h2_style))
        story.append(Paragraph(r_desc, body_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Technical Architectural Stack", h2_style))
    
    tech_data = [
        [Paragraph("Tier", table_header_style), Paragraph("Technology Selection", table_header_style), Paragraph("Architectural Rationale", table_header_style)],
        [Paragraph("<b>Frontend Framework</b>", table_cell_bold), Paragraph("React 18 + Vite", table_cell_style), Paragraph("Blazing fast HMR, component modularity, instant responsive page transitions.", table_cell_style)],
        [Paragraph("<b>Design &amp; Animations</b>", table_cell_bold), Paragraph("Framer Motion + Custom CSS", table_cell_style), Paragraph("Emam Royal Burgundy &amp; Gold palette, smooth micro-interactions, dark/light theme support.", table_cell_style)],
        [Paragraph("<b>API &amp; Backend</b>", table_cell_bold), Paragraph("Node.js + Express REST API", table_cell_style), Paragraph("Non-blocking asynchronous I/O, lightweight execution, scalable microservice-ready routes.", table_cell_style)],
        [Paragraph("<b>Authentication &amp; RBAC</b>", table_cell_bold), Paragraph("JWT + Role Guards", table_cell_style), Paragraph("Stateless session management, strict tenant isolation, encrypted password hashing.", table_cell_style)],
        [Paragraph("<b>Data Layer</b>", table_cell_bold), Paragraph("PostgreSQL / SQLite Relational", table_cell_style), Paragraph("ACID compliance, strict foreign key constraints between tenants, students, and courses.", table_cell_style)]
    ]
    t_tech = Table(tech_data, colWidths=[110, 150, 220])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_dark),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_soft_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_tech)

    story.append(Spacer(1, 10))

    # ========================================================
    # SECTION 4: SIGNATURE FUNCTIONAL HIGHLIGHTS
    # ========================================================
    story.append(Paragraph("4. Signature Functional Innovations &amp; Data Security", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    innovations = [
        ("Arabic Touch-Typing Lab &amp; Real-Time Feedback",
         "Unlike standard English typing software, Emam features a specialized Arabic keyboard with Harakat (diacritics: Fatha, Damma, Kasra, Sukun). It calculates Net WPM, Raw WPM, Accuracy (%), and flags character-by-character errors in real-time. Students who complete the lab receive an automatic, tamper-proof certificate."),
        
        ("Smart Notebook &amp; Linguistic Notes Repository",
         "Students can maintain digital notebooks for vocabulary, Nahw (syntax), and Sarf (morphology) directly alongside their lecture screen. Notes support rich Arabic formatting and can be saved and searched on demand."),

        ("Unified Admissions &amp; Financial Verification",
         "Replaces spreadsheet accounting with a digital approval ledger. Receipts uploaded by students are cross-checked by administrators, and once marked as approved, student enrollment is unlocked instantly with sequential ID numbering.")
    ]

    for in_title, in_desc in innovations:
        story.append(Paragraph(f"<b>{in_title}</b>", h3_style))
        story.append(Paragraph(in_desc, body_style))

    story.append(Spacer(1, 6))

    # End-to-End Workflow Flowchart Table
    story.append(Paragraph("End-to-End Academic Lifecycle Workflow", h2_style))
    flow_data = [
        [Paragraph("Step", table_header_style), Paragraph("User Action", table_header_style), Paragraph("System Process", table_header_style), Paragraph("Outcome", table_header_style)],
        [Paragraph("<b>1. Apply</b>", table_cell_bold), Paragraph("Prospective student fills admission form &amp; uploads receipt.", table_cell_style), Paragraph("Payload validated, stored in Pending Admissions ledger.", table_cell_style), Paragraph("Confirmation email sent.", table_cell_style)],
        [Paragraph("<b>2. Verify</b>", table_cell_bold), Paragraph("Institute Admin reviews proof against bank statements.", table_cell_style), Paragraph("One-click approval triggers ID generation.", table_cell_style), Paragraph("Generates <code>EMAM-YYYY-XXXX</code> ID.", table_cell_style)],
        [Paragraph("<b>3. Learn</b>", table_cell_bold), Paragraph("Student accesses Smart Classroom &amp; Typing Lab.", table_cell_style), Paragraph("Logs progress, attendance, and WPM scores.", table_cell_style), Paragraph("Active cohort enrollment.", table_cell_style)],
        [Paragraph("<b>4. Certify</b>", table_cell_bold), Paragraph("Student completes CEFR modules or Typing tiers.", table_cell_style), Paragraph("Generates cryptographically signed certificate.", table_cell_style), Paragraph("Publicly verifiable credential.", table_cell_style)]
    ]
    t_flow = Table(flow_data, colWidths=[65, 140, 155, 120])
    t_flow.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_soft_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_flow)

    story.append(PageBreak())

    # ========================================================
    # SECTION 5: FUTURE PLANS & SCALING ROADMAP
    # ========================================================
    story.append(Paragraph("5. Future Scaling Roadmap: 2026 - 2027", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "To scale Emam from an institutional LMS into a global Arabic educational infrastructure, "
        "the engineering and product team has structured the following phased expansion roadmap:",
        body_style
    ))

    roadmap_phases = [
        ("Phase 1: Automated Multi-Gateway Payment Processing",
         "Currently, admissions rely on manual bank slip verification. The next immediate milestone is full payment gateway integration:<br/>"
         "• <b>International Gateways:</b> Stripe &amp; PayPal for recurring credit/debit card subscriptions (USD, EUR, GBP, SAR, AED).<br/>"
         "• <b>Local Regional Gateways:</b> JazzCash, EasyPaisa, SadaPay, and Nayapay for frictionless local student onboarding in Pakistan and regional markets.<br/>"
         "• <b>Automated Enrollment:</b> Upon successful webhook confirmation from payment providers, the student's admission status shifts from <i>Pending</i> to <i>Enrolled</i> automatically without requiring manual admin intervention.<br/>"
         "• <b>Automated Invoicing &amp; Tax Receipts:</b> Generation of downloadable PDF tax invoices sent directly to student email."),

        ("Phase 2: Self-Service Enterprise Tenant Onboarding &amp; White-Labeling",
         "Expanding the B2B SaaS model to support autonomous academy registration:<br/>"
         "• <b>Custom Domain Mapping:</b> Academies can connect their own domains (e.g. <code>lms.alazhar-academy.com</code>).<br/>"
         "• <b>White-Label Branding:</b> Institutions can customize their portal logo, brand colors, custom login screens, and digital certificate templates.<br/>"
         "• <b>Automated Subscription Tiers:</b> Self-service upgrade from Standard Tier to Enterprise Tier with automated per-seat billing."),

        ("Phase 3: Native WebRTC Smart Classroom &amp; Calligraphy Whiteboard",
         "Replacing external Zoom / Google Meet dependencies with a high-performance in-browser virtual classroom:<br/>"
         "• <b>Embedded Audio/Video:</b> Ultra-low-latency WebRTC group video conferencing powered by Daily.co / LiveKit.<br/>"
         "• <b>Collaborative Arabic Calligraphy Canvas:</b> Synchronized interactive whiteboard allowing instructors to draw Harakat and demonstrative letter connections in real-time.<br/>"
         "• <b>Automatic Attendance Logging:</b> The classroom logs student join/leave timestamps automatically, eliminating manual attendance sheets."),

        ("Phase 4: AI-Driven Arabic Pronunciation &amp; Phonetics Evaluation",
         "Leveraging cutting-edge Speech AI for self-paced student fluency training:<br/>"
         "• <b>Makharij &amp; Tajweed Assessment:</b> Speech-to-text acoustic models analyze audio recordings of student recitation, highlighting mispronounced letters (e.g. distinguishing between ح and ه, or ع and أ).<br/>"
         "• <b>AI Arabic Conversation Tutor:</b> An interactive voice chatbot where students can practice everyday spoken Arabic conversations with real-time grammatical corrections."),

        ("Phase 5: Native Mobile Applications (iOS &amp; Android)",
         "Releasing cross-platform native apps built on React Native / Flutter:<br/>"
         "• Push notifications for upcoming live lectures, homework deadlines, and instructor feedback.<br/>"
         "• Offline lecture notes syncing and interactive Arabic flashcards for on-the-go learning.")
    ]

    for rp_title, rp_desc in roadmap_phases:
        story.append(Paragraph(rp_title, h2_style))
        story.append(Paragraph(rp_desc, bullet_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 6))

    # Implementation Timeline Table
    story.append(Paragraph("Strategic Implementation Milestones", h2_style))
    timeline_data = [
        [Paragraph("Milestone", table_header_style), Paragraph("Target Window", table_header_style), Paragraph("Deliverables &amp; Business Impact", table_header_style)],
        [Paragraph("<b>Payment Gateway Integration</b>", table_cell_bold), Paragraph("Q1 2027", table_cell_style), Paragraph("Stripe, JazzCash, EasyPaisa, automated enrollment unlocking.", table_cell_style)],
        [Paragraph("<b>Enterprise White-Labeling</b>", table_cell_bold), Paragraph("Q2 2027", table_cell_style), Paragraph("Custom academy domains, custom logos, tenant self-service portal.", table_cell_style)],
        [Paragraph("<b>Embedded Smart Classroom</b>", table_cell_bold), Paragraph("Q3 2027", table_cell_style), Paragraph("In-browser WebRTC video, live interactive Arabic whiteboard.", table_cell_style)],
        [Paragraph("<b>AI Phonetics &amp; Mobile App</b>", table_cell_bold), Paragraph("Q4 2027", table_cell_style), Paragraph("Speech AI pronunciation scoring, iOS and Android native apps.", table_cell_style)]
    ]
    t_timeline = Table(timeline_data, colWidths=[140, 95, 245])
    t_timeline.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('BOX', (0, 0), (-1, -1), 1, c_border),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_soft_bg]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_timeline)

    story.append(Spacer(1, 10))

    # ========================================================
    # SECTION 6: CONCLUSION & STRATEGIC VALUE
    # ========================================================
    story.append(Paragraph("6. Conclusion &amp; Strategic Value Proposition", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_primary, spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Emam Arabic LMS is uniquely positioned at the convergence of specialized language pedagogy and modern enterprise SaaS. "
        "By addressing the acute challenges of Arabic typography, touch-typing literacy, and institutional multi-tenancy, "
        "the platform eliminates operational friction for academy administrators while elevating learning outcomes for students.",
        body_style
    ))
    story.append(Paragraph(
        "With a clear and actionable scaling roadmap encompassing global payment gateways, native WebRTC smart classrooms, "
        "and AI-assisted pronunciation grading, Emam represents a highly scalable, future-proof ecosystem ready for global adoption.",
        body_style
    ))

    # Sign-off box
    sign_off_data = [[
        Paragraph(
            "<b>Document Approved by:</b> Emam Technical Steering Committee &amp; Product Architecture Group<br/>"
            "<b>Repository Reference:</b> <code>https://github.com/HStahami/EMAM.git</code> | <b>Release:</b> v2.4",
            callout_style
        )
    ]]
    t_sign = Table(sign_off_data, colWidths=[490])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_soft_bg),
        ('BOX', (0, 0), (-1, -1), 1, c_primary),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 11),
        ('RIGHTPADDING', (0, 0), (-1, -1), 11),
    ]))
    story.append(t_sign)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Document successfully created: {filename}")

    # Copy to artifact directory for persistent UI reference
    artifact_dir = r"C:\Users\Dell\.gemini\antigravity\brain\fbfa3734-24e7-4532-8d79-64de519188df"
    if os.path.exists(artifact_dir):
        dest = os.path.join(artifact_dir, filename)
        shutil.copyfile(filename, dest)
        print(f"Copied to artifact directory: {dest}")

if __name__ == "__main__":
    build_pdf()
