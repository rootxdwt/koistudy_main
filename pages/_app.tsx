import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar';
import { wrapper } from '@/lib/store';
import { Provider } from 'react-redux';

export default function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    <>
      <Provider store={store}>
        <NextNProgress options={{ showSpinner: false }} color={"#808080"} />
        <Component {...props.pageProps} />
      </Provider>
    </>)
}
