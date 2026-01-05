export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
            {/* Hero Skeleton */}
            <div className="h-[60vh] bg-stone-200 rounded-xl w-full"></div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2 space-y-6">
                    <div className="h-48 bg-stone-200 rounded-xl"></div>
                    <div className="h-48 bg-stone-200 rounded-xl"></div>
                    <div className="h-48 bg-stone-200 rounded-xl"></div>
                </div>
                <div className="col-span-1 space-y-4">
                    <div className="h-64 bg-stone-200 rounded-xl"></div>
                    <div className="h-64 bg-stone-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}
