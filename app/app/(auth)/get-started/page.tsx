import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Login } from "./login";
import { Register } from "./register";
export default function GetStarted() {
  return (
    <div className="mx-auto flex h-screen w-screen max-w-lg items-center justify-center px-2 py-4 md:max-w-2xl lg:max-w-6xl">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl font-bold">
            Get Started with Go<span className="text-primary">Docs</span>
          </h1>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="register">
            <TabsList>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="register">
              <Register />
            </TabsContent>
            <TabsContent value="login">
              <Login />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
