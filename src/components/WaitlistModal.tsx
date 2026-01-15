import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Toast } from "./Toast";

// Extend Window interface for Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
          action?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Form data structure matching Mailchimp field names
 * - EMAIL: Email address
 * - FNAME: First name
 * - LNAME: Last name
 * - cf-turnstile-response: Cloudflare Turnstile token (if enabled)
 * - [honeypotFieldName]: Honeypot field value (if enabled)
 */
export interface WaitlistFormData {
  EMAIL: string;
  FNAME: string;
  LNAME: string;
  "cf-turnstile-response"?: string;
  [key: string]: string | undefined; // Allow dynamic honeypot field name
}

export interface WaitlistCardProps {
  // Content customization
  title?: string;
  subtitle?: string;
  successTitle?: string;
  successMessage?: string;

  // ─────────────────────────────────────────
  // UNCONTROLLED MODE (just actionUrl)
  // ─────────────────────────────────────────
  actionUrl?: string;

  // ─────────────────────────────────────────
  // CONTROLLED MODE
  // ─────────────────────────────────────────
  onSubmit?: (data: WaitlistFormData) => void;
  isSuccess?: boolean;
  isSubmitting?: boolean;
  error?: string | null; // When set, displays error message in form

  // Mailchimp specific
  tags?: string; // Hidden tag value (e.g., "11843736")

  // ─────────────────────────────────────────
  // Honeypot (Alternative to Turnstile)
  // ─────────────────────────────────────────
  honeypotFieldName?: string; // If provided, adds a honeypot field for spam protection

  // ─────────────────────────────────────────
  // Cloudflare Turnstile
  // ─────────────────────────────────────────
  turnstileSiteKey?: string; // If provided, enables Turnstile verification
  turnstileTheme?: "light" | "dark" | "auto";
  turnstileSize?: "normal" | "compact";
  turnstileAction?: string; // Optional action name for analytics
  turnstileManaged?: boolean; // If true, hides widget (for managed/invisible mode)

  // Modal behavior
  dismissible?: boolean;

  // Callbacks
  onDone?: () => void;
  onClose?: () => void;
}

export const WaitlistCard: React.FC<WaitlistCardProps> = ({
  // Content props with defaults
  title = "Join the Waitlist",
  subtitle = "Be the first to know when we launch. Enter your details below to join our waitlist.",
  successTitle = "You're on the list!",
  successMessage = "Thank you for joining our waitlist. We'll notify you as soon as we launch.",

  // Uncontrolled mode
  actionUrl,

  // Controlled mode
  onSubmit,
  isSuccess: controlledIsSuccess,
  isSubmitting: controlledIsSubmitting,
  error: controlledError,

  // Mailchimp specific
  tags,

  // Honeypot
  honeypotFieldName,

  // Cloudflare Turnstile
  turnstileSiteKey,
  turnstileTheme = "auto",
  turnstileSize = "normal",
  turnstileAction,
  turnstileManaged = false,

  // Modal behavior
  dismissible = false,

  // Callbacks
  onDone,
  onClose,
}) => {
  // Determine if we're in controlled mode
  const isControlled =
    onSubmit !== undefined && controlledIsSuccess !== undefined;

  // Internal state (used in uncontrolled mode)
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [internalIsSuccess, setInternalIsSuccess] = useState(false);

  // Form state using Mailchimp field names
  const [FNAME, setFNAME] = useState("");
  const [LNAME, setLNAME] = useState("");
  const [EMAIL, setEMAIL] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<{
    FNAME?: string;
    LNAME?: string;
    EMAIL?: string;
    turnstile?: string;
  }>({});

  // Honeypot state
  const [honeypotValue, setHoneypotValue] = useState("");

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Ref for click outside detection
  const cardRef = useRef<HTMLDivElement>(null);

  // Derive actual state based on mode
  const isSubmitting = isControlled
    ? controlledIsSubmitting ?? false
    : internalIsSubmitting;
  const isSuccess = isControlled ? controlledIsSuccess : internalIsSuccess;

  // Turnstile callback handlers
  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setErrors((prev) => ({ ...prev, turnstile: undefined }));
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
    setErrors((prev) => ({
      ...prev,
      turnstile: "Verification failed. Please try again.",
    }));
  }, []);

  const handleTurnstileExpired = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  // Initialize Turnstile widget
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileContainerRef.current) return;

    // Prevent duplicate widgets
    if (turnstileWidgetIdRef.current) return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    // Wait for Turnstile script to load
    const initTurnstile = () => {
      if (
        window.turnstile &&
        turnstileContainerRef.current &&
        !turnstileWidgetIdRef.current
      ) {
        // Clear any existing content to prevent duplicates
        turnstileContainerRef.current.innerHTML = "";

        const widgetId = window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: turnstileSiteKey,
            callback: handleTurnstileSuccess,
            "error-callback": handleTurnstileError,
            "expired-callback": handleTurnstileExpired,
            theme: turnstileTheme,
            size: turnstileSize,
            ...(turnstileAction && { action: turnstileAction }),
          }
        );
        turnstileWidgetIdRef.current = widgetId;
      }
    };

    // Check if Turnstile is already loaded
    if (window.turnstile) {
      initTurnstile();
    } else {
      // Wait for script to load
      checkInterval = setInterval(() => {
        if (window.turnstile) {
          if (checkInterval) clearInterval(checkInterval);
          initTurnstile();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      timeout = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 10000);
    }

    // Cleanup widget on unmount
    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeout) clearTimeout(timeout);
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [
    turnstileSiteKey,
    turnstileTheme,
    turnstileSize,
    turnstileAction,
    handleTurnstileSuccess,
    handleTurnstileError,
    handleTurnstileExpired,
  ]);

  // Handle click outside
  useEffect(() => {
    if (!dismissible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [dismissible, onClose]);

  const validateForm = () => {
    // Honeypot check: if field is filled, it's a bot - silently reject
    if (honeypotFieldName && honeypotValue.trim()) {
      return false; // Silently reject bots
    }

    const newErrors: typeof errors = {};

    if (!FNAME.trim()) {
      newErrors.FNAME = "First name is required";
    }

    if (!LNAME.trim()) {
      newErrors.LNAME = "Last name is required";
    }

    if (!EMAIL.trim()) {
      newErrors.EMAIL = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL)) {
      newErrors.EMAIL = "Please enter a valid email address";
    }

    // Validate Turnstile if enabled (skip validation in managed mode - token comes automatically)
    if (turnstileSiteKey && !turnstileToken && !turnstileManaged) {
      newErrors.turnstile = "Please complete the verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetTurnstile = () => {
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
      setTurnstileToken(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData: WaitlistFormData = {
      EMAIL,
      FNAME,
      LNAME,
      ...(turnstileToken && { "cf-turnstile-response": turnstileToken }),
      ...(honeypotFieldName && { [honeypotFieldName]: honeypotValue }),
    };

    if (isControlled) {
      // Controlled mode: just call onSubmit, consumer handles everything
      onSubmit?.(formData);
    } else {
      // Uncontrolled mode: handle submission internally
      setInternalIsSubmitting(true);

      try {
        if (actionUrl) {
          // Build form data for submission
          const submitData: Record<string, string> = {
            EMAIL,
            FNAME,
            LNAME,
          };

          // Add tags if provided
          if (tags) {
            submitData.tags = tags;
          }

          // Add Turnstile token if available
          if (turnstileToken) {
            submitData["cf-turnstile-response"] = turnstileToken;
          }

          // Add honeypot field if enabled
          if (honeypotFieldName) {
            submitData[honeypotFieldName] = honeypotValue;
          }

          const response = await fetch(actionUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submitData),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          // Simulate API call delay if no actionUrl
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        setInternalIsSuccess(true);
        setShowToast(true);
      } catch (error) {
        console.error("Error submitting waitlist:", error);
        // Reset Turnstile on error so user can try again
        resetTurnstile();
      } finally {
        setInternalIsSubmitting(false);
      }
    }
  };

  const handleDone = () => {
    if (!isSubmitting) {
      // Reset form
      setFNAME("");
      setLNAME("");
      setEMAIL("");
      setHoneypotValue("");
      setErrors({});
      resetTurnstile();

      if (!isControlled) {
        setInternalIsSuccess(false);
      }

      onDone?.();
    }
  };

  const handleClose = () => {
    onClose?.();
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
      <div
        ref={cardRef}
        className="bg-white rounded-2xl w-full max-w-md p-6 md:p-8 shadow-card border border-gray-200 relative"
        style={{ borderColor: "var(--color-black)" }}
      >
        {/* Close button (X icon) - shown when dismissible */}
        {dismissible && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {!isSuccess ? (
          <>
            {/* Title */}
            <h2 className="text-2xl font-semibold text-black mb-3">{title}</h2>

            {/* Body */}
            <p className="text-base text-gray-600 mb-6">{subtitle}</p>

            {/* Form - IDs and names match Mailchimp embed */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
            >
              {/* Email field - Mailchimp expects EMAIL first in their schema */}
              <Input
                label="Email Address"
                type="email"
                id="mce-EMAIL"
                name="EMAIL"
                value={EMAIL}
                onChange={(e) => {
                  setEMAIL(e.target.value);
                  if (errors.EMAIL) {
                    setErrors((prev) => ({ ...prev, EMAIL: undefined }));
                  }
                }}
                placeholder="Enter your email address"
                required
                error={errors.EMAIL}
                autoComplete="email"
              />

              {/* First Name field */}
              <Input
                label="First Name"
                type="text"
                id="mce-FNAME"
                name="FNAME"
                value={FNAME}
                onChange={(e) => {
                  setFNAME(e.target.value);
                  if (errors.FNAME) {
                    setErrors((prev) => ({ ...prev, FNAME: undefined }));
                  }
                }}
                placeholder="Enter your first name"
                required
                error={errors.FNAME}
                autoComplete="given-name"
              />

              {/* Last Name field */}
              <Input
                label="Last Name"
                type="text"
                id="mce-LNAME"
                name="LNAME"
                value={LNAME}
                onChange={(e) => {
                  setLNAME(e.target.value);
                  if (errors.LNAME) {
                    setErrors((prev) => ({ ...prev, LNAME: undefined }));
                  }
                }}
                placeholder="Enter your last name"
                required
                error={errors.LNAME}
                autoComplete="family-name"
              />

              {/* Hidden tags field (if provided) */}
              {tags && <input type="hidden" name="tags" value={tags} />}

              {/* Honeypot field (spam protection) */}
              {honeypotFieldName && (
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-5000px",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <input
                    type="text"
                    name={honeypotFieldName}
                    value={honeypotValue}
                    onChange={(e) => setHoneypotValue(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-label=""
                  />
                </div>
              )}

              {/* Cloudflare Turnstile Widget */}
              {turnstileSiteKey && (
                <div className={turnstileManaged ? "sr-only" : "pt-2"}>
                  <div
                    ref={turnstileContainerRef}
                    className="cf-turnstile flex justify-center"
                  />
                  {!turnstileManaged && errors.turnstile && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {errors.turnstile}
                    </p>
                  )}
                </div>
              )}

              {/* Response containers (matching Mailchimp) */}
              <div id="mce-responses" className="hidden">
                <div id="mce-error-response" style={{ display: "none" }}></div>
                <div
                  id="mce-success-response"
                  style={{ display: "none" }}
                ></div>
              </div>

              {/* Controlled mode error display */}
              {controlledError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">
                    {controlledError}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  id="mc-embedded-subscribe"
                  name="subscribe"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={
                    isSubmitting ||
                    (!!turnstileSiteKey && !turnstileToken && !turnstileManaged)
                  }
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Join Waitlist"}
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
              {successTitle}
            </h2>

            {/* Success Message */}
            <p className="text-base text-gray-600 mb-6">{successMessage}</p>

            {/* Done Button */}
            <Button onClick={handleDone} variant="primary" className="w-full">
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
