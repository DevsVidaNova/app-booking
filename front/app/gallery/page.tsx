import * as React from "react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function GalleryPage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-8 p-2 container mx-auto flex flex-col justify-center items-center">
        <h1 className="text-xl2 font-bold text-center">Mapa de Salas</h1>
        <Image src={"/imgs/espaco.jpg"} alt="espaço" width={600} height={400} className="rounded-lg object-cover bg-gray-200 border" />
        <Link href="/">
          <Button>Voltar</Button>
        </Link>
      </div>
    </div>
  );
}
