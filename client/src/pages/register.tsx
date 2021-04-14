import Head from 'next/head';
import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Axios from 'axios';

import InputGroup from '../components/InputGroup';
import { useAuthState } from '../context/auth';

export default function Home() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { authenticated } = useAuthState();

  const router = useRouter();
  if (authenticated) router.push('/');

  const submitForm = async (event: FormEvent) => {
    event.preventDefault();
    if (!agreement) {
      setErrors({ ...errors, agreement: 'You must agree to T&Cs' });
      return;
    }
    try {
      await Axios.post('/auth/register', {
        email,
        username,
        password
      });
      router.push('/login');
    } catch (err) {
      console.log(err);
      setErrors(err.response.data);
    }
  };

  return (
    <div className='flex bg-white'>
      <Head>
        <title>Register</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div
        className='h-screen bg-center bg-cover w-36'
        style={{ backgroundImage: "url('/images/bricks.jpg')" }}></div>
      <div className='flex flex-col justify-center pl-6'>
        <div className='w-70'>
          <h1 className='mb-2 text-lg font-medium'>Sign Up</h1>
          <p className='mb-10 text-xs'>
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>
          <form onSubmit={submitForm}>
            <div className='mb-6'>
              <input
                className='mr-1 cursor-pointer'
                type='checkbox'
                id='agreement'
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
              />
              <label htmlFor='agreement' className='text-xs cursor-pointer'>
                I agree to got emails about cool stuff on Readit
              </label>
              <small className='block font-medium text-red-600'>
                {errors.agreement}
              </small>
            </div>
            <InputGroup
              className='mb-2'
              error={errors.email}
              placeholder={'EMAIL'}
              type='email'
              value={email}
              setValue={setEmail}
            />
            <InputGroup
              className='mb-2'
              error={errors.username}
              placeholder={'USERNAME'}
              type='text'
              value={username}
              setValue={setUsername}
            />
            <InputGroup
              className='mb-4'
              error={errors.password}
              placeholder={'PASSWORD'}
              type='password'
              value={password}
              setValue={setPassword}
            />
            <button className='w-full py-2 mb-4 text-white uppercase bg-blue-500 border border-blue-500 rounded'>
              Sign Up
            </button>
          </form>
          <small>
            Already a readitor?
            <Link href='/login'>
              <a className='ml-1 text-blue-500 uppercase'>Log in</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
