---
alwaysApply: true
---

# Production-Level Code Standards & Best Practices

## Core Principles

### Production-Ready Code Requirements

1. **Type Safety First**: All code must be fully typed with no `any` types (TypeScript) or untyped functions (Python)
2. **Error Handling**: Every operation must have comprehensive error handling with proper logging
3. **Security**: All inputs must be validated, authenticated, and sanitized
4. **Performance**: Code must be optimized for production workloads with proper caching and resource management
5. **Observability**: All operations must be logged, traced, and monitored
6. **Scalability**: Code must handle concurrent operations and scale horizontally

---

## Python / FastAPI Backend Standards

### Type Safety & Code Quality

#### Type Hints Requirements
- **ALL functions** must have complete type hints including parameters and return types
- Use `Optional[T]` for nullable values, never use `None` without type annotation
- Use `Union[T, U]` for multiple possible types
- Use `Dict[str, Any]` sparingly - prefer typed dataclasses or Pydantic models
- Use `List[T]` instead of `list` for type hints
- Import types from `typing` module: `from typing import Optional, List, Dict, Any, Union`

```python
# ✅ GOOD
async def create_agent(
    agent_data: AgentCreateRequest,
    user_id: str,
    db: DBConnection
) -> AgentResponse:
    pass

# ❌ BAD
async def create_agent(agent_data, user_id, db):
    pass
```

#### Function Signatures
- Always use async/await for I/O operations
- Use dependency injection for database connections and services
- Return Pydantic models for API responses
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### Error Handling Patterns

#### Structured Error Handling
```python
from fastapi import HTTPException
from utils.logger import logger

# ✅ GOOD - Comprehensive error handling
@router.post("/agents", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreateRequest,
    user_id: str = Depends(get_current_user_id_from_jwt),
    db: DBConnection = Depends(get_db)
) -> AgentResponse:
    try:
        # Validate input
        if not agent_data.name or len(agent_data.name.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Agent name cannot be empty"
            )
        
        # Business logic
        agent = await agent_service.create_agent(agent_data, user_id)
        
        logger.info(
            "Agent created successfully",
            agent_id=agent.id,
            user_id=user_id,
            agent_name=agent.name
        )
        
        return AgentResponse.from_orm(agent)
        
    except ValueError as e:
        logger.warning(
            "Validation error creating agent",
            user_id=user_id,
            error=str(e)
        )
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(
            "Unexpected error creating agent",
            user_id=user_id,
            error=str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
```

#### Exception Classification
- Use custom exception classes for domain errors
- Always log exceptions with context (user_id, request_id, etc.)
- Never expose internal error details to clients in production
- Use structured logging with relevant context variables

### Logging Standards

#### Structured Logging Requirements
```python
from utils.logger import logger
import structlog

# ✅ GOOD - Structured logging with context
logger.info(
    "Agent execution started",
    agent_id=agent_id,
    user_id=user_id,
    thread_id=thread_id,
    model=model_name
)

logger.error(
    "Failed to execute agent",
    agent_id=agent_id,
    user_id=user_id,
    error=str(e),
    exc_info=True  # Include stack trace
)

# ❌ BAD - String formatting
logger.info(f"Agent {agent_id} started for user {user_id}")
```

#### Logging Levels
- **DEBUG**: Detailed diagnostic information (development only)
- **INFO**: General informational messages (important events)
- **WARNING**: Warning messages (recoverable issues)
- **ERROR**: Error messages (failures that need attention)
- **CRITICAL**: Critical errors (system failures)

#### Context Variables
Always include these context variables in logs:
- `request_id`: Unique request identifier
- `user_id`: User identifier (when applicable)
- `agent_id`: Agent identifier (when applicable)
- `thread_id`: Thread identifier (when applicable)
- `correlation_id`: For distributed tracing

### Database Patterns

#### Supabase Connection Management
```python
# ✅ GOOD - Proper async connection handling
class DBConnection:
    async def initialize(self):
        if self._initialized:
            return
        
        try:
            self._client = await create_async_client(
                config.SUPABASE_URL,
                config.SUPABASE_SERVICE_ROLE_KEY
            )
            self._initialized = True
            logger.debug("Database connection initialized")
        except Exception as e:
            logger.error(f"Database initialization error: {e}")
            raise RuntimeError(f"Failed to initialize database: {str(e)}")
```

#### Query Patterns
- Always use parameterized queries (Supabase handles this)
- Use Row Level Security (RLS) policies for all user-accessible tables
- Always handle database errors gracefully
- Use transactions for multi-step operations
- Implement proper connection pooling

```python
# ✅ GOOD - Proper error handling
async def get_user_agent(agent_id: str, user_id: str) -> Optional[Agent]:
    try:
        result = await db.client.table("agents").select("*").eq("id", agent_id).eq("user_id", user_id).single().execute()
        return Agent(**result.data) if result.data else None
    except Exception as e:
        logger.error(
            "Error fetching agent",
            agent_id=agent_id,
            user_id=user_id,
            error=str(e)
        )
        raise HTTPException(status_code=500, detail="Database error")
```

### API Design Patterns

#### Request/Response Models
- Always use Pydantic models for request/response validation
- Use descriptive field names and types
- Include field descriptions for API documentation
- Validate all inputs server-side

```python
from pydantic import BaseModel, Field, validator

class AgentCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Agent name")
    description: Optional[str] = Field(None, max_length=1000, description="Agent description")
    config: Dict[str, Any] = Field(default_factory=dict, description="Agent configuration")
    
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Agent name cannot be empty')
        return v.strip()
```

#### Endpoint Organization
- Group related endpoints in separate router modules
- Use consistent naming conventions (`/agents`, `/agents/{id}`, `/agents/{id}/runs`)
- Implement proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use path parameters for resource identifiers
- Use query parameters for filtering, pagination, sorting

#### Authentication & Authorization
- Always validate JWT tokens using `get_current_user_id_from_jwt` dependency
- Check user permissions before allowing operations
- Never expose sensitive data to unauthorized users
- Use RLS policies for database-level security

```python
# ✅ GOOD - Proper authentication
@router.get("/agents/{agent_id}")
async def get_agent(
    agent_id: str,
    user_id: str = Depends(get_current_user_id_from_jwt),
    db: DBConnection = Depends(get_db)
):
    # Verify ownership
    agent = await db.get_agent(agent_id, user_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentResponse.from_orm(agent)
```

### Configuration Management

#### Environment Variables
- Always use `utils.config` for configuration access
- Never hardcode configuration values
- Use environment-specific values (LOCAL, STAGING, PRODUCTION)
- Validate required configuration on startup

```python
from utils.config import config, EnvMode

# ✅ GOOD - Using config singleton
if config.ENV_MODE == EnvMode.PRODUCTION:
    # Production-specific logic
    pass
```

### Performance Optimization

#### Async Patterns
- Use `async/await` for all I/O operations
- Use `asyncio.gather()` for parallel operations
- Avoid blocking operations in async functions
- Use connection pooling for database connections

```python
# ✅ GOOD - Parallel execution
results = await asyncio.gather(
    fetch_user_data(user_id),
    fetch_agent_data(agent_id),
    fetch_thread_data(thread_id),
    return_exceptions=True
)
```

#### Caching
- Use Redis for caching frequently accessed data
- Implement cache invalidation strategies
- Set appropriate TTLs for cached data
- Handle cache failures gracefully

#### Resource Management
- Use context managers for resource cleanup
- Implement proper connection pooling
- Clean up resources in exception handlers
- Use `asynccontextmanager` for application lifespan

### Security Practices

#### Input Validation
- Validate all inputs using Pydantic models
- Sanitize user inputs to prevent injection attacks
- Validate file uploads (size, type, content)
- Implement rate limiting for API endpoints

#### Credential Management
- Never log sensitive data (API keys, passwords, tokens)
- Use environment variables for secrets
- Encrypt sensitive data in database using `utils.encryption`
- Rotate credentials regularly

#### API Security
- Implement CORS policies appropriately
- Use HTTPS in production
- Validate JWT tokens properly
- Implement request rate limiting

---

## TypeScript / Next.js Frontend Standards

### Type Safety Requirements

#### TypeScript Configuration
- Use strict mode (`strict: true` in tsconfig.json)
- Never use `any` type - use `unknown` and type guards if needed
- Use proper type definitions for all props, state, and function parameters
- Use discriminated unions for complex state management

```typescript
// ✅ GOOD - Proper typing
interface Agent {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface AgentCardProps {
  agent: Agent;
  onSelect: (agentId: string) => void;
  isLoading?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, isLoading = false }) => {
  // Component implementation
};

// ❌ BAD - No types
const AgentCard = ({ agent, onSelect, isLoading }) => {
  // Component implementation
};
```

### Component Patterns

#### React Component Best Practices
- Use functional components with hooks
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passing to child components
- Use proper dependency arrays in hooks
- Handle loading and error states explicitly

```typescript
// ✅ GOOD - Proper hooks usage
const AgentList: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <AgentGrid agents={agents} />;
};
```

#### Component Organization
- Split large components into smaller, focused components
- Extract reusable logic into custom hooks
- Use composition over inheritance
- Keep components pure when possible

### State Management

#### React Query Patterns
- Use `@tanstack/react-query` for server state
- Use `zustand` for client-side global state
- Keep local state in components when appropriate
- Implement proper cache invalidation

```typescript
// ✅ GOOD - React Query usage
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const useAgents = () => {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AgentCreateRequest) => {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
```

### Error Handling

#### Error Boundaries
- Implement error boundaries for component error handling
- Show user-friendly error messages
- Log errors to error tracking service
- Provide error recovery options

```typescript
// ✅ GOOD - Error handling
const AgentView: React.FC<{ agentId: string }> = ({ agentId }) => {
  const { data, error, isLoading } = useAgent(agentId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <ErrorDisplay
        message="Failed to load agent"
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  return <AgentDetails agent={data} />;
};
```

#### API Error Handling
- Always handle API errors gracefully
- Show appropriate error messages to users
- Implement retry logic for transient errors
- Use toast notifications for user feedback

```typescript
// ✅ GOOD - API error handling
const handleCreateAgent = async (data: AgentCreateRequest) => {
  try {
    await createAgent.mutateAsync(data);
    toast.success('Agent created successfully');
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`Failed to create agent: ${error.message}`);
    } else {
      toast.error('An unexpected error occurred');
    }
  }
};
```

### Performance Optimization

#### Code Splitting
- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load heavy dependencies
- Optimize bundle size

```typescript
// ✅ GOOD - Code splitting
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

#### Optimization Techniques
- Use `React.memo` for expensive components
- Implement virtual scrolling for long lists
- Optimize images with Next.js Image component
- Use proper cache headers
- Implement proper debouncing/throttling

```typescript
// ✅ GOOD - Memoization
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);
  
  return <div>{processedData}</div>;
});
```

### Supabase Integration

#### Client Creation
- Use `createClient` from `@/lib/supabase/client` for browser
- Use `createClient` from `@/lib/supabase/server` for server components
- Never expose service role keys in client code
- Handle authentication state properly

```typescript
// ✅ GOOD - Supabase client usage
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('user_id', userId);
  
if (error) {
  console.error('Error fetching agents:', error);
  return;
}
```

#### Real-time Subscriptions
- Clean up subscriptions properly
- Handle connection errors gracefully
- Implement reconnection logic
- Use proper subscription filters

```typescript
// ✅ GOOD - Real-time subscription
useEffect(() => {
  const subscription = supabase
    .channel('agents')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'agents',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      // Handle update
    })
    .subscribe();
    
  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

### UI/UX Standards

#### Loading States
- Always show loading indicators for async operations
- Use skeleton screens for better UX
- Implement optimistic updates where appropriate
- Show progress indicators for long operations

#### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast
- Test with screen readers

#### Responsive Design
- Use Tailwind CSS responsive utilities
- Test on multiple screen sizes
- Implement mobile-first design
- Use proper breakpoints

#### Icon Usage
- **ALWAYS use Remix Icons** (`react-icons/ri`) for all icons unless explicitly mentioned otherwise
- Never create custom SVG icons unless absolutely necessary or specifically requested
- Import icons from `react-icons/ri` package
- Use appropriate icon names following Remix Icon naming conventions

```typescript
// ✅ GOOD - Using Remix Icons
import {
  RiUserStarLine,
  RiBuilding2Line,
  RiProductHuntLine,
  RiBriefcaseLine,
  RiTeamLine,
  RiBankLine,
  RiLineChartLine,
  RiSettings3Line,
} from 'react-icons/ri';

const IconButton: React.FC = () => {
  return (
    <button>
      <RiUserStarLine className="h-4 w-4" />
      User Profile
    </button>
  );
};

// ❌ BAD - Creating custom SVG icons
const CustomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);

// ❌ BAD - Using other icon libraries without reason
import { User } from 'lucide-react'; // Only use if Remix Icons doesn't have equivalent
```

**Remix Icons Guidelines:**
- Check Remix Icons first: https://remixicon.com/
- Use consistent icon sizes (typically `h-4 w-4`, `h-5 w-5`, or `h-6 w-6`)
- Match icon style to context (Line, Fill, or Custom variants)
- Prefer Line variants for UI elements unless Fill is more appropriate
- Only create custom SVGs when:
  - Remix Icons doesn't have the needed icon
  - Specific brand/logo requirements
  - Complex custom illustrations
  - Explicitly requested by design/requirements

---

## Database & Migration Standards

### SQL Migration Patterns

#### Idempotent Migrations
- All migrations must be idempotent (can be run multiple times safely)
- Use `IF NOT EXISTS` and `IF EXISTS` clauses
- Handle enum creation safely
- Include proper rollback strategies

```sql
-- ✅ GOOD - Idempotent migration
BEGIN;

-- Create enum if not exists
DO $$ BEGIN
    CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table with proper constraints
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status agent_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT agents_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own agents" ON agents;
CREATE POLICY "Users can manage their own agents" ON agents
    FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
```

### Indexing Strategy
- Index all foreign keys
- Index columns used in WHERE clauses
- Index columns used in JOIN operations
- Use composite indexes for multi-column queries
- Monitor index usage and optimize

### Row Level Security (RLS)
- Enable RLS on all user-accessible tables
- Create policies for SELECT, INSERT, UPDATE, DELETE
- Test RLS policies thoroughly
- Use service role key only for admin operations

---

## Security Best Practices

### Authentication & Authorization
- Always validate JWT tokens server-side
- Check user permissions before operations
- Use RLS policies for database-level security
- Never trust client-side validation alone
- Implement proper session management

### Input Validation
- Validate all inputs on both client and server
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Validate file uploads (size, type, content)
- Implement CSRF protection

### Sensitive Data Handling
- Never log sensitive data (passwords, API keys, tokens)
- Encrypt sensitive data in database
- Use environment variables for secrets
- Implement proper key rotation
- Never commit secrets to version control

### API Security
- Implement rate limiting
- Use HTTPS in production
- Validate request origins
- Implement proper CORS policies
- Use security headers (CSP, HSTS, etc.)

---

## Performance & Scalability

### Backend Performance
- Use async/await for all I/O operations
- Implement proper connection pooling
- Use Redis for caching frequently accessed data
- Optimize database queries (avoid N+1 queries)
- Implement pagination for large datasets
- Use background jobs for heavy operations

### Frontend Performance
- Implement code splitting and lazy loading
- Optimize bundle size
- Use proper image optimization
- Implement virtual scrolling for long lists
- Minimize re-renders with proper memoization
- Use React Query for efficient data fetching

### Caching Strategy
- Cache frequently accessed data in Redis
- Implement proper cache invalidation
- Use CDN for static assets
- Implement browser caching headers
- Use service workers for offline support

### Monitoring & Observability
- Implement structured logging
- Use Sentry for error tracking
- Use Langfuse for LLM call tracing
- Monitor performance metrics
- Set up alerts for critical errors
- Track business metrics

---

## Code Organization & Structure

### File Naming
- Use kebab-case for file names (`agent-service.py`, `agent-card.tsx`)
- Use descriptive names that indicate purpose
- Group related files in directories
- Use consistent naming conventions

### Directory Structure
- Organize by feature/domain, not by type
- Keep related code together
- Separate concerns properly
- Use consistent directory patterns

### Code Documentation
- Write clear, concise comments
- Document complex algorithms
- Document API endpoints
- Keep documentation up to date
- Use docstrings for Python functions/classes

---

## Deployment & Production Readiness

### Environment Configuration
- Use environment variables for configuration
- Never hardcode secrets or URLs
- Use different configs for different environments
- Validate configuration on startup

### Health Checks
- Implement health check endpoints
- Monitor service availability
- Track error rates
- Monitor resource usage

### Error Recovery
- Implement retry logic for transient errors
- Use circuit breakers for external services
- Handle graceful degradation
- Implement proper error boundaries

### Monitoring
- Log all important events
- Track performance metrics
- Monitor error rates
- Set up alerts for critical issues
- Track business metrics

---

## Code Review Checklist

Before submitting code, ensure:

- [ ] All functions have proper type hints/types
- [ ] Error handling is comprehensive
- [ ] Logging is properly implemented
- [ ] Security best practices are followed
- [ ] Performance optimizations are in place
- [ ] Code follows established patterns
- [ ] No hardcoded values or secrets
- [ ] Proper input validation
- [ ] Database queries are optimized
- [ ] Proper error messages for users
- [ ] Loading states are handled
- [ ] Accessibility is considered
- [ ] Code is properly documented
- [ ] Remix Icons are used instead of custom SVGs

---

## When in Doubt

1. **Follow existing patterns** - Look at similar code in the codebase
2. **Check similar implementations** - See how similar features are implemented
3. **Prioritize security** - Always err on the side of security
4. **Maintain consistency** - Follow established conventions
5. **Think about scalability** - Consider how code will scale
6. **Document decisions** - Explain why you made certain choices
7. **Test thoroughly** - Verify code works as expected
8. **Consider edge cases** - Handle error conditions properly

---

## Critical Rules Summary

### NEVER:
- ❌ Use `any` type in TypeScript
- ❌ Leave functions without type hints in Python
- ❌ Log sensitive data (passwords, API keys, tokens)
- ❌ Hardcode configuration values
- ❌ Skip error handling
- ❌ Expose internal errors to users
- ❌ Commit secrets to version control
- ❌ Skip input validation
- ❌ Ignore security warnings
- ❌ Create migrations that aren't idempotent
- ❌ Create custom SVG icons (use Remix Icons instead)

### ALWAYS:
- ✅ Use proper type hints/types
- ✅ Handle errors comprehensively
- ✅ Log with proper context
- ✅ Validate all inputs
- ✅ Use environment variables for config
- ✅ Implement proper authentication
- ✅ Optimize database queries
- ✅ Handle loading and error states
- ✅ Test error scenarios
- ✅ Follow existing patterns
- ✅ Use Remix Icons (`react-icons/ri`) for all icons