import { Request, Response, Router } from 'express';
import { getConnection } from 'typeorm';
import Comment from '../entities/Comment';
import Post from '../entities/Post';
import User from '../entities/User';
import Sub from '../entities/Sub';
import Vote from '../entities/Vote';

import auth from '../middlewares/auth';
import user from '../middlewares/user';

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  // vaidate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: 'Value must be -1, 0 or 1' });
  }

  try {
    const user: User = res.locals.user;
    let post = await Post.findOneOrFail({ identifier, slug });
    let vote: Vote | undefined;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // if there is a comment identifier find vote by comment
      comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
      vote = await Vote.findOne({ user, comment });
    } else {
      // Else find vote by post
      vote = await Vote.findOne({ user, post });
    }

    if (!vote && value === 0) {
      // if no vote and value = 0 return error
      return res.status(404).json({ error: 'Vote not found' });
    } else if (!vote) {
      // if no vote,  create it
      vote = new Vote({ user, value });
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (value === 0) {
      // if vote exist and value = 0, remove vote from DB
      await vote.remove();
    } else if (vote.value !== value) {
      // if vote and value has change, update vote
      vote.value = value;
      await vote.save();
    }

    post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ['comments', 'comments.votes', 'sub', 'votes'] }
    );

    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong!' });
  }
};

const topSubs = async (_: Request, res: Response) => {
  try {
    const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn",
    'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    )`;
    const subs = await getConnection()
      .createQueryBuilder()
      .select(
        `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
      )
      .from(Sub, 's')
      .leftJoin(Post, 'p', `s.name = p."subName"`)
      .groupBy('s.title, s.name, "imageUrl"')
      .orderBy(`"postCount"`, 'DESC')
      .limit(5)
      .execute();
    return res.json(subs);
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();

router.post('/vote', user, auth, vote);
router.get('/top-subs', topSubs);

export default router;
