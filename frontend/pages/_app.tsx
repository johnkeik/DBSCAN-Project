import AuthProvider from "@/context/AuthContext";
import "../styles/global.css";
import type { AppProps } from "next/app";
import "../public/styles.css";
import Head from "next/head";
import HeaderComponent from "@/components/Header";

export default function App({
  Component,
  pageProps,
  router,
}: AppProps): JSX.Element {
  return (
    <AuthProvider>
      <Head>
        <title>DBSCAN WebApp</title>
      </Head>
      <div className="min-h-screen ">
        <HeaderComponent />
        <div className="min-h-screen w-full pt-[200px]">
          <Component {...pageProps} />
        </div>
      </div>
    </AuthProvider>
  );
}
