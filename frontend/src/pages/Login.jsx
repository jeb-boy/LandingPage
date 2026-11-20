import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { api } from '../api/client';
export default function Login(){
 const navigate=useNavigate();const [mode,setMode]=useState('login');const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setError('');setMessage('');setBusy(true);try{
  if(mode==='signup'){if(password!==confirm)throw new Error('Passwords do not match.');await api.register({fullName:name,email,password});navigate('/');return;}
  if(mode==='forgot'){const r=await api.forgotPassword(email);setMessage(r.message);return;}
  await api.login({email,password});navigate('/');
 }catch(err){setError(err.message);}finally{setBusy(false);}}
 const title=mode==='signup'?'Create account':mode==='forgot'?'Forgot password':'Welcome back';
 return <div className="min-h-screen flex items-center justify-center p-4" style={{background:'#0A3D2A'}}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md px-8 py-10">
 <div className="flex items-center justify-center gap-2 mb-7"><img src={logo} alt="IDSC" className="w-10 h-10 rounded-full object-cover"/><span className="font-semibold text-gray-900 text-lg">IDS College</span></div>
 <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1><p className="text-sm text-gray-500 mb-5">{mode==='login'?'Sign in using your registered account.':mode==='signup'?'Create an account stored securely in the college database.':'Enter your registered email to request a secure reset link.'}</p>
 {error&&<p role="alert" className="mb-3 text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}{message&&<p role="status" className="mb-3 text-sm text-emerald-800 bg-emerald-50 rounded-lg p-3">{message}</p>}
 <form onSubmit={submit} className="space-y-4">
 {mode==='signup'&&<label className="block text-sm font-medium text-gray-700">Full name<input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-xl" required/></label>}
 <label className="block text-sm font-medium text-gray-700">Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-xl" autoComplete="email" required/></label>
 {mode!=='forgot'&&<label className="block text-sm font-medium text-gray-700">Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-xl" minLength={10} autoComplete={mode==='login'?'current-password':'new-password'} required/></label>}
 {mode==='signup'&&<label className="block text-sm font-medium text-gray-700">Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-xl" minLength={10} required/></label>}
 <button disabled={busy} className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-60" style={{background:'#1FA86B'}}>{busy?'Please wait...':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':'Login'}</button></form>
 <div className="mt-5 text-center text-sm space-y-2">{mode==='login'?<><button onClick={()=>{setMode('forgot');setError('');setMessage('')}} className="block mx-auto text-emerald-700">Forgot password?</button><span className="text-gray-500">Don't have an account? </span><button onClick={()=>{setMode('signup');setError('');setMessage('')}} className="font-medium text-emerald-700">Sign up</button></>:<button onClick={()=>{setMode('login');setError('');setMessage('')}} className="font-medium text-emerald-700">Back to Login</button>}</div>
 <p className="text-xs text-gray-400 text-center mt-6"><Link to="/" className="underline">Return to homepage</Link></p></div></div>;
}
