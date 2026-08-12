import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
export default Layout;