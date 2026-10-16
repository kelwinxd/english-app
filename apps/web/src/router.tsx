import { createBrowserRouter } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Conversar } from '@/pages/Conversar';
import { Jogar } from '@/pages/Jogar';
import { Aprender } from '@/pages/Aprender';

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
]);
