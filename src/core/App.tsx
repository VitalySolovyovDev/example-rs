import { BrowserRouter } from 'react-router-dom';

import { Providers } from 'core/Providers';
import { Root } from 'pages/Root/Root';

export const App = () => (
  <Providers>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </Providers>
);
