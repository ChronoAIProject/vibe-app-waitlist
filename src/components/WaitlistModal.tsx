import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Toast } from './Toast';

interface WaitlistCardProps {
  onSubmit?: (data: { firstName: string; lastName: string; email: string }) => Promise<void> | void;
}

export const WaitlistCard: React.FC<WaitlistCardProps> = ({
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit({ firstName, lastName, email });
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSuccess(true);
      setShowToast(true);
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      // Handle error state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!isSubmitting) {
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setErrors({});
      setIsSuccess(false);
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message="Successfully joined the waitlist!"
          type="success"
          duration={2000}
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-card border border-gray-200" style={{ borderColor: 'var(--color-black)' }}>
        {!isSuccess ? (
          <>
            {/* Title */}
            <h2 className="text-2xl font-semibold text-black mb-3">
              Join the Waitlist
            </h2>

            {/* Body */}
            <p className="text-base text-gray-600 mb-6">
              Be the first to know when we launch. Enter your details below to join our waitlist.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors(prev => ({ ...prev, firstName: undefined }));
                  }
                }}
                placeholder="Enter your first name"
                required
                error={errors.firstName}
                autoComplete="given-name"
              />

              <Input
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors(prev => ({ ...prev, lastName: undefined }));
                  }
                }}
                placeholder="Enter your last name"
                required
                error={errors.lastName}
                autoComplete="family-name"
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="Enter your email address"
                required
                error={errors.email}
                autoComplete="email"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Success Title */}
            <h2 className="text-2xl font-semibold text-black mb-3">
              You're on the list!
            </h2>

            {/* Success Message */}
            <p className="text-base text-gray-600 mb-6">
              Thank you for joining our waitlist. We'll notify you as soon as we launch.
            </p>

            {/* Reset Button */}
            <Button
              onClick={handleReset}
              variant="primary"
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// Keep the old export name for backwards compatibility
export const WaitlistModal = WaitlistCard;

