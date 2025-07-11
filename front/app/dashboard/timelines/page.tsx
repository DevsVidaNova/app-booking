"use client";
import TimelineShow from "@/components/timeline/timeline-show";

const eventData = {
  id: "1",
  title: "Culto de Domingo",
  description: "Com a presença do pastor fulano",
  date: "2025-03-24",
  startTime: "19:00",
  endTime: "21:00",
  room: "TEMPLO",
  status: "unstarted",
  sections: [
    {
      title: "Antes do culto",
      description: "Ensaio da Banda",
      startTime: "18:00",
      endTime: "19:00",
      playlist: [
        {
          title: "NADA MAIS - FHOP (ENSAIO)",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=N5AMmLZjaaM"
        },
        {
          title: "OS QUE OLHAM PARA TI - FHOP (ENSAIO)",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=Dv-7mBQNEIo"
        }
      ]
    },
    {
      title: "Prelúdio",
      description: "LOUVOR COM A BANDA",
      startTime: "19:00",
      endTime: "19:20",
      presentation: "https://drive.google.com/drive/folders/67890",
      playlist: [
        {
          title: "NADA MAIS - FHOP",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=N5AMmLZjaaM"
        },
        {
          title: "OS QUE OLHAM PARA TI - FHOP",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=Dv-7mBQNEIo"
        }
      ]
    },
    {
      title: "Culto",
      description: "PREGAÇÃO DO PASTOR FULANO",
      startTime: "19:20",
      endTime: "20:45",
      presentation: "https://drive.google.com/drive/folders/54321",
      playlist: []
    },
    {
      title: "Póslúdio",
      description: "AVISOS E DESPEDIDA",
      startTime: "20:45",
      endTime: "21:00",
      presentation: "https://drive.google.com/drive/folders/98765",
      playlist: [
        {
          title: "NADA MAIS - FHOP (AO VIVO)",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=N5AMmLZjaaM"
        },
        {
          title: "OS QUE OLHAM PARA TI - FHOP",
          description: "FULANO DE TAL, FULANO DE TAL E CICLANO",
          url: "https://www.youtube.com/watch?v=Dv-7mBQNEIo"
        }
      ]
    }
  ]
};

export default function TimelinePage() {
  return <div className="z-0 py-6 container mx-auto"></div>;
}

//         <TimelineShow eventData={eventData} />
