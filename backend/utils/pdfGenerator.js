/**
 * PDF Generator Utility
 * Generates health reports as PDF using PDFKit
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a health report PDF
 * @param {Object} reportData - Report data
 * @param {string} reportData.userName - Patient name
 * @param {string} reportData.symptoms - Symptom description
 * @param {string} reportData.diagnosis - Diagnosis result
 * @param {string} reportData.conditionLevel - Condition level (GREEN, YELLOW, RED)
 * @param {string} reportData.advice - Medical advice
 * @param {Array} reportData.recommendations - List of recommendations
 * @param {string} reportData.timestamp - Report timestamp
 * @param {string} reportData.reportId - Unique report ID
 * @returns {Promise<Buffer>} PDF file buffer
 */
async function generateHealthReportPDF(reportData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // Header
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#0A7FD5')
               .text('Sehat Sathi', { align: 'center' });

            doc.moveDown(0.5);

            doc.fontSize(18)
               .fillColor('#000000')
               .text('Health Assessment Report', { align: 'center' });

            doc.moveDown();

            // Report ID and Date
            doc.fontSize(10)
               .fillColor('#666666')
               .text(`Report ID: ${reportData.reportId || 'N/A'}`, { align: 'left' })
               .text(`Generated: ${new Date(reportData.timestamp || Date.now()).toLocaleString()}`, { align: 'left' });

            doc.moveDown(1);

            // Patient Information
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#1a3b5d')
               .text('Patient Information', { underline: true });

            doc.moveDown(0.3);
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#000000')
               .text(`Name: ${reportData.userName || 'Not provided'}`)
               .text(`Report Date: ${new Date(reportData.timestamp || Date.now()).toLocaleDateString()}`);

            doc.moveDown(1);

            // Symptoms
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#1a3b5d')
               .text('Symptoms Description', { underline: true });

            doc.moveDown(0.3);
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#000000')
               .text(reportData.symptoms || 'Not provided', {
                   width: 500,
                   align: 'justify'
               });

            doc.moveDown(1);

            // Diagnosis
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#1a3b5d')
               .text('Diagnosis Result', { underline: true });

            doc.moveDown(0.3);

            // Condition Level with color coding
            const conditionLevel = reportData.conditionLevel || 'UNKNOWN';
            let conditionColor = '#666666';
            let conditionText = 'Unknown';

            switch (conditionLevel) {
                case 'RED':
                    conditionColor = '#e74c3c';
                    conditionText = 'Critical - Immediate Medical Attention Required';
                    break;
                case 'YELLOW':
                    conditionColor = '#f39c12';
                    conditionText = 'Moderate - Doctor Visit Recommended';
                    break;
                case 'GREEN':
                    conditionColor = '#2ecc71';
                    conditionText = 'Normal - Self Care Recommended';
                    break;
            }

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .fillColor(conditionColor)
               .text(`Condition Level: ${conditionLevel} - ${conditionText}`);

            doc.moveDown(0.5);

            if (reportData.diagnosis || reportData.explanation) {
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#000000')
                   .text(reportData.diagnosis || reportData.explanation || '', {
                       width: 500,
                       align: 'justify'
                   });
            }

            doc.moveDown(1);

            // Medical Advice
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#1a3b5d')
               .text('Medical Advice', { underline: true });

            doc.moveDown(0.3);
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#000000')
               .text(reportData.advice || 'Consult with a healthcare professional', {
                   width: 500
               });

            doc.moveDown(1);

            // Recommendations
            if (reportData.recommendations && reportData.recommendations.length > 0) {
                doc.fontSize(14)
                   .font('Helvetica-Bold')
                   .fillColor('#1a3b5d')
                   .text('Recommendations', { underline: true });

                doc.moveDown(0.3);
                doc.fontSize(11)
                   .font('Helvetica')
                   .fillColor('#000000');

                reportData.recommendations.forEach((rec, index) => {
                    doc.text(`${index + 1}. ${rec}`, {
                        width: 500,
                        indent: 20
                    });
                    doc.moveDown(0.2);
                });
            }

            doc.moveDown(2);

            // Disclaimer
            doc.fontSize(9)
               .font('Helvetica-Oblique')
               .fillColor('#666666')
               .text('DISCLAIMER:', {
                   width: 500,
                   continued: false
               })
               .text('This assessment is generated by an AI health assistant and is for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for proper medical care. In case of emergencies, contact emergency services immediately.', {
                   width: 500,
                   align: 'justify'
               });

            doc.moveDown(1);

            // Footer
            doc.fontSize(8)
               .fillColor('#999999')
               .text('Generated by Sehat Sathi - AI Health Assistant for Rural India', {
                   align: 'center'
               });

            // Finalize PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Saves PDF to file system (optional utility)
 */
async function savePDFToFile(reportData, filePath) {
    try {
        const pdfBuffer = await generateHealthReportPDF(reportData);
        fs.writeFileSync(filePath, pdfBuffer);
        return filePath;
    } catch (error) {
        throw new Error(`Failed to save PDF: ${error.message}`);
    }
}

module.exports = {
    generateHealthReportPDF,
    savePDFToFile
};

