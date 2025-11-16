// components/AuthForm.jsx
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const AuthForm = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('Account created successfully! Please log in.');
        setIsLogin(true);
      }
      onAuthSuccess();
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage('');
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setMessage('Signed in with Google successfully!');
      onAuthSuccess();
    } catch (err) {
      console.error("Google Sign-In error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="bg-[var(--muted-1)] p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-[var(--text-strong)] mb-6">
        {isLogin ? 'Login' : 'Sign Up'}
      </h2>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[var(--text-strong)] text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition duration-200"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[var(--text-strong)] text-sm font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-[var(--accent)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition duration-200"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--accent)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-2)] transition duration-300 shadow-md"
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-[var(--accent)]"></div>
        <span className="flex-shrink mx-4 text-[var(--text-strong)]">OR</span>
        <div className="flex-grow border-t border-[var(--accent)]"></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center bg-[var(--accent)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--accent-2)] transition duration-300 shadow-md"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.6-6.44C36.83 4.01 30.41 2 24 2 15.16 2 7.41 6.66 3.19 14.15l6.75 4.62C11.65 11.85 17.77 9.5 24 9.5z"></path>
          <path fill="#4285F4" d="M46.98 24.5c0-.87-.13-1.63-.29-2.34H24v4.67h12.43c-.47 2.23-1.8 3.98-3.92 5.23l6.55 5.02c3.8-3.59 6.0-8.64 6.0-14.58z"></path>
          <path fill="#FBBC04" d="M10.19 33.5c-.81-.66-1.49-1.46-2.06-2.37l-6.75 4.62c1.95 3.68 4.76 6.53 8.36 8.39l6.12-4.7c-1.6-1.1-2.83-2.5-3.81-4.1z"></path>
          <path fill="#34A853" d="M24 46c6.8 0 12.42-2.95 16.51-7.98l-6.12-4.7c-3.21 2.28-7.7 3.62-10.39 3.62-6.51 0-11.92-4.22-13.84-9.91l-6.75 4.62C7.41 41.34 15.16 46 24 46z"></path>
          <path fill="none" d="M0 0h48v48H0z"></path>
        </svg>
        Sign in with Google
      </button>

      {message && <p className="text-green-600 text-center mt-4">{message}</p>}
      {error && <p className="text-red-600 text-center mt-4">{error}</p>}

      <p className="text-center text-[var(--text-strong)] mt-6">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[var(--accent)] hover:underline font-semibold"
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
