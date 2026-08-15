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
    { name: '8. Mobile App API (Contestant V1)', description: 'Mobile V1 endpoints for contestant registration, login, profile management, image upload, and password change' }
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
    '/api/wallet/deposit': {
      post: {
        tags: ['7. Wallet & Transactions'],
        summary: 'Deposit Funds to Wallet',
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
                  paymentMethod: { type: 'string', example: 'UPI' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Deposit transaction initiated.'
          }
        }
      }
    },
    '/api/wallet/transactions': {
      get: {
        tags: ['7. Wallet & Transactions'],
        summary: 'View Wallet Transactions History',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Transaction log history.'
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
    }
  }
};

export default swaggerDocument;
