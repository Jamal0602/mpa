import React from 'react';

// Basic chart component implementations
// These are placeholder implementations that will be replaced with actual chart implementations when needed

export const BarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg flex items-end justify-around p-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="bg-primary w-12 rounded-t-md" 
            style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 150}px` }}
          ></div>
          <span className="text-xs mt-2">{item.name}</span>
        </div>
      ))}
    </div>
  );
};

export const PieChart: React.FC<{ data: any[] }> = ({ data }) => {
  // Helper function to get color based on index
  const getColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex gap-2 justify-center mb-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(index) }}></div>
              <span className="text-xs">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="w-32 h-32 rounded-full border-8 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export const LineChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg p-4">
      <div className="relative h-full">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
        <div className="absolute top-0 bottom-0 left-0 w-px bg-border"></div>
        <div className="flex items-end justify-between h-full relative">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-2 h-2 rounded-full bg-primary z-10"
                style={{ marginBottom: `${(item.value / Math.max(...data.map(d => d.value))) * 150}px` }}
              ></div>
              <span className="text-xs mt-2">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  BarChart,
  PieChart,
  LineChart
};
