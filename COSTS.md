# Costs

This is a rough estimate of the costs to run the project.


## Cloud providers

Most of them are not issue for the free tier. Just Convex, be aware of database bandwidth as it can skyrocket real quick.

## Apify

Well here is the most expensive part. The actors I use

- https://console.apify.com/actors/hKByXkMQaC5Qt9UMN/input
- https://console.apify.com/actors/hMvNSpz3JnHgl5jkh/input

I use both actors to fetch jobs, and I use the minimal amount of scraping and both costs around.

- Linked ~$0.10
- Indeed ~$0.25

Total is $0.35 per single job crawling.

## AI

If you keep it on gpt-4o-mini, it's so cheap and can costs between ~$0.0001 in the single job search.

But for gpt-4o, it's around ~$0.08, so yeah it can spike too real quick.

# Pro tier pricing?

The pro tier in qaddam is $4 a month with allowance of 35 job searchs. With a hard limit of 5 per day and 2 schedule scraps per week.

There is no real-time job fetching it take a lot of time to fetch needed jobs so it's asynced when a user start a Workflow we schedule it to run async and we fetch jobs based on the user survey.

## Total cost per month

35 job searches = 35 * ~$0.08 = ~$2.8 (gpt-4o)
Total schedule scraps based on 2 per week is = (2 * 4) * ~$0.35 = ~$2.8 (apify)

total = ~$5.6

Revnue = $4 - $5.6 = -$1.6 (if you are lucky)

So if someone really uses all credits, it's not profitable. You can pitch it and say pre-revenue :P
