import React from 'react';
import { useCredits } from '../contexts/CreditContext';

const PaymentButton: React.FC = () => {
  const { totalCredits, addCredits } = useCredits();

  const handleClaimCredits = () => {
    addCredits(1000, 30); // Add 1000 credits valid for 30 days
  };

  return (
    <button
      onClick={handleClaimCredits}
      className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
    >
      Claim Free Credits
    </button>
  );
};

export default PaymentButton; 