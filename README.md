# Model Playground

An animated chat app with a login and a dropdown of 10 OpenAI models (cheapest up to GPT-6 Astra). Shows tokens, cost and time for every reply. Your API key and login stay on the server.

## Run locally

```bash
npm install
# edit .env.local: paste your OPENAI_API_KEY (login is already filled in)
npm run dev
```

Open http://localhost:3000 and sign in.

## Deploy to Vercel

1. Push this folder to a GitHub repo (the `.gitignore` keeps `.env.local` out) or run `npx vercel` here.
2. In Vercel: Add New > Project > import the repo (Next.js is auto-detected).
3. Settings > Environment Variables, add:
   - `OPENAI_API_KEY`
   - `APP_USERNAME`
   - `APP_PASSWORD`
4. Deploy. Visitors must sign in before they can chat.

## Notes

- The login is checked on the server and uses a signed, httpOnly cookie valid for 7 days. Credentials are never in the browser code.
- Do not commit `.env.local` or put the password in the source. Change the password if it was ever shared publicly.
- Edit `lib/models.js` to change the model list or prices. The server only accepts ids in that list.
- Models with `null` prices (GPT-6.1 Terra, GPT-6.1 Sol, GPT-5.4 Nano) show cost as n/a until you fill them in.
- If a model returns "model not found", swap its id for one from https://platform.openai.com/docs/models.
- Astra can take over a minute; the chat route allows up to 300 seconds (Vercel Fluid Compute).
- Animations are plain CSS and switch off automatically for people who enable "reduce motion".
- Set a monthly spend limit in your OpenAI billing settings.
