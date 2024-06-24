import { Menu } from "@/CustomComponents/Menu";
import { Sidebar } from "@/CustomComponents/Sidebar";

export default function MainPage() {
  return (
    <>
      <div className="md:hidden">
        <img
          src=""
          width={1280}
          height={1114}
          alt="Music"
          className="block dark:hidden"
        />
        <img
          src=""
          width={1280}
          height={1114}
          alt="Music"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden md:block">
        <Menu />
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-5">
              <Sidebar className="hidden lg:block" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
