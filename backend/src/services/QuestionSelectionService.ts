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

export class QuestionSelectionService {
  /**
   * Selects random questions automatically based on selected categories and total question count.
   *
   * Algorithm Details:
   * 1. Equal Base Distribution: floor(Total / Categories)
   * 2. Remainder Assignment: Total % Categories allocated randomly among categories.
   * 3. Availability Check: Queries active questions for each category.
   * 4. Shortage Reallocation: If a category has fewer questions than target, takes all available
   *    and redistributes the deficit dynamically across categories with surplus questions.
   * 5. Global Validation: If total available < requested count, throws a clear BadRequestError.
   * 6. Random Sampling & Shuffling: Fisher-Yates shuffle per category and final global shuffle.
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
      const allQuestions = await Question.find({}).exec();
      if (allQuestions.length < targetTotalCount) {
        throw new BadRequestError(
          `Not enough questions are available to generate this contest. Required: ${targetTotalCount}, Available: ${allQuestions.length}`
        );
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
    const availableQuestionsMap: { [cat: string]: IQuestion[] } = {};
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
    // GLOBAL AVAILABILITY CHECK
    // ------------------------------------------------------------------
    if (totalAvailableAcrossSelected < targetTotalCount) {
      throw new BadRequestError(
        `Not enough questions are available to generate this contest. Required: ${targetTotalCount}, Available: ${totalAvailableAcrossSelected}`
      );
    }

    // ------------------------------------------------------------------
    // STEP 4: DYNAMIC SHORTAGE REALLOCATION
    // ------------------------------------------------------------------
    const finalAllocations: { [cat: string]: number } = {};
    let totalShortage = 0;

    for (const cat of cleanCategories) {
      const available = availableQuestionsMap[cat].length;
      const target = targetAllocations[cat];

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
        cat => availableQuestionsMap[cat].length > finalAllocations[cat]
      );

      if (eligibleSurplusCats.length === 0) {
        // Fallback safety
        break;
      }

      // Randomly pick one eligible category to take 1 extra question
      const randomSurplusCat = shuffleArray(eligibleSurplusCats)[0];
      finalAllocations[randomSurplusCat] += 1;
      totalShortage -= 1;
    }

    // ------------------------------------------------------------------
    // STEP 5: RANDOM SAMPLING & FINAL GLOBAL SHUFFLE
    // ------------------------------------------------------------------
    const selectedQuestionIds: mongoose.Types.ObjectId[] = [];
    const selectedIdSet = new Set<string>();

    for (const cat of cleanCategories) {
      const countToTake = finalAllocations[cat];
      if (countToTake <= 0) continue;

      const shuffledCatQuestions = shuffleArray(availableQuestionsMap[cat]);
      for (const q of shuffledCatQuestions) {
        const idStr = q._id.toString();
        if (!selectedIdSet.has(idStr)) {
          selectedIdSet.add(idStr);
          selectedQuestionIds.push(q._id as mongoose.Types.ObjectId);
        }
        const pickedCatCount = selectedQuestionIds.filter(id =>
          availableQuestionsMap[cat].some(cq => cq._id.toString() === id.toString())
        ).length;
        if (pickedCatCount >= countToTake) break;
      }
    }

    // If there are still missing questions due to cross-category overlaps, fill from remaining unselected questions
    if (selectedQuestionIds.length < targetTotalCount) {
      for (const cat of cleanCategories) {
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

    // Final shuffle of selected questions so question order across categories is randomized
    const finalShuffledIds = shuffleArray(selectedQuestionIds);
    return finalShuffledIds.slice(0, targetTotalCount);
  }
}

export const questionSelectionService = new QuestionSelectionService();
export default questionSelectionService;
