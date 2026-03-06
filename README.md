<div align="center">

# 📂 React File Manager

A modern **document and file management interface** built with **React**, **TypeScript**, **Ant Design**, and **React Query**.

Designed to provide an **enterprise-style file explorer experience** with folder navigation, file preview, uploads, and version history.

</div>

---

## 📖 Overview

This project implements a **web-based file manager** similar to those found in enterprise document management systems.  
It allows users to navigate folder hierarchies, preview files directly in the browser, upload new documents, and inspect file version history.

The application follows a **modular, scalable frontend architecture**, using modern React patterns such as:

- **Context API** for shared application state
- **React Query** for server state management
- **Reusable UI components**
- **Custom hooks for business logic**

---

# ✨ Features

### 📁 Folder Navigation

- Navigate through nested folder structures
- Clickable folder entries in table view
- Dynamic **breadcrumb navigation**

### 📄 File Preview

Preview files directly in the browser:

| Type       | Support |
| ---------- | ------- |
| Images     | ✅      |
| PDF        | ✅      |
| Plain Text | ✅      |

### 🕘 File Version History

- View historical versions of a file
- See metadata such as:
  - Author
  - File size
  - Modification date
- Preview older versions

### ⬆️ File Upload

- Upload files with validation
- Duplicate file warning (allowed same file name if file is new version)
- File size and type restrictions

### 🔎 Search

- Folder-level search
- Debounced search input for better performance

### 📊 Pagination

- Efficient loading of large folders
- Adjustable page size

### ⚡ Optimized Data Fetching

Powered by **React Query**:

- Request caching
- Background refetching
- Loading states
- Query invalidation

---

# 🏗️ Project Architecture

```src
│
├── api
│ └── apiCall.ts
│
├── components
│ ├── ActionSpacebar.tsx
│ ├── FileManager.tsx
│ ├── FilePreviewModal.tsx
│ ├── FileUploadButton.tsx
│ ├── FolderPanelManager.tsx
│ └── VersionHistoryModal.tsx
│
├── context
│ └── FolderTreeContext.ts
│
├── hooks
│ ├── useFolderContent.ts
│ └── useUploadFile.ts
│
├── types
│ └── FileManagerTypes.ts
│
└── utils
└── fileManagerUtils.ts
```

This structure separates concerns into:

- **Components → UI**
- **Hooks → Business logic**
- **API → Server communication**
- **Utils → Shared helpers**
- **Context → Global state**

---

# 🧩 Core Components

---

## 📂 `FileManager`

The **main application component** that renders the file manager interface.

### Responsibilities

- Display folder contents
- Manage pagination
- Handle file previews
- Handle version history modal
- Handle uploads
- Maintain breadcrumb navigation

### Key Features

- File and folder listing via **Ant Design Table**
- Folder navigation by clicking rows
- Integrated file preview modal
- Integrated version history modal

---

## 🧭 `FolderPanelManager`

Controls the **folder tree navigation panel**.

### Responsibilities

- Fetch the root folder
- Initialize the selected folder
- Render the recursive folder tree
- Provide folder search functionality

---

## 🔧 `ActionSpacebar`

A **toolbar component** containing primary file manager actions.

### Available Actions

| Action      | Description                     |
| ----------- | ------------------------------- |
| Search      | Filter folder contents          |
| Add Folder  | Placeholder for folder creation |
| Upload File | Upload new files                |
| Edit        | Placeholder                     |
| Delete      | Placeholder                     |

---

## ⬆️ `FileUploadButton`

Custom upload component built on top of **Ant Design Upload**.

### Features

- Prevents automatic upload
- Validates files before sending
- Integrates with mutation hooks

---

## 👁️ `FilePreviewModal`

Displays previews of supported file types inside a modal.

### Supported Preview Types

| File Type | Rendering Method |
| --------- | ---------------- |
| Images    | `<img>`          |
| PDF       | `<iframe>`       |
| Text      | `<iframe>`       |

---

## 🕘 `VersionHistoryModal`

Shows the **version history of a selected file**.

### Information Displayed

- Author
- File size
- Modification date

Users can preview **previous versions** directly from this table.

---
## 🏺 Legacy Architecture: Recursive Folder Tree

> **Note:** This component is considered **Legacy**. While it remains in the codebase for reference or specialized use cases, it is no longer the primary navigation method in the latest version of the File Manager (```FileManager2.tsx```).

### 🌲 `Folder.tsx`
A highly complex, recursive component used to render a nested sidebar tree.

#### Key Responsibilities
* **Self-Recursion:** The component calls itself to render nested sub-folders infinitely.
* **Lazy Loading:** Children are only fetched from the API when a user clicks the chevron to expand a node.
* **Ghost Folder Insertion:** A unique feature that injects a "Ghost" folder into the UI if a user navigates to a deep path via breadcrumbs before the parent folder has been expanded/loaded.
* **Infinite Scrolling:** Uses `useInfiniteQuery` to provide a "Load More" pattern within the sidebar tree itself.

#### Technical Implementation Details
* **Generics & Types:** Uses `FolderPage` and `FolderProps` to handle paginated API responses.
* **Memoized Paths:** Aggressively uses `useMemo` to calculate breadcrumb trails and child lists to prevent re-renders during tree traversal.
* **Sync Logic:** Contains an `useEffect` that monitors the global `selectedFolderId`. If the ID matches, it auto-expands the parent tree branch to reveal the selection.

---

### 🛠️ Legacy Component Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `folderId` | `string` | The unique identifier for the folder. |
| `folderName` | `string` | The display name of the folder. |
| `defaultExpanded` | `boolean` | Whether the folder should be open on initial render. |
| `pageSize` | `number` | How many children to fetch per "page" (Default: 5). |
| `level` | `number` | The nesting depth (used to calculate horizontal indentation). |
| `parentBreadcrumbs`| `BreadcrumbItem[]` | An array of ancestors passed down to build the full path. |

---

### 🧠 Legacy State Management Features
1.  **Context Integration:** Utilizes `knownFolders` from the `FolderTreeContext` to cache discovered children globally.
2.  **Internal Search:** Maintains an `innerSearchTerm` to allow users to filter a specific branch of the tree independently.
3.  **Debouncing:** Implements a 300ms delay on search inputs to optimize API calls during rapid typing.
4.  **Stop Propagation:** Carefully handles click events (`e.stopPropagation()`) to separate "Selecting a folder" from "Expanding a branch."

---

### 📊 Legacy UI States
* **Indentation:** Dynamic padding calculated via `style={{ paddingLeft: '${level * 14}px' }}`.
* **Loading:** Renders an Ant Design `Spin` (small) specifically within the branch being fetched.
* **Empty State:** Displays "No folders found" specifically for childless nodes.
* **Error State:** Inline error messaging for failed branch fetches.
---

# 🧠 State Management

## FolderTreeContext

The application uses **React Context** to synchronize navigation state.

Stored values include:

- `selectedFolderId`
- `folderSearchText`
- `breadcrumbs`

This allows components like:

- Folder tree
- Breadcrumbs
- Table view

to remain **fully synchronized**.

---

# 🔗 API Layer

All backend communication is handled through: `apiCall.ts`

### Available Requests

| Function                    | Description                |
| --------------------------- | -------------------------- |
| `fetchRootFolder()`         | Fetch root directory       |
| `fetchFolderPath(folderId)` | Fetch breadcrumb path      |
| `fetchFileVersions(fileId)` | Fetch file version history |

These functions are used inside **React Query hooks**.

---

# 🧩 Custom Hooks

---

## `useFolderContent`

Fetches paginated contents of the selected folder.

### Returns

- Items (files & folders)
- Total item count
- Loading state

---

## `useUploadFile`

Handles the **file upload mutation**.

### Responsibilities

- Send file to backend
- Refresh folder content after upload
- Handle loading states

---

# 🧰 Utility Functions

Located in: `utils/fileManagerUtils.ts`

### `handleFileOpen`

Handles file preview or download.

### `handleUpload`

Performs upload validation:

- File type validation
- Size limits
- Duplicate prevention

### `getFileIcon`

Returns file icons depending on file extension.

---

# 🛠️ Technologies Used

| Technology    | Role                    |
| ------------- | ----------------------- |
| React         | UI framework            |
| TypeScript    | Type safety             |
| Ant Design    | UI components           |
| React Query   | Server state management |
| TailwindCSS   | Utility styling         |
| Axios / Fetch | API communication       |

---

# 📸 Example UI Flow

1️⃣ Browse files in the table view  
2️⃣ Preview files directly in a modal  
3️⃣ Upload new files to the folder  
4️⃣ Inspect version history of files


