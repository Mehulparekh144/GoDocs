export type Document = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author: User;
  version: number;
  collaborators: Collaborator[];
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Collaborator = {
  id: string;
  userID: string;
  user: User;
  access: AccessLevel;
};

export type AccessLevel = "read" | "write";

export type CreateDocumentResponse = {
  id: string;
  message: string;
};

export type CreateDocumentRequest = {
  title: string;
  content: string;
};
