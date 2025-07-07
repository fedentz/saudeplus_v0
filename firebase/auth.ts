import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const loginWithEmail = async (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);
