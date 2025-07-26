# Self host guides
This project is designed to be self-hosted. And is adviced to be self-hosted.

# Requirements
- Apify Account
- Vercel Account
- Convex Account
- Google Oauth from Google Cloud Console 
- Polar Account (optional for payments)
- Axiom Account (optional for logs)
- Posthog Account (optional for analytics)

# Needed environment variables for backend
```.env
# Environment Variables

APIFY_API_KEY=your_apify_api_key_here # required
AUTH_GOOGLE_ID=your_google_auth_id_here #req
AUTH_GOOGLE_SECRET=your_google_auth_secret_here
AXIOM_DATASET=your_axiom_dataset_here
AXIOM_TOKEN=your_axiom_token_here
JWKS=your_jwks_here
JWT_PRIVATE_KEY=your_jwt_private_key_here
OPENAI_API_KEY=your_openai_api_key_here
POLAR_ORGANIZATION_TOKEN=your_polar_org_token_here
POLAR_PRODUCT=your_polar_product_here
POLAR_SERVER=your_polar_server_here
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
SITE_URL=https://your-site-url.com
```

# Needed environment variables for frontend
```.env
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host_here
NEXT_PUBLIC_AXIOM_TOKEN=your_axiom_token_here
NEXT_PUBLIC_AXIOM_DATASET=your_axiom_dataset_here
```