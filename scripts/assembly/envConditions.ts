const {
  NODE_ENV,
  WATCH_MODE,
} = process.env;

const isProduction = NODE_ENV === 'production' && WATCH_MODE !== 'true';
const isLiveReload = !isProduction;

export {
  isProduction,
  isLiveReload,
};

