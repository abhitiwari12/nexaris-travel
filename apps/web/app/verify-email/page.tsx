import { AuthCard } from '../../components/auth-card';
import { AuthForm } from '../../components/auth-form';
export default function VerifyEmailPage() { return <AuthCard title="Verify email" subtitle="Confirm your account with the token sent by Nexaris."><AuthForm action="/auth/verify-email" cta="Verify account" fields={[{ name: 'token', label: 'Verification token', placeholder: 'Paste token' }]} /></AuthCard>; }
