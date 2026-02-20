export default interface TreeNode {
  key: string;
  path: string;
  IdFolder?: string | null;
  children?: TreeNode[];
  title?: React.ReactNode;
  isLeaf?: boolean;
  icon?: React.ReactNode;
}
