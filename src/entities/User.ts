import { IsEmail, Length } from 'class-validator';
import { Entity, Column, Index, BeforeInsert, OneToMany } from 'typeorm';
import bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

import MyEntity from './MyEntity';
import Post from './Post';

@Entity('users')
export default class User extends MyEntity {
  // digunakan untuk memudahkan dalam create new User
  constructor(user: Partial<User>) {
    super();
    Object.assign(this, user);
  }

  @Index()
  @IsEmail(undefined, { message: 'Must be a valid email address' })
  @Length(1, 255, { message: 'Email is Empty' })
  @Column({ unique: true })
  email: string;

  @Index()
  @Length(3, 255, { message: 'Must be at least 3 characters long' })
  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  @Length(6, 255, { message: 'Must be at least 6 characters long' })
  password: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
