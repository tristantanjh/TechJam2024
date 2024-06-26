import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col justify-start m-10">
        <h1 className="text-4xl font-bold text-primary">Settings</h1>
        <div className="flex items-start gap-2 mt-11">
          <nav className="grid gap-4 text-sm w-[15vw] text-muted-foreground">
            <Link className="font-semibold text-primary">General</Link>
            <Link>Security</Link>
            <Link>Integrations</Link>
            <Link>Support</Link>
            <Link>Organizations</Link>
            <Link>Advanced</Link>
          </nav>
          <div className="flex flex-col w-[50vw] items-center gap-2 ">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Store Name</CardTitle>
                <CardDescription>
                  Used to identify your store in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <Input placeholder="Store Name" />
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Store Name</CardTitle>
                <CardDescription>
                  Used to identify your store in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <Input placeholder="Store Name" />
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
