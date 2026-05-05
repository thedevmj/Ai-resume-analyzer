const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");
const fs = require("fs");

const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // NAME
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(data.name, { align: "center" });

      // CONTACT
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

      // SKILLS
      doc.font("Helvetica-Bold").fontSize(14).text("SKILLS").moveDown(0.3);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(data.skills.join(", "))
        .moveDown();

      // EXPERIENCE
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

      // EDUCATION
      doc.font("Helvetica-Bold").fontSize(14).text("EDUCATION").moveDown(0.5);

      data.education.forEach((edu) => {
        doc
          .font("Helvetica")
          .fontSize(11)
          .text(`${edu.degree} - ${edu.college} (${edu.year})`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const generateDOCX = async (data) => {
  try {
    const doc = new Document({
      sections: [
        {
          children: [
            // NAME
            new Paragraph({
              text: data.name,
              heading: HeadingLevel.HEADING_1,
              bold: true,
              alignment: "center",
            }),

            // CONTACT
            new Paragraph({
              text: `${data.email} | ${data.phone}`,
              alignment: "center",
              spacing: { after: 200 },
            }),

            // SUMMARY
            new Paragraph({
              text: "SUMMARY",
              heading: HeadingLevel.HEADING_2,
              bold: true,
            }),

            new Paragraph({
              text: data.summary,
              spacing: { after: 200 },
            }),

            // SKILLS
            new Paragraph({
              text: "SKILLS",
              heading: HeadingLevel.HEADING_2,
              bold: true,
            }),

            new Paragraph({
              text: data.skills.join(", "),
              spacing: { after: 200 },
            }),

            // EXPERIENCE
            new Paragraph({
              text: "EXPERIENCE",
              heading: HeadingLevel.HEADING_2,
              bold: true,
            }),

            ...data.experience.flatMap((exp) => [
              new Paragraph({
                text: `${exp.role} - ${exp.company}`,
                bold: true,
              }),
              new Paragraph({
                text: exp.duration,
                italics: true,
              }),
              ...exp.points.map(
                (point) =>
                  new Paragraph({
                    text: `• ${point}`,
                    spacing: { before: 100 },
                  })
              ),
              new Paragraph({ text: "", spacing: { after: 200 } }),
            ]),

            // PROJECTS
            new Paragraph({
              text: "PROJECTS",
              heading: HeadingLevel.HEADING_2,
              bold: true,
            }),

            ...data.projects.flatMap((proj) => [
              new Paragraph({
                text: proj.name,
                bold: true,
              }),
              new Paragraph({
                text: proj.description,
                spacing: { after: 200 },
              }),
            ]),

            // EDUCATION
            new Paragraph({
              text: "EDUCATION",
              heading: HeadingLevel.HEADING_2,
              bold: true,
            }),

            ...data.education.map(
              (edu) =>
                new Paragraph({
                  text: `${edu.degree} - ${edu.college} (${edu.year})`,
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (err) {
    throw err;
  }
};

const generateTXT = (data) => {
  let content = "";

  content += `${data.name}\n`;
  content += `${"=".repeat(data.name.length)}\n`;
  content += `Email: ${data.email} | Phone: ${data.phone}\n\n`;

  content += "SUMMARY\n";
  content += "-".repeat(50) + "\n";
  content += `${data.summary}\n\n`;

  content += "SKILLS\n";
  content += "-".repeat(50) + "\n";
  content += `${data.skills.join(", ")}\n\n`;

  content += "EXPERIENCE\n";
  content += "-".repeat(50) + "\n";
  data.experience.forEach((exp) => {
    content += `${exp.role} - ${exp.company}\n`;
    content += `Duration: ${exp.duration}\n`;
    exp.points.forEach((point) => {
      content += `• ${point}\n`;
    });
    content += "\n";
  });

  content += "PROJECTS\n";
  content += "-".repeat(50) + "\n";
  data.projects.forEach((proj) => {
    content += `${proj.name}\n`;
    content += `${proj.description}\n\n`;
  });

  content += "EDUCATION\n";
  content += "-".repeat(50) + "\n";
  data.education.forEach((edu) => {
    content += `${edu.degree} - ${edu.college} (${edu.year})\n`;
  });

  return Buffer.from(content, "utf-8");
};

const download = async (req, res) => {
  try {
    const { format = "pdf" } = req.body;
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ error: "Invalid resume data" });
    }

    let buffer, contentType, filename, disposition;

    switch (format.toLowerCase()) {
      case "pdf":
        buffer = await generatePDF(data);
        contentType = "application/pdf";
        filename = "ATS_Resume.pdf";
        break;

      case "docx":
        buffer = await generateDOCX(data);
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = "ATS_Resume.docx";
        break;

      case "txt":
        buffer = generateTXT(data);
        contentType = "text/plain";
        filename = "ATS_Resume.txt";
        break;

      default:
        return res
          .status(400)
          .json({ error: "Unsupported format. Use: pdf, docx, or txt" });
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (err) {
    console.error("Download error:", err);
    res
      .status(500)
      .json({ error: "Resume generation failed", details: err.message });
  }
};

module.exports = { download };
