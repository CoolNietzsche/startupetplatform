# StartupET Authentication Implementation Guide

## Technical Documentation

### Overview

The StartupET authentication system is built on **NestJS** with **JWT (JSON Web Tokens)** and implements a **stateless, token-based authentication** pattern with **role-based access control (RBAC)**.

**Technology Stack:**
- **Framework:** NestJS
- **Authentication:** Passport.js with JWT strategy
- **Password Hashing:** bcrypt
- **Database:** PostgreSQL with Prisma ORM
- **Validation:** class-validator

---

## Architecture

### Module Structure

```
AuthModule/
├── passport/              # Passport.js configuration
│   └── jwt.strategy.ts    # JWT validation strategy
├── guards/                # Authentication & authorization guards
│   ├── jwt-auth.guard.ts  # JWT token validation
│   └── roles.guard.ts     # Role-based access control
├── decorators/            # Custom decorators
│   └── roles.decorator.ts # @Roles() decorator
├── dto/                   # Data transfer objects
│   ├── login.dto.ts       # Login request validation
│   ├── register.dto.ts    # Registration validation
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   └── verify-email.dto.ts
├── auth.service.ts        # Business logic
├── auth.controller.ts     # HTTP endpoints
├── auth.module.ts         # Module configuration
└── auth.controller.spec.ts # Unit tests
```

---

## Authentication Flows

### 1. Registration Flow

```
POST /api/auth/register
    ↓
[AuthController.register()]
    ↓
[AuthService.register(registerDto)]
    ↓
Validate DTO (class-validator)
    ↓
Check existing user (Prisma)
    ↓
Hash password (bcrypt, 10 rounds)
    ↓
Create user record (Prisma)
    ↓
Return user object (excluding passwordHash)
    ↓
TODO: Send verification email
```

**Implementation:**
```typescript
async register(registerDto: RegisterDto) {
  // Check if user already exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    throw new BadRequestException('User with this email already exists');
  }

  // Hash the password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(registerDto.password, 10);

  // Create the user
  const user = await this.prisma.user.create({
    data: {
      email: registerDto.email,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      role: registerDto.role || 'STARTUP',
      organization: registerDto.organization,
      phoneNumber: registerDto.phoneNumber,
      position: registerDto.position,
    },
  });

  // Remove password from response
  const { passwordHash, ...result } = user;
  return result;
}
```

### 2. Login Flow

```
POST /api/auth/login
    ↓
[AuthController.login()]
    ↓
[AuthService.login(loginDto)]
    ↓
Validate DTO
    ↓
Find user by email (Prisma)
    ↓
Verify password (bcrypt.compare)
    ↓
Generate JWT tokens
    ↓
Return { user, accessToken, refreshToken }
```

**Implementation:**
```typescript
async login(loginDto: LoginDto) {
  // Find the user
  const user = await this.prisma.user.findUnique({
    where: { email: loginDto.email },
  });

  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    loginDto.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate tokens
  const tokens = this.generateTokens(user);

  // Remove password from response
  const { passwordHash, ...result } = user;

  return {
    user: result,
    ...tokens,
  };
}
```

### 3. Token Refresh Flow

```
POST /api/auth/refresh
    ↓
Extract refreshToken from body
    ↓
Verify refresh token (JWT)
    ↓
Find user by ID from token payload
    ↓
Generate new access + refresh tokens
    ↓
Return new tokens
```

**Implementation:**
```typescript
async refreshToken(refreshToken: string) {
  try {
    // Verify refresh token
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Generate new tokens
    return this.generateTokens(user);
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
```

---

## Token Generation

### JWT Token Structure

```typescript
// JWT Payload Structure
{
  email: string,    // User email address
  sub: string,      // User ID (JWT subject claim)
  role: string      // User role (ADMIN, COMMITTEE, STARTUP, ECOSYSTEM_BUILDER)
}
```

### Token Generation Logic

```typescript
private generateTokens(user: any) {
  const payload = { email: user.email, sub: user.id, role: user.role };

  return {
    accessToken: this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
    }),
    refreshToken: this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    }),
  };
}
```

### Token Configuration

| Token Type | Expiration | Secret | Usage |
|------------|------------|--------|-------|
| Access Token | 1 day | `JWT_SECRET` | API authentication |
| Refresh Token | 7 days | `JWT_REFRESH_SECRET` | Token renewal |

---

## Authorization System (RBAC)

### Role Hierarchy

```typescript
enum Role {
  ADMIN = 'ADMIN',                    // Full system access
  COMMITTEE = 'COMMITTEE',            // Review & assess applications
  STARTUP = 'STARTUP',                // Manage own startup and applications
  ECOSYSTEM_BUILDER = 'ECOSYSTEM_BUILDER'  // Manage ecosystem builder profile
}
```

### Guard Implementation

#### JwtAuthGuard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Purpose:** Validates JWT token presence and validity using Passport JWT strategy.

#### RolesGuard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

**Purpose:** Checks if authenticated user's role matches required roles for the endpoint.

### @Roles() Decorator

```typescript
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### Usage Pattern

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply to all routes in controller
export class UserController {

  @Post()
  @Roles('ADMIN')  // Only admins can create users
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  
  @Get(':id')
  // No @Roles decorator = accessible to any authenticated user
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
```

---

## JWT Strategy Implementation

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        organization: true,
        phoneNumber: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    
    return user;  // Attached to request object
  }
}
```

---

## API Endpoints

| Endpoint | Method | Auth Required | Roles | Description |
|----------|--------|---------------|-------|-------------|
| `/api/auth/register` | POST | No | - | Create new user account |
| `/api/auth/login` | POST | No | - | Authenticate and receive tokens |
| `/api/auth/refresh` | POST | No | - | Refresh access token |
| `/api/auth/verify-email` | POST | No | - | Verify email with token |
| `/api/auth/forgot-password` | POST | No | - | Request password reset |
| `/api/auth/reset-password` | POST | No | - | Reset password with token |
| `/api/auth/me` | GET | Yes | Any | Get current user profile |
| `/api/auth/logout` | POST | Yes | Any | Logout (client-side) |

---

## Data Transfer Objects (DTOs)

### LoginDto
```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

### RegisterDto
```typescript
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  role?: string;

  @IsOptional()
  organization?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  position?: string;
}
```

---

## Database Schema

### User Model (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  fullName      String
  role          Role      @default(STARTUP)
  organization  String?
  phoneNumber   String?
  position      String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  startup       Startup?
  committee     CommitteeMember?
  ecosystemBuilder EcosystemBuilder?
  applications  Application[]
  assessments   Assessment[]
  notifications Notification[]
}

enum Role {
  ADMIN
  COMMITTEE
  STARTUP
  ECOSYSTEM_BUILDER
}
```

---

## Security Implementation

### Password Security
- **Hashing Algorithm:** bcrypt with 10 salt rounds
- **Storage:** Only hashed passwords stored in database
- **Comparison:** bcrypt.compare() for verification
- **Minimum Length:** 6 characters enforced by DTO validation

### Token Security
- **Secret Management:** Environment variables (JWT_SECRET, JWT_REFRESH_SECRET)
- **Token Extraction:** Bearer token from Authorization header
- **Expiration:** Automatic JWT expiration checking
- **Stateless:** No server-side session storage required

### Authorization Security
- **Role Validation:** @Roles() decorator with RolesGuard
- **Authentication:** JwtAuthGuard validates all protected routes
- **User Verification:** Database lookup on every request (stateless)

---

## Environment Configuration

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_token_secret_key_change_in_production
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/startupet?schema=public"
```

---

## Module Configuration

### auth.module.ts
```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, RolesGuard],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
```

---

## Additional Features

### Email Verification
```typescript
async verifyEmail(token: string) {
  try {
    const payload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  } catch (error) {
    throw new UnauthorizedException('Invalid token');
  }
}
```

### Password Reset
```typescript
async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const token = this.jwtService.sign(
    { sub: user.id, email: user.email },
    {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    },
  );

  return { message: 'Password reset email sent' };
}
```

---

## TODO Items

### Security Enhancements (Planned)
- [ ] Email verification email sending
- [ ] Password reset email sending
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed attempts
- [ ] Token blacklisting for logout
- [ ] IP-based security monitoring
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth integration (Google, GitHub)

### Improvements
- [ ] Token rotation on refresh
- [ ] Refresh token family detection
- [ ] Audit logging for auth events
- [ ] Session management dashboard
- [ ] API key authentication for service accounts

---

## Frontend Integration Guide

### 1. Token Storage
Store tokens securely (recommended: httpOnly cookies, fallback: secure localStorage).

### 2. API Requests
Include Authorization header on all authenticated requests:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

### 3. Token Refresh
Implement automatic token refresh before expiration:
```javascript
// Intercept 401 responses
// Refresh token using /api/auth/refresh
// Retry original request with new token
```

### 4. Logout
Clear tokens from storage on logout. Server-side logout is stateless.

### 5. Role-Based UI
Use user role from `/api/auth/me` to conditionally render UI elements.

---

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing Endpoints
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (requires token)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

---

## References

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [JWT.io](https://jwt.io/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Version:** 1.0  
**Last Updated:** February 2026  
**Author:** StartupET Development Team
