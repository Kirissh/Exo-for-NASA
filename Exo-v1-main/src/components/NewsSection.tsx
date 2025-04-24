import { useEffect, useState } from 'react';
import { fetchLatestNews, NewsItem } from '@/services/nasaNewsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper, Clock, ExternalLink, Star } from 'lucide-react';
import { Button } from './ui/button';

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const latestNews = await fetchLatestNews();
        setNews(latestNews);
        setError(null);
      } catch (err) {
        console.error('Error loading NASA news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
    
    // Set up auto-refresh every 15 minutes
    const refreshInterval = setInterval(loadNews, 15 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">NASA Space News</h2>
        </div>
        <Badge variant="outline" className="bg-primary/10">Real-time Updates</Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="nasa">NASA</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderNewsContent(news)}
        </TabsContent>
        
        <TabsContent value="nasa">
          {renderNewsContent(news.filter(item => item.source === 'NASA'))}
        </TabsContent>
        
        <TabsContent value="featured">
          {renderNewsContent(news.filter(item => item.featured))}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNewsContent(newsItems: NewsItem[]) {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden bg-background/60 backdrop-blur-md border-white/10">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Card className="bg-background/60 backdrop-blur-md border-white/10">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchLatestNews()
                  .then(setNews)
                  .catch(err => {
                    console.error(err);
                    setError('Failed to load news. Please try again later.');
                  })
                  .finally(() => setLoading(false));
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (newsItems.length === 0) {
      return (
        <Card className="bg-background/60 backdrop-blur-md border-white/10">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-muted-foreground">No news available in this category.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsItems.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow bg-background/60 backdrop-blur-md border-white/10">
            {item.imageUrl && (
              <div className="relative h-48 w-full">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} 
                />
                {item.featured && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-amber-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                  {item.source}
                </Badge>
              </div>
              <CardDescription className="flex items-center text-xs mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(item.publishedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{item.summary}</p>
            </CardContent>
            <CardFooter>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read Full Article
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}
