/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where, 
  limit, 
  getDocs,
  Timestamp,
  deleteDoc,
  User
} from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  LogOut, 
  Heart, 
  Copy, 
  Check, 
  User as UserIcon, 
  MessageSquare,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Smile,
  Zap,
  Sparkles,
  Wifi,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  pairId?: string;
  pairingCode?: string;
  chatId?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Timestamp;
  read?: boolean;
}

// --- Constants ---

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '💩', '🤡', '👹', '👺', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😻', '😽', '😼', '🙀', '😿', '😾', '🤲', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🙏', '💍', '💄', '💋', '👄', '👅', '👂', '👃', '👣', '👁', '👀', '🧠', '🗣', '👤', '👥', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱', '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲', '🧑‍🦲', '👨‍🦲', '🧔', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️', '👷‍♀️', '👷', '👮‍♂️', '💂‍♀️', '💂', '💂‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '👩‍⚕️', '🧑‍⚕️', '👨‍⚕️', '👩‍🌾', '🧑‍🌾', '👨‍🌾', '👩‍🍳', '🧑‍🍳', '👨‍🍳', '👩‍🎓', '🧑‍🎓', '👨‍🎓', '👩‍🎤', '🧑‍🎤', '👨‍🎤', '👩‍🏫', '🧑‍🏫', '👨‍🏫', '👩‍🏭', '🧑‍🏭', '👨‍🏭', '👩‍💻', '🧑‍💻', '👨‍💻', '👩‍💼', '🧑‍💼', '👨‍💼', '👩‍🔧', '🧑‍🔧', '👨‍🔧', '👩‍🔬', '🧑‍🔬', '👨‍🔬', '👩‍🎨', '🧑‍🎨', '👨‍🎨', '👩‍🚒', '🧑‍🚒', '👨‍🚒', '👩‍✈️', '🧑‍✈️', '👨‍✈️', '👩‍🚀', '🧑‍🚀', '👨‍🚀', '👩‍⚖️', '🧑‍⚖️', '👨‍⚖️', '👰', '🤵', '👸', '🤴', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '🤰', '🤱', '🙇‍♀️', '🙇', '🙇‍♂️', '💁‍♀️', '💁', '💁‍♂️', '🙅‍♀️', '🙅', '🙅‍♂️', '🙆‍♀️', '🙆', '🙆‍♂️', '🙋‍♀️', '🙋', '🙋‍♂️', '🧏‍♀️', '🧏', '🧏‍♂️', '🙎‍♀️', '🙎', '🙎‍♂️', '🙍‍♀️', '🙍', '🙍‍♂️', '💇‍♀️', '💇', '💇‍♂️', '💆‍♀️', '💆', '💆‍♂️', '🧖‍♀️', '🧖', '🧖‍♂️', '💅', '🤳', '💃', '🕺', '👯‍♀️', '👯', '👯‍♂️', '🕴', '👩‍🦽', '🧑‍🦽', '👨‍🦽', '👩‍🦼', '🧑‍🦼', '👨‍🦼', '🚶‍♀️', '🚶', '🚶‍♂️', '👩‍🦯', '🧑‍🦯', '👨‍🦯', '🏃‍♀️', '🏃', '🏃‍♂️', '👫', '👭', '👬', '💑', '👩‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨', '💏', '👩‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '👨‍❤️‍💋‍👨', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '🧶', '🧵', '🧥', '🥼', '🦺', '👚', 'shirt', '👖', '🧣', '🧤', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👛', '👜', '👝', '🎒', '👞', '👟', '🥾', '🥿', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑', '💄', '💍', '💼', '🩸'
];

const SMART_REPLIES = [
  "Love you! ❤️", "Miss you! ✨", "On my way! 🚀", "Good night 🌙", "Good morning ☀️", "Can't wait! 😍"
];

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  className, 
  variant = 'primary',
  disabled = false,
  isLoading = false,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(99,102,241,0.4)]',
    secondary: 'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_10px_30px_rgba(244,63,94,0.4)]',
    ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/5',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20',
    glass: 'glass text-white hover:bg-white/10'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'px-8 py-4 rounded-full font-bold transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-90',
        variants[variant],
        className
      )}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  onKeyDown,
  type = 'text',
  icon: Icon
}: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  placeholder?: string; 
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  type?: string;
  icon?: any;
}) => (
  <div className="relative w-full group">
    {Icon && (
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
    )}
    <input 
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={cn(
        'w-full px-6 py-5 rounded-full glass-dark border-white/5 focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-white/20 text-white',
        Icon ? 'pl-14' : 'px-8',
        className
      )}
    />
  </div>
);

const MotionHeart = motion(Heart);

const AnimatedHeart = ({ className }: { className?: string }) => (
  <MotionHeart
    className={className}
    animate={{
      scale: [1, 1.2, 1],
      rotate: [0, 15, -15, 0],
      fill: ['#f43f5e', '#ec4899', '#8b5cf6', '#f43f5e'],
      color: ['#f43f5e', '#ec4899', '#8b5cf6', '#f43f5e'],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pairedUser, setPairedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isPairing, setIsPairing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'landing'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u) {
        syncUserProfile(u);
      } else {
        setProfile(null);
        setPairedUser(null);
        setMessages([]);
      }
    });
    return unsubscribe;
  }, []);

  const syncUserProfile = async (u: User) => {
    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || displayName,
        photoURL: u.photoURL,
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
    } else {
      setProfile(snap.data() as UserProfile);
    }
  };

  // Listen to profile changes
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    });
    return unsubscribe;
  }, [user]);

  // Listen to paired user profile
  useEffect(() => {
    if (!profile?.pairId) {
      setPairedUser(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'users', profile.pairId), (snap) => {
      if (snap.exists()) {
        setPairedUser(snap.data() as UserProfile);
      }
    });
    return unsubscribe;
  }, [profile?.pairId]);

  // Listen to messages
  useEffect(() => {
    if (!profile?.chatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, 'chats', profile.chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return unsubscribe;
  }, [profile?.chatId]);

  // Listen to typing status
  useEffect(() => {
    if (!profile?.chatId || !profile?.pairId) return;
    const unsubscribe = onSnapshot(doc(db, 'chats', profile.chatId, 'typing', profile.pairId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const isTyping = data.isTyping && (Date.now() - (data.timestamp?.toMillis() || 0) < 5000);
        setIsOtherTyping(isTyping);
      } else {
        setIsOtherTyping(false);
      }
    });
    return unsubscribe;
  }, [profile?.chatId, profile?.pairId]);

  const updateTypingStatus = async (isTyping: boolean) => {
    if (!profile?.chatId || !user) return;
    const now = Date.now();
    if (isTyping && now - lastTypingTime < 2000) return; // Throttle
    if (isTyping) setLastTypingTime(now);
    
    await setDoc(doc(db, 'chats', profile.chatId, 'typing', user.uid), {
      isTyping,
      timestamp: serverTimestamp()
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (!trimmedPassword) {
      setAuthError('Please enter your password.');
      return;
    }

    if (authMode === 'signup' && !displayName.trim()) {
      setAuthError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        if (displayName) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/invalid-email') {
        setAuthError('The email address is not valid. Please check for typos.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError('This email is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('Password should be at least 6 characters.');
      } else {
        setAuthError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePairingCode = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await updateDoc(doc(db, 'users', user.uid), { pairingCode: code });
  };

  const handlePairing = async () => {
    if (!user || !pairingCodeInput) return;
    setIsPairing(true);
    try {
      const q = query(collection(db, 'users'), where('pairingCode', '==', pairingCodeInput.toUpperCase()), limit(1));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        alert('Invalid pairing code.');
        return;
      }

      const otherUserDoc = snap.docs[0];
      const otherUser = otherUserDoc.data() as UserProfile;

      if (otherUser.uid === user.uid) {
        alert('You cannot pair with yourself.');
        return;
      }

      if (otherUser.pairId) {
        alert('This user is already paired.');
        return;
      }

      const chatId = [user.uid, otherUser.uid].sort().join('_');
      
      // Create chat doc
      await setDoc(doc(db, 'chats', chatId), {
        participants: [user.uid, otherUser.uid],
        createdAt: serverTimestamp()
      });

      // Update both users
      await updateDoc(doc(db, 'users', user.uid), {
        pairId: otherUser.uid,
        chatId: chatId,
        pairingCode: null
      });

      await updateDoc(doc(db, 'users', otherUser.uid), {
        pairId: user.uid,
        chatId: chatId,
        pairingCode: null
      });

    } catch (error) {
      console.error('Pairing error:', error);
      alert('Failed to pair. Please try again.');
    } finally {
      setIsPairing(false);
    }
  };

  const sendMessage = async () => {
    if (!profile?.chatId || !newMessage.trim() || !user) return;
    const text = newMessage;
    setNewMessage('');
    
    try {
      await addDoc(collection(db, 'chats', profile.chatId, 'messages'), {
        text,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        read: false
      });
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!profile?.chatId) return;
    try {
      await deleteDoc(doc(db, 'chats', profile.chatId, 'messages', messageId));
      setDeletingMessageId(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete message.');
    }
  };

  const copyCode = () => {
    if (profile?.pairingCode) {
      navigator.clipboard.writeText(profile.pairingCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="atmosphere" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center glass border-white/10">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-black animate-pulse">Establishing Neural Link...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="atmosphere" />
        
        {/* Floating Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full floating" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 blur-[120px] rounded-full floating" style={{ animationDelay: '-3s' }} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-sm w-full glass p-12 rounded-[4rem] border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] space-y-10 relative z-10"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(99,102,241,0.4)] rotate-6 floating">
              <AnimatedHeart className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-display font-black tracking-tight text-white">Exclusive Pairing</h1>
            <p className="text-white/40 font-medium tracking-wide">Your colorful, private sanctuary.</p>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'landing' ? (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  <Button onClick={() => setAuthMode('signup')} className="w-full text-xl py-6">
                    Get Started
                  </Button>
                  <Button onClick={() => setAuthMode('login')} variant="glass" className="w-full text-xl py-6">
                    Log In
                  </Button>
                </div>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]"><span className="bg-[#0a0502]/50 backdrop-blur-md px-4 text-white/20 font-black">Or</span></div>
                </div>
                <Button onClick={signInWithGoogle} variant="glass" className="w-full py-5 border-white/5">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3" alt="" />
                  Google
                </Button>

                <div className="pt-6">
                  <a 
                    href={window.location.origin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] hover:text-indigo-400 transition-colors flex items-center justify-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    Open in New Tab
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleEmailAuth}
                className="space-y-5"
              >
                {authMode === 'signup' && (
                  <Input 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    icon={UserIcon}
                  />
                )}
                <Input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  type="email"
                  icon={Mail}
                />
                <Input 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="password"
                  icon={Lock}
                />
                {authError && <p className="text-[11px] text-rose-400 text-left px-4 font-bold uppercase tracking-wider">{authError}</p>}
                <Button type="submit" isLoading={isSubmitting} className="w-full py-5 text-lg">
                  {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </Button>
                <Button variant="ghost" onClick={() => setAuthMode('landing')} className="w-full text-xs font-black uppercase tracking-widest text-white/20">
                  Go Back
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      <div className="atmosphere" />
      
      {/* Floating Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full floating" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[150px] rounded-full floating" style={{ animationDelay: '-4s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass rounded-[4rem] overflow-hidden flex flex-col h-[85vh] relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
      >
        
        {/* Header */}
        <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-3xl sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {pairedUser ? (
              <>
                <div className="relative">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-white/10 overflow-hidden border border-white/20 shadow-2xl rotate-3">
                    {pairedUser.photoURL ? (
                      <img src={pairedUser.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <UserIcon className="w-7 h-7" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0a0502] shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                </div>
                <div>
                  <h2 className="font-display font-black text-white leading-none text-xl tracking-tight">{pairedUser.displayName || 'Partner'}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Wifi className="w-3 h-3 text-green-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Connected</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 rotate-6">
                  <AnimatedHeart className="w-6 h-6" />
                </div>
                <h2 className="font-display font-black text-white text-2xl tracking-tight">Exclusive</h2>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Quantum</span>
            </div>
            <Button variant="ghost" onClick={logOut} className="p-3 text-white/20 hover:text-rose-400 hover:bg-white/5 rounded-2xl">
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col bg-transparent">
          <AnimatePresence mode="wait">
            {!profile?.pairId ? (
              <motion.div 
                key="pairing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 p-10 flex flex-col items-center justify-center text-center space-y-12"
              >
                <div className="space-y-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-rose-400 rounded-[3rem] flex items-center justify-center mx-auto shadow-[0_25px_60px_rgba(99,102,241,0.4)] -rotate-6 floating">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-4xl font-display font-black text-white tracking-tight">Start Your Story</h3>
                  <p className="text-base text-white/40 px-6 font-medium leading-relaxed">
                    Connect with your special someone to unlock your private, colorful world.
                  </p>
                </div>

                {/* My Code */}
                <div className="w-full space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.4em] text-indigo-400 font-black">Your Secret Code</span>
                  {profile?.pairingCode ? (
                    <div 
                      onClick={copyCode}
                      className="group relative glass-dark p-8 rounded-[3rem] flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all border-white/5"
                    >
                      <span className="text-4xl font-display font-black tracking-[0.5em] text-indigo-400">{profile.pairingCode}</span>
                      {copySuccess ? <Check className="w-8 h-8 text-green-400" /> : <Copy className="w-8 h-8 text-white/10 group-hover:text-white/30" />}
                    </div>
                  ) : (
                    <Button onClick={generatePairingCode} className="w-full py-6 text-xl rounded-[3rem]">
                      Generate Secret Code
                    </Button>
                  )}
                </div>

                <div className="w-full flex items-center gap-6">
                  <div className="h-px flex-1 bg-white/5"></div>
                  <span className="text-[11px] text-white/10 font-black uppercase tracking-[0.4em]">OR</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>

                {/* Enter Code */}
                <div className="w-full space-y-4">
                  <span className="text-[11px] uppercase tracking-[0.4em] text-rose-400 font-black">Enter Partner's Code</span>
                  <div className="relative">
                    <Input 
                      value={pairingCodeInput}
                      onChange={(e) => setPairingCodeInput(e.target.value)}
                      placeholder="XXXXXX"
                      className="pr-20 uppercase font-display text-3xl font-black tracking-[0.5em] text-rose-400 bg-white/5 border-white/10 focus:border-rose-500/50 py-8 rounded-[3rem]"
                    />
                    <button 
                      onClick={handlePairing}
                      disabled={!pairingCodeInput || isPairing}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center disabled:opacity-30 shadow-[0_15px_30px_rgba(244,63,94,0.4)] transition-all active:scale-90 hover:bg-rose-400"
                    >
                      {isPairing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-8 h-8" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-10">
                      <div className="w-28 h-28 bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/10 shadow-inner floating">
                        <AnimatedHeart className="w-14 h-14" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-3xl font-display font-black text-white tracking-tight">Your Private Space</p>
                        <p className="text-base text-white/30 font-medium italic">Say something beautiful to start your story.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user.uid;
                        const showDate = idx === 0 || 
                          format(messages[idx-1].timestamp?.toDate() || new Date(), 'yyyy-MM-dd') !== 
                          format(msg.timestamp?.toDate() || new Date(), 'yyyy-MM-dd');

                        return (
                          <React.Fragment key={msg.id}>
                            {showDate && msg.timestamp && (
                              <div className="flex justify-center my-16">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black bg-white/5 px-8 py-3 rounded-full border border-white/10 backdrop-blur-3xl">
                                  {format(msg.timestamp.toDate(), 'MMMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            <motion.div 
                              initial={{ opacity: 0, y: 20, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ type: "spring", damping: 20, stiffness: 100 }}
                              className={cn(
                                "flex flex-col max-w-[85%] group/msg",
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                              )}
                            >
                              <div className="flex items-center gap-2 w-full">
                                {isMe && (
                                  <button 
                                    onClick={() => setDeletingMessageId(msg.id)}
                                    className="opacity-0 group-hover/msg:opacity-100 p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-rose-400 transition-all active:scale-90 order-first"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <div className={cn(
                                  "px-8 py-5 rounded-[3rem] text-[16px] font-medium leading-relaxed transition-all shadow-2xl flex-1",
                                  isMe 
                                    ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-none shadow-indigo-500/20" 
                                    : "glass-dark text-white/90 rounded-tl-none border-white/5"
                                )}>
                                  {msg.text}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-3 px-4">
                                <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                                  {msg.timestamp ? format(msg.timestamp.toDate(), 'h:mm a') : '...'}
                                </span>
                                {isMe && (
                                  <div className={cn("w-1.5 h-1.5 rounded-full", msg.read ? "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" : "bg-white/10")}></div>
                                )}
                              </div>
                            </motion.div>
                          </React.Fragment>
                        );
                      })}
                      
                      {isOtherTyping && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 ml-4"
                        >
                          <div className="flex gap-1.5">
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                          </div>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Partner is typing...</span>
                        </motion.div>
                      )}
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 bg-transparent border-t border-white/5 relative">
                  
                  {/* Smart Replies */}
                  {!newMessage.trim() && !showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 overflow-x-auto scrollbar-hide mb-6 pb-2"
                    >
                      {SMART_REPLIES.map((reply, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setNewMessage(reply);
                            updateTypingStatus(true);
                          }}
                          className="whitespace-nowrap px-6 py-3 rounded-full glass-dark text-[12px] font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 border-white/5"
                        >
                          {reply}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-full left-8 right-8 mb-8 glass-dark rounded-[3rem] p-6 h-80 overflow-y-auto z-50 grid grid-cols-8 gap-4 scrollbar-hide border-white/10 shadow-2xl"
                      >
                        {EMOJIS.map((emoji, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              setNewMessage(prev => prev + emoji);
                              updateTypingStatus(true);
                            }}
                            className="text-3xl hover:bg-white/10 p-3 rounded-[1.5rem] transition-all active:scale-75"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="relative flex items-center gap-4">
                    <button 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={cn(
                        "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all active:scale-90 shadow-xl",
                        showEmojiPicker ? "bg-indigo-500 text-white" : "bg-white/5 text-white/20 hover:bg-white/10 border border-white/10"
                      )}
                    >
                      <Smile className="w-8 h-8" />
                    </button>
                    <div className="flex-1 relative">
                      <Input 
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          updateTypingStatus(e.target.value.length > 0);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="bg-white/5 py-8 rounded-[3rem] border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/10 text-white placeholder:text-white/10 text-lg"
                      />
                    </div>
                    <button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_15px_30px_rgba(99,102,241,0.4)] disabled:opacity-10 transition-all active:scale-90 hover:bg-indigo-400"
                    >
                      <Send className="w-8 h-8" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMessageId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMessageId(null)}
              className="absolute inset-0 bg-[#0a0502]/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs glass p-10 rounded-[3rem] border-white/10 shadow-2xl space-y-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-500/20 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20">
                <Trash2 className="w-10 h-10 text-rose-400" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-black text-white">Delete Message?</h3>
                <p className="text-sm text-white/40 font-medium">This action cannot be undone. The message will be removed for both of you.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  onClick={() => deleteMessage(deletingMessageId)}
                  variant="secondary"
                  className="w-full py-5"
                >
                  Delete Forever
                </Button>
                <Button 
                  onClick={() => setDeletingMessageId(null)}
                  variant="ghost"
                  className="w-full py-5 text-white/20 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="mt-12 text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
          <p className="text-[11px] uppercase tracking-[0.6em] text-white/30 font-black">Exclusive Pairing</p>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]"></div>
        </div>
        <div className="flex items-center justify-center gap-10 text-[10px] text-white/10 font-black uppercase tracking-[0.3em]">
          <span className="flex items-center gap-3 hover:text-white/30 transition-colors cursor-help"><Lock className="w-4 h-4" /> Encrypted</span>
          <span className="flex items-center gap-3 hover:text-white/30 transition-colors cursor-help"><AnimatedHeart className="w-4 h-4" /> Private</span>
        </div>
      </footer>
    </div>
  );
}
