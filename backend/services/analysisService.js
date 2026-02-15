import Company from '../models/Company.js';
import AnalysisResult from '../models/AnalysisResult.js';
import Report from '../models/Report.js';
import externalApiService from './externalApiService.js';

class AnalysisService {
  
  async analyzeCompany(data) {
    try {
      const {
        companyName,
        website,
        details,
        extractedText,
        uploadedFiles,
        analysisSource = 'manual'
      } = data;

      if (!companyName) {
        throw new Error('Company name is required');
      }

      let company = await Company.findOne({ 
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
      });

      if (!company) {
        company = await this.createNewCompany(companyName, website, details);
      }

      const [
        googleReviews,
        facebookReviews,
        redditReviews,
        youtubeMentions,
        scamReports,
        verifiedRecruiters,
        domainAge
      ] = await Promise.all([
        externalApiService.fetchGoogleReviews(companyName),
        externalApiService.fetchFacebookReviews(companyName),
        externalApiService.fetchRedditMentions(companyName),
        externalApiService.fetchYoutubeMentions(companyName),
        externalApiService.checkScamReports(companyName),
        externalApiService.verifyRecruiters(companyName),
        website ? externalApiService.fetchDomainAge(website) : 0
      ]);

      company.scamReportsCount = scamReports.totalReports;
      company.verifiedRecruiters = verifiedRecruiters;
      company.domainAge = domainAge;
      
      if (website && !company.website) {
        company.website = website;
      }
      
      await company.save();

      const trustScore = this.calculateTrustScore(company, {
        googleReviews,
        facebookReviews,
        redditReviews,
        youtubeMentions
      });

      const analysisResult = await AnalysisResult.create({
        companyId: company._id,
        companyName: company.companyName,
        googleReviews,
        facebookReviews,
        redditReviews,
        youtubeMentions,
        trustScore,
        analysisSource,
        extractedText,
        uploadedFiles: uploadedFiles || []
      });

      const populatedResult = await AnalysisResult.findById(analysisResult._id)
        .populate('companyId', 'companyName website trustScore scamReportsCount verifiedRecruiters domainAge');

      return {
        success: true,
        analysis: populatedResult,
        company: populatedResult.companyId
      };

    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async createNewCompany(companyName, website, details) {
    const companyData = {
      companyName: companyName.trim(),
      trustScore: 50
    };

    if (website) {
      companyData.website = website.trim();
    }

    if (details) {
      try {
        const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
        if (parsedDetails.industry) companyData.industry = parsedDetails.industry;
        if (parsedDetails.description) companyData.description = parsedDetails.description;
        if (parsedDetails.headquarters) companyData.headquarters = parsedDetails.headquarters;
        if (parsedDetails.employeeCount) companyData.employeeCount = parsedDetails.employeeCount;
      } catch (e) {
        console.warn('Failed to parse details:', e);
      }
    }

    return await Company.create(companyData);
  }

  calculateTrustScore(company, reviews) {
    let score = 50;

    score -= company.scamReportsCount * 5;
    score += company.verifiedRecruiters * 2;
    
    if (company.domainAge > 10) score += 15;
    else if (company.domainAge > 5) score += 10;
    else if (company.domainAge > 2) score += 5;
    else if (company.domainAge > 1) score += 2;

    if (company.website) {
      if (company.website.includes('https')) score += 5;
      if (company.website.match(/\.(com|org|net|io|ai|tech)$/)) score += 3;
    }

    const googleWeight = 0.3;
    const facebookWeight = 0.2;
    const redditWeight = 0.25;
    const youtubeWeight = 0.25;

    let reviewScore = 0;
    let totalWeight = 0;

    if (reviews.googleReviews.totalReviews > 0) {
      const googleScore = (reviews.googleReviews.averageRating / 5) * 100;
      reviewScore += googleScore * googleWeight;
      totalWeight += googleWeight;
    }

    if (reviews.facebookReviews.totalReviews > 0) {
      const facebookScore = (reviews.facebookReviews.averageRating / 5) * 100;
      reviewScore += facebookScore * facebookWeight;
      totalWeight += facebookWeight;
    }

    if (reviews.redditReviews.totalMentions > 0) {
      const redditScore = reviews.redditReviews.sentiment === 'positive' ? 75 : 
                         reviews.redditReviews.sentiment === 'negative' ? 25 : 50;
      reviewScore += redditScore * redditWeight;
      totalWeight += redditWeight;
    }

    if (reviews.youtubeMentions.totalMentions > 0) {
      const youtubeScore = reviews.youtubeMentions.sentiment === 'positive' ? 75 : 
                          reviews.youtubeMentions.sentiment === 'negative' ? 25 : 50;
      reviewScore += youtubeScore * youtubeWeight;
      totalWeight += youtubeWeight;
    }

    if (totalWeight > 0) {
      score = (score * 0.6) + ((reviewScore / totalWeight) * 0.4);
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async getCompanyAnalysis(companyName) {
    try {
      const company = await Company.findOne({ 
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      const latestAnalysis = await AnalysisResult.findOne({ companyId: company._id })
        .sort({ createdAt: -1 })
        .populate('companyId', 'companyName website trustScore scamReportsCount verifiedRecruiters domainAge');

      if (!latestAnalysis) {
        return {
          success: true,
          company,
          analysis: null,
          message: 'Company found but no analysis available'
        };
      }

      return {
        success: true,
        company,
        analysis: latestAnalysis
      };

    } catch (error) {
      console.error('Get company analysis error:', error);
      throw new Error(`Failed to get company analysis: ${error.message}`);
    }
  }

  async getAnalysisHistory(companyName, limit = 10) {
    try {
      const company = await Company.findOne({ 
        companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
      });

      if (!company) {
        throw new Error('Company not found');
      }

      const history = await AnalysisResult.find({ companyId: company._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-extractedText -uploadedFiles');

      return {
        success: true,
        company,
        history
      };

    } catch (error) {
      console.error('Get analysis history error:', error);
      throw new Error(`Failed to get analysis history: ${error.message}`);
    }
  }
}

export default new AnalysisService();
