import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ThumbsUp, MessageCircle, PenSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: number;
  title: string;
  content: string;
  user_id: Profile;
  created_at: string;
  likes: number;
  comments: number;
}

interface Contributor {
  username: string;
  post_count: number;
  avatar_url: string | null;
}

const fetchPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      created_at,
      likes,
      comments,
      user_id:profiles(
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data.map(post => ({
    ...post,
    user_id: post.user_id[0] || { username: 'Anonymous', avatar_url: null }
  })) as Post[];
};

const fetchStats = async () => {
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('count');
  
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('count');
  
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('count');
    
  if (postsError || usersError || commentsError) 
    throw new Error('Failed to fetch statistics');
    
  return {
    posts: posts?.[0]?.count || 0,
    users: users?.[0]?.count || 0,
    comments: comments?.[0]?.count || 0,
  };
};

const fetchTopContributors = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username, post_count, avatar_url')
    .order('post_count', { ascending: false })
    .limit(3);
  
  if (error) throw error;
  return data as Contributor[];
};

const Index = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const { data: contributors, isLoading: isLoadingContributors } = useQuery({
    queryKey: ["contributors"],
    queryFn: fetchTopContributors,
  });

  const popularTags = [
    { name: "React", count: 125 },
    { name: "TypeScript", count: 98 },
    { name: "Web Development", count: 84 },
    { name: "UI/UX", count: 76 },
    { name: "Performance", count: 65 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Latest Posts</h2>
            {(user && isAdmin) && (
              <Button 
                onClick={() => navigate('/create-post')}
                className="gap-2"
              >
                <PenSquare className="h-4 w-4" />
                Create Post
              </Button>
            )}
          </div>
          {isLoadingPosts ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              {posts?.map((post) => (
                <article 
                  key={post.id} 
                  className="p-4 rounded-md border bg-background/50 space-y-4 hover:border-primary/50 transition-colors cursor-pointer animate-fade-in"
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <h3 className="text-lg font-medium hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{post.user_id?.username || "Anonymous"}</span>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-4 space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <div
                key={tag.name}
                className="px-2 py-1 bg-primary/10 rounded-full text-xs cursor-pointer hover:bg-primary/20 transition-colors"
              >
                {tag.name} ({tag.count})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4">Site Statistics</h3>
          {isLoadingStats ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Posts</span>
                <span className="font-medium animate-fade-in">{stats?.posts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Users</span>
                <span className="font-medium animate-fade-in">{stats?.users || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Comments</span>
                <span className="font-medium animate-fade-in">{stats?.comments || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4">Top Contributors</h3>
          {isLoadingContributors ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {contributors?.map((contributor) => (
                <div key={contributor.username} className="flex justify-between items-center animate-fade-in">
                  <div className="flex items-center gap-2">
                    {contributor.avatar_url && (
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.username}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <span className="text-sm">{contributor.username}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {contributor.post_count} posts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-medium mb-4">GitHub Repository</h3>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This project is open source. Check out our repository:
            </p>
            <a 
              href="https://github.com/Jamal0602/MPA.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              Jamal0602/MPA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
