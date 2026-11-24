import { LoaderCircle } from "lucide-react";

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <LoaderCircle className="size-8 animate-spin text-moss" />
  </div>
);

export default PageLoader;
