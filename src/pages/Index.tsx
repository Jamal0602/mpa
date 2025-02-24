
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ThumbsUp, MessageCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  comments: number;
}

const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
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
    .select('username, post_count')
    .order('post_count', { ascending: false })
    .limit(3);
  
  if (error) throw error;
  return data;
};

const Index = () => {
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const { data: contributors } = useQuery({
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main content area - Posts */}
          <div className="md:col-span-8 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-2xl font-semibold mb-6">Latest Posts</h2>
              {isLoadingPosts ? (
                <div className="space-y-4">
                  <div className="h-24 bg-muted animate-pulse rounded-md" />
                  <div className="h-24 bg-muted animate-pulse rounded-md" />
                </div>
              ) : (
                <div className="space-y-6">
                  {posts?.map((post) => (
                    <article key={post.id} className="p-4 rounded-md border bg-background/50 space-y-4">
                      <h3 className="text-lg font-medium hover:text-primary cursor-pointer transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{post.author}</span>
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

          {/* Sidebar - Widgets */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <div
                    key={tag.name}
                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    {tag.name} ({tag.count})
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Site Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-medium">{stats?.posts || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">{stats?.users || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Comments</span>
                  <span className="font-medium">{stats?.comments || 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-medium mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {contributors?.map((contributor) => (
                  <div key={contributor.username} className="flex justify-between items-center">
                    <span className="text-sm">{contributor.username}</span>
                    <span className="text-xs text-muted-foreground">{contributor.post_count} posts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
