import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Credit {
  amount: number;
  expiryDate: string;
}

interface CreditContextType {
  credits: Credit[];
  addCredits: (amount: number, validityDays: number) => void;
  useCredit: () => Promise<boolean>;
  totalCredits: number;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const useCredits = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<Credit[]>(() => {
    const stored = localStorage.getItem(`credits_${user?.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`credits_${user.id}`, JSON.stringify(credits));
    }
  }, [credits, user?.id]);

  const addCredits = (amount: number, validityDays: number) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);
    
    setCredits(prev => [...prev, {
      amount,
      expiryDate: expiryDate.toISOString()
    }]);
  };

  const useCredit = async (): Promise<boolean> => {
    // Remove expired credits
    const now = new Date();
    const validCredits = credits.filter(credit => 
      new Date(credit.expiryDate) > now
    );

    if (validCredits.length === 0) {
      return false;
    }

    // Use one credit from the earliest expiring package
    const sortedCredits = [...validCredits].sort((a, b) => 
      new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    const firstPackage = sortedCredits[0];
    if (firstPackage.amount > 1) {
      setCredits([
        { ...firstPackage, amount: firstPackage.amount - 1 },
        ...sortedCredits.slice(1)
      ]);
    } else {
      setCredits(sortedCredits.slice(1));
    }

    return true;
  };

  const totalCredits = credits.reduce((sum, credit) => {
    if (new Date(credit.expiryDate) > new Date()) {
      return sum + credit.amount;
    }
    return sum;
  }, 0);

  return (
    <CreditContext.Provider value={{ credits, addCredits, useCredit, totalCredits }}>
      {children}
    </CreditContext.Provider>
  );
};

export default CreditProvider; 