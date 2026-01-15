/**
 * godgpt-web-waitlist
 * A configurable waitlist modal component with Mailchimp and Cloudflare Turnstile support
 */

// Main component
export { WaitlistCard, WaitlistCard as WaitlistModal } from "./components/WaitlistModal";

// Types
export type {
  WaitlistCardProps,
  WaitlistFormData,
} from "./components/WaitlistModal";

// Sub-components (for advanced usage)
export { Button } from "./components/Button";
export { Input } from "./components/Input";
export { Toast } from "./components/Toast";


