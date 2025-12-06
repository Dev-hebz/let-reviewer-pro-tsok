# 📝 Question Adding Guide

## Quick Template for Adding Questions

Use this template when adding new questions to any JSON file.

---

## 📋 Question Template

```json
{
  "id": "cat-subj-topic-###",
  "question": "Your question here?",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of why this is correct",
  "difficulty": "easy",
  "topic": "Topic Name"
}
```

---

## 🎯 ID Naming Convention

**Format**: `category-subject-topic-number`

### Examples:
- Elementary General Ed: `ele-gen-eng-001`
- Elementary Prof Ed: `ele-prof-tp-001`
- Secondary Math: `sec-math-alg-001`
- Secondary English: `sec-eng-gram-001`

### Category Codes:
- `ele` = Elementary
- `sec` = Secondary

### Subject Codes:
- `gen` = General Education
- `prof` = Professional Education
- `math` = Mathematics
- `eng` = English
- `fil` = Filipino
- `sci` = Science
- etc.

---

## 📚 Topic Examples by Subject

### General Education Topics
- **English**: Grammar, Vocabulary, Reading Comprehension, Literature
- **Filipino**: Gramatika, Panitikan, Bokabularyo
- **Mathematics**: Algebra, Geometry, Statistics, Problem Solving
- **Science**: Biology, Chemistry, Physics, Earth Science
- **Social Studies**: Philippine History, Geography, Government
- **Literature**: Poetry, Prose, Drama, Literary Devices

### Professional Education Topics
- Teaching Profession
- Facilitating Learning
- Child and Adolescent Development
- Curriculum Development
- Assessment of Learning
- Educational Technology
- Social Dimensions of Education
- Field Study and Practice Teaching

---

## ✅ Quality Checklist

Before adding a question, ensure:
- [ ] Question is clear and unambiguous
- [ ] 4 options are provided
- [ ] Only ONE correct answer
- [ ] Options are similar in length
- [ ] No obvious "giveaway" answers
- [ ] Explanation is detailed and educational
- [ ] Difficulty level is accurate
- [ ] Grammar and spelling are correct
- [ ] Unique ID (no duplicates)

---

## 📊 Difficulty Guidelines

### Easy
- Basic recall
- Simple concepts
- Direct questions
- Foundation knowledge
- Example: "What is the capital of the Philippines?"

### Medium
- Application of knowledge
- Analysis required
- Multiple concepts
- Moderate complexity
- Example: "Which teaching method is best for..."

### Hard
- Critical thinking
- Complex scenarios
- Multiple steps
- Deep understanding
- Example: "Analyze the implications of..."

---

## 🎨 Writing Good Explanations

### Good Explanation:
```json
"explanation": "The answer is B because the Cagayan River, at approximately 505 km, is the longest river in the Philippines. It flows through Cagayan Valley and is longer than both Agusan River (390 km) and Pasig River (25 km)."
```

### Poor Explanation:
```json
"explanation": "B is correct."
```

### Include:
✅ Why the answer is correct
✅ Additional context
✅ Why other options are wrong (when relevant)
✅ Related concepts

---

## 🔢 How to Add 150 Questions

### Strategy 1: Topics First
1. Divide 150 by number of topics
2. Create equal distribution
3. Example for 6 topics: 25 questions each

### Strategy 2: Difficulty Mix
- Easy: 50 questions (33%)
- Medium: 75 questions (50%)
- Hard: 25 questions (17%)

### Strategy 3: Balanced Approach
```
English (30 questions)
  ├── Grammar (10)
  ├── Vocabulary (10)
  └── Comprehension (10)

Filipino (30 questions)
  ├── Gramatika (10)
  ├── Panitikan (10)
  └── Bokabularyo (10)

Mathematics (30 questions)
  ├── Algebra (10)
  ├── Geometry (10)
  └── Statistics (10)

...continue for all topics to reach 150
```

---

## 🚀 Batch Adding Questions

### Step 1: Create a Spreadsheet

| ID | Question | Option A | Option B | Option C | Option D | Correct | Explanation | Difficulty | Topic |
|----|----------|----------|----------|----------|----------|---------|-------------|------------|-------|
| ele-gen-eng-001 | What is...? | A | B | C | D | 1 | Because... | easy | English |

### Step 2: Convert to JSON

Use a tool or script to convert your spreadsheet to JSON format.

### Step 3: Validate

```bash
# Use online JSON validator
https://jsonlint.com

# Or use this command
cat your-file.json | python -m json.tool
```

### Step 4: Test

```bash
npm run dev
# Test the quiz with your new questions
```

---

## 📝 Example: Complete Question Set

```json
{
  "subject": "Elementary - General Education",
  "category": "elementary",
  "subcategory": "general-education",
  "topics": [
    {
      "id": "english",
      "name": "English",
      "questions": [
        {
          "id": "ele-gen-eng-001",
          "question": "Which sentence is grammatically correct?",
          "options": [
            "She don't like apples",
            "She doesn't like apples",
            "She doesn't likes apples",
            "She don't likes apples"
          ],
          "correctAnswer": 1,
          "explanation": "The correct form is 'doesn't' (does not) with the base form of the verb 'like'. 'She' is a third-person singular subject requiring 'doesn't', not 'don't'.",
          "difficulty": "easy",
          "topic": "English"
        },
        {
          "id": "ele-gen-eng-002",
          "question": "What is the plural form of 'child'?",
          "options": [
            "childs",
            "childes",
            "children",
            "child"
          ],
          "correctAnswer": 2,
          "explanation": "'Children' is the irregular plural form of 'child'. Many English nouns have irregular plural forms that don't follow the standard -s/-es rule.",
          "difficulty": "easy",
          "topic": "English"
        }
        // ... add 148 more questions
      ]
    }
  ],
  "totalQuestions": 150
}
```

---

## 🎯 Tips for Efficient Question Creation

### 1. Use Categories
Group similar questions together:
- Dates and events
- Definitions
- Problem-solving
- Application scenarios

### 2. Reference Materials
Use official sources:
- DepEd curriculum guides
- LET syllabi
- Professional education books
- Subject matter textbooks

### 3. Peer Review
- Have another teacher review questions
- Test questions on sample students
- Get feedback on clarity and difficulty

### 4. Update Regularly
- Review and update questions annually
- Remove outdated content
- Add new topics from curriculum changes

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T:
1. Use ambiguous language
2. Have multiple correct answers
3. Make one option obviously wrong
4. Copy directly from textbooks (copyright)
5. Use trick questions
6. Make options too similar
7. Use negative language unnecessarily

### ✅ DO:
1. Use clear, direct language
2. Make all options plausible
3. Test your questions
4. Provide educational explanations
5. Balance difficulty levels
6. Review for cultural sensitivity
7. Proofread carefully

---

## 📚 Resources for Question Ideas

### Official Sources:
- DepEd Learning Competencies
- Professional Regulation Commission (PRC) syllabi
- LET Reviewer Books
- National Achievement Test items

### Topics to Cover:
- Current K-12 curriculum
- Philippine context and culture
- Modern teaching methods
- Recent educational reforms
- Professional standards

---

## 🔄 Quality Assurance Process

1. **Write** 10-20 questions
2. **Review** for quality
3. **Test** in the app
4. **Revise** based on testing
5. **Add** to production
6. **Repeat** until you reach 150

---

## 📞 Need Help?

If you need assistance creating questions:
1. Review existing questions for patterns
2. Consult with subject matter experts
3. Use official educational resources
4. Test questions with actual students

---

**Remember**: Quality over quantity!
Better to have 150 well-written questions than 200 poor ones.

**Good luck building your question bank!** 🎓

---

**Created by Godmisoft**
*Empowering Education Through Technology*
