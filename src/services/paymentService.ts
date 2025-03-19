import { toast } from 'react-hot-toast';

export interface PaymentDetails {
  amount: number;
  currency: string;
  orderId: string;
  credits: number;
  validityDays: number;
  onSuccess?: () => void;
}

// Use Razorpay test key
const RAZORPAY_KEY = 'rzp_test_xHjmcfEZv7mtM8';

export const initializePayment = async (details: PaymentDetails): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();
  if (!scriptLoaded) {
    toast.error('Failed to load payment gateway');
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: details.amount * 100, // Razorpay expects amount in paise
    currency: details.currency,
    name: 'ResumeAI',
    description: `Purchase ${details.credits} credits`,
    order_id: details.orderId,
    handler: async (response: any) => {
      try {
        const isValid = await validatePayment(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );

        if (isValid) {
          // Call the onSuccess callback if provided
          if (details.onSuccess) {
            details.onSuccess();
          }
          toast.success('Payment successful! Credits added to your account.');
        } else {
          toast.error('Payment validation failed');
        }
      } catch (error) {
        console.error('Payment validation error:', error);
        toast.error('Failed to validate payment');
      }
    },
    prefill: {
      name: 'User Name',
      email: 'user@example.com',
    },
    theme: {
      color: '#4F46E5', // Indigo-600 to match your UI
    },
  };

  const paymentObject = new (window as any).Razorpay(options);
  paymentObject.open();
};

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createOrder = async (amount: number, currency: string = 'INR'): Promise<string> => {
  // In a real app, this would call your backend to create an order
  // For demo, we'll generate a random order ID
  return `order_${Math.random().toString(36).substr(2, 9)}`;
};

export const validatePayment = async (paymentId: string, orderId: string, signature: string): Promise<boolean> => {
  // In a real app, this would verify the payment with your backend
  console.log('Payment details:', { paymentId, orderId, signature });
  return true;
}; 