import React from 'react';

interface RCAAnalysisProps {
  rcaData: any[];
  setRcaData: (data: any[]) => void;
}

export default function RCAAnalysis({ rcaData, setRcaData }: RCAAnalysisProps) {
  return (
    <div className="p-6">
      <h2>RCA Analysis</h2>
      <p>Perform root cause analysis here.</p>
    </div>
  );
}
