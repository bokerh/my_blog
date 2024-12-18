import "./global.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="bg-blue-800 text-rose-400">aaaa</div>
      <Component {...pageProps} />
    </>
  );
}
