import React from 'react';
import { WaitlistCard } from '../components/WaitlistModal';

export const WaitlistScreen: React.FC = () => {
  const handleWaitlistSubmit = async (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    console.log('Waitlist submission:', data);
    // TODO: Implement actual API call to submit waitlist data
    // Example:
    // await fetch('/api/waitlist', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <WaitlistCard onSubmit={handleWaitlistSubmit} />
    </div>
  );
};

