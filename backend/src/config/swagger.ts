export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Reality Contest Platform Auth & KYC API',
    version: '1.0.0',
    description: 'Production-ready scalable Authentication & KYC system API documentation for Reality Contest Platform.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Health Check', description: 'System health and status endpoints' },
    { name: 'Authentication', description: 'User registration, login, OTP verification, and password reset' },
    { name: 'User Profile', description: 'User profile management, avatar updates, and password changes' },
    { name: 'Device Sessions', description: 'Manage active logged-in device sessions' },
    { name: 'KYC Verification', description: 'KYC upload and administrator review workflows' },
    { name: 'Multipart Uploads', description: 'Large file multi-part upload operations' },
    { name: 'Contests', description: 'Contest list, details, creation, and participant registrations' },
    { name: 'Stages', description: 'Group stages, attempt activations, and quiz submissions' },
    { name: 'Wallet', description: 'Balance deposits and ledger transaction logs' },
    { name: 'Question Pools', description: 'Quiz pools builder and question banks management' },
    { name: 'Admin Controls', description: 'Super Admin overrides, user role promotions, and system audit logs' },
    { name: 'Single Uploads', description: 'Standard file upload endpoints' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'Authentication via http-only cookie (accessToken).',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Alternative authentication header when cookies are not used.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '662bcf98bca4871d34c89280' },
          name: { type: 'string', example: 'John Doe' },
          username: { type: 'string', example: 'johndoe' },
          email: { type: 'string', example: 'johndoe@example.com' },
          phone: { type: 'string', example: '+919876543210' },
          role: {
            type: 'string',
            enum: ['Contestant', 'Judge', 'Sponsor', 'Admin', 'Super Admin'],
            example: 'Contestant',
          },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          isEmailVerified: { type: 'boolean', example: true },
          isPhoneVerified: { type: 'boolean', example: false },
          kycStatus: {
            type: 'string',
            enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
            example: 'Pending',
          },
          referralCode: { type: 'string', example: 'REF12345' },
          walletBalance: { type: 'number', example: 100 },
          status: {
            type: 'string',
            enum: ['Active', 'Banned', 'Locked'],
            example: 'Active',
          },
          dob: { type: 'string', format: 'date-time', example: '1998-04-12T00:00:00.000Z' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
          state: { type: 'string', example: 'Maharashtra' },
          district: { type: 'string', example: 'Mumbai' },
          country: { type: 'string', example: 'India' },
          favoriteCategories: {
            type: 'array',
            items: { type: 'string' },
            example: ['Knowledge', 'Science'],
          },
          skills: {
            type: 'array',
            items: { type: 'string' },
            example: ['Coding', 'Writing'],
          },
          interests: {
            type: 'array',
            items: { type: 'string' },
            example: ['Indie SaaS', 'Travel'],
          },
          createdAt: { type: 'string', format: 'date-time', example: '2026-06-26T15:11:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-06-26T15:12:00.000Z' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'username', 'email', 'phone', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'John Doe' },
          username: { type: 'string', minLength: 3, example: 'johndoe' },
          email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
          phone: { type: 'string', minLength: 10, example: '+919876543210' },
          password: { type: 'string', minLength: 6, example: 'password123' },
          referralCode: { type: 'string', example: 'REF12345' },
          dob: { type: 'string', format: 'date', example: '1998-04-12' },
          gender: { type: 'string', enum: ['Male', 'Female', 'Other'], default: 'Male' },
          state: { type: 'string', example: 'Maharashtra' },
          district: { type: 'string', example: 'Mumbai' },
          country: { type: 'string', default: 'India' },
          favoriteCategories: { type: 'array', items: { type: 'string' }, default: [] },
          skills: { type: 'array', items: { type: 'string' }, default: [] },
          interests: { type: 'array', items: { type: 'string' }, default: [] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['loginId'],
        properties: {
          loginId: { type: 'string', example: 'johndoe@example.com', description: 'Can be email, username, or phone.' },
          password: { type: 'string', example: 'password123' },
          isOtpLogin: { type: 'boolean', default: false },
          otp: { type: 'string', example: '123456' },
        },
      },
      SendOtpRequest: {
        type: 'object',
        required: ['loginId', 'type'],
        properties: {
          loginId: { type: 'string', example: 'johndoe@example.com' },
          type: {
            type: 'string',
            enum: ['login', 'reset_password', 'email_verify', 'phone_verify'],
            example: 'email_verify',
          },
        },
      },
      VerifyOtpRequest: {
        type: 'object',
        required: ['userId', 'otp', 'type'],
        properties: {
          userId: { type: 'string', example: '662bcf98bca4871d34c89280' },
          otp: { type: 'string', length: 6, example: '123456' },
          type: {
            type: 'string',
            enum: ['login', 'reset_password', 'email_verify', 'phone_verify'],
            example: 'email_verify',
          },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'johndoe@example.com' },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['userId', 'otp', 'newPassword'],
        properties: {
          userId: { type: 'string', example: '662bcf98bca4871d34c89280' },
          otp: { type: 'string', length: 6, example: '123456' },
          newPassword: { type: 'string', minLength: 6, example: 'newpassword123' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, example: 'John Updated' },
          phone: { type: 'string', minLength: 10, example: '+919999999999' },
        },
      },
      UpdateAvatarRequest: {
        type: 'object',
        required: ['avatar'],
        properties: {
          avatar: { type: 'string', format: 'uri', example: 'https://example.com/new-avatar.jpg' },
        },
      },
      UpdatePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'password123' },
          newPassword: { type: 'string', minLength: 6, example: 'newpassword123' },
        },
      },
      SubmitKycRequest: {
        type: 'object',
        required: ['documentType', 'documentNumber', 'documentFrontUrl', 'selfieUrl'],
        properties: {
          documentType: {
            type: 'string',
            enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License'],
            example: 'Aadhaar',
          },
          documentNumber: { type: 'string', minLength: 4, example: '1234-5678-9012' },
          documentFrontUrl: { type: 'string', format: 'uri', example: 'https://example.com/doc-front.jpg' },
          documentBackUrl: { type: 'string', format: 'uri', example: 'https://example.com/doc-back.jpg' },
          selfieUrl: { type: 'string', format: 'uri', example: 'https://example.com/selfie.jpg' },
        },
      },
      ReviewKycRequest: {
        type: 'object',
        required: ['kycId', 'status'],
        properties: {
          kycId: { type: 'string', example: '662bd890bca4871d34c89299' },
          status: { type: 'string', enum: ['Approved', 'Rejected'], example: 'Approved' },
          rejectionReason: { type: 'string', example: 'Selfie blurred or non-matching.' },
        },
      },
      CreateContestRequest: {
        type: 'object',
        required: ['title', 'entryFee', 'prizePool', 'registrationStartDate', 'registrationEndDate', 'startDate', 'endDate'],
        properties: {
          title: { type: 'string', example: 'India Creator Showdown 2026' },
          description: { type: 'string', example: 'Join the showdown' },
          prizePool: { type: 'string', example: '10,00,000' },
          registrationStartDate: { type: 'string', format: 'date-time', example: '2026-06-01T00:00:00.000Z' },
          registrationEndDate: { type: 'string', format: 'date-time', example: '2026-06-30T00:00:00.000Z' },
          startDate: { type: 'string', format: 'date-time', example: '2026-07-01T00:00:00.000Z' },
          endDate: { type: 'string', format: 'date-time', example: '2026-07-15T00:00:00.000Z' },
          entryFee: { type: 'number', example: 499 },
          maxParticipants: { type: 'number', example: 500 },
        },
      },
      ContestResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '662bd890bca4871d34c89290' },
          title: { type: 'string', example: 'India Creator Showdown 2026' },
          description: { type: 'string', example: 'Join the showdown' },
          prizePool: { type: 'string', example: '10,00,000' },
          entryFee: { type: 'number', example: 499 },
          status: { type: 'string', enum: ['Upcoming', 'Registration Open', 'Active', 'Completed'], example: 'Registration Open' },
        },
      },
      CreateStageRequest: {
        type: 'object',
        required: ['name', 'type', 'timeLimit', 'passingPercentage'],
        properties: {
          name: { type: 'string', example: 'Stage 1: GK Quiz Arena' },
          type: { type: 'string', enum: ['Quiz', 'VideoUpload', 'CustomStage'], example: 'Quiz' },
          timeLimit: { type: 'number', example: 300, description: 'Time limit in seconds.' },
          passingPercentage: { type: 'number', example: 60 },
          rules: {
            type: 'object',
            properties: {
              rules: { type: 'string', example: 'Answer questions within time.' },
              instructions: { type: 'string', example: 'Do not refresh page.' },
              regulations: { type: 'string', example: 'Standard code of conduct.' },
              attemptPolicy: { type: 'string', example: 'Single attempt allowed.' },
              disqualificationPolicy: { type: 'string', example: 'Tab switches auto disqualify.' },
            },
          },
        },
      },
      StageResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'stage_id_123' },
          name: { type: 'string', example: 'Stage 1: GK Quiz Arena' },
          type: { type: 'string', example: 'Quiz' },
          timeLimit: { type: 'number', example: 300 },
          passingPercentage: { type: 'number', example: 60 },
          rules: {
            type: 'object',
            properties: {
              rules: { type: 'string' },
              instructions: { type: 'string' },
              regulations: { type: 'string' },
              attemptPolicy: { type: 'string' },
              disqualificationPolicy: { type: 'string' },
            },
          },
        },
      },
      DepositRequest: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', example: 1000 },
          description: { type: 'string', example: 'User Deposit' },
        },
      },
      WalletTransactionResponse: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'txn_id_123' },
          amount: { type: 'number', example: 1000 },
          type: { type: 'string', enum: ['Deposit', 'Withdrawal', 'Entry Fee'], example: 'Deposit' },
          status: { type: 'string', enum: ['Pending', 'Completed', 'Failed'], example: 'Completed' },
          description: { type: 'string', example: 'User Deposit' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-06-26T15:12:00.000Z' },
        },
      },
      CreatePoolRequest: {
        type: 'object',
        required: ['name', 'category'],
        properties: {
          name: { type: 'string', example: 'GK General Knowledge Pool' },
          category: { type: 'string', example: 'Knowledge' },
          description: { type: 'string', example: 'Pool for GK quizzes' },
        },
      },
      AddQuestionRequest: {
        type: 'object',
        required: ['questionText', 'type', 'options', 'correctAnswerIndex'],
        properties: {
          questionText: { type: 'string', example: 'What is the capital of India?' },
          type: { type: 'string', enum: ['Single Choice', 'Multiple Choice'], example: 'Single Choice' },
          options: {
            type: 'array',
            items: { type: 'string' },
            example: ['New Delhi', 'Mumbai', 'Chennai', 'Kolkata'],
          },
          correctAnswerIndex: { type: 'number', example: 0 },
        },
      },
      Question: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: 'q_123' },
          questionText: { type: 'string', example: 'What is the capital of India?' },
          type: { type: 'string', example: 'Single Choice' },
          options: { type: 'array', items: { type: 'string' }, example: ['New Delhi', 'Mumbai', 'Chennai', 'Kolkata'] },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health Check'],
        summary: 'Check API Health & Dependent Services',
        description: 'Returns health status of the application, MongoDB database, Redis, and queues.',
        responses: {
          200: {
            description: 'API is operational.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    database: { type: 'string', example: 'connected' },
                    redis: { type: 'string', example: 'connected' },
                    activeQueues: { type: 'string', example: 'active' },
                    clustering: { type: 'string', example: 'standalone' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a New User',
        description: 'Creates a user account and schedules verification OTPs to email and phone via background workers.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registration successful. Verification OTPs sent.' },
                    userId: { type: 'string', example: '662bcf98bca4871d34c89280' },
                    mockOtps: {
                      type: 'object',
                      properties: {
                        emailOtp: { type: 'string', example: '123456' },
                        phoneOtp: { type: 'string', example: '654321' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or duplicate email/username/phone.' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login (Password or OTP)',
        description: 'Authenticates a user via either password or OTP. Sets httpOnly token cookies (accessToken and refreshToken).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Successfully authenticated.',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string', example: 'accessToken=...; HttpOnly; Secure' },
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged in successfully.' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid login credentials or unverified OTP.' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out User',
        description: 'Invalidates the current session and clears accessToken and refreshToken HTTP-only cookies.',
        responses: {
          200: {
            description: 'Successfully logged out.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh Access Token',
        description: 'Uses the refresh token (from body or cookie) to issue a new access token and set cookies.',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string', example: 'eyJhbGciOi...' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    accessToken: { type: 'string', example: 'new_access_token_jwt' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid or expired refresh token.' },
        },
      },
    },
    '/api/auth/send-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Send Verification OTP',
        description: 'Sends an OTP to the user email or phone for login, verification, or password reset purposes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendOtpRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP sent.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Verification OTP code sent successfully.' },
                    mockOtp: { type: 'string', example: '123456' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/verify-otp': {
      post: {
        tags: ['Authentication'],
        summary: 'Verify OTP',
        description: 'Verifies the OTP token against the pending queue for the user.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
            },
          },
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
                    message: { type: 'string', example: 'OTP verified successfully.' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid or expired OTP.' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Forgot Password OTP Request',
        description: 'Triggers a password reset request and sends a reset OTP to the user registered email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP sent.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password reset OTP code sent to registered email.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset Password with OTP',
        description: 'Resets the password after verifying the OTP token. Invalidates all active sessions.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password reset successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password updated successfully. Device sessions invalidated.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/oauth': {
      post: {
        tags: ['Authentication'],
        summary: 'Simulated OAuth Login',
        description: 'Simulates a Google/Facebook OAuth response payload return.',
        responses: {
          200: {
            description: 'OAuth simulated success.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'OAuth login simulated success.' },
                    user: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', example: 'OAuth User' },
                        email: { type: 'string', example: 'oauth_user@realitycontest.com' },
                        role: { type: 'string', example: 'Contestant' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Authenticated User Profile',
        description: 'Retrieves profile of the currently logged-in user session.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'User details returned.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized.' },
        },
      },
    },
    '/api/users/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Get Detailed Profile details',
        description: 'Returns active profile structure of the logged-in user.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profile fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized.' },
        },
      },
      put: {
        tags: ['User Profile'],
        summary: 'Update Profile Details',
        description: 'Updates profile fields such as name and phone.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
            },
          },
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
                    message: { type: 'string', example: 'Profile updated successfully.' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/avatar': {
      put: {
        tags: ['User Profile'],
        summary: 'Update Avatar URL',
        description: 'Updates the user avatar image reference URL in database.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAvatarRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Avatar updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Avatar updated successfully.' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/password': {
      put: {
        tags: ['User Profile'],
        summary: 'Update password',
        description: 'Updates password after validating current password.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePasswordRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Password changed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password updated successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/account': {
      delete: {
        tags: ['User Profile'],
        summary: 'Delete User Account',
        description: 'Flags or hard deletes user profile and invalidates active session keys.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Account deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Account deleted successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/sessions': {
      get: {
        tags: ['Device Sessions'],
        summary: 'Get Active Sessions',
        description: 'Lists all device sessions active for the logged-in account.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of active sessions.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    sessions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: 'session_id_123' },
                          ip: { type: 'string', example: '127.0.0.1' },
                          device: { type: 'string', example: 'Windows Desktop' },
                          browser: { type: 'string', example: 'Google Chrome' },
                          isCurrent: { type: 'boolean', example: true },
                          lastActive: { type: 'string', format: 'date-time', example: '2026-06-26T15:12:00.000Z' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/sessions/all': {
      delete: {
        tags: ['Device Sessions'],
        summary: 'Revoke All Sessions',
        description: 'Revokes all active device sessions except the current active connection.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Sessions revoked.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Logged out of all other devices successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/users/sessions/{sessionId}': {
      delete: {
        tags: ['Device Sessions'],
        summary: 'Revoke Specific Session',
        description: 'Terminates a specific device session ID.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID of the session to terminate.',
          },
        ],
        responses: {
          200: {
            description: 'Session revoked.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Session revoked successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/kyc/upload': {
      post: {
        tags: ['KYC Verification'],
        summary: 'Submit KYC Documents',
        description: 'Submits user identification records for AI-assisted liveness check and Admin review.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmitKycRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'KYC Document submitted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    kyc: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', example: '662bd890bca4871d34c89299' },
                        status: { type: 'string', example: 'Pending' },
                        documentType: { type: 'string', example: 'Aadhaar' },
                        documentNumber: { type: 'string', example: '1234-5678-9012' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/kyc/status': {
      get: {
        tags: ['KYC Verification'],
        summary: 'Get KYC Status',
        description: 'Returns active KYC verification status details for the current user.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'KYC status details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    kyc: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'Approved' },
                        documentType: { type: 'string', example: 'Aadhaar' },
                        aiMatchResult: { type: 'string', example: 'Matched' },
                        livenessScore: { type: 'number', example: 98 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/kyc/pending': {
      get: {
        tags: ['KYC Verification'],
        summary: 'Get Pending KYCs (Admin)',
        description: 'Lists all KYC applications pending review or currently under review by admins.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of pending KYCs.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    kycs: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string', example: 'kyc_id_1' },
                          userId: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string', example: 'user_id_1' },
                              name: { type: 'string', example: 'John Doe' },
                            },
                          },
                          documentType: { type: 'string', example: 'Aadhaar' },
                          documentNumber: { type: 'string', example: '1234-5678-9012' },
                          status: { type: 'string', example: 'Under Review' },
                          livenessScore: { type: 'number', example: 92 },
                          aiMatchResult: { type: 'string', example: 'Matched' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/kyc/review': {
      put: {
        tags: ['KYC Verification'],
        summary: 'Review KYC Application (Admin)',
        description: 'Approve or reject a contestant KYC verification application.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewKycRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'KYC review completed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'KYC review completed. Status updated.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/upload/initiate': {
      post: {
        tags: ['Multipart Uploads'],
        summary: 'Initiate Multipart Upload',
        description: 'Starts a multi-part upload session for large video/image assets on AWS S3 or Cloudinary.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['filename', 'fileType'],
                properties: {
                  filename: { type: 'string', example: 'video.mp4' },
                  fileType: { type: 'string', example: 'video/mp4' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Multipart upload initiated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    uploadId: { type: 'string', example: 'aws_upload_session_id_123' },
                    key: { type: 'string', example: 'uploads/video-1719400000.mp4' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/upload/chunk': {
      post: {
        tags: ['Multipart Uploads'],
        summary: 'Upload Chunk',
        description: 'Uploads a specific block/chunk for a multipart upload.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Chunk uploaded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    chunkNumber: { type: 'number', example: 1 },
                    etag: { type: 'string', example: '"e5927891fa12e69bb0d8"' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/upload/progress/{uploadId}': {
      get: {
        tags: ['Multipart Uploads'],
        summary: 'Get Upload Progress',
        description: 'Returns upload status, uploaded parts and current completion percentage.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'uploadId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Session upload ID.',
          },
        ],
        responses: {
          200: {
            description: 'Progress status.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    progress: { type: 'number', example: 45 },
                    uploadedParts: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/upload/complete': {
      post: {
        tags: ['Multipart Uploads'],
        summary: 'Complete Upload Session',
        description: 'Finalizes multipart chunks and constructs the final accessible resource URL.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['uploadId', 'key', 'parts'],
                properties: {
                  uploadId: { type: 'string', example: 'aws_upload_session_id_123' },
                  key: { type: 'string', example: 'uploads/video-1719400000.mp4' },
                  parts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        PartNumber: { type: 'number', example: 1 },
                        ETag: { type: 'string', example: '"e5927891fa12e69bb0d8"' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Upload completed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    fileUrl: { type: 'string', format: 'uri', example: 'https://s3.amazonaws.com/bucket/uploads/video.mp4' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/upload': {
      post: {
        tags: ['Single Uploads'],
        summary: 'Upload a Single File',
        description: 'Uploads a single image/video file to the local server or cloud database.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
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
                    fileUrl: { type: 'string', example: '/uploads/file-1719400000.jpg' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/contests': {
      post: {
        tags: ['Contests'],
        summary: 'Create a Contest (Admin)',
        description: 'Creates a new contest with registration fees and start/end details.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateContestRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Contest created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    contest: { $ref: '#/components/schemas/ContestResponse' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Contests'],
        summary: 'List Contests',
        description: 'Retrieves a list of all active/upcoming/completed contests.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of contests.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    contests: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ContestResponse' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/contests/{id}': {
      get: {
        tags: ['Contests'],
        summary: 'Get Contest Details',
        description: 'Returns metadata, rounds, and participant group metrics for a contest.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Contest ID',
          },
        ],
        responses: {
          200: {
            description: 'Contest details.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    contest: { $ref: '#/components/schemas/ContestResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/contests/{id}/join': {
      post: {
        tags: ['Contests'],
        summary: 'Register for a Contest',
        description: 'Registers the authenticated user for a contest. Subtracts entryFee from their wallet balance.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Contest ID',
          },
        ],
        responses: {
          200: {
            description: 'Registered successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Registered for contest successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/groups/{groupId}/stages': {
      post: {
        tags: ['Stages'],
        summary: 'Create a Stage in Group (Admin)',
        description: 'Adds a quiz or video upload stage round into a participant group.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Group ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateStageRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Stage created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    stage: { $ref: '#/components/schemas/StageResponse' },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Stages'],
        summary: 'List Stages in Group',
        description: 'Lists all rounds and stages configured for a specific group.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Group ID',
          },
        ],
        responses: {
          200: {
            description: 'List of stages.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    stages: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/StageResponse' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/stages/{id}/unlock-status': {
      get: {
        tags: ['Stages'],
        summary: 'Check Stage Unlock Status',
        description: 'Checks if the user has qualified and unlocked this stage.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stage ID',
          },
        ],
        responses: {
          200: {
            description: 'Unlock status check.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    unlocked: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/stages/{id}/accept-rules': {
      post: {
        tags: ['Stages'],
        summary: 'Accept Stage Attempt Rules',
        description: 'User accepts attempt terms and anti-cheat policies.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stage ID',
          },
        ],
        responses: {
          200: {
            description: 'Rules accepted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/stages/{id}/start': {
      post: {
        tags: ['Stages'],
        summary: 'Start Stage Attempt',
        description: 'Initiates attempt timers, locks fullscreen checks, and retrieves quiz questions.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stage ID',
          },
        ],
        responses: {
          200: {
            description: 'Attempt started.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    attemptId: { type: 'string', example: 'att_12345' },
                    questions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Question' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/stages/{id}/submit': {
      post: {
        tags: ['Stages'],
        summary: 'Submit Stage Attempt',
        description: 'Submits user answers or files. Processes AI grading engine scoring.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Stage ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  answers: { type: 'object', example: { 'q-1': 0, 'q-2': [1, 2] } },
                  fileUrl: { type: 'string', example: 'https://example.com/pitch.mp4' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Attempt submitted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    score: { type: 'number', example: 80 },
                    passed: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/wallet/deposit': {
      post: {
        tags: ['Wallet'],
        summary: 'Deposit Funds',
        description: 'Simulates payment gateway transaction and increments wallet balance.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DepositRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Deposit completed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    walletBalance: { type: 'number', example: 3500 },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/wallet/transactions': {
      get: {
        tags: ['Wallet'],
        summary: 'Get Transaction Ledger',
        description: 'Returns transaction logs for deposits, withdrawals, and entries.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Transactions list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WalletTransactionResponse' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/question-pools': {
      post: {
        tags: ['Question Pools'],
        summary: 'Create Question Pool (Admin)',
        description: 'Creates a question category pool for stage integration.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePoolRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Pool created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Question Pools'],
        summary: 'List Question Pools (Admin)',
        description: 'Lists all available question category pools.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Pools list.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    pools: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          category: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/question-pools/{poolId}/questions': {
      post: {
        tags: ['Question Pools'],
        summary: 'Add Question to Pool (Admin)',
        description: 'Appends a single trivia/quiz question to the pool bank.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'poolId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pool ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddQuestionRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Question added.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Question Pools'],
        summary: 'List Questions in Pool',
        description: 'Returns all questions inside the specified pool.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'poolId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pool ID',
          },
        ],
        responses: {
          200: {
            description: 'Questions fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/question-pools/{poolId}/import': {
      post: {
        tags: ['Question Pools'],
        summary: 'Bulk Import Questions (Admin)',
        description: 'Bulk imports questions from a list.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'poolId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pool ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  questions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AddQuestionRequest' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Import complete.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/audit-logs': {
      get: {
        tags: ['Admin Controls'],
        summary: 'Get Audit Security logs (Super Admin)',
        description: 'Retrieves active system actions logging for audits.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logs fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    logs: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/results/override': {
      put: {
        tags: ['Admin Controls'],
        summary: 'Manual Override qualification (Super Admin)',
        description: 'Forces qualification overrides for a participant attempt.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resultId', 'status'],
                properties: {
                  resultId: { type: 'string', example: 'res_123' },
                  status: { type: 'string', enum: ['Qualified', 'Disqualified'], example: 'Qualified' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Override successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Status updated successfully.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/users/role': {
      put: {
        tags: ['Admin Controls'],
        summary: 'Promote User Role (Super Admin)',
        description: 'Changes system access level role of a user email.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'role'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'judge@rcp.com' },
                  role: { type: 'string', enum: ['Contestant', 'Judge', 'Sponsor', 'Admin', 'Super Admin'], example: 'Judge' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Role promoted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User role updated.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/users/{role}': {
      get: {
        tags: ['Admin Controls'],
        summary: 'List Users by Role (Admin)',
        description: 'Returns all system users having a specific role credential.',
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [
          {
            name: 'role',
            in: 'path',
            required: true,
            schema: { type: 'string', enum: ['Contestant', 'Judge', 'Sponsor', 'Admin', 'Super Admin'] },
            description: 'System role',
          },
        ],
        responses: {
          200: {
            description: 'Users fetched.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
