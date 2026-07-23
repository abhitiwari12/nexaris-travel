import { AuthCard } from '../../components/auth-card';
import { AuthForm } from '../../components/auth-form';
export default function LoginPage() { return <AuthCard title="Welcome back" subtitle="Access your trips, saved travelers, and AI planning history."><AuthForm action="/auth/login" cta="Sign in" fields={[{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' }, { name: 'password', label: 'Password', type: 'password', placeholder: 'Your password' }]} /></AuthCard>; }
