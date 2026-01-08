---
alwaysApply: false
---
# Frontend Development Guidelines

## TypeScript Standards

- Use TypeScript strictly - no `any` types unless absolutely necessary
- Define proper interfaces and types for all components and functions
- Use type imports: `import type { ComponentProps } from 'react'`
- Leverage TypeScript 5+ features like `satisfies` operator

## Next.js App Router

- Use App Router with `app/` directory structure
- Follow file naming: kebab-case for files, PascalCase for components
- Organize components in feature-based folders
- Keep reusable components in `src/components/`

## UI Framework - shadcn/ui Default

### Component Priority: Always Use `components/ui` First

**CRITICAL RULE**: Always check and use components from `@/components/ui/` before creating custom components. Only create custom components when:
1. The required component doesn't exist in `components/ui`
2. You need highly specialized functionality not available in shadcn/ui
3. You're building a domain-specific component that combines multiple UI components

### Setup

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input form card dropdown-menu dialog
```

### Usage - Always Import from `components/ui`

```typescript
// ✅ GOOD - Using components from components/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Use shadcn/ui components directly
const AgentCard = ({ agent }: { agent: Agent }) => (
  <Card>
    <CardHeader>
      <CardTitle>{agent.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{agent.description}</p>
      <Button>Run Agent</Button>
    </CardContent>
  </Card>
);

// ❌ BAD - Creating custom button when Button exists in components/ui
const CustomButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
    {children}
  </button>
);

// ✅ GOOD - Custom component that uses components/ui internally
const AgentActionButton = ({ agent }: { agent: Agent }) => (
  <Button onClick={() => handleAction(agent)}>
    <RiPlayLine className="h-4 w-4 mr-2" />
    Run Agent
  </Button>
);
```

## State Management

- **Server State**: `@tanstack/react-query` for data fetching
- **Local State**: React hooks (`useState`, `useReducer`)
- **Forms**: React Hook Form with Zod validation

```typescript
// Query pattern
function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => agentService.getAgents(),
  });
}

// Form pattern with shadcn/ui
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(schema),
});
```

## Supabase Integration

```typescript
// Auth hook
function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  return { user };
}
```

## Performance

- Use `lazy()` and `Suspense` for code splitting
- Use `memo()` and `useMemo()` for expensive computations
- Use `useCallback()` for stable function references

## Key Dependencies

### Core Framework

- Next.js 15+ with App Router and Turbopack
- React 18+ with TypeScript 5+

### UI & Styling

- shadcn/ui for components
- Tailwind CSS for styling
- **Remix Icons** (`react-icons/ri`) for all icons - **ALWAYS use Remix Icons, never create custom SVGs unless explicitly needed**

### State & Data

- @tanstack/react-query for server state
- @supabase/supabase-js for database
- react-hook-form + zod for forms

## Essential shadcn/ui Components

### Available Components in `components/ui`

Before creating a custom component, check if it exists in `components/ui/`. Common components include:

- **Form Controls**: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- **Layout**: `card`, `separator`, `sheet`, `accordion`, `tabs`, `scroll-area`
- **Overlays**: `dialog`, `dropdown-menu`, `popover`, `tooltip`, `alert-dialog`, `context-menu`
- **Feedback**: `toast`, `alert`, `skeleton`, `progress`, `badge`
- **Navigation**: `breadcrumb`, `pagination`, `navigation-menu`
- **Data Display**: `table`, `avatar`, `avatar-fallback`, `avatar-image`

### Adding Missing Components

If a component doesn't exist in `components/ui`, add it using:

```bash
# Check available components
npx shadcn-ui@latest add

# Add specific component
npx shadcn-ui@latest add [component-name]

# Examples
npx shadcn-ui@latest add button input textarea select checkbox form card dialog dropdown-menu badge table tabs toast
```

### Discovering Available Components

1. **Check the directory**: `frontend/src/components/ui/` - List all available components
2. **Check shadcn/ui docs**: https://ui.shadcn.com/docs/components - See all available components
3. **Search the codebase**: Look for existing imports from `@/components/ui/` to see what's already in use

## Best Practices

### Component Usage Priority

1. **ALWAYS check `@/components/ui/` first** - Use existing UI components before creating custom ones
2. **Extend, don't replace** - If you need custom behavior, wrap or extend `components/ui` components
3. **Add missing components** - If a component doesn't exist in `components/ui`, add it using `npx shadcn-ui@latest add [component-name]`
4. **Custom components only when necessary** - Only create custom components when:
   - The component doesn't exist in `components/ui` and isn't available in shadcn/ui
   - You need domain-specific logic that can't be achieved by composing `components/ui` components
   - You're building a complex feature component that combines multiple UI primitives

### General Practices

- Use shadcn/ui components from `components/ui` as the default choice
- Follow shadcn/ui patterns for consistent styling
- Use the `cn` utility for conditional classes
- Implement proper loading and error states
- Use semantic HTML elements
- Ensure keyboard navigation works
- **ALWAYS use Remix Icons** (`react-icons/ri`) for icons - never create custom SVG icons unless absolutely necessary or explicitly requested

### Component Composition Examples

```typescript
// ✅ GOOD - Composing components/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AgentCard = ({ agent }: { agent: Agent }) => (
  <Card>
    <CardHeader>
      <CardTitle>{agent.name}</CardTitle>
      <Badge>{agent.status}</Badge>
    </CardHeader>
    <CardContent>
      <Button>Run Agent</Button>
    </CardContent>
  </Card>
);

// ❌ BAD - Recreating what exists in components/ui
const CustomCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border bg-card p-6">
    {children}
  </div>
);
```

## Icon Usage Guidelines

```typescript
// ✅ GOOD - Using Remix Icons
import {
  RiUserStarLine,
  RiBuilding2Line,
  RiSettings3Line,
} from 'react-icons/ri';

const Component = () => (
  <button>
    <RiUserStarLine className="h-4 w-4" />
    User Profile
  </button>
);

// ❌ BAD - Creating custom SVG icons
const CustomIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);

// ❌ BAD - Using other icon libraries without reason
import { User } from 'lucide-react'; // Only use if Remix Icons doesn't have equivalent
```

**Remix Icons Rules:**
- Always check Remix Icons first: https://remixicon.com/
- Use consistent icon sizes (`h-4 w-4`, `h-5 w-5`, `h-6 w-6`)
- Prefer Line variants for UI elements
- Only create custom SVGs when:
  - Remix Icons doesn't have the needed icon
  - Specific brand/logo requirements
  - Complex custom illustrations
  - Explicitly requested

## Component Usage Checklist

Before creating any custom component, verify:

- [ ] Checked `frontend/src/components/ui/` directory for existing component
- [ ] Checked shadcn/ui documentation for available components
- [ ] Searched codebase for similar components using `@/components/ui/`
- [ ] Attempted to compose solution using existing `components/ui` components
- [ ] If component doesn't exist, added it using `npx shadcn-ui@latest add [component-name]`
- [ ] Only creating custom component if absolutely necessary and documented why

## Critical Rules Summary

### NEVER:
- ❌ Create custom buttons, inputs, cards, dialogs, dropdowns, etc. when they exist in `components/ui`
- ❌ Recreate functionality that exists in shadcn/ui components
- ❌ Use raw HTML elements (`<button>`, `<input>`) when `components/ui` equivalents exist
- ❌ Import components from other UI libraries when `components/ui` has equivalents

### ALWAYS:
- ✅ Import from `@/components/ui/` for all UI primitives
- ✅ Check `components/ui` directory before creating custom components
- ✅ Compose complex components using `components/ui` primitives
- ✅ Add missing shadcn/ui components instead of creating custom ones
- ✅ Use Remix Icons (`react-icons/ri`) for all icons
- ✅ Extend or wrap `components/ui` components for custom behavior