"use client";

import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

export default function FileCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex flex-col h-full">
        <Skeleton variant="text" width="70%" height="24px" className="mb-2" />
        <Skeleton variant="text" width="100%" height="16px" className="mb-4" />
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="80px" height="14px" />
            <Skeleton variant="text" width="100px" height="14px" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="80px" height="14px" />
            <Skeleton variant="text" width="120px" height="14px" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <Skeleton variant="text" width="60px" height="14px" />
            <Skeleton variant="text" width="30px" height="14px" />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </div>
      </div>
    </Card>
  );
}

