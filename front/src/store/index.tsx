import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import { FLUSH, PAUSE, PERSIST, PersistConfig, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createRootReducer, RootState } from '../reducers';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

export const history = createBrowserHistory();

const persistConfig = {
  key: 'AppStore',
  storage,
  whitelist: ['sesion'],
} as PersistConfig<RootState>;

const persistedReducer = persistReducer(persistConfig, createRootReducer(history));

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([/* logger,  */ routerMiddleware(history)]),
  devTools: process.env.NODE_ENV !== 'production',
  // middleware: [logger, thunk, routerMiddleware(history)]
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
