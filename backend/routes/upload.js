import express from 'express';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/upload.js';
import ocrService from '../services/ocrService.js';
import path from 'path';

const router = express.Router();

router.post('/single', uploadSingle('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.status(200).json({
      success: true,
      data: {
        file: fileInfo,
        message: 'File uploaded successfully'
      }
    });
  } catch (error) {
    console.error('Single upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/multiple', uploadMultiple('files', 5), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      data: {
        files: filesInfo,
        count: filesInfo.length,
        message: `${filesInfo.length} files uploaded successfully`
      }
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/ocr', uploadSingle('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded for OCR'
      });
    }

    const ocrResult = await ocrService.processFile(req.file.path);

    if (!ocrResult.success) {
      return res.status(400).json({
        success: false,
        error: ocrResult.error
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    };

    res.status(200).json({
      success: true,
      data: {
        file: fileInfo,
        ocr: {
          text: ocrResult.text,
          extractedCompanies: ocrResult.extractedCompanies,
          primaryCompany: ocrResult.primaryCompany,
          confidence: ocrResult.confidence,
          processingMethod: ocrResult.processingMethod || 'unknown',
          pages: ocrResult.pages || 1
        }
      }
    });
  } catch (error) {
    console.error('OCR upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    const fs = await import('fs');
    const filePath = path.join('./uploads', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
