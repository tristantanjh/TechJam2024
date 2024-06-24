import { Mail } from "./components/mail";
import { accounts } from "./data";

export default function MainPage() {
  return (
    <>
      <div className="h-[100vh] hidden flex-col md:flex">
        <Mail accounts={accounts} navCollapsedSize={6} />
      </div>
    </>
  );
}
