import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Foto de perfil com fallback para as iniciais, caso a imagem não carregue. */
export function Avatar({
  src,
  name,
  size = 48,
  className,
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const style = { width: size, height: size };

  if (failed || !src) {
    return (
      <span
        style={style}
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary',
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      style={style}
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full object-cover', className)}
    />
  );
}
