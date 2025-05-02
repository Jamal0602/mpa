
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import { AdPlaceholder } from "@/components/ads/AdPlaceholder";

const ChatHelp: React.FC = () => {
  return (
    <PageLayout
      title="Chat Support"
      description="Get help with your projects and MPA features"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
        
        <div className="space-y-6">
          <AdPlaceholder type="sidebar" className="lg:sticky lg:top-20" />
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Popular Questions</h3>
            <ul className="space-y-1 text-sm">
              <li>• How do I upload a project?</li>
              <li>• How do I earn more points?</li>
              <li>• What file formats are supported?</li>
              <li>• How do I share my referral code?</li>
              <li>• How to apply for work with MPA?</li>
            </ul>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Quick Tips</h3>
            <ul className="space-y-1 text-sm">
              <li>• Try to be specific in your questions</li>
              <li>• Upload projects in PDF format for best results</li>
              <li>• Check your notifications for updates</li>
              <li>• Refer friends to earn bonus points</li>
              <li>• Report any issues via the Error Report page</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ChatHelp;
