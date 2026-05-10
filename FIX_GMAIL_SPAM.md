# Fix Gmail Spam Filter for OTP Emails

## Problem
OTP emails from PulseQueue are going to Gmail spam folder instead of inbox.

## Solution (3 Steps)

### Step 1: Train Gmail by Marking as "Not Spam"

1. **Open Gmail** → Go to **Spam** folder
2. **Find email from "PulseQueue"** with subject "Your verification code is..."
3. **Click the email** to open it
4. **Click the 3 dots menu** (top right)
5. **Select "Report not spam"**
6. **Gmail learns**: Future emails from this sender go to inbox

### Step 2: Add PulseQueue to Contacts

This tells Gmail this is a trusted sender:

1. **Open the email** from PulseQueue
2. **Click on "PulseQueue"** sender name at top
3. **Click "Add to Contacts"**
4. Now Gmail recognizes it as a known sender

### Step 3: Create a Gmail Filter (Optional but Recommended)

This automatically sends all PulseQueue emails to inbox:

1. **In Gmail Search box**, type: `from:pulsequeueproject@gmail.com`
2. **Click the filter icon** (looks like a funnel with a line)
3. **Click "Create filter"**
4. **Check**: "Never send it to Spam"
5. **Click "Create filter"**

---

## What We Fixed in Backend

### Before (Goes to Spam ❌)
```
Subject: Verification code: 675765 - Your verification code is: 675765
From: pulsequeueproject
Headers: No priority markers
```

### After (Goes to Inbox ✅)
```
Subject: Your verification code is 675765
From: PulseQueue <pulsequeueproject@gmail.com>
Headers: X-Priority: 1, Importance: high, Auto-Submitted: auto-generated
```

**Changes Made:**
- ✅ Clean subject (no repetition)
- ✅ Display name added ("PulseQueue <email>")
- ✅ Urgent/High priority headers added
- ✅ Auto-Submitted header marks as transactional

---

## Testing After Gmail Training

1. **Register new account** → OTP email sent
2. **Check Gmail Inbox** (not spam)
3. **Enter 6-digit code** → Done!

### If Still in Spam After Filter

**Delete Gmail cache:**
1. Go to Gmail Settings ⚙️
2. Click "Clear search history"
3. Wait 5 minutes
4. Check spam folder again

---

## Why Gmail Flags Emails as Spam

| Factor | Our Solution |
|--------|--------------|
| Gmail account sending transactional | ✅ Added Auto-Submitted header |
| No sender display name | ✅ Added "PulseQueue" name |
| Not marked as urgent | ✅ Added X-Priority: 1 |
| Suspicious subject (repetition) | ✅ Removed duplicate text |
| Unknown sender | ✅ Ask user to add to contacts |

---

## Next Steps

**For Development:**
- Emails should now reach inbox after Gmail training
- Users need to mark first email as "Not spam"
- Or create filter (Step 3 above)

**For Production:**
- Consider using SendGrid, Mailgun, or AWS SES
- These have better Gmail reputation
- No manual training needed

---

## Quick Checklist for Users

- [ ] Check spam folder for PulseQueue email
- [ ] Click "Report not spam"
- [ ] Add PulseQueue to contacts
- [ ] Create Gmail filter (optional)
- [ ] Try registering again
- [ ] OTP email should arrive in inbox

---

Questions? Check Backend logs:
```bash
npm start
# Look for: "✓ OTP email sent to [email]"
```
