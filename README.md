# LET Reviewer Pro

**A Professional LET (Licensure Examination for Teachers) Review Application**

Developed by **Godmisoft** - Professional Educational Solutions

---

## 🎯 Features

### For Examinees
- **Comprehensive Question Bank**: 150 practice questions per subject
- **Progress Tracking**: Monitor your performance, accuracy, and study time
- **Topic Analysis**: Identify strengths and weaknesses by topic
- **Study Streak**: Track daily study habits with streak counter
- **Detailed Results**: Review answers with explanations after each quiz
- **Multiple Subjects**: Support for Elementary and Secondary level subjects

### For Administrators
- **Examinee Dashboard**: View all registered examinees and their progress
- **Performance Analytics**: Track accuracy, study time, and engagement
- **Status Monitoring**: Identify active, occasionally active, and inactive examinees
- **Top Performers Leaderboard**: Celebrate high-achieving examinees
- **Inactive Examinee Alerts**: Identify examinees who need encouragement
- **Detailed User Profiles**: View complete examinee history and statistics

---

## 📚 Supported Subjects

### Elementary Level
1. General Education (English, Filipino, Mathematics, Science, Social Studies, Literature)
2. Professional Education (Teaching Profession, Facilitating Learning, Child Development, etc.)

### Secondary Level
1. General Education
2. Professional Education
3. English
4. Filipino
5. Mathematics
6. Science / General Science
7. Social Studies / Social Science
8. MAPEH
9. TLE
10. Values Education
11. Social Science Composite
12. Biological Science
13. Physical Science
14. Math Composite
15. Agriculture & Fishery Arts
16. Business Education / Business Technology
17. Home Economics
18. Industrial Arts
19. ICT
20. Music
21. Arts
22. Physical Education

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone or Download this repository**

```bash
git clone <your-repo-url>
cd let-reviewer-app
```

2. **Install Dependencies**

```bash
npm install
```

3. **Run Development Server**

```bash
npm run dev
```

4. **Open in Browser**
```
http://localhost:3000
```

---

## 📦 Deployment to Vercel

### Method 1: Using Vercel CLI

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

### Method 2: Using Vercel Dashboard

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js settings
- Click "Deploy"

### Method 3: Using GitHub Integration

1. **Push to GitHub**
2. **Connect Vercel to GitHub**
   - Sign in to Vercel
   - Go to "Add New" → "Project"
   - Select your repository
3. **Auto-deploy on every push to main branch**

---

## 🗄️ Database Structure

The app uses JSON files for the question database. Each subject has its own JSON file in `/public/data/`.

### JSON Format

```json
{
  "subject": "Elementary - General Education",
  "category": "elementary",
  "subcategory": "general-education",
  "topics": [
    {
      "id": "topic-id",
      "name": "Topic Name",
      "questions": [
        {
          "id": "unique-question-id",
          "question": "Question text here?",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "correctAnswer": 0,
          "explanation": "Explanation of the correct answer",
          "difficulty": "easy",
          "topic": "Topic Name"
        }
      ]
    }
  ],
  "totalQuestions": 150
}
```

### Adding New Questions

1. **Locate the JSON file** for your subject in `/public/data/`
2. **Add questions** to the appropriate topic array
3. **Ensure unique IDs** for each question
4. **Test locally** before deploying

---

## 👨‍💻 Usage Guide

### For Examinees

1. **Sign In**
   - Enter your name and email
   - Select your category (Elementary or Secondary)
   - If Secondary, select your major

2. **Choose Subject**
   - Select from available subjects
   - Click to start quiz with 150 questions

3. **Take Quiz**
   - Answer questions at your own pace
   - Navigate with Previous/Next buttons
   - Submit when ready

4. **Review Results**
   - See your score and accuracy
   - Review correct answers with explanations
   - Track your progress over time

### For Administrators

1. **Sign In as Admin**
   - Use admin credentials
   - Access Admin Dashboard

2. **Monitor Examinees**
   - View all examinees tab for complete overview
   - Check top performers for leaderboard
   - Review inactive examinees who need attention

3. **Track Performance**
   - Monitor daily active users
   - View accuracy trends
   - Track study time and engagement

---

## 🎨 Customization

### Branding
- Logo and colors are in the main page component
- Edit `/src/app/page.tsx` to customize branding

### Questions
- Add/edit questions in JSON files
- Keep format consistent
- Ensure 150 questions per subject

### Styling
- Uses Tailwind CSS
- Edit `tailwind.config.js` for theme changes
- Modify components for layout changes

---

## 📊 Tracking Features

The app automatically tracks:
- ✅ Questions answered
- ✅ Correct vs incorrect answers
- ✅ Time spent per session
- ✅ Per-topic performance
- ✅ Daily study streak
- ✅ Last active date
- ✅ Total study time
- ✅ Quiz retakes

All data is stored in browser localStorage.

---

## 🔧 Technical Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Storage**: Browser localStorage
- **Deployment**: Vercel

---

## 📱 PWA Support (Optional)

To make this a Progressive Web App:

1. Add `next-pwa` package
```bash
npm install next-pwa
```

2. Configure in `next.config.js`
3. Add manifest.json and icons

---

## 🤝 Contributing

To add new questions or features:

1. Fork the repository
2. Create your feature branch
3. Add your questions/features
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

Copyright © 2024 Godmisoft. All rights reserved.

---

## 👤 Developer

**Godmisoft**
- Professional Development Company
- Specializing in Educational Technology
- Web, Mobile, and Desktop Applications

---

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Contact: [Your contact email]

---

## 🎓 Tips for Best Results

### For Examinees:
1. **Study daily** to maintain your streak
2. **Review explanations** for wrong answers
3. **Focus on weak topics** identified in analytics
4. **Complete full 150-question quizzes** for best preparation
5. **Track your progress** over time

### For Administrators:
1. **Monitor inactive examinees** regularly
2. **Celebrate top performers** for motivation
3. **Identify common weak topics** across examinees
4. **Encourage consistent study habits**
5. **Use analytics to improve** teaching strategies

---

## 🚧 Roadmap

Future enhancements may include:
- [ ] Backend database (Firebase/Supabase)
- [ ] Mobile apps (iOS/Android)
- [ ] Certificate generation
- [ ] Social features
- [ ] Video explanations
- [ ] Timed exam mode
- [ ] Flashcards
- [ ] Study groups
- [ ] Export to PDF

---

## ✨ Version History

**Version 1.0.0** (Current)
- Initial release
- Complete Elementary and Secondary support
- Admin dashboard
- Progress tracking
- Study streak
- 150 questions per subject

---

**Made with ❤️ by Godmisoft**

*Empowering Filipino Teachers Through Technology*
