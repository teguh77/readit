import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Axios from 'axios';
import classNames from 'classnames';

import InputGroup from '../components/InputGroup';
import { useAuthDispatch, useAuthState } from '../context/auth';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();
  const dispatch = useAuthDispatch();

  const router = useRouter();
  if (authenticated) router.push('/');

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post('/auth/login', {
        username,
        password
      });

      dispatch('LOGIN', res.data);
      router.back(); // untuk kembali lagi ke halaman semula setelah login

      router.push('/');
    } catch (err) {
      console.log(err);
      setErrors(err.response.data);
    }
  };

  return (
    <div className='flex bg-white'>
      <Head>
        <title>Login</title>
      </Head>

      <div
        className='h-screen bg-center bg-cover w-36'
        style={{ backgroundImage: "url('/images/bricks.jpg')" }}></div>
      <div className='flex flex-col justify-center pl-6'>
        <div className='w-70'>
          <h1 className='mb-2 text-lg font-medium'>Login</h1>
          <p className='mb-10 text-xs'>
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={submitForm}>
            <InputGroup
              className='mb-2'
              placeholder={'USERNAME'}
              type='text'
              value={username}
              setValue={setUsername}
            />
            <InputGroup
              className={classNames('mb-1', { 'mb-2': errors.error })}
              placeholder={'PASSWORD'}
              type='password'
              value={password}
              setValue={setPassword}
            />
            <small className='block mb-4 font-medium text-red-600'>
              {errors.error}
            </small>
            <button className='w-full py-2 mb-4 text-white uppercase bg-blue-500 border border-blue-500 rounded'>
              Sign In
            </button>
          </form>
          <small>
            New to Readit?
            <Link href='/register'>
              <a className='ml-1 text-blue-500 uppercase'>Sign Up</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
