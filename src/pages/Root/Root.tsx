import { useEffect } from 'react';
import { Route,Routes } from 'react-router-dom';
import FontFaceObserver from 'fontfaceobserver';

import { LoggedInLayout } from 'pages/LoggedInLayout/LoggedInLayout';

export function Root() {
  useEffect(() => {
    // fix MUI wrong styles before font loading
    // https://github.com/mui-org/material-ui/issues/16465
    // https://github.com/mui-org/material-ui/issues/9337#issuecomment-413789329
    new FontFaceObserver('Inter')
      // https://stackoverflow.com/questions/57051565/prefetch-works-but-throws-an-uncaught-in-promise-error
      .load(null, 15000)
      .then(() => window.dispatchEvent(new CustomEvent('resize')))
      .catch(() => window.dispatchEvent(new CustomEvent('resize')));
  }, []);

  return (
    <Routes>
      {/* There can be login routes */}
      <Route path="*" element={<LoggedInLayout />} />
    </Routes>
  );
}
