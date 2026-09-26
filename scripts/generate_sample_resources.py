from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "public" / "resources"
OUTPUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#1b2a4a")
GOLD = colors.HexColor("#e8a33d")
CREAM = colors.HexColor("#faf8f4")
TEXT = colors.HexColor("#3d4a5f")

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="TS_Title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=23, leading=28, textColor=NAVY, spaceAfter=7 * mm))
styles.add(ParagraphStyle(name="TS_Subtitle", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=GOLD, spaceBefore=3 * mm, spaceAfter=2 * mm))
styles.add(ParagraphStyle(name="TS_Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=15, textColor=TEXT))
styles.add(ParagraphStyle(name="TS_Footer", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=10, textColor=colors.HexColor("#6b7280")))


def build_pdf(filename, eyebrow, title, intro, sections=None, table=None):
    output_path = OUTPUT / filename
    doc = SimpleDocTemplate(str(output_path), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm, topMargin=17 * mm, bottomMargin=16 * mm)
    story = [
        Paragraph("TUITIONSPHERE - SAMPLE RESOURCE", styles["TS_Subtitle"]),
        Paragraph(title, styles["TS_Title"]),
        Paragraph(intro, styles["TS_Body"]),
        Spacer(1, 5 * mm),
    ]
    if sections:
        for heading, body in sections:
            story.extend([Paragraph(heading, styles["TS_Subtitle"]), Paragraph(body, styles["TS_Body"]), Spacer(1, 2.5 * mm)])
    if table:
        grid = Table(table, colWidths=[42 * mm, 105 * mm], repeatRows=1)
        grid.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("LEADING", (0, 0), (-1, -1), 12),
            ("BACKGROUND", (0, 1), (-1, -1), CREAM),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d7dce5")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.append(grid)
        story.append(Spacer(1, 7 * mm))
    story.extend([
        Paragraph(eyebrow, styles["TS_Subtitle"]),
        Paragraph("TuitionSphere academic resource - designed for structured practice, revision and progress support.", styles["TS_Footer"]),
    ])
    doc.build(story)
    (PUBLIC / filename).write_bytes(output_path.read_bytes())


build_pdf(
    "sample-syllabus.pdf",
    "ACADEMIC ROADMAP",
    "Sample Course Syllabus",
    "A concise example of how TuitionSphere can organize a class-wise learning plan for students and parents.",
    sections=[
        ("Mathematics", "Number systems, algebraic foundations, geometry, mensuration, data handling and chapter-wise problem practice."),
        ("Science", "Core concepts from physics, chemistry and biology supported by diagrams, applications and revision questions."),
        ("English", "Reading comprehension, grammar, writing practice and vocabulary development through guided exercises."),
        ("Assessment Plan", "Weekly practice, chapter tests, monthly revision and targeted doubt-clearing based on performance."),
    ],
)

build_pdf(
    "sample-test-paper.pdf",
    "PRACTICE WITH PURPOSE",
    "Sample Test Paper",
    "A short demonstration paper showing the planned structure for topic practice and progress review.",
    sections=[
        ("Section A - Concepts", "1. Explain the difference between speed and velocity.  2. Simplify: 3x + 5x - 4.  3. Define photosynthesis."),
        ("Section B - Application", "4. A car covers 120 km in 3 hours. Calculate average speed.  5. Write a short paragraph explaining why regular revision matters."),
        ("Section C - Reflection", "6. Identify one topic that needs more practice and write the next step you will take."),
        ("Mentor Note", "Answers are reviewed for concept clarity, method, presentation and improvement areas."),
    ],
)

build_pdf(
    "sample-timetable.pdf",
    "WEEKLY LEARNING PLAN",
    "Sample Batch Timetable",
    "An example schedule showing how classes, revision, assessment and doubt support can be organized.",
    table=[
        ["Day / Time", "Session"],
        ["Monday - 5:00 PM", "Mathematics - Concept lesson and guided practice"],
        ["Tuesday - 5:00 PM", "Science - Explanation, diagrams and application"],
        ["Wednesday - 5:00 PM", "English - Reading, grammar and writing"],
        ["Thursday - 5:00 PM", "Mathematics - Problem-solving workshop"],
        ["Friday - 5:00 PM", "Science - Revision and doubt clearing"],
        ["Saturday - 10:00 AM", "Weekly test and mentor feedback"],
    ],
)
