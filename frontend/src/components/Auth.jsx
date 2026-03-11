import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  Sun, Moon, MapPin, Mail, Lock, LogOut, Loader2, 
  BarChart3, AlertCircle, Cloud, CloudRain, Sun as SunIcon, 
  TrendingUp, Activity, CheckCircle2, User
} from 'lucide-react';

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
      return JSON.parse(__firebase_config);
    }
  } catch (e) {
    console.warn("Could not parse dynamic Firebase config, using fallbacks.", e);
  }
  return {
    apiKey: "DEMO_KEY",
    authDomain: "demo-app.firebaseapp.com",
    projectId: "demo-app",
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ==========================================
// 2. CUSTOM HOOKS
// ==========================================

const useCurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
};

const useWeather = () => {
  const [weather, setWeather] = useState({ 
    temp: null, 
    condition: null, 
    city: 'Detecting location...',
    loading: true 
  });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            const geoRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || 'Unknown City';

            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            const weatherData = await weatherRes.json();

            setWeather({
              temp: Math.round(weatherData.current_weather.temperature),
              condition: weatherData.current_weather.weathercode,
              city,
              loading: false
            });

          } catch {
            setWeather({ temp: null, condition: null, city: 'Weather unavailable', loading: false });
          }
        },
        () => {
          setWeather({ temp: null, condition: null, city: 'Location access denied', loading: false });
        }
      );
    } else {
      setWeather({ temp: null, condition: null, city: 'Geolocation unsupported', loading: false });
    }
  }, []);

  return weather;
};

const useTheme = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
  >
    {theme === 'dark'
      ? <Sun className="w-5 h-5"/>
      : <Moon className="w-5 h-5"/>
    }
  </button>
);

// ==========================================
// 4. DASHBOARD
// ==========================================

const Dashboard = ({ user }) => {

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Nexus Forecast Dashboard</h1>

      <p className="mb-4">
        Welcome {user?.displayName || user?.email}
      </p>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
};

// ==========================================
// 5. AUTH PAGE
// ==========================================

const AuthPage = () => {

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseError = (err) => {
    const code = err.code || '';

    if (code === 'auth/email-already-in-use') return 'Email already exists';
    if (code === 'auth/weak-password') return 'Password must be 6+ characters';
    if (code === 'auth/invalid-email') return 'Invalid email';
    if (code === 'auth/user-not-found') return 'User not found';

    return 'Authentication error';
  };

  const handleEmailAuth = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError('');

    try {

      if (isLogin) {

        await signInWithEmailAndPassword(auth, email, password);

      } else {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, { displayName: name });

      }

    } catch (err) {

      setError(parseError(err));

    } finally {

      setLoading(false);

    }
  };

  const handleGoogleAuth = async () => {

    setLoading(true);
    setError('');

    try {

      await signInWithPopup(auth, googleProvider);

    } catch (err) {

      setError(parseError(err));

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 w-80">

        {!isLogin && (
          <input
            placeholder="Full name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={handleGoogleAuth}
          className="border p-2 rounded"
        >
          Sign in with Google
        </button>

        <p>
          {isLogin ? "No account?" : "Already have an account?"}

          <button
            type="button"
            onClick={()=>setIsLogin(!isLogin)}
            className="text-blue-600 ml-2"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

      </form>
    </div>
  );
};

// ==========================================
// 6. ROOT APP
// ==========================================

export default function App() {

  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);
      setLoadingUser(false);

    });

    return () => unsubscribe();

  }, []);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10"/>
      </div>
    );
  }

  return (
    <>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme}/>
      {user ? <Dashboard user={user}/> : <AuthPage/>}
    </>
  );
}