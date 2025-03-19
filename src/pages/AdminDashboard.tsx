import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  validityDays: number;
}

interface APIConfig {
  id: string;
  name: string;
  apiKey: string;
  isEnabled: boolean;
}

interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  packageId: string;
  credits: number;
  amount: number;
  status: 'completed' | 'failed' | 'refunded';
  timestamp: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>(() => {
    const stored = localStorage.getItem('creditPackages');
    return stored ? JSON.parse(stored) : [
      { id: '1', credits: 100, price: 49, validityDays: 30 },
      { id: '2', credits: 500, price: 199, validityDays: 60 },
      { id: '3', credits: 1000, price: 299, validityDays: 90 }
    ];
  });

  const [apiConfigs, setApiConfigs] = useState<APIConfig[]>(() => {
    const stored = localStorage.getItem('apiConfigs');
    return stored ? JSON.parse(stored) : [
      { id: 'gemini', name: 'Google Gemini', apiKey: '', isEnabled: true },
      { id: 'openai', name: 'OpenAI', apiKey: '', isEnabled: false }
    ];
  });

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(() => {
    const stored = localStorage.getItem('paymentHistory');
    return stored ? JSON.parse(stored) : [
      {
        id: 'pay_123456',
        userId: 'user1',
        userName: 'John Doe',
        packageId: '1',
        credits: 100,
        amount: 49,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [newPackage, setNewPackage] = useState<Omit<CreditPackage, 'id'>>({
    credits: 100,
    price: 49,
    validityDays: 30
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('creditPackages', JSON.stringify(creditPackages));
  }, [creditPackages]);

  useEffect(() => {
    localStorage.setItem('apiConfigs', JSON.stringify(apiConfigs));
  }, [apiConfigs]);

  useEffect(() => {
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  const handleAddPackage = () => {
    if (newPackage.credits <= 0 || newPackage.price <= 0 || newPackage.validityDays <= 0) {
      toast.error('All values must be greater than zero');
      return;
    }
    
    setCreditPackages(prev => [...prev, {
      ...newPackage,
      id: Math.random().toString(36).substr(2, 9)
    }]);
    toast.success('Credit package added successfully');
  };

  const handleDeletePackage = (id: string) => {
    setCreditPackages(prev => prev.filter(pkg => pkg.id !== id));
    toast.success('Credit package deleted');
  };

  const handleUpdateApiKey = (id: string, apiKey: string) => {
    setApiConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, apiKey } : config
    ));
    toast.success(`${id} API key updated`);
  };

  const handleToggleApi = (id: string) => {
    setApiConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, isEnabled: !config.isEnabled } : config
    ));
  };

  const handleRefundPayment = (paymentId: string) => {
    setPaymentHistory(prev => prev.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'refunded' as const } : payment
    ));
    toast.success('Payment refunded successfully');
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Credit Packages Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Credit Packages</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add New Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input
                  type="number"
                  placeholder="Credits"
                  value={newPackage.credits}
                  onChange={e => setNewPackage(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newPackage.price}
                  onChange={e => setNewPackage(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity (days)</label>
                <input
                  type="number"
                  placeholder="Validity (days)"
                  value={newPackage.validityDays}
                  onChange={e => setNewPackage(prev => ({ ...prev, validityDays: parseInt(e.target.value) }))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddPackage}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Add Package
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Current Packages</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditPackages.map(pkg => (
                    <tr key={pkg.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.credits}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{pkg.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.validityDays} days</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.timestamp).toLocaleDateString()} 
                        {new Date(payment.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.credits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{payment.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'completed' && (
                        <button
                          onClick={() => handleRefundPayment(payment.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Configuration Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <div className="space-y-4">
            {apiConfigs.map(config => (
              <div key={config.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{config.name}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isEnabled}
                      onChange={() => handleToggleApi(config.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                <div className="flex gap-4">
                  <input
                    type="password"
                    value={config.apiKey}
                    onChange={e => handleUpdateApiKey(config.id, e.target.value)}
                    placeholder={`Enter ${config.name} API Key`}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 