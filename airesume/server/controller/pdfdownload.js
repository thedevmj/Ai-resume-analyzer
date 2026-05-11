const PDFDocument = require("pdfkit");

const download = async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({
        error: "Invalid resume data",
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ATS_Resume.pdf"
    );

    doc.pipe(res);

    // =========================
    // HELPERS
    // =========================

    const sectionTitle = (title) => {
      doc
        .moveDown(0.8)
        .font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#000")
        .text(title);

      doc
        .moveTo(40, doc.y + 2)
        .lineTo(555, doc.y + 2)
        .stroke();

      doc.moveDown(0.6);
    };

    const bulletPoint = (text) => {
      doc
        .font("Helvetica")
        .fontSize(10.5)
        .text(`• ${text}`, {
          indent: 10,
          lineGap: 2,
        });
    };

    // =========================
    // HEADER
    // =========================

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(data.name, {
        align: "center",
      });

    doc
      .moveDown(0.2)
      .font("Helvetica")
      .fontSize(10)
      .text(
        [
          data.email,
          data.phone,
          data.linkedin,
          data.portfolio,
        ]
          .filter(Boolean)
          .join(" | "),
        {
          align: "center",
        }
      );

    doc.moveDown(1);

    // =========================
    // SUMMARY
    // =========================

    if (data.summary) {
      sectionTitle("SUMMARY");

      doc
        .font("Helvetica")
        .fontSize(10.5)
        .text(data.summary, {
          align: "justify",
          lineGap: 3,
        });
    }

    // =========================
    // SKILLS
    // =========================

    if (data.skills?.length) {
      sectionTitle("SKILLS");

      doc
        .font("Helvetica")
        .fontSize(10.5)
        .text(data.skills.join(", "), {
          lineGap: 3,
        });
    }

    // =========================
    // EXPERIENCE
    // =========================

    if (data.experience?.length) {
      sectionTitle("EXPERIENCE");

      data.experience.forEach((exp) => {
        // Role + Company
        doc
          .font("Helvetica-Bold")
          .fontSize(11.5)
          .text(`${exp.role} | ${exp.company}`, {
            continued: true,
          });

        // Duration right aligned
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(exp.duration, {
            align: "right",
          });

        doc.moveDown(0.2);

        // Bullet points
        exp.points?.forEach((point) => {
          bulletPoint(point);
        });

        doc.moveDown(0.8);
      });
    }

    // =========================
    // PROJECTS
    // =========================

    if (data.projects?.length) {
      sectionTitle("PROJECTS");

      data.projects.forEach((proj) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(proj.name);

        doc
          .font("Helvetica")
          .fontSize(10.5)
          .text(proj.description, {
            lineGap: 3,
          });

        if (proj.techStack) {
          doc
            .moveDown(0.2)
            .font("Helvetica-Oblique")
            .fontSize(10)
            .text(`Tech: ${proj.techStack}`);
        }

        doc.moveDown(0.8);
      });
    }

    // =========================
    // EDUCATION
    // =========================

    if (data.education?.length) {
      sectionTitle("EDUCATION");

      data.education.forEach((edu) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(edu.degree, {
            continued: true,
          });

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(` (${edu.year})`, {
            align: "right",
          });

        doc
          .font("Helvetica")
          .fontSize(10.5)
          .text(edu.college);

        doc.moveDown(0.7);
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "PDF generation failed",
      details: err.message,
    });
  }
};

module.exports = { download };