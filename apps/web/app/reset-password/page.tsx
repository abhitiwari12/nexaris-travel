import { AuthCard } from '../../components/auth-card';
import { AuthForm } from '../../components/auth-form';
export default function ResetPasswordPage() { return <AuthCard title="Set new password" subtitle="Use the secure token from your email."><AuthForm action="/auth/reset-password" cta="Reset password" fields={[{ name: 'token', label: 'Reset token', placeholder: 'Paste token' }, { name: 'password', label: 'New password', type: 'password', placeholder: '12+ chars with symbols' }]} /></AuthCard>; }
