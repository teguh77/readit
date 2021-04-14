export interface Post {
  identifier: string;
  title: string;
  body: string;
  slug: string;
  subName: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  sub?: Sub;
  //Virtual Fields
  url: string;
  commentCount?: number;
  voteScore?: number;
  userVote?: number;
}

export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sub {
  createdAt: string;
  updatedAt: string;
  name: string;
  title: string;
  description: string;
  imageUrn: string;
  bannerUrn: string;
  username: string;
  posts: Post[];

  // Virtuals
  imageUrl: string;
  bannerUrl: string;
  postCount?: number;
}

export interface Comment {
  identifier: string;
  body: string;
  username: string;
  createdAt: string;
  updatedAt: string;
  post?: Post;
  //  Virtuals
  userVote: number;
  voteScore: number;
}
