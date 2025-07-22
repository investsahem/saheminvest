import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  hover = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200 shadow-sm"
  const hoverClasses = hover ? "hover:shadow-md transition-shadow duration-200" : ""
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  const baseClasses = "px-6 py-4 border-b border-gray-200"
  const classes = `${baseClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  const baseClasses = "p-6"
  const classes = `${baseClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
} 