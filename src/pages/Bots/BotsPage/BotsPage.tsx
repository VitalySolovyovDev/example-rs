import { observer } from 'mobx-react-lite';

import { BotsForm } from 'pages/Bots/BotsForm/BotsForm';

/**
 * Page logic layer integrates features
 */
export const BotsPage = observer(function BotsPage() {

  return <BotsForm />;
});