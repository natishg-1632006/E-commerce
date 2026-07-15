import React, { useEffect } from 'react';
import { APP_NAME } from '../../../lib/constants';

export interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, children }) => {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);

  return <>{children || null}</>;
};

export default PageTitle;
