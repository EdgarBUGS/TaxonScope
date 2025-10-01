interface QuotaInfo {
  remainingRequests: number;
  resetTime: Date;
  isQuotaExceeded: boolean;
}

class APIRateLimiter {
  private requestCount = 0;
  private lastReset = new Date();
  private readonly MAX_REQUESTS_PER_DAY = 200;
  private readonly RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  checkQuota(): QuotaInfo {
    const now = new Date();
    
    // Reset counter if 24 hours have passed
    if (now.getTime() - this.lastReset.getTime() > this.RESET_INTERVAL) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    const remainingRequests = Math.max(0, this.MAX_REQUESTS_PER_DAY - this.requestCount);
    const isQuotaExceeded = remainingRequests <= 0;
    
    // Calculate next reset time
    const resetTime = new Date(this.lastReset.getTime() + this.RESET_INTERVAL);

    return {
      remainingRequests,
      resetTime,
      isQuotaExceeded
    };
  }

  incrementRequestCount(): void {
    this.requestCount++;
  }

  getQuotaStatus(): string {
    const quota = this.checkQuota();
    if (quota.isQuotaExceeded) {
      const timeUntilReset = quota.resetTime.getTime() - Date.now();
      const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
      return `Quota exceeded. Resets in ${hours}h ${minutes}m`;
    }
    return `${quota.remainingRequests} requests remaining today`;
  }
}

export const apiRateLimiter = new APIRateLimiter();

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  const errorStatus = error.status || error.statusCode;
  
  return (
    errorStatus === 429 ||
    errorMessage.includes('429') ||
    errorMessage.includes('quota') ||
    errorMessage.includes('Too Many Requests') ||
    errorMessage.includes('QuotaFailure')
  );
}

export function getMockResponse(): any {
  // Return a realistic mock response for development
  return {
    domain: 'Eukarya',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    genus: 'Felis',
    species: 'catus',
    confidence: 0.85,
    summary: 'This appears to be a domestic cat (Felis catus), a small carnivorous mammal. Cats are known for their agility, hunting skills, and independent nature. They are one of the most popular pets worldwide and have been domesticated for thousands of years.'
  };
}




