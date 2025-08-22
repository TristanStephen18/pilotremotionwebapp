// import React, { ReactNode } from 'react';
import type{ ReactNode } from 'react';
import clsx from 'clsx';

export default function TwoPane({
  left,
  right,
  title,
  subtitle,
}: {
  left: ReactNode;
  right: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={clsx("bg-white rounded-2xl p-6 shadow-card border border-gray-100 min-h-[520px]")}>
          {left}
        </div>
        <div className="bg-white rounded-2xl p-0 shadow-card border border-gray-100 overflow-hidden">
          {right}
        </div>
      </div>
    </div>
  );
}
