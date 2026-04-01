# Projekt specifikáció

## Tartalomjegyzék

1. [Technológiai stack](#technológiai-stack)
2. [Projekt struktúra](#projekt-struktúra)
3. [Architektúra elvek](#architektúra-elvek)
4. [API hívások – TanStack Query](#api-hívások--tanstack-query)
5. [Form kezelés – Zod](#form-kezelés--zod)
6. [Globális state – Zustand](#globális-state--zustand)
7. [UI komponensek – Shadcn/ui](#ui-komponensek--shadcnui)
8. [Custom hook-ok](#custom-hook-ok)
9. [Optimalizálás](#optimalizálás)
10. [Fájlméret limit](#fájlméret-limit)
11. [Backend konvenciók](#backend-konvenciók)
12. [Docker](#docker)

---

## Technológiai stack

| Réteg | Technológia |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite |
| UI library | Shadcn/ui (Radix UI alapon) |
| Szerver state / API | TanStack Query v5 |
| Globális state | Zustand |
| Form validáció | Zod + React Hook Form |
| Backend | FastAPI (Python) |
| Adatbázis | SQLite3 |
| Konténerizáció | Docker + Docker Compose |
| Webszerver (prod) | nginx |

---

## Projekt struktúra

```
project/
├── backend/
│   ├── main.py               # FastAPI app, route-ok, DB init
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Csak UI – pure render komponensek
│   │   │   ├── ui/           # Shadcn/ui generált komponensek (ne módosítsd)
│   │   │   └── [feature]/    # Feature-specifikus UI komponensek
│   │   ├── hooks/            # Custom hook-ok – üzleti logika
│   │   ├── stores/           # Zustand store-ok
│   │   ├── schemas/          # Zod sémák és belőlük inferált TypeScript típusok
│   │   ├── lib/              # Segédfüggvények, API hívások, utils
│   │   │   └── api.ts        # Fetch wrapper, API végpontok
│   │   ├── types/            # Globális TypeScript típusok (ha nem Zod-ból jönnek)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── SPEC.md
```

---

## Architektúra elvek

### UI és üzleti logika szétválasztása

**Az arany szabály:** egy `.tsx` fájl csak renderel. A logika hook-ban él.

```
❌ ROSSZ – logika és render ugyanott
components/ItemList.tsx
  → fetch hívás, state kezelés, transzformáció, JSX

✅ JÓ – szétválasztva
hooks/useItems.ts      → fetch, state, mutációk
components/ItemList.tsx → csak JSX, hook-ot hív
```

**Egy komponens felelőssége:**
- Props-t fogad
- Hook-ot hív
- JSX-t ad vissza

**Egy hook felelőssége:**
- API kommunikáció
- State kezelés
- Adattranszformáció
- Event handlerek

---

## API hívások – TanStack Query

Minden szerver-kommunikáció **TanStack Query** (`@tanstack/react-query`) segítségével történik. Raw `fetch` + `useEffect` kombináció API hívásokra **tilos** – azt a TanStack Query váltja ki.

### Telepítés és setup

```bash
npm install @tanstack/react-query
```

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1 perc – ne kérje le újra azonnal
      retry: 1,                   // hiba esetén 1 újrapróbálkozás
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
```

### Query – adatok lekérése (`useQuery`)

```ts
// src/lib/api.ts – fetch függvények, nem hook-ok
export async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}
```

```ts
// src/hooks/useItems.ts
import { useQuery } from "@tanstack/react-query";
import { fetchItems } from "@/lib/api";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });
}

// Használat komponensben:
// const { data: items, isLoading, isError } = useItems();
```

### Mutáció – írási műveletek (`useMutation`)

```ts
// src/lib/api.ts
export async function deleteItem(id: number): Promise<void> {
  const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}
```

```ts
// src/hooks/useDeleteItem.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteItem } from "@/lib/api";

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      // Cache invalidálás – automatikusan újralekéri a listát
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

// Használat:
// const { mutate: remove, isPending } = useDeleteItem();
// remove(item.id);
```

### Query key konvenció

A query key-ek legyenek konzisztensek az egész alkalmazásban:

```ts
["items"]               // összes item
["items", id]           // egy item
["developers"]          // összes developer
["developers", id, "skills"]  // egy developer skill-jei
["projects", filters]   // szűrt projekt lista
```

### TanStack Query vs Zustand – hatáskörök

| | TanStack Query | Zustand |
|---|---|---|
| **Mit kezel** | Szerver state (API adat, cache, loading, error) | Kliens / UI state |
| **Példák** | items lista, developer profil, projekt adatok | megnyitott modal, aktív szűrők, sidebar állapot |
| **Perzisztencia** | Automatikus cache + background refetch | Csak memória (page reload törli) |

**Ne tárold a szerver adatokat Zustand-ban** – ha TanStack Query-vel le van kérve, az a cache. A Zustand kizárólag UI állapotot kezel.

```ts
// ❌ ROSSZ – szerver adat Zustand-ban
const useItemStore = create((set) => ({
  items: [],
  fetchItems: async () => { ... set({ items }) },
}));

// ✅ JÓ – szerver adat TanStack Query-ben, UI state Zustand-ban
const { data: items } = useQuery({ queryKey: ["items"], queryFn: fetchItems });
const isFilterPanelOpen = useUIStore((s) => s.isFilterPanelOpen);
```

### Szabályok

- Minden API hívás `useQuery` vagy `useMutation` hook-ban él – raw `fetch` csak a `src/lib/api.ts` fetch függvényekben szerepelhet
- `queryKey` hierarchikus és konzisztens legyen – az invalidálás erre épül
- Hiba kezelés: `isError` + `error` mezők, ne `try/catch` a hook-on kívül
- `staleTime` értéket featureként állítsd be, ne globálisan mindenhol (ritkán változó adat → hosszabb `staleTime`)

---

## Form kezelés – Zod

Minden formot **Zod séma** ír le, amelyből TypeScript típus is generálódik. A validációt mindig a séma végzi, soha nem manuális `if` ellenőrzések.

### Séma helye

```
src/schemas/itemSchema.ts
```

### Minta

```ts
// src/schemas/itemSchema.ts
import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1, "A név kötelező").max(100),
  description: z.string().max(500).optional(),
});

// Típus inferálása a sémából – ne írj külön interface-t ugyanerre
export type ItemFormValues = z.infer<typeof itemSchema>;
```

```tsx
// src/hooks/useItemForm.ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { itemSchema, type ItemFormValues } from "@/schemas/itemSchema";
import { createItem } from "@/lib/api";

export function useItemForm() {
  const queryClient = useQueryClient();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", description: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((values) => mutate(values));

  return { form, onSubmit, isPending };
}
```

### Szabályok

- Minden form mögött van Zod séma a `src/schemas/` mappában
- A séma adja a TypeScript típust (`z.infer<>`) – ne duplikálj interface-t
- `zodResolver` köti össze a sémát a React Hook Form-mal
- Form submit mindig `useMutation`-on keresztül megy – soha ne raw `fetch` a handler-ben
- Backend-en is validálj (Pydantic), de a frontend validáció is teljes körű legyen

---

## Globális state – Zustand

Az alkalmazás globális állapotát Zustand store-ok kezelik. Lokális, komponens-szintű state-re (`useState`) továbbra is szabad és ajánlott.

### Store helye

```
src/stores/itemStore.ts
```

### Minta

```ts
// src/stores/itemStore.ts
import { create } from "zustand";

interface Item {
  id: number;
  name: string;
  description: string;
}

interface ItemStore {
  items: Item[];
  isLoading: boolean;
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  removeItem: (id: number) => void;
  setLoading: (v: boolean) => void;
}

export const useItemStore = create<ItemStore>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### Szabályok

- Store-ban csak **adat és setter** van – üzleti logika hook-ban marad
- Ne subscribeolj a teljes store-ra; csak a szükséges slice-t vedd ki:
  ```ts
  const items = useItemStore((s) => s.items);       // ✅
  const store = useItemStore();                      // ❌ felesleges re-render
  ```
- Aszinkron műveleteket (fetch) **ne** tedd a store-ba – azok TanStack Query hook-okban élnek
- **Szerver adatot ne tárolj Zustand-ban** – ha TanStack Query-ből jön, az a cache; Zustand csak UI state

---

## UI komponensek – Shadcn/ui

### Telepítés és használat

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add form
# stb.
```

A generált fájlok a `src/components/ui/` mappába kerülnek. **Ezeket ne módosítsd közvetlenül** – ha testreszabás kell, hozz létre wrapper komponenst a `src/components/` alatt.

### Szabályok

- Shadcn komponensek csak renderelnek – logikát ne tegyél beléjük
- A `Form`, `FormField`, `FormItem` stb. komponenseket React Hook Form-mal együtt használd (ahogy a Shadcn dokumentálja)
- Theming: a `globals.css`-ben / `index.css`-ben CSS változókkal – ne inline style-lal

---

## Custom hook-ok

### Hol élnek

```
src/hooks/use[Feature][Action].ts
```

Például: `useItems.ts`, `useItemForm.ts`, `useDeleteItem.ts`

### Mit tartalmaz egy hook

```ts
// src/hooks/useItems.ts – lekérés TanStack Query-vel
import { useQuery } from "@tanstack/react-query";
import { fetchItems } from "@/lib/api";

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });
}

// src/hooks/useDeleteItem.ts – mutáció TanStack Query-vel
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteItem } from "@/lib/api";

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });
}
```

### Szabályok

- Minden hook neve `use`-szal kezdődik
- Egy hook egy felelősségi kört fed le
- Hook-ból ne renderelj JSX-t
- Ha egy hook 80+ sort meghaladja, bontsd kisebbekre

---

## Optimalizálás

Teljesítmény-optimalizálást **csak ott alkalmazz, ahol mérhetően szükséges**. Ne optimalizálj előre – de az alábbi esetekben kötelező:

### `React.memo`

Komponenst memoizálj, ha:
- A szülő gyakran újrarenderel, de a props nem változik
- A komponens lista eleme (`map` belül)

```tsx
// ✅
const ItemCard = React.memo(function ItemCard({ item }: { item: Item }) {
  return <div>{item.name}</div>;
});
```

### `useCallback`

Callback-et memoizálj, ha:
- Gyermek memoizált komponensnek adod prop-ként
- `useEffect` dependency array-ben szerepel

```ts
const handleDelete = useCallback((id: number) => {
  removeItem(id);
  fetch(`/api/items/${id}`, { method: "DELETE" });
}, [removeItem]);
```

### `useMemo`

Értéket memoizálj, ha:
- Számítása drága (szűrés/rendezés nagy listán)
- Referencia-stabilitás kell (pl. objektum, ami dependency)

```ts
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### Mikor NEM kell

- Egyszerű primitive értékek visszaadásakor
- Kis listákon (< 50 elem) ahol a transzformáció triviális
- Ha a komponens úgysem renderel újra feleslegesen

---

## Fájlméret limit

**Egyetlen `.tsx` fájl sem lehet hosszabb 200 sornál** – kivéve ha ez technikailag elkerülhetetlen (pl. komplex SVG ikon set).

Ha egy fájl megközelíti a limitet:

1. **Emeld ki a logikát** custom hook-ba (`src/hooks/`)
2. **Bontsd részkomponensekre** (`src/components/[feature]/`)
3. **Emeld ki a konstansokat/típusokat** külön fájlba

```
❌ src/components/Items.tsx  – 350 sor (logika + subkomponensek + form)

✅ src/hooks/useItems.ts          – fetch, state
✅ src/hooks/useItemForm.ts       – form logika
✅ src/components/items/ItemList.tsx   – lista render
✅ src/components/items/ItemCard.tsx   – kártya render
✅ src/components/items/ItemForm.tsx   – form render
```

---

## Backend konvenciók

### Route-ok

| Method | Path | Leírás |
|---|---|---|
| `GET` | `/api/{resource}` | lista lekérés |
| `POST` | `/api/{resource}` | létrehozás |
| `GET` | `/api/{resource}/{id}` | egy elem |
| `PATCH` | `/api/{resource}/{id}` | részleges módosítás |
| `DELETE` | `/api/{resource}/{id}` | törlés |

### Validáció

- Minden bejövő adat **Pydantic modellel** validált
- HTTP hibakódok következetesen: `404` ha nem található, `422` ha validáció sikertelen, `400` egyéb kliens hiba

### Adatbázis

- Az SQLite fájl a `/data/app.db` útvonalon él (Docker volume)
- Táblák létrehozása az alkalmazás indulásakor (`lifespan` event, `CREATE TABLE IF NOT EXISTS`)
- Migrációkhoz később `alembic` vezethető be

---

## Docker

### Szolgáltatások

| Service | Port | Leírás |
|---|---|---|
| `backend` | 8000 (belső) | FastAPI, csak a frontend éri el |
| `frontend` | 80 (publikus) | nginx, statikus build + API proxy |

### Adatperzisztencia

Az SQLite adatbázis **named volume**-on él (`db_data`), így `docker compose down` után sem veszik el. Csak `docker compose down -v` törli.

### Indítás

```bash
# Első indítás / rebuild
docker compose up --build

# Háttérben
docker compose up -d --build

# Leállítás (adatok megmaradnak)
docker compose down

# Leállítás + adatok törlése
docker compose down -v
```

### Fejlesztés (hot reload nélkül)

Fejlesztés során ajánlott a frontendet és a backendet **lokálisan futtatni**, Dockert csak a végleges ellenőrzéshez használni:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (külön terminálban)
cd frontend
npm install
npm run dev
```

A `vite.config.ts`-ben a proxy `http://backend:8000` helyett lokális fejlesztésnél `http://localhost:8000`-re mutat – ezt az environment szerint kell kezelni.
