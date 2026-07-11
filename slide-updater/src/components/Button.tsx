import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'disabled'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, icon, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-medium transition-all duration-200 flex items-center gap-2 justify-center rounded-lg'

    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-neutral-400 disabled:cursor-not-allowed',
      secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:border-neutral-400 disabled:text-neutral-400 disabled:cursor-not-allowed',
      ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-neutral-400 disabled:cursor-not-allowed',
      disabled: 'bg-neutral-200 text-neutral-500 cursor-not-allowed opacity-60',
    }

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <span className="animate-spin">⌛</span> : icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
