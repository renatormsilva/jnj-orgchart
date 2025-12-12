import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  const sizeStyles = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeStyles[size]} border-4 border-jnj-gray-400 border-t-jnj-red rounded-full animate-spin`}
      ></div>
      {text && <p className="mt-4 text-jnj-gray-700">{text}</p>}
    </div>
  );
};

export const LoadingFullScreen: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <Loading size="lg" text={text} />
    </div>
  );
};
