import * as React from "react"
import Image from "next/image"
import { Button } from "../../components/ui/button"
import Link from "next/link"

export default function Gallery() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-8 p-2 container mx-auto flex flex-col justify-center items-center">
      <h1 className="text-xl2 font-bold text-center">Mapa de Salas</h1>
      <Image
        src={"/imgs/espaco.jpg"}
        alt="espaço"
        width={600}
        height={400}
        className="rounded-lg object-cover bg-gray-200 border"
        />
        <Link href="/"><Button>Voltar</Button></Link>
      </div>
    </div>
  )
}

/*

import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const items = [
  {
    image: "/espaco.jpg",
    title: "Imagem 1",
    description: "Descrição da primeira imagem no carrossel.",
  },
]
<Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardContent className="flex aspect-3/2 items-center justify-center p-2">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
 <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Lista de Itens</h2>
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-start space-x-4 p-4 bg-gray-100 rounded-lg">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                width={100}
                height={67}
                className="rounded object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
 */