const PDFDocument = require("pdfkit");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} = require("docx");

const toArray = (value) => (Array.isArray(value) ? value : []);
const str = (value, fallback = "") =>
  value === undefined || value === null || value === "Not Found"
    ? fallback
    : String(value);

const INK = "#18181b"; // body text
const GRAY = "#6b7280"; // secondary text
const LINE = "#d4d4d8"; // section rules

// ---------------------------------------------------------------- helpers

const drawRule = (doc) => {
  const y = doc.y + 2;
  doc
    .strokeColor(LINE)
    .lineWidth(0.8)
    .moveTo(60, y)
    .lineTo(doc.page.width - 60, y)
    .stroke();
  doc.moveDown(0.5);
};

const drawSection = (doc, title) => {
  doc.moveDown(0.5);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(INK)
    .text(title.toUpperCase(), { characterSpacing: 0.8 });
  drawRule(doc);
};

const drawBullets = (doc, points) => {
  toArray(points).forEach((point) => {
    const text = str(point).replace(/^[-*\u2022\u25CF]\s*/, "");
    if (!text) return;
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor(INK)
      .text(`\u2022 ${text}`, { indent: 14, x: 72, lineGap: 2 });
  });
};

// ---------------------------------------------------------------- PDF

const generatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 60, size: "LETTER" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ------- HEADER
      doc
        .font("Helvetica-Bold")
        .fontSize(24)
        .fillColor(INK)
        .text(str(data.name, "Your Name"), { align: "center" });

      const contactParts = [];
      if (str(data.email)) contactParts.push(str(data.email));
      if (str(data.phone)) contactParts.push(str(data.phone));
      const location = [str(data.city), str(data.state), str(data.country)]
        .filter(Boolean)
        .join(", ");
      if (location) contactParts.push(location);

      if (contactParts.length) {
        doc
          .moveDown(0.25)
          .font("Helvetica")
          .fontSize(10)
          .fillColor(GRAY)
          .text(contactParts.join("  |  "), {
            align: "center",
            characterSpacing: 0.3,
          });
      }
      doc.moveDown(0.4);
      drawRule(doc);

      // ------- SUMMARY
      if (str(data.summary)) {
        drawSection(doc, "Professional Summary");
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(INK)
          .text(str(data.summary), { align: "left", lineGap: 2 });
      }

      // ------- SKILLS
      const skills = toArray(data.skills);
      if (skills.length) {
        drawSection(doc, "Skills");
        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(INK)
          .text(skills.join(", "), { lineGap: 2 });
      }

      // ------- EXPERIENCE
      const experience = toArray(data.experience);
      if (experience.length) {
        drawSection(doc, "Experience");
        experience.forEach((exp, index) => {
          if (index > 0) doc.moveDown(0.6);

          doc
            .font("Helvetica-Bold")
            .fontSize(11.5)
            .fillColor(INK)
            .text(str(exp.role));

          const subline = [str(exp.company), str(exp.duration)]
            .filter(Boolean)
            .join("  \u2022  ");
          if (subline) {
            doc
              .moveDown(0.15)
              .font("Helvetica")
              .fontSize(10)
              .fillColor(GRAY)
              .text(subline);
          }

          doc.moveDown(0.2);
          drawBullets(doc, exp.points);
        });
      }

      // ------- PROJECTS
      const projects = toArray(data.projects);
      if (projects.length) {
        drawSection(doc, "Projects");
        projects.forEach((proj, index) => {
          if (index > 0) doc.moveDown(0.5);
          doc
            .font("Helvetica-Bold")
            .fontSize(11.5)
            .fillColor(INK)
            .text(str(proj.name));
          if (str(proj.link)) {
            doc
              .moveDown(0.1)
              .font("Helvetica")
              .fontSize(10)
              .fillColor(GRAY)
              .text(str(proj.link));
          }
          doc.moveDown(0.15);
          drawBullets(doc, toArray(proj.description).flatMap((d) =>
            typeof d === "object" && d.points ? d.points : d
          ));
        });
      }

      // ------- EDUCATION
      const education = toArray(data.education);
      if (education.length) {
        drawSection(doc, "Education");
        education.forEach((edu, index) => {
          if (index > 0) doc.moveDown(0.4);
          doc
            .font("Helvetica-Bold")
            .fontSize(11)
            .fillColor(INK)
            .text(str(edu.degree));
          const subline = [str(edu.college), str(edu.year)]
            .filter(Boolean)
            .join("  \u2022  ");
          if (subline) {
            doc
              .moveDown(0.1)
              .font("Helvetica")
              .fontSize(10)
              .fillColor(GRAY)
              .text(subline);
          }
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ---------------------------------------------------------------- DOCX

const note = (text, options = {}) =>
  new Paragraph({
    children: [new TextRun({ text, size: 21, color: INK, font: "Calibri", ...options })],
  });

const subnote = (text) =>
  new Paragraph({
    children: [new TextRun({ text, size: 19, color: GRAY, font: "Calibri", italics: true })],
  });

const heading = (title) =>
  new Paragraph({
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, color: INK, font: "Calibri" })],
    spacing: { before: 260, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "9CA3AF", space: 4 },
    },
  });

const bullet = (text) =>
  new Paragraph({
    children: [
      new TextRun({ text: "\u2022 ", size: 21, color: INK, font: "Calibri" }),
      new TextRun({ text, size: 21, color: INK, font: "Calibri" }),
    ],
    spacing: { after: 60 },
    indent: { left: 260 },
  });

const generateDOCX = async (data) => {
  try {
    const children = [];

    // ------- HEADER
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: str(data.name, "Your Name"), bold: true, size: 44, color: INK, font: "Calibri" }),
        ],
      })
    );

    const contactParts = [];
    if (str(data.email)) contactParts.push(str(data.email));
    if (str(data.phone)) contactParts.push(str(data.phone));
    const location = [str(data.city), str(data.state), str(data.country)]
      .filter(Boolean)
      .join(", ");
    if (location) contactParts.push(location);

    if (contactParts.length) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 220 },
          children: [
            new TextRun({ text: contactParts.join("  |  "), size: 20, color: GRAY, font: "Calibri" }),
          ],
        })
      );
    }

    // ------- SUMMARY
    if (str(data.summary)) {
      children.push(heading("Professional Summary"));
      children.push(note(str(data.summary), { size: 21 }));
    }

    // ------- SKILLS
    const skills = toArray(data.skills);
    if (skills.length) {
      children.push(heading("Skills"));
      children.push(note(skills.join(", ")));
    }

    // ------- EXPERIENCE
    const experience = toArray(data.experience);
    if (experience.length) {
      children.push(heading("Experience"));
      experience.forEach((exp) => {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 20 },
            children: [
              new TextRun({ text: str(exp.role), bold: true, size: 23, color: INK, font: "Calibri" }),
            ],
          })
        );
        const subline = [str(exp.company), str(exp.duration)]
          .filter(Boolean)
          .join("  \u2022  ");
        if (subline) children.push(subnote(subline));
        toArray(exp.points).forEach((point) => {
          const text = str(point).replace(/^[-*\u2022\u25CF]\s*/, "");
          if (text) children.push(bullet(text));
        });
      });
    }

    // ------- PROJECTS
    const projects = toArray(data.projects);
    if (projects.length) {
      children.push(heading("Projects"));
      projects.forEach((proj) => {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 20 },
            children: [
              new TextRun({ text: str(proj.name), bold: true, size: 22, color: INK, font: "Calibri" }),
            ],
          })
        );
        if (str(proj.link)) children.push(subnote(str(proj.link)));
        const descriptions = toArray(proj.description).flatMap((d) =>
          typeof d === "object" && d.points ? d.points : d
        );
        descriptions.forEach((desc) => {
          const text = str(desc).replace(/^[-*\u2022\u25CF]\s*/, "");
          if (text) children.push(bullet(text));
        });
      });
    }

    // ------- EDUCATION
    const education = toArray(data.education);
    if (education.length) {
      children.push(heading("Education"));
      education.forEach((edu) => {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 20 },
            children: [
              new TextRun({ text: str(edu.degree), bold: true, size: 21, color: INK, font: "Calibri" }),
            ],
          })
        );
        const subline = [str(edu.college), str(edu.year)]
          .filter(Boolean)
          .join("  \u2022  ");
        if (subline) children.push(subnote(subline));
      });
    }

    const doc = new Document({
      sections: [{ children }],
      styles: {
        default: {
          document: {
            run: { font: "Calibri", size: 21, color: INK },
          },
        },
      },
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (err) {
    throw err;
  }
};

// ---------------------------------------------------------------- TXT

const generateTXT = (data) => {
  let content = "";

  content += `${str(data.name, "Your Name")}\n`;
  content += `${"=".repeat(Math.max(str(data.name, "Your Name").length, 10))}\n`;
  const contactParts = [];
  if (str(data.email)) contactParts.push(`Email: ${str(data.email)}`);
  if (str(data.phone)) contactParts.push(`Phone: ${str(data.phone)}`);
  if (contactParts.length) content += `${contactParts.join(" | ")}\n`;
  content += "\n";

  const section = (title) => {
    content += `${title.toUpperCase()}\n`;
    content += "-".repeat(50) + "\n";
  };

  if (str(data.summary)) {
    section("Professional Summary");
    content += `${str(data.summary)}\n\n`;
  }

  const skills = toArray(data.skills);
  if (skills.length) {
    section("Skills");
    content += `${skills.join(", ")}\n\n`;
  }

  const experience = toArray(data.experience);
  if (experience.length) {
    section("Experience");
    experience.forEach((exp) => {
      content += `${str(exp.role)} - ${str(exp.company)}\n`;
      if (str(exp.duration)) content += `Duration: ${str(exp.duration)}\n`;
      toArray(exp.points).forEach((point) => {
        const text = str(point).replace(/^[-*\u2022\u25CF]\s*/, "");
        if (text) content += `  - ${text}\n`;
      });
      content += "\n";
    });
  }

  const projects = toArray(data.projects);
  if (projects.length) {
    section("Projects");
    projects.forEach((proj) => {
      content += `${str(proj.name)}\n`;
      if (str(proj.link)) content += `Link: ${str(proj.link)}\n`;
      toArray(proj.description).forEach((desc) => {
        content += `  - ${str(desc)}\n`;
      });
      content += "\n";
    });
  }

  const education = toArray(data.education);
  if (education.length) {
    section("Education");
    education.forEach((edu) => {
      content += `${str(edu.degree)} - ${str(edu.college)} (${str(edu.year)})\n`;
    });
  }

  return Buffer.from(content, "utf-8");
};

const download = async (req, res) => {
  try {
    const { format = "pdf" } = req.body;
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ error: "Invalid resume data" });
    }

    let buffer, contentType, filename;

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