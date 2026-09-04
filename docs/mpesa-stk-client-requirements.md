# Blue Pineapple — M-Pesa Express (STK Push)

**Status:** Live on production in **Daraja sandbox** (demo / UAT)  
**Product surface:** Fort Jesus Water Taxi public booking  
**Live URL:** https://www.bluepineappleholdings.com/trips/fort-jesus-trip  
**Prepared for:** Blue Pineapple stakeholders / M-Pesa account owners  
**Purpose:** Explain the feature, invite sandbox testing, and list what is required to move to **live (real money)** collections

---

## 1. Feature overview

Blue Pineapple now supports **M-Pesa Express (STK Push)** on the Fort Jesus Water Taxi booking flow.

When a guest completes a public booking online, the system:

1. Creates (or reuses) an unpaid booking for their trip selection  
2. Sends an **M-Pesa PIN prompt** to the phone number they entered  
3. Waits for Safaricom to confirm payment via callback  
4. Marks the booking **paid / confirmed** on success, or keeps it unpaid so they can **retry**

Admin / partner-created bookings can still be recorded without forcing a guest STK prompt.

This replaces “book first, pay later offline” for the public Fort Jesus path with an immediate, verifiable Lipa Na M-Pesa payment.

---

## 2. How it works for Blue Pineapple

### Guest journey (public Fort Jesus page)

1. Guest opens  
   https://www.bluepineappleholdings.com/trips/fort-jesus-trip  
2. Selects **From / To**, **date**, **passengers**, and optional **return fare**  
3. Enters contact details and M-Pesa phone number  
4. Confirms and receives an **STK Push** on their phone  
5. Enters M-Pesa PIN  
6. Website updates when Safaricom reports the result:
   - **Success** → payment received, booking confirmed, receipt/reference shown  
   - **Cancel / timeout / insufficient funds** → booking remains unpaid; guest can **Pay with M-Pesa** again or start over  

### What happens behind the scenes

| Step | System behaviour |
| --- | --- |
| Initiate | Blue Pineapple calls Daraja **STK Push** with amount, phone, and booking reference |
| Acknowledge | Safaricom accepts the request and prompts the customer |
| Callback | Safaricom POSTs the result to our production callback URL |
| Confirm | We validate the payload, update payment status, and confirm the booking when paid in full |
| Recover | If the callback is delayed, the app can **reconcile** via STK Query so the UI does not stay stuck |

### Callback URL (already configured on our side)

```text
https://www.bluepineappleholdings.com/api/payments/mpesa/callback
```

Stakeholders do **not** need to host or invent a callback URL for this feature.

### Current environment

| Item | Current value |
| --- | --- |
| Daraja environment | **Sandbox** |
| Money movement | **No real money** |
| Purpose | Feature UAT / demo with Safaricom test behaviour |
| Production website | Already running this feature in sandbox mode |

---

## 3. Invitation to test (sandbox)

Please test the end-to-end booking + payment experience on the live site while we are still on sandbox.

### Test entry point

https://www.bluepineappleholdings.com/trips/fort-jesus-trip

### What to validate

- [ ] Trip selection and fare calculation look correct  
- [ ] STK prompt is initiated after guest details are submitted  
- [ ] Success path shows a confirmed booking / payment confirmation  
- [ ] Failed / cancelled payment leaves the booking unpaid and allows retry  
- [ ] Booking reference is clear enough for ops follow-up  

### Important sandbox limitations

Please treat this phase as a **demo**, not live collections:

- Sandbox does **not** credit your real M-Pesa business account  
- Real customer phones often **cannot** complete a normal live PIN flow in sandbox  
- Safaricom sandbox / simulator behaviour is used for developer and UAT verification  
- A “successful” sandbox payment can still mark a booking paid in our database — that does **not** mean money was received  

If anything in the guest journey is unclear or incorrect during UAT, share feedback before we switch to production credentials.

---

## 4. Important clarification — who owns the live shortcode?

This is the most important go-live point.

### Daraja portal access ≠ live shortcode

Having access to the **Safaricom Daraja developer portal** (including sandbox testing) does **not** by itself create a live Paybill or Till.

There are **two separate Safaricom tracks**:

| Track | What it is | Who must own it |
| --- | --- | --- |
| **1. Live M-Pesa shortcode** (Paybill or Till) | The real business number that receives customer money | The **registered business** that will be paid (Blue Pineapple / the legal entity collecting Fort Jesus fares) |
| **2. Daraja Go Live** (API production credentials) | Links a developer app to that live shortcode for STK Push | Must be authorised against that same M-Pesa business organisation |

Engineering can integrate and configure the website.  
**Safaricom will only issue / link a live shortcode to the business that can prove ownership of the funds destination.**

### Who applies for the shortcode?

**Blue Pineapple Holdings (the client / business receiving the money) must apply for — or already own — the live Paybill or Till.**

The developer / implementation partner:

- **Can** help prepare the Daraja Go Live step once the shortcode and M-Pesa Business Portal access exist  
- **Cannot** substitute their personal Daraja sandbox access for the client’s business KYC  
- **Should not** receive live settlements into a personal Till unless that is the intentionally agreed commercial arrangement (usually it is not)

If Blue Pineapple already has a live Paybill or Till under the correct legal name, we reuse it.  
If not, Blue Pineapple must complete Safaricom business onboarding first.

### Will Safaricom ask for business documents?

**Yes.** Expect KYC / business verification. Exact documents depend on business type (individual, sole proprietorship, limited company) and whether you apply for **Paybill** or **Buy Goods Till**, but typically include items such as:

- Certificate of incorporation **or** business name registration  
- **KRA PIN** certificate for the business (and often directors)  
- National ID / passport copies of directors or authorised signatories  
- For limited companies: recent **CR12**, board resolution / authorisation where required  
- Bank confirmation / cancelled cheque or settlement account details (especially for Paybill)  
- Business permit / licence where applicable  
- Clear business contact details and, for API go-live, a live website / product description  

Safaricom may also expect the business website to look like a real merchant site (privacy / refund policy and clear service description are commonly checked during API go-live reviews).

### How long does verification take?

Timelines vary and are controlled by Safaricom, not by the website team. Rough expectations:

| Step | Typical timing |
| --- | --- |
| Buy Goods **Till** application / activation | Often faster (commonly about **1–3 working days** once documents are accepted) |
| **Paybill** application / activation | Often longer (commonly about **5–10 working days**, sometimes more) |
| Create M-Pesa Business Portal operators (Admin / Business Manager) | After shortcode is live |
| **Daraja Go Live** + production keys / passkey | Additional days after shortcode + portal access are ready |

**Plan for calendar time.** Do not assume same-day cutover from sandbox to live money.

Official business onboarding contact often used for M-Pesa organisation issues:

`m-pesabusiness@safaricom.co.ke`  
Till / Buy Goods self-serve entry point commonly used: https://m-pesaforbusiness.co.ke

### Critical form — M-PESA Business Administrator Form

Even if Blue Pineapple **already has a Buy Goods Till**, Daraja production go-live usually still needs an authorised **Business Administrator** on the M-Pesa Organisation / Business Portal.

That is **not** done only by typing fields in Daraja. Safaricom requires a **printed, signed (and often stamped) paper form**, plus supporting KYC documents, submitted to Safaricom Business.

**Form download (official Safaricom PDF):**  
https://www.safaricom.co.ke/images/Downloads/M-PESA-Business-Administator-Form.pdf

**Also listed under Lipa Na M-PESA account opening downloads:**  
https://www.safaricom.co.ke/main-mpesa/m-pesa-services/lipa-na-m-pesa/lipa-na-m-pesa-account-opening

#### What this form is for

| Category on the form | Use it when |
| --- | --- |
| **Category 1 — New administrator / update details** | Create or update Business Admin access on M-Pesa G2 / MPP portals |
| **Category 2 — Password reset / unlock / close** | Manage an existing administrator account |

For our go-live path, Blue Pineapple typically needs **Category 1** if there is no usable Business Administrator username yet for Daraja Go Live.

#### Who must complete it

- Authorised **business signatories** must **print, sign, and stamp/seal** as required for their business type  
- The nominated administrator’s details (name, ID, email, Safaricom mobile) must be filled accurately  
- The form must quote the live **M-PESA Short Code** (Paybill / Buy Goods HO or Store number)

Engineering **cannot** sign this on the client’s behalf. The client’s directors / authorised signatories must sign it.

#### Documents to attach with the form (from page 2 of the PDF)

Depends on business category. Common examples:

| Business type | Typical attachments with the signed form |
| --- | --- |
| Individual | Signed form + nominated admin ID (both sides) |
| Sole proprietor | Business permit / registration + signed stamped form + admin ID |
| Partnership | Registration / partnership deed + form signed/stamped by two signatories + IDs |
| Limited company (1 director) | Current **CR12 (≤ 90 days)** + form signed/stamped by director + IDs |
| Limited company (multiple directors) | Current **CR12 (≤ 90 days)** + form signed by **at least two** CR12 directors + stamped + IDs |
| NGO / institution / other | Board resolution on letterhead + registration + signed stamped form + IDs |

#### How to submit

Email the signed form + attachments to:

**`M-PESABusiness@safaricom.co.ke`**

(or submit via the channel Safaricom Business instructs, e.g. shop / account manager)

Safaricom then creates/updates the Business Administrator and sends portal credentials to the nominated admin email / phone.

#### Why this matters for website go-live

Daraja **Go Live** asks for the M-Pesa **Business Admin / Business Manager username**.  
Without that admin account, STK production credentials usually cannot be completed — even if the Till already exists.

**Sequence to tell the client:**

1. Confirm live Till / Paybill exists  
2. Complete **M-PESA Business Administrator Form** + KYC pack → email Safaricom  
3. Receive Business Admin portal access  
4. Complete Daraja Go Live (OTP to till/org owner)  
5. Share production Consumer Key / Secret / Passkey with engineering  
6. We switch the website from sandbox to production  

---

## 5. Next step — move from sandbox to live M-Pesa

After sandbox UAT is accepted, we will switch Daraja from **sandbox** to **production** so guests pay with **real M-Pesa** into Blue Pineapple’s live shortcode / till.

### 5.1 Decision required from Blue Pineapple

Confirm which live collection account will receive Fort Jesus booking payments:

| Option | Use when | Transaction type we will configure |
| --- | --- | --- |
| **Paybill** | You collect via a live Paybill number | `CustomerPayBillOnline` |
| **Till (Buy Goods)** | You collect via a live Till number | `CustomerBuyGoodsOnline` |

Please confirm **one** option before go-live.

Also confirm:

- [ ] We already have a live Paybill / Till under the correct legal entity **or**  
- [ ] We still need to apply for one with Safaricom (start this immediately if not done)  
- [ ] We already have an active **M-Pesa Business Administrator** **or**  
- [ ] We still need to submit the signed **M-PESA Business Administrator Form**

### 5.2 Client actions (business / compliance)

These are **Blue Pineapple’s** responsibilities with Safaricom:

- [ ] Apply for or confirm ownership of live **Paybill** or **Till** under the correct legal name  
- [ ] Download, print, complete, **sign/stamp** the [M-PESA Business Administrator Form](https://www.safaricom.co.ke/images/Downloads/M-PESA-Business-Administator-Form.pdf)  
- [ ] Attach the KYC documents listed on page 2 of that form for your business category  
- [ ] Email the pack to **`M-PESABusiness@safaricom.co.ke`** (or channel Safaricom instructs)  
- [ ] Receive and activate **Business Admin / Business Manager** operators on the M-Pesa Business Portal  
- [ ] Authorise Daraja **Go Live** against that organisation shortcode  
- [ ] Enable **Lipa Na M-Pesa Online / M-Pesa Express (STK Push)** on the production app  
- [ ] Share production credentials securely with engineering (see checklist below)

### 5.3 Requirements checklist (to be provided once shortcode + Daraja Go Live are ready)

#### A. Daraja production readiness

- [ ] Daraja portal app has completed **Go Live** under the **business** organisation  
- [ ] Product enabled: **Lipa Na M-Pesa Online / M-Pesa Express (STK Push)**  
- [ ] Named owner/admin for the Daraja / M-Pesa organisation (email + phone)  

#### B. Production API credentials

From Daraja **My Apps** after go-live (these are **not** the sandbox keys):

- [ ] Production **Consumer Key**  
- [ ] Production **Consumer Secret**  

#### C. Production Lipa Na M-Pesa passkey

- [ ] Production **Passkey** for Lipa Na M-Pesa Online  

Safaricom typically emails this after go-live. The sandbox passkey **cannot** be reused.

#### D. Live shortcode details

**If Paybill:**

- [ ] Live Paybill number  
- [ ] Confirmation that Party B / credit party is the same Paybill (unless Safaricom advised otherwise)  

**If Till (Buy Goods):**

- [ ] Store / HO **Business Shortcode** (used as STK BusinessShortCode)  
- [ ] Live **Till number** (Party B — where funds are credited)  

#### E. Business / ops confirmation

- [ ] Legal / trading name that should appear on the customer STK / SMS experience  
- [ ] Confirmation that successful live payments settle into **Blue Pineapple’s** M-Pesa organisation account  
- [ ] Ops contact for failed payments, underpayments, and customer support  
- [ ] Preferred go-live window for a supervised KES 1–10 live smoke test  

### 5.4 What engineering will configure

Once the checklist above is received, we will set production environment values including:

- `DARAJA_ENV=production`  
- Production consumer key / secret  
- Production shortcode, passkey, party B, and transaction type  
- Callback: `https://www.bluepineappleholdings.com/api/payments/mpesa/callback`  
- Production hardening (`DARAJA_ENFORCE_CALLBACK_IP`, reconcile secret)  
- Redeploy + supervised live smoke test on a real Safaricom number  

No change to the guest-facing Fort Jesus booking URL is required for go-live.

### 5.5 Recommended sequence

1. **Client confirms** Paybill vs Till and whether a live shortcode already exists  
2. If missing, **client applies** with Safaricom and completes KYC (allow time)  
3. **Client prints, signs, stamps** the [M-PESA Business Administrator Form](https://www.safaricom.co.ke/images/Downloads/M-PESA-Business-Administator-Form.pdf) + page-2 KYC pack and emails **`M-PESABusiness@safaricom.co.ke`**  
4. **Client receives** Business Admin credentials and can access the M-Pesa Business Portal  
5. **Daraja Go Live** is completed against that shortcode (uses the Business Admin username + OTP)  
6. Client shares production key / secret / passkey / shortcode details  
7. Engineering switches env, redeploys, runs live smoke test  
8. Only then communicate “live M-Pesa payments are open” to guests

---

## 6. Go-live acceptance criteria

We will consider live M-Pesa ready when:

1. A real phone receives an STK prompt for a small live amount  
2. Successful payment credits the agreed Paybill / Till  
3. Website marks the booking paid and shows confirmation  
4. Cancelled / failed payment leaves the booking unpaid and allows retry  
5. Callback is received successfully on the production callback URL  

---

## 7. Summary

| Phase | Status | Action |
| --- | --- | --- |
| **Now** | Sandbox on production website | Test Fort Jesus booking + STK UX and send feedback |
| **Business track** | Shortcode + Business Admin form + KYC | Client confirms Till/Paybill, submits signed Administrator Form to Safaricom |
| **Next** | Provide live Daraja + M-Pesa account details | Complete Section 5 checklist |
| **Then** | Engineering switches env to production | Redeploy + live smoke test |
| **Live** | Real guest payments | Fort Jesus public bookings collect via M-Pesa Express |

---

## 8. Contacts / questions

For product or UAT feedback on the Fort Jesus booking experience, reply on the existing project channel.

For M-Pesa organisation / shortcode / go-live account issues on Safaricom’s side:

`m-pesabusiness@safaricom.co.ke`  
Buy Goods / Till self-serve: https://m-pesaforbusiness.co.ke

---

**Document owner:** Blue Pineapple engineering  
**Related live page:** https://www.bluepineappleholdings.com/trips/fort-jesus-trip  
**Callback (already ours):** https://www.bluepineappleholdings.com/api/payments/mpesa/callback  
