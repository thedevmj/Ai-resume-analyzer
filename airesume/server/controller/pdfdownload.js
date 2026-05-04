const PDFDocument = require("pdfkit");

const download = async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ error: "Invalid resume data" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ATS_Resume.pdf"
    );

    doc.pipe(res);

    //  NAME
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(data.name, { align: "center" });

    //  CONTACT
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`${data.email} | ${data.phone}`, { align: "center" })
      .moveDown();

    // SUMMARY
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("SUMMARY")
      .moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(data.summary)
      .moveDown();

    //  SKILLS
    doc.font("Helvetica-Bold").fontSize(14).text("SKILLS").moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(data.skills.join(", "))
      .moveDown();

    //  EXPERIENCE
    doc.font("Helvetica-Bold").fontSize(14).text("EXPERIENCE").moveDown(0.5);

    data.experience.forEach((exp) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${exp.role} - ${exp.company}`);

      doc
        .font("Helvetica-Oblique")
        .fontSize(10)
        .text(exp.duration);

      exp.points.forEach((point) => {
        doc
          .font("Helvetica")
          .fontSize(11)
          .text(`• ${point}`);
      });

      doc.moveDown();
    });

    // PROJECTS
    doc.font("Helvetica-Bold").fontSize(14).text("PROJECTS").moveDown(0.5);

    data.projects.forEach((proj) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(proj.name);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(proj.description)
        .moveDown();
    });

    //  EDUCATION
    doc.font("Helvetica-Bold").fontSize(14).text("EDUCATION").moveDown(0.5);

    data.education.forEach((edu) => {
      doc
        .font("Helvetica")
        .fontSize(11)
        .text(`${edu.degree} - ${edu.college} (${edu.year})`);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF generation failed", details: err.message });
  }
};

module.exports = { download };