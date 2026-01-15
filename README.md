# godgpt-web-waitlist

A configurable React waitlist modal component with Mailchimp and Cloudflare Turnstile support.

## Features

- 🎨 **Configurable Content** - Customize title, subtitle, and success messages
- 🔄 **Controlled & Uncontrolled Modes** - Use with or without external state management
- 📧 **Mailchimp Compatible** - Form fields match Mailchimp's expected schema
- 🛡️ **Cloudflare Turnstile** - Built-in spam protection with visible or managed modes
- 🍯 **Honeypot Protection** - Alternative spam protection using hidden form fields
- ❌ **Dismissible Modal** - Optional X button and click-outside-to-close
- 📱 **Mobile-First Design** - Optimized for touch interactions
- 🎯 **TypeScript** - Full type definitions included

## Installation

```bash
npm install godgpt-web-waitlist
```

### Peer Dependencies

This package requires React 18+ and Tailwind CSS:

```bash
npm install react react-dom
```

### Tailwind CSS Setup

This component uses Tailwind CSS classes. Make sure Tailwind is configured in your project and add the package to your `content` paths:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/godgpt-web-waitlist/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
};
```

## Quick Start

```tsx
import { WaitlistCard } from "godgpt-web-waitlist";

function App() {
  return (
    <WaitlistCard
      title="Join the Waitlist"
      subtitle="Be the first to know when we launch."
      onDone={() => console.log("Done!")}
    />
  );
}
```

## Usage Modes

### Uncontrolled Mode (Simple)

Let the component manage its own state. Great for quick implementations:

```tsx
<WaitlistCard
  title="Join the Waitlist"
  subtitle="Enter your details below."
  actionUrl="https://your-api.com/subscribe"
  onDone={() => console.log("Success!")}
/>
```

### Controlled Mode (Full Control)

Manage state externally for custom submission logic:

```tsx
import { WaitlistCard, WaitlistFormData } from "godgpt-web-waitlist";

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WaitlistCard
      title="Join the Waitlist"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      error={error}
      onDone={() => setIsSuccess(false)}
    />
  );
}
```

## Cloudflare Turnstile Integration

### Visible Mode (Interactive Checkbox)

```tsx
<WaitlistCard
  title="Secure Waitlist"
  turnstileSiteKey="your-site-key"
  turnstileTheme="light"
  onSubmit={(data) => {
    console.log("Token:", data["cf-turnstile-response"]);
  }}
  isSubmitting={isSubmitting}
  isSuccess={isSuccess}
/>
```

### Managed Mode (Invisible)

For backend-managed Turnstile verification:

```tsx
<WaitlistCard
  title="Join the Waitlist"
  turnstileSiteKey="your-site-key"
  turnstileManaged={true} // Hides the widget
  onSubmit={handleSubmit}
  isSubmitting={isSubmitting}
  isSuccess={isSuccess}
  error={error}
/>
```

### Backend Verification

When using Turnstile, verify the token on your backend:

```typescript
// Example: Cloudflare Pages Function
export async function onRequestPost({ request, env }) {
  const formData = await request.json();

  // Get token and IP
  const token = formData["cf-turnstile-response"];
  const ip = request.headers.get("CF-Connecting-IP");

  // Verify with Cloudflare
  const verifyResponse = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    }
  );

  const result = await verifyResponse.json();

  if (!result.success) {
    return new Response(JSON.stringify({ message: "Verification failed" }), {
      status: 403,
    });
  }

  // Continue with subscription...
}
```

**Note:** Add the Turnstile script to your HTML:

```html
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>
```

## Honeypot Integration

Honeypot is a lightweight spam protection alternative to Turnstile. It uses a hidden form field that bots typically fill but humans won't see.

### Uncontrolled Mode with Honeypot

```tsx
<WaitlistCard
  title="Join the Waitlist"
  subtitle="Enter your details below."
  honeypotFieldName="b_eecb4f508c0388d7720a99c82_0ad1109319" // Your honeypot field name
  actionUrl="https://your-api.com/subscribe"
  onDone={() => console.log("Success!")}
/>
```

### Controlled Mode with Honeypot

```tsx
import { WaitlistCard, WaitlistFormData } from "godgpt-web-waitlist";

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const honeypotFieldName = "b_eecb4f508c0388d7720a99c82_0ad1109319";

  const handleSubmit = async (data: WaitlistFormData) => {
    // Check honeypot field
    const honeypotValue = data[honeypotFieldName];

    // If honeypot is filled, it's a bot - silently reject
    if (honeypotValue && honeypotValue.trim()) {
      console.log("Bot detected - honeypot field was filled");
      return; // Don't process, don't show error
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          EMAIL: data.EMAIL,
          FNAME: data.FNAME,
          LNAME: data.LNAME,
          // Include honeypot value for backend verification
          [honeypotFieldName]: honeypotValue || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WaitlistCard
      title="Join the Waitlist"
      honeypotFieldName={honeypotFieldName}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      error={error}
      onDone={() => setIsSuccess(false)}
    />
  );
}
```

### Backend Verification

Always verify the honeypot on your backend:

```typescript
// Example: Cloudflare Pages Function
export async function onRequestPost({ request, env }) {
  const formData = await request.json();

  const honeypotFieldName = "b_eecb4f508c0388d7720a99c82_0ad1109319";
  const honeypotValue = formData[honeypotFieldName];

  // If honeypot is filled, it's a bot - reject silently
  if (honeypotValue && honeypotValue.trim()) {
    // Return success to bot (don't reveal it's a honeypot)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Process legitimate submission
  const { EMAIL, FNAME, LNAME } = formData;

  // Add to Mailchimp or your database
  // ...

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
```

### How Honeypot Works

1. **Hidden Field**: The honeypot field is visually hidden using CSS (`position: absolute; left: -5000px`)
2. **Bot Detection**: Bots typically fill all form fields, including hidden ones
3. **Silent Rejection**: If the honeypot field is filled, the submission is rejected silently (no error shown)
4. **Backend Check**: Always verify on your backend as well for additional security

**Note:** The honeypot field name should match your Mailchimp embed form or your custom backend field name.

## Props

### Content

| Prop             | Type     | Default                      | Description           |
| ---------------- | -------- | ---------------------------- | --------------------- |
| `title`          | `string` | `"Join the Waitlist"`        | Modal title           |
| `subtitle`       | `string` | `"Be the first to know..."`  | Description text      |
| `successTitle`   | `string` | `"You're on the list!"`      | Success state title   |
| `successMessage` | `string` | `"Thank you for joining..."` | Success state message |

### Uncontrolled Mode

| Prop        | Type     | Description              |
| ----------- | -------- | ------------------------ |
| `actionUrl` | `string` | URL to POST form data to |

### Controlled Mode

| Prop           | Type                               | Description                     |
| -------------- | ---------------------------------- | ------------------------------- |
| `onSubmit`     | `(data: WaitlistFormData) => void` | Called with form data on submit |
| `isSubmitting` | `boolean`                          | Shows loading state             |
| `isSuccess`    | `boolean`                          | Shows success state             |
| `error`        | `string \| null`                   | Error message to display        |

### Mailchimp

| Prop   | Type     | Description                    |
| ------ | -------- | ------------------------------ |
| `tags` | `string` | Hidden tag value for Mailchimp |

### Cloudflare Turnstile

| Prop               | Type                          | Default    | Description                    |
| ------------------ | ----------------------------- | ---------- | ------------------------------ |
| `turnstileSiteKey` | `string`                      | -          | Enables Turnstile verification |
| `turnstileTheme`   | `"light" \| "dark" \| "auto"` | `"auto"`   | Widget theme                   |
| `turnstileSize`    | `"normal" \| "compact"`       | `"normal"` | Widget size                    |
| `turnstileAction`  | `string`                      | -          | Action name for analytics      |
| `turnstileManaged` | `boolean`                     | `false`    | Hide widget (invisible mode)   |

### Honeypot

| Prop                | Type     | Description                                                        |
| ------------------- | -------- | ------------------------------------------------------------------ |
| `honeypotFieldName` | `string` | Name attribute for the honeypot field (e.g., Mailchimp field name) |

### Modal Behavior

| Prop          | Type      | Default | Description                        |
| ------------- | --------- | ------- | ---------------------------------- |
| `dismissible` | `boolean` | `false` | Show X button, allow click-outside |

### Callbacks

| Prop      | Type         | Description                               |
| --------- | ------------ | ----------------------------------------- |
| `onDone`  | `() => void` | Called when user clicks "Done" on success |
| `onClose` | `() => void` | Called when modal is dismissed            |

## Form Data Structure

```typescript
interface WaitlistFormData {
  EMAIL: string;
  FNAME: string;
  LNAME: string;
  "cf-turnstile-response"?: string; // Present if Turnstile enabled
  [key: string]: string | undefined; // Dynamic fields (e.g., honeypot field)
}
```

**Note:** When using honeypot, the field name will be whatever you pass to `honeypotFieldName`. For example, if `honeypotFieldName="b_eecb4f508c0388d7720a99c82_0ad1109319"`, then `data["b_eecb4f508c0388d7720a99c82_0ad1109319"]` will contain the honeypot value.

## Exports

```typescript
// Components
export { WaitlistCard, WaitlistModal } from "godgpt-web-waitlist";

// Types
export type { WaitlistCardProps, WaitlistFormData } from "godgpt-web-waitlist";

// Sub-components (advanced usage)
export { Button, Input, Toast } from "godgpt-web-waitlist";
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build library
npm run build:lib

# Build demo app
npm run build
```

## License

MIT
