import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  const fetching = useIsFetching(); // fetching = 0 if no data is being fetched, fetching > 0 if data is being fetched

  return (
    <>
      <div id="main-header-loading">
        {fetching > 0 && <progress />}
      </div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
