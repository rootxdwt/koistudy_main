import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar';
import { wrapper } from '@/lib/store';
import { Provider, useSelector } from 'react-redux';
import { StateType, persistor } from '@/lib/store';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { DarkTheme, LightTheme } from '@/lib/ui/theme';
import { PersistGate } from 'redux-persist/integration/react';

const ThemeProvider = ({ children }: { children: any }) => {
  const isDark = useSelector<StateType, boolean>(state => state.theme);
  return (
    <StyledThemeProvider theme={isDark ? DarkTheme : LightTheme}>
      {children}
    </StyledThemeProvider>
  )
}

export default function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);

  return (
    <>
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null}>
          <ThemeProvider>
            <NextNProgress options={{ showSpinner: false }} color={"#808080"} />
            <Component {...props.pageProps} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </>)
}
