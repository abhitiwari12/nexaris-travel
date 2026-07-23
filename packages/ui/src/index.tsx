import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: Array<string | false | null | undefined>): string { return twMerge(clsx(inputs)); }
export function Button({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) { return <button className={cn('rounded-2xl px-4 py-3 font-bold transition hover:scale-[1.01]', className)} {...props}>{children}</button>; }
