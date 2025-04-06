
import React from 'react';
import { Card } from '@/components/ui/card';

interface AdPlaceholderProps {
  width?: string;
  height?: string;
  text?: string;
  className?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  width = '100%',
  height = '250px',
  text = 'Advertisement',
  className = '',
}) => {
  return (
    <Card 
      className={`flex items-center justify-center bg-gradient-to-r from-muted/50 to-muted ${className}`}
      style={{ width, height }}
    >
      <div className="text-center">
        <p className="text-muted-foreground text-sm">{text}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">cubiz.space</p>
      </div>
    </Card>
  );
};

export default AdPlaceholder;
