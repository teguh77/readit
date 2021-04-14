import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { createRef, Fragment, useEffect, useState, ChangeEvent } from 'react';
import useSWR from 'swr';
import classNames from 'classnames';
import Axios from 'axios';

import PostCard from '../../components/PostCard';
import { Post, Sub } from '../../types';
import { useAuthState } from '../../context/auth';
import Sidebar from '../../components/Sidebar';

export default function SubPage() {
  // Local State
  const [ownSub, setOwnSub] = useState(false);
  // Global State
  const { authenticated, user } = useAuthState();
  // Utils
  const router = useRouter();
  const fileInputRef = createRef<HTMLInputElement>();

  const subName = router.query.sub;
  const { data: sub, error, revalidate } = useSWR<Sub>(
    subName ? `/subs/${subName}` : null
  );

  useEffect(() => {
    if (!sub) return;
    setOwnSub(authenticated && sub.username === user.username);
  }, [sub]);

  const openFileInput = (type: string) => {
    if (!ownSub) return;
    fileInputRef.current.name = type;
    fileInputRef.current.click();
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', fileInputRef.current.name);

    try {
      await Axios.post<Sub>(`/subs/${sub.name}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      revalidate();
    } catch (err) {
      console.log(err);
    }
  };

  if (error) router.push('/');

  let postMarkup;
  if (!sub) {
    postMarkup = <p className='text-lg text-center'>Loading..</p>;
  } else if (sub.posts.length === 0) {
    postMarkup = <p className='text-lg text-center'>No Posts submitted yet</p>;
  } else {
    postMarkup = sub.posts.map((post: Post) => (
      <PostCard key={post.identifier} post={post} revalidate={revalidate} />
    ));
  }

  return (
    <div>
      <Head>
        <title>{sub?.title}</title>
      </Head>

      {sub && (
        <Fragment>
          <input
            type='file'
            hidden={true}
            ref={fileInputRef}
            onChange={uploadImage}
          />
          {/* Sub info and images */}
          <div>
            <div
              className={classNames('bg-blue-500', {
                'cursor-pointer': ownSub
              })}
              onClick={() => openFileInput('banner')}>
              {sub.bannerUrl ? (
                <div
                  className='h-56 bg-blue-500'
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}></div>
              ) : (
                <div className='h-20 bg-blue-500'></div>
              )}
            </div>
            <div className='h-20 bg-white'>
              <div className='container relative flex'>
                <div className='absolute' style={{ top: -15 }}>
                  <Image
                    src={sub.imageUrl}
                    alt='Sub Image'
                    className={classNames('rounded-full', {
                      'cursor-pointer': ownSub
                    })}
                    onClick={() => openFileInput('image')}
                    width={70}
                    height={70}
                  />
                </div>
                <div className='pt-1 pl-24'>
                  <div className='flex items-center'>
                    <div className='mb-2 text-3xl font-bold'>{sub.title}</div>
                  </div>
                  <div className='text-sm font-bold text-gray-600'>
                    /r/{sub.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Posts and Sidebar */}
          <div className='container flex pt-5'>
            <div className='w-160'>{postMarkup}</div>
            <Sidebar sub={sub} />
          </div>
        </Fragment>
      )}
    </div>
  );
}
