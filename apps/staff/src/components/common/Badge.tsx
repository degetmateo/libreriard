import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'cyan' | 'green' | 'amber' | 'red' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'slate' }) => {
  const styles = {
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    red: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
      {label}
    </span>
  );
};

