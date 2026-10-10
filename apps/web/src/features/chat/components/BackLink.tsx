import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function BackLink() {
  return (
    <Link
      to="/"
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Início
    </Link>
  );
}
