import { AuthCard } from '../../components/auth-card';
import { AuthForm } from '../../components/auth-form';
export default function ForgotPasswordPage() { return <AuthCard title="Reset access" subtitle="We will send a secure reset token if your email exists."><AuthForm action="/auth/forgot-password" cta="Send reset token" fields={[{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' }]} /></AuthCard>; }
