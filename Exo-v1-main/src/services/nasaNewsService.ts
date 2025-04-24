import axios from 'axios';
import { supabase } from "@/lib/supabase";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  imageUrl?: string;
  source: 'NASA' | 'SpaceNews' | 'Other';
}

const NASA_NEWS_API = 'https://api.nasa.gov/planetary/apod';
const SPACENEWS_API = 'https://api.spaceflightnewsapi.net/v4/articles';
const NASA_API_KEY = 'slH4JNYNBB7IlBhUPp1LhdB8MmCmjJgm85YeRnfE';

// Cache for storing fetched news data
let newsCache: NewsItem[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 300000; // 5 minutes

export async function fetchLatestNews(): Promise<NewsItem[]> {
  // Check if we have cached data that's not expired
  const currentTime = Date.now();
  if (newsCache && (currentTime - lastFetchTime) < CACHE_DURATION) {
    return newsCache;
  }

  // Try to get cached news from Supabase
  try {
    const { data: cachedData, error: cacheError } = await supabase
      .from('nasa_news_cache')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (!cacheError && cachedData && cachedData.length > 0 && cachedData[0].data) {
      const cacheAge = new Date().getTime() - new Date(cachedData[0].created_at).getTime();
      if (cacheAge < 3600000) { // Cache is less than 1 hour old
        console.log("Using cached NASA news from Supabase");
        const news = cachedData[0].data as NewsItem[];
        newsCache = news;
        lastFetchTime = currentTime;
        return news;
      }
    }
  } catch (error) {
    console.log("No cached NASA news available or error accessing cache");
  }

  // Fetch from multiple sources
  return await fetchFromMultipleSources();
}

async function fetchFromMultipleSources(): Promise<NewsItem[]> {
  const currentTime = Date.now();
  let allNews: NewsItem[] = [];
  
  // Try NASA APOD API first
  try {
    console.log("Attempting to fetch NASA news");
    const nasaNews = await fetchNasaNews();
    if (nasaNews && nasaNews.length > 0) {
      console.log(`Successfully fetched ${nasaNews.length} NASA news items`);
      allNews = [...allNews, ...nasaNews];
    }
  } catch (nasaError) {
    console.error("Error fetching NASA news in combined fetcher:", nasaError);
  }
  
  // Try SpaceNews API next
  try {
    console.log("Attempting to fetch SpaceNews");
    const spaceNews = await fetchSpaceNews();
    if (spaceNews && spaceNews.length > 0) {
      console.log(`Successfully fetched ${spaceNews.length} SpaceNews items`);
      allNews = [...allNews, ...spaceNews];
    }
  } catch (spaceNewsError) {
    console.error("Error fetching SpaceNews in combined fetcher:", spaceNewsError);
  }
  
  // If we have no news at all, add fallback data
  if (allNews.length === 0) {
    console.log("No news found from any source. Adding fallback data");
    allNews = [
      {
        id: `nasa-fallback-1`,
        title: "James Webb Space Telescope Reveals New Discoveries",
        summary: "NASA's James Webb Space Telescope continues to reveal unprecedented details of distant galaxies and exoplanets, transforming our understanding of the cosmos.",
        url: "https://www.nasa.gov/mission/webb/",
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: true,
        imageUrl: "https://www.nasa.gov/sites/default/files/thumbnails/image/web_first_images_release_0.png",
        source: 'NASA'
      },
      {
        id: `nasa-fallback-2`,
        title: "NASA's Hubble Spots Supernova in Distant Galaxy",
        summary: "The Hubble Space Telescope has captured images of a new supernova in a galaxy millions of light years away, providing new insights into stellar evolution.",
        url: "https://hubblesite.org/",
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        featured: false,
        imageUrl: "https://hubblesite.org/files/live/sites/hubble/files/home/science/galaxies/_images/potw2210a.jpg",
        source: 'NASA'
      },
      {
        id: `spacenews-fallback-1`,
        title: "SpaceX and NASA Partner on New Mission to Mars",
        summary: "NASA has announced a new partnership with SpaceX for an upcoming Mars sample return mission, leveraging commercial capabilities for deep space exploration.",
        url: "https://www.spacex.com/",
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        featured: false,
        imageUrl: "https://www.nasa.gov/sites/default/files/thumbnails/image/spacex_dragon_on_approach_to_iss.jpg",
        source: 'SpaceNews'
      }
    ];
  }
  
  // Sort news by published date
  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Set cache
  newsCache = allNews;
  lastFetchTime = currentTime;
  
  // Cache in Supabase if we have news items
  try {
    if (allNews.length > 0) {
      const { error } = await supabase
        .from('nasa_news_cache')
        .insert({
          data: allNews,
          source: 'multiple',
          created_at: new Date().toISOString(),
          count: allNews.length
        });
      
      if (error) {
        console.error("Error caching NASA news:", error);
      } else {
        console.log(`Successfully cached ${allNews.length} news items in Supabase`);
      }
    }
  } catch (cacheError) {
    console.error("Failed to cache NASA news:", cacheError);
  }
  
  return allNews;
}

async function fetchNasaNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching NASA news...");
    // Get a single day's NASA picture of the day - simpler approach to avoid CORS issues
    // We're not using date ranges which can cause issues
    
    const response = await axios.get(`${NASA_NEWS_API}?api_key=${NASA_API_KEY}`);
    
    if (response.status !== 200) {
      throw new Error(`NASA API responded with status: ${response.status}`);
    }
    
    // Handle both single item and array responses
    const items = Array.isArray(response.data) ? response.data : [response.data];
    
    // Transform NASA APOD data to our NewsItem format
    return items.map((item: any) => ({
      id: `nasa-${item.date || new Date().toISOString().split('T')[0]}`,
      title: item.title || "NASA Astronomy Picture of the Day",
      summary: item.explanation ? (item.explanation.substring(0, 200) + '...') : "NASA's astronomy picture of the day with description.",
      url: item.hdurl || item.url || "https://apod.nasa.gov/apod/astropix.html",
      publishedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      updatedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      featured: true,
      imageUrl: item.url || null,
      source: 'NASA'
    }));
  } catch (error) {
    console.error("Error fetching NASA news:", error);
    
    // Return fallback NASA news when API fails
    return [{
      id: `nasa-fallback`,
      title: "NASA's Astronomy Picture of the Day",
      summary: "The NASA Astronomy Picture of the Day (APOD) features a different image or photograph of our universe each day, with a brief explanation written by an astronomer.",
      url: "https://apod.nasa.gov/apod/astropix.html",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: true,
      imageUrl: "https://apod.nasa.gov/apod/image/2303/LMC_JWST_960.jpg",
      source: 'NASA'
    }];
  }
}

async function fetchSpaceNews(): Promise<NewsItem[]> {
  try {
    console.log("Fetching SpaceNews...");
    // Using a more reliable API endpoint without filtering parameters that could cause issues
    const response = await axios.get(`${SPACENEWS_API}?limit=5`);
    
    if (response.status !== 200 || !response.data || !response.data.results) {
      throw new Error(`SpaceNews API responded with invalid data or status: ${response.status}`);
    }
    
    // Check if we have results
    if (!Array.isArray(response.data.results) || response.data.results.length === 0) {
      throw new Error("No results returned from SpaceNews API");
    }
    
    // Filter for NASA-related news
    const nasaRelated = response.data.results.filter((item: any) => 
      item.title?.toLowerCase().includes('nasa') || 
      item.summary?.toLowerCase().includes('nasa') ||
      item.news_site?.toLowerCase().includes('nasa')
    );
    
    // Transform SpaceNews data to our NewsItem format
    return nasaRelated.map((item: any) => ({
      id: `spacenews-${item.id || Math.random().toString(36).substring(7)}`,
      title: item.title || "Space News Update",
      summary: item.summary || "Latest update from the space industry.",
      url: item.url || "https://spacenews.com",
      publishedAt: item.published_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString(),
      featured: false,
      imageUrl: item.image_url || null,
      source: 'SpaceNews'
    }));
  } catch (error) {
    console.error("Error fetching SpaceNews:", error);
    
    // Return fallback space news when API fails
    return [{
      id: `spacenews-fallback`,
      title: "NASA's Mars Perseverance Rover Mission",
      summary: "The Mars Perseverance rover is part of NASA's Mars Exploration Program, a long-term effort to explore the Red Planet. It addresses high-priority science goals including the search for signs of past microbial life.",
      url: "https://mars.nasa.gov/mars2020/",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
      imageUrl: "https://mars.nasa.gov/system/feature_items/images/6037_1-PIA23764-16x9.jpg",
      source: 'SpaceNews'
    },
    {
      id: `spacenews-fallback-2`,
      title: "NASA's Artemis Program",
      summary: "With Artemis missions, NASA will land the first woman and first person of color on the Moon, using innovative technologies to explore more of the lunar surface than ever before.",
      url: "https://www.nasa.gov/artemis",
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      featured: false,
      imageUrl: "https://www.nasa.gov/sites/default/files/thumbnails/image/artemis_logo_0.jpg",
      source: 'SpaceNews'
    }];
  }
}

// Get NASA missions
export async function getNasaMissions(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('nasa_missions')
      .select('*')
      .order('launch_date', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching NASA missions:", error);
    return [];
  }
}
