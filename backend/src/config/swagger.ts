export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Haka Contestant Platform API Documentation',
    version: '1.0.0',
    description: 'Complete API flow for Contestant onboarding, email/mobile OTP verification, image upload, registration completion, authentication, profile management, KYC, contest participation, and wallet operations.'
  },
  servers: [
    {
      url: 'http://localhost:10000',
      description: 'Local Backend Server'
    },
    {
      url: 'https://api.hakalive.in',
      description: 'Production Server'
    }
  ],
  tags: [
    { name: '1. Contestant Registration Flow', description: 'Step-by-step onboarding (Phone Verify -> Complete Profile)' },
    { name: '2. Contestant Auth & Session', description: 'Login, logout, session state, and token refresh' },
    { name: '3. Contestant Profile & KYC', description: 'Profile management, avatar update, and KYC verification' },
    { name: '4. Contest Participation', description: 'Contest listing, joining, stage attempts, and question submissions' },
    { name: '5. Daily Contests (24h Arena)', description: 'Daily contest listing, 24h reset arena, and participation' },
    { name: '6. Admin Contest & Daily Contest Management', description: 'Admin CRUD operations for Contests and Daily Contests' },
    { name: '7. Wallet & Transactions', description: 'Wallet deposits and transaction history' },
    { name: '8. Mobile App API (Contestant V1)', description: 'Mobile V1 endpoints for contestant registration, login, profile management, image upload, and password change' },
    { name: '9. Question Bank & Quiz Builder', description: 'Question bank CRUD, question pools, bulk imports, and random selection' },
    { name: '10. CMS & Social Media', description: 'CMS social links, platform names, user handles, logos, and legal docs' },
    { name: '11. Bi-Weekly Room Cycle Module', description: 'Complete REST API endpoints for Rooms, 10-Cycle Blueprint, Submissions Evaluation, Leaderboard, Rewards, and Settings' },
    { name: '12. Grand Contest Management', description: 'Grand Contest creation, task connections, analytics, and lifecycle management' },
    { name: '13. Task Management', description: 'Complete REST API endpoints for Task creation, listing, details lookup, status toggle, and deletion' },
    { name: '14. Payment Gateway & Razorpay Setup', description: 'Razorpay payment gateway configuration, credentials, webhooks, and payment channels' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your JWT access token obtained during login or registration completion.'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e...' },
          name: { type: 'string', example: 'Aarav Sharma' },
          username: { type: 'string', example: 'aarav_sharma' },
          email: { type: 'string', example: 'aarav@example.com' },
          phone: { type: 'string', example: '+919876543210' },
          role: { type: 'string', example: 'Contestant' },
          avatar: { type: 'string', example: '/uploads/general/profile_1723630000.png' },
          status: { type: 'string', example: 'Active' },
          kycStatus: { type: 'string', example: 'Pending' },
          walletBalance: { type: 'number', example: 100 }
        }
      },
      ContestResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e...' },
          contestId: { type: 'string', example: 'CNT-2026-1002' },
          title: { type: 'string', example: 'Mega Speed Battle Season 1' },
          description: { type: 'string', example: 'Compete with top contestants in speed quiz' },
          rules: { type: 'string', example: '1. Complete all quiz stages within timer countdown.' },
          guidelines: { type: 'string', example: '1. Ensure stable internet connection.' },
          durationDays: { type: 'number', example: 7 },
          bannerUrl: { type: 'string', example: '/uploads/contest/cover_1723630000.png' },
          prizePool: { type: 'number', example: 50000, description: 'Prize pool in Coins 🪙' },
          entryFee: { type: 'number', example: 0, description: 'Entry fee amount (0 for Free Entry)' },
          entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Free' },
          isFree: { type: 'boolean', example: true, description: 'True if contest has free entry' },
          entryFeeCoins: { type: 'number', example: 0, description: 'Entry fee in Coins 🪙' },
          coinsReward: { type: 'number', example: 1000, description: 'Coins 🪙 reward for winning' },
          status: { 
            type: 'string', 
            enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Registration Closed', 'Live', 'Completed', 'Maintenance', 'Cancelled'],
            example: 'Registration Open' 
          },
          categories: { type: 'array', items: { type: 'string' }, example: ['Technology & Coding'] }
        }
      },
      DailyContestResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e...' },
          dailyContestId: { type: 'string', example: 'DLC-1723650000000' },
          title: { type: 'string', example: 'Daily Speed Quiz Rush 2026' },
          category: { type: 'string', example: 'Speed Battle' },
          categories: { type: 'array', items: { type: 'string' }, example: ['Speed Battle'] },
          description: { type: 'string', example: '20 rapid-fire questions in 3 minutes' },
          rules: { type: 'string', example: '1. Complete all quiz questions before timer expires.' },
          guidelines: { type: 'string', example: '1. Single attempt per participant per 24 hours.' },
          durationDays: { type: 'number', example: 1 },
          bannerUrl: { type: 'string', example: '/uploads/daily-contest/cover_1723630000.png' },
          prizePool: { type: 'number', example: 10000, description: 'Prize pool in Coins 🪙' },
          entryFee: { type: 'number', example: 0, description: 'Entry fee amount (0 for Free Entry)' },
          entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Free' },
          isFree: { type: 'boolean', example: true },
          entryFeeCoins: { type: 'number', example: 0 },
          coinsReward: { type: 'number', example: 10000 },
          timerLimit: { type: 'string', example: '3 mins' },
          questionsCount: { type: 'number', example: 20 },
          difficulty: { type: 'string', example: 'Medium' },
          resetIntervalHours: { type: 'number', example: 24 },
          isActive: { type: 'boolean', example: true },
          participantsCount: { type: 'number', example: 1420 },
          status: { 
            type: 'string', 
            enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Completed', 'Maintenance'],
            example: 'Registration Open' 
          }
        }
      },
      RoomResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e...' },
          code: { type: 'string', example: 'RM-001' },
          name: { type: 'string', example: 'Alpha Strikers' },
          description: { type: 'string', example: 'Top competitive room for speed battles' },
          rules: { type: 'string', example: '1. Maintain top submission score.' },
          guidelines: { type: 'string', example: '1. Follow sportsmanship guidelines.' },
          durationDays: { type: 'number', example: 14 },
          maxMembers: { type: 'number', example: 50 },
          membersCount: { type: 'number', example: 12 },
          currentCycle: { type: 'number', example: 1 },
          cycleIds: { type: 'array', items: { type: 'string' } },
          roomImage: { type: 'string', example: '/uploads/room/banner_1723630000.png' },
          status: { type: 'string', enum: ['Active', 'Inactive', 'Archived'], example: 'Active' },
          isJoined: { type: 'boolean', example: true, description: 'True if authenticated user has joined this room' },
          joined: { type: 'boolean', example: true, description: 'True if authenticated user has joined this room' },
          hasJoined: { type: 'boolean', example: true, description: 'True if authenticated user has joined this room' },
          totalPoints: { type: 'number', example: 1250 },
          rank: { type: 'number', example: 1 }
        }
      },
      CycleResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e...' },
          cycleNumber: { type: 'number', example: 1 },
          title: { type: 'string', example: 'Bi-Weekly Sprint 1' },
          description: { type: 'string', example: '14-day competitive sprint' },
          rules: { type: 'string', example: '1. Complete all assigned tasks before timer.' },
          guidelines: { type: 'string', example: '1. Verify file attachments before submitting.' },
          durationDays: { type: 'number', example: 14 },
          prizePoolCoins: { type: 'number', example: 5000 },
          timerMinutes: { type: 'number', example: 60 },
          maxSeats: { type: 'number', example: 100 },
          status: { type: 'string', enum: ['Draft', 'Published', 'Running', 'Completed', 'Upcoming', 'Active', 'Archived'], example: 'Active' }
        }
      },
      GrandContestResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789abc' },
          contestId: { type: 'string', example: 'GNC-2026-98124' },
          title: { type: 'string', example: 'Grand Championship Season 1' },
          description: { type: 'string', example: 'Major competition featuring connected task challenges.' },
          rules: { type: 'string', example: '1. Complete all assigned task challenges before deadline.' },
          guidelines: { type: 'string', example: '1. Ensure accurate file format and size.' },
          durationDays: { type: 'number', example: 14 },
          prizePool: { type: 'number', example: 100000 },
          entryFee: { type: 'number', example: 499 },
          entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Cash' },
          isFree: { type: 'boolean', example: false },
          entryFeeCoins: { type: 'number', example: 0 },
          coinsReward: { type: 'number', example: 0 },
          tasksCount: { type: 'number', example: 5 },
          tasks: { type: 'array', items: { type: 'string' }, example: ['66bc91f24d9e987654321task'] },
          bannerUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
          imageUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
          videoUrl: { type: 'string', example: '' },
          fileAttachmentUrl: { type: 'string', example: '' },
          categories: { type: 'array', items: { type: 'string' }, example: ['Technology & Coding'] },
          sponsors: { type: 'array', items: { type: 'string' }, example: ['Haka Sponsor'] },
          startDate: { type: 'string', format: 'date-time', example: '2026-09-02T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2026-09-16T00:00:00.000Z' },
          status: { 
            type: 'string', 
            enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Registration Closed', 'Live', 'Completed', 'Maintenance', 'Cancelled'], 
            example: 'Registration Open' 
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-02T12:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-09-02T12:00:00.000Z' }
        }
      },
      TaskResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789abc' },
          title: { type: 'string', example: 'Daily Creative Video Challenge' },
          description: { type: 'string', example: 'Record a 30-second video explaining your strategy.' },
          instructions: { type: 'string', example: 'Ensure clear audio and steady camera.' },
          mediaUrl: { type: 'string', example: '/uploads/tasks/cover_1723630000.png' },
          taskType: { 
            type: 'string', 
            enum: ['Quiz', 'Creative', 'Photo', 'Video', 'Document', 'AI Prompt', 'Puzzle', 'Logic', 'Survey'], 
            example: 'Video' 
          },
          submissionType: { 
            type: 'string', 
            enum: ['Text', 'Image', 'Video', 'PDF', 'Document', 'URL', 'ZIP'], 
            example: 'Video' 
          },
          points: { type: 'number', example: 100 },
          bonusPoints: { type: 'number', example: 25 },
          penaltyPoints: { type: 'number', example: 0 },
          maxAttempts: { type: 'number', example: 3 },
          reviewType: { type: 'string', enum: ['Manual', 'AI', 'Auto'], example: 'AI' },
          status: { type: 'string', enum: ['Draft', 'Published', 'Running', 'Completed', 'Archived'], example: 'Published' },
          isMandatory: { type: 'boolean', example: true },
          order: { type: 'number', example: 1 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-02T12:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-09-02T12:00:00.000Z' }
        }
      },
      QuestionResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789abc' },
          poolId: { type: 'string', example: '66bc91f24d9e987654321def' },
          category: { type: 'string', example: 'Technology & Coding' },
          type: { type: 'string', enum: ['Single Choice', 'Multiple Choice', 'True False', 'Image Questions', 'Video Questions', 'Audio Questions'], example: 'Single Choice' },
          text: { type: 'string', example: 'What does CPU stand for?' },
          mediaUrl: { type: 'string', example: '' },
          imageUrl: { type: 'string', example: '' },
          videoUrl: { type: 'string', example: '' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string', example: 'Central Processing Unit' },
                isCorrect: { type: 'boolean', example: true },
                mediaUrl: { type: 'string', example: '' }
              }
            }
          },
          marks: { type: 'number', example: 1 },
          negativeMarks: { type: 'number', example: 0.25 },
          difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'], example: 'Medium' },
          explanation: { type: 'string', example: 'CPU stands for Central Processing Unit.' },
          questionTimer: { type: 'number', example: 30 }
        }
      },
      QuestionPoolResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e987654321def' },
          name: { type: 'string', example: 'General Knowledge Pool' },
          category: { type: 'string', example: 'General Knowledge' },
          description: { type: 'string', example: 'Default Question Pool for General Knowledge' }
        }
      },
      CMSSocialResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e987654321soc' },
          platform: { type: 'string', example: 'Instagram' },
          username: { type: 'string', example: '@hakaofficial' },
          handle: { type: 'string', example: '@hakaofficial' },
          url: { type: 'string', example: 'https://instagram.com/hakaofficial' },
          logoUrl: { type: 'string', example: '/uploads/social/logo_1723630000.png' },
          followerCount: { type: 'string', example: '50K+' },
          status: { type: 'string', enum: ['Active', 'Disabled'], example: 'Active' }
        }
      },
      CMSNewsResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e987654321nws' },
          headline: { type: 'string', example: 'Haka Platform Launches Grand Season 2026' },
          badgeTag: { type: 'string', example: 'Press Release' },
          priority: { type: 'string', enum: ['Normal', 'High'], example: 'High' },
          publisher: { type: 'string', example: 'TechCrunch' },
          externalUrl: { type: 'string', example: 'https://techcrunch.com/article' },
          imageUrl: { type: 'string', example: '/uploads/news/banner_1723630000.png' },
          coverImage: { type: 'string', example: '/uploads/news/banner_1723630000.png' },
          summary: { type: 'string', example: 'Summary of the press release...' },
          content: { type: 'string', example: 'Full article body content...' },
          publishedAt: { type: 'string', example: '2026-08-19' },
          status: { type: 'string', enum: ['Active', 'Archived'], example: 'Active' }
        }
      },
      CMSDocumentResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e987654321doc' },
          type: { type: 'string', enum: ['privacy', 'terms', 'about'], example: 'privacy' },
          title: { type: 'string', example: 'Privacy Policy' },
          version: { type: 'string', example: 'v1.0' },
          lastUpdated: { type: 'string', example: '2026-08-19' },
          author: { type: 'string', example: 'Legal Team' },
          status: { type: 'string', enum: ['Published', 'Draft'], example: 'Published' },
          content: { type: 'string', example: '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>' }
        }
      },
      RoomSubmissionResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789sub' },
          cycleId: { type: 'string', example: '66bc91f24d9e123456789cyc' },
          roomId: { type: 'string', example: '66bc91f24d9e123456789rm' },
          userId: { type: 'string', example: '66bc91f24d9e123456789usr' },
          taskId: { type: 'string', example: '66bc91f24d9e123456789tsk' },
          submissionType: { type: 'string', enum: ['Link', 'File', 'Text', 'Image', 'Video'], example: 'File' },
          mediaUrl: { type: 'string', example: '/uploads/submission/proof_1723630000.png' },
          proofNotes: { type: 'string', example: 'Task proof completed successfully.' },
          status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected', 'Needs Revision'], example: 'Pending' },
          score: { type: 'number', example: 100 },
          bonus: { type: 'number', example: 10 },
          penalty: { type: 'number', example: 0 },
          feedback: { type: 'string', example: 'Good job!' },
          submittedAt: { type: 'string', format: 'date-time', example: '2026-09-05T19:00:00.000Z' },
          reviewedAt: { type: 'string', format: 'date-time', example: '2026-09-05T19:10:00.000Z' }
        }
      },
      RoomMemberResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789mbr' },
          roomId: { type: 'string', example: '66bc91f24d9e123456789rm' },
          userId: { type: 'string', example: '66bc91f24d9e123456789usr' },
          role: { type: 'string', enum: ['Leader', 'Member'], example: 'Member' },
          accumulatedPoints: { type: 'number', example: 450 },
          completedTasksCount: { type: 'number', example: 5 },
          status: { type: 'string', enum: ['Active', 'Transferred', 'Removed'], example: 'Active' },
          joinedAt: { type: 'string', format: 'date-time', example: '2026-09-01T10:00:00.000Z' }
        }
      },
      RoomLeaderboardEntryResponse: {
        type: 'object',
        properties: {
          rank: { type: 'number', example: 1 },
          userId: { type: 'string', example: '66bc91f24d9e123456789usr' },
          name: { type: 'string', example: 'Aarav Sharma' },
          username: { type: 'string', example: 'aarav_sharma' },
          avatar: { type: 'string', example: '/uploads/general/avatar_1723630000.png' },
          roomId: { type: 'string', example: '66bc91f24d9e123456789rm' },
          roomName: { type: 'string', example: 'Alpha Strikers' },
          points: { type: 'number', example: 1250 },
          accumulatedPoints: { type: 'number', example: 1250 },
          tasksCompleted: { type: 'number', example: 12 },
          badge: { type: 'string', example: 'Gold' }
        }
      },
      RoomRewardResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789rew' },
          title: { type: 'string', example: 'Top 3 Cash Pool' },
          rewardType: { type: 'string', enum: ['Cash', 'Wallet Credit', 'Coupons', 'Badges', 'Certificates'], example: 'Cash' },
          amountOrValue: { type: 'number', example: 500 },
          minRank: { type: 'number', example: 1 },
          maxRank: { type: 'number', example: 3 },
          isActive: { type: 'boolean', example: true },
          description: { type: 'string', example: 'Reward distributed to top 3 ranked contestants' }
        }
      },
      RoomCycleSettingsResponse: {
        type: 'object',
        properties: {
          autoLocking: { type: 'boolean', example: true },
          maxRoomCapacity: { type: 'number', example: 50 },
          cycleDurationDays: { type: 'number', example: 14 },
          taskWeightPercentage: { type: 'number', example: 70 },
          quizWeightPercentage: { type: 'number', example: 30 },
          autoDistributeRewards: { type: 'boolean', example: false }
        }
      },
      RoomCycleAnalyticsResponse: {
        type: 'object',
        properties: {
          totalRooms: { type: 'number', example: 10 },
          activeRooms: { type: 'number', example: 8 },
          completedCycles: { type: 'number', example: 3 },
          activeCycleNumber: { type: 'number', example: 1 },
          pendingTasks: { type: 'number', example: 14 },
          averageScore: { type: 'number', example: 84 },
          completionRate: { type: 'number', example: 92 },
          topRooms: { type: 'array', items: { $ref: '#/components/schemas/RoomResponse' } }
        }
      },
      RoomCycleJoinStatusResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          isJoined: { type: 'boolean', example: true, description: 'True if contestant has joined the room cohort' },
          joined: { type: 'boolean', example: true },
          hasJoined: { type: 'boolean', example: true },
          completed: { type: 'boolean', example: true, description: 'True if contestant has completed all cycles and tasks in this room' },
          isCompleted: { type: 'boolean', example: true, description: 'True if contestant has completed all cycles and tasks in this room' },
          hasCompleted: { type: 'boolean', example: true, description: 'True if contestant has completed all cycles and tasks in this room' },
          message: { type: 'string', example: 'User has completed all cycles and tasks in this room contest' },
          data: {
            type: 'object',
            properties: {
              isJoined: { type: 'boolean', example: true },
              joined: { type: 'boolean', example: true },
              hasJoined: { type: 'boolean', example: true },
              completed: { type: 'boolean', example: true },
              isCompleted: { type: 'boolean', example: true },
              hasCompleted: { type: 'boolean', example: true },
              roomId: { type: 'string', example: '6a9805182c419f9617bb2ea2' },
              contestId: { type: 'string', example: '6a9d21e7155a5b06743543b1' },
              totalTasks: { type: 'number', example: 6 },
              completedTasks: { type: 'number', example: 6 },
              pendingTasks: { type: 'number', example: 0 },
              totalCycles: { type: 'number', example: 2 },
              completedCycles: { type: 'number', example: 2 },
              pendingCycles: { type: 'number', example: 0 }
            }
          }
        }
      },
      KYCResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789kyc' },
          userId: { type: 'string', example: '66bc91f24d9e123456789usr' },
          idType: { type: 'string', enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License'], example: 'Aadhaar' },
          idNumber: { type: 'string', example: 'XXXX-XXXX-1234' },
          documentFrontUrl: { type: 'string', example: '/uploads/kyc/front_1723630000.png' },
          documentBackUrl: { type: 'string', example: '/uploads/kyc/back_1723630000.png' },
          selfieUrl: { type: 'string', example: '/uploads/kyc/selfie_1723630000.png' },
          status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected'], example: 'Approved' },
          rejectionReason: { type: 'string', example: '' }
        }
      },
      WalletTransactionResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789txn' },
          userId: { type: 'string', example: '66bc91f24d9e123456789usr' },
          type: { type: 'string', enum: ['Deposit', 'Withdrawal', 'Contest Entry', 'Prize Win', 'Reward Bonus'], example: 'Prize Win' },
          amount: { type: 'number', example: 500 },
          currency: { type: 'string', enum: ['INR', 'Coins'], example: 'Coins' },
          status: { type: 'string', enum: ['Pending', 'Completed', 'Failed'], example: 'Completed' },
          referenceId: { type: 'string', example: 'TXN-2026-98124' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-05T18:00:00.000Z' }
        }
      },
      PaymentSettingsResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66bc91f24d9e123456789pay' },
          isEnabled: { type: 'boolean', example: true },
          environment: { type: 'string', enum: ['test', 'live'], example: 'test' },
          merchantName: { type: 'string', example: 'Haka Contest Platform' },
          merchantLogo: { type: 'string', example: 'https://hakalive.in/haka_favicon.png' },
          keyId: { type: 'string', example: 'rzp_test_9876543210abcd' },
          keySecret: { type: 'string', example: 'sec_test_9876543210secretkey' },
          webhookSecret: { type: 'string', example: 'whsec_9876543210webhooksecret' },
          currency: { type: 'string', example: 'INR' },
          autoCapture: { type: 'boolean', example: true },
          acceptedMethods: {
            type: 'object',
            properties: {
              upi: { type: 'boolean', example: true },
              cards: { type: 'boolean', example: true },
              netbanking: { type: 'boolean', example: true },
              wallets: { type: 'boolean', example: true },
              paylater: { type: 'boolean', example: false },
              emi: { type: 'boolean', example: false }
            }
          },
          webhookUrl: { type: 'string', example: 'http://hakalive.in/api/v1/payments/razorpay/webhook' }
        }
      }
    }
  },
  paths: {
    // ----------------------------------------------------
    // 1. CONTESTANT REGISTRATION FLOW
    // ----------------------------------------------------
    '/api/auth/register/email': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 1a: Start Email Verification (Send OTP)',
        description: 'Submits user email and optional referral code to initiate a registration session and send an email OTP.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'contestant@example.com' },
                  referralCode: { type: 'string', example: 'REF1002' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email OTP generated and sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: { type: 'string', example: '66bc91f24d9e...' },
                    mockOtp: { type: 'string', example: '123456' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/auth/register/email/otp': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 1a: Verify Email OTP',
        description: 'Verifies the 6-digit OTP sent to the user email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'otp'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    sessionId: { type: 'string', example: '66bc91f24d9e...' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/auth/register/email/resend-otp': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 1a: Resend Email OTP',
        description: 'Resends a fresh Email OTP to the user for an existing registration session.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Email OTP resent.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    mockOtp: { type: 'string', example: '999999' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register/mobile': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 1: Start Mobile Verification (Send OTP)',
        description: 'Sends a 6-digit Mobile SMS OTP to the contestant phone number. Supports both phone-first registration and mobile OTP sign-in for existing users.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' },
                  countryCode: { type: 'string', example: '+91' },
                  phone: { type: 'string', example: '9876543210' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Mobile OTP sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: { type: 'string', example: '66bc91f24d9e...' },
                    mockOtp: { type: 'string', example: '123456' },
                    isRegistered: { type: 'boolean', example: false, description: 'True if phone number belongs to an existing user account' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register/verify-mobile-otp': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 1: Verify Mobile OTP (Phone Verify First)',
        description: 'Verifies the mobile OTP code. If the phone is already registered to an existing user account, logs the user in immediately with JWT tokens. If new, marks phone verified and advances to profile registration step.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'otp'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Mobile OTP verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    isRegistered: { type: 'boolean', example: false, description: 'True if existing user logged in, false if proceeding to new profile creation' },
                    message: { type: 'string', example: 'Phone verified successfully.' },
                    sessionId: { type: 'string', example: '66bc91f24d9e...' },
                    registrationToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    user: { $ref: '#/components/schemas/UserResponse' },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register/upload': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 2a: Upload Profile Photo / Avatar Image',
        description: 'Uploads a custom profile picture file for the contestant during form submission.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary', description: 'Image file (JPG, PNG, WEBP)' },
                  folder: { type: 'string', example: 'general' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'File uploaded successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    fileUrl: { type: 'string', example: '/uploads/general/avatar_1723630000.png' },
                    relativePath: { type: 'string', example: 'public/uploads/general/avatar_1723630000.png' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register/complete-profile': {
      post: {
        tags: ['1. Contestant Registration Flow'],
        summary: 'Step 2b: Complete Contestant Registration & Account Creation',
        description: 'Submits all contestant profile fields along with the uploaded avatar URL. Creates the User account and logs the contestant in.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'profileData'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' },
                  profileData: {
                    type: 'object',
                    required: ['name', 'username', 'email', 'password'],
                    properties: {
                      name: { type: 'string', example: 'Aarav Sharma' },
                      username: { type: 'string', example: 'aarav_sharma' },
                      email: { type: 'string', format: 'email', example: 'aarav@example.com' },
                      password: { type: 'string', format: 'password', example: 'Pass@1234' },
                      dob: { type: 'string', format: 'date', example: '1998-05-15' },
                      avatar: { type: 'string', example: '/uploads/general/avatar_1723630000.png' },
                      gender: { type: 'string', enum: ['Male', 'Female', 'Other', 'Prefer not to say'], example: 'Male' },
                      employmentStatus: { type: 'string', example: 'Student' },
                      categories: { type: 'array', items: { type: 'string' }, example: ['Gaming & Esports', 'Technology & Coding'] },
                      referralCode: { type: 'string', example: 'REF1002' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Registration complete. User account created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/UserResponse' },
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                    refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------
    // 2. CONTESTANT AUTHENTICATION & SESSION
    // ----------------------------------------------------
    '/api/auth/login': {
      post: {
        tags: ['2. Contestant Auth & Session'],
        summary: 'Contestant Login',
        description: 'Authenticates contestant using email/phone and password.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'aarav@example.com' },
                  password: { type: 'string', example: 'Pass@1234' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/UserResponse' },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['2. Contestant Auth & Session'],
        summary: 'Get Current Authenticated Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current session contestant details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/UserResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['2. Contestant Auth & Session'],
        summary: 'Refresh Access Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Token refreshed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        tags: ['2. Contestant Auth & Session'],
        summary: 'Logout Session',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Successfully logged out.'
          }
        }
      }
    },

    // ----------------------------------------------------
    // 3. CONTESTANT PROFILE & KYC
    // ----------------------------------------------------
    '/api/users/profile': {
      get: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Get Contestant Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/UserResponse' }
                  }
                }
              }
            }
          }
        }
      },
    '/api/users/profile/{id}': {
      get: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Get Public Contestant Profile by ID (Without Token)',
        description: 'Fetches contestant profile by MongoDB User ID without requiring an authentication token.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB User ID of the contestant',
            schema: { type: 'string', example: '66bc91f24d9e123456789abc' }
          }
        ],
        responses: {
          200: {
            description: 'User profile details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile retrieved successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid profile ID format.' },
          404: { description: 'Contestant profile not found.' }
        }
      }
    },
      put: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Update Contestant Profile Info',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Aarav K Sharma' },
                  phone: { type: 'string', example: '+919876543210' },
                  state: { type: 'string', example: 'Kerala' },
                  city: { type: 'string', example: 'Kochi' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/UserResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/users/avatar': {
      put: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Update Profile Avatar',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['avatar'],
                properties: {
                  avatar: { type: 'string', example: '/uploads/general/new_photo.png' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Avatar updated successfully.'
          }
        }
      }
    },
    '/api/kyc/upload': {
      post: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Submit KYC Documents',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['documentType', 'idNumber', 'frontImageUrl'],
                properties: {
                  documentType: { type: 'string', enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License'], example: 'Aadhaar' },
                  idNumber: { type: 'string', example: '123456789012' },
                  frontImageUrl: { type: 'string', example: '/uploads/kyc/front.jpg' },
                  backImageUrl: { type: 'string', example: '/uploads/kyc/back.jpg' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'KYC submitted successfully.'
          }
        }
      }
    },
    '/api/kyc/status': {
      get: {
        tags: ['3. Contestant Profile & KYC'],
        summary: 'Check KYC Approval Status',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'KYC Status info.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    kycStatus: { type: 'string', example: 'Approved' }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------
    // 4. CONTEST PARTICIPATION
    // ----------------------------------------------------
    '/api/contests': {
      get: {
        tags: ['4. Contest Participation'],
        summary: 'List Available Contests',
        description: 'Filter and list contests by status, category, or search term.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Filter contests by status',
            schema: {
              type: 'string',
              enum: ['All', 'Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Registration Closed', 'Live', 'Completed', 'Maintenance', 'Cancelled']
            }
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'List of contests matching the status filter.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    contests: { type: 'array', items: { $ref: '#/components/schemas/ContestResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Create New Contest (Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'India Creator Showdown 2026' },
                  description: { type: 'string', example: 'Vlogging & Cinematography contest' },
                  rules: { type: 'string', example: '1. Negative marking applies' },
                  prizePool: { type: 'number', example: 50000 },
                  entryFee: { type: 'number', example: 0 },
                  entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Free' },
                  isFree: { type: 'boolean', example: true },
                  timerLimit: { type: 'number', example: 30 },
                  maxParticipants: { type: 'number', example: 500 },
                  status: { type: 'string', example: 'Registration Open' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Contest created successfully.' }
        }
      }
    },
    '/api/contests/{id}': {
      get: {
        tags: ['4. Contest Participation'],
        summary: 'Get Contest Details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Contest detail data.'
          }
        }
      },
      put: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Update Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Contest updated successfully.' }
        }
      },
      delete: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Delete Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Contest deleted successfully.' }
        }
      }
    },
    '/api/contests/{id}/join': {
      post: {
        tags: ['4. Contest Participation'],
        summary: 'Join Contest',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Joined contest successfully.'
          }
        }
      }
    },
    '/api/stages/{id}/start': {
      post: {
        tags: ['4. Contest Participation'],
        summary: 'Start Stage Attempt',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Stage attempt started. Returns question payload.'
          }
        }
      }
    },
    '/api/stages/{id}/submit': {
      post: {
        tags: ['4. Contest Participation'],
        summary: 'Submit Stage Answers',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  answers: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Stage attempt submitted.'
          }
        }
      }
    },

    // ----------------------------------------------------
    // 5. DAILY CONTESTS (24H ARENA)
    // ----------------------------------------------------
    '/api/daily-contests': {
      get: {
        tags: ['5. Daily Contests (24h Arena)'],
        summary: 'List Active Daily Contests',
        description: 'Retrieves all 24-hour reset daily contests with optional filtering by status, category, or search term.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'string', example: 'Speed Battle' }
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['All', 'Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Completed', 'Maintenance']
            }
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'List of daily contests.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'number', example: 4 },
                    data: { type: 'array', items: { $ref: '#/components/schemas/DailyContestResponse' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/daily-contests/{id}': {
      get: {
        tags: ['5. Daily Contests (24h Arena)'],
        summary: 'Get Daily Contest Details',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Daily Contest Mongo ID or dailyContestId (e.g., DLC-101)' }
        ],
        responses: {
          200: {
            description: 'Daily contest detail record.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/DailyContestResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/daily-contests/{id}/join': {
      post: {
        tags: ['5. Daily Contests (24h Arena)'],
        summary: 'Join Daily Contest Battle',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Joined daily contest successfully.'
          }
        }
      }
    },

    // ----------------------------------------------------
    // 6. ADMIN CONTEST & DAILY CONTEST MANAGEMENT
    // ----------------------------------------------------
    '/api/contests/{id}/duplicate': {
      post: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Duplicate Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Contest duplicated successfully.' }
        }
      }
    },
    '/api/admin/daily-contests': {
      get: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'List All Daily Contests (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of all daily contests.' }
        }
      },
      post: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Create New Daily Contest (Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Daily Speed Battle 2026' },
                  category: { type: 'string', example: 'Speed Battle' },
                  entryFee: { type: 'number', example: 0 },
                  entryFeeType: { type: 'string', example: 'Free' },
                  prizePool: { type: 'number', example: 10000 },
                  timerLimit: { type: 'string', example: '3 mins' },
                  questionsCount: { type: 'number', example: 20 },
                  status: { type: 'string', example: 'Registration Open' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Daily contest created successfully.' }
        }
      }
    },
    '/api/admin/daily-contests/{id}': {
      put: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Update Daily Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Daily contest updated successfully.' }
        }
      },
      delete: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Delete Daily Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Daily contest deleted successfully.' }
        }
      }
    },
    '/api/admin/daily-contests/{id}/reset': {
      post: {
        tags: ['6. Admin Contest & Daily Contest Management'],
        summary: 'Reset Daily Contest 24h Leaderboard (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Daily contest leaderboard reset successfully.' }
        }
      }
    },

    // ----------------------------------------------------
    // 7. WALLET & TRANSACTIONS
    // ----------------------------------------------------
    '/api/wallet': {
      get: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Get Full Contestant Wallet & Coins Overview',
        description: 'Returns real-time cash balance (INR), coin balance 🪙, KYC eligibility, total deposits, winnings, and recent transactions.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Wallet details fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        walletBalance: { type: 'number', example: 1250 },
                        coins: { type: 'number', example: 450 },
                        kycStatus: { type: 'string', example: 'Approved' },
                        isKycVerified: { type: 'boolean', example: true },
                        isEligibleForWithdrawal: { type: 'boolean', example: true },
                        currency: { type: 'string', example: 'INR' },
                        summary: {
                          type: 'object',
                          properties: {
                            totalDeposited: { type: 'number', example: 5000 },
                            totalWon: { type: 'number', example: 2500 },
                            totalSpent: { type: 'number', example: 800 },
                            totalWithdrawn: { type: 'number', example: 2000 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/wallet/deposit': {
      post: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Deposit / Top-up Funds to Wallet',
        description: 'Adds balance to contestant wallet and logs a Completed deposit transaction.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 500 },
                  description: { type: 'string', example: 'Razorpay UPI Topup' },
                  paymentRef: { type: 'string', example: 'pay_9876543210' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Deposit successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: '₹500 deposited successfully to your wallet.' },
                    data: {
                      type: 'object',
                      properties: {
                        newBalance: { type: 'number', example: 1750 }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/wallet/withdraw': {
      post: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Request Withdrawal to Bank / UPI',
        description: 'Submits a withdrawal request (minimum ₹100, requires Approved KYC). Deducts balance and creates a Pending payout transaction.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 500 },
                  method: { type: 'string', enum: ['UPI', 'Bank'], example: 'UPI' },
                  upiId: { type: 'string', example: 'aarav@okaxis' },
                  accountNumber: { type: 'string', example: '9876543210123' },
                  ifsc: { type: 'string', example: 'HDFC0001234' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Withdrawal request submitted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Withdrawal request of ₹500 submitted successfully.' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          403: { description: 'KYC not approved.' }
        }
      }
    },
    '/api/wallet/pay-entry': {
      post: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Pay Contest Entry Fee from Wallet / Coins',
        description: 'Deducts contest entry fee from wallet cash or coins and records an Entry Fee transaction.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', example: 100 },
                  contestTitle: { type: 'string', example: 'Grand Championship Season 1' },
                  currency: { type: 'string', enum: ['INR', 'Coins'], example: 'INR' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Entry fee paid successfully.' },
          400: { description: 'Insufficient balance.' }
        }
      }
    },
    '/api/wallet/claim-daily': {
      post: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Claim Daily Login Bonus Coins',
        description: 'Awards +50 daily check-in coins 🪙 to contestant account.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Daily bonus claimed successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: '+50 Daily Bonus Coins claimed! 🪙' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/wallet/transactions': {
      get: {
        tags: ['7. Wallet & Transactions'],
        summary: 'View Wallet Transactions History',
        description: 'Fetches paginated list of contestant wallet transactions (Deposits, Entry Fees, Prize Payouts, Withdrawals, Bonuses).',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', required: false, schema: { type: 'string', enum: ['All', 'Deposit', 'Withdrawal', 'Entry Fee', 'Prize Payout', 'Bonus'] } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', example: 20 } }
        ],
        responses: {
          200: {
            description: 'Transaction log history.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: '66bc91f24d9e...' },
                          amount: { type: 'number', example: 500 },
                          currency: { type: 'string', example: 'INR' },
                          type: { type: 'string', example: 'Deposit' },
                          status: { type: 'string', example: 'Completed' },
                          description: { type: 'string', example: 'Wallet Topup' },
                          reference: { type: 'string', example: 'DEP-1723630000-1234' },
                          createdAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },

    // ----------------------------------------------------
    // 8. MOBILE APP API (CONTESTANT V1)
    // ----------------------------------------------------
    '/api/v1/mobile/auth/send-otp': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Step 1: Mobile OTP Generation & Sending',
        description: 'Generates and sends a 6-digit Mobile SMS OTP code to the contestant phone number with 5-10 minutes expiry time.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '9876543210' },
                  countryCode: { type: 'string', example: '+91' },
                  sessionId: { type: 'string', example: '66bc91f24d9e...' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP code generated and sent successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Mobile OTP code sent successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        sessionId: { type: 'string', example: '66bc91f24d9e...' },
                        mockOtp: { type: 'string', example: '123456' },
                        isRegistered: { type: 'boolean', example: false },
                        expiresIn: { type: 'string', example: '10 minutes' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid mobile number format.' }
        }
      }
    },
    '/api/v1/mobile/auth/verify-otp': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Step 1: Mobile OTP Verification (Single-Use)',
        description: 'Verifies the 6-digit mobile OTP code. Invalidates OTP upon successful verification. Auto-logs in existing users or returns registration token for new users.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'otp'],
                properties: {
                  sessionId: { type: 'string', example: '66bc91f24d9e...' },
                  otp: { type: 'string', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'OTP verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Mobile OTP verified successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        isRegistered: { type: 'boolean', example: false },
                        sessionId: { type: 'string', example: '66bc91f24d9e...' },
                        registrationToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                        token: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid or expired OTP code.' }
        }
      }
    },
    '/api/v1/mobile/auth/register': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Mobile Contestant Registration with Image Upload',
        description: 'Registers a new contestant with input validation and optional profile image upload (multipart/form-data). Returns JWT token, refresh token, and resolved avatar URL.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', example: 'aarav.sharma@example.com' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', example: 'Secret123' },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
                  profileImage: { type: 'string', format: 'binary', description: 'Optional profile image file' },
                  referralCode: { type: 'string', example: 'REF2026' }
                }
              }
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  email: { type: 'string', example: 'aarav.sharma@example.com' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', example: 'Secret123' },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Contestant registered successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Contestant registered successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Validation failed.' },
          409: { description: 'Email, username, or phone already registered.' }
        }
      }
    },
    '/api/v1/mobile/auth/login': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Mobile Contestant Login',
        description: 'Authenticates a contestant using email or phone and password. Returns JWT token, refresh token, and profile details with 3-tier resolved avatar URL.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailOrPhone', 'password'],
                properties: {
                  emailOrPhone: { type: 'string', example: 'aarav.sharma@example.com' },
                  password: { type: 'string', example: 'Secret123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful.' },
                    data: {
                      type: 'object',
                      properties: {
                        token: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Invalid credentials or incorrect password.' },
          403: { description: 'Account banned or locked.' }
        }
      }
    },
    '/api/v1/mobile/auth/forgot-password': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Step 4: Request Forgot Password OTP',
        description: 'Generates and sends a 6-digit password reset OTP to the registered mobile number or email address with a 5-minute expiry time.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone'],
                properties: {
                  phone: { type: 'string', example: '+919876543210' },
                  email: { type: 'string', example: 'aarav@example.com' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset OTP code sent.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset OTP code sent successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        phone: { type: 'string', example: '+919876543210' },
                        mockOtp: { type: 'string', example: '123456' },
                        expiresIn: { type: 'string', example: '5 minutes' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: { description: 'No registered user account found for mobile or email.' }
        }
      }
    },
    '/api/v1/mobile/auth/reset-password': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Step 5: Reset Password with Verified OTP',
        description: 'Verifies the password reset OTP, validates password strength, hashes new password, and invalidates previous sessions and OTPs.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'otp', 'newPassword', 'confirmPassword'],
                properties: {
                  phone: { type: 'string', example: '+919876543210' },
                  otp: { type: 'string', example: '123456' },
                  newPassword: { type: 'string', example: 'NewPass@1234' },
                  confirmPassword: { type: 'string', example: 'NewPass@1234' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset successfully. Please log in with your new password.' }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid or expired OTP, or passwords do not match.' },
          404: { description: 'User account not found.' }
        }
      }
    },
    '/api/v1/mobile/auth/refresh-token': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Refresh Access Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Token refreshed successfully.' },
          401: { description: 'Invalid or expired refresh token.' }
        }
      }
    },
    '/api/v1/mobile/profile': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get Authenticated Contestant Profile',
        description: 'Fetches the authenticated contestant profile. Always resolves avatar URL with 3-tier fallback (Uploaded image -> Saved avatar -> Default avatar).',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile retrieved successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized. Token missing or invalid.' }
        }
      },
      put: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Update Profile & Replace Image',
        description: 'Updates profile fields and replaces profile image (multipart/form-data). Deletes old uploaded image file automatically when replaced.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Aarav Sharma' },
                  phone: { type: 'string', example: '+919876543210' },
                  gender: { type: 'string', enum: ['Male', 'Female', 'Other'] },
                  profileImage: { type: 'string', format: 'binary', description: 'New profile image file to replace old avatar' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile updated successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized.' },
          409: { description: 'Username or phone conflict.' }
        }
      }
    },
    '/api/v1/mobile/profile/{id}': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get Public Contestant Profile by ID (Without Token)',
        description: 'Fetches contestant profile by MongoDB User ID without requiring an authentication token. Always resolves avatar URL with 3-tier fallback.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'MongoDB User ID of the contestant',
            schema: { type: 'string', example: '66bc91f24d9e123456789abc' }
          }
        ],
        responses: {
          200: {
            description: 'Profile fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Profile retrieved successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Invalid profile ID format.' },
          404: { description: 'Contestant profile not found.' }
        }
      }
    },
    '/api/v1/mobile/profile/change-password': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Change Password',
        description: 'Requires current password, validates new password match, and hashes new password before saving.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword', 'confirmPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'OldSecret123' },
                  newPassword: { type: 'string', example: 'NewSecret123' },
                  confirmPassword: { type: 'string', example: 'NewSecret123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Password changed successfully.' },
          400: { description: 'Passwords do not match or new password invalid.' },
          401: { description: 'Current password incorrect.' }
        }
      }
    },
    '/api/v1/mobile/contests/next': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get Next Contest',
        description: 'Retrieves the next upcoming or active contest available for participation.',
        responses: {
          200: { description: 'Next contest retrieved successfully.' },
          404: { description: 'No upcoming or active contest found.' }
        }
      }
    },
    '/api/v1/mobile/contests/next/join': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Join Next Contest',
        description: 'Automatically finds and registers the authenticated user into the next available active/upcoming contest.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Joined next contest successfully.' },
          401: { description: 'Authentication required.' },
          404: { description: 'No active contest available to join.' }
        }
      }
    },
    '/api/v1/mobile/contests/{id}/join': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Join Contest by ID',
        description: 'Enrolls the authenticated user into the specified contest ID.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Joined contest successfully.' },
          400: { description: 'KYC missing, invalid contest state, or maximum participants reached.' },
          401: { description: 'Authentication required.' }
        }
      }
    },
    '/api/v1/mobile/room-cycle/join': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Join Room Cycle',
        description: 'Enrolls and assigns the authenticated contestant into an active room cycle.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Joined room cycle successfully.' },
          401: { description: 'Authentication required.' }
        }
      }
    },
    '/api/v1/mobile/room-cycle/{roomId}/join/{contestId}': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)', '11. Bi-Weekly Room Cycle Module'],
        summary: 'Check Room & Contest Join Status (GET)',
        description: 'Checks if the user has already joined the specified room and contest. Returns isJoined: true if enrolled, or isJoined: false if not joined.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, description: 'Room MongoDB _id', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d1' } },
          { name: 'contestId', in: 'path', required: true, description: 'Contest MongoDB _id or contestId string', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d2' } }
        ],
        responses: {
          200: {
            description: 'Join status response received.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    isJoined: { type: 'boolean', example: true },
                    joined: { type: 'boolean', example: true },
                    hasJoined: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User has already joined this room contest' },
                    data: {
                      type: 'object',
                      properties: {
                        isJoined: { type: 'boolean', example: true },
                        joined: { type: 'boolean', example: true },
                        roomId: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d1' },
                        contestId: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d2' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['8. Mobile App API (Contestant V1)', '11. Bi-Weekly Room Cycle Module'],
        summary: 'Join Specific Room and Contest (POST)',
        description: 'Assigns the authenticated contestant to a room and registers them for a contest simultaneously. Accepts contest MongoDB _id or custom contestId string.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, description: 'Room MongoDB _id', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d1' } },
          { name: 'contestId', in: 'path', required: true, description: 'Contest MongoDB _id or contestId string', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d2' } }
        ],
        responses: {
          200: { description: 'Joined room and contest successfully.' },
          400: { description: 'Missing parameters or invalid room/contest.' },
          401: { description: 'Authentication required.' }
        }
      }
    },
    '/api/v1/mobile/room-cycle/join-status/{roomId}/{contestId}': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)', '11. Bi-Weekly Room Cycle Module'],
        summary: 'Check Room & Contest Join Status Alias',
        description: 'Checks if the user has joined the specified room and contest. Returns isJoined: true if enrolled, or isJoined: false if not joined.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, description: 'Room MongoDB _id', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d1' } },
          { name: 'contestId', in: 'path', required: true, description: 'Contest MongoDB _id or contestId string', schema: { type: 'string', example: '66d5a1b2c3d4e5f6a7b8c9d2' } }
        ],
        responses: {
          200: {
            description: 'Join status response received.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    isJoined: { type: 'boolean', example: true },
                    joined: { type: 'boolean', example: true },
                    hasJoined: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User has already joined this room contest' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/mobile/room-cycle/submissions': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)', '11. Bi-Weekly Room Cycle Module'],
        summary: 'Submit Room Cycle Task Proof',
        description: 'Uploads a contestant task submission with proof notes, URL links, base64 data, or attached file.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['roomId', 'taskId'],
                properties: {
                  roomId: { type: 'string', example: '66bc91f24d9e123456789rm1' },
                  taskId: { type: 'string', example: '66bc91f24d9e123456789tsk1' },
                  cycleId: { type: 'string', example: '66bc91f24d9e123456789cyc1' },
                  contestId: { type: 'string', example: '66bc91f24d9e123456789cnt1' },
                  submissionType: { type: 'string', enum: ['File', 'Image', 'Video', 'Link', 'Text'], example: 'File' },
                  mediaFile: { type: 'string', format: 'binary', description: 'Attached proof file' },
                  mediaUrl: { type: 'string', example: 'https://youtube.com/watch?v=example' },
                  proofNotes: { type: 'string', example: 'Completed the required room task.' }
                }
              }
            },
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'taskId'],
                properties: {
                  roomId: { type: 'string', example: '66bc91f24d9e123456789rm1' },
                  taskId: { type: 'string', example: '66bc91f24d9e123456789tsk1' },
                  cycleId: { type: 'string', example: '66bc91f24d9e123456789cyc1' },
                  contestId: { type: 'string', example: '66bc91f24d9e123456789cnt1' },
                  submissionType: { type: 'string', enum: ['File', 'Image', 'Video', 'Link', 'Text'], example: 'Link' },
                  mediaUrl: { type: 'string', example: 'https://youtube.com/watch?v=example' },
                  proofNotes: { type: 'string', example: 'Completed the required room task.' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Task submission uploaded successfully. Sent for admin review.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task submission uploaded successfully. Submitted for admin review.' },
                    data: { $ref: '#/components/schemas/RoomSubmissionResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          401: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    // ----------------------------------------------------
    // 9. QUESTION BANK & QUIZ BUILDER
    // ----------------------------------------------------
    '/api/questions': {
      get: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'List All Questions',
        description: 'Retrieves all questions from the Question Bank across all categories and pools.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Questions fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    questions: { type: 'array', items: { $ref: '#/components/schemas/QuestionResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Create Single Question',
        description: 'Adds a new question to the specified category or pool.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'question', 'options'],
                properties: {
                  category: { type: 'string', example: 'Technology & Coding' },
                  type: { type: 'string', example: 'Single Choice' },
                  question: { type: 'string', example: 'What does HTML stand for?' },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        text: { type: 'string', example: 'HyperText Markup Language' },
                        isCorrect: { type: 'boolean', example: true }
                      }
                    }
                  },
                  marks: { type: 'number', example: 1 },
                  negativeMarks: { type: 'number', example: 0.25 },
                  difficulty: { type: 'string', example: 'Easy' },
                  explanation: { type: 'string', example: 'HTML stands for HyperText Markup Language.' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Question created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    question: { $ref: '#/components/schemas/QuestionResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/questions/{id}': {
      get: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Get Single Question by ID',
        description: 'Retrieves full details for a single question by its MongoDB ID.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'MongoDB Question ID', schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }
        ],
        responses: {
          200: {
            description: 'Question fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    question: { $ref: '#/components/schemas/QuestionResponse' }
                  }
                }
              }
            }
          },
          404: { description: 'Question not found.' }
        }
      },
      put: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Update Question by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  text: { type: 'string', example: 'Updated question text?' },
                  marks: { type: 'number', example: 2 },
                  difficulty: { type: 'string', example: 'Hard' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Question updated successfully.' }
        }
      },
      delete: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Delete Question by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Question deleted successfully.' }
        }
      }
    },
    '/api/question-pools': {
      get: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'List Question Pools',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pools list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    pools: { type: 'array', items: { $ref: '#/components/schemas/QuestionPoolResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Create Question Pool',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'category'],
                properties: {
                  name: { type: 'string', example: 'Speed Battle Pool' },
                  category: { type: 'string', example: 'Speed Battle' },
                  description: { type: 'string', example: 'Question pool for 24h speed battle contests' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Question pool created.' }
        }
      }
    },
    '/api/question-pools/{id}': {
      put: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Update Question Pool',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Pool updated.' }
        }
      },
      delete: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Delete Question Pool',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Pool deleted.' }
        }
      }
    },
    '/api/question-pools/{poolId}/questions': {
      get: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'List Questions in Pool',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'poolId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Questions in pool.' }
        }
      },
      post: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Add Question to Specific Pool',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'poolId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          201: { description: 'Question added to pool.' }
        }
      }
    },
    '/api/question-pools/bulk-import': {
      post: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Bulk Import Questions',
        description: 'Bulk imports questions array grouped by category.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['questions'],
                properties: {
                  category: { type: 'string', example: 'General Knowledge' },
                  questions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string', example: 'What is the capital of France?' },
                        optionA: { type: 'string', example: 'Paris' },
                        optionB: { type: 'string', example: 'London' },
                        optionC: { type: 'string', example: 'Berlin' },
                        optionD: { type: 'string', example: 'Madrid' },
                        correctOption: { type: 'string', example: 'Option A' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Bulk import successful.' }
        }
      }
    },
    '/api/question-pools/clear-all': {
      delete: {
        tags: ['9. Question Bank & Quiz Builder'],
        summary: 'Clear All Questions & Pools',
        description: 'Super Admin reset option to wipe all question pools and questions.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'All questions cleared successfully.' }
        }
      }
    },
    // ----------------------------------------------------
    // 10. CMS & SOCIAL MEDIA LINKS & LOGOS
    // ----------------------------------------------------
    '/api/cms/social': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Get Public Social Media Links & Logos',
        description: 'Retrieves active social media links with logos, usernames, and profile URLs.',
        responses: {
          200: {
            description: 'Social links list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    social: { type: 'array', items: { $ref: '#/components/schemas/CMSSocialResponse' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/cms/social': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Admin List Social Media Links',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Social links fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    social: { type: 'array', items: { $ref: '#/components/schemas/CMSSocialResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['10. CMS & Social Media'],
        summary: 'Create Social Media Link with Logo Upload',
        description: 'Adds a social media handle with platform name, username, profile link URL, and logo image upload.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['platform', 'url'],
                properties: {
                  platform: { type: 'string', example: 'Instagram' },
                  username: { type: 'string', example: '@hakaofficial' },
                  handle: { type: 'string', example: '@hakaofficial' },
                  url: { type: 'string', example: 'https://instagram.com/hakaofficial' },
                  logoUrl: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgo...' },
                  followerCount: { type: 'string', example: '50K+' },
                  status: { type: 'string', example: 'Active' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Social media link created.' }
        }
      }
    },
    '/api/admin/cms/social/{id}': {
      put: {
        tags: ['10. CMS & Social Media'],
        summary: 'Update Social Media Link & Logo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  platform: { type: 'string', example: 'YouTube' },
                  username: { type: 'string', example: 'Haka Official Channel' },
                  url: { type: 'string', example: 'https://youtube.com/@hakaofficial' },
                  logoUrl: { type: 'string', example: '/uploads/social/logo_1723630000.png' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Social media link updated.' }
        }
      },
      delete: {
        tags: ['10. CMS & Social Media'],
        summary: 'Delete Social Media Link',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Social media link deleted.' }
        }
      }
    },
    '/api/cms/news': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Get Public News & Media Announcements',
        description: 'Retrieves published news articles, press releases, media links, and cover images.',
        responses: {
          200: {
            description: 'News items list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    news: { type: 'array', items: { $ref: '#/components/schemas/CMSNewsResponse' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/cms/news': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Admin List News Announcements',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'News list fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    news: { type: 'array', items: { $ref: '#/components/schemas/CMSNewsResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['10. CMS & Social Media'],
        summary: 'Create News Release / Announcement',
        description: 'Creates a news article with headline, publisher, cover image upload, summary, and rich content.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['headline', 'summary'],
                properties: {
                  headline: { type: 'string', example: 'Haka Platform Launches Grand Season 2026' },
                  badgeTag: { type: 'string', example: 'Press Release' },
                  priority: { type: 'string', example: 'High' },
                  publisher: { type: 'string', example: 'Times of India' },
                  externalUrl: { type: 'string', example: 'https://timesofindia.com' },
                  imageUrl: { type: 'string', example: 'data:image/png;base64,iVBORw0...' },
                  summary: { type: 'string', example: 'Summary text...' },
                  content: { type: 'string', example: 'Full article text...' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'News announcement created.' }
        }
      }
    },
    '/api/admin/cms/news/{id}': {
      put: {
        tags: ['10. CMS & Social Media'],
        summary: 'Update News Announcement',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'News announcement updated.' }
        }
      },
      delete: {
        tags: ['10. CMS & Social Media'],
        summary: 'Delete News Announcement',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'News announcement deleted.' }
        }
      }
    },
    // ----------------------------------------------------
    // CMS LEGAL DOCUMENTS (Privacy Policy, Terms & Conditions, About Us)
    // ----------------------------------------------------
    '/api/cms/privacy': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Get Public Privacy Policy Document',
        description: 'Retrieves the official platform Privacy Policy legal document.',
        responses: {
          200: {
            description: 'Privacy Policy document fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    doc: { $ref: '#/components/schemas/CMSDocumentResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cms/terms': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Get Public Terms & Conditions Document',
        description: 'Retrieves the official platform Terms & Conditions legal document.',
        responses: {
          200: {
            description: 'Terms & Conditions document fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    doc: { $ref: '#/components/schemas/CMSDocumentResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cms/doc/{type}': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Get Public Legal Document by Type',
        description: 'Fetch legal document by type slug: privacy, terms, or about.',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['privacy', 'terms', 'about'] }, example: 'privacy' }
        ],
        responses: {
          200: {
            description: 'Document fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    doc: { $ref: '#/components/schemas/CMSDocumentResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/cms/doc/{type}': {
      get: {
        tags: ['10. CMS & Social Media'],
        summary: 'Admin Get Legal Document by Type',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['privacy', 'terms', 'about'] } }
        ],
        responses: {
          200: { description: 'Document details.' }
        }
      },
      put: {
        tags: ['10. CMS & Social Media'],
        summary: 'Update Legal Document (Privacy Policy / Terms / About Us)',
        description: 'Updates document title, content, version, and status.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['privacy', 'terms', 'about'] } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  title: { type: 'string', example: 'Privacy Policy' },
                  version: { type: 'string', example: 'v1.1' },
                  author: { type: 'string', example: 'Legal Team' },
                  status: { type: 'string', example: 'Published' },
                  content: { type: 'string', example: '<h2>Updated Privacy Policy</h2><p>Content...</p>' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Document updated successfully.' }
        }
      }
    },

    // ----------------------------------------------------
    // 11. BI-WEEKLY ROOM CYCLE MODULE
    // ----------------------------------------------------
    '/api/public/room-cycles': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Public Competition Rooms List',
        description: 'Fetch paginated list of rooms. If Authorization Bearer token is provided, populates isJoined: true/false for each room card.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string', example: 'Alpha' } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['All', 'Active', 'Inactive', 'Archived'], default: 'Active' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Rooms list fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        rooms: { type: 'array', items: { $ref: '#/components/schemas/RoomResponse' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 5 },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            totalPages: { type: 'integer', example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/week/rooms': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get All Competition Rooms',
        description: 'Fetch paginated list of competition rooms with search, status filter, and capacity details.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string', example: 'Alpha' } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['All', 'Active', 'Inactive', 'Archived'] } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Rooms list fetched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        rooms: { type: 'array', items: { $ref: '#/components/schemas/RoomResponse' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 1 },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            totalPages: { type: 'integer', example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Create New Competition Room',
        description: 'Create a new room with name, description, max members, current cycle, room image, and auto-assignment options.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Alpha Strikers' },
                  description: { type: 'string', example: 'Room for top tier competitors' },
                  rules: { type: 'string', example: 'Maintain high accuracy score.' },
                  guidelines: { type: 'string', example: 'Verify submissions before uploading.' },
                  durationDays: { type: 'number', example: 14 },
                  maxMembers: { type: 'number', example: 50 },
                  currentCycle: { type: 'number', example: 1 },
                  cycleIds: { type: 'array', items: { type: 'string' } },
                  roomImage: { type: 'string', example: '/uploads/room/banner_1723630000.png' },
                  status: { type: 'string', enum: ['Active', 'Inactive', 'Archived'], example: 'Active' },
                  autoAssignment: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Room created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Room created successfully' },
                    data: { $ref: '#/components/schemas/RoomResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/week/rooms/{id}': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get Room Details & Active Members by ID',
        description: 'Retrieves room configuration, assigned cycles, and active member leaderboard rankings.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } }],
        responses: {
          200: {
            description: 'Room details and member roster retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/RoomResponse' }
                  }
                }
              }
            }
          },
          404: { description: 'Room not found.' }
        }
      },
      put: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Update Room Details',
        description: 'Updates room capacity, status, rules, description, and settings.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alpha Strikers Updated' },
                  description: { type: 'string' },
                  rules: { type: 'string' },
                  maxMembers: { type: 'number', example: 60 },
                  status: { type: 'string', enum: ['Active', 'Inactive', 'Archived'], example: 'Active' },
                  roomImage: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Room updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Room updated successfully' },
                    data: { $ref: '#/components/schemas/RoomResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Delete Room',
        description: 'Permanently removes the room and unlinks attached members.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } }],
        responses: {
          200: {
            description: 'Room deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Room deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/{id}/cycles': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Get 14-Day Blueprint Cycles for Room',
        description: 'Fetches the 14-day cycle blueprints attached to the specified room.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } }],
        responses: {
          200: {
            description: 'List of cycles for the specified room.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    cycles: { type: 'array', items: { $ref: '#/components/schemas/CycleResponse' } },
                    data: { type: 'array', items: { $ref: '#/components/schemas/CycleResponse' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/bulk-action': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Bulk Action on Rooms (Activate, Archive, Delete)',
        description: 'Applies bulk operations across multiple room IDs at once.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomIds', 'action'],
                properties: {
                  roomIds: { type: 'array', items: { type: 'string' }, example: ['66bc91f24d9e123456789rm1'] },
                  action: { type: 'string', enum: ['Activate', 'Archive', 'Deactivate', 'Delete'], example: 'Activate' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Bulk action completed successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Bulk action Activate executed' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/{roomId}/contests/{contestId}/check-status': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Check Contestant Join Status for Room Cycle',
        description: 'Checks whether the authenticated contestant has joined the specified room cohort and cycle contest.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cnt1' } }
        ],
        responses: {
          200: {
            description: 'Join status fetched successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomCycleJoinStatusResponse' }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/{roomId}/contests/{contestId}/join': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Contestant Join Room Cycle & Contest',
        description: 'Enrolls the authenticated contestant into the room cohort and unlocks cycle tasks and leaderboard participation.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cnt1' } }
        ],
        responses: {
          200: {
            description: 'Joined room cycle successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomCycleJoinStatusResponse' }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/week/rooms/{roomId}/join/{contestId}': {
      get: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Check Contestant Join Status (Alias)',
        description: 'Checks whether the authenticated contestant has joined the specified room and contest.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: 'RM-001' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: 'CNT-2026-1002' } }
        ],
        responses: {
          200: {
            description: 'Join status fetched successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomCycleJoinStatusResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Contestant Join Room & Contest (Alias)',
        description: 'Registers the authenticated contestant into the room cohort and associated contest.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: 'RM-001' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: 'CNT-2026-1002' } }
        ],
        responses: {
          200: {
            description: 'Joined room cycle successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomCycleJoinStatusResponse' }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/{roomId}/start/{contestId}': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Start Contest Task Attempt',
        description: 'Initializes and records the attempt for the contestant for the specified room and contest task.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cnt1' } }
        ],
        responses: {
          200: {
            description: 'Contest task attempt started successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Contest task attempt started successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        roomId: { type: 'string', example: '66bc91f24d9e123456789rm1' },
                        contestId: { type: 'string', example: '66bc91f24d9e123456789cnt1' },
                        startedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/week/rooms/{roomId}/submit/{contestId}': {
      post: {
        tags: ['8. Mobile App API (Contestant V1)'],
        summary: 'Submit Task Proof & Answers for Room Contest',
        description: 'Submits contestant task proof (media file or text link) and answers for automatic or admin evaluation.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } },
          { name: 'contestId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cnt1' } }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  mediaFile: { type: 'string', format: 'binary', description: 'Proof image or video file' },
                  cycleId: { type: 'string', example: '66bc91f24d9e123456789cyc1' },
                  taskId: { type: 'string', example: '66bc91f24d9e123456789tsk1' },
                  submissionType: { type: 'string', enum: ['Link', 'File', 'Text', 'Image', 'Video'], example: 'Image' },
                  proofNotes: { type: 'string', example: 'Uploaded proof screenshot of completed sprint challenge.' },
                  answers: { type: 'string', description: 'JSON stringified answer map' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Task submission recorded for review.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task submission recorded for review' },
                    data: { $ref: '#/components/schemas/RoomSubmissionResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/admin/room-cycle/rooms': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'List All Competition Rooms (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['All', 'Active', 'Inactive', 'Archived'] } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Admin rooms list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        rooms: { type: 'array', items: { $ref: '#/components/schemas/RoomResponse' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Create Room (Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Beta Warriors' },
                  description: { type: 'string' },
                  rules: { type: 'string' },
                  durationDays: { type: 'number', example: 14 },
                  maxMembers: { type: 'number', example: 50 },
                  status: { type: 'string', enum: ['Active', 'Inactive', 'Archived'], example: 'Active' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Room created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Room created successfully' },
                    data: { $ref: '#/components/schemas/RoomResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/members/assign': {
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Assign Members to Room (Admin)',
        description: 'Assigns contestant IDs to a specific room with role (Member or Leader).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roomId', 'userIds'],
                properties: {
                  roomId: { type: 'string', example: '66bc91f24d9e123456789rm1' },
                  userIds: { type: 'array', items: { type: 'string' }, example: ['66bc91f24d9e123456789usr1'] },
                  role: { type: 'string', enum: ['Member', 'Leader'], default: 'Member' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Members assigned successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Members assigned successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/members/random-assign': {
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Randomly Distribute Unassigned Members (Admin)',
        description: 'Evenly distributes unassigned contestants across active rooms respecting max member limits.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userIds: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Random member distribution completed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Random assignment completed' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/members/transfer': {
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Transfer Member Between Rooms (Admin)',
        description: 'Transfers a contestant from one room cohort to another room.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'fromRoomId', 'toRoomId'],
                properties: {
                  userId: { type: 'string', example: '66bc91f24d9e123456789usr1' },
                  fromRoomId: { type: 'string', example: '66bc91f24d9e123456789rm1' },
                  toRoomId: { type: 'string', example: '66bc91f24d9e123456789rm2' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Member transferred successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Member transferred successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/members/{roomId}/{userId}': {
      delete: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Remove Member from Room (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789rm1' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789usr1' } }
        ],
        responses: {
          200: {
            description: 'Member removed from room.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Member removed from room' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/cycles': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get 10-Cycle Blueprint List (Admin)',
        description: 'Retrieves the complete 10-cycle sprint blueprints with prize pools and duration details.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All 10 bi-weekly cycles retrieved.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/CycleResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Create New Blueprint Cycle (Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  cycleNumber: { type: 'number', example: 1 },
                  title: { type: 'string', example: 'Sprint Season 1' },
                  description: { type: 'string', example: '14-day competitive sprint' },
                  rules: { type: 'string' },
                  guidelines: { type: 'string' },
                  durationDays: { type: 'number', example: 14 },
                  prizePoolCoins: { type: 'number', example: 5000 },
                  timerMinutes: { type: 'number', example: 60 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Cycle created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cycle created successfully' },
                    data: { $ref: '#/components/schemas/CycleResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/cycles/{id}': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Cycle Details by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cyc1' } }],
        responses: {
          200: {
            description: 'Cycle details object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CycleResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Update Cycle Details & Schedule (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cyc1' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cycleNumber: { type: 'number', example: 1 },
                  title: { type: 'string', example: 'Bi-Weekly Sprint 1' },
                  description: { type: 'string' },
                  rules: { type: 'string' },
                  durationDays: { type: 'number', example: 14 },
                  prizePoolCoins: { type: 'number', example: 5000 },
                  status: { type: 'string', enum: ['Draft', 'Published', 'Running', 'Completed', 'Upcoming', 'Active', 'Archived'], example: 'Active' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Cycle details updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cycle updated' },
                    data: { $ref: '#/components/schemas/CycleResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Delete Cycle by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cyc1' } }],
        responses: {
          200: {
            description: 'Cycle deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cycle deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/cycles/{id}/set-active': {
      put: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Set Active Running Cycle (Admin)',
        description: 'Marks the specified cycle as currently active across all cohort rooms.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789cyc1' } }],
        responses: {
          200: {
            description: 'Active cycle updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Active cycle updated' },
                    data: { $ref: '#/components/schemas/CycleResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/submissions': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Task Submissions for Admin Review',
        description: 'Fetches contestant task submissions with filters for roomId, cycleId, and status.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roomId', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'cycleId', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'status', in: 'query', required: false, schema: { type: 'string', enum: ['All', 'Pending', 'Approved', 'Rejected'] } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', example: 10 } }
        ],
        responses: {
          200: {
            description: 'Submissions list retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        submissions: { type: 'array', items: { $ref: '#/components/schemas/RoomSubmissionResponse' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 1 },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            totalPages: { type: 'integer', example: 1 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/submissions/{id}/review': {
      put: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Grade & Review Task Submission (Admin)',
        description: 'Submits reviewer evaluation, points, bonus, penalty, and feedback on contestant task submissions.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789sub1' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status', 'score'],
                properties: {
                  status: { type: 'string', enum: ['Approved', 'Rejected', 'Needs Revision'], example: 'Approved' },
                  score: { type: 'number', example: 100 },
                  bonus: { type: 'number', example: 10 },
                  penalty: { type: 'number', example: 0 },
                  feedback: { type: 'string', example: 'Great submission and clear strategy!' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Submission review recorded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Submission review recorded' },
                    data: { $ref: '#/components/schemas/RoomSubmissionResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/leaderboard': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Leaderboard (Room, Cycle, or Overall Scope)',
        description: 'Retrieves ranked leaderboard records filtered by Scope (Room, Cycle, Overall), cycleId, or roomId.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'scope', in: 'query', required: false, schema: { type: 'string', enum: ['Room', 'Cycle', 'Overall'], default: 'Room' } },
          { name: 'roomId', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'cycleId', in: 'query', required: false, schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Leaderboard list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/RoomLeaderboardEntryResponse' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/leaderboard/recalculate': {
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Recalculate Leaderboard Scores (Admin)',
        description: 'Triggers a full recalculation of member accumulated points and ranks across all rooms.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cycleId: { type: 'string', example: '66bc91f24d9e123456789cyc1' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Leaderboard scores recalculated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Leaderboard recalculation completed' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/rewards': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Reward Rules List',
        description: 'Retrieves all active reward distribution rules for room cycles.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Reward rules list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/RoomRewardResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Create Reward Rule (Admin)',
        description: 'Configures a new reward tier rule based on leaderboard ranking.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'rewardType', 'minRank', 'maxRank'],
                properties: {
                  title: { type: 'string', example: 'Top 3 Cash Pool' },
                  rewardType: { type: 'string', enum: ['Cash', 'Wallet Credit', 'Coupons', 'Badges', 'Certificates'], example: 'Cash' },
                  amountOrValue: { type: 'number', example: 500 },
                  minRank: { type: 'number', example: 1 },
                  maxRank: { type: 'number', example: 3 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Reward rule created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Reward rule created' },
                    data: { $ref: '#/components/schemas/RoomRewardResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/rewards/distribute': {
      post: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Distribute Rewards to Qualified Winners (Admin)',
        description: 'Executes automated credit/cash reward payouts to contestants according to leaderboard standings.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Rewards distributed successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Rewards distribution executed' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/settings': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Room Cycle Module Settings (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Settings details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/RoomCycleSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Update Settings (Admin)',
        description: 'Updates module settings including auto-locking, room capacity limits, and point weight percentages.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  autoLocking: { type: 'boolean', example: true },
                  maxRoomCapacity: { type: 'number', example: 50 },
                  cycleDurationDays: { type: 'number', example: 14 },
                  taskWeightPercentage: { type: 'number', example: 70 },
                  quizWeightPercentage: { type: 'number', example: 30 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Settings updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Settings updated successfully' },
                    data: { $ref: '#/components/schemas/RoomCycleSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/room-cycle/analytics': {
      get: {
        tags: ['11. Bi-Weekly Room Cycle Module'],
        summary: 'Get Module Dashboard Analytics (Admin)',
        description: 'Fetches module KPIs, active rooms, completion rate, average scores, and top performers.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Module KPIs, top rooms, and top performers.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/RoomCycleAnalyticsResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'List All Grand Contests',
        description: 'Retrieves paginated list of Grand Contests with connected tasks populated.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string', example: 'Season 1' } },
          { name: 'status', in: 'query', schema: { type: 'string', example: 'Registration Open' } },
          { name: 'category', in: 'query', schema: { type: 'string', example: 'Technology' } }
        ],
        responses: {
          200: {
            description: 'Grand Contests list retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        contests: { type: 'array', items: { $ref: '#/components/schemas/GrandContestResponse' } },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 12 },
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 10 },
                            totalPages: { type: 'integer', example: 2 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Create New Grand Contest (Add Grand Contest)',
        description: 'Creates a new Grand Contest record with connected task IDs, rules, prize pool, banner URL, and schedule parameters.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  contestId: { type: 'string', example: 'GNC-2026-98124', description: 'Unique custom ID (auto-generated if omitted)' },
                  title: { type: 'string', example: 'Grand Championship Season 1', description: 'Contest title' },
                  description: { type: 'string', example: 'Configure contest rules, guidelines, connected tasks & prize pool' },
                  rules: { type: 'string', example: '1. Complete all assigned task challenges before deadline.' },
                  guidelines: { type: 'string', example: '1. Ensure accurate file format and size.' },
                  durationDays: { type: 'number', example: 14, default: 14 },
                  prizePool: { type: 'number', example: 100000, default: 0 },
                  entryFee: { type: 'number', example: 499, default: 0 },
                  entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Cash', default: 'Cash' },
                  isFree: { type: 'boolean', example: false, default: false },
                  entryFeeCoins: { type: 'number', example: 0, default: 0 },
                  coinsReward: { type: 'number', example: 0, default: 0 },
                  tasks: { type: 'array', items: { type: 'string' }, example: ['66bc91f24d9e987654321task'], description: 'Connected Task ObjectIDs' },
                  bannerUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
                  imageUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
                  videoUrl: { type: 'string', example: '' },
                  fileAttachmentUrl: { type: 'string', example: '' },
                  categories: { type: 'array', items: { type: 'string' }, example: ['Technology & Coding'] },
                  sponsors: { type: 'array', items: { type: 'string' }, example: ['Haka Sponsor'] },
                  startDate: { type: 'string', format: 'date-time', example: '2026-09-02T00:00:00.000Z' },
                  endDate: { type: 'string', format: 'date-time', example: '2026-09-16T00:00:00.000Z' },
                  status: { 
                    type: 'string', 
                    enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Registration Closed', 'Live', 'Completed', 'Maintenance', 'Cancelled'],
                    example: 'Registration Open',
                    default: 'Registration Open'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Grand Contest created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest created successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/grand-contests/{id}': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'Get Grand Contest Details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'MongoDB ObjectId or custom contestId', schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'Grand Contest details object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          },
          404: { description: 'Grand Contest not found.' }
        }
      },
      put: {
        tags: ['12. Grand Contest Management'],
        summary: 'Update Grand Contest Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'MongoDB ObjectId or custom contestId', schema: { type: 'string', example: 'GNC-2026-98124' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Grand Championship' },
                  description: { type: 'string' },
                  rules: { type: 'string' },
                  guidelines: { type: 'string' },
                  prizePool: { type: 'number', example: 150000 },
                  entryFee: { type: 'number', example: 499 },
                  tasks: { type: 'array', items: { type: 'string' } },
                  bannerUrl: { type: 'string' },
                  status: { type: 'string', example: 'Active' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Grand Contest updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest updated successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['12. Grand Contest Management'],
        summary: 'Delete Grand Contest',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'Grand Contest deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests/{id}/duplicate': {
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Duplicate Grand Contest',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          201: {
            description: 'Grand Contest duplicated as copy.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest duplicated successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },

    '/api/grand-contests/{id}/analytics': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'Get Grand Contest Analytics',
        description: 'Fetches participant metrics, task counts, prize pool details, and status for the Grand Contest.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: { description: 'Grand Contest analytics metrics object.' }
        }
      }
    },
    '/api/admin/grand-contests': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'List All Grand Contests (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of grand contests.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        contests: { type: 'array', items: { $ref: '#/components/schemas/GrandContestResponse' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Create New Grand Contest (Admin Add Grand Contest)',
        description: 'Creates a new Grand Contest record with connected tasks, rules, prize pool, banner URL, and schedule parameters.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  contestId: { type: 'string', example: 'GNC-2026-98124' },
                  title: { type: 'string', example: 'Grand Championship Season 1' },
                  description: { type: 'string', example: 'Configure contest rules, guidelines, connected tasks & prize pool' },
                  rules: { type: 'string', example: '1. Complete all assigned task challenges before deadline.' },
                  guidelines: { type: 'string', example: '1. Ensure accurate file format and size.' },
                  durationDays: { type: 'number', example: 14 },
                  prizePool: { type: 'number', example: 100000 },
                  entryFee: { type: 'number', example: 499 },
                  entryFeeType: { type: 'string', enum: ['Free', 'Coins', 'Cash'], example: 'Cash' },
                  isFree: { type: 'boolean', example: false },
                  entryFeeCoins: { type: 'number', example: 0 },
                  coinsReward: { type: 'number', example: 0 },
                  tasks: { type: 'array', items: { type: 'string' }, example: ['66bc91f24d9e987654321task'] },
                  bannerUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
                  imageUrl: { type: 'string', example: '/uploads/grand-contests/banner_1723630000.png' },
                  videoUrl: { type: 'string', example: '' },
                  fileAttachmentUrl: { type: 'string', example: '' },
                  categories: { type: 'array', items: { type: 'string' }, example: ['Technology'] },
                  sponsors: { type: 'array', items: { type: 'string' }, example: ['Haka Sponsor'] },
                  startDate: { type: 'string', format: 'date-time', example: '2026-09-02T00:00:00.000Z' },
                  endDate: { type: 'string', format: 'date-time', example: '2026-09-16T00:00:00.000Z' },
                  status: { 
                    type: 'string', 
                    enum: ['Draft', 'Registration Open', 'Upcoming', 'Active', 'In Progress', 'Registration Closed', 'Live', 'Completed', 'Maintenance', 'Cancelled'],
                    example: 'Registration Open'
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Grand Contest created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest created successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/grand-contests/{id}': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'Get Grand Contest Details by ID (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'Grand Contest details object.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['12. Grand Contest Management'],
        summary: 'Update Grand Contest Details (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Grand Championship' },
                  description: { type: 'string' },
                  rules: { type: 'string' },
                  guidelines: { type: 'string' },
                  prizePool: { type: 'number', example: 150000 },
                  entryFee: { type: 'number', example: 499 },
                  tasks: { type: 'array', items: { type: 'string' } },
                  bannerUrl: { type: 'string' },
                  status: { type: 'string', example: 'Active' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Grand Contest updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest updated successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['12. Grand Contest Management'],
        summary: 'Delete Grand Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'Grand Contest deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/grand-contests/{id}/duplicate': {
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Duplicate Grand Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          201: {
            description: 'Grand Contest duplicated as copy.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Grand Contest duplicated successfully' },
                    data: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests/{id}/join': {
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Join Grand Contest (Contestant)',
        description: 'Registers contestant for the Grand Contest. Validates registration window dates, deducts entry fee in Coins or Cash, and logs payment transaction.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'Joined Grand Contest successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    alreadyJoined: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Joined Grand Contest successfully!' },
                    joinedAt: { type: 'string', format: 'date-time', example: '2026-09-28T15:00:00.000Z' },
                    contest: { $ref: '#/components/schemas/GrandContestResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/grand-contests/{id}/tasks': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'Get Connected Tasks for Grand Contest',
        description: 'Retrieves all tasks linked to the specified Grand Contest.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        responses: {
          200: {
            description: 'List of connected tasks.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'array', items: { $ref: '#/components/schemas/TaskResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Create & Attach Task to Grand Contest (Admin)',
        description: 'Creates a new Task and attaches its ID to the Grand Contest tasks array.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Grand Quiz Challenge' },
                  description: { type: 'string', example: 'Answer 10 speed quiz questions' },
                  taskType: { type: 'string', example: 'Quiz' },
                  submissionType: { type: 'string', example: 'Text' },
                  points: { type: 'number', example: 100 },
                  reviewType: { type: 'string', example: 'Manual' },
                  status: { type: 'string', example: 'Published' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created and attached successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task created and linked to Grand Contest' },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests/{id}/tasks/{taskId}': {
      delete: {
        tags: ['12. Grand Contest Management'],
        summary: 'Unlink Task from Grand Contest (Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789task' } }
        ],
        responses: {
          200: {
            description: 'Task unlinked successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task unlinked from Grand Contest' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests/{id}/submissions': {
      get: {
        tags: ['12. Grand Contest Management'],
        summary: 'List Proof Submissions for Grand Contest',
        description: 'Fetches contestant proof submissions for tasks in this Grand Contest.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['All', 'Pending', 'Approved', 'Rejected'], example: 'Pending' } }
        ],
        responses: {
          200: {
            description: 'List of proof submissions.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        submissions: { type: 'array', items: { $ref: '#/components/schemas/RoomSubmissionResponse' } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/grand-contests/{id}/tasks/{taskId}/submit': {
      post: {
        tags: ['12. Grand Contest Management'],
        summary: 'Submit Task Proof for Grand Contest (Contestant)',
        description: 'Submits contestant proof (URL, base64 file, image, text notes) for a Grand Contest task during the active contest dates window.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'GNC-2026-98124' } },
          { name: 'taskId', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789task' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  submissionType: { type: 'string', enum: ['Link', 'File', 'Text', 'Image', 'Video'], example: 'Link' },
                  mediaUrl: { type: 'string', example: 'https://youtube.com/watch?v=demo' },
                  proofNotes: { type: 'string', example: 'Completed task submission proof.' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Proof submitted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task proof submitted successfully' },
                    data: { $ref: '#/components/schemas/RoomSubmissionResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/grand-contests/submissions/{id}/review': {
      put: {
        tags: ['12. Grand Contest Management'],
        summary: 'Review Grand Contest Submission (Admin)',
        description: 'Approves or rejects a contestant task submission, assigning base score, bonus points, penalty points, and review feedback.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789sub' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Approved', 'Rejected'], example: 'Approved' },
                  score: { type: 'number', example: 100 },
                  bonus: { type: 'number', example: 10 },
                  penalty: { type: 'number', example: 0 },
                  feedback: { type: 'string', example: 'Excellent submission!' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Submission review recorded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Submission review recorded' },
                    data: { $ref: '#/components/schemas/RoomSubmissionResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/tasks': {
      get: {
        tags: ['13. Task Management'],
        summary: 'List All Tasks',
        description: 'Retrieves all tasks with optional search filtering by title/description and status filter.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', description: 'Search term for title or description', schema: { type: 'string', example: 'Creative' } },
          { name: 'status', in: 'query', description: 'Filter by task status', schema: { type: 'string', enum: ['All', 'Draft', 'Published', 'Running', 'Completed', 'Archived'], example: 'Published' } }
        ],
        responses: {
          200: {
            description: 'List of tasks retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 5 },
                    data: { type: 'array', items: { $ref: '#/components/schemas/TaskResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['13. Task Management'],
        summary: 'Create New Task',
        description: 'Creates a new Task record for room cycles, grand contests, or standalone challenges.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Daily Creative Video Challenge' },
                  description: { type: 'string', example: 'Record a 30-second video explaining your strategy.' },
                  instructions: { type: 'string', example: 'Ensure clear audio and steady camera.' },
                  mediaUrl: { type: 'string', example: '/uploads/tasks/cover_1723630000.png' },
                  taskType: { 
                    type: 'string', 
                    enum: ['Quiz', 'Creative', 'Photo', 'Video', 'Document', 'AI Prompt', 'Puzzle', 'Logic', 'Survey'], 
                    example: 'Video',
                    default: 'Quiz'
                  },
                  submissionType: { 
                    type: 'string', 
                    enum: ['Text', 'Image', 'Video', 'PDF', 'Document', 'URL', 'ZIP'], 
                    example: 'Video',
                    default: 'Video'
                  },
                  points: { type: 'number', example: 100, default: 0 },
                  bonusPoints: { type: 'number', example: 25, default: 0 },
                  penaltyPoints: { type: 'number', example: 0, default: 0 },
                  maxAttempts: { type: 'number', example: 3, default: 1 },
                  reviewType: { type: 'string', enum: ['Manual', 'AI', 'Auto'], example: 'AI', default: 'Manual' },
                  status: { type: 'string', enum: ['Draft', 'Published', 'Running', 'Completed', 'Archived'], example: 'Published', default: 'Published' },
                  isMandatory: { type: 'boolean', example: true, default: true },
                  order: { type: 'number', example: 1, default: 1 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Task created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['13. Task Management'],
        summary: 'Get Task Details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'MongoDB ObjectID of the task', schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Task details retrieved.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          },
          404: { description: 'Task not found.' }
        }
      },
      put: {
        tags: ['13. Task Management'],
        summary: 'Update Task Details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Creative Challenge' },
                  description: { type: 'string' },
                  instructions: { type: 'string' },
                  points: { type: 'number', example: 150 },
                  bonusPoints: { type: 'number', example: 30 },
                  status: { type: 'string', example: 'Published' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Task updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['13. Task Management'],
        summary: 'Delete Task',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Task deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/tasks/{id}/status': {
      patch: {
        tags: ['13. Task Management'],
        summary: 'Toggle Task Status (Published <-> Archived)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Task status toggled successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/tasks': {
      get: {
        tags: ['13. Task Management'],
        summary: 'List All Admin Tasks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string', example: 'Creative' } },
          { name: 'status', in: 'query', schema: { type: 'string', example: 'Published' } }
        ],
        responses: {
          200: {
            description: 'List of admin tasks retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    count: { type: 'integer', example: 5 },
                    data: { type: 'array', items: { $ref: '#/components/schemas/TaskResponse' } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['13. Task Management'],
        summary: 'Create New Admin Task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', example: 'Admin Quiz Challenge' },
                  description: { type: 'string', example: 'Complete admin quiz' },
                  points: { type: 'number', example: 100 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Admin Task created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/tasks/{id}': {
      get: {
        tags: ['13. Task Management'],
        summary: 'Get Admin Task Details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Admin Task details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['13. Task Management'],
        summary: 'Update Admin Task',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Admin Task' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Admin Task updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['13. Task Management'],
        summary: 'Delete Admin Task',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Admin Task deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Task deleted successfully' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/tasks/{id}/status': {
      patch: {
        tags: ['13. Task Management'],
        summary: 'Toggle Admin Task Status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '66bc91f24d9e123456789abc' } }],
        responses: {
          200: {
            description: 'Admin Task status toggled.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TaskResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/payments/settings': {
      get: {
        tags: ['14. Payment Gateway & Razorpay Setup'],
        summary: 'Get Razorpay Payment Gateway Settings',
        description: 'Retrieves current Razorpay payment gateway configuration including active mode, credentials format, merchant branding, currency, auto-capture rules, and accepted payment channels.',
        responses: {
          200: {
            description: 'Payment settings retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/PaymentSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['14. Payment Gateway & Razorpay Setup'],
        summary: 'Update Razorpay Payment Gateway Settings',
        description: 'Updates Razorpay API credentials, environment mode, merchant display settings, currency, auto-capture, and payment channels.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentSettingsResponse' }
            }
          }
        },
        responses: {
          200: {
            description: 'Payment settings updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Razorpay payment settings updated successfully' },
                    data: { $ref: '#/components/schemas/PaymentSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/admin/payments/settings': {
      get: {
        tags: ['14. Payment Gateway & Razorpay Setup'],
        summary: 'Admin: Get Razorpay Payment Gateway Settings',
        security: [{ bearerAuth: [] }],
        description: 'Admin endpoint to retrieve current Razorpay payment gateway configuration.',
        responses: {
          200: {
            description: 'Payment settings retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/PaymentSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['14. Payment Gateway & Razorpay Setup'],
        summary: 'Admin: Update Razorpay Payment Gateway Settings',
        security: [{ bearerAuth: [] }],
        description: 'Admin endpoint to update Razorpay API credentials, environment mode, merchant display settings, currency, auto-capture, and payment channels.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaymentSettingsResponse' }
            }
          }
        },
        responses: {
          200: {
            description: 'Payment settings updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Razorpay payment settings updated successfully' },
                    data: { $ref: '#/components/schemas/PaymentSettingsResponse' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/payments/settings/test-connection': {
      post: {
        tags: ['14. Payment Gateway & Razorpay Setup'],
        summary: 'Test Razorpay Credentials Connection & Handshake',
        description: 'Performs a connection handshake test validating Razorpay Key ID format against selected environment (Test vs Live).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['keyId', 'keySecret', 'environment'],
                properties: {
                  keyId: { type: 'string', example: 'rzp_test_9876543210abcd' },
                  keySecret: { type: 'string', example: 'sec_test_9876543210secretkey' },
                  environment: { type: 'string', enum: ['test', 'live'], example: 'test' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Connection test passed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Connection successfully verified with Razorpay TEST servers!' },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'connected' },
                        timestamp: { type: 'string', example: '2026-10-06T14:00:00.000Z' },
                        environment: { type: 'string', example: 'test' },
                        keyIdMasked: { type: 'string', example: 'rzp_test_9...abcd' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/schemas/ErrorResponse' }
        }
      }
    }
  }
};

export default swaggerDocument;

