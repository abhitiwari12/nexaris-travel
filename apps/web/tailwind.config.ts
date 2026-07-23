import type { Config } from 'tailwindcss';
const config: Config = { darkMode: 'class', content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#08111f', gold: '#f7c948' }, borderRadius: { '3xl': '2rem' } } }, plugins: [] };
export default config;
