// // // import { useState } from "react";
// // // import { useNavigate, useLocation } from "react-router-dom";
// // // import { Eye, EyeOff, ChefHat, Lock, Mail } from "lucide-react";
// // // import toast from "react-hot-toast";
// // // import { useAuth } from "../../context/AuthContext.jsx";
// // // import api from "../../api/axios.js";

// // // export default function LoginPage() {
// // //   const { login }   = useAuth();
// // //   const navigate    = useNavigate();
// // //   const location    = useLocation();
// // //   const from        = location.state?.from?.pathname;

// // //   const [form,     setForm]     = useState({ email: "", password: "" });
// // //   const [showPass, setShowPass] = useState(false);
// // //   const [loading,  setLoading]  = useState(false);
// // //   const [errors,   setErrors]   = useState({});

// // //   const validate = () => {
// // //     const e = {};
// // //     if (!form.email)    e.email    = "Email is required";
// // //     if (!form.password) e.password = "Password is required";
// // //     setErrors(e);
// // //     return Object.keys(e).length === 0;
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     if (!validate()) return;
// // //     setLoading(true);
// // //     console.log("FORM DATA:", form);

// // // // try {
// // // //   const { data } = await api.post("/auth/login", form);
// // // //   console.log(data);
// // // // } catch (err) {
// // // //   console.log(err.response?.data);
// // // // }
// // //     try {
// // //       const { data } = await api.post("/auth/login", form);
// // //       console.log("Login response:", data);
// // //       console.log("Staff info:", data.meData);
// // //       login(data.user, data.accessToken);
// // //       toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

// // //       // Go to where they came from, or their role's home
// // //       const roleHome = { admin: "/admin", waiter: "/waiter", kitchen: "/kitchen" };
// // //       navigate(from || roleHome[data.staff.role] || "/admin", { replace: true });
// // //     } catch (err) {
// // //       const msg = err.response?.data?.message || "Login failed. Please try again.";
// // //       toast.error(msg);
// // //       if (err.response?.status === 401) {
// // //         setErrors({ password: "Invalid email or password" });
// // //       }
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50
// // //                     flex items-center justify-center p-4">
// // //       {/* Card */}
// // //       <div className="w-full max-w-md animate-slide-up">
// // //         {/* Logo */}
// // //         <div className="text-center mb-8">
// // //           <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center
// // //                           mx-auto mb-4 shadow-lg shadow-brand-500/30">
// // //             <ChefHat size={32} className="text-white" />
// // //           </div>
// // //           <h1 className="font-display text-3xl font-bold text-gray-900">RestaurantOS</h1>
// // //           <p className="text-gray-500 mt-2 text-sm">Sign in to your staff account</p>
// // //         </div>

// // //         {/* Form card */}
// // //         <div className="card p-8 shadow-xl shadow-gray-200/80">
// // //           <form onSubmit={handleSubmit} noValidate className="space-y-5">
// // //             {/* Email */}
// // //             <div>
// // //               <label className="label">Email address</label>
// // //               <div className="relative">
// // //                 <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
// // //                 <input
// // //                   type="email"
// // //                   placeholder="you@restaurant.com"
// // //                   value={form.email}
// // //                   onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
// // //                   className={`input pl-10 ${errors.email ? "input-error" : ""}`}
// // //                   autoComplete="email"
// // //                   autoFocus
// // //                 />
// // //               </div>
// // //               {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
// // //             </div>

// // //             {/* Password */}
// // //             <div>
// // //               <label className="label">Password</label>
// // //               <div className="relative">
// // //                 <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
// // //                 <input
// // //                   type={showPass ? "text" : "password"}
// // //                   placeholder="••••••••"
// // //                   value={form.password}
// // //                   onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: "" })); }}
// // //                   className={`input pl-10 pr-11 ${errors.password ? "input-error" : ""}`}
// // //                   autoComplete="current-password"
// // //                 />
// // //                 <button type="button" onClick={() => setShowPass(!showPass)}
// // //                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
// // //                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
// // //                 </button>
// // //               </div>
// // //               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
// // //             </div>

// // //             {/* Submit */}
// // //             <button type="submit" disabled={loading}
// // //               className="btn-primary btn-lg w-full mt-2">
// // //               {loading
// // //                 ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// // //                 : "Sign In"
// // //               }
// // //             </button>
// // //           </form>

// // //           {/* Demo accounts hint (remove in production) */}
// // //           <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
// // //             <p className="text-xs font-medium text-gray-500 mb-2">Demo accounts:</p>
// // //             <div className="space-y-1 text-xs text-gray-400 font-mono">
// // //               <p>admin@restaurant.com  / Admin@123</p>
// // //               <p>waiter@restaurant.com / Waiter@123</p>
// // //               <p>kitchen@restaurant.com / Kitchen@123</p>
// // //             </div>
// // //           </div>
// // //         </div>

// // //         <p className="text-center text-xs text-gray-400 mt-6">
// // //           RestaurantOS v1.0 · Staff Portal
// // //         </p>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { Eye, EyeOff, ChefHat, Lock, Mail } from "lucide-react";
// // import toast from "react-hot-toast";
// // import { useAuth } from "../../context/AuthContext.jsx";
// // import api from "../../api/axios.js";

// // export default function LoginPage() {
// //   const { login }   = useAuth();
// //   const navigate    = useNavigate();
// //   const location    = useLocation();
// //   const from        = location.state?.from?.pathname;

// //   const [form,     setForm]     = useState({ email: "", password: "" });
// //   const [showPass, setShowPass] = useState(false);
// //   const [loading,  setLoading]  = useState(false);
// //   const [errors,   setErrors]   = useState({});

// //   const validate = () => {
// //     const e = {};
// //     if (!form.email)    e.email    = "Email is required";
// //     if (!form.password) e.password = "Password is required";
// //     setErrors(e);
// //     return Object.keys(e).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!validate()) return;
// //     setLoading(true);
// //     try {
// //       const { data } = await api.post("/auth/login", form);

// //       // Backend may return data.staff or data.user — handle both
// //       const staffUser = data.staff || data.user;

// //       if (!staffUser) {
// //         toast.error("Login failed: no user data returned.");
// //         return;
// //       }

// //       login(staffUser, data.accessToken);
// //       toast.success(`Welcome back, ${staffUser.name.split(" ")[0]}!`);

// //       const roleHome = { admin: "/admin", waiter: "/waiter", kitchen: "/kitchen" };
// //       navigate(from || roleHome[staffUser.role] || "/admin", { replace: true });
// //     } catch (err) {
// //       const msg = err.response?.data?.message || "Login failed. Please try again.";
// //       toast.error(msg);
// //       if (err.response?.status === 401) {
// //         setErrors({ password: "Invalid email or password" });
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50
// //                     flex items-center justify-center p-4">
// //       <div className="w-full max-w-md animate-slide-up">
// //         {/* Logo */}
// //         <div className="text-center mb-8">
// //           <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center
// //                           mx-auto mb-4 shadow-lg shadow-brand-500/30">
// //             <ChefHat size={32} className="text-white" />
// //           </div>
// //           <h1 className="font-display text-3xl font-bold text-gray-900">RestaurantOS</h1>
// //           <p className="text-gray-500 mt-2 text-sm">Sign in to your staff account</p>
// //         </div>

// //         {/* Form card */}
// //         <div className="card p-8 shadow-xl shadow-gray-200/80">
// //           <form onSubmit={handleSubmit} noValidate className="space-y-5">

// //             {/* Email */}
// //             <div>
// //               <label htmlFor="email" className="label">Email address</label>
// //               <div className="relative">
// //                 <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
// //                 <input
// //                   id="email"
// //                   name="email"
// //                   type="email"
// //                   placeholder="you@restaurant.com"
// //                   value={form.email}
// //                   onChange={(e) => {
// //                     setForm((p) => ({ ...p, email: e.target.value }));
// //                     setErrors((p) => ({ ...p, email: "" }));
// //                   }}
// //                   className={`input pl-10 ${errors.email ? "input-error" : ""}`}
// //                   autoComplete="email"
// //                   autoFocus
// //                 />
// //               </div>
// //               {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
// //             </div>

// //             {/* Password */}
// //             <div>
// //               <label htmlFor="password" className="label">Password</label>
// //               <div className="relative">
// //                 <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
// //                 <input
// //                   id="password"
// //                   name="password"
// //                   type={showPass ? "text" : "password"}
// //                   placeholder="••••••••"
// //                   value={form.password}
// //                   onChange={(e) => {
// //                     setForm((p) => ({ ...p, password: e.target.value }));
// //                     setErrors((p) => ({ ...p, password: "" }));
// //                   }}
// //                   className={`input pl-10 pr-11 ${errors.password ? "input-error" : ""}`}
// //                   autoComplete="current-password"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowPass(!showPass)}
// //                   aria-label={showPass ? "Hide password" : "Show password"}
// //                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                 >
// //                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
// //                 </button>
// //               </div>
// //               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
// //             </div>

// //             {/* Submit */}
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className="btn-primary btn-lg w-full mt-2"
// //             >
// //               {loading
// //                 ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
// //                 : "Sign In"
// //               }
// //             </button>
// //           </form>

// //           {/* Demo accounts */}
// //           <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
// //             <p className="text-xs font-medium text-gray-500 mb-2">Demo accounts:</p>
// //             <div className="space-y-1 text-xs text-gray-400 font-mono">
// //               <p>admin@restaurant.com &nbsp;/ Admin@123</p>
// //               <p>waiter@restaurant.com / Waiter@123</p>
// //               <p>kitchen@restaurant.com / Kitchen@123</p>
// //             </div>
// //             <p className="text-xs text-gray-300 mt-2 italic">
// //               Create these accounts in MongoDB or use the seeder.
// //             </p>
// //           </div>
// //         </div>

// //         <p className="text-center text-xs text-gray-400 mt-6">
// //           RestaurantOS v1.0 · Staff Portal
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Eye, EyeOff, ChefHat, Lock, Mail } from "lucide-react";
// import toast from "react-hot-toast";
// import { useAuth } from "../../context/AuthContext.jsx";
// import api from "../../api/axios.js";

// export default function LoginPage() {
//   const { login }   = useAuth();
//   const navigate    = useNavigate();
//   const location    = useLocation();
//   const from        = location.state?.from?.pathname;

//   const [form,     setForm]     = useState({ email: "", password: "" });
//   const [showPass, setShowPass] = useState(false);
//   const [loading,  setLoading]  = useState(false);
//   const [errors,   setErrors]   = useState({});

//   const validate = () => {
//     const e = {};
//     if (!form.email)    e.email    = "Email is required";
//     if (!form.password) e.password = "Password is required";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const { data } = await api.post("/auth/login", form);

//       // Backend may return data.staff or data.user — handle both
//       const staffUser = data.staff || data.user;

//       if (!staffUser) {
//         toast.error("Login failed: no user data returned.");
//         return;
//       }

//       login(staffUser, data.accessToken);
//       toast.success(`Welcome back, ${staffUser.name.split(" ")[0]}!`);

//       const roleHome = { admin: "/admin", waiter: "/waiter", kitchen: "/kitchen" };
//       navigate(from || roleHome[staffUser.role] || "/admin", { replace: true });
//     } catch (err) {
//       const msg = err.response?.data?.message || "Login failed. Please try again.";
//       toast.error(msg);
//       if (err.response?.status === 401) {
//         setErrors({ password: "Invalid email or password" });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-orange-50
//                     flex items-center justify-center p-4">
//       <div className="w-full max-w-md animate-slide-up">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center
//                           mx-auto mb-4 shadow-lg shadow-brand-500/30">
//             <ChefHat size={32} className="text-white" />
//           </div>
//           <h1 className="font-display text-3xl font-bold text-gray-900">RestaurantOS</h1>
//           <p className="text-gray-500 mt-2 text-sm">Sign in to your staff account</p>
//         </div>

//         {/* Form card */}
//         <div className="card p-8 shadow-xl shadow-gray-200/80">
//           <form onSubmit={handleSubmit} noValidate className="space-y-5">

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="label">Email address</label>
//               <div className="relative">
//                 <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="you@restaurant.com"
//                   value={form.email}
//                   onChange={(e) => {
//                     setForm((p) => ({ ...p, email: e.target.value }));
//                     setErrors((p) => ({ ...p, email: "" }));
//                   }}
//                   className={`input pl-10 ${errors.email ? "input-error" : ""}`}
//                   autoComplete="email"
//                   autoFocus
//                 />
//               </div>
//               {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="label">Password</label>
//               <div className="relative">
//                 <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//                 <input
//                   id="password"
//                   name="password"
//                   type={showPass ? "text" : "password"}
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={(e) => {
//                     setForm((p) => ({ ...p, password: e.target.value }));
//                     setErrors((p) => ({ ...p, password: "" }));
//                   }}
//                   className={`input pl-10 pr-11 ${errors.password ? "input-error" : ""}`}
//                   autoComplete="current-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass(!showPass)}
//                   aria-label={showPass ? "Hide password" : "Show password"}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary btn-lg w-full mt-2"
//             >
//               {loading
//                 ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 : "Sign In"
//               }
//             </button>
//           </form>

//           {/* Demo accounts */}
//           <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
//             <p className="text-xs font-medium text-gray-500 mb-2">Demo accounts:</p>
//             <div className="space-y-1 text-xs text-gray-400 font-mono">
//               <p>admin@restaurant.com &nbsp;/ Admin@123</p>
//               <p>waiter@restaurant.com / Waiter@123</p>
//               <p>kitchen@restaurant.com / Kitchen@123</p>
//             </div>
//             <p className="text-xs text-gray-300 mt-2 italic">
//               Create these accounts in MongoDB or use the seeder.
//             </p>
//           </div>
//         </div>

//         <p className="text-center text-xs text-gray-400 mt-6">
//           RestaurantOS v1.0 · Staff Portal
//         </p>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ChefHat, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

const ROLE_HOME = { admin: "/admin", waiter: "/waiter", kitchen: "/kitchen" };

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname;

  const [form,       setForm]       = useState({ email: "", password: "" });
  const [showPass,   setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  // KEY FIX: navigate AFTER user state is committed to context
  // Calling navigate() right after login() causes infinite loop because
  // GuestRoute re-renders before React finishes committing the new user state.
  // useEffect(() => {
  //   if (!loading && user) {
  //     navigate(from || ROLE_HOME[user.role] || "/admin", { replace: true });
  //   }
  // }, [user, loading]); // eslint-disable-line
// In LoginPage.jsx — replace your existing useEffect with this:
const navigatedRef = useRef(false);

useEffect(() => {
  if (!loading && user && !navigatedRef.current) {
    navigatedRef.current = true;
    navigate(from || ROLE_HOME[user.role] || "/admin", { replace: true });
  }
}, [user, loading]); // eslint-disable-line
  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      const staffUser = data.staff || data.user;
      if (!staffUser) { toast.error("Login failed: no user data."); return; }
login({ ...staffUser, role: staffUser.role.toLowerCase() }, data.accessToken);
      toast.success(`Welcome, ${staffUser.name.split(" ")[0]}!`);
      // DO NOT call navigate() here - useEffect above handles it safely
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      toast.error(msg);
      if (err.response?.status === 401) setErrors({ password: "Invalid email or password" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <ChefHat size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">RestaurantOS</h1>
          <p className="text-gray-500 mt-2 text-sm">Staff Portal</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-email" name="email" type="email" autoComplete="email" autoFocus
                  placeholder="staff@restaurant.com" value={form.email}
                  onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }}
                  className={`w-full border rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all bg-white text-gray-900 placeholder-gray-400 ${errors.email ? "border-red-400 focus:ring-2 focus:ring-red-400/20" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="login-password" name="password" type={showPass ? "text" : "password"} autoComplete="current-password"
                  placeholder="••••••••" value={form.password}
                  onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: "" })); }}
                  className={`w-full border rounded-xl px-4 py-3 pl-10 pr-11 text-sm outline-none transition-all bg-white text-gray-900 placeholder-gray-400 ${errors.password ? "border-red-400 focus:ring-2 focus:ring-red-400/20" : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"}`}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} aria-label="Toggle password"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-orange-500/25">
              {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Click to fill demo credentials</p>
            {[
              { role: "Admin",   email: "admin@restaurant.com",   pass: "admin123"   },
              { role: "Waiter",  email: "waiter@restaurant.com",  pass: "Waiter@123"  },
              { role: "Kitchen", email: "kitchen@restaurant.com", pass: "Kitchen@123" },
            ].map(({ role, email, pass }) => (
              <button key={role} type="button" onClick={() => setForm({ email, password: pass })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <span className="text-xs font-medium text-gray-600">{role}</span>
                <span className="text-xs font-mono text-gray-400">{email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}