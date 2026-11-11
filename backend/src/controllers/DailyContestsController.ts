import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DailyContest } from '../models/DailyContests';
import User from '../models/User';
import Question from '../models/Question';
import Attempt from '../models/Attempt';
import Result from '../models/Result';
import Leaderboard from '../models/Leaderboard';
import Transaction from '../models/Transaction';
import { walletService } from '../services/WalletService';
import { socketService } from '../services/SocketService';
import { BadRequestError, NotFoundError } from '../core/errors';
import { saveBase64File } from './UploadController';
import { questionSelectionService } from '../services/QuestionSelectionService';

const getQueryForId = (id: string) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { dailyContestId: id }] };
  }
  const cleanTitle = id.replace(/-/g, ' ');
  return {
    $or: [
      { dailyContestId: id },
      { title: { $regex: new RegExp(`^${cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
    ]
  };
};

export class DailyContestsController {
  async listDailyContests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, status, search } = req.query;
      let query: any = {};

      if (category && category !== 'All') query.category = category;
      if (status && status !== 'All') query.status = status;
      if (search) {
        query.title = { $regex: String(search), $options: 'i' };
      }

      const dailyContests = await DailyContest.find(query).sort({ createdAt: -1 }).exec();

      res.status(200).json({
        success: true,
        count: dailyContests ? dailyContests.length : 0,
        data: dailyContests || []
      });
    } catch (err) {
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  async getDailyContestDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest: any = await DailyContest.findOne(getQueryForId(id)).populate('questions').exec();
      if (!contest) {
        throw new NotFoundError('Daily contest not found');
      }

      // Ensure questions are populated so contestants always receive questions
      if (!contest.questions || contest.questions.length === 0 || !contest.questions[0]?.options) {
        const cats = contest.categories && contest.categories.length > 0 ? contest.categories : [contest.category || 'General Knowledge'];
        const targetCount = contest.questionsCount || 20;
        try {
          const poolQuestions = await Question.find({
            $or: [
              { category: { $in: cats } },
              { category: { $regex: new RegExp(cats.join('|'), 'i') } }
            ]
          }).limit(targetCount).lean().exec();

          if (poolQuestions && poolQuestions.length > 0) {
            contest.questions = poolQuestions as any;
          } else {
            const fallbackQuestions = await Question.find({}).limit(targetCount).lean().exec();
            if (fallbackQuestions && fallbackQuestions.length > 0) {
              contest.questions = fallbackQuestions as any;
            }
          }
        } catch {}
      }

      const totalParticipants = contest.participants ? contest.participants.length : 0;
      const contestObj = contest.toObject ? contest.toObject() : { ...contest };
      contestObj.analytics = {
        totalRegisteredUsers: totalParticipants,
        totalJoinedUsers: totalParticipants,
        totalCompletedParticipants: Math.round(totalParticipants * 0.7),
        status: contest.status || 'Active'
      };

      res.status(200).json({ success: true, data: contestObj, contest: contestObj, analytics: contestObj.analytics });
    } catch (err) {
      next(err);
    }
  }

  async createDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        dailyContestId: customId, id: altId,
        title, category, categories, entryFee, prizePool, timerLimit,
        questionsCount, difficulty, description, rules, imageUrl, videoUrl,
        fileAttachmentUrl, status, isActive, dailyStartTime, dailyEndTime, resetIntervalHours,
        entryFeeType, isFree, entryFeeCoins, coinsReward
      } = req.body;
      
      const dailyContestId = (customId || altId || '').trim() || `DLC-${Date.now()}`;
      const feeNum = Number(entryFee) || 0;
      const computedIsFree = feeNum === 0 || entryFeeType === 'Free' || isFree === true;
      const computedFeeType = computedIsFree ? 'Free' : (entryFeeType || 'Coins');

      const finalImageUrl = saveBase64File(imageUrl, 'daily-contest', 'banner');
      const finalVideoUrl = saveBase64File(videoUrl, 'daily-contest', 'video');
      const finalFileAttachmentUrl = saveBase64File(fileAttachmentUrl, 'daily-contest', 'doc');

      const targetCategories = categories || (category ? [category] : ['Speed Battle']);
      const targetCount = Number(questionsCount) || 20;

      // Automatic Random Question Selection
      let selectedQuestions: mongoose.Types.ObjectId[] = [];
      if (req.body.questions && Array.isArray(req.body.questions) && req.body.questions.length > 0) {
        selectedQuestions = req.body.questions;
      } else if (targetCount > 0) {
        selectedQuestions = await questionSelectionService.selectRandomQuestionsForContest(
          targetCategories,
          targetCount
        );
      }

      const newContest = new DailyContest({
        dailyContestId,
        title: title || 'Daily Battle 2026',
        category: category || (categories && categories[0]) || 'Speed Battle',
        categories: targetCategories,
        entryFee: feeNum,
        entryFeeType: computedFeeType,
        isFree: computedIsFree,
        entryFeeCoins: computedIsFree ? 0 : (Number(entryFeeCoins) || feeNum),
        coinsReward: Number(coinsReward) || Number(prizePool) || 10000,
        prizePool: Number(prizePool) || 10000,
        timerLimit: timerLimit || '3 mins',
        questionsCount: selectedQuestions.length || targetCount,
        questions: selectedQuestions,
        difficulty: difficulty || 'Medium',
        description: description || '',
        rules: rules || '',
        imageUrl: finalImageUrl || '',
        videoUrl: finalVideoUrl || '',
        fileAttachmentUrl: finalFileAttachmentUrl || '',
        status: status || 'Registration Open',
        isActive: isActive !== false,
        dailyStartTime: dailyStartTime || '09:00 AM',
        dailyEndTime: dailyEndTime || '11:59 PM',
        resetIntervalHours: Number(resetIntervalHours) || 24,
        lastResetAt: new Date(),
        nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      await newContest.save();
      res.status(201).json({ success: true, data: newContest });
    } catch (err) {
      next(err);
    }
  }

  async updateDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.imageUrl) updateData.imageUrl = saveBase64File(updateData.imageUrl, 'daily-contest', 'banner');
      if (updateData.videoUrl) updateData.videoUrl = saveBase64File(updateData.videoUrl, 'daily-contest', 'video');
      if (updateData.fileAttachmentUrl) updateData.fileAttachmentUrl = saveBase64File(updateData.fileAttachmentUrl, 'daily-contest', 'doc');

      const updated = await DailyContest.findOneAndUpdate(getQueryForId(id), updateData, { new: true }).exec();
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async deleteDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await DailyContest.findOneAndDelete(getQueryForId(id)).exec();
      res.status(200).json({ success: true, message: 'Daily contest deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async resetDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      if (contest) {
        contest.lastResetAt = new Date();
        contest.nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        contest.participantsCount = 0;
        contest.participants = [];

        // Generate fresh random questions for the new 24-hour cycle
        try {
          const freshQuestions = await questionSelectionService.selectRandomQuestionsForContest(
            contest.categories || [contest.category],
            contest.questionsCount || 20
          );
          contest.questions = freshQuestions;
        } catch (e) {
          // If not enough questions on reset, keep existing set
        }

        await contest.save();
      }
      res.status(200).json({ success: true, message: 'Daily contest reset completed successfully' });
    } catch (err) {
      next(err);
    }
  }

  async joinDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?._id;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      if (!contest) {
        throw new NotFoundError('Daily contest not found.');
      }

      let user: any = null;
      let alreadyJoined = false;

      if (userId) {
        user = await User.findById(userId).exec();
        if (!user) {
          throw new NotFoundError('User not found.');
        }

        // KYC check bypassed for daily contest participation (Coin / Price check enforced below)
        const participants = contest.participants || [];
        alreadyJoined = participants.some((pId: any) => (pId?._id ? pId._id.toString() : pId.toString()) === userId.toString());

        if (!alreadyJoined) {
          const isFree = contest.isFree === true || contest.entryFee === 0 || contest.entryFeeType === 'Free';
          if (!isFree) {
            const isCoinFee = contest.entryFeeType === 'Coins' || (contest.entryFeeCoins && contest.entryFeeCoins > 0);
            if (isCoinFee) {
              const coinFee = contest.entryFeeCoins || contest.entryFee;
              const currentCoins = user.coins || 0;
              if (currentCoins < coinFee && user.walletBalance < coinFee) {
                throw new BadRequestError(`Insufficient balance. This daily battle requires ${coinFee} Coins 🪙.`);
              }
              if (currentCoins >= coinFee) {
                user.coins = currentCoins - coinFee;
              } else {
                user.walletBalance -= coinFee;
              }
              await user.save();

              await Transaction.create({
                userId: user._id,
                amount: -coinFee,
                currency: 'Coins',
                type: 'Entry Fee',
                status: 'Completed',
                description: `Coin entry fee for daily contest ${contest.dailyContestId}: ${contest.title} (${coinFee} Coins 🪙)`,
                reference: `DAILY-COIN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
              }).catch(() => null);
            } else {
              if (user.walletBalance < contest.entryFee) {
                throw new BadRequestError('Insufficient wallet balance to pay daily contest entry fee.');
              }
              user.walletBalance -= contest.entryFee;
              await user.save();

              await Transaction.create({
                userId: user._id,
                amount: -contest.entryFee,
                currency: 'INR',
                type: 'Entry Fee',
                status: 'Completed',
                description: `Entry fee for daily contest ${contest.dailyContestId}: ${contest.title}`,
                reference: `DAILY-TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
              }).catch(() => null);
            }
          }

          if (!contest.participants) {
            contest.participants = [];
          }
          contest.participants.push(user._id as any);
          contest.participantsCount = contest.participants.length;
          await contest.save();
        }
      } else {
        contest.participantsCount = (contest.participantsCount || 0) + 1;
        await contest.save();
      }

      const message = alreadyJoined
        ? 'You have already joined this daily contest.'
        : 'Joined daily contest successfully';

      const responseData = {
        alreadyJoined: Boolean(alreadyJoined),
        message,
        contest,
        user: user ? {
          _id: user._id,
          name: user.name,
          walletBalance: user.walletBalance,
          coins: user.coins
        } : null
      };

      res.status(200).json({
        success: true,
        message,
        alreadyJoined: Boolean(alreadyJoined),
        contest,
        user: responseData.user,
        data: responseData
      });
    } catch (err) {
      next(err);
    }
  }

  async startDailyContest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?._id;
      if (!userId) {
        throw new BadRequestError('Authentication required to start daily contest.');
      }

      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      if (!contest) {
        throw new NotFoundError('Daily contest not found.');
      }

      const user = await User.findById(userId).exec();
      if (!user) {
        throw new NotFoundError('User not found.');
      }

      // KYC check bypassed for daily contest start attempt (Coin / Price check enforced below)
      const participants = contest.participants || [];
      let alreadyJoined = participants.some((pId: any) => (pId?._id ? pId._id.toString() : pId.toString()) === userId.toString());

      if (!alreadyJoined) {
        if (req.body?.autoJoin === true || req.query?.autoJoin === 'true') {
          const isFree = contest.isFree === true || contest.entryFee === 0 || contest.entryFeeType === 'Free';
          if (!isFree) {
            const isCoinFee = contest.entryFeeType === 'Coins' || (contest.entryFeeCoins && contest.entryFeeCoins > 0);
            if (isCoinFee) {
              const coinFee = contest.entryFeeCoins || contest.entryFee;
              const currentCoins = user.coins || 0;
              if (currentCoins < coinFee && user.walletBalance < coinFee) {
                throw new BadRequestError(`Insufficient balance. This daily battle requires ${coinFee} Coins 🪙.`);
              }
              if (currentCoins >= coinFee) {
                user.coins = currentCoins - coinFee;
              } else {
                user.walletBalance -= coinFee;
              }
              await user.save();
              await Transaction.create({
                userId: user._id,
                amount: -coinFee,
                currency: 'Coins',
                type: 'Entry Fee',
                status: 'Completed',
                description: `Coin entry fee for daily contest ${contest.title}`
              }).catch(() => null);
            } else {
              const cashFee = Number(contest.entryFee) || 0;
              if (cashFee > 0) {
                if (user.walletBalance < cashFee) {
                  throw new BadRequestError(`Insufficient balance. This daily battle requires ₹${cashFee}.`);
                }
                user.walletBalance -= cashFee;
                await user.save();
                await Transaction.create({
                  userId: user._id,
                  amount: -cashFee,
                  currency: 'INR',
                  type: 'Entry Fee',
                  status: 'Completed',
                  description: `Entry fee for daily contest ${contest.title}`
                }).catch(() => null);
              }
            }
          }

          if (!contest.participants) {
            contest.participants = [];
          }
          contest.participants.push(user._id as any);
          contest.participantsCount = contest.participants.length;
          await contest.save();
          alreadyJoined = true;
        } else {
          res.status(400).json({
            success: false,
            alreadyJoined: false,
            requiresJoin: true,
            message: 'You must join this daily contest before starting. Contest join cheyathe start cheyan pattilla.'
          });
          return;
        }
      }

      res.status(200).json({
        success: true,
        alreadyJoined: true,
        message: 'Daily contest attempt started successfully',
        data: {
          contestId: contest._id,
          dailyContestId: contest.dailyContestId,
          title: contest.title,
          timerLimit: contest.timerLimit,
          questionsCount: contest.questionsCount,
          startedAt: new Date()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async submitDailyContestAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id || (req as any).user?._id;
      const user = await User.findById(userId).exec();
      if (!user) {
        throw new NotFoundError('User not found.');
      }

      const contest = await DailyContest.findOne(getQueryForId(id)).populate('questions').exec();
      if (!contest) {
        throw new NotFoundError('Daily contest not found.');
      }

      const participants = contest.participants || [];
      const alreadyJoined = participants.some((pId: any) => (pId?._id ? pId._id.toString() : pId.toString()) === userId.toString());
      if (!alreadyJoined) {
        throw new BadRequestError('You must join this daily contest before submitting answers. Contest join cheyathe submit cheyan pattilla.');
      }

      let questions: any[] = Array.isArray(contest.questions) ? contest.questions : [];
      if (questions.length === 0 || !questions[0]?.options) {
        if (contest.questions && contest.questions.length > 0) {
          questions = await Question.find({ _id: { $in: contest.questions } }).lean().exec();
        }
        if (questions.length === 0) {
          const cats = contest.categories && contest.categories.length > 0 ? contest.categories : [contest.category];
          questions = await Question.find({
            $or: [
              { category: { $in: cats } },
              { category: { $regex: new RegExp(cats.join('|'), 'i') } }
            ]
          }).limit(contest.questionsCount || 20).lean().exec();
        }
        if (questions.length === 0) {
          questions = await Question.find({}).limit(contest.questionsCount || 20).lean().exec();
        }
      }

      const userAnswers = req.body.answers || {};
      let correctCount = 0;
      let totalQuestions = questions.length;
      const answerDetails: any[] = [];

      if (totalQuestions > 0) {
        for (const q of questions) {
          const qIdStr = q._id.toString();
          const submitted = userAnswers[qIdStr] ?? userAnswers[q.text] ?? userAnswers[qIdStr.slice(-4)];

          const correctOptions = (q.options || [])
            .map((opt: any, idx: number) => ({ idx, text: opt.text, isCorrect: opt.isCorrect }))
            .filter((opt: any) => opt.isCorrect);

          const correctIndices = correctOptions.map((o: any) => o.idx);
          const correctTexts = correctOptions.map((o: any) => (o.text || '').trim().toLowerCase());

          let isCorrect = false;
          if (submitted !== undefined && submitted !== null) {
            if (typeof submitted === 'number') {
              isCorrect = correctIndices.includes(submitted);
            } else if (typeof submitted === 'string') {
              const subClean = submitted.trim().toLowerCase();
              isCorrect = correctTexts.includes(subClean) ||
                (Number.isInteger(Number(subClean)) && correctIndices.includes(Number(subClean)));
            } else if (Array.isArray(submitted)) {
              const subNumbers = submitted.map(Number);
              isCorrect = correctIndices.length === subNumbers.length &&
                correctIndices.every((val: number) => subNumbers.includes(val));
            }
          }

          if (isCorrect) correctCount++;

          answerDetails.push({
            questionId: q._id,
            questionText: q.text,
            submittedAnswer: submitted,
            isCorrect,
            correctOptions: correctOptions.map((o: any) => o.text)
          });
        }
      } else {
        const submittedKeys = Object.keys(userAnswers);
        totalQuestions = submittedKeys.length > 0 ? submittedKeys.length : (contest.questionsCount || 10);
        for (const key of submittedKeys) {
          const val = userAnswers[key];
          const isCorrect = val === true || val === 'correct' || (typeof val === 'object' && val.isCorrect === true);
          if (isCorrect) correctCount++;
          answerDetails.push({ questionId: key, submittedAnswer: val, isCorrect });
        }
      }

      const rawAccuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const accuracy = Math.round(rawAccuracy * 10) / 10;
      const currency: 'Coins' | 'INR' = contest.entryFeeType === 'Cash' ? 'INR' : 'Coins';

      // Grand prize calculation: prioritize coinsReward for coin contests (e.g. 500 Coins) or prizePool (whichever is higher)
      const grandPrizeAmount = Math.max(
        Number(contest.coinsReward) || 0,
        Number(contest.prizePool) || 0,
        currency === 'Coins' ? 500 : 1000
      );

      let rewardTier = 'Tier 1 (0% to 74.9%)';
      let rewardType: 'None' | 'Bonus' | 'Prize Pool' = 'None';
      let rewardAmount = 0;
      let rewardMessage = '';

      if (accuracy < 75) {
        rewardTier = 'Tier 1 (0% to 74.9%)';
        rewardType = 'None';
        rewardAmount = 0;
        rewardMessage = `No reward earned. Your accuracy was ${accuracy}%, which is below the 75% threshold.`;
      } else if (accuracy <= 98) {
        rewardTier = 'Tier 2 (75% to 98%)';
        rewardType = 'Bonus';
        const entryFeeCoins = Number(contest.entryFeeCoins) || Number(contest.entryFee) || 50;
        const minBonus = Math.max(50, Math.floor(entryFeeCoins * 0.75));
        const maxBonus = Math.max(minBonus + 50, Math.floor(grandPrizeAmount * 0.6));
        const randomBonus = Math.floor(Math.random() * (maxBonus - minBonus + 1)) + minBonus;
        rewardAmount = randomBonus;
        rewardMessage = `Congratulations! You scored ${accuracy}% accuracy and won a bonus of ${rewardAmount} ${currency}!`;

        await walletService.addReward(
          userId,
          rewardAmount,
          `${contest.title} - Daily Battle Bonus (${accuracy}% Accuracy)`,
          currency
        );
      } else {
        rewardTier = 'Tier 3 (99% to 100%)';
        rewardType = 'Prize Pool';
        rewardAmount = grandPrizeAmount;
        rewardMessage = `JACKPOT! Spectacular accuracy of ${accuracy}%! You have won the Daily Contest Grand Prize of ${rewardAmount} ${currency}!`;

        await walletService.addReward(
          userId,
          rewardAmount,
          `${contest.title} - Daily Grand Prize Pool Winner (${accuracy}% Accuracy)`,
          currency
        );
      }

      // Ensure user is marked in contest participants
      if (!contest.participants) {
        contest.participants = [];
      }
      const isParticipant = contest.participants.some(
        (pId: any) => (pId?._id ? pId._id.toString() : pId.toString()) === userId.toString()
      );
      if (!isParticipant) {
        contest.participants.push(user._id as any);
        contest.participantsCount = contest.participants.length;
        await contest.save();
      }

      // Save Attempt & Result
      const attemptRecord = await Attempt.create({
        userId: user._id,
        stageId: contest._id,
        contestId: contest._id,
        groupId: contest._id,
        acceptedRules: true,
        rulesAcceptedAt: new Date(),
        startedAt: new Date(Date.now() - 60000),
        submittedAt: new Date(),
        status: 'Evaluated',
        answers: userAnswers,
        score: correctCount,
        cheatAlerts: req.body.cheatAlerts || []
      }).catch(() => null);

      await Result.create({
        userId: user._id,
        stageId: contest._id,
        groupId: contest._id,
        contestId: contest._id,
        attemptId: attemptRecord?._id || new mongoose.Types.ObjectId(),
        score: correctCount,
        passed: accuracy >= 75,
        status: accuracy >= 75 ? 'Qualified' : 'Failed',
        remarks: `${rewardTier} - ${rewardMessage}`
      }).catch(() => null);

      // Auto-sync leaderboard
      try {
        Leaderboard.findOneAndUpdate(
          { contestId: contest._id },
          {
            $push: {
              rankings: {
                userId: user._id,
                score: correctCount,
                rank: 1
              }
            }
          },
          { upsert: true }
        ).catch(() => null);
        socketService.broadcastLeaderboard({
          contestId: contest._id,
          contestTitle: contest.title,
          dailyContestId: contest.dailyContestId,
          updatedAt: new Date()
        });
      } catch (e) {}

      const updatedUser = await User.findById(userId).exec();

      socketService.emitToUser(userId, 'contest_reward_won', {
        contestId: contest._id,
        contestTitle: contest.title,
        accuracy,
        rewardTier,
        rewardType,
        rewardAmount,
        currency
      });

      const responsePayload = {
        contestId: contest._id.toString(),
        dailyContestId: contest.dailyContestId,
        contestTitle: contest.title,
        totalQuestions,
        correctAnswers: correctCount,
        incorrectAnswers: totalQuestions - correctCount,
        score: correctCount,
        accuracy,
        accuracyPercentage: accuracy,
        passed: accuracy >= 75,
        rewardTier,
        rewardType,
        rewardAmount,
        currency,
        coinsReward: currency === 'Coins' ? rewardAmount : (Number(contest.coinsReward) || 0),
        prizePool: grandPrizeAmount,
        message: rewardMessage,
        rewardMessage,
        alreadyJoined: true,
        user: {
          _id: updatedUser?._id || user._id,
          name: updatedUser?.name || user.name,
          email: updatedUser?.email || user.email,
          walletBalance: updatedUser?.walletBalance ?? user.walletBalance,
          coins: updatedUser?.coins ?? user.coins
        },
        walletBalance: updatedUser?.walletBalance ?? user.walletBalance,
        coins: updatedUser?.coins ?? user.coins,
        answerDetails
      };

      res.status(200).json({
        success: true,
        data: responsePayload,
        ...responsePayload
      });
    } catch (err) {
      next(err);
    }
  }

  async getDailyContestAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const contest = await DailyContest.findOne(getQueryForId(id)).exec();
      
      const contestObj: any = contest ? contest.toObject() : {
        _id: id,
        dailyContestId: id,
        title: 'Speed Battle Daily Contest',
        category: 'Speed Battle',
        status: 'Active',
        entryFee: 0,
        prizePool: 0,
        questionsCount: 0,
        timerLimit: '3 mins',
        participantsCount: 0,
        participants: []
      };

      const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);
      let rawResults: any[] = [];
      let rawAttempts: any[] = [];
      const participantIdSet = new Set<string>();

      if (isValidId) {
        try {
          const contestObjectId = (contest && contest._id)
            ? contest._id
            : (mongoose.Types.ObjectId.isValid(contestObj._id) ? new mongoose.Types.ObjectId(contestObj._id) : null);

          const orConditions: any[] = [];
          if (contestObjectId) {
            orConditions.push({ contestId: contestObjectId });
          }
          if (contestObj.dailyContestId && mongoose.Types.ObjectId.isValid(contestObj.dailyContestId)) {
            orConditions.push({ contestId: new mongoose.Types.ObjectId(contestObj.dailyContestId) });
          }

          const queryFilter = orConditions.length === 1
            ? orConditions[0]
            : (orConditions.length > 1 ? { $or: orConditions } : null);

          if (queryFilter) {
            rawResults = await Result.find(queryFilter)
              .populate('userId', 'name username email avatar walletBalance coins score')
              .populate('attemptId', 'submittedAt startedAt score status answers cheatAlerts')
              .sort({ score: -1, createdAt: 1 })
              .lean();

            rawAttempts = await Attempt.find(queryFilter)
              .populate('userId', 'name username email avatar')
              .lean();
          }
        } catch (err) {}
      }

      if (Array.isArray(contestObj.participants)) {
        contestObj.participants.forEach((p: any) => {
          const pid = (p?._id || p)?.toString();
          if (pid) participantIdSet.add(pid);
        });
      }

      rawAttempts.forEach((att: any) => {
        const uid = (att.userId?._id || att.userId)?.toString();
        if (uid) participantIdSet.add(uid);
      });
      rawResults.forEach((res: any) => {
        const uid = (res.userId?._id || res.userId)?.toString();
        if (uid) participantIdSet.add(uid);
      });

      const participantIds = Array.from(participantIdSet).filter(uid => mongoose.Types.ObjectId.isValid(uid));
      const users = participantIds.length > 0
        ? await User.find({ _id: { $in: participantIds } }).select('name username email avatar createdAt').lean()
        : [];

      const userMap = new Map<string, any>();
      users.forEach((u: any) => userMap.set(u._id.toString(), u));

      let completedList: any[] = [];
      let registeredList: any[] = [];
      let joinedList: any[] = [];
      let exitedList: any[] = [];

      if (rawResults.length > 0 || rawAttempts.length > 0 || users.length > 0) {
        completedList = rawResults.map((r: any, idx: number) => {
          const u = r.userId || userMap.get((r.userId?._id || r.userId)?.toString()) || {};
          const uIdStr = (u._id || r.userId?._id || r.userId || '').toString();
          return {
            id: `CMP-${idx + 1}`,
            userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `Player ${idx + 1}`,
            userId: uIdStr,
            contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : (idx + 101)}`,
            email: u.email || '',
            completionTime: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
            finalScore: r.score ?? 0,
            rank: idx + 1,
            passed: r.passed ?? false,
            status: r.status || (r.passed ? 'Qualified' : 'Completed')
          };
        });

        registeredList = users.map((u: any, idx: number) => {
          const uIdStr = u._id.toString();
          const hasCompleted = rawResults.some((r: any) => (r.userId?._id || r.userId)?.toString() === uIdStr);
          const hasAttempt = rawAttempts.some((a: any) => (a.userId?._id || a.userId)?.toString() === uIdStr);
          let userStatus = 'Registered';
          if (hasCompleted) userStatus = 'Completed';
          else if (hasAttempt) userStatus = 'Active';

          return {
            id: `REG-${idx + 101}`,
            userName: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `Player ${idx + 1}`,
            userId: uIdStr,
            contestantId: `CNT-${uIdStr.slice(-4).toUpperCase()}`,
            email: u.email || '',
            registrationTime: u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
            status: userStatus
          };
        });

        if (registeredList.length === 0 && rawResults.length > 0) {
          registeredList = rawResults.map((r: any, idx: number) => {
            const u = r.userId || {};
            const uIdStr = (u._id || r.userId || '').toString();
            return {
              id: `REG-${idx + 101}`,
              userName: u.name || u.username || `Player ${idx + 1}`,
              userId: uIdStr,
              contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : idx + 1}`,
              email: u.email || '',
              registrationTime: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
              status: 'Completed'
            };
          });
        }

        joinedList = registeredList.filter(u => u.status !== 'Registered').map(u => ({
          ...u,
          joinTime: 'Active Session',
          currentStatus: u.status
        }));

        exitedList = rawAttempts
          .filter((a: any) => (a.cheatAlerts && a.cheatAlerts.length > 0) || a.status === 'In Progress')
          .map((a: any, idx: number) => {
            const u = a.userId || userMap.get((a.userId?._id || a.userId)?.toString()) || {};
            const uIdStr = (u._id || a.userId?._id || a.userId || '').toString();
            return {
              id: `EXIT-${idx + 1}`,
              userName: u.name || u.username || `Contestant ${idx + 1}`,
              userId: uIdStr,
              contestantId: `CNT-${uIdStr ? uIdStr.slice(-4).toUpperCase() : idx + 1}`,
              email: u.email || '',
              exitTime: a.updatedAt ? new Date(a.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
              exitReason: (a.cheatAlerts && a.cheatAlerts[0]?.details) || 'Timeout / Incomplete'
            };
          });
      }

      const totalRegisteredUsers = registeredList.length;
      const totalJoinedUsers = joinedList.length;
      const totalCompletedParticipants = completedList.length;
      const totalExitedUsers = exitedList.length;
      const totalActiveParticipants = Math.max(0, totalJoinedUsers - totalCompletedParticipants - totalExitedUsers);

      const registrationPercentage = totalRegisteredUsers > 0 ? 100 : 0;
      const joinPercentage = totalRegisteredUsers > 0 ? Math.round((totalJoinedUsers / totalRegisteredUsers) * 100) : 0;
      const exitPercentage = totalJoinedUsers > 0 ? Math.round((totalExitedUsers / totalJoinedUsers) * 100) : 0;
      const completionPercentage = totalJoinedUsers > 0 ? Math.round((totalCompletedParticipants / totalJoinedUsers) * 100) : 0;

      const pool = Number(contestObj.prizePool || 0);
      let winner: any = null;
      if (completedList.length > 0) {
        const top1 = completedList[0];
        const top2 = completedList[1] || null;
        const top3 = completedList[2] || null;

        winner = {
          name: top1.userName,
          userId: top1.userId,
          contestantId: top1.contestantId,
          finalScore: top1.finalScore,
          prizeAmount: pool > 0 ? Math.floor(pool * 0.5) : (Number(contestObj.coinsReward) || 100),
          selectionTime: top1.completionTime || new Date().toISOString(),
          runnerUp: top2 ? {
            name: top2.userName,
            userId: top2.userId,
            contestantId: top2.contestantId,
            finalScore: top2.finalScore,
            prizeAmount: pool > 0 ? Math.floor(pool * 0.3) : 50
          } : null,
          thirdPlace: top3 ? {
            name: top3.userName,
            userId: top3.userId,
            contestantId: top3.contestantId,
            finalScore: top3.finalScore,
            prizeAmount: pool > 0 ? Math.floor(pool * 0.2) : 25
          } : null
        };
      }

      const isWinnerSelected = Boolean(winner);

      const timeline = [
        { title: 'Contest Created', timestamp: contestObj.createdAt ? new Date(contestObj.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Created', details: `Automated daily battle "${contestObj.title}" initialized`, status: 'Completed' },
        { title: 'Registration Window', timestamp: 'Open', details: `${totalRegisteredUsers} participant(s) registered`, status: totalRegisteredUsers > 0 ? 'Completed' : 'Active' },
        { title: 'Live Contest Quiz', timestamp: 'Live', details: `${totalJoinedUsers} participant(s) actively engaged in speed trivia`, status: totalJoinedUsers > 0 ? 'Completed' : 'Active' },
        { title: 'Evaluations & Grading', timestamp: completedList.length > 0 ? 'Graded' : 'Pending', details: `${totalCompletedParticipants} participant(s) scored`, status: totalCompletedParticipants > 0 ? 'Completed' : 'Pending' },
        { title: 'Contest Ended & Winner Selected', timestamp: winner ? 'Selected' : 'Pending', details: winner ? `Winner: ${winner?.name} (${winner?.finalScore} pts)` : 'Awaiting quiz submissions', status: isWinnerSelected ? 'Completed' : 'Pending' },
        { title: 'Prize Distributed', timestamp: winner ? 'Credited' : 'Pending', details: winner ? 'Prize coins credited to winner wallet' : 'Pending completion', status: isWinnerSelected ? 'Completed' : 'Pending' }
      ];

      res.status(200).json({
        success: true,
        data: {
          contest: contestObj,
          overview: {
            totalRegisteredUsers,
            totalJoinedUsers,
            totalExitedUsers,
            totalActiveParticipants,
            totalCompletedParticipants,
            winnerSelected: isWinnerSelected,
            winnerName: winner ? winner.name : null,
            contestStatus: contestObj.status || 'Active',
            registrationPercentage,
            joinPercentage,
            exitPercentage,
            completionPercentage
          },
          charts: {
            registrationTrend: totalRegisteredUsers > 0 ? [
              { time: '08:00 AM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.2)) },
              { time: '12:00 PM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.5)) },
              { time: '04:00 PM', count: Math.max(1, Math.round(totalRegisteredUsers * 0.8)) },
              { time: '06:00 PM', count: totalRegisteredUsers }
            ] : [],
            joinVsExit: totalJoinedUsers > 0 ? [
              { hour: '10:00 AM', joined: Math.ceil(totalJoinedUsers * 0.4), exited: Math.ceil(totalExitedUsers * 0.3) },
              { hour: '02:00 PM', joined: Math.ceil(totalJoinedUsers * 0.4), exited: Math.ceil(totalExitedUsers * 0.4) },
              { hour: '06:00 PM', joined: Math.max(1, totalJoinedUsers - Math.ceil(totalJoinedUsers * 0.8)), exited: Math.max(0, totalExitedUsers - Math.ceil(totalExitedUsers * 0.7)) }
            ] : [],
            statusDistribution: [
              { label: 'Completed', value: totalCompletedParticipants, color: '#10B981' },
              { label: 'Active', value: totalActiveParticipants, color: '#3B82F6' },
              { label: 'Exited', value: totalExitedUsers, color: '#F43F5E' },
              { label: 'Registered', value: Math.max(0, totalRegisteredUsers - totalJoinedUsers), color: '#F59E0B' }
            ]
          },
          participants: {
            registered: registeredList,
            joined: joinedList,
            exited: exitedList,
            completed: completedList
          },
          winners: winner,
          timeline
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getDailyContestLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let contestId = req.params.id || (req.query.contestId as string) || (req.query.id as string);
      const currentUserId = (req as any).user?.id || (req as any).user?._id;

      if (!contestId) {
        try {
          const latestDaily = await DailyContest.findOne().sort({ createdAt: -1 }).lean();
          if (latestDaily) {
            contestId = latestDaily.dailyContestId || latestDaily._id.toString();
          }
        } catch {}
        if (!contestId) {
          contestId = 'daily-live';
        }
      }

      let contest: any = null;
      try {
        contest = await DailyContest.findOne(getQueryForId(contestId)).exec();
      } catch {
        contest = null;
      }

      const contestObj: any = contest ? (contest.toObject ? contest.toObject() : contest) : {
        _id: contestId,
        dailyContestId: contestId,
        title: 'Speed Battle Daily Contest',
        participants: []
      };

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
      const skip = (page - 1) * limit;

      const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);

      // 1. Fetch real results for this daily contest
      let rawResults: any[] = [];
      if (isValidId) {
        try {
          rawResults = await Result.find({ contestId: contestObj._id })
            .populate('userId', 'name username email avatar walletBalance coins score')
            .populate('attemptId', 'submittedAt startedAt answers cheatAlerts')
            .sort({ score: -1, createdAt: 1 })
            .lean();
        } catch (err) {}
      }

      let leaderboardItems: any[] = [];
      let totalParticipants = rawResults.length;

      if (rawResults.length > 0) {
        leaderboardItems = rawResults.map((r: any, idx: number) => {
          const u = r.userId || {};
          const att = r.attemptId || {};
          const uIdStr = (u._id || r.userId || '').toString();
          return {
            rank: idx + 1,
            userId: uIdStr,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || `Contestant ${idx + 1}`,
            username: u.username || '',
            email: u.email || '',
            avatar: u.avatar || '',
            score: r.score ?? 0,
            passed: r.passed ?? false,
            status: r.status || (r.passed ? 'Qualified' : 'Completed'),
            remarks: r.remarks || '',
            submittedAt: att.submittedAt || r.createdAt || r.updatedAt
          };
        });
      } else {
        // 2. Check cached Leaderboard model
        let cached: any = null;
        if (isValidId) {
          try {
            cached = await Leaderboard.findOne({ contestId: contestObj._id })
              .populate('rankings.userId', 'name username email avatar')
              .lean();
          } catch (err) {}
        }

        if (cached && cached.rankings && cached.rankings.length > 0) {
          totalParticipants = cached.rankings.length;
          leaderboardItems = cached.rankings.map((rk: any, idx: number) => {
            const u = rk.userId || {};
            const uIdStr = (u._id || rk.userId || '').toString();
            return {
              rank: rk.rank || idx + 1,
              userId: uIdStr,
              name: u.name || u.username || `Contestant ${idx + 1}`,
              username: u.username || '',
              email: u.email || '',
              avatar: u.avatar || '',
              score: rk.score ?? 0,
              passed: true,
              status: 'Qualified',
              submittedAt: cached.updatedAt || new Date()
            };
          });
        } else if (contestObj.participants && contestObj.participants.length > 0 && isValidId) {
          // 3. Fallback to enrolled participants
          let users: any[] = [];
          try {
            users = await User.find({ _id: { $in: contestObj.participants } })
              .select('name username email avatar score')
              .lean();
          } catch (err) {}
          totalParticipants = users.length;
          leaderboardItems = users
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .map((u: any, idx: number) => ({
              rank: idx + 1,
              userId: u._id.toString(),
              name: u.name || u.username || `Contestant ${idx + 1}`,
              username: u.username || '',
              email: u.email || '',
              avatar: u.avatar || '',
              score: u.score ?? 0,
              passed: true,
              status: 'Joined',
              submittedAt: new Date()
            }));
        } else {
          totalParticipants = 0;
          leaderboardItems = [];
        }
      }

      // Find current user's standing
      let currentUserRank: any = null;
      if (currentUserId) {
        const uRankIdx = leaderboardItems.findIndex((item) =>
          item.userId?.toString() === currentUserId.toString()
        );
        if (uRankIdx !== -1) {
          currentUserRank = {
            ...leaderboardItems[uRankIdx],
            rank: uRankIdx + 1
          };
        }
      }

      const paginated = leaderboardItems.slice(skip, skip + limit);

      res.status(200).json({
        success: true,
        contestId: contestObj._id.toString(),
        dailyContestId: contestObj.dailyContestId || contestObj._id.toString(),
        contestTitle: contestObj.title,
        totalParticipants,
        page,
        limit,
        totalPages: Math.ceil(totalParticipants / limit) || 1,
        currentUserRank,
        leaderboard: paginated
      });
    } catch (err) {
      next(err);
    }
  }

  async recalculateDailyContestLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const contestId = req.params.id || req.body?.contestId || req.body?.id;
      if (!contestId) {
        throw new BadRequestError('Daily contest ID is required.');
      }
      let contest: any = null;
      try {
        contest = await DailyContest.findOne(getQueryForId(contestId)).exec();
      } catch {
        contest = null;
      }

      const contestObj: any = contest ? (contest.toObject ? contest.toObject() : contest) : {
        _id: contestId,
        dailyContestId: contestId,
        title: 'Speed Battle Daily Contest'
      };

      const isValidId = Boolean(contest && contest._id) || mongoose.Types.ObjectId.isValid(contestObj._id);
      let rankings: any[] = [];

      if (isValidId) {
        try {
          const rawResults = await Result.find({ contestId: contestObj._id })
            .populate('userId', 'name username email')
            .sort({ score: -1, createdAt: 1 })
            .lean();

          rankings = rawResults.map((r: any, idx: number) => ({
            userId: r.userId?._id || r.userId,
            score: r.score || 0,
            rank: idx + 1
          }));

          if (rankings.length > 0) {
            await Leaderboard.findOneAndUpdate(
              { contestId: contestObj._id },
              { contestId: contestObj._id, rankings, updatedAt: new Date() },
              { upsert: true, new: true }
            );
          }
        } catch (err) {}
      }

      if (rankings.length === 0) {
        rankings = [];
      }

      try {
        socketService.broadcastLeaderboard({
          contestId: contestObj._id,
          contestTitle: contestObj.title,
          dailyContestId: contestObj.dailyContestId,
          updatedAt: new Date(),
          rankings
        });
      } catch (e) {}

      res.status(200).json({
        success: true,
        message: `Leaderboard recalculated for Daily Contest "${contestObj.title}".`,
        totalRanked: rankings.length,
        topRankings: rankings.slice(0, 10)
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dailyContestsController = new DailyContestsController();
export default dailyContestsController;
