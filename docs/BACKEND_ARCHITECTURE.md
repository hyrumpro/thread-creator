# Backend Architecture

## Overview

This application uses Lovable Cloud as the backend infrastructure, providing:
- **PostgreSQL Database**: Relational database for storing all application data
- **Authentication**: Built-in user authentication with email/password
- **Row Level Security (RLS)**: Fine-grained access control at the database level
- **Edge Functions**: Serverless functions for custom backend logic

## Technology Stack

| Component | Technology |
|-----------|------------|
| Database | PostgreSQL |
| Authentication | Lovable Cloud Auth |
| API | Auto-generated REST API |
| Security | Row Level Security (RLS) |
| Backend Functions | Deno Edge Functions |

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed table structures.

## Security Model

See [RLS_POLICIES.md](./RLS_POLICIES.md) for Row Level Security policies.

## Authentication Flow

1. **Registration**: User submits email + password → Account created → Email verification sent
2. **Login**: User submits credentials → JWT token issued → Session established
3. **Session**: JWT stored in browser → Included in all API requests
4. **Logout**: Session invalidated → JWT cleared

## API Access Patterns

All database operations go through the auto-generated REST API with RLS policies enforcing access control.

```typescript
import { supabase } from "@/integrations/supabase/client";

// Authenticated queries automatically include user context
const { data } = await supabase.from('tweets').select('*');
```

## File Storage

User uploads (avatars, images) are stored in Lovable Cloud Storage with appropriate access policies.
