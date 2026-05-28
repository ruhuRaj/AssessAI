"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PDFService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFService {
    generateQuestionPaperPDF(sections, metadata) {
        const doc = new pdfkit_1.default({
            bufferPages: true,
            margin: 50,
        });
        // Title
        doc
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(metadata.title, { align: 'center' });
        doc.moveDown(0.3);
        // Subject and Marks
        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Subject: ${metadata.subject}`, { align: 'center' })
            .text(`Total Marks: ${metadata.totalMarks}`, { align: 'center' });
        doc.moveDown(1);
        // Student Info Section
        doc
            .fontSize(11)
            .font('Helvetica-Bold')
            .text('Student Information:', { underline: true });
        doc.moveDown(0.5);
        const yStart = doc.y;
        doc
            .fontSize(10)
            .font('Helvetica')
            .text('Name: __________________________________', { width: 300 })
            .text('Roll Number: __________________________', { width: 300 })
            .text('Section: ______________________________', { width: 300 });
        doc.moveDown(1);
        // Sections and Questions
        sections.forEach((section, sectionIdx) => {
            // Check if we need a new page
            if (doc.y > 700) {
                doc.addPage();
            }
            doc
                .fontSize(13)
                .font('Helvetica-Bold')
                .text(`${section.title}`, { underline: true });
            doc.moveDown(0.3);
            if (section.instructions) {
                doc
                    .fontSize(9)
                    .font('Helvetica-Oblique')
                    .fillColor('#666666')
                    .text(section.instructions);
                doc.fillColor('#000000');
                doc.moveDown(0.5);
            }
            // Questions
            section.questions.forEach((question, qIdx) => {
                if (doc.y > 750) {
                    doc.addPage();
                }
                // Question number and text
                const questionNum = qIdx + 1;
                doc
                    .fontSize(10)
                    .font('Helvetica-Bold')
                    .text(`${questionNum}. ${question.text}`, {
                    width: 450,
                    align: 'left',
                });
                // Difficulty and Marks
                const difficulty = question.difficulty || 'Medium';
                const marks = question.marks || 1;
                const difficultyColor = difficulty === 'easy'
                    ? '#28a745'
                    : difficulty === 'medium'
                        ? '#ffc107'
                        : '#dc3545';
                doc
                    .fontSize(8)
                    .font('Helvetica')
                    .fillColor(difficultyColor)
                    .text(`[${difficulty}]`, { continued: true })
                    .fillColor('#000')
                    .text(` | Marks: ${marks}`, { continued: true });
                doc.moveDown(1);
            });
            doc.moveDown(0.5);
        });
        doc.end();
        return doc;
    }
}
exports.PDFService = PDFService;
exports.pdfService = new PDFService();
//# sourceMappingURL=PDFService.js.map