# 🚀 Deployment Guide - LET Reviewer Pro

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account (free)
- ✅ Vercel account (free - sign up at vercel.com)
- ✅ Git installed on your computer
- ✅ All questions added to JSON files

---

## 📋 Pre-Deployment Checklist

### 1. Complete Your Question Database

Make sure you have 150 questions for each subject:

```bash
# Check your data folder
/public/data/
  ├── elementary-general-education.json (150 questions)
  ├── elementary-professional-education.json (150 questions)
  ├── secondary-general-education.json (150 questions)
  ├── secondary-professional-education.json (150 questions)
  ├── secondary-english.json (150 questions)
  ├── secondary-filipino.json (150 questions)
  ├── secondary-mathematics.json (150 questions)
  └── ... (add all other secondary subjects)
```

### 2. Test Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 and test:
# - Login as examinee
# - Login as admin
# - Take a quiz
# - Check all subjects load
# - Verify admin dashboard works
```

### 3. Build Test

```bash
# Build the project
npm run build

# This should complete without errors
```

---

## 🌐 Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - LET Reviewer Pro by Godmisoft"

# Create a new repository on GitHub:
# 1. Go to github.com
# 2. Click "New Repository"
# 3. Name it "let-reviewer-pro"
# 4. Don't initialize with README (we already have one)
# 5. Click "Create Repository"

# Connect and push to GitHub
git remote add origin https://github.com/YOUR-USERNAME/let-reviewer-pro.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in** (use GitHub for easy connection)
3. **Click "New Project"**
4. **Import your GitHub repository**
   - You'll see your repositories
   - Click "Import" next to "let-reviewer-pro"
5. **Configure Project**
   - Project Name: `let-reviewer-pro`
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
6. **Click "Deploy"**
7. **Wait 2-3 minutes** for deployment to complete
8. **Get your live URL**: `https://let-reviewer-pro.vercel.app`

✅ **Done! Your app is live!**

---

## 🔧 Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# First deployment (it will ask configuration questions)
vercel

# Production deployment
vercel --prod
```

### Step 4: Get Your URL

After deployment, you'll get a URL like:
```
https://let-reviewer-pro-xyz.vercel.app
```

---

## 🔄 Updating Your Live App

### After making changes:

```bash
# Make your changes to code or JSON files

# Test locally
npm run dev

# Commit changes
git add .
git commit -m "Updated questions for Mathematics"

# Push to GitHub
git push origin main
```

**That's it!** Vercel automatically deploys when you push to GitHub.

---

## 🎯 Custom Domain (Optional)

### To use your own domain (e.g., letreviewer.com):

1. **Buy a domain** from any registrar (Namecheap, GoDaddy, etc.)

2. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings"
   - Click "Domains"
   - Add your domain
   - Follow DNS instructions

3. **Update DNS** at your domain registrar:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for propagation** (up to 24 hours)

---

## 📊 Post-Deployment

### 1. Test Everything

Visit your live URL and test:
- [ ] Login as examinee
- [ ] Login as admin
- [ ] Take complete quiz
- [ ] Submit quiz
- [ ] View results
- [ ] Check admin dashboard
- [ ] Test on mobile device
- [ ] Test all subjects

### 2. Share with Users

Your app is ready! Share the URL with:
- Examinees preparing for LET
- School administrators
- Review centers

### 3. Monitor Usage

In Vercel Dashboard, you can see:
- Number of visits
- Performance metrics
- Error logs (if any)

---

## 🔐 Environment Variables (If Needed Later)

If you add features that need API keys:

1. **In Vercel Dashboard:**
   - Go to Project Settings
   - Click "Environment Variables"
   - Add your variables

2. **In your code:**
   ```javascript
   const apiKey = process.env.NEXT_PUBLIC_API_KEY;
   ```

---

## ⚡ Performance Tips

### 1. Optimize Images
If you add images later:
```javascript
import Image from 'next/image'
<Image src="/logo.png" width={100} height={100} alt="Logo" />
```

### 2. Enable Analytics
In Vercel Dashboard:
- Go to Analytics
- Enable Web Vitals tracking

### 3. Add PWA (Progressive Web App)
Make it installable on mobile:
```bash
npm install next-pwa
```

---

## 🆘 Troubleshooting

### Build Fails?

**Error: "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run build
```

**Error: "Invalid JSON"**
- Check all JSON files in `/public/data/`
- Validate JSON at jsonlint.com
- Ensure no trailing commas

### Deployment Takes Too Long?

- First deployment: 3-5 minutes (normal)
- Subsequent: 1-2 minutes
- If > 10 minutes, check build logs

### App Not Loading?

1. Check Vercel deployment logs
2. Ensure all JSON files are present
3. Clear browser cache
4. Try incognito mode

---

## 📱 Making Updates

### Adding New Questions

1. **Edit JSON file** locally
2. **Test** with `npm run dev`
3. **Commit and push**
```bash
git add public/data/elementary-general-education.json
git commit -m "Added 50 more English questions"
git push origin main
```
4. **Vercel auto-deploys** (2-3 minutes)

### Changing Design

1. **Edit** `/src/app/page.tsx`
2. **Test locally**
3. **Push to GitHub**
4. **Auto-deployed!**

---

## 🎉 Success Checklist

After deployment, you should have:
- ✅ Live URL working
- ✅ All subjects loading
- ✅ Quizzes functioning
- ✅ Admin dashboard accessible
- ✅ Mobile-responsive
- ✅ Fast loading times
- ✅ No console errors

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review GitHub Actions (if enabled)
3. Test locally first
4. Check all JSON files are valid

---

## 🚀 Advanced: Continuous Integration

For automatic testing before deployment:

1. **Add GitHub Actions**
```yaml
# .github/workflows/test.yml
name: Test
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
```

2. **Protect main branch**
   - Require passing tests before merge

---

## 🎓 Next Steps After Deployment

1. **Monitor usage** with Vercel Analytics
2. **Gather feedback** from users
3. **Add more questions** regularly
4. **Update topics** based on LET exam changes
5. **Consider premium features**:
   - User accounts with backend
   - Payment integration
   - Mobile apps
   - Certificates

---

**Congratulations!** 🎊

Your LET Reviewer Pro is now live and helping future teachers!

**Made with ❤️ by Godmisoft**

---

## Quick Reference Commands

```bash
# Local development
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm start          # Start production server

# Git commands
git add .                        # Stage changes
git commit -m "message"          # Commit changes
git push origin main             # Push to GitHub

# Vercel commands
vercel                          # Deploy to preview
vercel --prod                   # Deploy to production
vercel logs                     # View deployment logs
```
