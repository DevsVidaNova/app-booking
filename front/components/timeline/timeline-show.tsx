import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Music } from "lucide-react";

interface PlaylistItem {
  title: string;
  description: string;
  url: string;
}

interface Section {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  presentation: string;
  playlist: PlaylistItem[];
}

interface TimelineShowProps {
  eventData: {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    status: string;
    sections: Section[];
  };
}

const TimelineShow: FC<TimelineShowProps> = ({ eventData }) => {
  const dateName = new Date(eventData.date).toLocaleDateString('pt-BR', { weekday: 'short' })
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex-col flex mb-4">
        <CardTitle className="text-[32px] font-bold">{eventData.title}</CardTitle>
        <div className="flex flex-col">
          <CardDescription className="text-sm">{eventData.description}</CardDescription>
          <div className="flex-row flex gap-2 mt-2">
            <p className="px-4 pb-2 pt-[9px] text-[14px] bg-amber-500 text-white font-semibold rounded-full">{eventData.date.slice(8, 10) + '/' + eventData.date.slice(5, 7)}</p>
            <p className="px-4 py-2 text-[14px] border-amber-500 text-amber-500 border-2 font-semibold rounded-full">{dateName}</p>
            <p className="px-4 pb-2 pt-[9px] text-[14px]  bg-amber-500 text-white font-semibold rounded-full">{eventData.startTime}</p>
          </div>
        </div>
      </div>

      <h2 className="text-[24px] font-bold mb-2">Cronograma</h2>
      <div className="space-y-8 border-t pt-2">
        <Accordion type="multiple"  >
          {eventData.sections.map((section, index) => (
            <div key={index} >
              <AccordionItem value={'item-' + index} defaultValue='open' className="border-none">
                <AccordionTrigger className="bg-gray-50 px-4 rounded-[6px] mb-2 ">
                  <h3 className="text-[16px] font-semibold ">{section.title}</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="">
                    <p className="text-sm font-semibold">{section.description}</p>
                    <div className="text-sm text-gray-600">
                      <p>{`Início: ${section.startTime} - Término: ${section.endTime}`}</p>
                      {section.presentation && <p>{`Apresentação: ${section.presentation}`}</p>}
                    </div>
                    {section?.playlist?.length > 0 && <div className="space-y-2">
                      <p className="font-semibold">Playlist</p>
                      {section.playlist.length === 0 ? (
                        <p className="text-sm text-gray-500">Sem itens na playlist</p>
                      ) : (
                        <div className="space-y-2">
                          {section.playlist.map((item, pIndex) => (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              <div key={pIndex} className=" rounded-md my-2 flex flex-row bg-amber-50 px-4 py-2 items-center gap-4">
                                <Music size={24} className="text-amber-500" />
                                <div className="flex-col flex text-amber-500">
                                  <h4 className="font-semibold">{item.title}</h4>
                                  <p className="text-sm">{item.description}</p>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    }
                  </div>
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
      <div style={{ position: 'fixed', bottom: 50, left: '50%', transform: 'translateX(-50%)' }} className='justify-center items-center md:hidden'>
        <Button variant="default">
          Participar do Evento
        </Button>
      </div>
    </div>
  );
};

export default TimelineShow;
