export type Document = {
  id: string;
  title: string;
  content: string;
  authorID: string;
  author: User;
  version: number;
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Collaborator = {
  id: string;
  userID: string;
  access: AccessLevel;
};

export type AccessLevel = "read" | "write";
