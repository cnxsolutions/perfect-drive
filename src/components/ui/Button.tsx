import { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={twMerge(
                clsx(
                    'inline-flex items-center justify-center rounded-lg transition-all duration-300 font-oswald uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed',
                    {
                        'bg-white text-black hover:bg-alpine hover:text-white hover:shadow-[0_0_30px_rgba(0,81,255,0.4)]': variant === 'primary',
                        'border border-white/10 bg-white/5 hover:bg-white/10 text-white': variant === 'outline',
                        'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white': variant === 'ghost',
                        'px-3 py-1.5 text-xs': size === 'sm',
                        'px-6 py-3 text-sm': size === 'md',
                        'px-8 py-4 text-base': size === 'lg',
                    },
                    className
                )
            )}
            {...props}
        />
    );
});

Button.displayName = 'Button';
export { Button };
