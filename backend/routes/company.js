import express from 'express';
import analysisService from '../services/analysisService.js';
import Company from '../models/Company.js';
import { validateCompanyQuery } from '../middleware/validation.js';

const router = express.Router();

router.get('/:name', validateCompanyQuery, async (req, res) => {
  try {
    const { name } = req.params;
    
    const result = await analysisService.getCompanyAnalysis(name);
    
    if (!result.company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const response = {
      companyName: result.company.companyName,
      website: result.company.website,
      trustScore: result.company.trustScore,
      scamReportsCount: result.company.scamReportsCount,
      verifiedRecruiters: result.company.verifiedRecruiters,
      domainAge: result.company.domainAge,
      industry: result.company.industry,
      description: result.company.description,
      headquarters: result.company.headquarters,
      employeeCount: result.company.employeeCount,
      createdAt: result.company.createdAt
    };

    if (result.analysis) {
      response.latestAnalysis = {
        trustScore: result.analysis.trustScore,
        googleReviews: result.analysis.googleReviews,
        facebookReviews: result.analysis.facebookReviews,
        redditReviews: result.analysis.redditReviews,
        youtubeMentions: result.analysis.youtubeMentions,
        externalLinks: result.analysis.externalLinks,
        analysisDate: result.analysis.createdAt
      };
    }

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Company route error:', error);
    if (error.message.includes('Company not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      minTrustScore, 
      maxTrustScore,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    if (minTrustScore || maxTrustScore) {
      query.trustScore = {};
      if (minTrustScore) query.trustScore.$gte = parseInt(minTrustScore);
      if (maxTrustScore) query.trustScore.$lte = parseInt(maxTrustScore);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const companies = await Company.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('companyName website trustScore scamReportsCount verifiedRecruiters domainAge industry createdAt');

    const total = await Company.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        companies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Company list route error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
