# SendGrid Email Service Setup Guide

This guide will help you set up SendGrid for sending verification emails in IBDPal.

## 📋 Prerequisites

- SendGrid account (free tier available)
- Railway project access
- Domain email for sender verification

## 🚀 Step-by-Step Setup

### Step 1: Create SendGrid Account

1. **Go to [SendGrid.com](https://sendgrid.com)**
2. **Click "Start for Free"**
3. **Fill in your details**:
   - Email address
   - Password
   - Company name (optional)
4. **Choose "Free" plan** (100 emails/day)
5. **Complete signup**

### Step 2: Verify Sender Identity

1. **In SendGrid Dashboard**, go to **Settings → Sender Authentication**
2. **Click "Single Sender Verification"**
3. **Fill in the form**:
   - **From Name**: `IBDPal`
   - **From Email Address**: `your-personal-gmail@gmail.com` (use your Gmail)
   - **Reply To**: `your-personal-gmail@gmail.com` (same as from email)
   - **Company Name**: `IBDPal`
   - **Address**: Your address
   - **City**: Your city
   - **Country**: Your country
4. **Click "Create"**
5. **Check your Gmail** and click the verification link

### Step 3: Generate API Key

1. **Go to Settings → API Keys**
2. **Click "Create API Key"**
3. **Configure the key**:
   - **API Key Name**: `IBDPal Email Service`
   - **API Key Permissions**: Choose "Restricted Access"
   - **Mail Send**: Select "Full Access"
4. **Click "Create & View"**
5. **Copy the API key** (you'll only see it once!)

### Step 4: Configure Railway Environment Variables

1. **Go to your Railway project dashboard**
2. **Navigate to Variables tab**
3. **Add these environment variables**:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=your-personal-gmail@gmail.com

# Optional: Fallback SMTP (if needed)
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key-here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
```

### Step 5: Deploy and Test

1. **Railway will automatically redeploy** when you add environment variables
2. **Wait for deployment to complete**
3. **Test the email service** using the test script

## 🧪 Testing the Setup

Run the test script to verify SendGrid is working:

```bash
node test_railway_email.js
```

## 📊 Expected Results

### Successful Setup:
```
📧 SendGrid email service initialized
📧 Email sent: <message-id>
✅ Railway email service test completed!
```

### Check Your Email:
- Look for verification emails in your inbox
- Check spam folder if not found
- Verify the email format and content

## 🔧 Troubleshooting

### Common Issues:

1. **"No email credentials provided"**
   - Check that `SENDGRID_API_KEY` is set in Railway
   - Verify the API key is correct

2. **"Authentication failed"**
   - Verify sender email is authenticated in SendGrid
   - Check API key permissions

3. **"Rate limit exceeded"**
   - Free tier: 100 emails/day limit
   - Upgrade to paid plan for more

4. **Emails going to spam**
   - Verify sender domain in SendGrid
   - Use a professional domain email

### SendGrid Dashboard Monitoring:

1. **Activity → Email Activity**: See sent emails
2. **Settings → Mail Settings**: Configure delivery settings
3. **Settings → Sender Authentication**: Manage verified senders

## 💰 Pricing

- **Free Tier**: 100 emails/day
- **Essentials Plan**: $14.95/month for 50k emails
- **Pro Plan**: $89.95/month for 100k emails

## 🔒 Security Notes

- Never commit API keys to git
- Use environment variables only
- Rotate API keys periodically
- Monitor email activity for abuse

## 📞 Support

- **SendGrid Support**: [support.sendgrid.com](https://support.sendgrid.com)
- **Railway Support**: [railway.app/support](https://railway.app/support)
- **IBDPal Team**: Contact your development team

---

**Note**: This setup will enable email verification for thousands of users with reliable delivery and professional appearance. 