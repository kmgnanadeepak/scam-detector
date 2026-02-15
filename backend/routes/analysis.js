import express from 'express';
import analysisService from '../services/analysisService.js';
import ocrService from '../services/ocrService.js';
import { validateAnalyzeRequest, validateOcrRequest } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateAnalyzeRequest, async (req, res) => {
  try {
    const analysisResult = await analysisService.analyzeCompany(req.body);
    
    res.status(200).json({
      success: true,
      data: {
        companyName: analysisResult.analysis.companyName,
        trustScore: analysisResult.analysis.trustScore,
        googleReviews: analysisResult.analysis.googleReviews,
        facebookReviews: analysisResult.analysis.facebookReviews,
        redditReviews: analysisResult.analysis.redditReviews,
        youtubeMentions: analysisResult.analysis.youtubeMentions,
        externalLinks: analysisResult.analysis.externalLinks,
        company: analysisResult.company,
        analysisId: analysisResult.analysis._id,
        createdAt: analysisResult.analysis.createdAt
      }
    });
  } catch (error) {
    console.error('Analysis route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/ocr', validateOcrRequest, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    const ocrResult = await ocrService.processFile(filePath);
    
    if (!ocrResult.success) {
      return res.status(400).json({
        success: false,
        error: ocrResult.error
      });
    }

    res.status(200).json({
      success: true,
      data: {
        text: ocrResult.text,
        extractedCompanies: ocrResult.extractedCompanies,
        primaryCompany: ocrResult.primaryCompany,
        confidence: ocrResult.confidence,
        fileSize: ocrResult.fileSize
      }
    });
  } catch (error) {
    console.error('OCR route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/history/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const { limit = 10 } = req.query;
    
    const history = await analysisService.getAnalysisHistory(companyName, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Analysis history route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
