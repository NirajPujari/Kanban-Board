"use client";
import { Mail, Lock, Check, Eye, EyeOff, User, LucideIcon } from "lucide-react";
import { FC, InputHTMLAttributes, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getData, setData } from "./utils/localStorage";
import { useRouter } from "next/navigation";
import { apiFetchJson } from "./utils/dndUtils";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export default function Authication() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUp, setSignUp] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [login, setLogin] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    const id = getData("User Id");
    if (id) {
      setData("User Id", id, 2592000000);
      router.push(`/${id}`);
    }
  }, [router]);

  const togglePassword = () => setShowPassword((p) => !p);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = login;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email");
      return;
    }

    if (!password.trim()) {
      toast.error("Password required");
      return;
    }

    try {
      const data = await apiFetchJson("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      toast.success("Login Successfull!!");
      if (login.rememberMe) {
        setData("User Id", String(data.id), 2592000000);
      }
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error, try again later");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { userName, email, password, confirmPassword } = signUp;

    // Username check
    if (!userName.trim() || userName.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }

    // Password strength
    const strongPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()+-_=<>{}[\]|~]).{8,}$/;
    if (!strongPass.test(password)) {
      toast.error(
        "Password must include uppercase, lowercase, number, symbol, and be 8+ chars"
      );
      return;
    }

    // Match confirmation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await apiFetchJson("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, password }),
      });

      toast.success("Sign Up Successfull!!");
      router.refresh();
    } catch (err) {
      console.error("Sign Up error:", err);
      toast.error("Server error, try again later");
    }

    console.log("Sign-Up Data:", signUp);
    toast.success("Sign-up successful!");
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="relative w-full max-w-sm perspective">
        <motion.div
          className="absolute w-full h-full rounded-2xl bg-neutral-900 shadow-xl p-8 backface-hidden overflow-hidden"
          initial={{ rotateY: 0, height: "0" }}
          animate={{
            height: isSignUp ? "full" : "auto",
            rotateY: isSignUp ? 180 : 0,
          }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <div className="px-6 py-10 rounded-xl text-center">
            <h1 className="text-3xl font-bold tracking-wider">Login</h1>
            <p className="pb-8 text-gray-400 text-sm">
              Welcome back! Login to continue.
            </p>
            <form className="space-y-4 text-left" onSubmit={handleLogin}>
              <InputField
                icon={Mail}
                placeholder="Email"
                value={login.email}
                onChange={(e) => setLogin({ ...login, email: e.target.value })}
              />
              <PasswordField
                show={showPassword}
                toggle={togglePassword}
                placeholder="Password"
                value={login.password}
                onChange={(e) =>
                  setLogin({ ...login, password: e.target.value })
                }
              />
              <div className="flex items-center justify-between text-sm">
                <label
                  data-checked={login.rememberMe}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() =>
                    setLogin({ ...login, rememberMe: !login.rememberMe })
                  }
                >
                  <span className="w-5 h-5 rounded-md border border-white/25 bg-white/5 flex items-center justify-center transition-all group-data-[checked=true]:bg-white group-data-[checked=true]:border-white">
                    <Check className="w-3.5 h-3.5 text-[#171717] opacity-0 scale-50 transition-all group-data-[checked=true]:opacity-100 group-data-[checked=true]:scale-100" />
                  </span>
                  <span className="text-gray-300 group-hover:text-white">
                    Remember me
                  </span>
                </label>
                <button className="text-gray-400 hover:text-white">
                  Forgot password?
                </button>
              </div>
              <button
                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg font-medium"
                type="submit"
              >
                Sign In
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-6">
              Don’t have an account?{" "}
              <button
                className="text-white underline"
                onClick={() => setIsSignUp(true)}
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
        <motion.div
          className="w-full h-full rounded-2xl bg-neutral-900 shadow-xl p-8 backface-hidden rotate-y-180  overflow-hidden"
          initial={{ rotateY: -180 }}
          animate={{
            height: isSignUp ? "full" : "auto",
            rotateY: isSignUp ? 0 : -180,
          }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <div className="px-6 py-10 rounded-xl text-center">
            <h1 className="text-3xl font-bold tracking-wider">Sign Up</h1>
            <p className="pb-8 text-gray-400 text-sm">Join and get started.</p>
            <form className="space-y-4 text-left" onSubmit={handleSignUp}>
              <InputField
                icon={User}
                placeholder="Username"
                value={signUp.userName}
                onChange={(e) => {
                  if (!/\d/.test(e.target.value)) {
                    setSignUp({ ...signUp, userName: e.target.value });
                  } else {
                    toast.error("Username should not contain numbers");
                  }
                }}
              />
              <InputField
                icon={Mail}
                placeholder="Email"
                value={signUp.email}
                onChange={(e) =>
                  setSignUp({ ...signUp, email: e.target.value })
                }
              />
              <PasswordField
                placeholder="Password"
                show={showPassword}
                toggle={togglePassword}
                value={signUp.password}
                onChange={(e) =>
                  setSignUp({ ...signUp, password: e.target.value })
                }
              />
              <PasswordField
                placeholder="Confirm Password"
                show={showPassword}
                toggle={togglePassword}
                value={signUp.confirmPassword}
                onChange={(e) =>
                  setSignUp({ ...signUp, confirmPassword: e.target.value })
                }
              />
              <button
                className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-lg font-medium"
                type="submit"
              >
                Sign Up
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-6">
              Already have an account?{" "}
              <button
                className="text-white underline"
                onClick={() => setIsSignUp(false)}
              >
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

const InputField: FC<InputFieldProps> = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && (
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
    )}
    <input
      {...props}
      className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
    />
  </div>
);

const PasswordField: FC<
  InputFieldProps & { show: boolean; toggle: () => void }
> = ({ show, toggle, ...props }) => (
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
    <input
      {...props}
      type={show ? "text" : "password"}
      className="w-full bg-white/5 border border-white/10 pl-10 pr-10 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
    />
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
    >
      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  </div>
);
