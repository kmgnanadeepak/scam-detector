import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

// Safe CommonJS loader for ES Module compatibility
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log(m)
      });
    }
    return this.worker;
  }

  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        success: true,
        text: data.text.trim(),
        confidence: 0.9, // PDF text parsing has high confidence
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      return {
        success: false,
        error: error.message,
        text: ''
      };
    }
  }

  async extractTextFromImage(filePath) {
    try {
      const worker = await this.initializeWorker();
      
      const { data: { text } } = await worker.recognize(filePath);
      
      return {
        success: true,
        text: text.trim(),
        confidence: 0
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return {
        success: false,
        error: error.message,
        text: ''
      };
    }
  }

  extractCompanyName(text) {
    const companyPatterns = [
      /(?:company|organization|corporation|inc|llc|ltd|pvt|private)\s+[:\-]?\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|$|\.|,)/gi,
      /(?:powered by|developed by|created by)\s+([A-Za-z0-9\s&.,'-]+?)(?:\n|$|\.|,)/gi,
      /(?:©|copyright|@)\s*(?:\d{4}\s*)?([A-Za-z0-9\s&.,'-]+?)(?:\n|$|\.|,)/gi,
      /(?:we are|we're)\s+([A-Za-z0-9\s&.,'-]+?)(?:\n|$|\.|,)/gi,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s+inc|llc|ltd|corp|corporation)?/m,
      /(?:www\.|https?:\/\/)?([a-zA-Z0-9-]+\.(?:com|org|net|io|co|ai|tech))/gi
    ];

    const cleanedText = text.replace(/\s+/g, ' ').trim();
    let potentialCompanies = new Set();

    for (const pattern of companyPatterns) {
      const matches = cleanedText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const company = match.replace(/^(?:company|organization|corporation|inc|llc|ltd|pvt|private|powered by|developed by|created by|©|copyright|@|we are|we're|www\.|https?:\/\/)\s*[:\-]?\s*/i, '')
            .replace(/\d{4}/g, '')
            .replace(/[.,;:!?(){}\[\]"']/g, '')
            .replace(/\s+(?:inc|llc|ltd|corp|corporation|pvt|private)$/i, '')
            .trim();
          
          if (company.length >= 3 && company.length <= 50 && /^[A-Za-z0-9\s&.'-]+$/.test(company)) {
            potentialCompanies.add(company);
          }
        });
      }
    }

    const lines = cleanedText.split(/[.!?]/);
    lines.forEach(line => {
      const words = line.trim().split(/\s+/);
      if (words.length >= 2 && words.length <= 5) {
        const candidate = words.join(' ');
        if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(candidate) && candidate.length <= 50) {
          potentialCompanies.add(candidate);
        }
      }
    });

    const companies = Array.from(potentialCompanies)
      .filter(company => company.length >= 3)
      .sort((a, b) => b.length - a.length)
      .slice(0, 5);

    return {
      companies,
      primaryCompany: companies[0] || null,
      confidence: companies.length > 0 ? 0.7 : 0
    };
  }

  async processFile(filePath) {
    try {
      const fileExists = fs.existsSync(filePath);
      if (!fileExists) {
        throw new Error('File does not exist');
      }

      const fileStats = fs.statSync(filePath);
      const fileSizeMB = fileStats.size / (1024 * 1024);
      
      if (fileSizeMB > 10) {
        throw new Error('File too large for processing (max 10MB)');
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      let textResult;
      let processingMethod = 'unknown';

      // Process PDF files with PDF parser
      if (fileExtension === '.pdf') {
        console.log('Processing PDF with text parser...');
        textResult = await this.extractTextFromPDF(filePath);
        processingMethod = 'pdf-parse';
      } 
      // Process image files with OCR
      else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
        console.log('Processing image with OCR...');
        textResult = await this.extractTextFromImage(filePath);
        processingMethod = 'ocr';
      } else {
        throw new Error('Unsupported file type. Please upload PDF or image files.');
      }
      
      if (!textResult.success) {
        throw new Error(textResult.error);
      }

      const companyExtraction = this.extractCompanyName(textResult.text);

      return {
        success: true,
        text: textResult.text,
        extractedCompanies: companyExtraction.companies,
        primaryCompany: companyExtraction.primaryCompany,
        confidence: companyExtraction.confidence,
        fileSize: fileStats.size,
        processingMethod: processingMethod,
        pages: textResult.pages || 1
      };

    } catch (error) {
      console.error('File processing error:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        extractedCompanies: [],
        primaryCompany: null
      };
    }
  }

  async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default new OCRService();
