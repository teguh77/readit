import { Request, Response, Router } from 'express';
import auth from '../middlewares/auth';
import { isEmpty } from 'class-validator';
import { getConnection, getRepository } from 'typeorm';
import path from 'path';
import { NextFunction } from 'express-serve-static-core';
import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';

import Sub from '../entities/Sub';
import Post from '../entities/Post';
import User from '../entities/User';
import user from '../middlewares/user';
import { makeId } from '../util/helpers';

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user = res.locals.user;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = 'Name must not be empty';
    if (isEmpty(title)) errors.title = 'title must not be empty';

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = 'Sub exists already';
    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const sub = new Sub({ name, title, user, description });
    await sub.save();

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: 'DESC' },
      relations: ['comments', 'votes']
    });
    sub.posts = posts;
    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }
    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(404).json({ sub: 'Sub not found' });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });
    if (sub.username != user.username) {
      return res.status(403).json({ error: 'You dont own this sub' });
    }
    res.locals.sub = sub;
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images',
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname)); // e.g jfhjdshjafh + .png
    }
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
      callback(null, true);
    } else {
      callback(new Error('Not an image'));
    }
  }
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;

    if (type !== 'image' && type !== 'banner') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid Type' });
    }

    let oldImageUrn = '';
    if (type === 'image') {
      oldImageUrn = sub.imageUrn || '';
      sub.imageUrn = req.file.filename;
    } else if (type === 'banner') {
      oldImageUrn = sub.bannerUrn || '';
      sub.bannerUrn = req.file.filename;
    }

    await sub.save();

    if (oldImageUrn !== '') {
      fs.unlinkSync(`public\\images\\${oldImageUrn}`);
    }

    return res.json(sub);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const searchSub = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;
    if (isEmpty(name)) {
      return res.status(400).json({ error: 'Name must not be empty' });
    }

    const subs = await getRepository(Sub)
      .createQueryBuilder()
      .where('LOWER(name) LIKE :name', {
        name: `%${name.toLocaleLowerCase().trim()}%`
      })
      .getMany();
    return res.json(subs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();
router.post('/', user, auth, createSub);
router.get('/:name', user, getSub);
router.get('/search/:name', searchSub);
router.post(
  '/:name/image',
  user,
  auth,
  ownSub,
  upload.single('file'),
  uploadSubImage
);
export default router;
