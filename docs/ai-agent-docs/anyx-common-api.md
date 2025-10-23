---
name: anyx-common-api
agent: openhands
triggers:
  - anyx
  - api
  - llm
  - image
  - email
  - sms
  - common-api
---

# Anyx Common API SDK

Your project includes the **Anyx Common API** for server-side capabilities: LLM, image generation, email, and SMS. Access is tier-gated, usage is logged, and credits are managed automatically.

## Quick Reference

**SDK Location**: `src/sdk/anyx.ts` (exported via `src/sdk/index.ts`)

**Methods:**
- `llm({ model, messages })` - Chat completions
- `image({ prompt, size? })` - Image generation
- `email({ to, subject, html })` - Email sending
- `sms({ to, body })` - SMS sending

**Environment Variables** (auto-configured):
```env
VITE_ANYX_COMMON_API_KEY=<auto-filled>
VITE_ANYX_SERVER_URL=<auto-filled from NEXT_PUBLIC_API_URL>
VITE_ANYX_PROJECT_ID=<auto-filled project id>
```

## API Endpoints (Server-Side)

All requests go through your backend, which attaches API keys:

- `POST /api/common/llm` - LLM completions
- `POST /api/common/image` - Image generation
- `POST /api/common/email` - Email sending
- `POST /api/common/sms` - SMS sending

## Tier Rules & Credits

### AI Credits (LLM & Image)

**Models by Tier:**
- **free**: `gpt-4.1-nano`
- **starter**: + `gpt-4o-mini`
- **builder**: + `gpt-5-mini`
- **pro/elite**: + `gpt-5`

**Image Generation:**
- Only available for: `builder`, `pro`, `elite`

**Costs:**
- LLM call = **1 aiCredit**
- Image generation = **3 aiCredits**

### Integration Credits (Email & SMS)

- Email = **1 integrationCredit**
- SMS = **1 integrationCredit**

Credits are evaluated within the active subscription period (`subscriptions.current_period_start/end`).

## Usage Examples

### Basic Setup

```typescript
import { createAnyxClient } from '@/sdk'

// Uses environment variables (VITE_ANYX_SERVER_URL, VITE_ANYX_PROJECT_ID)
const anyx = createAnyxClient()

// Or override manually:
const anyx = createAnyxClient({
  baseUrl: 'https://anyx.app',
  projectId: 'your-project-id'
})
```

### LLM Completions

```typescript
import { createAnyxClient } from '@/sdk'

const anyx = createAnyxClient()

// Simple completion (defaults to gpt-4.1-nano)
const response = await anyx.llm({
  prompt: 'Write a tagline for a fitness app'
})

console.log(response.text)  // API returns { success, model, text, requestId }

// Specify model (check tier limits)
const response = await anyx.llm({
  model: 'gpt-4o-mini',  // Requires starter tier or higher
  prompt: 'Explain React hooks'
})

console.log(response.text)  // Access .text property for AI response
```

### Image Generation

```typescript
import { createAnyxClient, TierError } from '@/sdk'

const anyx = createAnyxClient()

try {
  const image = await anyx.image({
    prompt: 'A modern logo with blue gradient',
    size: '1024x1024'  // Options: 1024x1024, 1024x1536, 1536x1024, auto
  })
  
  console.log('Image URL:', image.url)
  console.log('Revised prompt:', image.revised_prompt)
  
} catch (error) {
  if (error instanceof TierError) {
    // User's tier doesn't allow image generation
    console.error('Upgrade to builder tier to generate images')
    // Show upgrade CTA in UI
  }
}
```

**Allowed Image Sizes:**
- `1024x1024` (square)
- `1024x1536` (portrait)
- `1536x1024` (landscape)
- `auto` (let AI decide)

Backend returns `400` with allowed list if invalid size provided.

### Email Sending

```typescript
import { createAnyxClient, CreditExceededError } from '@/sdk'

const anyx = createAnyxClient()

try {
  const result = await anyx.email({
    to: 'user@example.com',
    subject: 'Welcome to Our App!',
    html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>'
  })
  
  console.log('Email sent:', result.messageId)
  
} catch (error) {
  if (error instanceof CreditExceededError) {
    // User exceeded integration credits
    console.error('Out of email credits')
    // Show "Upgrade plan" message
  }
}
```

### SMS Sending

```typescript
import { createAnyxClient, CreditExceededError } from '@/sdk'

const anyx = createAnyxClient()

try {
  const result = await anyx.sms({
    to: '+15555550123',  // E.164 format
    body: 'Your verification code is 123456'
  })
  
  console.log('SMS sent:', result.messageId)
  
} catch (error) {
  if (error instanceof CreditExceededError) {
    console.error('Out of SMS credits')
  }
}
```

## Error Handling

The SDK includes typed error classes:

```typescript
import { 
  createAnyxClient, 
  AuthError,           // 401 - Authentication failed
  TierError,           // 403 - Tier doesn't allow this feature
  CreditExceededError, // 402 - Out of credits
  RateLimitedError,    // 429 - Too many requests
  ProviderError,       // 5xx - Provider (OpenAI, Resend, Twilio) error
  HttpError            // Other HTTP errors
} from '@/sdk'

const anyx = createAnyxClient()

try {
  const response = await anyx.llm({ prompt: 'Your question here' })
  console.log(response.text)  // Access .text for AI response
} catch (error) {
  if (error instanceof AuthError) {
    console.error('API key invalid')
  } else if (error instanceof TierError) {
    console.error('Upgrade tier for this feature:', error.message)
    // Show upgrade CTA
  } else if (error instanceof CreditExceededError) {
    console.error('Out of credits:', error.message)
    // Show "Upgrade plan" or "Wait for next period"
  } else if (error instanceof RateLimitedError) {
    console.error('Rate limited, try again later')
    // Show retry button
  } else if (error instanceof ProviderError) {
    console.error('Provider error:', error.message)
    // Show generic error, log for debugging
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Response Validation

All responses are validated with Zod schemas. TypeScript types are automatically inferred:

```typescript
// LLM response type
const response = await anyx.llm({ prompt: '...' })
// response.text is string
// response.model is string
// response.success is boolean
// response.requestId is string

// Image response type
const image = await anyx.image({ prompt: '...' })
// image.url is string, image.revised_prompt is string

// Email response type
const email = await anyx.email({ to: '...', subject: '...', html: '...' })
// email.messageId is string

// SMS response type  
const sms = await anyx.sms({ to: '...', body: '...' })
// sms.messageId is string
```

## MANDATORY: Implement at Least One LLM Feature

**You MUST ship at least one creative feature powered by the LLM endpoint.** Aim for visible "wow" value with fast UX.

### Example Ideas

1. **AI Content Assistant**
   - Input: Brief description
   - Output: Polished section with preview
   - Example: "fitness app benefits" → formatted hero + 3 benefits + CTA

2. **Smart Copy Generator**
   - Input: App name + category
   - Output: Tagline + value props + call-to-action
   - One-click insert into page

3. **Prompt-to-Component**
   - Input: "card list with user profiles"
   - Output: Styled component respecting brand colors
   - Immediate preview

4. **Domain Helper**
   - Input: User requirements (meal plan, trip itinerary, checklist)
   - Output: Clean UI with edit/apply actions
   - Example: "5-day workout plan" → formatted schedule

### Implementation Requirements

✅ **Must have:**
- Use SDK: `anyx.llm({ messages })`
- Handle errors gracefully (TierError, CreditExceededError)
- Loading state while generating
- Error toasts for failures
- Responsive design

✅ **Should have:**
- Help tooltip explaining tier limits
- Upgrade CTA when TierError occurs
- Log requests/results (use project logger)
- Accessible UI (keyboard navigation, screen readers)

✅ **Example Implementation:**

```typescript
import { useState } from 'react'
import { createAnyxClient, TierError, CreditExceededError } from '@/sdk'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  
  const anyx = createAnyxClient()
  
  const generate = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const response = await anyx.llm({
        model: 'gpt-4.1-nano',
        prompt: `Create a hero section for: ${prompt}`
      })
      
      setResult(response.text)  // ✅ Access .text property
      toast.success('Content generated!')
      
    } catch (error) {
      if (error instanceof TierError) {
        toast.error('Upgrade to access this AI model')
        // Show upgrade modal
      } else if (error instanceof CreditExceededError) {
        toast.error('Out of AI credits. Upgrade or wait for next period.')
      } else {
        toast.error('Failed to generate content')
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe what you want to create..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
      />
      
      <Button onClick={generate} disabled={loading || !prompt.trim()}>
        {loading ? 'Generating...' : 'Generate Content'}
      </Button>
      
      {result && (
        <div className="p-4 bg-muted rounded-lg">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
```

## Best Practices

- **Performance**: Cache responses, debounce input, show loading states immediately
- **UX**: Clear error messages ("Upgrade to builder" vs generic), graceful degradation, progress indicators
- **Security**: Never expose API keys (SDK handles it), validate input, rate limit UI
- **Cost**: Cache common prompts, use appropriate models, batch requests, include few-shot examples

## Common Issues

- **AuthError (401)**: Check env vars, verify backend attaches `x-api-key`
- **TierError (403)**: User's tier doesn't allow feature → show upgrade CTA
- **CreditExceededError (402)**: Out of credits → show upgrade or wait message
- **RateLimitedError (429)**: Too many requests → implement backoff, show countdown
- **Image fails**: Verify tier (builder+), check size (1024x1024/1024x1536/1536x1024/auto)

