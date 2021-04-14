import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';

import MyEntity from './MyEntity';
import User from './User';
import { makeId, slugify } from '../util/helpers';
import Sub from './Sub';
import Comment from './Comment';
import { Exclude, Expose } from 'class-transformer';
import Vote from './Vote';

@Entity('posts')
export default class Post extends MyEntity {
  // digunakan untuk memudahkan dalam create new User
  constructor(post: Partial<Post>) {
    super();
    Object.assign(this, post);
  }

  @Column()
  identifier: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ nullable: true, type: 'text' })
  body: string;

  @Column()
  subName: string;

  @Column()
  username: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;

  @ManyToOne(() => Sub, (sub) => sub.posts)
  @JoinColumn({ name: 'subName', referencedColumnName: 'name' })
  sub: Sub;

  // @Exclude()
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  // @Exclude()
  @OneToMany(() => Vote, (vote) => vote.post)
  votes: Vote[];

  @Expose() get url(): string {
    return `/r/${this.subName}/${this.identifier}/${this.slug}`;
  }

  @Expose() get commentCount(): number {
    return this.comments?.length;
  }

  @Expose() get voteScore(): number {
    return this.votes?.reduce((prev, curr) => prev + (curr.value || 0), 0);
  }

  protected userVote: number;
  setUserVote(user: User) {
    const index = this.votes?.findIndex((v) => v.username === user.username);
    this.userVote = index > -1 ? this.votes[index].value : 0;
  }

  @BeforeInsert()
  makeIdAndSlug() {
    this.identifier = makeId(7);
    this.slug = slugify(this.title);
  }
}
