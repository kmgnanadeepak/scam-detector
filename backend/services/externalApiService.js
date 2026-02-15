class ExternalApiService {
  
  async fetchGoogleReviews(companyName) {
    await this.delay(1000);
    
    const mockData = {
      averageRating: Math.random() * 2 + 3,
      totalReviews: Math.floor(Math.random() * 500) + 10,
      sentiment: this.getRandomSentiment(),
      summary: this.generateReviewSummary('Google', companyName)
    };

    console.log(`Fetched Google reviews for ${companyName}:`, mockData);
    return mockData;
  }

  async fetchFacebookReviews(companyName) {
    await this.delay(800);
    
    const mockData = {
      averageRating: Math.random() * 2 + 3,
      totalReviews: Math.floor(Math.random() * 300) + 5,
      sentiment: this.getRandomSentiment(),
      summary: this.generateReviewSummary('Facebook', companyName)
    };

    console.log(`Fetched Facebook reviews for ${companyName}:`, mockData);
    return mockData;
  }

  async fetchRedditMentions(companyName) {
    await this.delay(1200);
    
    const mockData = {
      totalMentions: Math.floor(Math.random() * 100) + 1,
      sentiment: this.getRandomSentiment(),
      summary: this.generateMentionSummary('Reddit', companyName)
    };

    console.log(`Fetched Reddit mentions for ${companyName}:`, mockData);
    return mockData;
  }

  async fetchYoutubeMentions(companyName) {
    await this.delay(900);
    
    const mockData = {
      totalMentions: Math.floor(Math.random() * 50) + 1,
      sentiment: this.getRandomSentiment(),
      summary: this.generateMentionSummary('YouTube', companyName)
    };

    console.log(`Fetched YouTube mentions for ${companyName}:`, mockData);
    return mockData;
  }

  async fetchDomainAge(website) {
    if (!website) return 0;
    
    await this.delay(500);
    
    return Math.floor(Math.random() * 15) + 1;
  }

  async checkScamReports(companyName) {
    await this.delay(600);
    
    const scamCount = Math.floor(Math.random() * 10);
    const fraudCount = Math.floor(Math.random() * 5);
    
    return {
      totalReports: scamCount + fraudCount,
      scamReports: scamCount,
      fraudReports: fraudCount
    };
  }

  async verifyRecruiters(companyName) {
    await this.delay(700);
    
    return Math.floor(Math.random() * 20) + 1;
  }

  getRandomSentiment() {
    const sentiments = ['positive', 'neutral', 'negative'];
    const weights = [0.4, 0.3, 0.3];
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < sentiments.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return sentiments[i];
      }
    }
    
    return 'neutral';
  }

  generateReviewSummary(platform, companyName) {
    const summaries = [
      `${companyName} has mixed reviews on ${platform} with varying employee experiences.`,
      `Generally positive sentiment about ${companyName} on ${platform} with some concerns.`,
      `${companyName} receives moderate ratings on ${platform} with balanced feedback.`,
      `Employees report mixed experiences with ${companyName} on ${platform}.`,
      `${companyName} shows average performance ratings on ${platform}.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  generateMentionSummary(platform, companyName) {
    const summaries = [
      `${companyName} is mentioned occasionally on ${platform} with mixed discussions.`,
      `Limited but generally neutral mentions of ${companyName} on ${platform}.`,
      `${companyName} appears in various discussions on ${platform} with diverse opinions.`,
      `Some concerns raised about ${companyName} in ${platform} discussions.`,
      `${companyName} has minimal presence on ${platform} with few mentions.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateExternalLinks(companyName) {
    const encodedName = encodeURIComponent(companyName);
    
    return {
      googleReviewLink: `https://www.google.com/search?q=${encodedName}+reviews`,
      facebookReviewLink: `https://www.facebook.com/search/pages/?q=${encodedName}`,
      redditSearchLink: `https://www.reddit.com/search?q=${encodedName}`,
      youtubeSearchLink: `https://www.youtube.com/results?search_query=${encodedName}`
    };
  }
}

export default new ExternalApiService();
