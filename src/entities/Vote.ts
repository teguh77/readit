import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

import MyEntity from './MyEntity';
import User from './User';
import Post from './Post';
import Comment from './Comment';

@Entity('votes')
export default class Vote extends MyEntity {
  // digunakan untuk memudahkan dalam create new Vote
  constructor(vote: Partial<Vote>) {
    super();
    Object.assign(this, vote);
  }

  @Column()
  value: number;

  @Column()
  username: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => Comment)
  comment: Comment;
}
