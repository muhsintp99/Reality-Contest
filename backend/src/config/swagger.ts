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
  },
};
