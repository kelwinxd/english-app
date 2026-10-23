import { createBrowserRouter } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Conversar } from '@/pages/Conversar';
import { Jogar } from '@/pages/Jogar';
import { Aprender } from '@/pages/Aprender';
import { Flashcards } from '@/pages/Flashcards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/conversar',
    element: <Conversar />,
  },
  {
    path: '/jogar',
    element: <Jogar />,
  },
  {
    path: '/aprender',
    element: <Aprender />,
  },
  {
    path: '/flashcards',
    element: <Flashcards />,
  },
]);
