import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export const ScreenLoader = () => {
  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <Card className="w-80">
        <CardContent className="flex flex-col items-center space-y-6 p-8">
          <div className="relative">
            <Spinner className="size-12" />
            <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full"></div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Loading</h3>
            <p className="text-muted-foreground text-sm">
              Please wait while we prepare your content...
            </p>
          </div>

          <div className="flex space-x-1">
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
            <div className="bg-primary h-2 w-2 animate-bounce rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
