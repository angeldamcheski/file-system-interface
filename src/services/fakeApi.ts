// fakeApi.js

export const fileSystem = {
  root: {
    folders: ["2026", "2025"],
    files: ["readme.txt", "config.json"],
  },

  "2026": {
    folders: ["Jan", "Feb"],
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
    folders: ["March"],
    files: ["summary2025.csv"],
  },

  "2025/March": {
    folders: [],
    files: ["march-data.pdf"],
  },
};

// Helper: fake delay
export const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
