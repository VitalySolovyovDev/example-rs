import { useEffect } from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { useFeature } from 'features/featureProvider';
import { lazyfy } from 'shared/helpers/lazyfy';

import styles from './LoggedInLayout.module.scss';

const { BotsLayoutLazy } = lazyfy(
  () => import('../Bots/BotsLayout'),
  'BotsLayout',
  { preload: true },
);

export const LoggedInLayout = observer(function LoggedInLayout() {
    const { subscribeToBots } = useFeature('bots');

    // subscribe to some data
    useEffect(() => {
      subscribeToBots();
    }, []);

    return (
      <main className={styles.loggedInLayout}>
        <div
          className={styles.content}
        >
          <Routes>
            <Route
              path="bot/*"
              element={
                <BotsLayoutLazy />
              }
            />
            <Route path="*" element={<Navigate to="/bot" replace />} />
          </Routes>
        </div>
      </main>
    );
  }
);
