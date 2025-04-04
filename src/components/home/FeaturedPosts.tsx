
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  category?: string;
  thumbnail_url?: string;
  featured: boolean;
  user_id: string;
  author?: {
    username: string;
    avatar_url: string;
  };
}

export function FeaturedPosts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["featured-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:user_id(username, avatar_url)
        `)
        .eq("published", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
        
      if (error) throw error;
      return data as unknown as (Post & { author: { username: string; avatar_url: string } })[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden flex flex-col">
            <div className="aspect-video w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="mt-auto">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No featured posts available.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden flex flex-col h-full">
          {post.thumbnail_url ? (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={post.thumbnail_url} 
                alt={post.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center text-muted-foreground">
              No thumbnail
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              {post.category && (
                <Badge variant="outline" className="ml-2">
                  {post.category}
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2 flex-grow">
            <p className="text-muted-foreground line-clamp-3">
              {post.excerpt || post.content.substring(0, 150) + '...'}
            </p>
            
            <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{post.comments}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link to={`/post/${post.id}`} className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Read More
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
