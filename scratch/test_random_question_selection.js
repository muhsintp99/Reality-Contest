const mongoose = require('mongoose');

// Mock question generator
function createMockQuestion(id, category) {
  return {
    _id: new mongoose.Types.ObjectId(id),
    category,
    text: `Question ${id} in ${category}`
  };
}

// Fisher-Yates Shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Pure logic implementation for isolated unit testing
function simulateQuestionSelection(categories, targetTotalCount, databaseQuestionsMap) {
  if (!targetTotalCount || targetTotalCount <= 0) return [];

  const cleanCategories = (categories || []).map(c => c.trim()).filter(c => c.length > 0);

  const numCategories = cleanCategories.length;
  const baseCount = Math.floor(targetTotalCount / numCategories);
  const remainder = targetTotalCount % numCategories;

  const targetAllocations = {};
  for (const cat of cleanCategories) {
    targetAllocations[cat] = baseCount;
  }

  // Randomly assign remainder
  if (remainder > 0) {
    const shuffledCats = shuffleArray(cleanCategories);
    for (let i = 0; i < remainder; i++) {
      targetAllocations[shuffledCats[i]] += 1;
    }
  }

  // Check available
  const availableQuestionsMap = {};
  let totalAvailable = 0;
  for (const cat of cleanCategories) {
    const questions = databaseQuestionsMap[cat] || [];
    availableQuestionsMap[cat] = questions;
    totalAvailable += questions.length;
  }

  if (totalAvailable < targetTotalCount) {
    throw new Error(`Not enough questions are available to generate this contest. Required: ${targetTotalCount}, Available: ${totalAvailable}`);
  }

  // Shortage reallocation
  const finalAllocations = {};
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

  while (totalShortage > 0) {
    const eligibleSurplusCats = cleanCategories.filter(
      cat => availableQuestionsMap[cat].length > finalAllocations[cat]
    );
    if (eligibleSurplusCats.length === 0) break;
    const randomSurplusCat = shuffleArray(eligibleSurplusCats)[0];
    finalAllocations[randomSurplusCat] += 1;
    totalShortage -= 1;
  }

  // Random sampling
  const selectedQuestionIds = [];
  const selectedIdSet = new Set();

  for (const cat of cleanCategories) {
    const countToTake = finalAllocations[cat];
    if (countToTake <= 0) continue;

    const shuffled = shuffleArray(availableQuestionsMap[cat]);
    for (const q of shuffled) {
      const idStr = q._id.toString();
      if (!selectedIdSet.has(idStr)) {
        selectedIdSet.add(idStr);
        selectedQuestionIds.push(q._id.toString());
      }
      const currentCatCount = selectedQuestionIds.filter(id =>
        availableQuestionsMap[cat].some(cq => cq._id.toString() === id)
      ).length;
      if (currentCatCount >= countToTake) break;
    }
  }

  const finalShuffled = shuffleArray(selectedQuestionIds);
  return finalShuffled.slice(0, targetTotalCount);
}

// ------------------------------------------------------------------
// RUN TEST SUITE
// ------------------------------------------------------------------
console.log('====================================================');
console.log('TEST SUITE: RANDOM QUESTION SELECTION ALGORITHM');
console.log('====================================================\n');

// Test 1: Equal Distribution (100 Questions across 4 Categories A, B, C, D -> 25 each)
console.log('--- TEST 1: Equal Distribution (Q = 100, Cats = A, B, C, D) ---');
const db1 = {
  A: Array.from({ length: 40 }, (_, i) => createMockQuestion(`11111111111111111111${i < 10 ? '0' + i : i}`, 'A')),
  B: Array.from({ length: 40 }, (_, i) => createMockQuestion(`22222222222222222222${i < 10 ? '0' + i : i}`, 'B')),
  C: Array.from({ length: 40 }, (_, i) => createMockQuestion(`33333333333333333333${i < 10 ? '0' + i : i}`, 'C')),
  D: Array.from({ length: 40 }, (_, i) => createMockQuestion(`44444444444444444444${i < 10 ? '0' + i : i}`, 'D'))
};
const res1 = simulateQuestionSelection(['A', 'B', 'C', 'D'], 100, db1);
console.log('Total Selected:', res1.length);
const count1A = res1.filter(id => id.startsWith('11111111111111111111')).length;
const count1B = res1.filter(id => id.startsWith('22222222222222222222')).length;
const count1C = res1.filter(id => id.startsWith('33333333333333333333')).length;
const count1D = res1.filter(id => id.startsWith('44444444444444444444')).length;
console.log(`Counts -> A: ${count1A}, B: ${count1B}, C: ${count1C}, D: ${count1D}`);
console.log('Deduplicated Count:', new Set(res1).size);
if (res1.length === 100 && count1A === 25 && count1B === 25 && count1C === 25 && count1D === 25 && new Set(res1).size === 100) {
  console.log('✓ TEST 1 PASSED: Exactly 25 selected per category.');
} else {
  console.error('✗ TEST 1 FAILED');
}

// Test 2: Remainder Distribution (70 Questions across 4 Categories A, B, C, D)
console.log('\n--- TEST 2: Remainder Distribution (Q = 70, Cats = A, B, C, D) ---');
const res2 = simulateQuestionSelection(['A', 'B', 'C', 'D'], 70, db1);
console.log('Total Selected:', res2.length);
const count2A = res2.filter(id => id.startsWith('11111111111111111111')).length;
const count2B = res2.filter(id => id.startsWith('22222222222222222222')).length;
const count2C = res2.filter(id => id.startsWith('33333333333333333333')).length;
const count2D = res2.filter(id => id.startsWith('44444444444444444444')).length;
console.log(`Counts -> A: ${count2A}, B: ${count2B}, C: ${count2C}, D: ${count2D}`);
const counts2 = [count2A, count2B, count2C, count2D].sort();
console.log('Sorted Category Counts:', counts2);
if (res2.length === 70 && counts2[0] === 17 && counts2[1] === 17 && counts2[2] === 18 && counts2[3] === 18) {
  console.log('✓ TEST 2 PASSED: 70 total (17, 17, 18, 18 distributed randomly).');
} else {
  console.error('✗ TEST 2 FAILED');
}

// Test 3: Insufficient Category Questions (Cat A has only 10, target is 17)
console.log('\n--- TEST 3: Shortage Reallocation (Cat A has 10, required 17 out of 70) ---');
const db3 = {
  A: Array.from({ length: 10 }, (_, i) => createMockQuestion(`11111111111111111111${i < 10 ? '0' + i : i}`, 'A')),
  B: Array.from({ length: 40 }, (_, i) => createMockQuestion(`22222222222222222222${i < 10 ? '0' + i : i}`, 'B')),
  C: Array.from({ length: 40 }, (_, i) => createMockQuestion(`33333333333333333333${i < 10 ? '0' + i : i}`, 'C')),
  D: Array.from({ length: 40 }, (_, i) => createMockQuestion(`44444444444444444444${i < 10 ? '0' + i : i}`, 'D'))
};
const res3 = simulateQuestionSelection(['A', 'B', 'C', 'D'], 70, db3);
const count3A = res3.filter(id => id.startsWith('11111111111111111111')).length;
const count3B = res3.filter(id => id.startsWith('22222222222222222222')).length;
const count3C = res3.filter(id => id.startsWith('33333333333333333333')).length;
const count3D = res3.filter(id => id.startsWith('44444444444444444444')).length;
console.log(`Counts -> A: ${count3A}, B: ${count3B}, C: ${count3C}, D: ${count3D}, Total: ${res3.length}`);
if (res3.length === 70 && count3A === 10 && (count3B + count3C + count3D === 60)) {
  console.log('✓ TEST 3 PASSED: Cat A took all 10 available, remaining 60 redistributed across B, C, D.');
} else {
  console.error('✗ TEST 3 FAILED');
}

// Test 4: Insufficient Total Questions Error (Required 100, Available 84)
console.log('\n--- TEST 4: Total Bank Shortage Error (Required 100, Available 84) ---');
const db4 = {
  A: Array.from({ length: 20 }, (_, i) => createMockQuestion(`11111111111111111111${i < 10 ? '0' + i : i}`, 'A')),
  B: Array.from({ length: 20 }, (_, i) => createMockQuestion(`22222222222222222222${i < 10 ? '0' + i : i}`, 'B')),
  C: Array.from({ length: 24 }, (_, i) => createMockQuestion(`33333333333333333333${i < 10 ? '0' + i : i}`, 'C')),
  D: Array.from({ length: 20 }, (_, i) => createMockQuestion(`44444444444444444444${i < 10 ? '0' + i : i}`, 'D'))
};
try {
  simulateQuestionSelection(['A', 'B', 'C', 'D'], 100, db4);
  console.error('✗ TEST 4 FAILED: Expected error was not thrown.');
} catch (err) {
  console.log('Caught Expected Error:', err.message);
  if (err.message.includes('Not enough questions are available to generate this contest') && err.message.includes('Required: 100, Available: 84')) {
    console.log('✓ TEST 4 PASSED: Threw exact required error message.');
  } else {
    console.error('✗ TEST 4 FAILED: Wrong error message');
  }
}
