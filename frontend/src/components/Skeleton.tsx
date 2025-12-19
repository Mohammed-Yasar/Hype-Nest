const Skeleton = () => {
  return <div className="bg-gray-200 rounded animate-pulse-gentle h-64 w-full" />;
};

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse-gentle w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse-gentle w-1/2" />
        <div className="h-6 bg-gray-200 rounded animate-pulse-gentle w-1/3" />
      </div>
    </div>
  );
};

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton };
