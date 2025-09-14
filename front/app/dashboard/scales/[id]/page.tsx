"use client";
import { Card } from "@/components/ui/";

import { Clock, MapPin, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

import { ScaleAdd } from "@/components/scale/scale-add";
import { singleScale } from "@/services/scale.service";
import { SingleScale } from "@/types";

export default function ScaleSinglePage() {
  const router = useRouter();
  const id = router.query.id as string;
  const {
    data: scale,
    refetch
  } = useQuery({
    queryKey: ["scales list"],
    queryFn: () => singleScale(id)
  });
  return (
    <div className="z-0 mx-auto py-6 container">
      {scale && <ScaleItem data={scale}/>}
      <div style={{ height: 150 }}></div>
      <div style={{ position: "fixed", bottom: 50, left: "50%", transform: "translateX(-50%)" }} className="justify-center items-center md:hidden">
        <ScaleAdd refetch={refetch} />
      </div>
    </div>
  );
}

const ScaleItem = ({ data }: { data: SingleScale }) => {
  const { id, name, direction, date } = data;
  return (
    <div className="gap-8">
      <Card key={id} className="md:p-2 p-0 flex-row flex align-center justify-between items-center w-full my-4">
        <div className="flex flex-row items-center gap-2">
          <div className="flex-col flex px-2 py-4 gap-2 sm:px-0 sm:py-0">
            <div className="flex-row flex gap-2">
              <div className="flex-row flex gap-2 items-center">
                <Clock size={16} />
                <span className="text-[12px] md:text-[18px] md:leading-[24px] leading-[12px] opacity-70"></span>
              </div>
              <div className="flex-row flex gap-2 items-center">
                <User size={16} />
                <span className="text-[12px] md:text-[18px] md:leading-[24px] leading-[12px] opacity-70">{name.length > 16 ? name.slice(0, 16) + "..." : name}</span>
              </div>
            </div>
            <div className="flex-row flex gap-2 items-center">
              <MapPin size={16} />
              <span className="text-[12px] md:text-[18px] md:leading-[24px] leading-[12px] opacity-70"></span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
