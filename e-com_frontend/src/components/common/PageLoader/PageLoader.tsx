import React from 'react';
import { Spinner } from '../../ui/Spinner';

export const PageLoader: React.FC = () => {
  return <Spinner fullScreen size="lg" />;
};

export default PageLoader;
