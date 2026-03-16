export const AVAILABLE_OPERATORS = [
  { label: "Starts With", value: "STARTSWITH" },
  { label: "Ends With", value: "ENDSWITH" },
  { label: "Contains", value: "LIKE" },
  { label: "Equals", value: "EQUAL" },
  { label: "Not Equal", value: "NOTEQUAL" },
  { label: "Less Than", value: "LESS" },
  { label: "Less or Equal", value: "LESSOREQUAL" },
  { label: "Greater Than", value: "GREATER" },
  { label: "Greater or Equal", value: "GREATEROREQUAL" },
] as const;
export type SearchOperator = (typeof AVAILABLE_OPERATORS)[number]["value"];
export interface SearchCriterionDTO {
  property: string;
  operator: SearchOperator;
  values: string[];
}

export interface SearchRequestDTO {
  baseClassName: string;
  searchSubclasses?: boolean;
  andSearch?: boolean;
  criteria: SearchCriterionDTO[];
  pageSize?: number;
  pageNumber?: number;
}
