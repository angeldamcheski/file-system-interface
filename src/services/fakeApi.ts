// fakeApi.js
/*
   
      */
export const fileSystem = {
  root: {
    folders: [
      {
        name: "2026",
        folderType: "videos",
      },
      {
        name: "2025",
        folderType: "documents",
      },
    ],
    files: ["readme.txt", "config.json"],
  },

  "2026": {
    folders: [
      { name: "Jan", folderType: "documents" },
      { name: "Feb", folderType: "documents" },
    ],
    files: ["report2026.pdf"],
  },

  "2026/Jan": {
    folders: [],
    files: ["jan-data.xlsx", "invoice1.pdf"],
  },

  "2026/Feb": {
    folders: [],
    files: ["feb-report.docx"],
  },

  "2025": {
    folders: [{ name: "March", folderType: "documents" }],
    files: ["summary2025.csv"],
  },

  "2025/March": {
    folders: [],
    files: ["march-data.pdf"],
  },
};

// Helper: fake delay
export const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
