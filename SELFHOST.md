# Self host guides
Qaddam is designed to be self-hosted. And is adviced to be self-hosted. But of course it needed a bit of a setup.

# How to self host

## Requirements
- [Apify Account](https://console.apify.com/)
- [Vercel Account](https://vercel.com/)
- [Convex Account](https://www.convex.dev/) 
- [Google Oauth from Google Cloud Console](https://console.cloud.google.com/auth/clients/)
- [Platform OpenAI Account](https://platform.openai.com/settings/organization/api-keys)
- [Polar Account](https://dashboard.polar.sh/) (optional for payments)
- [Axiom Account](https://console.axiom.co/) (optional for logs)
- [Posthog Account](https://posthog.com/) (optional for analytics)

## Needed environment variables for backend
```bash
# Environment Variables

APIFY_API_KEY=your_apify_api_key_here # required

AUTH_GOOGLE_ID=your_google_auth_id_here #required
AUTH_GOOGLE_SECRET=your_google_auth_secret_here #required

JWKS=your_jwks_here #required, but get auto set by convex
JWT_PRIVATE_KEY=your_jwt_private_key_here #required, but get auto set by convex

OPENAI_API_KEY=your_openai_api_key_here #required.. it's the whole point lol :P

SITE_URL=https://your-site-url.com #required your nextjs url


AXIOM_DATASET=your_axiom_dataset_here #optional
AXIOM_TOKEN=your_axiom_token_here #optional

POLAR_ORGANIZATION_TOKEN=your_polar_org_token_here #optional
POLAR_PRODUCT=your_polar_product_here #optional
POLAR_SERVER=your_polar_server_here #optional
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here #optional
```

## Needed environment variables for frontend
```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here #required your convex url

NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here #optional
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host_here #optional

NEXT_PUBLIC_AXIOM_TOKEN=your_axiom_token_here #optional
NEXT_PUBLIC_AXIOM_DATASET=your_axiom_dataset_here #optional
```

# How to setup the cloud?

## Setting up apify 
- Go to https://console.apify.com/
- Create a new user
- Get your api key from [here](https://console.apify.com/settings/integrations)
- Setup your api keys in .env in Convex cloud under `APIFY_API_KEY`
- These are already hardcoded in the code:
    - https://console.apify.com/actors/hKByXkMQaC5Qt9UMN
    - https://console.apify.com/actors/hMvNSpz3JnHgl5jkh

There is nothing todo in code unless you want to change the actor.

## Setting up Convex
Just type `bun dev:setup` in the root of the project. It will take care of the rest.

## Setting up Vercel
There is nothing special here too. Just note that this is monorepo that uses `Turbo`, you can link it to your vercel account for fast deployments.
Type `bun turbo link` to link the project build caches to your vercel account.

## Setting up Google Oauth
Google Oauth is the only method used for authentication. Follow Convex [guide](https://labs.convex.dev/auth/config/oauth/google) to setup the oauth.

## Setting up OpenAI
- Go to [OpenAI Platform](https://platform.openai.com/settings/organization/api-keys)
- Click `Create new secret key`
- Copy the key and add it to your .env in Convex cloud under `OPENAI_API_KEY`


# Optional setup | You can partially skip these

## Setting up Polar
### Init
- Go to [Polar Dashboard](https://dashboard.polar.sh/)
- Create new organization

### Token
- Go to [Polar Settings](https://polar.sh/dashboard/qaddam/settings)
- Scroll down to bottom under `Developer`
- Click `New Token`
- Follow permissions mentioned in the [convex polar guide](https://www.convex.dev/components/polar)
- Copy the organization token and add it to your .env in Convex cloud under `POLAR_ORGANIZATION_TOKEN`

### Webhook
- Go to [Polar Webhooks](https://polar.sh/dashboard/qaddam/settings/webhooks)
- Click `Add Endpoint`
- Follow the guide how to copy convex http action webhook url [convex polar guide](https://www.convex.dev/components/polar)
- Follow permissions mentioned in the [convex polar guide](https://www.convex.dev/components/polar)

## Setting up Axiom
- Go to [Axiom Dashboard](https://app.axiom.co/)
- Go to settings create a new api token and dataset
- Add dataset under `AXIOM_DATASET` and token under `AXIOM_TOKEN` in your .env in Convex cloud