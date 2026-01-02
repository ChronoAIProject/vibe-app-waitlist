import React, { useState } from "react";
import {
  WaitlistCard,
  type WaitlistFormData,
} from "../components/WaitlistModal";

type DemoMode =
  | "uncontrolled"
  | "controlled"
  | "dismissible"
  | "turnstile"
  | "managed-success"
  | "managed-error";

export const WaitlistScreen: React.FC = () => {
  // Demo mode selector
  const [mode, setMode] = useState<DemoMode>("uncontrolled");

  // Controlled mode state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Handle controlled submission
  const handleControlledSubmit = async (data: WaitlistFormData) => {
    console.log("Controlled submission:", data);
    setIsSubmitting(true);
    setError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Handle Turnstile submission (shows the token)
  const handleTurnstileSubmit = async (data: WaitlistFormData) => {
    console.log("Turnstile submission:", data);
    console.log("Turnstile token:", data["cf-turnstile-response"]);
    setIsSubmitting(true);
    setError(null);

    // Simulate API call that would verify the token
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  // Handle Managed mode - SUCCESS scenario
  const handleManagedSuccess = async (data: WaitlistFormData) => {
    console.log("Managed (Success) submission:", data);
    console.log("Turnstile token:", data["cf-turnstile-response"]);
    setIsSubmitting(true);
    setError(null);

    // Simulate API call to backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSuccess(true);
    console.log("Backend verification successful");
  };

  // Handle Managed mode - ERROR scenario
  const handleManagedError = async (data: WaitlistFormData) => {
    console.log("Managed (Error) submission:", data);
    console.log("Turnstile token:", data["cf-turnstile-response"]);
    setIsSubmitting(true);
    setError(null);

    // Simulate API call to backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setError("Verification failed. Please try again.");
    console.log("Backend returned error");
  };

  // Reset controlled state
  const handleControlledDone = () => {
    console.log("Controlled: Done clicked");
    setIsSuccess(false);
    setError(null);
  };

  // Handle close
  const handleClose = () => {
    console.log("Modal closed");
    setIsVisible(false);
  };

  // Handle done for uncontrolled
  const handleUncontrolledDone = () => {
    console.log("Uncontrolled: Done clicked");
  };

  // Reset visibility
  const handleShowModal = () => {
    setIsVisible(true);
    setIsSuccess(false);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      {/* Mode Selector */}
      <div className="mb-8 flex gap-2 flex-wrap justify-center max-w-xl">
        <button
          onClick={() => {
            setMode("uncontrolled");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "uncontrolled"
              ? "bg-black text-white"
              : "bg-white text-black border border-black"
          }`}
        >
          Uncontrolled
        </button>
        <button
          onClick={() => {
            setMode("controlled");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "controlled"
              ? "bg-black text-white"
              : "bg-white text-black border border-black"
          }`}
        >
          Controlled
        </button>
        <button
          onClick={() => {
            setMode("dismissible");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "dismissible"
              ? "bg-black text-white"
              : "bg-white text-black border border-black"
          }`}
        >
          Dismissible
        </button>
        <button
          onClick={() => {
            setMode("turnstile");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "turnstile"
              ? "bg-black text-white"
              : "bg-white text-black border border-black"
          }`}
        >
          Turnstile
        </button>
        <button
          onClick={() => {
            setMode("managed-success");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "managed-success"
              ? "bg-green-600 text-white"
              : "bg-white text-green-600 border border-green-600"
          }`}
        >
          Managed ✓
        </button>
        <button
          onClick={() => {
            setMode("managed-error");
            setIsVisible(true);
            setIsSuccess(false);
            setError(null);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "managed-error"
              ? "bg-red-600 text-white"
              : "bg-white text-red-600 border border-red-600"
          }`}
        >
          Managed ✗
        </button>
      </div>

      {/* Mode Description */}
      <div className="mb-6 text-center max-w-md">
        {mode === "uncontrolled" && (
          <p className="text-sm text-gray-600">
            <strong>Uncontrolled Mode:</strong> Component handles all state
            internally. Just provide an{" "}
            <code className="bg-gray-200 px-1 rounded">actionUrl</code>{" "}
            (optional).
          </p>
        )}
        {mode === "controlled" && (
          <p className="text-sm text-gray-600">
            <strong>Controlled Mode:</strong> You control{" "}
            <code className="bg-gray-200 px-1 rounded">isSubmitting</code> and{" "}
            <code className="bg-gray-200 px-1 rounded">isSuccess</code>. Handle
            the API call yourself.
          </p>
        )}
        {mode === "dismissible" && (
          <p className="text-sm text-gray-600">
            <strong>Dismissible Mode:</strong> Shows X icon, closes on click
            outside or Escape key. Try clicking outside the card!
          </p>
        )}
        {mode === "turnstile" && (
          <p className="text-sm text-gray-600">
            <strong>Turnstile (Visible):</strong> Shows visible checkbox. User
            must interact to verify. Token included as{" "}
            <code className="bg-gray-200 px-1 rounded">
              cf-turnstile-response
            </code>
            .
          </p>
        )}
        {mode === "managed-success" && (
          <p className="text-sm text-gray-600">
            <strong>Managed (Success):</strong> Invisible Turnstile. Simulates
            successful backend verification → goes to success screen.
          </p>
        )}
        {mode === "managed-error" && (
          <p className="text-sm text-gray-600">
            <strong>Managed (Error):</strong> Invisible Turnstile. Simulates
            failed backend verification → shows{" "}
            <code className="bg-gray-200 px-1 rounded">error</code> prop, stays
            on form.
          </p>
        )}
      </div>

      {/* Show Modal Button (when hidden) */}
      {!isVisible && (
        <button
          onClick={handleShowModal}
          className="mb-6 px-6 py-3 bg-black text-white rounded-full font-medium"
        >
          Show Modal Again
        </button>
      )}

      {/* Waitlist Card - Uncontrolled */}
      {mode === "uncontrolled" && isVisible && (
        <WaitlistCard
          title="Join the Waitlist"
          subtitle="Be the first to know when we launch. Enter your details below."
          onDone={handleUncontrolledDone}
        />
      )}

      {/* Waitlist Card - Controlled */}
      {mode === "controlled" && isVisible && (
        <WaitlistCard
          title="Early Access Program"
          subtitle="Get exclusive early access to our platform. Limited spots available!"
          successTitle="Welcome aboard!"
          successMessage="You've secured your spot. We'll reach out soon with next steps."
          onSubmit={handleControlledSubmit}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          error={error}
          onDone={handleControlledDone}
        />
      )}

      {/* Waitlist Card - Dismissible */}
      {mode === "dismissible" && isVisible && (
        <WaitlistCard
          title="Join Our Beta"
          subtitle="Help us shape the future of the product. Your feedback matters!"
          dismissible={true}
          onClose={handleClose}
          onDone={() => {
            console.log("Done!");
            setIsVisible(false);
          }}
        />
      )}

      {/* Waitlist Card - Turnstile (Visible) */}
      {mode === "turnstile" && isVisible && (
        <WaitlistCard
          title="Secure Waitlist"
          subtitle="Join our waitlist with Cloudflare Turnstile verification for spam protection."
          successTitle="Verified & Added!"
          successMessage="You've been securely added to our waitlist."
          // Test sitekey (forces interactive checkbox): 3x00000000000000000000FF
          turnstileSiteKey="3x00000000000000000000FF"
          turnstileTheme="light"
          turnstileSize="normal"
          onSubmit={handleTurnstileSubmit}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          error={error}
          onDone={handleControlledDone}
        />
      )}

      {/* Waitlist Card - Managed SUCCESS */}
      {mode === "managed-success" && isVisible && (
        <WaitlistCard
          title="Join the Waitlist"
          subtitle="Be the first to know when we launch. Enter your details below."
          successTitle="You're on the list!"
          successMessage="Thank you for joining. We'll notify you when we launch."
          // Test sitekey (always passes, invisible): 1x00000000000000000000AA
          turnstileSiteKey="1x00000000000000000000AA"
          turnstileManaged={true}
          onSubmit={handleManagedSuccess}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          error={error}
          onDone={handleControlledDone}
        />
      )}

      {/* Waitlist Card - Managed ERROR */}
      {mode === "managed-error" && isVisible && (
        <WaitlistCard
          title="Join the Waitlist"
          subtitle="Be the first to know when we launch. Enter your details below."
          successTitle="You're on the list!"
          successMessage="Thank you for joining. We'll notify you when we launch."
          // Test sitekey (always passes, invisible): 1x00000000000000000000AA
          turnstileSiteKey="1x00000000000000000000AA"
          turnstileManaged={true}
          onSubmit={handleManagedError}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          error={error}
          onDone={handleControlledDone}
        />
      )}

      {/* Console hint */}
      <p className="mt-8 text-xs text-gray-400">
        Check the browser console to see callback logs (including Turnstile
        token)
      </p>
    </div>
  );
};
