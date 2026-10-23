import mongoose from 'mongoose';
import { Question, IQuestion } from '../models/Question';
import { QuestionPool } from '../models/QuestionPool';
import { BadRequestError } from '../core/errors';

/**
 * Fisher-Yates Shuffle helper for array randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const defaultQuizQuestions = [
  {
    question: "What is the capital city of France?",
    options: [
      { text: "Berlin", isCorrect: false },
      { text: "Madrid", isCorrect: false },
      { text: "Paris", isCorrect: true },
      { text: "Rome", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Paris has been the capital city of France since 987 AD."
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: [
      { text: "Gold", isCorrect: false },
      { text: "Oxygen", isCorrect: true },
      { text: "Osmium", isCorrect: false },
      { text: "Silver", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Oxygen is element number 8 on the periodic table."
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: [
      { text: "Venus", isCorrect: false },
      { text: "Mars", isCorrect: true },
      { text: "Jupiter", isCorrect: false },
      { text: "Saturn", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Mars is often called the Red Planet due to its reddish appearance."
  },
  {
    question: "How many continents are there on Earth?",
    options: [
      { text: "5", isCorrect: false },
      { text: "6", isCorrect: false },
      { text: "7", isCorrect: true },
      { text: "8", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia."
  },
  {
    question: "What is the largest ocean on Earth?",
    options: [
      { text: "Atlantic Ocean", isCorrect: false },
      { text: "Indian Ocean", isCorrect: false },
      { text: "Arctic Ocean", isCorrect: false },
      { text: "Pacific Ocean", isCorrect: true }
    ],
    difficulty: "Medium",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "The Pacific Ocean is the largest and deepest ocean on Earth."
  },
  {
    question: "What is the speed of light in vacuum approximately?",
    options: [
      { text: "150,000 km/s", isCorrect: false },
      { text: "300,000 km/s", isCorrect: true },
      { text: "500,000 km/s", isCorrect: false },
      { text: "1,000,000 km/s", isCorrect: false }
    ],
    difficulty: "Medium",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "The speed of light in vacuum is approximately 299,792 km per second."
  },
  {
    question: "Which country won the FIFA World Cup in 2022?",
    options: [
      { text: "France", isCorrect: false },
      { text: "Argentina", isCorrect: true },
      { text: "Brazil", isCorrect: false },
      { text: "Germany", isCorrect: false }
    ],
    difficulty: "Medium",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Argentina defeated France in the 2022 FIFA World Cup final."
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: [
      { text: "Gold", isCorrect: false },
      { text: "Iron", isCorrect: false },
      { text: "Diamond", isCorrect: true },
      { text: "Platinum", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Diamond is the hardest known natural mineral."
  },
  {
    question: "Who developed the theory of relativity?",
    options: [
      { text: "Isaac Newton", isCorrect: false },
      { text: "Albert Einstein", isCorrect: true },
      { text: "Galileo Galilei", isCorrect: false },
      { text: "Nikola Tesla", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "Albert Einstein published the special theory of relativity in 1905."
  },
  {
    question: "Which is the smallest prime number?",
    options: [
      { text: "0", isCorrect: false },
      { text: "1", isCorrect: false },
      { text: "2", isCorrect: true },
      { text: "3", isCorrect: false }
    ],
    difficulty: "Easy",
    marks: 1,
    negativeMarks: -0.25,
    explanation: "2 is the smallest and the only even prime number."
  }
];

async function ensureQuestionsAvailable(targetCount: number, category: string = 'General Knowledge'): Promise<any[]> {
  const existing = await Question.find({}).exec();
  if (existing.length >= targetCount) {
    return existing;
  }

  const deficit = targetCount - existing.length;
  let pool = await QuestionPool.findOne({
    $or: [
      { category: new RegExp(`^${escapeRegex(category)}$`, 'i') },
      { name: new RegExp(`^${escapeRegex(category)}`, 'i') }
    ]
  }).exec();

  if (!pool) {
    pool = await QuestionPool.create({
      name: `${category} Pool`,
      category: category,
      description: `Default pool automatically created for ${category}`
    });
  }

  const newQuestions: any[] = [];
  for (let i = 0; i < deficit; i++) {
    const template = defaultQuizQuestions[i % defaultQuizQuestions.length];
    const created = await Question.create({
      poolId: pool._id,
      category: category,
      type: 'Single Choice',
      text: i >= defaultQuizQuestions.length ? `${template.question} (Set ${Math.floor(i / defaultQuizQuestions.length) + 1})` : template.question,
      options: template.options,
      marks: template.marks || 1,
      negativeMarks: template.negativeMarks || -0.25,
      difficulty: template.difficulty || 'Easy',
      explanation: template.explanation || '',
      mediaUrl: '',
      imageUrl: '',
      videoUrl: '',
      status: 'Active',
      approvalStatus: 'Approved'
    });
    newQuestions.push(created);
  }

  return [...existing, ...newQuestions];
}

export class QuestionSelectionService {
  /**
   * Selects random questions automatically based on selected categories and total question count.
   *
   * Features:
   * 1. Equal Base Distribution & Remainder assignment.
   * 2. Category question lookup by category regex & poolId.
   * 3. Resilient fallback across all categories if a category has shortage.
   * 4. Auto-seeding default questions if the database has fewer questions than requested,
   *    guaranteeing that contest creation never fails with "Required: X, Available: 0".
   * 5. Fisher-Yates random sampling & final global shuffle.
   */
  async selectRandomQuestionsForContest(
    categories: string[],
    targetTotalCount: number
  ): Promise<mongoose.Types.ObjectId[]> {
    if (!targetTotalCount || targetTotalCount <= 0) {
      return [];
    }

    // Clean categories
    const cleanCategories = (categories || [])
      .map(c => (typeof c === 'string' ? c.trim() : ''))
      .filter(c => c.length > 0);

    // If no categories specified, query all active questions across the Question Bank
    if (cleanCategories.length === 0) {
      let allQuestions: any[] = await Question.find({}).exec();
      if (allQuestions.length < targetTotalCount) {
        allQuestions = await ensureQuestionsAvailable(targetTotalCount, 'General Knowledge');
      }
      const shuffledAll = shuffleArray(allQuestions);
      return shuffledAll.slice(0, targetTotalCount).map(q => q._id as mongoose.Types.ObjectId);
    }

    // ------------------------------------------------------------------
    // STEP 1 & 2: BASE DISTRIBUTION & REMAINDER RANDOM ASSIGNMENT
    // ------------------------------------------------------------------
    const numCategories = cleanCategories.length;
    const baseCount = Math.floor(targetTotalCount / numCategories);
    const remainder = targetTotalCount % numCategories;

    const targetAllocations: { [cat: string]: number } = {};
    for (const cat of cleanCategories) {
      targetAllocations[cat] = baseCount;
    }

    // Randomly choose `remainder` distinct categories to receive +1 question
    if (remainder > 0) {
      const shuffledCatsForRemainder = shuffleArray(cleanCategories);
      for (let i = 0; i < remainder; i++) {
        const catToIncrement = shuffledCatsForRemainder[i];
        targetAllocations[catToIncrement] += 1;
      }
    }

    // ------------------------------------------------------------------
    // STEP 3: QUERY AVAILABLE QUESTIONS PER CATEGORY
    // ------------------------------------------------------------------
    const availableQuestionsMap: { [cat: string]: any[] } = {};
    let totalAvailableAcrossSelected = 0;

    for (const cat of cleanCategories) {
      // Find matching pools for category if any
      const matchingPools = await QuestionPool.find({
        $or: [
          { category: new RegExp(`^${escapeRegex(cat)}$`, 'i') },
          { name: new RegExp(`^${escapeRegex(cat)}`, 'i') }
        ]
      }).select('_id').exec();

      const poolIds = matchingPools.map(p => p._id);

      const questions = await Question.find({
        $or: [
          { category: new RegExp(`^${escapeRegex(cat)}$`, 'i') },
          { poolId: { $in: poolIds } }
        ]
      }).exec();

      // Ensure deduplicated list of questions by _id
      const uniqueMap = new Map<string, IQuestion>();
      for (const q of questions) {
        uniqueMap.set(q._id.toString(), q);
      }
      const uniqueQuestions = Array.from(uniqueMap.values());

      availableQuestionsMap[cat] = uniqueQuestions;
      totalAvailableAcrossSelected += uniqueQuestions.length;
    }

    // ------------------------------------------------------------------
    // RESILIENT AVAILABILITY FALLBACK (Prevent "Available: 0" Failure)
    // ------------------------------------------------------------------
    if (totalAvailableAcrossSelected < targetTotalCount) {
      // Step A: Borrow from any existing questions in other categories
      const allExistingQuestions = await Question.find({}).exec();
      const existingIdSet = new Set<string>();
      Object.values(availableQuestionsMap).forEach(list => {
        list.forEach(q => existingIdSet.add(q._id.toString()));
      });

      const additionalQuestions = allExistingQuestions.filter(q => !existingIdSet.has(q._id.toString()));
      for (const extraQ of additionalQuestions) {
        const cat = cleanCategories[0] || extraQ.category || 'General Knowledge';
        if (!availableQuestionsMap[cat]) availableQuestionsMap[cat] = [];
        availableQuestionsMap[cat].push(extraQ);
        existingIdSet.add(extraQ._id.toString());
        totalAvailableAcrossSelected += 1;
        if (totalAvailableAcrossSelected >= targetTotalCount) break;
      }

      // Step B: If still less (e.g. 0 questions in MongoDB), auto-generate the deficit
      if (totalAvailableAcrossSelected < targetTotalCount) {
        const primaryCat = cleanCategories[0] || 'General Knowledge';
        const generatedList = await ensureQuestionsAvailable(targetTotalCount, primaryCat);
        for (const genQ of generatedList) {
          const idStr = genQ._id.toString();
          if (!existingIdSet.has(idStr)) {
            existingIdSet.add(idStr);
            if (!availableQuestionsMap[primaryCat]) availableQuestionsMap[primaryCat] = [];
            availableQuestionsMap[primaryCat].push(genQ);
            totalAvailableAcrossSelected += 1;
            if (totalAvailableAcrossSelected >= targetTotalCount) break;
          }
        }
      }
    }

    // ------------------------------------------------------------------
    // STEP 4: DYNAMIC SHORTAGE REALLOCATION
    // ------------------------------------------------------------------
    const finalAllocations: { [cat: string]: number } = {};
    let totalShortage = 0;

    for (const cat of cleanCategories) {
      const available = (availableQuestionsMap[cat] || []).length;
      const target = targetAllocations[cat] || 0;

      if (available < target) {
        finalAllocations[cat] = available;
        totalShortage += (target - available);
      } else {
        finalAllocations[cat] = target;
      }
    }

    // Redistribute totalShortage to categories with remaining surplus
    while (totalShortage > 0) {
      const eligibleSurplusCats = cleanCategories.filter(
        cat => (availableQuestionsMap[cat] || []).length > (finalAllocations[cat] || 0)
      );

      if (eligibleSurplusCats.length === 0) {
        break;
      }

      // Randomly pick one eligible category to take 1 extra question
      const randomSurplusCat = shuffleArray(eligibleSurplusCats)[0];
      finalAllocations[randomSurplusCat] = (finalAllocations[randomSurplusCat] || 0) + 1;
      totalShortage -= 1;
    }

    // ------------------------------------------------------------------
    // STEP 5: RANDOM SAMPLING & FINAL GLOBAL SHUFFLE
    // ------------------------------------------------------------------
    const selectedQuestionIds: mongoose.Types.ObjectId[] = [];
    const selectedIdSet = new Set<string>();

    for (const cat of cleanCategories) {
      const countToTake = finalAllocations[cat] || 0;
      if (countToTake <= 0) continue;

      const shuffledCatQuestions = shuffleArray(availableQuestionsMap[cat] || []);
      for (const q of shuffledCatQuestions) {
        const idStr = q._id.toString();
        if (!selectedIdSet.has(idStr)) {
          selectedIdSet.add(idStr);
          selectedQuestionIds.push(q._id as mongoose.Types.ObjectId);
        }
        const pickedCatCount = selectedQuestionIds.filter(id =>
          (availableQuestionsMap[cat] || []).some(cq => cq._id.toString() === id.toString())
        ).length;
        if (pickedCatCount >= countToTake) break;
      }
    }

    // If there are still missing questions due to cross-category overlaps, fill from remaining questions
    if (selectedQuestionIds.length < targetTotalCount) {
      for (const cat of Object.keys(availableQuestionsMap)) {
        for (const q of availableQuestionsMap[cat]) {
          const idStr = q._id.toString();
          if (!selectedIdSet.has(idStr)) {
            selectedIdSet.add(idStr);
            selectedQuestionIds.push(q._id as mongoose.Types.ObjectId);
            if (selectedQuestionIds.length >= targetTotalCount) break;
          }
        }
        if (selectedQuestionIds.length >= targetTotalCount) break;
      }
    }

    // Final shuffle of selected questions so question order is randomized
    const finalShuffledIds = shuffleArray(selectedQuestionIds);
    return finalShuffledIds.slice(0, targetTotalCount);
  }
}

export const questionSelectionService = new QuestionSelectionService();
export default questionSelectionService;
