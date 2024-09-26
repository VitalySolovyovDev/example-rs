import { Route, Navigate, Routes } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { BotsPage } from './BotsPage/BotsPage';

export const BotsLayout = observer(function BotsLayout() {
  return (
    <Routes>
      <Route path="/" element={<BotsPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
});
