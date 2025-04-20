'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const toggleMode = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <main className="relative flex items-center justify-center h-screen w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white">
      {/* Scroll-interactive blurred silver pattern */}
      <div className="absolute top-0 left-0 w-full h-[200%] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:40px_40px] opacity-20 blur-2xl z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">{isLogin ? 'Login' : 'Sign Up'}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={toggleMode}
          className="mt-6 text-sm text-zinc-400 hover:text-white transition"
        >
          {isLogin ? 'New here? Create an account' : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  );
}