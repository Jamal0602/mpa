
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Search, MessageSquare, ThumbsUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  published: boolean;
  featured?: boolean;
  thumbnail_url?: string;
  category?: string;
  user_id: string;
  author?: {
    username: string;
    avatar_url: string;
  };
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id(username, avatar_url)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as unknown as (Post & { author: { username: string; avatar_url: string } })[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      if (!posts) return [];
      
      const categoriesSet = new Set<string>();
      posts.forEach(post => {
        if (post.category) categoriesSet.add(post.category);
      });
      
      return Array.from(categoriesSet);
    },
    enabled: !!posts,
  });

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === '' || post.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Stay up to date with the latest news, tutorials, and insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts List */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <Skeleton className="h-48 md:h-full w-full rounded-t-lg md:rounded-l-lg md:rounded-t-none" />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <Skeleton className="h-8 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {post.thumbnail_url ? (
                      <div className="md:w-1/3">
                        <img 
                          src={post.thumbnail_url} 
                          alt={post.title}
                          className="h-48 md:h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="md:w-1/3 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold line-clamp-2">{post.title}</h2>
                        {post.category && (
                          <Badge>{post.category}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        
                        {post.author && (
                          <>
                            <span className="mx-2">•</span>
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarImage src={post.author.avatar_url} alt={post.author.username} />
                              <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.username}</span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt || post.content.substring(0, 200) + '...'}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <Button asChild variant="outline">
                          <Link to={`/post/${post.id}`} className="gap-2">
                            <Eye className="h-4 w-4" /> Read More
                          </Link>
                        </Button>
                        
                        <div className="flex items-center space-x-4 text-muted-foreground">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-muted-foreground">No posts found. Try a different search term.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Blog Sidebar Widgets */}
          <WidgetRenderer location="sidebar" />
          
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {categories?.map((category) => (
                <Button 
                  key={category} 
                  variant={categoryFilter === category ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setCategoryFilter(category === categoryFilter ? '' : category)}
                >
                  {category}
                </Button>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our blog provides the latest insights, tutorials, and updates about our platform and services.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Blog;
