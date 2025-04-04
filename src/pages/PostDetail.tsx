
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, MessageSquare, ThumbsUp, ChevronLeft, Send, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  published: boolean;
  featured?: boolean;
  excerpt?: string;
  thumbnail_url?: string;
  category?: string;
  author?: {
    username: string;
    avatar_url: string;
    display_name: string;
  }
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  author?: {
    username: string;
    avatar_url: string;
    display_name: string;
  }
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: post, isLoading, refetch: refetchPost } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:user_id (username, avatar_url, display_name)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Post & { author: { username: string; avatar_url: string; display_name: string } };
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['post-comments', id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:user_id (username, avatar_url, display_name)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as (Comment & { author: { username: string; avatar_url: string; display_name: string } })[];
    },
    enabled: !!id,
  });

  // Check if user has liked this post already
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user || !id) return;
      
      const { data } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .single();
        
      setIsLiked(!!data);
    };
    
    checkIfLiked();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like this post");
      return;
    }
    
    if (!id) return;

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', user.id);
          
        await supabase
          .from('posts')
          .update({ likes: post!.likes - 1 })
          .eq('id', id);
          
        setIsLiked(false);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: id,
            user_id: user.id
          });
          
        await supabase
          .from('posts')
          .update({ likes: post!.likes + 1 })
          .eq('id', id);
          
        setIsLiked(true);
      }
      
      refetchPost();
    } catch (error) {
      toast.error("Failed to process your like");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    
    if (!id || !commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      
      // Insert comment
      await supabase
        .from('comments')
        .insert({
          content: commentText.trim(),
          user_id: user.id,
          post_id: id
        });
        
      // Update comment count
      await supabase
        .from('posts')
        .update({ comments: (post?.comments || 0) + 1 })
        .eq('id', id);
        
      toast.success("Comment added successfully");
      setCommentText('');
      refetchComments();
      refetchPost();
    } catch (error) {
      toast.error("Failed to post your comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Shared post',
        text: post?.excerpt || 'Check out this post',
        url: window.location.href,
      })
        .then(() => toast.success('Shared successfully!'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" className="mb-6">
        <Link to="/blog" className="flex items-center">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {post.thumbnail_url && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={post.thumbnail_url} 
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={post.author?.avatar_url} alt={post.author?.username || 'Author'} />
                <AvatarFallback>{post.author?.username?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <span>{post.author?.display_name || post.author?.username || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(post.created_at), 'PPP')}</span>
            </div>
            
            {post.category && <Badge>{post.category}</Badge>}
          </div>
          
          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <Button 
                variant={isLiked ? "default" : "outline"}
                className="gap-2" 
                onClick={handleLike}
              >
                <ThumbsUp className="h-4 w-4" />
                {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
              </Button>
              
              <Button variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <h2 className="text-2xl font-bold mb-6">Comments ({post.comments})</h2>
          
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <Textarea 
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button 
                    type="submit" 
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="gap-2"
                  >
                    {isSubmittingComment ? "Posting..." : (
                      <>
                        <Send className="h-4 w-4" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="mb-4 text-center">Please sign in to leave a comment</p>
                <div className="flex justify-center">
                  <Button asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-6">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author?.avatar_url} alt={comment.author?.username || 'Commenter'} />
                    <AvatarFallback>{comment.author?.username?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        {comment.author?.display_name || comment.author?.username || 'Anonymous'}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.created_at), 'PP')}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Post sidebar widgets */}
          <WidgetRenderer location="sidebar" />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
