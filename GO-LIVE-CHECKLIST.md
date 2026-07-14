# Unclench — Go-Live Checklist

Everything you need to turn this from a working prototype into a live shop taking real orders. Ordered roughly by sequence. Rough costs and time are UK-oriented, 2026.

---

## What you already have

A complete, responsive, on-brand front-end: homepage, shop, three product pages, the branching consultation engine (with scoring + red-flag routing), a working cart (add / remove / quantity / persistent drawer), and a checkout page. The checkout is **structured for Stripe** — the integration point is stubbed and commented in `assets/store.js` (the `checkout()` function).

What it does **not** yet have: real payment processing, an order database, transactional emails, the impression-kit/scan fulfilment flow, the dentist-review workflow, or any legal/regulatory registration. Those are below.

---

## A. Decision to make first: Stripe-on-your-own-site vs. Shopify

Before you spend on anything else, decide the commerce backbone. This is the single biggest fork.

**Option 1 — Keep this site + Stripe (what's built).** You own the code and the look completely. But *you* are then responsible for: a small backend server, order storage, emails, refunds, subscription logic, tax, and PCI scope. More control, more engineering.

**Option 2 — Shopify (recommended for launch).** Rebuild these pages as a Shopify theme (the design ports directly). Shopify handles payments, orders, shipping, VAT, refunds, and subscriptions out of the box, and the consultation quiz can stay as a custom page that adds the recommended product to the Shopify cart. Far less to build and maintain; ~£25–90/mo plus transaction fees. **For a physical-product DTC brand this is almost certainly the right call** — hand-rolling Stripe only makes sense if you have a developer on hand and a strong reason.

The rest of this checklist covers the **Stripe path** (since that's what's wired). If you choose Shopify, items B, D, and E largely collapse into Shopify's built-in tooling.

---

## B. Payments — connecting Stripe (if staying on this site)

1. **Create a Stripe account** at stripe.com → activate it with your business details (you'll need company registration, bank account, and ID). Approval is usually same-day.
2. **Create Products & Prices** in the Stripe Dashboard — one Price per item. Copy each **Price ID** (`price_...`) into the `priceId` fields in `assets/store.js` → `CATALOGUE`.
   - Mark **Unwind** and **Refresh** as *recurring* prices (they're subscriptions).
3. **Stand up a tiny backend** for one job: creating a Stripe Checkout Session. Cheapest routes:
   - A single **serverless function** (Vercel / Netlify Functions / Cloudflare Workers) — ~20 lines, uses `stripe.checkout.sessions.create()`.
   - Point the commented production block in `checkout()` at that function's URL.
4. **Set up a webhook** (`checkout.session.completed`) so you're notified of paid orders — this is what triggers fulfilment and emails.
5. **Test in test mode** with Stripe's test cards, then flip to live keys.

> Never put your Stripe **secret key** in the front-end. It lives only on the server/serverless function. The publishable key is the only one that touches the browser.

---

## C. Hosting & domain — getting it live on the web

1. **Buy the domain.** Check `unclench.com` / `.co.uk` availability (see the big caveat in section H first). Namecheap, Cloudflare, or Google Domains. ~£8–30/yr.
2. **Host the static site.** These files are plain HTML/CSS/JS, so any of these work and most have free tiers:
   - **Netlify** or **Vercel** — drag-and-drop or connect a GitHub repo; auto-HTTPS; free tier is plenty to start. *(Recommended — they also host the serverless checkout function from section B.)*
   - **Cloudflare Pages** — same idea.
3. **Point the domain** at the host (update DNS / nameservers — the host gives step-by-step).
4. **HTTPS** is automatic on all the above. Confirm the padlock shows.
5. **Set up a professional email** (e.g. hello@unclench.com) — Google Workspace or Fastmail, ~£5/user/mo.

---

## D. Order fulfilment — the physical flow

This is the part software doesn't solve; you need the operational chain in place before launch.

1. **Impression kits.** Source and stock home dental impression kits (or a scan-upload path for those who have STLs). Decide packaging and postage.
2. **Lab relationship.** Contract with a UK dental lab to fabricate the plates from returned impressions/scans. Agree turnaround (you're advertising 10–14 days), per-unit cost, and courier.
3. **Fulfilment trigger.** On a paid order (Stripe webhook), your process should: email the customer, dispatch an impression kit, and open a case record.
4. **Returns handling** for impressions coming back → routed to the lab.
5. **Shipping** of the finished plate to the customer.

---

## E. The software you still need (Stripe path)

- **Order database** — even a simple one (Airtable, or a Supabase/Postgres table) to track each order's stage: paid → kit sent → impressions received → **dentist review** → lab → shipped.
- **Transactional emails** — order confirmation, kit-on-the-way, review-approved, shipped. Use Resend, Postmark, or SendGrid.
- **The dentist-review step** *(critical — see section H)* — a queue where a GDC-registered dentist sees each case (impressions/scan + consultation answers) and approves or flags **before** the lab fabricates. This is both a clinical necessity and your legal basis for the "dentist-reviewed" claim. It can start as simply as a shared dashboard + the order database; it does not need to be fancy, but it must actually happen for every order.
- **Consultation data capture** — right now the quiz runs entirely in the browser and nothing is saved. To use the answers for the dentist review (and for the "apnoea-screen sizes the MAD market" insight), POST the answers to your backend on completion.

---

## F. Analytics & marketing setup

- **Analytics** — Plausible (privacy-friendly, no cookie banner needed) or GA4.
- **Meta Pixel / Google Ads tag** if you'll run paid acquisition (you will) — needed for conversion tracking and retargeting.
- **Email/SMS platform** — Klaviyo is the DTC standard; captures abandoned carts and runs the post-purchase flow.
- **Cookie consent banner** if you use any non-essential cookies (Pixel/GA) — legally required in the UK/EU.

---

## G. Legal & policy pages (the footer links are currently placeholders)

- **Terms & Conditions**, **Privacy Policy**, **Shipping & Returns**, **Cookie Policy** — get these written properly; templates exist but a solicitor review is worth it given the medical angle.
- **Company** — register the entity, show company number and registered address.
- **Returns law** — note that custom-made goods have different distance-selling return rights; your policy must reflect that honestly.

---

## H. Regulatory & professional — do NOT skip these

This is where Unclench differs from an ordinary DTC brand, and where the real risk sits. Handle before launch, ideally with proper advice.

1. **Custom-made medical devices.** The plates are Class I custom-made devices under UK MDR 2002 (as amended). You'll need to be a **registered manufacturer with the MHRA**, hold the required documentation, and issue the custom-made device statement. Every legitimate UK DTC dental-appliance seller does this — it's routine but mandatory.
2. **The named prescriber / dentist review.** A custom-made device needs a prescribing clinician. Your async dentist-review step *is* that — so it has to be genuinely in the flow for every order, not decorative. This also underpins your "dentist-reviewed" advertising claim.
3. **GDC & advertising claims.** "Designed by dental experts" and "dentist-reviewed" are fine **as long as they're true and evidenced** (they are — your and Dr. Greenwall's credentials). Two rules: keep every claim tied to the real credentials, and **do not use the word "specialist"** unless a named dentist is on a relevant GDC specialist list (there isn't one for bruxism/TMD). ASA/CAP will test any health claim against whether you can evidence it.
4. **Consultation = triage, not diagnosis.** The red-flag routing must genuinely send flagged cases to clinical care rather than sell them a device — that's both the ethical line and your defensibility. It's built to do this; make sure the "book a clinical assessment" path connects to a real booking/clinic.
5. **The botox/masseter pathway** is a regulated clinical treatment delivered in-clinic (Jersey/Guernsey/London) — keep it clearly separated from the DTC device purchase, prescriber-led, and severity-gated as designed.
6. **Data protection.** You're processing health-related data (symptoms). Register with the **ICO**, and make sure storage/consent is handled properly (this raises the bar on your privacy policy and where consultation data is stored).

---

## I. The name — flagged separately because it's load-bearing

Before you print anything or buy the domain in earnest:

- **Trademark search & registration.** "Unclench" is a common English verb, which makes a trademark **harder to register and defend** and makes SEO/paid search more competitive. Get a trademark attorney's read on whether a mark (likely the stylised wordmark + the coral full stop, rather than the bare word) is registrable in the relevant classes. Hold a reserve name in case it isn't.
- **Domain + social handles** — secure them together once the name is cleared.

---

## Suggested sequence

1. Decide **Shopify vs. Stripe-on-own-site** (section A).
2. Clear the **name / trademark** and buy the domain (I, C).
3. Get **MHRA registration + dentist-review workflow + legal pages** underway — these have lead time (H, G).
4. Stand up **payments + hosting** (B, C) and the **order/email/review software** (E).
5. Lock the **fulfilment chain** — kits, lab, shipping (D).
6. Layer on **analytics + marketing** (F).
7. Soft-launch in **Stripe test mode / limited release**, then go live.

---

### Fastest path to "live and taking orders"
If you want to be selling in weeks rather than months: **Shopify** (A2) + a **Shopify subscriptions app** + the consultation quiz as a custom page, with the **MHRA registration and dentist-review workflow running in parallel** (H) since those are the true gating items, not the tech. The design here ports straight into a Shopify theme.
