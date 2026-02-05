# Row Level Security (RLS) Policies

## Overview

All tables have RLS enabled. Access is controlled through policies that use `auth.uid()` to identify the current user.

## Security Helper Functions

### has_role()
Checks if a user has a specific role without causing infinite recursion.

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

---

## Profiles Table Policies

### SELECT
- **Anyone can view profiles** (public profiles)
```sql
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);
```

### INSERT
- **Users can create their own profile**
```sql
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### UPDATE
- **Users can update their own profile**
```sql
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Tweets Table Policies

### SELECT
- **Anyone can view tweets** (public timeline)
```sql
CREATE POLICY "Tweets are viewable by everyone"
ON public.tweets FOR SELECT
USING (true);
```

### INSERT
- **Authenticated users can create tweets**
```sql
CREATE POLICY "Authenticated users can create tweets"
ON public.tweets FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### UPDATE
- **Users can edit their own tweets**
```sql
CREATE POLICY "Users can edit their own tweets"
ON public.tweets FOR UPDATE
USING (auth.uid() = user_id);
```

### DELETE
- **Users can delete their own tweets**
- **Admins can delete any tweet**
```sql
CREATE POLICY "Users can delete their own tweets"
ON public.tweets FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
```

---

## Tweet Interactions Policies

### SELECT
- **Anyone can view interactions** (for counts)
```sql
CREATE POLICY "Interactions are viewable by everyone"
ON public.tweet_interactions FOR SELECT
USING (true);
```

### INSERT
- **Authenticated users can create interactions**
```sql
CREATE POLICY "Authenticated users can interact"
ON public.tweet_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### DELETE
- **Users can remove their own interactions**
```sql
CREATE POLICY "Users can remove their interactions"
ON public.tweet_interactions FOR DELETE
USING (auth.uid() = user_id);
```

---

## User Roles Policies

### SELECT
- **Users can view their own roles**
- **Admins can view all roles**
```sql
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
```

### INSERT/UPDATE/DELETE
- **Only admins can manage roles**
```sql
CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Follows Policies

### SELECT
- **Anyone can view follow relationships**
```sql
CREATE POLICY "Follow relationships are viewable"
ON public.follows FOR SELECT
USING (true);
```

### INSERT
- **Authenticated users can follow others**
```sql
CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);
```

### DELETE
- **Users can unfollow**
```sql
CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);
```

---

## Security Best Practices

1. **Never store roles in the profiles table** - Use separate `user_roles` table
2. **Use SECURITY DEFINER functions** for role checks to avoid infinite recursion
3. **Always use `auth.uid()`** for user identification, never client-provided IDs
4. **Set `search_path = public`** in security definer functions
5. **Validate on both client and server** - RLS is the last line of defense
