import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCredits } from '../contexts/CreditContext';
import { initializePayment, createOrder } from '../services/paymentService';
import { toast } from 'react-hot-toast';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  validityDays: number;
}

const PurchaseCredits = () => {
  const { user } = useAuth();
  const { addCredits } = useCredits();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(null);
  
  const [packages, setPackages] = useState<CreditPackage[]>(() => {
    const stored = localStorage.getItem('creditPackages');
    return stored ? JSON.parse(stored) : [
      { id: '1', credits: 100, price: 49, validityDays: 30 },
      { id: '2', credits: 500, price: 199, validityDays: 60 },
      { id: '3', credits: 1000, price: 299, validityDays: 90 }
    ];
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      setIsLoading(true);
      setPurchasingPackageId(pkg.id);
      
      // Create order
      const orderId = await createOrder(pkg.price);
      
      // Initialize payment
      await initializePayment({
        amount: pkg.price,
        currency: 'INR',
        orderId,
        credits: pkg.credits,
        validityDays: pkg.validityDays,
        onSuccess: () => {
          // Add credits on successful payment
          addCredits(pkg.credits, pkg.validityDays);
          toast.success(`${pkg.credits} credits added to your account!`);
        }
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to process purchase');
    } finally {
      setIsLoading(false);
      setPurchasingPackageId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Purchase Credits
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose a credit package that suits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{pkg.credits} Credits</h3>
              <p className="text-3xl font-bold text-indigo-600 mb-4">₹{pkg.price}</p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Generate {pkg.credits} resumes
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Valid for {pkg.validityDays} days
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Secure payment
                </li>
              </ul>
              <button
                onClick={() => handlePurchase(pkg)}
                disabled={isLoading}
                className={`w-full ${
                  isLoading && purchasingPackageId === pkg.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white py-2 px-4 rounded-md transition-colors`}
              >
                {isLoading && purchasingPackageId === pkg.id ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            For custom packages or bulk purchases, please contact support@resumeai.com
          </p>
          <p className="text-xs text-gray-400 mt-2">
            All payments are processed securely through Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCredits; 