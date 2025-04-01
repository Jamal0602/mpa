
import React from 'react';

// Simplified chart implementations that load faster
export const BarChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-muted/10 rounded-lg flex items-end justify-around p-4">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div 
            className="bg-primary w-10 rounded-t-md transition-all duration-300 ease-in-out" 
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
    <div className="w-full h-64 bg-muted/10 rounded-lg flex items-center justify-center p-4">
      <div className="relative w-32 h-32">
        {data.map((item, index) => {
          const rotation = 360 * (index / data.length);
          const total = data.reduce((sum, i) => sum + i.value, 0);
          const percentage = Math.round((item.value / total) * 100);
          
          return (
            <div key={index} className="absolute inset-0 flex items-center justify-center">
              <div 
                className="absolute top-0 left-0 w-full h-full" 
                style={{
                  background: `conic-gradient(${getColor(index)} ${rotation}deg, transparent ${rotation}deg)`,
                  clipPath: `polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)`,
                  transform: `rotate(${rotation}deg)`,
                  opacity: 0.8
                }}
              ></div>
            </div>
          );
        })}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background rounded-full scale-75">
          <div className="text-xs font-medium">Data</div>
        </div>
      </div>
      <div className="ml-8">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(index) }}></div>
            <span className="text-xs">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LineChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-64 bg-muted/10 rounded-lg p-4">
      <div className="relative h-full">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border"></div>
        <div className="absolute top-0 bottom-0 left-0 w-px bg-border"></div>
        <div className="flex items-end justify-between h-full relative">
          {data.map((item, index) => {
            const nextItem = data[index + 1];
            const height = (item.value / Math.max(...data.map(d => d.value))) * 150;
            
            return (
              <div key={index} className="flex flex-col items-center z-10">
                <div 
                  className="w-2 h-2 rounded-full bg-primary"
                  style={{ marginBottom: `${height}px` }}
                ></div>
                {nextItem && (
                  <div 
                    className="absolute h-px bg-primary/50"
                    style={{
                      width: `${100 / (data.length - 1)}%`,
                      bottom: `${height}px`,
                      left: `${(index * 100) / (data.length - 1)}%`,
                      transform: 'translateX(50%)',
                    }}
                  ></div>
                )}
                <span className="text-xs mt-2">{item.name}</span>
              </div>
            );
          })}
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
