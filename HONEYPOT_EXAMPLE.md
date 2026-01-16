# Simple Honeypot Implementation Example

This guide shows how to use the honeypot feature for spam protection without Cloudflare Turnstile.

## What is a Honeypot?

A honeypot is a hidden form field that:
- **Humans can't see** (hidden with CSS)
- **Bots typically fill** (they auto-fill all fields)
- **Silently rejects bots** (if filled, it's a bot)

## Simple Example

### 1. Basic Usage (Uncontrolled Mode)

```tsx
import { WaitlistCard } from "godgpt-web-waitlist";

function App() {
  return (
    <WaitlistCard
      title="Join the Waitlist"
      subtitle="Be the first to know when we launch."
      honeypotFieldName="b_eecb4f508c0388d7720a99c82_0ad1109319"
      actionUrl="https://your-api.com/subscribe"
      onDone={() => console.log("Success!")}
    />
  );
}
```

### 2. Controlled Mode with Bot Detection

```tsx
import { useState } from "react";
import { WaitlistCard, WaitlistFormData } from "godgpt-web-waitlist";

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Your honeypot field name (from Mailchimp or custom)
  const honeypotFieldName = "b_eecb4f508c0388d7720a99c82_0ad1109319";

  const handleSubmit = async (data: WaitlistFormData) => {
    // Check if honeypot field is filled
    const honeypotValue = data[honeypotFieldName];

    // If honeypot is filled, it's a bot - silently reject
    if (honeypotValue && honeypotValue.trim()) {
      console.log("Bot detected - honeypot was filled");
      return; // Don't process, don't show error
    }

    // Legitimate user - process submission
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
      subtitle="Enter your details below."
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

### 3. Backend Verification (Cloudflare Pages Function)

```typescript
// functions/api/subscribe.ts
export async function onRequestPost({ request }) {
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
  // ... your subscription logic here ...

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
```

## How It Works

1. **Hidden Field**: The honeypot field is rendered but hidden with CSS (`position: absolute; left: -5000px`)
2. **Human Users**: Don't see the field, so they leave it empty ✅
3. **Bots**: Auto-fill all fields, including hidden ones ❌
4. **Detection**: If the field has a value, it's a bot
5. **Silent Rejection**: Don't show an error - just don't process the submission

## Getting Your Honeypot Field Name

### From Mailchimp:
1. Go to your Mailchimp form embed code
2. Look for a field with `name="b_..."` (usually starts with `b_`)
3. Use that as your `honeypotFieldName`

### Custom Field:
You can use any field name you want, e.g.:
- `"mobile"` 
- `"website"`
- `"phone_number"`

Just make sure your backend checks for the same field name!

## Complete Example

```tsx
import { useState } from "react";
import { WaitlistCard, WaitlistFormData } from "godgpt-web-waitlist";

export default function WaitlistPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: WaitlistFormData) => {
    const honeypotField = "b_eecb4f508c0388d7720a99c82_0ad1109319";
    const honeypotValue = data[honeypotField];

    // Bot check
    if (honeypotValue?.trim()) {
      console.log("Bot detected!");
      return; // Silent rejection
    }

    // Process legitimate submission
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
          [honeypotField]: honeypotValue || "",
        }),
      });

      if (!response.ok) throw new Error("Failed");
      setIsSuccess(true);
    } catch {
      setError("Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WaitlistCard
      title="Join the Waitlist"
      subtitle="Get early access to our product."
      honeypotFieldName="b_eecb4f508c0388d7720a99c82_0ad1109319"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSuccess={isSuccess}
      error={error}
      onDone={() => setIsSuccess(false)}
    />
  );
}
```

## Tips

- ✅ **Always verify on backend** - Frontend checks can be bypassed
- ✅ **Use a realistic field name** - Makes it less obvious to bots
- ✅ **Silent rejection** - Don't tell bots they were caught
- ✅ **Log bot attempts** - Useful for monitoring spam
- ❌ **Don't show errors** - Reveals the honeypot to bots
- ❌ **Don't use obvious names** - Like "honeypot" or "spam_check"

