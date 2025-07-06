import { SearchInput } from "@/components/search-input";
import { Suspense } from "react";

const RootPage = () => {
    return ( 
        <div className="h-full p-4 space-y-2">
            <Suspense fallback={
                <div className="relative">
                    <div className="absolute h-4 w-4 top-3 left-4 text-muted-foreground" />
                    <div className="pl-10 bg-primary/10 h-10 rounded-md animate-pulse bg-gray-200" />
                </div>
            }>
                <SearchInput />
            </Suspense>
        </div>
     );
}
 
export default RootPage;