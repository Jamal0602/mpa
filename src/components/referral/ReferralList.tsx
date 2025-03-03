
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  bonus_earned: number;
  created_at: string;
  completed_at: string | null;
  profiles: {
    username: string | null;
    full_name: string | null;
  };
}

interface ReferralListProps {
  referrals: Referral[];
  loading: boolean;
}

export const ReferralList = ({ referrals, loading }: ReferralListProps) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Your Referrals</CardTitle>
        <CardDescription>
          People who have joined using your referral code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            You haven't referred anyone yet. Share your code to get started!
          </div>
        ) : (
          <div className="divide-y">
            {referrals.map((referral) => (
              <div key={referral.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {referral.profiles?.full_name || referral.profiles?.username || 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    referral.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  {referral.status === 'completed' && (
                    <p className="text-sm font-medium text-green-600 mt-1">+{referral.bonus_earned} SP</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
