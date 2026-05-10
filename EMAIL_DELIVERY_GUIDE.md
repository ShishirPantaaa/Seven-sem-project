# Email Delivery Guide - Fixing OTP Emails Going to Spam

## Problem
OTP emails are being sent successfully but going to Gmail's **Spam** or **Promotions** folder instead of **Inbox**.

## Solution

### ✅ What We've Already Fixed
1. **Professional HTML Email Template**: Modern design with gradient OTP box
2. **Proper Email Headers**: Added X-Priority, Content-Type for better Gmail recognition
3. **Clear Content Structure**: Proper subject line with OTP preview, professional formatting
4. **Security Messaging**: "Didn't request this?" section reduces spam score

### ⚙️ Configuration Steps (Gmail App-Specific Password)

**1. Enable 2-Factor Authentication on Gmail**
- Go to: https://myaccount.google.com/
- Click "Security" in the left sidebar
- Scroll to "How you sign in to Google"
- Enable "2-Step Verification"

**2. Generate App-Specific Password**
- Return to https://myaccount.google.com/
- Click "Security" → "App passwords"
- Select "Mail" and "Windows Computer" (or your OS)
- Google will generate a 16-character password
- Use this in `.env` as `EMAIL_PASS` (NOT your Gmail password)

**Example `.env` File:**
```env
EMAIL_USER=pulsequeueproject@gmail.com
EMAIL_PASS=ccvosywdenctvugk
EMAIL_SERVICE=gmail
EMAIL_FROM=pulsequeueproject@gmail.com
```

---

## 📧 Why Emails Go to Spam

Gmail uses multiple signals to filter emails:

| Signal | Status |
|--------|--------|
| Professional HTML | ✅ Fixed |
| Proper Subject Line | ✅ Fixed |
| Email Headers | ✅ Fixed |
| SPF Records | ⚠️ Gmail account only |
| DKIM Signatures | ⚠️ Gmail account only |
| Domain Reputation | ⚠️ Gmail account only |
| User History | ⏳ Improves over time |

---

## 🔧 Advanced: Custom Domain (Optional)

If you own a custom domain (e.g., `noreply@yourhospital.com`), add these DNS records:

### SPF Record
```
v=spf1 include:gmail.com ~all
```
Add to your domain's DNS records as a TXT record.

### DKIM (Gmail-generated)
1. Go to Gmail → Settings → Forwarding and POP/IMAP
2. Look for "DKIM" section
3. Gmail will generate a DKIM record for your domain
4. Add it to your domain's DNS as instructed

---

## ✅ How to Verify Emails are Being Sent

### Test 1: Check Backend Logs
Start the server and look for:
```
✓ Email transporter ready
✓ OTP email sent to user@example.com
```

### Test 2: Check Gmail Account
1. Open https://mail.google.com
2. Check these folders:
   - **Inbox** - Best case ✅
   - **Promotions** - Common for new senders
   - **Spam** - Check if emails are here

### Test 3: Mark as "Not Spam"
If emails appear in **Spam** folder:
1. Open the email
2. Click "Report not spam" at the top
3. Gmail learns to deliver future emails to Inbox

### Test 4: Add to Contacts
Ask users to add `pulsequeueproject@gmail.com` to their contacts. Gmail prioritizes emails from contacts.

---

## 🚀 Best Practices to Improve Delivery

### 1. Send from Gmail Account (What We're Doing ✅)
- Gmail has high reputation
- Most reliable delivery method
- No special DNS setup needed

### 2. Consistent Sender Address ✅
```
EMAIL_FROM=pulsequeueproject@gmail.com
```
Always send from the same address

### 3. Professional HTML Template ✅
- Clear structure (header, content, footer)
- Gradient design (not plain text)
- Security messaging ("Didn't request?")
- Proper spacing and font

### 4. Fast Delivery Time ⏳
- OTP sent immediately after registration
- No delays or queuing
- Code valid for 5 minutes

### 5. User Verification ⏳
- First-time deliveries may go to Promotions
- After user verifies once, Gmail learns
- Subsequent emails go to Inbox

---

## 🐛 Troubleshooting

### Emails Not Showing Up At All
**Check:**
- `.env` has correct EMAIL_USER and EMAIL_PASS
- Gmail account has 2FA enabled
- Email password is app-specific (not Gmail password)
- Backend logs show "✓ Email transporter ready"

**Fix:**
```bash
# Restart server to reload .env
node server.js
```

### Emails Going to Spam
**Check:**
- Test account's spam folder
- Run live API test:
  ```bash
  curl -X POST http://localhost:5000/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"your-email@gmail.com","password":"test123"}'
  ```
- Look for response: `"emailSent":true`

**Fix:**
- Wait 24 hours (Gmail learns over time)
- Mark emails as "Not Spam" in Gmail
- Add sender to contacts
- Check DNS records if using custom domain

### App-Specific Password Not Working
**Check:**
- Did you enable 2FA first? (Required)
- Is it a 16-character password from Google?
- Did you use the full password with no spaces?

**Fix:**
1. Delete the app password
2. Re-generate new one from https://myaccount.google.com/apppasswords
3. Update `.env` and restart server

---

## 📊 Email Delivery Timeline

| Phase | Timeline | What Happens |
|-------|----------|--------------|
| **Initial Setup** | Day 1 | First emails may go to Promotions |
| **User Training** | Days 1-3 | Users mark as "Not Spam" |
| **Reputation Building** | Days 4-7 | More emails reach Inbox |
| **Stable** | Week 2+ | Most emails reach Inbox ✅ |

---

## 🎯 Testing Flow

1. **Register New User**
   - Email → Should see OTP within 10 seconds
   - Check Promotions folder if not in Inbox

2. **Verify Email**
   - Enter 6-digit OTP
   - System confirms registration

3. **Login Again**
   - Request new OTP
   - Should arrive faster (Gmail learning)

4. **Report Success**
   - Mark as "Not Spam" in Gmail
   - Helps future emails

---

## 📝 Next Steps

✅ Email template improved with professional design  
✅ Proper headers added for Gmail recognition  
✅ Backup verification code available if email fails  

⏳ **Monitor emails for next 24-48 hours**  
⏳ **Adjust spam folder settings as needed**  
⏳ **Consider custom domain for production**

---

## Support

If emails continue to have issues:
1. Check Backend logs: `✓ OTP email sent to [email]`
2. Verify in Gmail spam folder
3. Test with backup verification code (VER-XXXXXXXX)
4. Use custom domain if available

**Backend fallback**: If email fails, user still gets verification code to complete registration. 🎯
