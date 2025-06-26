export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    thumb: string;
  };
  alt_description: string;
}

class UnsplashService {
  private apiKey: string;
  private baseUrl: string = 'https://api.unsplash.com';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_UNSPLASH_KEY || '';
  }

  async searchImages(query: string, count: number = 1): Promise<UnsplashImage[]> {
    if (!this.apiKey) {
      return this.getFallbackImages(query);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return this.getFallbackImages(query);
      }

      const data = await response.json();
      return data.results || this.getFallbackImages(query);
    } catch (error) {
      console.error('Unsplash API error:', error);
      return this.getFallbackImages(query);
    }
  }

  private getFallbackImages(query: string): UnsplashImage[] {
    const fallbackImages = {
      groceries: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
      utilities: 'https://images.pexels.com/photos/4463641/pexels-photo-4463641.jpeg?auto=compress&cs=tinysrgb&w=400',
      miscellaneous: 'https://images.pexels.com/photos/3811082/pexels-photo-3811082.jpeg?auto=compress&cs=tinysrgb&w=400',
      shopping: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=400',
      food: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      transport: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400',
      entertainment: 'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg?auto=compress&cs=tinysrgb&w=400',
    };

    const imageUrl = fallbackImages[query.toLowerCase() as keyof typeof fallbackImages] || fallbackImages.miscellaneous;

    return [{
      id: `fallback-${query}`,
      urls: {
        small: imageUrl,
        regular: imageUrl,
        thumb: imageUrl,
      },
      alt_description: query,
    }];
  }
}

export const unsplashService = new UnsplashService();