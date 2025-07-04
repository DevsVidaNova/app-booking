import { useForm, Controller, useFieldArray, SubmitHandler, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

interface EventFormData {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: string;
  sections: Section[];
}

const initialSection = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  presentation: "",
  playlist: []
};

export default function EventForm() {
  const { control, handleSubmit, register } = useForm<EventFormData>({
    defaultValues: {
      id: "",
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      room: "",
      status: "não iniciado",
      sections: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections"
  });

  const onSubmit: SubmitHandler<EventFormData> = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {[ 
        { name: "id", label: "ID" },
        { name: "title", label: "Título" },
        { name: "description", label: "Descrição" },
        { name: "date", label: "Data", type: "date" },
        { name: "startTime", label: "Hora de Início", type: "time" },
        { name: "endTime", label: "Hora de Término", type: "time" },
        { name: "room", label: "Sala" },
        { name: "status", label: "Status" }
      ].map(({ name, label, type } ) => (
        <div key={name}>
          <Label htmlFor={name}>{label}</Label>
          <Input {...register(name)} id={name} type={type} placeholder={`Digite ${label}`} />
        </div>
      ))}

      <div className="space-y-4">
        <Label>Seções</Label>
        {fields.map((field, index) => (
          <Section key={field.id} index={index} control={control} register={register} remove={remove} />
        ))}
      </div>

      <Button type="button" onClick={() => append(initialSection)}>
        Adicionar Seção
      </Button>
      <Button type="submit" className="bg-blue-500 text-white">
        Enviar
      </Button>
    </form>
  );
}

function Section({ index, control, register, remove }: { index: number, control: any, register: any, remove: any }) {
  const { fields: playlistFields, append: appendPlaylist, remove: removePlaylist } = useFieldArray({
    control,
    name: `sections.${index}.playlist`
  });

  return (
    <div className="border p-4 rounded-md space-y-2">
      {[ 
        { name: "title", label: "Título da Seção" },
        { name: "description", label: "Descrição" },
        { name: "startTime", label: "Hora de Início", type: "time" },
        { name: "endTime", label: "Hora de Término", type: "time" },
        { name: "presentation", label: "Apresentação" }
      ].map(({ name, label, type }) => (
        <div key={name}>
          <Label htmlFor={`sections.${index}.${name}`}>{label}</Label>
          <Input {...register(`sections.${index}.${name}`)} type={type} placeholder={`Digite ${label}`} />
        </div>
      ))}

      <div className="space-y-2">
        <Label>Playlist</Label>
        <Button type="button" onClick={() => appendPlaylist({ title: "", description: "", url: "" })}>
          Adicionar Item à Playlist
        </Button>
        {playlistFields.map((pField, pIndex) => (
          <PlaylistItem key={pField.id} index={pIndex} sectionIndex={index} register={register} removePlaylist={removePlaylist} />
        ))}
      </div>

      <Button type="button" onClick={() => remove(index)} className="bg-red-500 text-white">
        Remover Seção
      </Button>
    </div>
  );
}

function PlaylistItem({ index, sectionIndex, register, removePlaylist }: { index: number, sectionIndex: number, register: any, removePlaylist: any }) {
  return (
    <div className="border p-2 rounded-md">
      {[ 
        { name: "title", label: "Título" },
        { name: "description", label: "Descrição" },
        { name: "url", label: "URL" }
      ].map(({ name, label }) => (
        <div key={name}>
          <Label htmlFor={`sections.${sectionIndex}.playlist.${index}.${name}`}>{label}</Label>
          <Input {...register(`sections.${sectionIndex}.playlist.${index}.${name}`)} placeholder={`Digite ${label}`} />
        </div>
      ))}
      <Button type="button" onClick={() => removePlaylist(index)} className="bg-red-500 text-white">
        Remover Item da Playlist
      </Button>
    </div>
  );
}
