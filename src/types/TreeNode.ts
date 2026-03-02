export default interface TreeNode {
  key: string;
  path: string;
  IdFolder?: string | null;
  children?: TreeNode[];
  parentId?: string | null;
  title?: React.ReactNode;
  isLeaf?: boolean;
  icon?: React.ReactNode;
}
//We can use getPath() on every folder from FileNet instead of building manually the path
