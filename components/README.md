# 📚 Base44 Components Documentation

## Table des matières
1. [Comments](#comments)
2. [EmptyState](#emptystate)
3. [LoadingSkeleton](#loadingskeleton)
4. [PageHeader](#pageheader)
5. [SearchBar](#searchbar)

---

## Comments

Composant réutilisable pour afficher et ajouter des commentaires.

### Usage

```tsx
import { Comments } from '@/components';

const [comments, setComments] = useState([]);

const handleAddComment = async (text: string) => {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, findingId: 'xxx' }),
  });
  // Refresh comments
  fetchComments();
};

<Comments
  comments={comments}
  onAddComment={handleAddComment}
  placeholder="Add a comment..."
  emptyMessage="No comments yet"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `comments` | `Comment[]` | required | Array of comments |
| `onAddComment` | `(text: string) => Promise<void>` | required | Function to add comment |
| `placeholder` | `string` | "Add a comment..." | Input placeholder |
| `emptyMessage` | `string` | "No comments yet" | Empty state message |

---

## EmptyState

Composant pour afficher un état vide avec un call-to-action optionnel.

### Usage

```tsx
import { EmptyState } from '@/components';
import { Target } from 'lucide-react';

<EmptyState
  icon={<Target className="w-12 h-12 text-gray-400" />}
  title="No targets found"
  description="Create your first target to get started"
  actionLabel="Create Target"
  actionHref="/dashboard/targets/new"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | - | Icon to display |
| `title` | `string` | required | Title text |
| `description` | `string` | - | Description text |
| `actionLabel` | `string` | - | Button label |
| `onAction` | `() => void` | - | Button click handler |
| `actionHref` | `string` | - | Button link (use instead of onAction) |

---

## LoadingSkeleton

Composant pour afficher des états de chargement.

### Usage

```tsx
import { LoadingSkeleton } from '@/components';

// Card skeleton
<LoadingSkeleton type="card" count={6} />

// List skeleton
<LoadingSkeleton type="list" count={5} />

// Form skeleton
<LoadingSkeleton type="form" count={5} />

// Table skeleton
<LoadingSkeleton type="table" count={10} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'card' \| 'list' \| 'form' \| 'table'` | 'card' | Skeleton type |
| `count` | `number` | 1 | Number of skeletons |
| `className` | `string` | '' | Additional CSS classes |

---

## PageHeader

Composant pour standardiser les headers de pages.

### Usage

```tsx
import { PageHeader } from '@/components';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

<PageHeader
  title="Findings"
  description="Manage vulnerabilities"
  backHref="/dashboard"
  backLabel="Dashboard"
  action={
    <Button variant="primary">
      <Plus className="w-4 h-4" />
      New Finding
    </Button>
  }
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Page title |
| `description` | `string` | - | Page description |
| `backHref` | `string` | - | Back button link |
| `backLabel` | `string` | "Back" | Back button label |
| `action` | `ReactNode` | - | Action button(s) |

---

## SearchBar

Composant de recherche réutilisable.

### Usage

```tsx
import { SearchBar } from '@/components';

const [search, setSearch] = useState('');

const handleSearch = (query: string) => {
  setSearch(query);
  fetchData(query);
};

<SearchBar
  placeholder="Search findings..."
  onSearch={handleSearch}
  defaultValue={search}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | "Search..." | Input placeholder |
| `onSearch` | `(query: string) => void` | required | Search handler |
| `defaultValue` | `string` | '' | Initial value |
| `className` | `string` | '' | Additional CSS classes |

---

## Exemple complet

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PageHeader,
  SearchBar,
  EmptyState,
  LoadingSkeleton,
  Comments,
} from '@/components';
import { Button } from '@/components/ui';
import { Plus, Target } from 'lucide-react';

export default function FindingsPage() {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchFindings = async (query: string) => {
    setLoading(true);
    // ... fetch logic
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Findings"
        description="Manage vulnerabilities"
        action={
          <Button variant="primary" href="/dashboard/findings/new">
            <Plus className="w-4 h-4" />
            New Finding
          </Button>
        }
      />

      <SearchBar
        placeholder="Search findings..."
        onSearch={fetchFindings}
      />

      {loading ? (
        <LoadingSkeleton type="list" count={5} />
      ) : findings.length === 0 ? (
        <EmptyState
          icon={<Target className="w-12 h-12 text-gray-400" />}
          title="No findings found"
          description="Create your first finding to get started"
          actionLabel="Create Finding"
          actionHref="/dashboard/findings/new"
        />
      ) : (
        // ... findings list
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. Utiliser LoadingSkeleton partout
```tsx
{loading ? (
  <LoadingSkeleton type="card" count={6} />
) : (
  // ... content
)}
```

### 2. Utiliser EmptyState pour les listes vides
```tsx
{items.length === 0 ? (
  <EmptyState
    title="No items"
    actionLabel="Create Item"
    actionHref="/create"
  />
) : (
  // ... items
)}
```

### 3. Utiliser PageHeader pour la cohérence
```tsx
<PageHeader
  title="Page Title"
  description="Page description"
  backHref="/dashboard"
  action={<Button>Action</Button>}
/>
```

### 4. Utiliser Comments pour la réutilisabilité
```tsx
<Comments
  comments={item.comments}
  onAddComment={handleAddComment}
/>
```

---

## Migration des pages existantes

Pour migrer les pages existantes, remplacez :

### Avant
```tsx
<div className="flex items-center gap-4">
  <Link href="/dashboard">
    <Button variant="ghost">
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  </Link>
</div>
<div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold">Title</h1>
  <Button>Action</Button>
</div>
```

### Après
```tsx
<PageHeader
  title="Title"
  backHref="/dashboard"
  action={<Button>Action</Button>}
/>
```

---

**Date:** 2 Novembre 2025  
**Version:** 1.0.0  
**Base44 Components Library**
